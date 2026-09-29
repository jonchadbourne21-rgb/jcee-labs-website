"""Tests for axiom / deduce — compile-time truths.

Axioms are evaluated at transpile time, immutable at runtime, injected
into every quest env (and thereby into every situation fingerprint), and
stamped into run evidence. Deduce blocks are compile-time decision tables
over axioms; anything runtime is a compile error, not a silent demotion.
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

from vow.vow_parser import VowAdvancedParser  # noqa: E402
from vow.vow_transpiler import VowTranspiler, VowTranspileError  # noqa: E402


def _transpile(src):
    return VowTranspiler().transpile(
        VowAdvancedParser(src).parse_program())


# --- compile-time resolution ----------------------------------------------

def test_axiom_resolves_at_transpile():
    code = _transpile('axiom limit = 25\n'
                      'quest Q {\n  goal "g"\n  let x = limit\n}')
    assert '_VOW_AXIOMS = {\'limit\': 25}' in code


def test_axiom_arithmetic_over_axioms():
    code = _transpile('axiom a = 25\naxiom b = a * 4\n'
                      'quest Q {\n  goal "g"\n  let x = b\n}')
    assert "'b': 100" in code


def test_deduce_first_true_clause_wins():
    src = ('axiom threshold = 100\n'
           'deduce tier {\n'
           '  given threshold >= 100 -> "wholesale"\n'
           '  given threshold >= 50 -> "retail"\n'
           '}\n'
           'quest Q {\n  goal "g"\n  let x = tier\n}')
    code = _transpile(src)
    assert "'tier': 'wholesale'" in code


def test_non_constant_axiom_is_compile_error():
    try:
        _transpile('axiom bad = runtime_value + 1\n'
                   'quest Q {\n  goal "g"\n}')
    except VowTranspileError as e:
        assert 'compile time' in str(e) and 'runtime_value' in str(e)
    else:
        raise AssertionError('expected VowTranspileError')


def test_deduce_no_match_is_compile_error():
    try:
        _transpile('axiom t = 10\n'
                   'deduce tier {\n  given t >= 100 -> "big"\n}\n'
                   'quest Q {\n  goal "g"\n}')
    except VowTranspileError as e:
        assert 'no given matched' in str(e)
    else:
        raise AssertionError('expected VowTranspileError')


def test_deduce_rejects_runtime_reference():
    try:
        _transpile('deduce tier {\n  given attempts > 3 -> "late"\n}\n'
                   'quest Q {\n  goal "g"\n}')
    except VowTranspileError as e:
        assert "'attempts' is not an axiom" in str(e)
    else:
        raise AssertionError('expected VowTranspileError')


# --- immutability ----------------------------------------------------------

def test_axiom_cannot_be_rebound():
    for kw in ('let', 'believe', 'set'):
        src = f'axiom limit = 25\nquest Q {{\n  goal "g"\n  {kw} limit = 1\n}}'
        if kw == 'believe':
            src = (f'axiom limit = 25\nquest Q {{\n  goal "g"\n'
                   f'  believe limit = 1 confidence 1.0 source "x"\n}}')
        try:
            _transpile(src)
        except VowTranspileError as e:
            assert 'immutable' in str(e), (kw, e)
        else:
            raise AssertionError(f'expected VowTranspileError for {kw}')


# --- end-to-end ------------------------------------------------------------

def _base(tmp_path):
    return str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_ax_')


def test_axioms_stamped_in_evidence_e2e(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        r = subprocess.run(
            [sys.executable, 'vow_cli.py', 'run', 'examples/axioms.vow',
             '--db', db], capture_output=True, text=True, cwd=PROJ, env=ENV)
        assert r.returncode == 0, r.stderr[-600:]
        t = json.loads(r.stdout)
        fin = ast.literal_eval(t['final_result'])
        assert fin['axioms'] == {'max_discount': 25, 'bulk_threshold': 100,
                                 'pricing_tier': 'wholesale'}
        winner = max((m for m in fin['tournament'] if not m.get('skipped')),
                     key=lambda m: m['score'])
        assert winner['strategy'] == 'compliant_quote'
        assert any('max_discount' in s['message']
                   for s in t['db_scars'])
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_axiom_values_shift_the_fingerprint(tmp_path=None):
    """The same quest with a different axiom value is a DIFFERENT
    situation — scars and golden paths key per policy."""
    base = _base(tmp_path)
    try:
        src = open(os.path.join(PROJ, 'examples/axioms.vow')).read()
        seeds = []
        for value in (25, 30):
            path = os.path.join(base, f'ax{value}.vow')
            with open(path, 'w') as fh:
                fh.write(src.replace('axiom max_discount = 25',
                                     f'axiom max_discount = {value}'))
            r = subprocess.run(
                [sys.executable, 'vow_cli.py', 'run', path,
                 '--db', os.path.join(base, 'm.db')],
                capture_output=True, text=True, cwd=PROJ, env=ENV)
            assert r.returncode == 0, r.stderr[-600:]
            fin = ast.literal_eval(
                json.loads(r.stdout)['final_result'])
            seeds.append(fin['tournament'][0]['seed'])
        assert seeds[0] != seeds[1], seeds
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)
