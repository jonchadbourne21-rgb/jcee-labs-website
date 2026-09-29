# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""Durable persistence for VOW: SQLite-backed database adapter.

Implements the same async interface as main.py's MockDatabase
(save_scar/get_scars/save_trace/get_trace) so VowEngineManager accepts it
with zero changes, plus `record_scar_sync` — the hook the module-level
contextvars scar router uses for synchronous mid-quest writes (the
handoff landmine fix: a quest recalling its own scars sees them
immediately).

Zero dependencies (sqlite3 is stdlib). Scars and traces survive process
restarts — the learning loop's memory becomes durable.

    db = SqliteDatabase("vow_memory.db")
    mgr = VowEngineManager(db)          # drop-in replacement
"""
import hashlib
import hmac
import json
import os
import sqlite3
import threading
from datetime import datetime, timedelta, timezone


def _utcnow() -> str:
    """CLOCK UNIFICATION (defect found 2026-07-24, digest date-split):
    every engine-stamped timestamp is UTC, naive — matching the SQLite
    `datetime('now')` defaults and the consumers (scar-age math, the
    daily digest) that already assumed UTC. Local-time stamping split
    date buckets whenever local and UTC calendars disagreed."""
    return datetime.now(timezone.utc).replace(tzinfo=None).isoformat(
        sep=' ', timespec='seconds')
from typing import Any, Dict, List, Optional


def mem_write_payload(store: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Canonical `mem_write` journal payload (docs/DURABILITY.md §3), built
    in exactly one place so the routing layer's replay comparison and this
    layer's live append can never drift apart."""
    if store == 'scar':
        return {'store': 'scar', 'quest': data.get('quest_name'),
                'message': data.get('message'),
                'context': data.get('context')}
    return {'store': 'success', 'quest': data.get('quest'),
            'strategy': data.get('strategy'), 'seed': data.get('seed'),
            'won': bool(data.get('won'))}


