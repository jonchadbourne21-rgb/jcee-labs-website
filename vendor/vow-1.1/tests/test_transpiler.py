# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_parser import VowAdvancedParser
from vow.vow_transpiler import (VowTranspiler, SHADOW_RUNTIME_PREAMBLE,
                            VowProofFailure)


def gen(src, preamble=True):
    ast = VowAdvancedParser(src).parse_program()
    code = VowTranspiler(include_preamble=preamble).transpile(ast)
    g = {}
    exec(code, g)
    return code, g


def test_preamble_toggle():
    code = VowTranspiler(True).transpile(VowAdvancedParser('quest Q {}').parse_program())
    assert 'VOW Shadow Runtime Preamble' in code
    code2 = VowTranspiler(False).transpile(VowAdvancedParser('quest Q {}').parse_program())
    assert 'Preamble' not in code2


def test_quest_function_and_quests_list():
    _, g = gen('quest Alpha { goal "g" } quest Beta {}')
    assert callable(g['quest_Alpha']) and callable(g['quest_Beta'])
    assert g['QUESTS'] == ['Alpha', 'Beta']


def test_goal_believe_let_flow():
    _, g = gen('quest Q { goal "g" believe a = 5 confidence 0.9 source "s" '
               'let b = a + 1 success when b == 6 }')
    res = g['quest_Q']()
    assert res['success'] is True
    assert res['beliefs'][0]['confidence'] == 0.9
    assert res['result']['b'] == 6


def test_prove_pass_and_fail():
    _, g = gen('quest Q { let x = 1 prove x == 1 success when true }')
    assert g['quest_Q']()['success'] is True
    _, g2 = gen('quest Q { let x = 1 prove x == 2 }')
    try:
        g2['quest_Q']()
        assert False
    except g2['VowProofFailure']:
        pass


def test_scar_statement_records():
    _, g = gen('quest Q { scar "we learned" success when true }')
    g['VowScarMemory'].clear()
    g['quest_Q']()
    assert any('we learned' in s['message'] for s in g['VowScarMemory'].all())


def test_disallowed_call_rejected():
    try:
        gen('quest Q { let x = eval("1") }')
        assert False
    except Exception as e:
        assert 'not allowed' in str(e)


def test_tournament_winner_propagates():
    _, g = gen('''quest Q { goal "g"
      tournament { score by safety
        strategy risky { cost 1 risk 0.9 let out = 1 prove true }
        strategy safe { cost 1 risk 0.1 let out = 2 prove true } }
      success when out == 2 }''')
    res = g['quest_Q']()
    assert res['success'] is True and res['result']['out'] == 2
