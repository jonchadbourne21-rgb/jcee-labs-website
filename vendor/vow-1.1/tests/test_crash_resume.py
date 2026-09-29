"""End-to-end crash durability (Arc 3A, docs/DURABILITY.md).

The contract under test: kill -9 a live journaled run mid-quest, resume
it, and the logical run finishes exactly as if the crash never happened —
journaled effects execute exactly once, the crash window re-executes at
most one effect, and every refusal path (completed run, changed source,
changed engine, corrupt chain) fails loudly before any execution.
"""
import json
import os
import sqlite3
import subprocess
import sys
import tempfile
import time

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}

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


def _write_quest(base, log):
    path = os.path.join(base, 'crashable.vow')
    with open(path, 'w') as fh:
        fh.write(CRASHABLE % {'log': log})
    return path


def _run(args, ok=True):
    r = subprocess.run([sys.executable, 'vow_cli.py'] + args,
                       capture_output=True, text=True, cwd=PROJ, env=ENV)
    if ok:
        assert r.returncode == 0, (r.stdout + r.stderr)[-600:]
    return r


def _crash_mid_quest(base):
    """Start a live journaled run, kill -9 it inside the sleep window.
    Returns (db, quest_path, log, run_id)."""
    db = os.path.join(base, 'mem.db')
    log = os.path.join(base, 'crash_log.txt')
    quest = _write_quest(base, log)
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
    r = _run(['runs', '--db', db])
    row = json.loads(r.stdout)[0]
    assert row['status'] == 'running'  # crashed: no run_end
    return db, quest, log, row['run_id']


def test_kill9_resume_exactly_once(tmp_path):
    base = str(tmp_path)
    db, quest, log, run_id = _crash_mid_quest(base)
    with open(log) as fh:
        assert fh.read().splitlines() == ['one']

    r = _run(['run', quest, '--db', db, '--live', '--resume', run_id])
    trace = json.loads(r.stdout)
    assert trace['status'] == 'success', r.stdout[-400:]
    assert trace['run_id'] == run_id  # the SAME logical run

    # exactly-once: every journaled effect landed precisely one line
    with open(log) as fh:
        assert fh.read().splitlines() == ['one', 'two', 'three']

    # the journal tells the whole story, chain intact
    j = json.loads(_run(['journal', run_id, '--db', db]).stdout)
    assert j['chain_intact'] is True
    assert j['run']['status'] == 'success'
    kinds = [e['kind'] for e in j['events']]
    assert kinds[0] == 'run_begin' and 'resume_begin' in kinds
    assert kinds[-1] == 'run_end'
    # the crash window is marked: sleep was re-executed, honestly noted
    notes = [e['payload'].get('note', '') for e in j['events']
             if e['kind'] == 'replay_end']
    assert any('crash window' in n for n in notes)
    # faithful replay: nothing recorded was left unconsumed
    assert j['events'][-1]['payload']['unconsumed_events'] == 0
    # one run, one trace row
    n = sqlite3.connect(db).execute(
        "SELECT COUNT(*) FROM traces WHERE run_id = ?",
        (run_id,)).fetchone()[0]
    assert n == 1


def test_resume_completed_run_refused(tmp_path):
    base = str(tmp_path)
    db = os.path.join(base, 'mem.db')
    quest = os.path.join(base, 'ok.vow')
    with open(quest, 'w') as fh:
        fh.write('quest Q {\n  goal "g"\n  prove true\n'
                 '  success when true\n}\n')
    r = _run(['run', quest, '--db', db])
    run_id = json.loads(r.stdout)['run_id']
    r2 = _run(['run', quest, '--db', db, '--resume', run_id], ok=False)
    err = r2.stdout + r2.stderr
    assert r2.returncode == 1
    assert 'not resumable' in err
    assert 'success' in err


