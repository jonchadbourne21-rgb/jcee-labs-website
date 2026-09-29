# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_parser import VowAdvancedParser
from vow.vow_transpiler import VowTranspiler

AVOID = open(os.path.join(os.path.dirname(__file__), '..', 'examples',
                          'scar_avoidance.vow')).read()


def build(src):
    g = {}
    exec(VowTranspiler(True).transpile(VowAdvancedParser(src).parse_program()), g)
    return g


def test_scarred_strategy_skipped_next_run():
    g = build(AVOID)
    r1 = g['quest_PathChooser']()
    assert {t['strategy']: t['proof_success'] for t in r1['tournament']} == \
        {'shortcut': 0.0, 'long_way': 1.0}
    r2 = g['quest_PathChooser']()
    by = {t['strategy']: t for t in r2['tournament']}
    assert by['shortcut'].get('skipped') == 'scar_memory'
    assert 'skipped' not in by['long_way']
    assert r2['success'] is True


def test_all_scarred_still_runs():
    g = build(AVOID)
    g['quest_PathChooser']()           # scar the shortcut (exact situation)
    # Scar the other path in the SAME situation (same quest + seed), so both
    # are exact-match scars: the quest must still try something.
    sc = [x['context'] for x in g['VowScarMemory'].all()
          if isinstance(x.get('context'), dict)
          and x['context'].get('strategy') == 'shortcut'][0]
    g['VowScarMemory'].record('prove failed', {
        'strategy': 'long_way', 'quest': sc.get('quest'), 'seed': sc.get('seed')})
    r = g['quest_PathChooser']()
    assert all('skipped' not in t for t in r['tournament']), \
        'all-scarred quest must still try something'


def test_name_only_scar_is_caution_not_skip():
    # A scar with no situation seed is only a SIMILAR match -> cautionary
    # retry, not avoidance (old name-only records degrade gracefully).
    g = build(AVOID)
    g['VowScarMemory'].record('prove failed', {'strategy': 'shortcut'})
    r = g['quest_PathChooser']()
    by = {t['strategy']: t for t in r['tournament']}
    assert 'skipped' not in by['shortcut']
    assert by['shortcut'].get('caution') == 'similar_scar'


def test_quest_level_strategy_executes():
    g = build('''quest Greet {
      goal "greet"
      strategy greet { let message = "hi" prove message != "" }
      on fail { scar "greet failed" }
      success when message == "hi" }''')
    res = g['quest_Greet']()
    assert res['success'] is True and res['result']['message'] == 'hi'
    assert len(res['tournament']) == 1  # metrics recorded via pipeline


def test_quest_level_strategy_failure_triggers_on_fail():
    g = build('''quest Greet {
      goal "greet"
      strategy greet { let message = "hi" prove message == "bye" }
      on fail { scar "greet failed" }
      success when message == "bye" }''')
    res = g['quest_Greet']()
    assert res['success'] is False
    msgs = [x['message'] for x in g['VowScarMemory'].all()]
    assert any(m.startswith('prove failed:') for m in msgs), msgs
    assert any('[equality_mismatch]' in m for m in msgs), msgs
    assert 'greet failed' in msgs


def test_scar_attributed_to_strategy():
    g = build(AVOID)
    g['quest_PathChooser']()
    ctxs = [x.get('context') for x in g['VowScarMemory'].all()]
    assert any(isinstance(c, dict) and c.get('strategy') == 'shortcut'
               for c in ctxs), ctxs


# --- regression: `recall scars` must not shift the situation fingerprint ---
# Binding recalled memory into quest scope used to change _vow_fingerprint's
# input on every run as scars accumulated, silently downgrading exact-skip
# avoidance to cautionary retry. Memory is not an input.

RECALL_SKIP = '''@learn
quest RecallSkip {
  goal "recalled memory must not shift the situation fingerprint"
  recall scars
  let batch = "B1"
  tournament {
    score by proof_success * 0.6 + safety * 0.4
    strategy bad_path {
      cost 1
      risk 0.9
      prove 1 == 2
    }
    strategy good_path {
      cost 1
      risk 0.1
      prove 1 == 1
    }
  }
  on fail { scar "recall_skip exhausted" }
  success when true
}'''


def test_fingerprint_ignores_recalled_scars():
    g = build('quest Q { goal "x" strategy s { prove true }'
              ' success when true }')
    fp = g['_vow_fingerprint']
    assert fp({'batch': 'B1'}) == \
        fp({'batch': 'B1', 'recalled_scars': [{'message': 'old wound'}]})


def test_recall_scars_still_exact_skips():
    g = build(RECALL_SKIP)
    r1 = g['quest_RecallSkip']()
    by1 = {t['strategy']: t for t in r1['tournament']}
    assert by1['bad_path']['proof_success'] == 0.0
    assert by1['good_path']['proof_success'] == 1.0
    seed1 = by1['bad_path']['seed']

    r2 = g['quest_RecallSkip']()
    by2 = {t['strategy']: t for t in r2['tournament']}
    assert by2['bad_path'].get('skipped') == 'scar_memory', by2['bad_path']
    assert by2['bad_path']['seed'] == seed1  # fingerprint stable across runs
    assert 'skipped' not in by2['good_path']
    assert by2['good_path']['seed'] == seed1
    assert r2['success'] is True


def test_scar_messages_carry_expr_and_kind_for_analyzer():
    # NicheFlow pilot finding via Manus, 2026-07-20 (docs/VOW-Build-Notes-2026-07-20.md,
    # fix #2): bare 'prove failed' collapsed every
    # ScarPatternAnalyzer pattern into one useless cluster. Prove-failure
    # scar messages must carry the expression + failure kind so recurring
    # failures discriminate into actionable patterns.
    from vow.self_learning_system import ScarPatternAnalyzer
    g = build(AVOID)  # shortcut proves `distance > 10` with distance = 5
    g['quest_PathChooser']()
    an = ScarPatternAnalyzer()
    for x in g['VowScarMemory'].all():
        an.add_scar('Q', 's', x['message'])
    an.analyze_patterns()
    tops = [p.description for p in an.get_top_patterns(limit=5)]
    assert any('distance > 10' in d and '[threshold_violated]' in d
               for d in tops), tops
