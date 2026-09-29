"""Tests for the Arc 3E CLI quartet (vow_cli.py explain/verify/replay/doctor):
four read-only operator commands over the run store.

  explain <run_id>  — why a run is parked/held/ended, in plain language
  verify            — batch journal-chain verification, rc=1 on any break
  replay <run_id>   — narrate the journal as lives
  doctor            — store physical: chains, due queue, orphaned claims, scars

Ported from the Arc 3E workshop checks (10/10 green there) to project
conventions: subprocess against vow_cli.py with cwd=PROJ, PYTHONPATH stripped.
"""
import json
import os
import sqlite3
import subprocess
import sys
import time

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}


def _cli(args, ok=True):
    r = subprocess.run([sys.executable, 'vow_cli.py'] + args,
                       capture_output=True, text=True, cwd=PROJ, env=ENV,
                       timeout=120)
    if ok:
        assert r.returncode == 0, 'cli failed %s: %s' % (args, r.stderr[-400:])
    return r


def _jout(r):
    return json.loads(r.stdout[r.stdout.index('{'):])


def _write(path, text):
    with open(path, 'w') as f:
        f.write(text)
    return str(path)


def _run_ok(db, tmp_path):
    q = _write(tmp_path / 'ok.vow',
               'quest Ok {\n  goal "small win"\n  prove 1 == 1\n'
               '  success when true\n}\n')
    return _jout(_cli(['run', q, '--db', str(db)]))['run_id']


def _run_wait(db, log, tmp_path):
    t1 = int(time.time()) + 2
    q = _write(tmp_path / 'w.vow',
               'quest W {\n  goal "park me"\n  capability shell\n'
               '  let a = shell_exec("echo filed >> %s")\n  wait until %d\n'
               '  let b = shell_exec("echo woke >> %s")\n  prove true\n'
               '  success when true\n}\n' % (log, t1, log))
    return _jout(_cli(['run', q, '--db', str(db), '--live']))['run_id']


def test_explain_success_narrated(tmp_path):
    db = tmp_path / 'a.db'
    rid = _run_ok(db, tmp_path)
    ex = _jout(_cli(['explain', rid, '--db', str(db)]))
    assert ex['status'] == 'success'
    assert any('ended' in w for w in ex['explanation']), ex['explanation']


def test_verify_all_chains_intact(tmp_path):
    db = tmp_path / 'a.db'
    _run_ok(db, tmp_path)
    vf = _jout(_cli(['verify', '--db', str(db)]))
    assert vf['broken'] == []
    assert vf['verified'] >= 1


def test_replay_single_life(tmp_path):
    db = tmp_path / 'a.db'
    rid = _run_ok(db, tmp_path)
    rp = _jout(_cli(['replay', rid, '--db', str(db)]))
    assert rp['lives'] == 1
    assert any('begins' in l for l in rp['narrative'])


def test_doctor_healthy_store(tmp_path):
    db = tmp_path / 'a.db'
    _run_ok(db, tmp_path)
    dc = _jout(_cli(['doctor', '--db', str(db)]))
    assert dc['health'] == 'HEALTHY', dc


def test_explain_parked_then_replay_two_lives(tmp_path):
    db = tmp_path / 'b.db'
    log = tmp_path / 'b.log'
    rid = _run_wait(db, log, tmp_path)
    ex = _jout(_cli(['explain', rid, '--db', str(db)]))
    assert ex['status'] == 'suspended'
    assert any('wait until' in w for w in ex['explanation']), ex['explanation']
    time.sleep(2.5)
    _cli(['sweep', '--db', str(db)])
    rp = _jout(_cli(['replay', rid, '--db', str(db)]))
    assert rp['lives'] == 2, rp['narrative']
    assert any('gate opens' in l for l in rp['narrative']), rp['narrative']
    dc = _jout(_cli(['doctor', '--db', str(db)]))
    assert dc['health'] == 'HEALTHY', dc


def test_explain_approval_reason_shown(tmp_path):
    db = tmp_path / 'c.db'
    q = _write(tmp_path / 'ap.vow',
               'quest Ap {\n  goal "needs a human"\n'
               '  await approval "settlement exceeds adjuster authority"\n'
               '  prove true\n  success when true\n}\n')
    rid = _jout(_cli(['run', q, '--db', str(db), '--live']))['run_id']
    ex = _jout(_cli(['explain', rid, '--db', str(db)]))
    assert ex['status'] == 'awaiting_approval'
    assert any('adjuster authority' in w for w in ex['explanation']), \
        ex['explanation']


def test_verify_and_doctor_catch_tamper(tmp_path):
    db = tmp_path / 'b.db'
    log = tmp_path / 'b.log'
    _run_wait(db, log, tmp_path)
    conn = sqlite3.connect(str(db))
    # WRITE-ONCE LAW: refused at the wall; drop the trigger to reach the
    # chain-verification layer this test exists to prove.
    try:
        conn.execute("UPDATE journal_events SET payload = '{}' WHERE seq = 2")
        conn.commit()
        raise AssertionError('the wall did not refuse journal tampering')
    except sqlite3.IntegrityError as e:
        assert 'WRITE-ONCE LAW' in str(e)
    conn.execute("DROP TRIGGER write_once_journal_events_update")
    conn.execute("UPDATE journal_events SET payload = '{}' WHERE seq = 2")
    conn.commit()
    conn.close()
    r_bad = _cli(['verify', '--db', str(db)], ok=False)
    assert r_bad.returncode == 1
    assert '"broken": [' in r_bad.stdout
    r_doc = _cli(['doctor', '--db', str(db)], ok=False)
    assert r_doc.returncode == 1
    assert 'NEEDS CARE' in r_doc.stdout
