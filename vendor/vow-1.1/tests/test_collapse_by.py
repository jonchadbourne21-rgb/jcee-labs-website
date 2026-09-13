"""Tests for `collapse by` — output-aware tournament selection.

`score by` ranks strategies on engine metrics; `collapse by` also sees
strategy OUTPUTS (their computed env), so selection can rank on results
like margin. Engine metrics win name collisions; a disqualified strategy
scores 0.0; a successful strategy that lacks a referenced output is a
clear authoring error, not a crash with a bare KeyError.
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

from vow.vow_parser import VowAdvancedParser, VowSyntaxError  # noqa: E402


def _base(tmp_path):
    return str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_cb_')


def _run(path, db):
    r = subprocess.run([sys.executable, 'vow_cli.py', 'run', path,
                        '--db', db],
                       capture_output=True, text=True, cwd=PROJ, env=ENV)
    return r


def test_collapse_flag_parses():
    src = ('quest Q {\n  goal "g"\n'
           '  tournament {\n    collapse by margin\n'
           '    strategy a {\n      let margin = 1\n'
           '      prove margin > 0\n    }\n  }\n'
           '  success when margin > 0\n}')
    prog = VowAdvancedParser(src).parse_program()
    t = prog.quests[0].items[1]
    assert t.collapse is True


def test_score_by_remains_default():
    src = ('quest Q {\n  goal "g"\n'
           '  tournament {\n    score by proof_success\n'
           '    strategy a {\n      let margin = 1\n'
           '      prove margin > 0\n    }\n  }\n'
           '  success when margin > 0\n}')
    prog = VowAdvancedParser(src).parse_program()
    assert prog.quests[0].items[1].collapse is False


def test_tournament_requires_score_or_collapse():
    try:
        VowAdvancedParser('quest Q {\n  goal "g"\n'
                          '  tournament {\n    strategy a {\n'
                          '      prove 1 == 1\n    }\n  }\n}'
                          ).parse_program()
    except VowSyntaxError as e:
        assert "'score by' or 'collapse by'" in str(e)
    else:
        raise AssertionError('expected VowSyntaxError')


def test_collapse_by_selects_on_outputs_e2e(tmp_path=None):
    """premium_route (margin 80, risk 0.5) beats discount_route (margin 30,
    risk 0.1) — classic score-by would have crowned the safer route."""
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        r = _run('examples/collapse_by.vow', db)
        assert r.returncode == 0, r.stderr[-600:]
        fin = ast.literal_eval(json.loads(r.stdout)['final_result'])
        by_name = {m['strategy']: m for m in fin['tournament']}
        assert by_name['premium_route']['score'] == 80
        assert by_name['discount_route']['score'] == 30
        assert fin['result']['margin'] == 80
        assert fin['result']['price'] == 180  # the winner's env merged
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_disqualified_strategy_scores_zero(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    path = os.path.join(base, 'cb.vow')
    try:
        with open(path, 'w') as fh:
            fh.write('quest Q {\n  goal "g"\n'
                     '  believe base = 100 confidence 1.0 source "x"\n'
                     '  tournament {\n    collapse by margin\n'
                     '    strategy bad {\n'
                     '      let margin = base - 150\n'
                     '      prove margin > 0\n    }\n'
                     '    strategy good {\n'
                     '      let margin = base - 10\n'
                     '      prove margin > 0\n    }\n  }\n'
                     '  success when margin > 0\n}')
        r = _run(path, db)
        assert r.returncode == 0, r.stderr[-600:]
        fin = ast.literal_eval(json.loads(r.stdout)['final_result'])
        by_name = {m['strategy']: m for m in fin['tournament']}
        assert by_name['bad']['proof_success'] == 0.0
        assert by_name['bad']['score'] == 0.0
        assert by_name['good']['score'] == 90
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_missing_output_is_clear_authoring_error(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    path = os.path.join(base, 'cb_bad.vow')
    try:
        with open(path, 'w') as fh:
            fh.write('quest Q {\n  goal "g"\n'
                     '  tournament {\n    collapse by nonexistent\n'
                     '    strategy a {\n      let x = 1\n'
                     '      prove x > 0\n    }\n  }\n'
                     '  success when x > 0\n}')
        r = _run(path, db)
        assert r.returncode != 0
        blob = r.stdout + r.stderr
        assert 'produced no output named' in blob, blob[-800:]
        assert "'nonexistent'" in blob, blob[-800:]
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_score_by_back_compat(tmp_path=None):
    """Classic score-by tournaments behave exactly as before."""
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        r = _run('examples/tournament_mixed.vow', db)
        assert r.returncode == 0, r.stderr[-600:]
        fin = ast.literal_eval(json.loads(r.stdout)['final_result'])
        by_name = {m['strategy']: m for m in fin['tournament']}
        assert by_name['safe_and_correct']['proof_success'] == 1.0
        assert by_name['wrong_answer']['proof_success'] == 0.0
        # score-by expressions never see outputs: wrong_answer scored on
        # metrics even though its (wrong) output exists
        assert by_name['wrong_answer']['score'] != 0.0
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)
