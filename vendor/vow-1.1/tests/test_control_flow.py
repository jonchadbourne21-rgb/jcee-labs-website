# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_parser import VowAdvancedParser
from vow.vow_transpiler import VowTranspiler, VowTranspileError
from vow.vow_ast import If, Repeat, Set


def build(src):
    ast = VowAdvancedParser(src).parse_program()
    g = {}
    exec(VowTranspiler(True).transpile(ast), g)
    return ast, g


def test_if_else_both_branches():
    _, g = build('quest Q { let x = 5 if x > 3 { let y = 1 } else { let y = 2 } '
                 'success when y == 1 }')
    assert g['quest_Q']()['success'] is True
    _, g2 = build('quest Q { let x = 1 if x > 3 { let y = 1 } else { let y = 2 } '
                  'success when y == 2 }')
    assert g2['quest_Q']()['success'] is True


def test_repeat_times():
    _, g = build('quest Q { let total = 0 repeat 4 times { set total = total + 2 } '
                 'success when total == 8 }')
    assert g['quest_Q']()['result']['total'] == 8


def test_repeat_with_expr_count():
    _, g = build('quest Q { let n = 3 let c = 1 repeat n times { set c = c * 2 } '
                 'success when c == 8 }')
    assert g['quest_Q']()['success'] is True


def test_set_reassigns():
    _, g = build('quest Q { let x = 1 set x = 42 success when x == 42 }')
    assert g['quest_Q']()['success'] is True


def test_set_on_unbound_is_compile_error():
    try:
        build('quest Q { set x = 1 success when true }')
        assert False
    except VowTranspileError as e:
        assert 'unbound' in str(e)


def test_nested_control_flow():
    _, g = build('''quest Q { let total = 0
      repeat 3 times {
        if total < 3 { set total = total + 2 } else { set total = total + 1 }
      }
      success when total == 5 }''')
    assert g['quest_Q']()['result']['total'] == 5


def test_compounding_matches_spec_example():
    _, g = build('''quest Q { let principal = 100 let rate = 0.1
      let compounded = principal
      repeat 3 times { set compounded = compounded * (1.0 + rate) }
      success when compounded > 133 }''')
    res = g['quest_Q']()
    assert res['success'] is True
    assert abs(res['result']['compounded'] - 133.1) < 1e-9


def test_control_flow_in_strategy():
    _, g = build('''quest Q { goal "g"
      tournament { score by proof_success
        strategy s { cost 1 risk 0.0
          let acc = 0
          repeat 3 times { set acc = acc + 1 }
          prove acc == 3 } }
      success when acc == 3 }''')
    assert g['quest_Q']()['success'] is True


def test_ast_shapes():
    ast, _ = build('quest Q { let x = 1 set x = 2 if x { let y = 1 } repeat 2 times { set x = x } success when true }')
    items = ast.quests[0].items
    kinds = [type(i) for i in items]
    assert If in kinds and Repeat in kinds and Set in kinds
    rep = next(i for i in items if isinstance(i, Repeat))
    assert isinstance(rep.body[0], Set)
