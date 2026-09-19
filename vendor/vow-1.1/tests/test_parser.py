# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_parser import VowAdvancedParser, VowSyntaxError
from vow.vow_ast import (Goal, Constraint, Believe, Tournament, Strategy, Prove,
                     Success, Let, ScarStmt, BinOp, Num, Name, Call)

EXAMPLE = '''
quest TournamentMixed {
  goal "find the answer to life, the universe, and everything"
  constraint attempts <= 6
  believe answer = 42 confidence 1.0 source "deep thought"
  tournament {
    score by proof_success * 0.6 + speed * 0.2 + safety * 0.2
    strategy wrong_answer { cost 1 risk 0.0 let result = 41 prove result == answer }
    strategy safe_and_correct { cost 1 risk 0.1 let result = answer prove result == 42 }
  }
  success when result == 42
}
'''


def parse(src=EXAMPLE):
    return VowAdvancedParser(src).parse_program()


def test_program_structure():
    p = parse()
    assert len(p.quests) == 1
    q = p.quests[0]
    assert q.name == 'TournamentMixed'
    kinds = [type(i) for i in q.items]
    assert kinds == [Goal, Constraint, Believe, Tournament, Success]


def test_believe_defaults_and_attrs():
    b = parse('quest Q { believe x = 7 }').quests[0].items[0]
    assert b.confidence == 1.0 and b.source is None
    b2 = parse('quest Q { believe x = 7 confidence 0.5 source "s" }').quests[0].items[0]
    assert b2.confidence == 0.5 and b2.source == 's'


def test_tournament_strategies():
    t = parse().quests[0].items[3]
    assert isinstance(t.score_expr, BinOp)
    assert [s.name for s in t.strategies] == ['wrong_answer', 'safe_and_correct']
    s = t.strategies[0]
    assert s.cost == 1.0 and s.risk == 0.0
    assert [type(i) for i in s.body] == [Let, Prove]


def test_expression_precedence():
    e = parse('quest Q { let x = 1 + 2 * 3 }').quests[0].items[0].value
    assert isinstance(e, BinOp) and e.op == '+'
    assert isinstance(e.right, BinOp) and e.right.op == '*'


def test_comparison_and_boolean_ops():
    e = parse('quest Q { let x = a <= 1 && b || !c }').quests[0].items[0].value
    assert e.op == '||'


def test_function_calls():
    e = parse('quest Q { let x = max(1, 2) }').quests[0].items[0].value
    assert isinstance(e, Call) and len(e.args) == 2


def test_success_when():
    s = parse().quests[0].items[4]
    assert isinstance(s, Success) and isinstance(s.expr, BinOp)


def test_scar_and_multiple_quests():
    p = parse('quest A { scar "learned" } quest B { goal "g" }')
    assert len(p.quests) == 2
    assert isinstance(p.quests[0].items[0], ScarStmt)


def test_syntax_error_has_position():
    try:
        parse('quest { goal "x" }')
        assert False
    except VowSyntaxError as e:
        assert e.line == 1 and 'identifier' in str(e)


def test_missing_brace_error():
    try:
        parse('quest Q { goal "x"')
        assert False
    except VowSyntaxError as e:
        assert "closing '}'" in str(e)
