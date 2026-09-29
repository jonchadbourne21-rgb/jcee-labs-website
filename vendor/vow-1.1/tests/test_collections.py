# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""Collections, lambdas, method chaining, and type annotations
(Extended Parser surface: list/dict literals, lambda, .filter/.map/
.sort_by/.group_by, let x: T = ...)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_parser import VowAdvancedParser
from vow.vow_transpiler import VowTranspiler, VowTranspileError
from vow.vow_reverse import VowReverseTranspiler


def build(src):
    g = {}
    exec(VowTranspiler(True).transpile(
        VowAdvancedParser(src).parse_program()), g)
    return g


def run(src, quest):
    g = build(src)
    return g, g[f'quest_{quest}']()


BASE = '''
quest coll {
  goal "collections exercise"
  capability model
  strategy pipeline {
    let scores: list = [5, 1, 4, 1, 9]
    let big = scores.filter(lambda x: x > 2)
    let doubled = big.map(lambda x: x * 2)
    let ordered = doubled.sort_by(lambda x: 0 - x)
    prove len(big) == 3
    prove len(ordered) == 3
  }
  success when true
}
'''


def test_list_literal_and_chaining():
    g, res = run(BASE, 'coll')
    assert res['success'] is True
    out = res['result']
    assert list(out['big']) == [5, 4, 9]
    assert list(out['doubled']) == [10, 8, 18]
    assert list(out['ordered']) == [18, 10, 8]


def test_dict_literal_and_attribute_access():
    src = '''
quest d {
  goal "dicts"
  capability model
  strategy s {
    let cfg: dict = {"limit": 500, "mode": "safe"}
    prove cfg.limit == 500
    prove cfg.mode == "safe"
  }
  success when true
}
'''
    g, res = run(src, 'd')
    assert res['success'] is True
    assert res['result']['cfg']['limit'] == 500


def test_group_by_returns_groups():
    src = '''
quest g {
  goal "grouping"
  capability model
  strategy s {
    let leads = [{"name": "ada", "tier": 1}, {"name": "bob", "tier": 2},
                 {"name": "cy", "tier": 1}]
    let grouped = leads.group_by(lambda lead: lead.tier)
    prove len(grouped) == 2
  }
  success when true
}
'''
    g, res = run(src, 'g')
    assert res['success'] is True
    grouped = res['result']['grouped']
    assert len(grouped[1]) == 2 and len(grouped[2]) == 1


def test_lambda_multi_param_and_closure():
    src = '''
quest l {
  goal "closures"
  capability model
  strategy s {
    let factor = 3
    let xs = [1, 2, 3]
    let scaled = xs.map(lambda x: x * factor)
    let pairs = [2, 1]
    let prods = pairs.map(lambda a: a * factor)
    prove len(scaled) == 3
  }
  success when true
}
'''
    g, res = run(src, 'l')
    assert res['success'] is True
    assert list(res['result']['scaled']) == [3, 6, 9]


def test_dict_value_semantics_filter_map():
    src = '''
quest dv {
  goal "dict value ops"
  capability model
  strategy s {
    let inv = {"a": 1, "b": 5, "c": 9}
    let kept = inv.filter(lambda v: v > 4)
    let bumped = inv.map(lambda v: v + 1)
    prove len(kept) == 2
  }
  success when true
}
'''
    g, res = run(src, 'dv')
    assert res['success'] is True
    assert dict(res['result']['kept']) == {'b': 5, 'c': 9}
    assert dict(res['result']['bumped']) == {'a': 2, 'b': 6, 'c': 10}


def test_all_annotations_pass():
    src = '''
quest ann {
  goal "annotation contracts"
  capability model
  strategy s {
    let i: int = 7
    let f: float = 1.5
    let t: str = "ok"
    let b: bool = true
    let l: list = [1]
    let d: dict = {"k": 1}
    prove i == 7
  }
  success when true
}
'''
    g, res = run(src, 'ann')
    assert res['success'] is True


