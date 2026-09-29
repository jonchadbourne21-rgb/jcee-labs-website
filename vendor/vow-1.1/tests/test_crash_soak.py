"""Arc 3C — exhaustive crash-boundary soak + the sweeper
(docs/DURABILITY.md §6).

Kill-by-journal-count: with VOW_KILL_AFTER=K the journal sink dies
(os._exit(9), no cleanup) the moment the write after committed event #K
is attempted — a deterministic kill -9 at exactly that boundary. A run
with N journal events has N boundaries: after each event 1..N-1, and
after run_end (journal complete, registry not yet updated — the resume
path repairs that one from the chain instead of re-executing).

This suite kills at EVERY boundary and resumes every corpse, asserting:
the kill leaves exactly events 1..K committed; resume reaches success
under the same run_id; the final chain verifies; every effect produced
exactly one effect_result (the boundary effect may re-execute once under
the crash-window rule, honestly marked); and the registry ends 'success'.

Then the sweeper: `vow sweep` resumes due suspended runs in one call,
never auto-grants approvals, only touches crashed runs under --crashed
(repairing registry-only corpses), and skips moved sources loudly.
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

SOAK_QUEST = '''quest Soak {
  goal "three durable appends"
  capability shell
  let a = shell_exec("echo one >> %(log)s")
  let b = shell_exec("echo two >> %(log)s")
  let c = shell_exec("echo three >> %(log)s")
  prove true
  success when true
}
'''

LINES = ['one', 'two', 'three']


def _run(args, ok=True, env_extra=None):
    env = dict(ENV)
    if env_extra:
        env.update(env_extra)
    r = subprocess.run([sys.executable, 'vow_cli.py'] + args,
                       capture_output=True, text=True, cwd=PROJ, env=env)
    if ok:
        assert r.returncode == 0, (r.stdout + r.stderr)[-600:]
    return r


def _write(base, name, text):
    path = os.path.join(base, name)
    with open(path, 'w') as fh:
        fh.write(text)
    return path


def _db_rows(db, sql, args=()):
    conn = sqlite3.connect(db)
    try:
        return conn.execute(sql, args).fetchall()
    finally:
        conn.close()


def _age_heartbeat(db, run_id):
    """Owed 4 staging: mature the crash evidence — heartbeat_at is a
    MUTABLE registry field (deliberately outside the identity hash), so
    aging it is signature-safe. We stage evidence; we never forge it."""
    conn = sqlite3.connect(db)
    try:
        conn.execute("UPDATE runs SET heartbeat_at = '2000-01-01 00:00:00'"
                     " WHERE run_id = ?", (run_id,))
        conn.commit()
    finally:
        conn.close()


def _journal(db, run_id):
    rows = _db_rows(
        db, "SELECT seq, kind, payload FROM journal_events"
            " WHERE run_id = ? ORDER BY seq", (run_id,))
    return [{'seq': s, 'kind': k, 'payload': json.loads(p)}
            for s, k, p in rows]


def _registry_status(db, run_id):
    return _db_rows(db, "SELECT status FROM runs WHERE run_id = ?",
                    (run_id,))[0][0]


def _fresh_soak(base, tag):
    """A fresh database + log + quest for one soak iteration."""
    db = os.path.join(base, 'soak_%s.db' % tag)
    log = os.path.join(base, 'log_%s.txt' % tag)
    quest = _write(base, 'soak_%s.vow' % tag, SOAK_QUEST % {'log': log})
    return db, log, quest


def _read_log(log):
    if not os.path.exists(log):
        return []
    with open(log) as fh:
        return fh.read().splitlines()


def test_soak_every_boundary(tmp_path):
    base = str(tmp_path)

    # Baseline: one clean live run to learn N (the event count) and the
    # exact seqs of the effect intents.
    db, log, quest = _fresh_soak(base, 'base')
    r = _run(['run', quest, '--db', db, '--live'])
    run_id = json.loads(r.stdout)['run_id']
    events = _journal(db, run_id)
    total = len(events)
    intent_seqs = [e['seq'] for e in events
                   if e['kind'] == 'effect_intent']
    assert total >= 4  # run_begin, >=1 effect pair, run_end
    assert events[-1]['kind'] == 'run_end'
    assert _read_log(log) == LINES

    for kill_at in range(1, total + 1):
        db, log, quest = _fresh_soak(base, 'k%d' % kill_at)

        # --- die at the boundary -------------------------------------
        r = _run(['run', quest, '--db', db, '--live'], ok=False,
                 env_extra={'VOW_KILL_AFTER': str(kill_at)})
        assert r.returncode == 9, (
            'K=%d: os._exit(9) expected, got %d — %s'
            % (kill_at, r.returncode, (r.stdout + r.stderr)[-300:]))
        run_id = _db_rows(db, "SELECT run_id FROM runs")[0][0]
        assert _registry_status(db, run_id) == 'running'
        killed = _journal(db, run_id)
        assert [e['seq'] for e in killed] == list(range(1, kill_at + 1)), \
            'K=%d: exactly events 1..K must be committed' % kill_at

        # --- resume the corpse ---------------------------------------
        r = _run(['run', quest, '--db', db, '--live', '--resume', run_id])
        out = json.loads(r.stdout)
        final = _journal(db, run_id)
        kinds = [e['kind'] for e in final]
        results = kinds.count('effect_result')
        intents = kinds.count('effect_intent')

        if kill_at == total:
            # boundary N: chain complete, registry not — repaired, and
            # NOTHING re-executed
            assert out.get('repaired') is True
            assert out['status'] == 'success'
            assert _read_log(log) == LINES
            assert intents == 3 and results == 3
        else:
            assert out['status'] == 'success', r.stdout[-300:]
            assert out['run_id'] == run_id
            assert _registry_status(db, run_id) == 'success'
            # exactly-once at the outcome level: one result per effect
            assert results == 3, 'K=%d: %s' % (kill_at, kinds)
            if kill_at in intent_seqs:
                # crash window: the boundary effect's intent was
                # committed, its result was not — re-executed once,
                # orphan intent kept as evidence, honestly marked
                assert intents == 4
                which = intent_seqs.index(kill_at)
                got = sorted(_read_log(log))
                want = sorted(LINES + [LINES[which]])
                assert got == want, 'K=%d: %s' % (kill_at, got)
                notes = [e['payload'].get('note', '') for e in final
                         if e['kind'] == 'replay_end']
                assert any('crash window' in n for n in notes)
            else:
                assert intents == 3
                assert _read_log(log) == LINES
            assert final[-1]['kind'] == 'run_end'
            assert final[-1]['payload']['unconsumed_events'] == 0

        # every corpse's final chain verifies
        j = json.loads(_run(['journal', run_id, '--db', db]).stdout)
        assert j['chain_intact'] is True, 'K=%d' % kill_at
        assert j['run']['status'] == 'success'


def test_sweep_resumes_due_wait_run(tmp_path):
    base = str(tmp_path)
    db = os.path.join(base, 'sweep.db')
    log = os.path.join(base, 'sweep_log.txt')
    wake = int(time.time()) + 2
    quest = _write(base, 'sweepme.vow', '''quest SweepMe {
  goal "park, then finish"
  capability shell
  let before = shell_exec("echo before >> %s")
  wait until %d
  let after = shell_exec("echo after >> %s")
  prove true
  success when true
}
''' % (log, wake, log))

    r = _run(['run', quest, '--db', db, '--live'])
    out = json.loads(r.stdout)
    assert out['status'] == 'suspended'
    run_id = out['run_id']
    assert _read_log(log) == ['before']

    time.sleep(2.5)  # let the wake time pass
    r = _run(['sweep', '--db', db])
    summary = json.loads(r.stdout)
    # Owed 4 re-litigation: the counts report gained reconciled /
    # refused_live keys (heartbeat evidence); assert the full new shape
    assert summary['counts'] == {'resumed': 1, 'failed': 0, 'skipped': 0,
                                 'claimed': 0, 'awaiting_approval': 0,
                                 'reconciled': 0, 'refused_live': 0}
    swept = summary['swept'][0]
    assert swept['run_id'] == run_id
    assert swept['outcome'] == 'resumed'
    assert swept['status'] == 'success'
    assert _registry_status(db, run_id) == 'success'
    assert _read_log(log) == ['before', 'after']  # 'before' exactly once

    # nothing left due: a second sweep is a no-op
    summary = json.loads(_run(['sweep', '--db', db]).stdout)
    assert summary['counts']['resumed'] == 0
    assert summary['swept'] == []


def test_sweep_never_auto_approves(tmp_path):
    base = str(tmp_path)
    db = os.path.join(base, 'appr.db')
    target = os.path.join(base, 'settlement.txt')
    quest = _write(base, 'appr.vow', '''quest Approve {
  goal "needs a human"
  capability file_write
  let filed = file_write("%s", "settlement draft")
  await approval "settlement exceeds adjuster authority"
  prove true
  success when true
}
''' % target)

    r = _run(['run', quest, '--db', db, '--live'])
    out = json.loads(r.stdout)
    assert out['status'] == 'awaiting_approval'
    run_id = out['run_id']

    r = _run(['sweep', '--db', db])
    summary = json.loads(r.stdout)
    assert summary['swept'] == []  # untouched
    assert summary['counts']['awaiting_approval'] == 1
    assert summary['awaiting_approval'][0]['run_id'] == run_id
    assert 'vow approve' in summary['awaiting_approval'][0]['resume']
    assert _registry_status(db, run_id) == 'awaiting_approval'

    # the listed path works: a human grants, the run completes
    r = _run(['approve', run_id, quest, '--db', db,
              '--approver', 'supervisor-lee', '--note', 'within limits'])
    assert json.loads(r.stdout)['status'] == 'success'
    assert _registry_status(db, run_id) == 'success'


def test_sweep_crashed_flag_and_repair(tmp_path):
    base = str(tmp_path)

    # a mid-quest corpse (kill after event 3: first effect fully done)
    db, log, quest = _fresh_soak(base, 'crash')
    r = _run(['run', quest, '--db', db, '--live'], ok=False,
             env_extra={'VOW_KILL_AFTER': '3'})
    assert r.returncode == 9
    crashed_id = _db_rows(db, "SELECT run_id FROM runs")[0][0]

    # Owed 4 re-litigation: a fresh corpse's heartbeat is still FRESH,
    # so plain sweep leaves it alone (the beat has not gone stale yet)
    summary = json.loads(_run(['sweep', '--db', db]).stdout)
    assert summary['swept'] == []
    assert _registry_status(db, crashed_id) == 'running'

    # the evidence matures (the beat ages past the staleness line):
    # now PLAIN sweep reconciles by evidence and resumes — no operator
    # flag, no guess
    _age_heartbeat(db, crashed_id)
    summary = json.loads(_run(['sweep', '--db', db]).stdout)
    assert summary['counts']['reconciled'] == 1
    assert summary['counts']['resumed'] == 1
    assert summary['swept'][0]['outcome'] == 'resumed'
    assert _registry_status(db, crashed_id) == 'success'
    assert _read_log(log) == LINES

    # a registry-only corpse (kill at boundary N) is repaired, not run
    db2, log2, quest2 = _fresh_soak(base, 'repair')
    _run(['run', quest2, '--db', db2, '--live'])  # baseline to learn N
    base_id = _db_rows(db2, "SELECT run_id FROM runs")[0][0]
    total = _db_rows(db2, "SELECT MAX(seq) FROM journal_events"
                          " WHERE run_id = ?", (base_id,))[0][0]

    db3, log3, quest3 = _fresh_soak(base, 'repairk')
    r = _run(['run', quest3, '--db', db3, '--live'], ok=False,
             env_extra={'VOW_KILL_AFTER': str(total)})
    assert r.returncode == 9
    corpse_id = _db_rows(db3, "SELECT run_id FROM runs")[0][0]
    assert _registry_status(db3, corpse_id) == 'running'  # the gap

    # Owed 4 re-litigation: same evidence path — age the beat, plain
    # sweep reconciles, and the journal-complete corpse is REPAIRED,
    # not re-executed
    _age_heartbeat(db3, corpse_id)
    summary = json.loads(
        _run(['sweep', '--db', db3]).stdout)
    swept = summary['swept'][0]
    assert summary['counts']['reconciled'] == 1
    assert swept['outcome'] == 'resumed'
    assert swept['repaired'] is True
    assert _registry_status(db3, corpse_id) == 'success'
    assert _read_log(log3) == LINES  # nothing re-executed


def test_sweep_skips_moved_source_loudly(tmp_path):
    base = str(tmp_path)
    db = os.path.join(base, 'moved.db')
    wake = int(time.time()) - 5  # already due
    quest = _write(base, 'gone.vow', '''quest Gone {
  goal "parked, then its file moved"
  wait until %d
  prove true
  success when true
}
''' % wake)
    r = _run(['run', quest, '--db', db, '--live'])
    run_id = json.loads(r.stdout)['run_id']
    os.remove(quest)

    r = _run(['sweep', '--db', db], ok=False)
    assert r.returncode == 1
    summary = json.loads(r.stdout)
    swept = summary['swept'][0]
    assert swept['outcome'] == 'skipped'
    assert run_id in swept['reason']  # the manual resume hint
    assert _registry_status(db, run_id) == 'suspended'  # not dropped
