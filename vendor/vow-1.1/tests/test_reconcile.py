"""Tests for OWED 4 — the crashed-running truncation window (2026-07-24).

The dissertation's debt: "A run that dies leaves a registry row saying
'running' forever unless something reconciles it."

The cure: the HEARTBEAT. The executing process beats into the registry
every VOW_HEARTBEAT_SECONDS; a crash stops the beat, and the stale
timestamp is EVIDENCE — 'running' vs 'died mid-quest' stops being the
operator's guess. `vow sweep` reconciles stale rows to 'crashed' and
resumes them automatically; rows with NO heartbeat evidence stay the
operator's explicit --crashed call; a FRESH heartbeat refuses even
--crashed — evidence outranks the operator.
"""
import json
import os
import sqlite3
import subprocess
import sys
import time

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJ)
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}

from vow.database import SqliteDatabase          # noqa: E402

CRASHABLE = '''quest Crashable {
  goal "three durable steps with a pause"
  capability shell
  let step1 = shell_exec("echo one >> %(log)s")
  let pause = shell_exec("sleep 4")
  let step2 = shell_exec("echo two >> %(log)s")
  let step3 = shell_exec("echo three >> %(log)s")
  prove true
  success when true
}
'''

SIMPLE = '''quest Simple {
  goal "one durable step"
  capability shell
  let step1 = shell_exec("echo solo >> %(log)s")
  prove true
  success when true
}
'''


def _cli(args, env=None, ok=True):
    r = subprocess.run([sys.executable, 'vow_cli.py'] + args,
                       capture_output=True, text=True, cwd=PROJ,
                       env=env or ENV)
    if ok:
        assert r.returncode == 0, (r.stdout + r.stderr)[-700:]
    return r


def _write(base, name, text):
    path = os.path.join(base, name)
    with open(path, 'w') as fh:
        fh.write(text)
    return path


def _age_heartbeat(db, run_id, when='2000-01-01 00:00:00'):
    """Registry staging: heartbeat_at is a MUTABLE registry field —
    deliberately not in the identity hash — so aging it is signature-
    safe. (We stage evidence; we never forge it.)"""
    con = sqlite3.connect(db)
    con.execute("UPDATE runs SET heartbeat_at = ? WHERE run_id = ?",
                (when, run_id))
    con.commit()
    con.close()


def _crash_mid_quest(base):
    db = os.path.join(base, 'mem.db')
    log = os.path.join(base, 'crash_log.txt')
    quest = _write(base, 'crashable.vow', CRASHABLE % {'log': log})
    proc = subprocess.Popen(
        [sys.executable, 'vow_cli.py', 'run', quest, '--db', db, '--live'],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        cwd=PROJ, env=ENV)
    deadline = time.time() + 15
    while not os.path.exists(log):
        assert time.time() < deadline, 'first effect never landed'
        time.sleep(0.1)
    time.sleep(0.5)  # inside the sleep-4 window
    proc.kill()
    proc.wait()
    row = json.loads(_cli(['runs', '--db', db]).stdout)[0]
    assert row['status'] == 'running'
    return db, quest, log, row['run_id']


# --- the store layer ---------------------------------------------------------

def test_heartbeat_stamps_and_beats(tmp_path):
    db = SqliteDatabase(str(tmp_path / 'h.db'))
    db.create_run('r1', 'Q', 's', 'e')
    first = db.get_run('r1')['heartbeat_at'] if 'heartbeat_at' in \
        db.get_run('r1') else None
    assert first is not None  # stamped at birth
    time.sleep(1.1)
    db.heartbeat('r1')
    con = sqlite3.connect(str(tmp_path / 'h.db'))
    later = con.execute("SELECT heartbeat_at FROM runs WHERE run_id='r1'"
                        ).fetchone()[0]
    con.close()
    assert later > first
    # a finished row's terminal state is never overwritten by a beat
    db.finish_run('r1', 'success', 'hh', 1)
    db.heartbeat('r1')
    con = sqlite3.connect(str(tmp_path / 'h.db'))
    assert con.execute("SELECT heartbeat_at FROM runs WHERE run_id='r1'"
                       ).fetchone()[0] == later
    con.close()


def test_reconcile_crashed_by_evidence_only(tmp_path):
    db = SqliteDatabase(str(tmp_path / 'r.db'))
    db.create_run('stale', 'Q', 's', 'e')
    db.create_run('fresh', 'Q', 's', 'e')
    db.create_run('noevidence', 'Q', 's', 'e')
    db.create_run('parked', 'Q', 's', 'e')
    con = sqlite3.connect(str(tmp_path / 'r.db'))
    con.execute("UPDATE runs SET heartbeat_at='2000-01-01 00:00:00'"
                " WHERE run_id='stale'")
    con.execute("UPDATE runs SET heartbeat_at=NULL"
                " WHERE run_id='noevidence'")
    con.execute("UPDATE runs SET status='suspended'"
                " WHERE run_id='parked'")
    con.commit()
    con.close()
    out = db.reconcile_crashed(30)
    assert [r['run_id'] for r in out] == ['stale']
    assert db.get_run('stale')['status'] == 'crashed'
    assert db.get_run('stale')['reconciled_at'] is not None
    assert db.get_run('fresh')['status'] == 'running'       # alive: untouched
    assert db.get_run('noevidence')['status'] == 'running'  # no evidence,
    # no verdict — the operator's call
    assert db.get_run('parked')['status'] == 'suspended'


