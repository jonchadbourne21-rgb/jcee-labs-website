# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""Arc 3D — the PostgreSQL durability journal + multi-run hardening
(docs/DURABILITY.md §7).

Two layers, honestly separated:

1. Scripted-fake conformance (always runs): the PostgresDatabase registry
   surface, journal store primitives, mem_write atomicity, and the atomic
   claim — plus the REAL JournalRuntime chained through the PG backend,
   proving runtime+backend compose and the chain verifies.

2. Live-server e2e (skips loudly when no server is reachable): full
   CLI parity — journaled run on --postgres, chain verifies, kill at a
   boundary, resume to success with exactly-once intact. A live server
   comes from VOW_TEST_PG_DSN, or a locally booted pgserver if installed.
"""
import json
import os
import sqlite3
import subprocess
import sys
import tempfile

try:
    import pytest
except ImportError:  # pytest-less machines: honest fallback, never an import error
    import re, unittest
    class _Shim:
        class _Raises:
            def __init__(self, exc, match=None): self.exc, self.match = exc, match
            def __enter__(self): return self
            def __exit__(self, t, v, tb):
                assert t is not None and issubclass(t, self.exc), f'expected {self.exc}'
                if self.match: assert re.search(self.match, str(v)), f'no match {self.match!r} in {v}'
                return True
        def raises(self, exc, match=None): return self._Raises(exc, match)
        def skip(self, reason=''): raise unittest.SkipTest(reason)
    pytest = _Shim()

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJ)

from vow.database_backends import PostgresDatabase          # noqa: E402
from vow.vow_transpiler import JournalRuntime               # noqa: E402


# ---------------- scripted DBAPI fake (with rowcount + capture) -------------

class FakeCursor:
    def __init__(self, conn):
        self._conn = conn
        self._result = []
        self.rowcount = 0

    def execute(self, sql, params=()):
        sql_s = sql.strip()
        self._conn.log.append((sql_s, tuple(params)))
        self.rowcount = self._conn.rowcount_plan
        for prefix, rows in self._conn.fetch_plan:
            if sql_s.upper().startswith(prefix):
                self._result = list(rows)
                break
        else:
            self._result = []
        return self

    def fetchall(self):
        return self._result

    def fetchone(self):
        return self._result[0] if self._result else None


class FakePGConnection:
    def __init__(self):
        self.log = []
        self.fetch_plan = []
        self.rowcount_plan = 0
        self.commits = 0

    def cursor(self):
        return FakeCursor(self)

    def commit(self):
        self.commits += 1

    def close(self):
        pass


def _journal_rows_from_log(conn):
    """Reconstruct journal event dicts from the fake's captured INSERTs —
    payload parsed, mirroring load_journal (verify_chain expects dicts)."""
    out = []
    for sql, params in conn.log:
        if sql.startswith('INSERT INTO journal_events'):
            run_id, seq, kind, payload, prev, eh = params
            out.append({'run_id': run_id, 'seq': seq, 'kind': kind,
                        'payload': json.loads(payload), 'prev_hash': prev,
                        'event_hash': eh})
    return out


# ---------------- fake-level conformance ------------------------------------

def test_pg_registry_surface_sql():
    conn = FakePGConnection()
    db = PostgresDatabase(conn)
    conn.log.clear()
    db.create_run('r1', 'Q', 'src', 'eng', source_path='/x/q.vow')
    sql, params = conn.log[-1]
    assert sql.startswith('INSERT INTO runs') and '%s' in sql
    assert 'ON CONFLICT (run_id) DO UPDATE' in sql
    assert params == ('r1', 'Q', 'src', 'eng', '/x/q.vow')

    db.finish_run('r1', 'success', 'hh', 9)
    sql, params = conn.log[-1]
    assert 'claimed_by = NULL' in sql  # finish releases the claim
    assert params == ('success', 'hh', 9, 'r1')

    db.suspend_run('r1', 'suspended', '2030-01-01T00:00:00', 'hh', 3)
    sql, _ = conn.log[-1]
    assert 'claimed_by = NULL' in sql  # parking releases
    db.suspend_run('r1', 'running', None, 'hh', 3)
    sql, _ = conn.log[-1]
    assert 'claimed_by' not in sql  # approve handoff keeps the claim

    conn.fetch_plan.append(('SELECT RUN_ID, QUEST, STATUS, WAKE_AT',
                            [('r1', 'Q', 'suspended', '2020-01-01',
                              '2026-07-21')]))
    due = db.due_runs('2026-07-21T00:00:00')
    assert due[0]['run_id'] == 'r1'

    conn.fetch_plan.clear()
    conn.fetch_plan.append((
        'SELECT RUN_ID, QUEST, SOURCE_SHA256, ENGINE_SHA256, STATUS',
        [('r1', 'Q', 'src', 'eng', 'running', 'c', None, 'hh', 3, None,
          '/x/q.vow')]))
    row = db.get_run('r1')
    assert row['source_path'] == '/x/q.vow' and row['status'] == 'running'


def test_pg_journal_primitives_commit_scope():
    conn = FakePGConnection()
    db = PostgresDatabase(conn)
    conn.log.clear(); conn.commits = 0
    ev = {'run_id': 'r', 'seq': 1, 'kind': 'run_begin', 'payload': '{}',
          'prev_hash': '0' * 64, 'event_hash': 'ab'}
    db.journal_append(ev)
    assert conn.commits == 1  # own transaction
    db.journal_append_tx(conn, ev)
    assert conn.commits == 1  # caller's transaction — no commit here
    db.journal_append_many([ev, dict(ev, seq=2)])
    assert conn.commits == 2  # one commit for the pair
    inserts = [p for sql, p in conn.log
               if sql.startswith('INSERT INTO journal_events')]
    assert len(inserts) == 4 and all(len(p) == 6 for p in inserts)


def test_pg_claim_run_sql_and_semantics():
    conn = FakePGConnection()
    db = PostgresDatabase(conn)
    conn.log.clear()
    conn.rowcount_plan = 1
    assert db.claim_run('r1', 'tok123', stale_minutes=45) is True
    sql, params = conn.log[-1]
    assert sql.startswith('UPDATE runs SET claimed_by = %s')
    assert "status IN (%s,%s,%s)" in sql  # OWED 7: 'crashed' is claimable
    assert 'claimed_by = %s' in sql          # self-token re-claim
    assert 'make_interval(mins => %s)' in sql  # stale window
    assert params == ('tok123', 'r1', 'running', 'suspended', 'crashed',
                      'tok123', 45)
    conn.rowcount_plan = 0
    assert db.claim_run('r1', 'other') is False  # lost the race
    # approve/deny claim from awaiting_approval
    conn.rowcount_plan = 1
    assert db.claim_run('r2', 'tok', from_statuses=('awaiting_approval',))
    sql, params = conn.log[-1]
    assert "status IN (%s)" in sql and params[2] == 'awaiting_approval'


def test_pg_mem_write_journaled_in_one_commit():
    """row⟺event atomicity on PG: with a REAL JournalRuntime attached,
    a scar write lands its mem_write event and its row in ONE commit,
    event first (a crash between them is impossible)."""
    conn = FakePGConnection()
    db = PostgresDatabase(conn)
    jr = JournalRuntime(db, 'r1', mode='live')
    jr.append('run_begin', {'quest': 'Q'})
    db.journal = jr
    conn.log.clear(); conn.commits = 0
    db.record_scar_sync({'quest_name': 'Q', 'message': 'boom',
                         'context': {'k': 1}})
    tables = [sql.split(' ')[2] for sql, _ in conn.log
              if sql.startswith('INSERT INTO')]
    assert tables == ['journal_events', 'scars']  # event first, then row
    assert conn.commits == 1                      # one transaction
    rows = _journal_rows_from_log(conn)
    assert rows[0]['kind'] == 'mem_write'
    assert rows[0]['payload']['store'] == 'scar'
    assert rows[0]['payload']['message'] == 'boom'
    # no journal attached: plain write, no journal SQL
    db.journal = None
    conn.log.clear()
    db.record_scar_sync({'quest_name': 'Q', 'message': 'm2'})
    assert not any(sql.startswith('INSERT INTO journal_events')
                   for sql, _ in conn.log)


def test_journal_runtime_chains_through_pg_backend():
    """The REAL JournalRuntime over the PG store primitive: three events
    chained, SQL captured from the fake, chain verifies."""
    conn = FakePGConnection()
    db = PostgresDatabase(conn)
    jr = JournalRuntime(db, 'run-x', mode='live')
    jr.append('run_begin', {'quest': 'Q'})
    jr.append('effect_intent', {'capability': 'shell', 'action': 'exec'})
    jr.append('run_end', {'status': 'success'})
    assert jr.head[1] == 3
    rows = _journal_rows_from_log(conn)
    assert len(rows) == 3
    ok, msg = JournalRuntime.verify_chain('run-x', rows)
    assert ok, msg
    # the chain really is chained (genesis prev, then linked)
    assert rows[0]['prev_hash'] == '0' * 64
    assert rows[1]['prev_hash'] == rows[0]['event_hash']
    assert rows[2]['prev_hash'] == rows[1]['event_hash']
    # and every write used DBAPI markers, never sqlite's
    assert all('%s' in sql for sql, _ in conn.log
               if sql.startswith('INSERT INTO journal_events'))


# ---------------- live-server e2e (honest skip when absent) -----------------

def _live_pg_dsn(tmp_path):
    """A reachable Postgres DSN, or None. Sources: VOW_TEST_PG_DSN env,
    or a locally booted pgserver (pip package) if present."""
    dsn = os.environ.get('VOW_TEST_PG_DSN')
    if dsn:
        return dsn
    try:
        # pgserver's process lock defaults to XDG_RUNTIME_DIR, which is
        # unwritable in some sandboxes — give it a writable, private one
        xdg = str(tmp_path / 'xdg')
        os.makedirs(xdg, exist_ok=True)
        os.chmod(xdg, 0o700)
        os.environ['XDG_RUNTIME_DIR'] = xdg
        import pgserver
    except ImportError:
        return None
    try:
        srv = pgserver.get_server(str(tmp_path / 'pgdata'))
        _KEEP_SERVER_ALIVE.append(srv)  # GC/atexit stops it otherwise
        return srv.get_uri()
    except Exception:
        return None


_KEEP_SERVER_ALIVE = []


def test_pg_live_cli_parity(tmp_path):
    dsn = _live_pg_dsn(tmp_path)
    if not dsn:
        pytest.skip('no PostgreSQL server reachable (set VOW_TEST_PG_DSN '
                    'or install pgserver) — fake-level conformance above '
                    'is what runs without one')
    env = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}
    base = str(tmp_path)
    log = os.path.join(base, 'pg_log.txt')
    quest = os.path.join(base, 'pgq.vow')
    with open(quest, 'w') as fh:
        fh.write('quest PGQ {\n  goal "g"\n  capability shell\n'
                 '  let a = shell_exec("echo one >> %s")\n'
                 '  let b = shell_exec("echo two >> %s")\n'
                 '  prove true\n  success when true\n}\n' % (log, log))

    def cli(argv, ok=True, extra=None):
        e = dict(env)
        if extra:
            e.update(extra)
        r = subprocess.run([sys.executable, 'vow_cli.py'] + argv,
                           capture_output=True, text=True, cwd=PROJ, env=e)
        if ok:
            assert r.returncode == 0, (r.stdout + r.stderr)[-500:]
        return r

    # a live journaled run on --postgres
    r = cli(['run', quest, '--postgres', dsn, '--live'])
    run_id = json.loads(r.stdout)['run_id']
    j = json.loads(cli(['journal', run_id, '--postgres', dsn]).stdout)
    assert j['chain_intact'] is True
    assert j['run']['status'] == 'success'
    kinds = [e['kind'] for e in j['events']]
    assert kinds[0] == 'run_begin' and kinds[-1] == 'run_end'
    with open(log) as fh:
        assert fh.read().splitlines() == ['one', 'two']

    # kill at boundary 3 (after first effect's result), resume: exactly-once
    r = cli(['run', quest, '--postgres', dsn, '--live'], ok=False,
            extra={'VOW_KILL_AFTER': '3'})
    assert r.returncode == 9
    rows = json.loads(cli(['runs', '--postgres', dsn]).stdout)
    corpse = [x for x in rows if x['status'] == 'running'][0]
    r = cli(['run', quest, '--postgres', dsn, '--live', '--resume',
             corpse['run_id']])
    assert json.loads(r.stdout)['status'] == 'success'
    j = json.loads(cli(['journal', corpse['run_id'], '--postgres',
                        dsn]).stdout)
    assert j['chain_intact'] is True
    with open(log) as fh:
        assert fh.read().splitlines() == ['one', 'two',
                                          'one', 'two'][-4:]
    # ^ two independent successful runs appended two pairs; the RESUMED
    #   one re-executed nothing journaled
    results = [e for e in j['events'] if e['kind'] == 'effect_result']
    assert len(results) == 2

    # the atomic claim: a claimed run refuses a second resumer
    r = cli(['run', quest, '--postgres', dsn, '--live'], ok=False,
            extra={'VOW_KILL_AFTER': '3'})
    assert r.returncode == 9
    rows = json.loads(cli(['runs', '--postgres', dsn]).stdout)
    corpse2 = [x for x in rows
               if x['status'] == 'running'
               and x['run_id'] != corpse['run_id']][0]
    # claim it externally (another "process"), then watch resume refuse
    from vow.database_backends import _load_pg_driver
    _, connect = _load_pg_driver()
    raw = connect(dsn)
    raw.cursor().execute(
        "UPDATE runs SET claimed_by = 'external', claimed_at = now()"
        " WHERE run_id = %s", (corpse2['run_id'],))
    raw.commit(); raw.close()
    r = cli(['run', quest, '--postgres', dsn, '--live', '--resume',
             corpse2['run_id']], ok=False)
    assert r.returncode == 1
    assert 'claimed by another process' in r.stdout + r.stderr
