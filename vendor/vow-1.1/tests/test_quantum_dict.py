"""Tests for the Quantum Dict (per-strategy state instrumentation).

Strategies receive isolated env copies, so cross-strategy entanglement
cannot occur by construction — the Quantum Dict is the sensor that PROVES
it every run: per-strategy read/write footprints, a shared_reference
whisper for mutable values every strategy shares, and entangled_refs
marking on failures that occur in the presence of shared mutable state.
"""
import ast
import json
import os
import subprocess
import sys
import tempfile

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}
sys.path.insert(0, PROJ)

from vow.vow_transpiler import (SHADOW_RUNTIME_PREAMBLE,  # noqa: E402
                                VowSuccessLog, VowScarMemory,
                                VowProofFailure)


def _base(tmp_path):
    return str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_qd_')


def _run(db, src='examples/quantum_dict.vow'):
    r = subprocess.run([sys.executable, 'vow_cli.py', 'run', src,
                        '--db', db],
                       capture_output=True, text=True, cwd=PROJ, env=ENV)
    assert r.returncode == 0, r.stderr[-600:]
    return json.loads(r.stdout)


def test_shared_reference_whisper_and_footprints(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        t = _run(db)
        fin = ast.literal_eval(t['final_result'])
        kinds = [w['kind'] for w in fin['whispers']]
        assert kinds == ['shared_reference'], kinds
        assert fin['whispers'][0]['detail']['keys'] == ['counts']
        by_name = {m['strategy']: m for m in fin['tournament']}
        # every strategy's footprint is logged under its own name
        assert by_name['careful_sum']['footprint']['writes'] == ['total']
        assert 'target' in by_name['careful_sum']['footprint']['reads']
        assert by_name['sloppy_sum']['footprint']['writes'] == ['total']
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_entangled_refs_marked_on_failure(tmp_path=None):
    """A proof failure in the presence of shared mutable state carries the
    entanglement marker — the autopsy kind stays primary."""
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        t = _run(db)
        scars = [s for s in t['db_scars']
                 if (s.get('context') or {}).get('strategy') == 'sloppy_sum']
        assert scars, t['db_scars']
        reason = scars[0]['context']['reason']
        assert reason['kind'] == 'equality_mismatch'  # autopsy stays primary
        assert reason['entangled_refs'] == ['counts']
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_no_mutables_no_whisper(tmp_path=None):
    """Control: quests without mutable beliefs get no shared_reference
    whisper and no entangled marking."""
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        t = _run(db, src='examples/tournament_mixed.vow')
        fin = ast.literal_eval(t['final_result'])
        assert not any(w['kind'] == 'shared_reference'
                       for w in fin['whispers'])
        for s in t.get('db_scars', []):
            reason = (s.get('context') or {}).get('reason') or {}
            assert 'entangled_refs' not in reason
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_quantum_dict_logs_reads_and_writes_unit():
    """Unit pin: the instrumented dict itself records (op, owner, key)."""
    ns = {'VowProofFailure': VowProofFailure,
          'VowScarMemory': VowScarMemory,
          'VowSuccessLog': VowSuccessLog}
    exec(SHADOW_RUNTIME_PREAMBLE, ns)
    ns['_vow_quest_begin']('QUnit')
    qd = ns['_VowQuantumDict']({'batch': 100}, _owner='s1')
    qd['result'] = qd['batch'] * 2
    _ = qd['result']
    log = ns['_vow_state_log']
    assert ('w', 's1', 'result') in log
    assert ('r', 's1', 'batch') in log
    assert ('r', 's1', 'result') in log
    # plain dict behavior is preserved (it IS a dict)
    assert isinstance(qd, dict) and qd['result'] == 200
