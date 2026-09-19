# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""Arc 3D — the atomic claim, multi-run hardening (docs/DURABILITY.md §7).

The double-resume race is closed by one atomic UPDATE: exactly one
executor claims a run; everyone else loses loudly. Proven here on the
SQLite store (the same guard runs on Postgres, covered in
test_postgres_journal.py):

- a crashed run claimed by another process refuses resume, naming why
- a stale claim (older than the stale window) is reclaimed — a crashed
  resumer never wedges a run
- a claim held by the SAME token re-claims cleanly (the approve→resume
  handoff)
- an approval claimed externally refuses both `vow approve` and `vow deny`
- `vow sweep` reports claim-loss as outcome 'claimed' and keeps exit 0
"""
import json
import os
import sqlite3
import subprocess
import sys
import time

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = {k: v for k, v in os.environ.items()
       if k not in ('PYTHONPATH', 'VOW_KILL_AFTER')}

QUEST = '''quest C {
  goal "g"
  capability shell
  let a = shell_exec("echo one >> %(log)s")
  let b = shell_exec("echo two >> %(log)s")
  prove true
  success when true
}
'''


def _run(args, ok=True, env_extra=None):
    env = dict(ENV)
    if env_extra:
        env.update(env_extra)
    r = subprocess.run([sys.executable, 'vow_cli.py'] + args,
                       capture_output=True, text=True, cwd=PROJ, env=env)
    if ok:
        assert r.returncode == 0, (r.stdout + r.stderr)[-600:]
    return r


def _mk(base, name='c'):
    db = os.path.join(base, '%s.db' % name)
    log = os.path.join(base, '%s.txt' % name)
    quest = os.path.join(base, '%s.vow' % name)
    with open(quest, 'w') as fh:
        fh.write(QUEST % {'log': log})
    return db, log, quest


def _crash(db, quest, kill='3'):
    r = _run(['run', quest, '--db', db, '--live'], ok=False,
             env_extra={'VOW_KILL_AFTER': kill})
    assert r.returncode == 9
    return sqlite3.connect(db).execute(
        "SELECT run_id FROM runs").fetchone()[0]


def _sql(db, sql, args=()):
    conn = sqlite3.connect(db)
    try:
        conn.execute(sql, args)
        conn.commit()
    finally:
        conn.close()


def test_claimed_run_refuses_resume(tmp_path):
    base = str(tmp_path)
    db, log, quest = _mk(base)
    rid = _crash(db, quest)
    _sql(db, "UPDATE runs SET claimed_by = 'other-proc',"
             " claimed_at = datetime('now') WHERE run_id = ?", (rid,))
    r = _run(['run', quest, '--db', db, '--live', '--resume', rid],
             ok=False)
    assert r.returncode == 1
    err = r.stdout + r.stderr
    assert 'claimed by another process' in err
    assert 'already in flight' in err
    # nothing executed: the log holds only the pre-crash line
    with open(log) as fh:
        assert fh.read().splitlines() == ['one']


def test_stale_claim_is_reclaimed(tmp_path):
    base = str(tmp_path)
    db, log, quest = _mk(base)
    rid = _crash(db, quest)
    # a claim from two hours ago: the resumer that held it is presumed dead
    _sql(db, "UPDATE runs SET claimed_by = 'dead-proc',"
             " claimed_at = datetime('now', '-2 hours')"
             " WHERE run_id = ?", (rid,))
    r = _run(['run', quest, '--db', db, '--live', '--resume', rid])
    assert json.loads(r.stdout)['status'] == 'success'
    with open(log) as fh:
        assert fh.read().splitlines() == ['one', 'two']
    # and finishing released the claim
    row = sqlite3.connect(db).execute(
        "SELECT claimed_by, status FROM runs WHERE run_id = ?",
        (rid,)).fetchone()
    assert row == (None, 'success')


def test_same_token_reclaims_and_wrong_status_refused():
    """API level: same-token re-claim succeeds (approve handoff); claiming
    a completed run fails; a second token on a fresh claim fails."""
    from vow.database import SqliteDatabase
    db = SqliteDatabase(':memory:')
    db.create_run('r1', 'Q', 's', 'e')
    assert db.claim_run('r1', 'tok-A') is True
    assert db.claim_run('r1', 'tok-A') is True    # same token: re-claim
    assert db.claim_run('r1', 'tok-B') is False   # other token: refused
    assert db.claim_run('r1', 'tok-B',
                        stale_minutes=0) is True  # stale=0: reclaimable
    db.finish_run('r1', 'success', 'hh', 1)
    assert db.claim_run('r1', 'tok-C') is False   # terminal: not claimable
    # approve-style claim from awaiting_approval only
    db.create_run('r2', 'Q', 's', 'e')
    assert db.claim_run('r2', 'tok',
                        from_statuses=('awaiting_approval',)) is False
    db.suspend_run('r2', 'awaiting_approval', None, 'hh', 1)
    assert db.claim_run('r2', 'tok',
                        from_statuses=('awaiting_approval',)) is True
    db.close()


def test_approval_claimed_externally_refuses_decide(tmp_path):
    base = str(tmp_path)
    db = os.path.join(base, 'a.db')
    quest = os.path.join(base, 'a.vow')
    with open(quest, 'w') as fh:
        fh.write('quest A {\n  goal "g"\n'
                 '  await approval "sign-off"\n'
                 '  prove true\n  success when true\n}\n')
    rid = json.loads(_run(['run', quest, '--db', db, '--live'])
                     .stdout)['run_id']
    _sql(db, "UPDATE runs SET claimed_by = 'other-approver',"
             " claimed_at = datetime('now') WHERE run_id = ?", (rid,))
    r = _run(['approve', rid, quest, '--db', db, '--approver', 'x'],
             ok=False)
    assert r.returncode == 1
    assert 'being decided by another process' in r.stdout + r.stderr
    r = _run(['deny', rid, '--db', db, '--approver', 'x'], ok=False)
    assert r.returncode == 1
    assert 'being decided by another process' in r.stdout + r.stderr
    # still awaiting: nobody's decision landed
    st = sqlite3.connect(db).execute(
        "SELECT status FROM runs WHERE run_id = ?", (rid,)).fetchone()[0]
    assert st == 'awaiting_approval'


def test_sweep_reports_claim_loss_without_failing(tmp_path):
    base = str(tmp_path)
    db = os.path.join(base, 's.db')
    quest = os.path.join(base, 'w.vow')
    with open(quest, 'w') as fh:
        fh.write('quest W {\n  goal "g"\n'
                 '  wait until "2020-01-01T00:00:00"\n'
                 '  prove true\n  success when true\n}\n')
    rid = json.loads(_run(['run', quest, '--db', db, '--live'])
                     .stdout)['run_id']
    # another executor holds the claim on this due run
    _sql(db, "UPDATE runs SET claimed_by = 'busy-sweeper',"
             " claimed_at = datetime('now') WHERE run_id = ?", (rid,))
    r = _run(['sweep', '--db', db])  # exit 0 despite the claim loss
    summary = json.loads(r.stdout)
    assert summary['counts']['claimed'] == 1
    assert summary['counts']['failed'] == 0
    assert summary['swept'][0]['outcome'] == 'claimed'
    st = sqlite3.connect(db).execute(
        "SELECT status FROM runs WHERE run_id = ?", (rid,)).fetchone()[0]
    assert st == 'suspended'  # left for the rightful owner
