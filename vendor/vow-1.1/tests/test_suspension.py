"""Arc 3B suspension (docs/DURABILITY.md §5): `wait until` and
`await approval` — a journaled run parks, exits, and resumes exactly
where it stopped; human decisions land inside the run's own hash chain.

Covers: parser/AST/emission (contextual syntax), journal mechanics
(wait_enter/wait_done, approval_request/granted), dry-run shadowing,
and the full e2e lifecycles (suspend → refuse → resume; approve; deny).
"""
import json
import os
import sqlite3
import subprocess
import sys

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJ)
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}

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
    pytest = _Shim()  # noqa: E402

from vow.database import SqliteDatabase  # noqa: E402
from vow.vow_parser import VowAdvancedParser  # noqa: E402
from vow.vow_transpiler import (JournalRuntime, VowJournalMismatch,  # noqa: E402
                                VowTranspiler)

WAIT_SRC = '''quest W {
  goal "g"
  wait until "2030-01-01T00:00:00"
  prove true
  success when true
}
'''

APPROVAL_SRC = '''quest A {
  goal "g"
  capability file_write
  let d = file_write("%s", "draft")
  await approval "supervisor sign-off"
  prove true
  success when true
}
'''


def _write(tmp_path, name, src):
    p = tmp_path / name
    p.write_text(src)
    return str(p)


def _cli(args, ok=True):
    r = subprocess.run([sys.executable, 'vow_cli.py'] + args,
                       capture_output=True, text=True, cwd=PROJ, env=ENV)
    if ok:
        assert r.returncode == 0, (r.stdout + r.stderr)[-600:]
    return r


def _payload(r):
    return json.loads(r.stdout[r.stdout.index('{'):])


# --- syntax (units) ------------------------------------------------------------

def test_wait_parses_as_contextual_syntax():
    prog = VowAdvancedParser(WAIT_SRC).parse_program()
    waits = [i for i in prog.quests[0].items
             if i.__class__.__name__ == 'WaitStmt']
    assert len(waits) == 1
    # and 'wait' stays usable as an ordinary identifier elsewhere
    src2 = 'quest Q {\n  goal "g"\n  let wait = 5\n  prove wait == 5\n' \
           '  success when true\n}\n'
    prog2 = VowAdvancedParser(src2).parse_program()
    assert prog2.quests[0].items[1].__class__.__name__ == 'Let'


def test_await_parses_and_requires_string_reason():
    prog = VowAdvancedParser(APPROVAL_SRC % 'x').parse_program()
    awaits = [i for i in prog.quests[0].items
              if i.__class__.__name__ == 'AwaitStmt']
    assert len(awaits) == 1 and awaits[0].reason == 'supervisor sign-off'
    with pytest.raises(Exception, match='string reason'):
        VowAdvancedParser(
            'quest Q {\n  goal "g"\n  await approval 42\n'
            '  prove true\n  success when true\n}\n').parse_program()


def test_transpiler_emits_runtime_calls():
    code = VowTranspiler().transpile(
        VowAdvancedParser(WAIT_SRC).parse_program())
    assert "_vow_wait_until('2030-01-01T00:00:00')" in code
    code2 = VowTranspiler().transpile(
        VowAdvancedParser(APPROVAL_SRC % 'x').parse_program())
    assert "_vow_await_approval('supervisor sign-off')" in code2


# --- journal mechanics (units) ---------------------------------------------------

def _journal(tmp_path, events=None, mode='live', name='m.db'):
    db = SqliteDatabase(str(tmp_path / name))
    j = JournalRuntime(db, 'run1', mode=mode, events=events)
    db.journal = j
    return db, j


def test_wait_enter_live_and_replay_done(tmp_path):
    db, j = _journal(tmp_path)
    assert j.wait_enter('2030-01-01T00:00:00') == 'suspend'
    events = db.load_journal('run1')
    db2, j2 = _journal(tmp_path, events=events, mode='replay', name='m2.db')
    assert j2.wait_enter('2030-01-01T00:00:00') == 'done'
    tail = db2.load_journal('run1')[-1]
    assert tail['kind'] == 'wait_done'
    assert tail['payload']['wake_at'] == '2030-01-01T00:00:00'
    assert 'resumed_at' in tail['payload']


def test_wait_replay_mismatch_refuses(tmp_path):
    db, j = _journal(tmp_path)
    j.wait_enter('2030-01-01T00:00:00')
    _, j2 = _journal(tmp_path, events=db.load_journal('run1'),
                     mode='replay', name='m2.db')
    with pytest.raises(VowJournalMismatch, match='wait diverged'):
        j2.wait_enter('2031-01-01T00:00:00')


