"""OWED 7 — the Postgres socket-loss investigation, settled (2026-07-25).

Filed in the dissertation: "the Postgres socket-loss investigation."
The drills against a LIVE server (embedded pgserver) established:

  * the chain SURVIVES a mid-run server crash intact (transactional
    appends — no partial rows, no corrupted head);
  * resume after the server returns recovers exactly-once;
  * BUT the error path lied by omission: a dead socket turned
    finish_run into an unhandled psycopg traceback (F7-1 — cured: the
    honest JSON error reaches stdout, and the payload says the corpse
    reconciles by heartbeat evidence);
  * AND the Postgres backend lacked the durability arcs entirely:
    heartbeat/reconcile (Owed 4) and the crash-window consult finder
    (Owed 1) were SQLite-only — a PG corpse said 'running' forever and
    a keyed consult raised AttributeError (F7-2/F7-3 — cured, pinned
    here and in v20 check 79).

Every test boots its own embedded server and skips honestly where
pgserver/psycopg are absent.
"""
import json
import os
import signal
import subprocess
import sys
import tempfile
import time

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJ)
# pgserver's lock (fasteners) resolves XDG_RUNTIME_DIR AT IMPORT TIME;
# /run/user/<uid> is not writable in this sandbox. Set a private 0o700
# runtime dir BEFORE the import, exactly as the drills did.
if 'XDG_RUNTIME_DIR' not in os.environ:
    _xdg = tempfile.mkdtemp(prefix='vow-xdg-')
    os.chmod(_xdg, 0o700)
    os.environ['XDG_RUNTIME_DIR'] = _xdg

ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}

try:
    import psycopg  # noqa: F401
    import pgserver  # noqa: F401
    HAVE_PG = True
except ImportError:
    HAVE_PG = False

try:
    import pytest
except ImportError:
    import unittest

    class _Shim:
        def skip(self, reason=''):
            raise unittest.SkipTest(reason)

    pytest = _Shim()

CRASHABLE = '''quest Crashable {
  goal "three durable steps with a pause"
  capability shell
  let step1 = shell_exec("echo one >> %(log)s")
  let pause = shell_exec("sleep 6")
  let step2 = shell_exec("echo two >> %(log)s")
  let step3 = shell_exec("echo three >> %(log)s")
  prove true
  success when true
}
'''


def _boot(base):
    xdg = os.path.join(base, 'xdg')
    os.makedirs(xdg, exist_ok=True)
    os.chmod(xdg, 0o700)
    os.environ['XDG_RUNTIME_DIR'] = xdg
    import pgserver
    srv = pgserver.get_server(os.path.join(base, 'pgdata'))
    return srv, srv.get_uri()


def _need_pg():
    if not HAVE_PG:
        pytest.skip('pgserver/psycopg not installed — the live-server '
                    'drills run wherever a server exists')


def _quest(base, text=CRASHABLE):
    log = os.path.join(base, 'log.txt')
    path = os.path.join(base, 'crashable.vow')
    with open(path, 'w') as fh:
        fh.write(text % {'log': log})
    return path, log


def _start_run(quest, dsn):
    return subprocess.Popen(
        [sys.executable, 'vow_cli.py', 'run', quest, '--postgres', dsn,
         '--live'],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=PROJ,
        text=True)


def _await_first_effect(log, deadline=30):
    end = time.time() + deadline
    while not os.path.exists(log):
        assert time.time() < end, 'first effect never landed'
        time.sleep(0.1)
    time.sleep(0.5)


def test_socket_loss_fails_honestly(tmp_path=None):
    """F7-1: kill the server mid-run — the CLI must report an honest
    JSON error (never a raw driver traceback), and the payload must say
    the corpse reconciles by heartbeat evidence. Doctrine: stdout is
    reserved for traces; the error object lands on stderr."""
    _need_pg()
    base = str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_pg_')
    srv, dsn = _boot(base)
    quest, log = _quest(base)
    proc = _start_run(quest, dsn)
    _await_first_effect(log)
    os.kill(srv.get_pid(), signal.SIGKILL)
    out, err = proc.communicate(timeout=90)
    assert proc.returncode == 1, (out + err)[-500:]
    assert 'Traceback' not in out + err
    payload = json.loads(err[err.index('{'):])
    assert 'error' in payload
    assert 'reconcile as crashed' in payload['error'] or \
        'could not record' in payload['error'], payload


