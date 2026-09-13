# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""Data-layer backends (Reconciled Architecture §2: "Single source of
truth — PostgreSQL / MongoDB").

Same contract as SqliteDatabase / MockDatabase, so VowEngineManager and
the contextvars scar router accept them with zero changes:

    sync:  record_scar_sync / recall_scars_sync / recall_all_scars_sync
           record_success_sync / recall_success_sync
    async: save_scar / get_scars / save_trace / get_trace
    close()

Driver policy — honest by construction:
- PostgresDatabase takes a DBAPI connection, or a DSN string, in which
  case it imports the first available driver (psycopg v3, psycopg2,
  pg8000) and raises a clear ImportError if none is installed.
- MongoDatabase takes any pymongo-style database object (duck-typed:
  db['collection_name']) — real pymongo, mongomock, or a test fake.

Conformance-tested here against scripted fakes; against a live server
the SQL/documents are the same but only a deployment can prove them —
say that, not more than that.
"""
import json
import threading
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .database import mem_write_payload


def _load_pg_driver():
    try:
        import psycopg
        return 'psycopg', psycopg.connect
    except ImportError:
        pass
    try:
        import psycopg2
        return 'psycopg2', psycopg2.connect
    except ImportError:
        pass
    try:
        import pg8000.dbapi
        def _pg8000_connect(dsn):
            """pg8000 takes keyword args, not a URI — parse the DSN so
            `--postgres postgresql://u:p@host:port/db` works with the
            pure-Python driver too. Unix-socket DSNs
            (`...?host=/socket/dir`, pgserver's style) connect via the
            socket file."""
            import glob
            import os as _os
            from urllib.parse import urlparse, parse_qs
            u = urlparse(dsn)
            sock_dir = parse_qs(u.query).get('host', [None])[0]
            if sock_dir:
                socks = sorted(glob.glob(
                    _os.path.join(sock_dir, '.s.PGSQL.*')))
                if not socks:
                    raise ConnectionError(
                        'no PostgreSQL socket in %s — is the server up?'
                        % sock_dir)
                return pg8000.dbapi.connect(
                    user=u.username or 'postgres',
                    password=u.password or None,
                    database=u.path.lstrip('/') or 'postgres',
                    unix_sock=socks[0])
            return pg8000.dbapi.connect(
                user=u.username or 'postgres',
                password=u.password or None,
                host=u.hostname or 'localhost',
                port=u.port or 5432,
                database=u.path.lstrip('/') or 'postgres')
        return 'pg8000', _pg8000_connect
    except ImportError:
        pass
    raise ImportError(
        'PostgresDatabase needs a PostgreSQL driver: install psycopg '
        '(psycopg[binary]), psycopg2, or pg8000 — or pass an already-open '
        'DBAPI connection instead of a DSN')


class PostgresDatabase:
    """PostgreSQL backend (DBAPI 2.0). Thread-safe via a lock."""

    SUCCESS_RETENTION = 10

    def __init__(self, conn_or_dsn, echo: bool = False):
        self.echo = echo
        self._lock = threading.Lock()
        if isinstance(conn_or_dsn, str):
            self.driver, connect = _load_pg_driver()
            self._conn = connect(conn_or_dsn)
        else:
            self.driver = 'dbapi-passthrough'
            self._conn = conn_or_dsn
        self._init_schema()

    def _init_schema(self):
        with self._lock:
            cur = self._conn.cursor()
            cur.execute(
                "CREATE TABLE IF NOT EXISTS scars ("
                " id SERIAL PRIMARY KEY, quest_name TEXT, message TEXT,"
                " context TEXT,"
                " created_at TIMESTAMPTZ DEFAULT now())")
            cur.execute(
                "CREATE TABLE IF NOT EXISTS traces ("
                " run_id TEXT PRIMARY KEY, data TEXT,"
                " created_at TIMESTAMPTZ DEFAULT now())")
            cur.execute(
                "CREATE TABLE IF NOT EXISTS successes ("
                " id SERIAL PRIMARY KEY, quest_name TEXT, strategy TEXT,"
                " seed TEXT, env TEXT,"
                " created_at TIMESTAMPTZ DEFAULT now())")
            # Durability (Arcs 3A-3D, docs/DURABILITY.md): the run registry
            # and the hash-chained event journal — same schema and chain
            # semantics as the SQLite store; the JournalRuntime is
            # store-agnostic and speaks to journal_append/_tx below.
            cur.execute(
                "CREATE TABLE IF NOT EXISTS runs ("
                " run_id TEXT PRIMARY KEY, quest TEXT, source_sha256 TEXT,"
                " engine_sha256 TEXT, status TEXT,"
                " created_at TIMESTAMPTZ DEFAULT now(),"
                " ended_at TIMESTAMPTZ,"
                " head_hash TEXT, event_count INTEGER DEFAULT 0,"
                " wake_at TEXT, source_path TEXT,"
                " claimed_by TEXT, claimed_at TIMESTAMPTZ,"
                " heartbeat_at TIMESTAMPTZ, reconciled_at TIMESTAMPTZ)")
            # OWED 7 parity: the heartbeat columns reach EXISTING tables
            # too (CREATE IF NOT EXISTS never alters)
            for _col in ("heartbeat_at TIMESTAMPTZ",
                         "reconciled_at TIMESTAMPTZ"):
                cur.execute(
                    "ALTER TABLE runs ADD COLUMN IF NOT EXISTS " + _col)
            cur.execute(
                "CREATE TABLE IF NOT EXISTS journal_events ("
                " run_id TEXT, seq INTEGER, kind TEXT, payload TEXT,"
                " ts TIMESTAMPTZ DEFAULT now(),"
                " prev_hash TEXT, event_hash TEXT,"
                " PRIMARY KEY (run_id, seq))")
            self.journal = None  # JournalRuntime, set by the CLI per run
            self._conn.commit()

    def record_scar_sync(self, scar_data: Dict[str, Any]):
        if self.echo:
            print(f"[DB] Saving scar: {scar_data['message']}")
        with self._lock:
            if self.journal is not None:
                self.journal.append_tx(self._conn, 'mem_write',
                                       mem_write_payload('scar', scar_data))
            self._conn.cursor().execute(
                "INSERT INTO scars (quest_name, message, context)"
                " VALUES (%s, %s, %s)",
                (scar_data.get("quest_name"), scar_data.get("message"),
                 json.dumps(scar_data.get("context"), default=str)))
            self._conn.commit()
        return scar_data

    def recall_scars_sync(self, quest_name: str) -> List[Dict[str, Any]]:
        with self._lock:
            cur = self._conn.cursor()
            cur.execute(
                "SELECT quest_name, message, context, created_at FROM scars"
                " WHERE quest_name = %s ORDER BY id", (quest_name,))
            rows = cur.fetchall()
            self._conn.commit()  # OWED 7: a read releases its lock
        return [{"quest_name": q, "message": m,
                 "context": json.loads(c) if c else None,
                 "created_at": str(t)} for q, m, c, t in rows]

    def recall_all_scars_sync(self) -> List[Dict[str, Any]]:
        with self._lock:
            cur = self._conn.cursor()
            cur.execute(
                "SELECT quest_name, message, context, created_at FROM scars"
                " ORDER BY id")
            rows = cur.fetchall()
            self._conn.commit()  # OWED 7: a read releases its lock
        return [{"quest_name": q, "message": m,
                 "context": json.loads(c) if c else None,
                 "created_at": str(t)} for q, m, c, t in rows]

    def record_success_sync(self, entry: Dict[str, Any]):
        with self._lock:
            if self.journal is not None:
                self.journal.append_tx(self._conn, 'mem_write',
                                       mem_write_payload('success', entry))
            self._conn.cursor().execute(
                "INSERT INTO successes (quest_name, strategy, seed, env)"
                " VALUES (%s, %s, %s, %s)",
                (entry.get("quest"), entry.get("strategy"), entry.get("seed"),
                 json.dumps(entry.get("env"), default=str)))
            self._conn.cursor().execute(
                "DELETE FROM successes WHERE quest_name = %s AND strategy = %s"
                " AND id NOT IN (SELECT id FROM successes"
                "  WHERE quest_name = %s AND strategy = %s"
                "  ORDER BY id DESC LIMIT %s)",
                (entry.get("quest"), entry.get("strategy"),
                 entry.get("quest"), entry.get("strategy"),
                 self.SUCCESS_RETENTION))
            self._conn.commit()
        return entry

    def recall_success_sync(self, quest: str, strategy: str) -> List[Dict[str, Any]]:
        with self._lock:
            cur = self._conn.cursor()
            cur.execute(
                "SELECT quest_name, strategy, seed, env, created_at"
                " FROM successes WHERE strategy = %s ORDER BY id",
                (strategy,))
            rows = cur.fetchall()
        entries = [{"quest": q, "strategy": st, "seed": sd,
                    "env": json.loads(e) if e else {},
                    "created_at": str(t)} for q, st, sd, e, t in rows]
        same = [e for e in entries if e["quest"] == quest]
        return same or entries

    async def save_scar(self, scar_data: Dict[str, Any]):
        self.record_scar_sync(scar_data)

    async def get_scars(self, quest_name: str) -> List[Dict[str, Any]]:
        if self.echo:
            print(f"[DB] Recalling scars for {quest_name}")
        return self.recall_scars_sync(quest_name)

    async def save_trace(self, run_id: str, trace_data: Dict[str, Any]):
        if self.echo:
            print(f"[DB] Saving trace for run_id: {run_id}")
        with self._lock:
            self._conn.cursor().execute(
                "INSERT INTO traces (run_id, data) VALUES (%s, %s)"
                " ON CONFLICT (run_id) DO UPDATE SET data = EXCLUDED.data",
                (run_id, json.dumps(trace_data, default=str)))
            self._conn.commit()

    async def get_trace(self, run_id: str) -> Optional[Dict[str, Any]]:
        if self.echo:
            print(f"[DB] Retrieving trace for run_id: {run_id}")
        with self._lock:
            cur = self._conn.cursor()
            cur.execute(
                "SELECT data FROM traces WHERE run_id = %s", (run_id,))
            row = cur.fetchone()
        return json.loads(row[0]) if row else None

    # -- run registry + journal (Arcs 3A-3D, docs/DURABILITY.md) ----------
    def create_run(self, run_id: str, quest: str, source_sha256: str,
                   engine_sha256: str, source_path: str = None):
        with self._lock:
            self._conn.cursor().execute(
                "INSERT INTO runs (run_id, quest, source_sha256,"
                " engine_sha256, status, ended_at, head_hash, event_count,"
                " source_path, heartbeat_at)"
                " VALUES (%s, %s, %s, %s, 'running', NULL, NULL, 0, %s,"
                " now())"
                " ON CONFLICT (run_id) DO UPDATE SET"
                " quest = EXCLUDED.quest, source_sha256 = EXCLUDED.source_sha256,"
                " engine_sha256 = EXCLUDED.engine_sha256, status = 'running',"
                " ended_at = NULL, head_hash = NULL, event_count = 0,"
                " source_path = EXCLUDED.source_path,"
                " heartbeat_at = now()",
                (run_id, quest, source_sha256, engine_sha256, source_path))
            self._conn.commit()

    def heartbeat(self, run_id: str):
        """OWED 7 (the socket-loss hunt brought Owed 4 to PG): proof of
        life, same law as the SQLite store — beats land only on rows
        still claiming 'running'."""
        with self._lock:
            self._conn.cursor().execute(
                "UPDATE runs SET heartbeat_at = now()"
                " WHERE run_id = %s AND status = 'running'", (run_id,))
            self._conn.commit()

    def reconcile_crashed(self, stale_after_seconds: float) \
            -> List[Dict[str, Any]]:
        """OWED 7 parity: a 'running' row whose beat is older than
        stale_after_seconds is declared 'crashed' BY EVIDENCE. Rows
        without a beat (heartbeat_at NULL) carry no evidence — left to
        the operator, same as the SQLite law."""
        with self._lock:
            cur = self._conn.cursor()
            cur.execute(
                "SELECT run_id, quest, heartbeat_at FROM runs"
                " WHERE status = 'running' AND heartbeat_at IS NOT NULL"
                " AND heartbeat_at < now() - make_interval(secs => %s)",
                (float(stale_after_seconds),))
            stale = cur.fetchall()
            for rid, _q, _hb in stale:
                cur.execute(
                    "UPDATE runs SET status = 'crashed',"
                    " reconciled_at = now()"
                    " WHERE run_id = %s AND status = 'running'", (rid,))
            self._conn.commit()
        return [{'run_id': rid, 'quest': q, 'last_heartbeat': str(hb)}
                for rid, q, hb in stale]

    def journal_find_completed_effect(self, run_id: str, capability: str,
                                      action: str, key: str):
        """OWED 7 parity (Owed 1's crash-window consult): find the
        COMPLETED keyed effect — its intent→result pair, matched by
        (capability, action, key) so interleaved keyed effects never
        cross-pair. Same pairing logic as the SQLite store."""
        with self._lock:
            rows = self._conn.cursor().execute(
                "SELECT seq, kind, payload FROM journal_events"
                " WHERE run_id = %s ORDER BY seq", (run_id,)).fetchall()
            self._conn.commit()  # OWED 7: a read releases its lock
        pend: Dict[Any, Dict[str, Any]] = {}
        for seq, kind, payload in rows:
            p = json.loads(payload) if isinstance(payload, str) else payload
            if not isinstance(p, dict):
                continue
            if kind == 'effect_intent' and p.get('idempotency_key') == key:
                pend[(p.get('capability'), p.get('action'), key)] = {
                    'args': p.get('args')}
            elif kind in ('effect_result', 'effect_replay'):
                k = (p.get('capability'), p.get('action'), key)
                if k in pend:
                    return {'run_id': run_id,
                            'result': p.get('result'),
                            'args': pend[k].get('args')}
        return None

    def finish_run(self, run_id: str, status: str, head_hash: str,
                   event_count: int):
        with self._lock:
            self._conn.cursor().execute(
                "UPDATE runs SET status = %s, ended_at = now(),"
                " wake_at = NULL, head_hash = %s, event_count = %s,"
                " claimed_by = NULL, claimed_at = NULL"
                " WHERE run_id = %s",
                (status, head_hash, event_count, run_id))
            self._conn.commit()

    def suspend_run(self, run_id: str, status: str, wake_at,
                    head_hash: str, event_count: int):
        """Park a run (Arc 3B); parking releases the resume claim (Arc
        3D); the 'running' transition (approve→resume handoff) keeps it."""
        release = ", claimed_by = NULL, claimed_at = NULL" \
            if status != 'running' else ""
        sql = ("UPDATE runs SET status = %s, wake_at = %s, head_hash = %s,"
               " event_count = %s" + release + " WHERE run_id = %s")
        with self._lock:
            self._conn.cursor().execute(
                sql, (status, wake_at, head_hash, event_count, run_id))
            self._conn.commit()

    def due_runs(self, now_iso: str) -> List[Dict[str, Any]]:
        """The scheduler's worklist: suspended runs whose wake time has
        come, plus every approval-waiting run."""
        with self._lock:
            cur = self._conn.cursor()
            cur.execute(
                "SELECT run_id, quest, status, wake_at, created_at"
                " FROM runs WHERE (status = 'suspended' AND wake_at <= %s)"
                " OR status = 'awaiting_approval' ORDER BY run_id",
                (now_iso,))
            rows = cur.fetchall()
            self._conn.commit()  # OWED 7: a read releases its lock
        return [{"run_id": a, "quest": q, "status": s, "wake_at": w,
                 "created_at": str(c)} for a, q, s, w, c in rows]

    def get_run(self, run_id: str):
        with self._lock:
            cur = self._conn.cursor()
            cur.execute(
                "SELECT run_id, quest, source_sha256, engine_sha256, status,"
                " created_at, ended_at, head_hash, event_count, wake_at,"
                " source_path"
                " FROM runs WHERE run_id = %s", (run_id,))
            r = cur.fetchone()
            self._conn.commit()  # OWED 7: a read releases its lock
        if not r:
            return None
        keys = ("run_id", "quest", "source_sha256", "engine_sha256",
                "status", "created_at", "ended_at", "head_hash",
                "event_count", "wake_at", "source_path")
        return dict(zip(keys, r))

    def list_runs(self) -> List[Dict[str, Any]]:
        with self._lock:
            cur = self._conn.cursor()
            cur.execute(
                "SELECT run_id, quest, status, created_at, ended_at,"
                " event_count, wake_at, source_path"
                " FROM runs ORDER BY run_id")
            rows = cur.fetchall()
            self._conn.commit()  # OWED 7: a read releases its lock
        return [{"run_id": a, "quest": q, "status": s, "created_at": str(c),
                 "ended_at": str(e) if e else None, "event_count": n,
                 "wake_at": w, "source_path": sp}
                for a, q, s, c, e, n, w, sp in rows]

    def load_journal(self, run_id: str) -> List[Dict[str, Any]]:
        with self._lock:
            cur = self._conn.cursor()
            cur.execute(
                "SELECT seq, kind, payload, ts, prev_hash, event_hash"
                " FROM journal_events WHERE run_id = %s ORDER BY seq",
                (run_id,))
            rows = cur.fetchall()
            self._conn.commit()  # OWED 7: a read releases its lock
        return [{"seq": s, "kind": k, "payload": json.loads(p),
                 "ts": str(t), "prev_hash": ph, "event_hash": eh}
                for s, k, p, t, ph, eh in rows]

    # -- journal store primitives (Arc 3D) ---------------------------------
    _JOURNAL_INSERT = ("INSERT INTO journal_events (run_id, seq, kind,"
                       " payload, prev_hash, event_hash)"
                       " VALUES (%s, %s, %s, %s, %s, %s)")

    def journal_append(self, event: Dict[str, Any]):
        """Own-transaction journal write."""
        with self._lock:
            self._conn.cursor().execute(self._JOURNAL_INSERT, (
                event['run_id'], event['seq'], event['kind'],
                event['payload'], event['prev_hash'], event['event_hash']))
            self._conn.commit()

    def journal_append_tx(self, conn, event: Dict[str, Any]):
        """In the caller's transaction (mem_write row⟺event atomicity)."""
        conn.cursor().execute(self._JOURNAL_INSERT, (
            event['run_id'], event['seq'], event['kind'],
            event['payload'], event['prev_hash'], event['event_hash']))

    def journal_append_many(self, events: List[Dict[str, Any]]):
        """Several events, one commit (the intent+blocked atomic pair)."""
        with self._lock:
            for event in events:
                self._conn.cursor().execute(self._JOURNAL_INSERT, (
                    event['run_id'], event['seq'], event['kind'],
                    event['payload'], event['prev_hash'],
                    event['event_hash']))
            self._conn.commit()

    # -- multi-run hardening (Arc 3D): the atomic claim ---------------------
    def claim_run(self, run_id: str, token: str,
                  from_statuses=('running', 'suspended', 'crashed'),
                  stale_minutes: int = 60) -> bool:
        """Atomically claim a run for resume/decision — one winner, even
        across processes. Same semantics as the SQLite store: a claim
        held by `token` re-claims cleanly; claims older than
        stale_minutes may be reclaimed. ('crashed' joined the claimable
        statuses with Owed 4; the PG parity cure is Owed 7.)"""
        marks = ','.join(['%s'] * len(from_statuses))
        sql = ("UPDATE runs SET claimed_by = %s, claimed_at = now()"
               " WHERE run_id = %s AND status IN (" + marks + ")"
               " AND (claimed_by IS NULL OR claimed_by = %s"
               "      OR claimed_at <= now() - make_interval(mins => %s))")
        with self._lock:
            cur = self._conn.cursor()
            cur.execute(sql, (token, run_id, *from_statuses, token,
                              int(stale_minutes)))
            self._conn.commit()
            return cur.rowcount == 1

    def close(self):
        self._conn.close()


class MongoDatabase:
    """MongoDB backend (any pymongo-style database object)."""

    SUCCESS_RETENTION = 10

    def __init__(self, db, echo: bool = False):
        # db: pymongo.database.Database or duck-typed equivalent
        # (db['name'] -> collection with insert_one/find/find_one/
        # replace_one/delete_many)
        self.db = db
        self.echo = echo
        self._lock = threading.Lock()

    @staticmethod
    def _now():
        return datetime.now(timezone.utc).replace(tzinfo=None).isoformat()

    @staticmethod
    def _doc_to_scar(d) -> Dict[str, Any]:
        return {"quest_name": d.get("quest_name"),
                "message": d.get("message"),
                "context": d.get("context"),
                "created_at": d.get("created_at")}

    def record_scar_sync(self, scar_data: Dict[str, Any]):
        if self.echo:
            print(f"[DB] Saving scar: {scar_data['message']}")
        with self._lock:
            self.db["scars"].insert_one({
                "quest_name": scar_data.get("quest_name"),
                "message": scar_data.get("message"),
                # native document (no JSON string) — mongo can index it
                "context": scar_data.get("context"),
                "created_at": self._now()})
        return scar_data

    def recall_scars_sync(self, quest_name: str) -> List[Dict[str, Any]]:
        with self._lock:
            docs = self.db["scars"].find(
                {"quest_name": quest_name}).sort("_id", 1)
            return [self._doc_to_scar(d) for d in docs]

    def recall_all_scars_sync(self) -> List[Dict[str, Any]]:
        with self._lock:
            return [self._doc_to_scar(d)
                    for d in self.db["scars"].find().sort("_id", 1)]

    def record_success_sync(self, entry: Dict[str, Any]):
        with self._lock:
            self.db["successes"].insert_one({
                "quest": entry.get("quest"), "strategy": entry.get("strategy"),
                "seed": entry.get("seed"), "env": entry.get("env"),
                "created_at": self._now()})
            ids = [d["_id"] for d in self.db["successes"].find(
                {"quest": entry.get("quest"),
                 "strategy": entry.get("strategy")}).sort("_id", -1)]
            stale = ids[self.SUCCESS_RETENTION:]
            if stale:
                self.db["successes"].delete_many({"_id": {"$in": stale}})
        return entry

    def recall_success_sync(self, quest: str, strategy: str) -> List[Dict[str, Any]]:
        with self._lock:
            entries = [{"quest": d.get("quest"), "strategy": d.get("strategy"),
                        "seed": d.get("seed"), "env": d.get("env") or {},
                        "created_at": d.get("created_at")}
                       for d in self.db["successes"].find(
                           {"strategy": strategy}).sort("_id", 1)]
        same = [e for e in entries if e["quest"] == quest]
        return same or entries

    async def save_scar(self, scar_data: Dict[str, Any]):
        self.record_scar_sync(scar_data)

    async def get_scars(self, quest_name: str) -> List[Dict[str, Any]]:
        if self.echo:
            print(f"[DB] Recalling scars for {quest_name}")
        return self.recall_scars_sync(quest_name)

    async def save_trace(self, run_id: str, trace_data: Dict[str, Any]):
        if self.echo:
            print(f"[DB] Saving trace for run_id: {run_id}")
        with self._lock:
            self.db["traces"].replace_one(
                {"run_id": run_id},
                {"run_id": run_id, "data": json.dumps(trace_data, default=str),
                 "created_at": self._now()},
                upsert=True)

    async def get_trace(self, run_id: str) -> Optional[Dict[str, Any]]:
        if self.echo:
            print(f"[DB] Retrieving trace for run_id: {run_id}")
        with self._lock:
            doc = self.db["traces"].find_one({"run_id": run_id})
        return json.loads(doc["data"]) if doc else None

    def close(self):
        client = getattr(self.db, "client", None)
        if client is not None and hasattr(client, "close"):
            client.close()
