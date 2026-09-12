# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_parser import VowAdvancedParser
from vow.vow_transpiler import VowTranspiler
from vow.vow_ast import Quest, RecallScars, OnFail


def gen(src):
    ast = VowAdvancedParser(src).parse_program()
    g = {}
    exec(VowTranspiler(True).transpile(ast), g)
    return ast, g


def test_learn_decorator_parses():
    ast, _ = gen('@learn quest Q { goal "g" success when true }')
    assert ast.quests[0].learn is True
    ast2, _ = gen('quest Q { goal "g" success when true }')
    assert ast2.quests[0].learn is False


def test_unknown_decorator_rejected():
    try:
        gen('@fly quest Q { goal "g" }')
        assert False
    except Exception as e:
        assert 'unknown decorator' in str(e)


def test_learn_flag_in_result():
    _, g = gen('@learn quest Q { goal "g" success when true }')
    assert g['quest_Q']()['learn'] is True


def test_recall_scars_binds_scope():
    _, g = gen('quest Q { recall scars success when true }')
    g['VowScarMemory'].clear()
    g['VowScarMemory'].record('old lesson', {'ctx': 1})
    res = g['quest_Q']()
    assert res['success'] is True
    assert any('old lesson' in x['message'] for x in res['result']['recalled_scars'])


def test_on_fail_runs_when_success_false():
    _, g = gen('''quest Q { goal "g"
      let x = 1
      on fail { scar "we failed" }
      success when x == 2 }''')
    g['VowScarMemory'].clear()
    res = g['quest_Q']()
    assert res['success'] is False
    assert any('we failed' in x['message'] for x in g['VowScarMemory'].all())


def test_on_fail_not_run_on_success():
    _, g = gen('''quest Q { goal "g"
      on fail { scar "should not appear" }
      success when true }''')
    g['VowScarMemory'].clear()
    g['quest_Q']()
    assert g['VowScarMemory'].all() == []


def test_on_fail_runs_on_quest_level_proof_failure():
    _, g = gen('''quest Q { goal "g"
      prove 1 == 2
      on fail { scar "proof scar" }
      success when true }''')
    g['VowScarMemory'].clear()
    try:
        g['quest_Q']()
        assert False
    except g['VowProofFailure']:
        pass
    msgs = [x['message'] for x in g['VowScarMemory'].all()]
    assert any(m.startswith('prove failed:') for m in msgs), msgs
    assert 'proof scar' in msgs


def test_full_learning_example():
    src = open(os.path.join(os.path.dirname(__file__), '..', 'examples',
                            'learning_loop.vow')).read()
    ast, g = gen(src)
    q = ast.quests[0]
    assert q.learn is True
    assert any(isinstance(i, RecallScars) for i in q.items)
    assert any(isinstance(i, OnFail) for i in q.items)
    res = g['quest_CheckoutBatcher']()
    assert res['success'] is True
    assert res['result']['batch_size'] == 250
    scores = {t['strategy']: t['proof_success'] for t in res['tournament']}
    assert scores == {'big_batch': 0.0, 'learned_batch': 1.0}
