# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from datetime import datetime, timedelta
from vow.self_learning_system import (ScarPatternAnalyzer, AdaptiveStrategySelector,
                                      ScarVectorMemory, SelfLearningSystem)


def test_pattern_analyzer_groups_similar_errors():
    a = ScarPatternAnalyzer()
    now = datetime.now()
    a.add_scar('q1', 's1', 'Connection timeout after 30s', now)
    a.add_scar('q1', 's1', 'Connection timeout after 45s', now)
    a.add_scar('q2', 's2', 'Rate limit 429 from provider', now)
    pats = a.analyze_patterns()
    assert pats[0].occurrence_count == 2
    assert 'Connection timeout' in pats[0].description
    assert len(pats[0].pattern_id) == 8


def test_top_patterns_limit():
    a = ScarPatternAnalyzer()
    for i in range(5):
        a.add_scar('q', 's', 'timeout error' if i % 2 == 0 else 'ratelimit error')
    a.analyze_patterns()
    assert len(a.get_top_patterns(limit=1)) == 1
    assert a.get_top_patterns(5)[0].occurrence_count == 3


def test_selector_picks_best():
    sel = AdaptiveStrategySelector()
    for ok, t in [(False, 30.0), (False, 45.0), (True, 1.2)]:
        sel.record_performance('primary', success=ok, execution_time=t, resource_usage=0.4)
    for ok, t in [(True, 0.1)] * 3:
        sel.record_performance('cache', success=ok, execution_time=t, resource_usage=0.1)
    assert sel.select_best_strategy(['primary', 'cache']) == 'cache'
    rep = sel.get_performance_report()
    assert rep['cache']['success_rate'] == 1.0 and rep['primary']['runs'] == 3


def test_selector_unknown_returns_none():
    assert AdaptiveStrategySelector().select_best_strategy(['nope']) is None


def test_vector_memory_persists_and_recalls(tmp_path=None):
    path = os.path.join(os.path.dirname(__file__), '_tmp_scars.json')
    try:
        mem = ScarVectorMemory(path)
        mem.add('q', 's', 'Payment gateway times out beyond 500 records')
        mem2 = ScarVectorMemory(path)  # reload from disk
        assert len(mem2.all()) == 1
        hits = mem2.recall('payment timeout', min_similarity=0.1)
        assert hits and 'gateway' in hits[0][0].error and hits[0][1] > 0
    finally:
        if os.path.exists(path):
            os.remove(path)


def test_learning_system_tournament_hook():
    sls = SelfLearningSystem()
    fav = sls.on_tournament_results('Q', [
        {'strategy': 'a', 'proof_success': 0.0, 'speed': 0.9, 'cost': 1.0},
        {'strategy': 'b', 'proof_success': 1.0, 'speed': 0.9, 'cost': 1.0}])
    assert fav == 'b'
    sls.on_proof_failure('Q', 'a', 'prove failed: x == 2')
    assert sls.analyzer.get_top_patterns(1)[0].occurrence_count == 1


def test_demo_contract():
    """The exact usage from learning_demo.py / Worked Examples §4."""
    a = ScarPatternAnalyzer()
    now = datetime.now()
    log = [('checkout_batcher', 'primary_api', 'Connection timeout after 30s'),
           ('checkout_batcher', 'primary_api', 'Connection timeout after 45s'),
           ('checkout_batcher', 'mirror_api', 'Connection timeout after 30s')]
    for i, (q, s, e) in enumerate(log):
        a.add_scar(q, s, e, now - timedelta(minutes=i))
    a.analyze_patterns()
    top = a.get_top_patterns(limit=1)[0]
    assert top.occurrence_count == 3
