# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_reverse import VowReverseTranspiler, VowReverseError
from vow.vow_parser import VowAdvancedParser
from vow.vow_transpiler import VowTranspiler

EXAMPLE = open(os.path.join(os.path.dirname(__file__), '..', 'examples',
                            'tournament_mixed.vow')).read()


def test_python_to_vow_basic():
    py = 'def q():\n    """doc goal"""\n    x = 1 + 2\n    assert x == 3\n    return x == 3\n'
    vow = VowReverseTranspiler().reverse_source(py)
    assert 'quest q {' in vow
    assert 'goal "doc goal"' in vow
    assert 'let x = (1 + 2)' in vow
    assert 'prove (x == 3)' in vow
    assert 'success when x == 3' in vow
    VowAdvancedParser(vow).parse_program()  # must parse


def test_python_to_vow_is_total():
    py = 'import os\nfor i in range(3):\n    print(i)\nwhile True:\n    break\n'
    vow = VowReverseTranspiler().reverse_source(py)
    assert '# unsupported: import os' in vow
    assert '# for i in range(3):' in vow or '# unsupported' in vow
    VowAdvancedParser(vow).parse_program()


def test_round_trip_shadow():
    shadow = VowTranspiler(True).transpile(VowAdvancedParser(EXAMPLE).parse_program())
    vow_back = VowReverseTranspiler().reverse_shadow(shadow)
    # key constructs survive the round trip
    assert 'quest TournamentMixed {' in vow_back
    assert 'goal "find the answer to life, the universe, and everything"' in vow_back
    assert 'believe answer = 42 confidence 1.0 source "deep thought"' in vow_back
    assert 'strategy wrong_answer {' in vow_back
    assert 'success when (result == 42)' in vow_back


def test_round_trip_executes_identically():
    shadow = VowTranspiler(True).transpile(VowAdvancedParser(EXAMPLE).parse_program())
    vow_back = VowReverseTranspiler().reverse_shadow(shadow)
    ast2 = VowAdvancedParser(vow_back).parse_program()
    shadow2 = VowTranspiler(True).transpile(ast2)
    g = {}
    exec(shadow2, g)
    res = g['quest_TournamentMixed']()
    assert res['success'] is True
    assert res['result'] == {'answer': 42, 'result': 42}
    scores = {t['strategy']: t['proof_success'] for t in res['tournament']}
    assert scores['wrong_answer'] == 0.0
    assert scores['safe_and_correct'] == 1.0


def test_reverse_shadow_rejects_non_shadow():
    try:
        VowReverseTranspiler().reverse_shadow('x = 1\n')
        assert False
    except VowReverseError as e:
        assert 'Shadow Python' in str(e)


def test_all_examples_round_trip():
    exdir = os.path.join(os.path.dirname(__file__), '..', 'examples')
    for f in os.listdir(exdir):
        if not f.endswith('.vow'):
            continue
        src = open(os.path.join(exdir, f)).read()
        shadow = VowTranspiler(True).transpile(VowAdvancedParser(src).parse_program())
        vow_back = VowReverseTranspiler().reverse_shadow(shadow)
        ast2 = VowAdvancedParser(vow_back).parse_program()
        assert ast2.quests, f