class SqliteDatabase:
    """SQLite-backed scar/trace store. Thread-safe via a lock; a single
    connection is shared (sqlite3 with check_same_thread=False)."""

    def __init__(self, path: str = "vow_memory.db", echo: bool = False):
        self.path = path
        self.echo = echo  # print MockDatabase-style "[DB] ..." lines
        self._lock = threading.Lock()
        self._conn = sqlite3.connect(path, check_same_thread=False)
        # Rollback journal in memory: some deployment filesystems (virtual/
        # portal mounts) can't create the -journal/-wal sidecar files and
        # throw 'disk I/O error'. Data still commits to the db file; only
        # crash-rollback guarantees change.
        self._conn.execute("PRAGMA journal_mode=MEMORY")
        self._conn.execute(
            "CREATE TABLE IF NOT EXISTS scars ("
            "  id INTEGER PRIMARY KEY AUTOINCREMENT,"
            "  quest_name TEXT, message TEXT, context TEXT,"
            "  created_at TEXT DEFAULT (datetime('now')))")
        self._conn.execute(
            "CREATE TABLE IF NOT EXISTS traces ("
            "  run_id TEXT PRIMARY KEY, data TEXT,"
            "  created_at TEXT DEFAULT (datetime('now')))")
        self._conn.execute(
            "CREATE TABLE IF NOT EXISTS successes ("
            "  id INTEGER PRIMARY KEY AUTOINCREMENT,"
            "  quest_name TEXT, strategy TEXT, seed TEXT, env TEXT,"
            "  created_at TEXT DEFAULT (datetime('now')))")
        try:  # golden-path duration stats: add to pre-existing databases
            self._conn.execute("ALTER TABLE successes ADD COLUMN duration REAL")
        except sqlite3.OperationalError:
            pass  # column already present
        try:  # golden-path streaks: winner flag on pre-existing databases
            self._conn.execute("ALTER TABLE successes ADD COLUMN won INTEGER")
        except sqlite3.OperationalError:
            pass  # column already present
        # Durability (Arc 3A, docs/DURABILITY.md): the run registry and the
        # hash-chained event journal. The journal itself is managed by a
        # JournalRuntime (vow_transpiler); this layer keeps the tables and
        # appends mem_write events in the SAME transaction as the memory row
        # they describe — a row exists iff its event exists.
        self._conn.execute(
            "CREATE TABLE IF NOT EXISTS runs ("
            "  run_id TEXT PRIMARY KEY, quest TEXT, source_sha256 TEXT,"
            "  engine_sha256 TEXT, status TEXT,"
            "  created_at TEXT DEFAULT (datetime('now')), ended_at TEXT,"
            "  head_hash TEXT, event_count INTEGER DEFAULT 0)")
        self._conn.execute(
            "CREATE TABLE IF NOT EXISTS journal_events ("
            "  run_id TEXT, seq INTEGER, kind TEXT, payload TEXT,"
            "  ts TEXT DEFAULT (datetime('now')),"
            "  prev_hash TEXT, event_hash TEXT,"
            "  PRIMARY KEY (run_id, seq))")
        try:  # suspension (Arc 3B): wake time for parked runs
            self._conn.execute("ALTER TABLE runs ADD COLUMN wake_at TEXT")
        except sqlite3.OperationalError:
            pass  # column already present
        try:  # sweeper (Arc 3C): the quest file a run came from, so
              # `vow sweep` can resume without being told the path
            self._conn.execute("ALTER TABLE runs ADD COLUMN source_path TEXT")
        except sqlite3.OperationalError:
            pass  # column already present
        for _col in ("claimed_by TEXT", "claimed_at TEXT"):
            try:  # multi-run hardening (Arc 3D): the atomic resume claim
                self._conn.execute(
                    "ALTER TABLE runs ADD COLUMN %s" % _col)
            except sqlite3.OperationalError:
                pass  # column already present
        for _col in ("heartbeat_at TEXT", "reconciled_at TEXT"):
            try:  # OWED 4: the heartbeat — evidence a 'running' row is
                  # alive, so a stopped beat means crashed, not "running
                  # forever". reconciled_at records when the store
                  # declared the crash.
                self._conn.execute(
                    "ALTER TABLE runs ADD COLUMN %s" % _col)
            except sqlite3.OperationalError:
                pass  # column already present
        for _col in ("prev_hash TEXT", "scar_hash TEXT"):
            try:  # WRITE-ONCE LAW: the scar fingerprint chain
                self._conn.execute(
                    "ALTER TABLE scars ADD COLUMN %s" % _col)
            except sqlite3.OperationalError:
                pass  # column already present
        # SIGNATURE ARC (author decree 2026-07-23): "everything needs a
        # timestamp fingerprint" — and a SIGNATURE, because the language
        # sells as provable and auditable. HMAC-SHA256 over each row's
        # fingerprint: integrity proved by the chain, AUTHORSHIP proved
        # by the key. A forged row is not just chain-broken, it is
        # unmintable without the secret.
        for _sql in (
                "ALTER TABLE scars ADD COLUMN signature TEXT",
                "ALTER TABLE journal_events ADD COLUMN signature TEXT",
                "ALTER TABLE successes ADD COLUMN row_hash TEXT",
                "ALTER TABLE successes ADD COLUMN signature TEXT",
                "ALTER TABLE traces ADD COLUMN row_hash TEXT",
                "ALTER TABLE traces ADD COLUMN signature TEXT",
                "ALTER TABLE runs ADD COLUMN identity_hash TEXT",
                "ALTER TABLE runs ADD COLUMN signature TEXT"):
            try:
                self._conn.execute(_sql)
            except sqlite3.OperationalError:
                pass  # column already present
        self._signing_key = self._load_signing_key(path)
        # WRITE-ONCE LAW (author decree 2026-07-23): scars and journal
        # events are append-only. Anyone may record; NO ONE may touch a
        # timestamp or a fingerprint. The wall lives in the store itself:
        # raw SQL UPDATE/DELETE is refused, by trigger, forever.
        # (The `successes` table is intentionally NOT walled — it is a
        # retention-bounded snapshot cache, not the ledger; wins are
        # history via the journaled mem_write events.)
        for _table in ('scars', 'journal_events'):
            for _verb in ('UPDATE', 'DELETE'):
                self._conn.execute(
                    f"CREATE TRIGGER IF NOT EXISTS "
                    f"write_once_{_table}_{_verb.lower()} "
                    f"BEFORE {_verb} ON {_table} BEGIN "
                    f"SELECT RAISE(ABORT, 'WRITE-ONCE LAW: {_table} is "
                    f"append-only — no one touches a recorded entry'); "
                    f"END")
        self.journal = None  # JournalRuntime, set by the CLI when a run opens
        self._conn.commit()

    # -- the signature arc ---------------------------------------------------
    @staticmethod
    def _load_signing_key(db_path: str) -> bytes:
        """The engine's secret. Resolution order:
        1. VOW_SIGNING_KEY env var (hex, >=32 bytes) — production posture,
           delivered by secrets management; the DB can be published
           without the key and signatures remain unforgeable.
        2. A per-store key file '<db>.signkey' — developer default,
           generated on first use. If the whole directory leaks, the key
           leaks with it: fine for development, NOT for audit handoffs.
        There is no silent-unsigned mode: without any key the engine
        raises, because a language sold as provable does not mint
        unsigned evidence.
        """
        env_key = os.environ.get('VOW_SIGNING_KEY')
        if env_key:
            raw = bytes.fromhex(env_key)
            if len(raw) < 32:
                raise ValueError(
                    "VOW_SIGNING_KEY must be >= 32 bytes of hex")
            return raw
        if db_path == ':memory:':
            return os.urandom(32)  # ephemeral store, ephemeral key
        key_path = db_path + '.signkey'
        if os.path.exists(key_path):
            with open(key_path) as fh:
                return bytes.fromhex(fh.read().strip())
        raw = os.urandom(32)
        try:
            fd = os.open(key_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL,
                         0o600)
            with os.fdopen(fd, 'w') as fh:
                fh.write(raw.hex())
        except FileExistsError:
            with open(key_path) as fh:
                return bytes.fromhex(fh.read().strip())
        return raw

    def _sign(self, fingerprint: str) -> str:
        """HMAC-SHA256 over a row's fingerprint. The chain proves nothing
        was touched; this proves WHO wrote it."""
        return hmac.new(self._signing_key, fingerprint.encode('utf-8'),
                        hashlib.sha256).hexdigest()

    # -- run registry (durability) ------------------------------------------
    def create_run(self, run_id: str, quest: str, source_sha256: str,
                   engine_sha256: str, source_path: str = None):
        with self._lock:
            # SIGNATURE ARC: a run's identity is fingerprinted at birth —
            # run, quest, source, engine, timestamp. (The mutable registry
            # fields — status, ended_at, head — are deliberately NOT in
            # the hash; identity is what was born, not how it ended.)
            _ts = _utcnow()
            _identity = hashlib.sha256(
                f"{run_id}|{quest}|{source_sha256}|{engine_sha256}|"
                f"{_ts}".encode('utf-8')).hexdigest()
            self._conn.execute(
                "INSERT OR REPLACE INTO runs (run_id, quest, source_sha256,"
                " engine_sha256, status, ended_at, head_hash, event_count,"
                " source_path, created_at, identity_hash, signature,"
                " heartbeat_at)"
                " VALUES (?, ?, ?, ?, 'running', NULL, NULL, 0, ?, ?, ?, ?, ?)",
                (run_id, quest, source_sha256, engine_sha256, source_path,
                 _ts, _identity, self._sign(_identity), _ts))
            self._conn.commit()

    def heartbeat(self, run_id: str):
        """OWED 4: proof of life. The executing process beats every
        VOW_HEARTBEAT_SECONDS while its quest runs; a crash stops the
        beat, and the stale timestamp becomes EVIDENCE — the difference
        between 'running' and 'died mid-quest' stops being the operator's
        guess. Beats only land on rows still claiming 'running' (a
        finished row's terminal state is never overwritten)."""
        with self._lock:
            self._conn.execute(
                "UPDATE runs SET heartbeat_at = ?"
                " WHERE run_id = ? AND status = 'running'",
                (_utcnow(), run_id))
            self._conn.commit()

    def reconcile_crashed(self, stale_after_seconds: float) \
            -> List[Dict[str, Any]]:
        """OWED 4: the registry stops lying. A row claiming 'running'
        whose heartbeat is older than stale_after_seconds is declared
        'crashed' — by EVIDENCE (the stopped beat), never by assumption.
        Rows with no heartbeat (pre-heartbeat stores) are left alone:
        no evidence, no verdict — they remain the operator's explicit
        call (`vow sweep --crashed`). Returns the reconciled rows."""
        cutoff = (datetime.now(timezone.utc).replace(tzinfo=None)
                  - timedelta(seconds=stale_after_seconds)).isoformat(
                      sep=' ', timespec='seconds')
        with self._lock:
            stale = self._conn.execute(
                "SELECT run_id, quest, heartbeat_at FROM runs"
                " WHERE status = 'running' AND heartbeat_at IS NOT NULL"
                " AND heartbeat_at < ?", (cutoff,)).fetchall()
            now = _utcnow()
            for rid, _q, _hb in stale:
                self._conn.execute(
                    "UPDATE runs SET status = 'crashed', reconciled_at = ?"
                    " WHERE run_id = ? AND status = 'running'",
                    (now, rid))
            self._conn.commit()
        return [{'run_id': rid, 'quest': q, 'last_heartbeat': hb,
                 'reconciled_at': now} for rid, q, hb in stale]

    def finish_run(self, run_id: str, status: str, head_hash: str,
                   event_count: int):
        with self._lock:
            self._conn.execute(
                "UPDATE runs SET status = ?, ended_at = datetime('now'),"
                " wake_at = NULL, head_hash = ?, event_count = ?,"
                " claimed_by = NULL, claimed_at = NULL"
                " WHERE run_id = ?",
                (status, head_hash, event_count, run_id))
            self._conn.commit()

    def suspend_run(self, run_id: str, status: str, wake_at,
                    head_hash: str, event_count: int):
        """Park a run (Arc 3B): status 'suspended' (with wake_at) or
        'awaiting_approval' (wake_at NULL). Not ended — resumable.
        Parking releases the resume claim (Arc 3D) so a later resume can
        claim it; the 'running' transition (`vow approve` handing back to
        the resume path) keeps the claim for the delegated re-claim."""
        release = ", claimed_by = NULL, claimed_at = NULL" \
            if status != 'running' else ""
        with self._lock:
            self._conn.execute(
                "UPDATE runs SET status = ?, wake_at = ?, head_hash = ?,"
                " event_count = ?%s WHERE run_id = ?" % release,
                (status, wake_at, head_hash, event_count, run_id))
            self._conn.commit()

    # -- journal store primitives (Arc 3D: the runtime is store-agnostic) --
    _JOURNAL_INSERT = ("INSERT INTO journal_events (run_id, seq, kind,"
                       " payload, prev_hash, event_hash, signature)"
                       " VALUES (?, ?, ?, ?, ?, ?, ?)")

    def _journal_row(self, event: Dict[str, Any]):
        return (event['run_id'], event['seq'], event['kind'],
                event['payload'], event['prev_hash'], event['event_hash'],
                self._sign(event['event_hash']))

    def journal_append(self, event: Dict[str, Any]):
        """Own-transaction journal write."""
        with self._lock:
            self._conn.execute(self._JOURNAL_INSERT,
                               self._journal_row(event))
            self._conn.commit()

    def journal_append_tx(self, conn, event: Dict[str, Any]):
        """In the caller's transaction (mem_write row⟺event atomicity)."""
        conn.execute(self._JOURNAL_INSERT, self._journal_row(event))

    def journal_append_many(self, events: List[Dict[str, Any]]):
        """Several events, one commit (the intent+blocked atomic pair)."""
        with self._lock:
            for event in events:
                self._conn.execute(self._JOURNAL_INSERT,
                                   self._journal_row(event))
            self._conn.commit()

    def journal_find_completed_effect(self, capability: str, action: str,
                                      key: str) -> Optional[Dict[str, Any]]:
        """Owed 1 (idempotency keys): find a keyed effect that COMPLETED
        anywhere in this store (any run), outcome 'ok'. This is the
        effectively-once oracle — a hit means the world already saw this
        effect and it must never fire again. Errors do NOT complete a key:
        a failed effect may be retried.

        OG retainer round 1 (O1-1): the result payload alone is not
        enough — the paired INTENT's args must come back too, because a
        key names ONE effect, and the caller must be able to check that
        the key's effect and the requested effect are the same one.
        Pairs are matched intent->following-result within each run."""
        with self._lock:
            rows = self._conn.execute(
                "SELECT run_id, seq, kind, payload FROM journal_events"
                " WHERE kind IN ('effect_intent', 'effect_result')"
                " ORDER BY run_id, seq").fetchall()
        # pending keyed intents, matched exactly (interleaved keyed
        # effects in one run must not cross-pair)
        pending = {}  # (run_id, capability, action, key) -> intent payload
        for run_id, seq, kind, raw in rows:
            try:
                p = json.loads(raw)
            except (ValueError, TypeError):
                continue
            if (p.get('capability') != capability
                    or p.get('action') != action
                    or p.get('key') is None or p.get('key') != key):
                continue
            ident = (run_id, capability, action, key)
            if kind == 'effect_intent':
                pending[ident] = p
                continue
            # effect_result
            intent = pending.pop(ident, None)
            if intent is not None and p.get('outcome') == 'ok':
                return {'run_id': run_id, 'payload': p,
                        'args': intent.get('args', [])}
        return None

    # -- multi-run hardening (Arc 3D): the atomic claim ---------------------
    def claim_run(self, run_id: str, token: str,
                  from_statuses=('running', 'suspended', 'crashed'),
                  stale_minutes: int = 60) -> bool:
        """Atomically claim a run for resume/decision — one winner.
        A claim held by `token` re-claims cleanly (the approve→resume
        handoff); a claim older than stale_minutes may be reclaimed (a
        crashed resumer must not wedge the run). Everyone else loses."""
        marks = ','.join('?' for _ in from_statuses)
        with self._lock:
            cur = self._conn.execute(
                "UPDATE runs SET claimed_by = ?,"
                " claimed_at = datetime('now')"
                " WHERE run_id = ? AND status IN (%s)"
                " AND (claimed_by IS NULL OR claimed_by = ?"
                "      OR claimed_at <= datetime('now', ?))" % marks,
                (token, run_id, *from_statuses, token,
                 '-%d minutes' % int(stale_minutes)))
            self._conn.commit()
            return cur.rowcount == 1

    def due_runs(self, now_iso: str) -> List[Dict[str, Any]]:
        """The scheduler's worklist: suspended runs whose wake time has
        come, plus every approval-waiting run."""
        with self._lock:
            rows = self._conn.execute(
                "SELECT run_id, quest, status, wake_at, created_at"
                " FROM runs WHERE (status = 'suspended' AND wake_at <= ?)"
                " OR status = 'awaiting_approval' ORDER BY rowid",
                (now_iso,)).fetchall()
        return [{"run_id": a, "quest": q, "status": s, "wake_at": w,
                 "created_at": c} for a, q, s, w, c in rows]

    def get_run(self, run_id: str):
        with self._lock:
            r = self._conn.execute(
                "SELECT run_id, quest, source_sha256, engine_sha256, status,"
                " created_at, ended_at, head_hash, event_count, wake_at,"
                " source_path, heartbeat_at, reconciled_at"
                " FROM runs WHERE run_id = ?", (run_id,)).fetchone()
        if not r:
            return None
        keys = ("run_id", "quest", "source_sha256", "engine_sha256",
                "status", "created_at", "ended_at", "head_hash",
                "event_count", "wake_at", "source_path", "heartbeat_at",
                "reconciled_at")
        return dict(zip(keys, r))

    def list_runs(self) -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT run_id, quest, status, created_at, ended_at,"
                " event_count, wake_at, source_path"
                " FROM runs ORDER BY rowid").fetchall()
        return [{"run_id": a, "quest": q, "status": s, "created_at": c,
                 "ended_at": e, "event_count": n, "wake_at": w,
                 "source_path": sp}
                for a, q, s, c, e, n, w, sp in rows]

    def load_journal(self, run_id: str) -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT seq, kind, payload, ts, prev_hash, event_hash"
                " FROM journal_events WHERE run_id = ? ORDER BY seq",
                (run_id,)).fetchall()
        return [{"seq": s, "kind": k, "payload": json.loads(p),
                 "ts": t, "prev_hash": ph, "event_hash": eh}
                for s, k, p, t, ph, eh in rows]

    def dump_evidence(self, run_id: str = None) -> Dict[str, Any]:
        """HYBRID SIGNATURE ARC: every evidence row, WITH fingerprints and
        signatures, for export. Read-only. Scoped to one run when run_id
        is given (quest-level memory — scars, successes — follows the
        run's quest); the whole store otherwise. The export layer signs
        the bundle with ed25519; these rows keep their HMAC seals so a
        key holder can cross-check authorship row by row."""
        out: Dict[str, Any] = {}
        with self._lock:
            if run_id:
                runs = self._conn.execute(
                    "SELECT run_id, quest, source_sha256, engine_sha256,"
                    " status, created_at, ended_at, head_hash, event_count,"
                    " identity_hash, signature FROM runs"
                    " WHERE run_id = ?", (run_id,)).fetchall()
            else:
                runs = self._conn.execute(
                    "SELECT run_id, quest, source_sha256, engine_sha256,"
                    " status, created_at, ended_at, head_hash, event_count,"
                    " identity_hash, signature FROM runs"
                    " ORDER BY rowid").fetchall()
            out['runs'] = [
                dict(zip(("run_id", "quest", "source_sha256",
                          "engine_sha256", "status", "created_at",
                          "ended_at", "head_hash", "event_count",
                          "identity_hash", "signature"), r)) for r in runs]
            quests = {r['quest'] for r in out['runs'] if r['quest']}
            if run_id:
                ev = self._conn.execute(
                    "SELECT run_id, seq, kind, payload, ts, prev_hash,"
                    " event_hash, signature FROM journal_events"
                    " WHERE run_id = ? ORDER BY seq", (run_id,)).fetchall()
            else:
                ev = self._conn.execute(
                    "SELECT run_id, seq, kind, payload, ts, prev_hash,"
                    " event_hash, signature FROM journal_events"
                    " ORDER BY run_id, seq").fetchall()
            out['journal_events'] = [
                dict(zip(("run_id", "seq", "kind", "payload", "ts",
                          "prev_hash", "event_hash", "signature"), r))
                for r in ev]
            scar_sql = ("SELECT id, quest_name, message, context,"
                        " created_at, prev_hash, scar_hash, signature"
                        " FROM scars")
            succ_sql = ("SELECT id, quest_name, strategy, seed, env,"
                        " duration, won, created_at, row_hash, signature"
                        " FROM successes")
            if run_id and quests:
                marks = ','.join('?' * len(quests))
                scars = self._conn.execute(
                    scar_sql + " WHERE quest_name IN (%s) ORDER BY id"
                    % marks, tuple(quests)).fetchall()
                succs = self._conn.execute(
                    succ_sql + " WHERE quest_name IN (%s) ORDER BY id"
                    % marks, tuple(quests)).fetchall()
            else:
                scars = self._conn.execute(
                    scar_sql + " ORDER BY id").fetchall()
                succs = self._conn.execute(
                    succ_sql + " ORDER BY id").fetchall()
            out['scars'] = [
                dict(zip(("id", "quest_name", "message", "context",
                          "created_at", "prev_hash", "scar_hash",
                          "signature"), r)) for r in scars]
            out['successes'] = [
                dict(zip(("id", "quest_name", "strategy", "seed", "env",
                          "duration", "won", "created_at", "row_hash",
                          "signature"), r)) for r in succs]
            if run_id:
                tr = self._conn.execute(
                    "SELECT run_id, data, created_at, row_hash, signature"
                    " FROM traces WHERE run_id = ?", (run_id,)).fetchall()
            else:
                tr = self._conn.execute(
                    "SELECT run_id, data, created_at, row_hash, signature"
                    " FROM traces ORDER BY run_id").fetchall()
            out['traces'] = [
                dict(zip(("run_id", "data", "created_at", "row_hash",
                          "signature"), r)) for r in tr]
        return out

    # -- sync hook used by the contextvars scar router (record path) --
    @staticmethod
    def _scar_fingerprint(quest_name, message, ctx, created_at, prev_hash):
        """WRITE-ONCE LAW: a scar's fingerprint binds its content, its
        timestamp, and the scar before it — the journal chain's pattern,
        applied to memory."""
        h = hashlib.sha256()
        h.update(f"{quest_name}|{message}|{ctx}|{created_at}|"
                 f"{prev_hash or ''}".encode('utf-8'))
        return h.hexdigest()

    def verify_scar_chain(self) -> Dict[str, Any]:
        """Walk the scar chain: every fingerprinted scar must hash to its
        stored scar_hash, link to its predecessor, AND carry a valid
        signature (chain = integrity, signature = authorship). 'ok' flips
        False the moment anyone touches a timestamp, a fingerprint, or
        mints a row without the key."""
        with self._lock:
            rows = self._conn.execute(
                "SELECT id, quest_name, message, context, created_at,"
                " prev_hash, scar_hash, signature FROM scars"
                " ORDER BY id").fetchall()
        chained = [r for r in rows if r[6]]
        prev = None
        for _id, qn, msg, ctx, ts, prev_hash, scar_hash, sig in chained:
            expect = self._scar_fingerprint(qn, msg, ctx, ts, prev_hash)
            if expect != scar_hash or prev_hash != prev:
                return {'ok': False, 'broken_at': _id,
                        'reason': 'chain', 'checked': len(chained)}
            if sig is not None and sig != self._sign(scar_hash):
                return {'ok': False, 'broken_at': _id,
                        'reason': 'signature', 'checked': len(chained)}
            prev = scar_hash
        return {'ok': True, 'checked': len(chained),
                'legacy_unchained': len(rows) - len(chained),
                'unsigned': sum(1 for r in chained if r[7] is None)}

    def verify_store(self) -> Dict[str, Any]:
        """The whole evidence locker, one verdict: journal events (chain
        per run is verified by the CLI layer; here signatures), scars
        (chain + signatures), successes/traces (row signatures), runs
        (identity signatures). Legacy unsigned rows are REPORTED, not
        failed — they predate the signature arc honestly."""
        report = {'ok': True, 'tables': {}}
        with self._lock:
            ev_rows = self._conn.execute(
                "SELECT run_id, seq, event_hash, signature"
                " FROM journal_events ORDER BY run_id, seq").fetchall()
            succ = self._conn.execute(
                "SELECT id, row_hash, signature FROM successes").fetchall()
            tr = self._conn.execute(
                "SELECT run_id, row_hash, signature FROM traces").fetchall()
            runs = self._conn.execute(
                "SELECT run_id, identity_hash, signature FROM runs"
                ).fetchall()

        def _check(rows, label, key_of):
            bad, unsigned = [], 0
            for row in rows:
                fp, sig = row[key_of], row[key_of + 1]
                if fp is None:
                    continue
                if sig is None:
                    unsigned += 1
                elif sig != self._sign(fp):
                    bad.append(row[0])
            if bad:
                report['ok'] = False
            report['tables'][label] = {
                'checked': len(rows), 'unsigned': unsigned,
                'bad_signatures': bad[:5]}

        _check(ev_rows, 'journal_events', 2)
        _check(succ, 'successes', 1)
        _check(tr, 'traces', 1)
        _check(runs, 'runs', 1)
        scar_report = self.verify_scar_chain()
        report['tables']['scars'] = scar_report
        if not scar_report['ok']:
            report['ok'] = False
        return report

    def record_scar_sync(self, scar_data: Dict[str, Any]):
        """Synchronous scar write for the module-level router. Must be
        immediately visible to a subsequent recall in the same quest.

        WRITE-ONCE LAW (author decree 2026-07-23): a repeated wound is a
        NEW scar, appended with its own timestamp and fingerprint — the
        old row is never touched, never refreshed, never deleted. (This
        supersedes engine docket #2's dedup-refresh: re-injury is history
        too. TTL re-arms naturally off the newest row's timestamp.)"""
        with self._lock:
            qn = scar_data.get("quest_name")
            msg = scar_data.get("message")
            ctx = json.dumps(scar_data.get("context"), default=str)
            created_at = _utcnow()
            prev = self._conn.execute(
                "SELECT scar_hash FROM scars WHERE scar_hash IS NOT NULL"
                " ORDER BY id DESC LIMIT 1").fetchone()
            prev_hash = prev[0] if prev else None
            scar_hash = self._scar_fingerprint(qn, msg, ctx, created_at,
                                               prev_hash)
            self._conn.execute(
                "INSERT INTO scars (quest_name, message, context,"
                " created_at, prev_hash, scar_hash, signature)"
                " VALUES (?, ?, ?, ?, ?, ?, ?)",
                (qn, msg, ctx, created_at, prev_hash, scar_hash,
                 self._sign(scar_hash)))
            if self.echo:
                print(f"[DB] Saving scar: {msg}")
            if self.journal is not None:
                self.journal.append_tx(self._conn, 'mem_write',
                                       mem_write_payload('scar',
                                                         scar_data))
            self._conn.commit()
        return scar_data

    def recall_scars_sync(self, quest_name: str) -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT quest_name, message, context, created_at FROM scars"
                " WHERE quest_name = ? ORDER BY id", (quest_name,)).fetchall()
        return [{"quest_name": q, "message": m,
                 "context": json.loads(c) if c else None,
                 "created_at": t} for q, m, c, t in rows]

    def recall_all_scars_sync(self) -> List[Dict[str, Any]]:
        """Every scar across all quests. Used by tournament avoidance:
        exact-match skipping is still quest-scoped via the scar context,
        but similar-path caution must see other quests' scars."""
        with self._lock:
            rows = self._conn.execute(
                "SELECT quest_name, message, context, created_at FROM scars"
                " ORDER BY id").fetchall()
        return [{"quest_name": q, "message": m,
                 "context": json.loads(c) if c else None,
                 "created_at": t} for q, m, c, t in rows]

    # -- success snapshots (diff_vs_success counterfactuals, cross-process) --
    SUCCESS_RETENTION = 10  # per (quest, strategy)

    def record_success_sync(self, entry: Dict[str, Any]):
        """Persist a successful strategy run; keep only the most recent
        SUCCESS_RETENTION per (quest, strategy) so the log can't grow
        without bound."""
        with self._lock:
            if self.journal is not None:
                self.journal.append_tx(self._conn, 'mem_write',
                                       mem_write_payload('success', entry))
            _env_json = json.dumps(entry.get("env"), default=str)
            _ts = _utcnow()
            _row_hash = hashlib.sha256(
                f"{entry.get('quest')}|{entry.get('strategy')}|"
                f"{entry.get('seed')}|{_env_json}|{entry.get('duration')}|"
                f"{1 if entry.get('won') else 0}|{_ts}".encode('utf-8')
            ).hexdigest()
            self._conn.execute(
                "INSERT INTO successes (quest_name, strategy, seed, env,"
                " duration, won, created_at, row_hash, signature)"
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (entry.get("quest"), entry.get("strategy"), entry.get("seed"),
                 _env_json,
                 entry.get("duration"),
                 1 if entry.get("won") else 0, _ts, _row_hash,
                 self._sign(_row_hash)))
            self._conn.execute(
                "DELETE FROM successes WHERE quest_name = ? AND strategy = ?"
                " AND id NOT IN (SELECT id FROM successes"
                "  WHERE quest_name = ? AND strategy = ?"
                "  ORDER BY id DESC LIMIT ?)",
                (entry.get("quest"), entry.get("strategy"),
                 entry.get("quest"), entry.get("strategy"),
                 self.SUCCESS_RETENTION))
            self._conn.commit()
        return entry

    def recall_success_sync(self, quest: str, strategy: str) -> List[Dict[str, Any]]:
        """Success entries for a strategy; same-quest preferred, any quest
        otherwise (mirrors VowSuccessLog.recall semantics)."""
        with self._lock:
            rows = self._conn.execute(
                "SELECT quest_name, strategy, seed, env, created_at,"
                " duration, won"
                " FROM successes WHERE strategy = ? ORDER BY id",
                (strategy,)).fetchall()
        entries = [{"quest": q, "strategy": st, "seed": sd,
                    "env": json.loads(e) if e else {},
                    "created_at": t, "duration": d, "won": bool(w)}
                   for q, st, sd, e, t, d, w in rows]
        same = [e for e in entries if e["quest"] == quest]
        return same or entries

    def recall_all_success_sync(self) -> List[Dict[str, Any]]:
        """Every success snapshot across all quests, oldest-first.
        Powers the `why` query: what works, proven where, how often."""
        with self._lock:
            rows = self._conn.execute(
                "SELECT quest_name, strategy, seed, env, created_at,"
                " duration, won"
                " FROM successes ORDER BY id").fetchall()
        return [{"quest": q, "strategy": st, "seed": sd,
                 "env": json.loads(e) if e else {},
                 "created_at": t, "duration": d, "won": bool(w)}
                for q, st, sd, e, t, d, w in rows]

    def recall_all_traces_sync(self) -> List[Dict[str, Any]]:
        """Every persisted run trace, oldest-first (run_id + parsed data +
        created_at). Powers the daily behavioral digest."""
        with self._lock:
            rows = self._conn.execute(
                "SELECT run_id, data, created_at FROM traces"
                " ORDER BY rowid").fetchall()
        return [{"run_id": r, "data": json.loads(d) if d else {},
                 "created_at": t} for r, d, t in rows]

    # -- async interface (drop-in for MockDatabase) --
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
            _data = json.dumps(trace_data, default=str)
            _ts = _utcnow()
            _row_hash = hashlib.sha256(
                f"{run_id}|{_data}|{_ts}".encode('utf-8')).hexdigest()
            self._conn.execute(
                "INSERT OR REPLACE INTO traces (run_id, data, created_at,"
                " row_hash, signature) VALUES (?, ?, ?, ?, ?)",
                (run_id, _data, _ts, _row_hash, self._sign(_row_hash)))
            self._conn.commit()

    async def get_trace(self, run_id: str) -> Optional[Dict[str, Any]]:
        if self.echo:
            print(f"[DB] Retrieving trace for run_id: {run_id}")
        with self._lock:
            row = self._conn.execute(
                "SELECT data FROM traces WHERE run_id = ?", (run_id,)).fetchone()
        return json.loads(row[0]) if row else None

    def close(self):
        self._conn.close()
