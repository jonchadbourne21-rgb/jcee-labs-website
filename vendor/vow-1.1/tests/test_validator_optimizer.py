# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""Scar Injection Validator + LLM Strategy Optimizer (Reconciled §5)."""
import asyncio, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.scar_injection_validator import (
    ScarInjectionValidator, ScarInjectionError, validate_source)
from vow.llm_strategy_optimizer import LLMStrategyOptimizer
from vow.self_learning_system import SelfLearningSystem
from main import VowEngineManager, MockDatabase


LEARN_NO_SCARS = '''
@learn
quest bare {
  goal "no authored scars"
  capability model
  strategy s {
    let x = 1
    prove x == 2
  }
  success when true
}
'''

LEARN_ON_FAIL = '''
@learn
quest covered {
  goal "on-fail scar"
  capability model
  strategy s {
    let x = 1
    prove x == 2
  }
  on fail {
    scar "covered quest failed"
  }
  success when true
}
'''

LEARN_PARTIAL = '''
@learn
quest partial {
  goal "partial coverage"
  capability model
  tournament {
    score by proof_success
    strategy with_scar {
      scar "with_scar failed"
      prove false
    }
    strategy bare {
      let x = 1
      prove x == 2
    }
  }
  success when true
}
'''

NO_LEARN = '''
quest plain {
  goal "not learning"
  capability model
  strategy s {
    let x = 1
    prove x == 1
  }
  success when true
}
'''


def test_error_when_learn_quest_authors_no_scars():
    rep = validate_source(LEARN_NO_SCARS)
    assert rep['quests_checked'] == 1
    assert rep['errors'] == 1
    f = rep['findings'][0]
    assert f['severity'] == 'error' and f['quest'] == 'bare'
    assert 'mandatory' in f['message']


def test_clean_when_on_fail_scar_present():
    rep = validate_source(LEARN_ON_FAIL)
    assert rep['quests_checked'] == 1
    assert rep['errors'] == 0 and rep['warnings'] == 0


def test_warning_for_partially_covered_tournament():
    rep = validate_source(LEARN_PARTIAL)
    assert rep['errors'] == 0
    assert rep['warnings'] == 1
    assert 'bare' in rep['findings'][0]['message']


def test_non_learn_quest_not_checked():
    rep = validate_source(NO_LEARN)
    assert rep['quests_checked'] == 0
    assert rep['findings'] == []


def test_tripwire_fires_on_scarless_failure():
    v = ScarInjectionValidator()
    fabricated = {
        'final_result': {'learn': True, 'tournament': [
            {'strategy': 's', 'proof_success': 0.0}]},
        'scars_recorded': []}
    try:
        v.validate_trace(fabricated)
        assert False, 'expected ScarInjectionError'
    except ScarInjectionError as e:
        assert "'s'" in str(e)


def test_tripwire_passes_when_scar_recorded():
    v = ScarInjectionValidator()
    ok = v.validate_trace({
        'final_result': {'learn': True, 'tournament': [
            {'strategy': 's', 'proof_success': 0.0}]},
        'scars_recorded': [{'message': 'prove failed'}]})
    assert ok is True


def _trained_learning(fail_name='weak', win_name='strong'):
    learning = SelfLearningSystem()
    for _ in range(3):
        learning.selector.record_performance(
            fail_name, success=False, execution_time=30.0, resource_usage=0.4)
        learning.selector.record_performance(
            win_name, success=True, execution_time=1.0, resource_usage=0.4)
    for _ in range(2):
        learning.analyzer.add_scar('q', fail_name, 'Connection timeout 30s')
    learning.analyzer.analyze_patterns()
    return learning


def test_deterministic_demote_and_promote():
    learning = _trained_learning()
    out = LLMStrategyOptimizer(learning).suggest()
    kinds = {(s['kind'], s['target']) for s in out}
    assert ('demote_strategy', 'weak') in kinds
    assert ('promote_strategy', 'strong') in kinds
    demote = next(s for s in out if s['kind'] == 'demote_strategy')
    assert '0/3' in demote['rationale']
    assert demote['evidence']['performance']['success_rate'] == 0.0


def test_deterministic_investigate_pattern():
    learning = _trained_learning()
    out = LLMStrategyOptimizer(learning).suggest()
    pat = [s for s in out if s['kind'] == 'investigate_pattern']
    assert pat, 'expected an investigate_pattern suggestion'
    assert '2x' in pat[0]['rationale'] or '2' in str(
        pat[0]['evidence']['occurrences'])


def test_llm_path_used_when_configured():
    learning = _trained_learning()
    llm = lambda p: json.dumps([{
        'kind': 'demote_strategy', 'target': 'weak',
        'rationale': 'weak never succeeds; remove it'}])
    out = LLMStrategyOptimizer(learning, llm=llm).suggest()
    assert out[0]['source'] == 'llm'
    assert out[0]['target'] == 'weak'


def test_llm_failure_falls_back_honestly():
    learning = _trained_learning()
    def bad(p):
        raise RuntimeError('endpoint down')
    out = LLMStrategyOptimizer(learning, llm=bad).suggest()
    assert all(s['source'] == 'deterministic' for s in out)
    marker = [s for s in out if s['kind'] == 'llm_refinement']
    assert marker and 'endpoint down' in marker[0]['rationale']


def test_llm_unparseable_falls_back_honestly():
    learning = _trained_learning()
    out = LLMStrategyOptimizer(learning, llm=lambda p: 'no json here').suggest()
    marker = [s for s in out if s['kind'] == 'llm_refinement']
    assert marker and 'unparseable' in marker[0]['rationale']


def test_engine_trace_carries_report_and_suggestions():
    src = LEARN_ON_FAIL
    mgr = VowEngineManager(MockDatabase())
    for _ in range(3):
        t = asyncio.run(mgr.execute_vow_quest(src, 'covered', dry_run=True))
    assert t['scar_injection']['quests_checked'] == 1
    assert t['scar_injection']['errors'] == 0
    # the failing strategy 's' fed the optimizer through measured history
    assert 'optimization' in t
    assert any(sg['target'] == 's' or sg['kind'] == 'promote_strategy'
               for sg in t['optimization'])