def test_resume_source_tampered_refused(tmp_path):
    base = str(tmp_path)
    db, quest, log, run_id = _crash_mid_quest(base)
    conn = sqlite3.connect(db)
    conn.execute("UPDATE runs SET source_sha256 = 'bogus' WHERE run_id = ?",
                 (run_id,))
    conn.commit(); conn.close()
    r = _run(['run', quest, '--db', db, '--resume', run_id], ok=False)
    assert r.returncode == 1 and 'source changed' in r.stdout + r.stderr


def test_resume_engine_tampered_refused(tmp_path):
    base = str(tmp_path)
    db, quest, log, run_id = _crash_mid_quest(base)
    conn = sqlite3.connect(db)
    conn.execute("UPDATE runs SET engine_sha256 = 'bogus' WHERE run_id = ?",
                 (run_id,))
    conn.commit(); conn.close()
    r = _run(['run', quest, '--db', db, '--resume', run_id], ok=False)
    assert r.returncode == 1 and 'engine changed' in r.stdout + r.stderr


def test_resume_corrupt_chain_refused(tmp_path):
    base = str(tmp_path)
    db, quest, log, run_id = _crash_mid_quest(base)
    conn = sqlite3.connect(db)
    # WRITE-ONCE LAW: tampering without dropping the wall is refused
    try:
        conn.execute("UPDATE journal_events SET payload = '{}' WHERE seq = 2")
        conn.commit()
        raise AssertionError('the wall did not refuse journal tampering')
    except sqlite3.IntegrityError as e:
        assert 'WRITE-ONCE LAW' in str(e)
    # a determined attacker drops the trigger — the chain must still catch
    conn.execute("DROP TRIGGER write_once_journal_events_update")
    conn.execute("UPDATE journal_events SET payload = '{}' WHERE seq = 2")
    conn.commit(); conn.close()
    r = _run(['run', quest, '--db', db, '--resume', run_id], ok=False)
    assert r.returncode == 1 and 'journal corrupt' in r.stdout + r.stderr
    # and nothing executed: the log still holds only the pre-crash line
    with open(log) as fh:
        assert fh.read().splitlines() == ['one']


def test_runs_and_journal_cli(tmp_path):
    base = str(tmp_path)
    db = os.path.join(base, 'mem.db')
    quest = os.path.join(base, 'ok.vow')
    with open(quest, 'w') as fh:
        fh.write('quest Q {\n  goal "g"\n  prove true\n'
                 '  success when true\n}\n')
    r = _run(['run', quest, '--db', db])
    run_id = json.loads(r.stdout)['run_id']
    rows = json.loads(_run(['runs', '--db', db]).stdout)
    assert rows[0]['run_id'] == run_id and rows[0]['status'] == 'success'
    j = _run(['journal', run_id, '--db', db])
    out = json.loads(j.stdout)
    assert out['chain_intact'] is True and out['events']
    r2 = _run(['journal', 'no_such_run', '--db', db], ok=False)
    assert r2.returncode == 1 and 'no journal' in r2.stdout + r2.stderr


def test_dry_run_journals_shadows_and_no_journal_flag(tmp_path):
    base = str(tmp_path)
    db = os.path.join(base, 'mem.db')
    target = os.path.join(base, 'never_written.txt')
    quest = os.path.join(base, 'dry.vow')
    with open(quest, 'w') as fh:
        fh.write('quest Q {\n  goal "g"\n  capability file_write\n'
                 '  let x = file_write("%s", "hi")\n'
                 '  prove true\n  success when true\n}\n' % target)
    r = _run(['run', quest, '--db', db])  # dry-run: shadow only
    run_id = json.loads(r.stdout)['run_id']
    assert not os.path.exists(target)
    j = json.loads(_run(['journal', run_id, '--db', db]).stdout)
    outcomes = [e['payload'].get('outcome') for e in j['events']
                if e['kind'] == 'effect_result']
    assert outcomes == ['shadow']

    # --no-journal opts out cleanly
    db2 = os.path.join(base, 'mem2.db')
    _run(['run', quest, '--db', db2, '--no-journal'])
    assert json.loads(_run(['runs', '--db', db2]).stdout) == []