# --- the arc ------------------------------------------------------------------

def test_sweep_reconciles_and_resumes_automatically(tmp_path):
    """kill -9 mid-quest; the beat stops; plain `vow sweep` (NO
    --crashed flag) reconciles by evidence and resumes — effects run
    exactly once, the registry stops lying."""
    base = str(tmp_path)
    db, quest, log, run_id = _crash_mid_quest(base)
    _age_heartbeat(db, run_id)
    r = _cli(['sweep', '--db', db])
    out = json.loads(r.stdout)
    assert out['counts']['reconciled'] == 1
    assert out['reconciled'][0]['run_id'] == run_id
    assert out['counts']['resumed'] == 1
    with open(log) as fh:
        assert fh.read().splitlines() == ['one', 'two', 'three']
    row = json.loads(_cli(['runs', '--db', db]).stdout)[0]
    assert row['status'] == 'success'


def test_fresh_heartbeat_refuses_even_crashed_flag(tmp_path):
    """Evidence outranks the operator: a 'running' row with a FRESH
    beat looks alive — sweep --crashed refuses it, loudly."""
    db = str(tmp_path / 'live.db')
    sdb = SqliteDatabase(db)
    sdb.create_run('alive', 'Q', 's', 'e')   # heartbeat stamped fresh
    r = _cli(['sweep', '--db', db, '--crashed'])
    out = json.loads(r.stdout)
    assert out['counts']['refused_live'] == 1
    assert out['refused_live'][0]['run_id'] == 'alive'
    assert out['counts']['resumed'] == 0
    assert SqliteDatabase(db).get_run('alive')['status'] == 'running'


def test_crashed_flag_covers_no_evidence_rows(tmp_path):
    """Legacy path preserved: a 'running' row with NO heartbeat
    (pre-heartbeat store) is the operator's explicit call — --crashed
    resumes it."""
    base = str(tmp_path)
    db = os.path.join(base, 'legacy.db')
    log = os.path.join(base, 'solo_log.txt')
    quest = _write(base, 'simple.vow', SIMPLE % {'log': log})
    # stage the registry row with HONEST attestation hashes — resume
    # validates source + engine against them (a row staged with fake
    # hashes is refused as "source changed", correctly)
    import hashlib as _hl
    from vow.compliance import engine_attestation
    _src_sha = _hl.sha256(
        open(quest, encoding='utf-8').read().encode()).hexdigest()
    _eng_sha = engine_attestation()['engine_sha256']
    sdb = SqliteDatabase(db)
    sdb.create_run('legacy', 'Simple', _src_sha, _eng_sha,
                   source_path=quest)
    con = sqlite3.connect(db)
    con.execute("UPDATE runs SET heartbeat_at=NULL WHERE run_id='legacy'")
    con.commit()
    con.close()
    r = _cli(['sweep', '--db', db, '--crashed'])
    out = json.loads(r.stdout)
    assert out['counts']['refused_live'] == 0
    assert out['counts']['resumed'] == 1
    with open(log) as fh:
        assert fh.read().splitlines() == ['solo']


def test_doctor_reports_crash_evidence(tmp_path):
    """Doctor names stale beats and reconciled crashes — the store's
    physical never says 'running' forever."""
    db = str(tmp_path / 'd.db')
    sdb = SqliteDatabase(db)
    sdb.create_run('flatline', 'Q', 's', 'e')
    _age_heartbeat(db, 'flatline')
    r = _cli(['doctor', '--db', db], ok=False)
    assert r.returncode == 1
    out = json.loads(r.stdout)
    assert out['health'] == 'NEEDS CARE'
    assert any('flatline' in i and 'heartbeat stopped' in i
               for i in out['issues'])
    # reconcile (as sweep would), then doctor flags the crash worklist
    SqliteDatabase(db).reconcile_crashed(30)
    r2 = _cli(['doctor', '--db', db], ok=False)
    out2 = json.loads(r2.stdout)
    assert any('flatline' in i and 'crashed runs awaiting' in i
               for i in out2['issues'])


def test_the_beat_beats_while_alive(tmp_path):
    """The thread itself: heartbeat_at ADVANCES during execution and
    rests when the process stops executing."""
    base = str(tmp_path)
    db = os.path.join(base, 'beat.db')
    log = os.path.join(base, 'beat_log.txt')
    quest = _write(base, 'crashable.vow', CRASHABLE % {'log': log})
    env = dict(ENV, VOW_HEARTBEAT_SECONDS='1')
    proc = subprocess.Popen(
        [sys.executable, 'vow_cli.py', 'run', quest, '--db', db, '--live'],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        cwd=PROJ, env=env)
    try:
        deadline = time.time() + 15
        while not os.path.exists(log):
            assert time.time() < deadline, 'first effect never landed'
            time.sleep(0.1)

        def _beat_ts():
            con = sqlite3.connect(db)
            row = con.execute("SELECT heartbeat_at FROM runs").fetchone()
            con.close()
            return row[0]

        time.sleep(1.2)   # inside the sleep-4 window
        b1 = _beat_ts()
        time.sleep(1.4)
        b2 = _beat_ts()
        assert b2 > b1, 'heartbeat did not advance during execution'
    finally:
        proc.kill()
        proc.wait()