def test_annotation_violation_fails_strategy_with_evidence():
    src = '''
quest tv {
  goal "violation"
  capability model
  strategy bad {
    let n: int = "not a number"
    prove n == 1
  }
  strategy good {
    let n: int = 42
    prove n == 42
  }
  success when true
}
'''
    g, res = run(src, 'tv')
    assert res['success'] is True   # good strategy carries the quest
    scars = g['VowScarMemory'].all()
    typed = [x for x in scars if x['message'] == 'type annotation violated']
    assert typed, 'expected a type-violation scar'
    ctx = typed[-1]['context']
    assert ctx['strategy'] == 'bad'
    assert ctx['reason']['kind'] == 'type_violation'
    assert "declared int, got str" in ctx['reason']['detail']


def test_unknown_annotation_is_compile_error():
    src = '''
quest ua {
  goal "bad annotation"
  capability model
  strategy s {
    let n: integer = 1
    prove true
  }
  success when true
}
'''
    try:
        build(src)
        assert False, 'expected VowTranspileError'
    except VowTranspileError as e:
        assert "unknown type annotation 'integer'" in str(e)


def test_non_whitelisted_method_is_compile_error():
    src = '''
quest bm {
  goal "bad method"
  capability model
  strategy s {
    let x = [1, 2]
    let y = x.delete_everything()
    prove true
  }
  success when true
}
'''
    try:
        build(src)
        assert False, 'expected VowTranspileError'
    except VowTranspileError as e:
        assert '.delete_everything() not allowed' in str(e)


def test_purity_message_says_strategy_body():
    src = '''
quest px {
  goal "purity"
  capability network
  strategy s {
    let d = http_get("http://example.com")
    prove d != null
  }
  success when true
}
'''
    try:
        build(src)
        assert False, 'expected VowTranspileError'
    except VowTranspileError as e:
        assert 'inside a strategy body is a compile-time error' in str(e)


def test_runtime_error_is_evidence_not_crash():
    src = '''
quest re {
  goal "runtime errors recorded"
  capability model
  strategy boom {
    let x = [1, 2]
    let y = x.sort_by("not a function")
    prove true
  }
  strategy fine {
    let n = 1
    prove n == 1
  }
  success when true
}
'''
    g, res = run(src, 're')
    assert res['success'] is True   # 'fine' carries the quest
    scars = [x for x in g['VowScarMemory'].all()
             if x['message'] == 'strategy runtime error']
    assert scars, 'expected a runtime-error scar'
    assert scars[-1]['context']['reason']['kind'] == 'runtime_error'
    assert scars[-1]['context']['strategy'] == 'boom'


def test_roundtrip_faithful_for_collections():
    # roundtrip reaches a fixpoint: vow1 -> code1 -> vow2 -> code2 -> vow3
    # -> code3, with code2 == code3. (The first pass canonicalizes the
    # no-op `success when true` away — semantically identical — so the
    # meaningful fidelity check is that everything else is exactly
    # preserved from the second pass onward.)
    def strip(code):
        return '\n'.join(l for l in code.splitlines()
                          if not l.startswith('# VOW-SIGNATURE'))

    def transpile(vow_src):
        return VowTranspiler(True).transpile(
            VowAdvancedParser(vow_src).parse_program())

    code1 = transpile(BASE)
    vow2 = VowReverseTranspiler().reverse_shadow(code1)
    code2 = transpile(vow2)
    vow3 = VowReverseTranspiler().reverse_shadow(code2)
    code3 = transpile(vow3)
    assert strip(code2) == strip(code3)
    # the extended surface survived the round trip verbatim
    for token in ('_vow_list([', '_vow_annotate(',
                  '.filter(', '.map(', '.sort_by('):
        assert token in code2, token
    g = {}
    exec(code2, g)
    res = g['quest_coll']()
    assert res['success'] is True
    assert list(res['result']['ordered']) == [18, 10, 8]