def test_chain_survives_and_resume_recovers(tmp_path=None):
    """The recovery story end to end: crash → restart → chain verifies →
    resume finishes the SAME run with effects exactly once."""
    _need_pg()
    base = str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_pg_')
    srv, dsn = _boot(base)
    quest, log = _quest(base)
    proc = _start_run(quest, dsn)
    _await_first_effect(log)
    pid = srv.get_pid()
    os.kill(pid, signal.SIGKILL)
    proc.communicate(timeout=90)
    time.sleep(1)
    srv.ensure_postgres_running()
    import psycopg
    with psycopg.connect(dsn) as c:
        rid = c.execute("SELECT run_id FROM runs").fetchone()[0]
        evs = c.execute(
            "SELECT seq, kind, payload, ts, prev_hash, event_hash"
            " FROM journal_events WHERE run_id = %s ORDER BY seq",
            (rid,)).fetchall()
    from vow.vow_transpiler import JournalRuntime
    events = [{'seq': s, 'kind': k,
               'payload': json.loads(p) if isinstance(p, str) else p,
               'ts': str(t), 'prev_hash': ph, 'event_hash': eh}
              for s, k, p, t, ph, eh in evs]
    ok, msg = JournalRuntime.verify_chain(rid, events)
    assert ok, msg  # no partial rows, no corrupted head
    r = subprocess.run(
        [sys.executable, 'vow_cli.py', 'run', quest, '--postgres', dsn,
         '--live', '--resume', rid],
        capture_output=True, text=True, cwd=PROJ, env=ENV, timeout=120)
    assert r.returncode == 0, (r.stdout + r.stderr)[-500:]
    with open(log) as fh:
        assert fh.read().splitlines() == ['one', 'two', 'three']
    with psycopg.connect(dsn) as c:
        assert c.execute("SELECT status FROM runs WHERE run_id = %s",
                         (rid,)).fetchone()[0] == 'success'


def test_pg_corpse_reconciles_by_heartbeat(tmp_path=None):
    """F7-2: the Owed 4 arc works ON POSTGRES — the CLI's heartbeat
    beats into PG, the crash stops it, and plain `vow sweep` reconciles
    by evidence and resumes (pre-Owed-7 the PG corpse said 'running'
    forever)."""
    _need_pg()
    base = str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_pg_')
    srv, dsn = _boot(base)
    quest, log = _quest(base)
    proc = _start_run(quest, dsn)
    _await_first_effect(log)
    proc.kill()          # the CLIENT dies; the server lives on
    proc.wait()
    import psycopg
    with psycopg.connect(dsn) as c:
        rid = c.execute("SELECT run_id FROM runs").fetchone()[0]
        hb = c.execute("SELECT heartbeat_at FROM runs WHERE run_id = %s",
                       (rid,)).fetchone()[0]
        assert hb is not None            # the beat stamped
        c.execute("UPDATE runs SET heartbeat_at = now() - interval '1 day'"
                  " WHERE run_id = %s", (rid,))
    r = subprocess.run(
        [sys.executable, 'vow_cli.py', 'sweep', '--postgres', dsn],
        capture_output=True, text=True, cwd=PROJ, env=ENV, timeout=120)
    assert r.returncode == 0, (r.stdout + r.stderr)[-500:]
    out = json.loads(r.stdout[r.stdout.index('{'):])
    assert out['counts']['reconciled'] == 1
    assert out['counts']['resumed'] == 1
    with open(log) as fh:
        assert fh.read().splitlines() == ['one', 'two', 'three']
    with psycopg.connect(dsn) as c:
        assert c.execute("SELECT status FROM runs WHERE run_id = %s",
                         (rid,)).fetchone()[0] == 'success'


def test_consult_finder_and_claim_parity(tmp_path=None):
    """F7-3 (db level): the Owed 1 crash-window finder pairs
    intent→result exactly on PG, pending intent is honestly None, and
    'crashed' is claimable."""
    _need_pg()
    base = str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_pg_')
    srv, dsn = _boot(base)
    from vow.database_backends import PostgresDatabase
    from vow.vow_transpiler import JournalRuntime
    db = PostgresDatabase(dsn)
    db.create_run('probe', 'Q', 's', 'e')
    jr = JournalRuntime(db, 'probe', mode='live')
    db.journal = jr
    jr.append('effect_intent', {'capability': 'shell',
                                'action': 'shell_exec', 'args': ['ls'],
                                'idempotency_key': 'k1'})
    assert db.journal_find_completed_effect(
        'probe', 'shell', 'shell_exec', 'k1') is None
    jr.append('effect_result', {'capability': 'shell',
                                'action': 'shell_exec', 'result': 'ok'})
    found = db.journal_find_completed_effect(
        'probe', 'shell', 'shell_exec', 'k1')
    assert found and found['result'] == 'ok' and found['args'] == ['ls']
    db.reconcile_crashed(0)   # zero staleness: everything with a beat
    assert db.get_run('probe')['status'] == 'crashed'
    assert db.claim_run('probe', 'tok') is True
    db.close()