def test_approval_request_replay_requires_grant(tmp_path):
    db, j = _journal(tmp_path)
    assert j.approval_request('sign-off') == {'suspend': True}
    # journal ends after the request (no grant): replay suspends again
    _, j2 = _journal(tmp_path, events=db.load_journal('run1'),
                     mode='replay', name='m2.db')
    assert j2.approval_request('sign-off') == {'suspend_again': True}
    # with a grant appended: replay returns the decision
    j.append('approval_granted', {'approver': 'sam', 'note': 'ok',
                                  'at': '2026-01-01T00:00:00'})
    _, j3 = _journal(tmp_path, events=db.load_journal('run1'),
                     mode='replay', name='m3.db')
    grant = j3.approval_request('sign-off')
    assert grant['approver'] == 'sam'


def test_shadow_events_replay_as_shadows(tmp_path):
    db, j = _journal(tmp_path)
    assert j.wait_enter('2030-01-01T00:00:00', shadow=True) == 'shadow'
    assert j.approval_request('r', shadow=True) == {'shadow': True}
    _, j2 = _journal(tmp_path, events=db.load_journal('run1'),
                     mode='replay', name='m2.db')
    assert j2.wait_enter('2030-01-01T00:00:00') == 'shadow'
    assert j2.approval_request('r') == {'shadow': True}


# --- e2e lifecycles -----------------------------------------------------------------

def test_wait_lifecycle_e2e(tmp_path):
    db = str(tmp_path / 'm.db')
    quest = _write(tmp_path, 'w.vow', WAIT_SRC)
    # suspends on first encounter
    r = _cli(['run', quest, '--db', db, '--live'])
    out = _payload(r)
    assert out['status'] == 'suspended' and out['kind'] == 'wait'
    assert out['wake_at'] == '2030-01-01T00:00:00'
    run_id = out['run_id']
    # not due: plain resume refuses
    r2 = _cli(['run', quest, '--db', db, '--live', '--resume', run_id],
              ok=False)
    assert r2.returncode == 1
    assert 'not due yet' in r2.stdout + r2.stderr
    # force due: resume completes the SAME logical run
    conn = sqlite3.connect(db)
    conn.execute("UPDATE runs SET wake_at = '2020-01-01T00:00:00'"
                 " WHERE run_id = ?", (run_id,))
    conn.commit(); conn.close()
    r3 = _cli(['run', quest, '--db', db, '--live', '--resume', run_id])
    assert _payload(r3)['status'] == 'success'
    j = _payload(_cli(['journal', run_id, '--db', db]))
    assert j['chain_intact'] is True and j['run']['status'] == 'success'
    kinds = [e['kind'] for e in j['events']]
    assert 'wait_enter' in kinds and 'wait_done' in kinds


def test_approval_lifecycle_e2e(tmp_path):
    db = str(tmp_path / 'm.db')
    target = str(tmp_path / 'note.txt')
    quest = _write(tmp_path, 'a.vow', APPROVAL_SRC % target)
    r = _cli(['run', quest, '--db', db, '--live'])
    out = _payload(r)
    assert out['status'] == 'awaiting_approval'
    assert 'supervisor sign-off' in out['reason']
    run_id = out['run_id']
    assert os.path.exists(target)  # pre-suspension effects really happened
    # plain resume refuses with instructions
    r2 = _cli(['run', quest, '--db', db, '--live', '--resume', run_id],
              ok=False)
    assert r2.returncode == 1
    assert 'vow approve' in r2.stdout + r2.stderr
    # approve: grant journaled inside the chain, run completes
    r3 = _cli(['approve', run_id, quest, '--db', db,
               '--approver', 'j.doe', '--note', 'authority verified'])
    trace = _payload(r3)
    assert trace['status'] == 'success' and trace['run_id'] == run_id
    j = _payload(_cli(['journal', run_id, '--db', db]))
    assert j['chain_intact'] is True
    grants = [e['payload'] for e in j['events']
              if e['kind'] == 'approval_granted']
    assert grants and grants[0]['approver'] == 'j.doe'
    assert grants[0]['note'] == 'authority verified'
    # the grant is in the run's trace too (whispered at the await point)
    assert 'approval_granted' in r3.stdout


