"""Tests for the domain directive + Golden Path Memory (SOP domains).

Exploratory domains keep the classic scar-driven behavior. SOP domains let
success memory steer execution: a strategy with _VOW_GOLDEN_AFTER wins for
the exact situation runs alone, the field re-opens every
_VOW_CHALLENGE_EVERY golden wins, and scars always outrank golden.
"""
import ast
import json
import os
import sqlite3
import subprocess
import sys
import tempfile

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}
sys.path.insert(0, PROJ)

from vow.vow_parser import VowAdvancedParser, VowSyntaxError  # noqa: E402
from vow.vow_transpiler import (VowTranspiler, SHADOW_RUNTIME_PREAMBLE,  # noqa: E402
                                VowSuccessLog, VowScarMemory,
                                VowProofFailure)


# --- parser / transpiler surface ------------------------------------------

def test_domain_directive_parses():
    prog = VowAdvancedParser('domain "sop"\nquest Q {\n  goal "g"\n}'
                             ).parse_program()
    assert prog.domain == 'sop'


def test_domain_defaults_to_exploratory():
    prog = VowAdvancedParser('quest Q {\n  goal "g"\n}').parse_program()
    assert prog.domain == 'exploratory'


def test_domain_rejects_unknown_value():
    try:
        VowAdvancedParser('domain "wild"\nquest Q {\n  goal "g"\n}'
                          ).parse_program()
    except VowSyntaxError as e:
        assert 'unknown domain' in str(e)
    else:
        raise AssertionError('expected VowSyntaxError for unknown domain')


def test_transpiler_emits_domain():
    prog = VowAdvancedParser('domain "sop"\nquest Q {\n  goal "g"\n}'
                             ).parse_program()
    code = VowTranspiler().transpile(prog)
    assert "_VOW_DOMAIN = 'sop'" in code


# --- end-to-end arc (CLI + sqlite memory) ----------------------------------

def _base(tmp_path):
    return str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_gp_')


def _run(db, src='examples/golden_path.vow'):
    r = subprocess.run([sys.executable, 'vow_cli.py', 'run', src,
                        '--db', db],
                       capture_output=True, text=True, cwd=PROJ, env=ENV)
    assert r.returncode == 0, r.stderr[-600:]
    return ast.literal_eval(json.loads(r.stdout)['final_result'])