def test_deny_lifecycle_e2e(tmp_path):
    db = str(tmp_path / 'm.db')
    # TREE HYGIENE (2026-07-26): the effect target must be ABSOLUTE under
    # tmp_path — _cli runs with cwd=PROJ, so a relative 'n.txt' leaked a
    # junk file into the delivered tree (and into the delivery manifest).
    target = str(tmp_path / 'n.txt')
    quest = _write(tmp_path, 'a.vow', APPROVAL_SRC % target)
    run_id = _payload(_cli(['run', quest, '--db', db, '--live']))['run_id']
    assert os.path.exists(target)  # pre-suspension effect really landed
    r = _cli(['deny', run_id, '--db', db, '--approver', 'j.doe',
              '--note', 'insufficient documentation'])
    assert _payload(r)['status'] == 'denied'
    j = _payload(_cli(['journal', run_id, '--db', db]))
    assert j['chain_intact'] is True and j['run']['status'] == 'denied'
    kinds = [e['kind'] for e in j['events']]
    assert 'approval_request' in kinds and 'approval_denied' in kinds
    assert kinds[-1] == 'run_end'
    # a denied run is history: approve/deny/resume all refuse
    r2 = _cli(['deny', run_id, '--db', db], ok=False)
    assert r2.returncode == 1
    assert 'not awaiting approval' in r2.stdout + r2.stderr


def test_dry_run_shadows_and_due_listing(tmp_path):
    db = str(tmp_path / 'm.db')
    # ABSOLUTE target (tree hygiene) — and the assertion below finally
    # looks in the right room: pre-2026-07-26 it pointed at tmp_path
    # while a relative 'n2.txt' leaked into PROJ.
    target = str(tmp_path / 'n2.txt')
    quest = _write(tmp_path, 'a.vow', APPROVAL_SRC % target)
    # dry-run: shadows, quest completes, journal records the shadow
    r = _cli(['run', quest, '--db', db])
    assert _payload(r)['status'] == 'success'
    assert 'approval_shadow' in r.stdout
    run_id = _payload(r)['run_id']
    j = _payload(_cli(['journal', run_id, '--db', db]))
    reqs = [e['payload'] for e in j['events']
            if e['kind'] == 'approval_request']
    assert reqs and reqs[0]['shadow'] is True
    assert not os.path.exists(target)  # a dry run never touches the world
    # due listing: the approval-waiting run appears
    db2 = str(tmp_path / 'm2.db')
    rid2 = _payload(_cli(['run', quest, '--db', db2, '--live']))['run_id']
    assert os.path.exists(target)  # the live run's effect lands pre-park
    due = _payload(_cli(['due', '--db', db2]))
    assert any(d['run_id'] == rid2 and d['status'] == 'awaiting_approval'
               for d in due['due'])


def test_live_wait_without_journal_is_an_honest_error(tmp_path):
    quest = _write(tmp_path, 'w2.vow', WAIT_SRC)
    r = _cli(['run', quest, '--live'], ok=False)  # no --db → no journal
    assert r.returncode == 1
    assert 'wait requires a journaled run' in r.stdout + r.stderr


def test_wait_then_approval_third_life_replays_clean(tmp_path):
    """Regression (the gauntlet bug): a run that suspends TWICE — wait,
    then approval — is resumed THREE times. The third life's replay must
    CONSUME the wait_done an earlier life journaled, not duplicate it:
    re-appending left a stale event and the next _expect tripped
    (journal_mismatch: expected approval_request, found wait_done)."""
    import json
    import time
    db = str(tmp_path / 'g.db')
    log = str(tmp_path / 'g.txt')
    wake = int(time.time()) + 2
    quest = _write(tmp_path, 'g.vow', '''quest G {
  goal "wait, then a human"
  capability shell
  let filed = shell_exec("echo filed >> %s")
  wait until %d
  await approval "gauntlet authority check"
  let closed = shell_exec("echo closed >> %s")
  prove true
  success when true
}
''' % (log, wake, log))

    r = _cli(['run', quest, '--db', db, '--live'])
    assert _payload(r)['status'] == 'suspended'
    run_id = _payload(r)['run_id']
    time.sleep(2.5)
    # life 2 (sweep): crosses the wait, parks at the approval
    r = _cli(['sweep', '--db', db])
    assert _payload(r)['counts']['resumed'] == 1
    # life 3 (approve): replay crosses BOTH parked points
    r = _cli(['approve', run_id, quest, '--db', db,
              '--approver', 'trial-master'])
    assert _payload(r)['status'] == 'success', r.stdout[-300:]
    j = _payload(_cli(['journal', run_id, '--db', db]))
    assert j['chain_intact'] is True
    kinds = [e['kind'] for e in j['events']]
    assert kinds.count('wait_enter') == 1
    assert kinds.count('wait_done') == 1   # not duplicated by life 3
    assert 'approval_granted' in kinds
    with open(log) as fh:
        assert fh.read().splitlines() == ['filed', 'closed']