def test_golden_path_e2e_arc(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        runs = [_run(db) for _ in range(6)]
        # runs 1-3: full field, building the streak (risky never wins:
        # 0.82 vs 0.98 on deterministic scoring)
        for fin in runs[:3]:
            assert all(m.get('skipped') is None for m in fin['tournament'])
            assert fin['whispers'] == []
        # success-informed ordering: the proven winner leads from run 2
        assert runs[1]['tournament'][0]['strategy'] == 'safe_route'
        # winner streak recorded with durations (won flags, not mere passes)
        from vow.database import SqliteDatabase
        entries = SqliteDatabase(db).recall_all_success_sync()
        wins = [e for e in entries if e['strategy'] == 'safe_route'
                and e['won']]
        assert len(wins) == 6, entries
        assert all(e['duration'] is not None for e in entries)
        assert all(not e['won'] for e in entries
                   if e['strategy'] == 'risky_route')
        # runs 4-5: golden path engaged — safe_route runs alone
        for fin in runs[3:5]:
            kinds = [w['kind'] for w in fin['whispers']]
            assert kinds == ['golden_path_engaged'], kinds
            by_name = {m['strategy']: m for m in fin['tournament']}
            assert by_name['risky_route'].get('skipped') == 'golden_path'
            assert by_name['safe_route'].get('skipped') is None
        # run 6: 5 golden wins reached -> challenger run re-opens the field
        kinds = [w['kind'] for w in runs[5]['whispers']]
        assert kinds == ['golden_path_challenger_run'], kinds
        assert all(m.get('skipped') is None for m in runs[5]['tournament'])
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_scar_outranks_golden(tmp_path=None):
    """A scar for the golden strategy exact-skips it even in SOP domains —
    failure memory always outranks success memory."""
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        runs = [_run(db) for _ in range(4)]
        assert [w['kind'] for w in runs[3]['whispers']] == [
            'golden_path_engaged']
        seed = runs[3]['tournament'][0]['seed']
        conn = sqlite3.connect(db)
        conn.execute(
            "INSERT INTO scars (quest_name, message, context)"
            " VALUES (?, ?, ?)",
            ('GoldenPath', 'prove failed: result == 200 [equality_mismatch]',
             json.dumps({'quest': 'GoldenPath', 'strategy': 'safe_route',
                         'seed': seed,
                         'reason': {'kind': 'equality_mismatch'}})))
        conn.commit()
        conn.close()
        fin = _run(db)
        by_name = {m['strategy']: m for m in fin['tournament']}
        assert by_name['safe_route'].get('skipped') == 'scar_memory', by_name
        assert by_name['risky_route'].get('skipped') is None
        assert not any(w['kind'] == 'golden_path_engaged'
                       for w in fin['whispers'])
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_exploratory_domain_never_golden(tmp_path=None):
    """No domain directive -> classic behavior: no golden skips, no
    whispers, every eligible strategy runs every time."""
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        for _ in range(4):
            fin = _run(db, src='examples/tournament_mixed.vow')
            assert fin['whispers'] == []
            assert not any(m.get('skipped') == 'golden_path'
                           for m in fin['tournament'])
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


# --- unit-level policy (runtime preamble exec'd directly) ------------------

def _runtime_ns():
    ns = {'VowProofFailure': VowProofFailure,
          'VowScarMemory': VowScarMemory,
          'VowSuccessLog': VowSuccessLog,
          '_VOW_DOMAIN': 'sop'}
    exec(SHADOW_RUNTIME_PREAMBLE, ns)
    return ns


def _seed_wins(ns, strategy, quest, count):
    fp = ns['_vow_fingerprint']({})
    VowSuccessLog._entries.clear()
    for _ in range(count):
        VowSuccessLog.record({'quest': quest, 'strategy': strategy,
                              'seed': fp, 'env': {}, 'duration': 0.001,
                              'won': True})


def test_golden_path_broken_opens_field():
    ns = _runtime_ns()
    VowScarMemory.clear()
    ns['_vow_quest_begin']('QUnit')
    _seed_wins(ns, 'goldie', 'QUnit', 3)

    def goldie_fn(senv):
        raise VowProofFailure('golden path broke')

    def challenger_fn(senv):
        senv['result'] = 1

    strategies = [{'name': 'goldie', 'cost': 1.0, 'risk': 0.0,
                   'fn': goldie_fn},
                  {'name': 'challenger', 'cost': 1.0, 'risk': 0.0,
                   'fn': challenger_fn}]
    best = ns['_vow_tournament']({}, lambda _m: _m['proof_success'],
                                 strategies)
    kinds = [w['kind'] for w in ns['_vow_whispers']]
    assert 'golden_path_engaged' in kinds
    assert 'golden_path_broken' in kinds, kinds
    assert best is not None and best['strategy'] == 'challenger'
    by_name = {m['strategy']: m for m in ns['_vow_tournament_results']}
    assert by_name['goldie']['proof_success'] == 0.0
    assert by_name['challenger']['proof_success'] == 1.0


def test_golden_path_short_circuits_unit():
    ns = _runtime_ns()
    VowScarMemory.clear()
    ns['_vow_quest_begin']('QUnit')
    _seed_wins(ns, 'goldie', 'QUnit', 3)
    ran = []

    def goldie_fn(senv):
        ran.append('goldie')
        senv['result'] = 1

    def challenger_fn(senv):
        ran.append('challenger')
        senv['result'] = 2

    strategies = [{'name': 'challenger', 'cost': 1.0, 'risk': 0.0,
                   'fn': challenger_fn},
                  {'name': 'goldie', 'cost': 1.0, 'risk': 0.0,
                   'fn': goldie_fn}]
    best = ns['_vow_tournament']({}, lambda _m: _m['proof_success'],
                                 strategies)
    assert ran == ['goldie'], ran  # golden ran first and alone
    assert best['strategy'] == 'goldie'
    by_name = {m['strategy']: m for m in ns['_vow_tournament_results']}
    assert by_name['challenger'].get('skipped') == 'golden_path'
    # the win was persisted with the 'won' flag (streak continues)
    wins = [e for e in VowSuccessLog._entries if e.get('won')]
    assert len(wins) == 4, VowSuccessLog._entries
