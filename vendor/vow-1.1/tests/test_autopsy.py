# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_parser import VowAdvancedParser
from vow.vow_transpiler import VowTranspiler

SRC = open(os.path.join(os.path.dirname(__file__), '..', 'examples',
                        'scar_autopsy.vow')).read()
DISC = open(os.path.join(os.path.dirname(__file__), '..', 'examples',
                         'discrimination.vow')).read()


def build(src=SRC):
    g = {}
    exec(VowTranspiler(True).transpile(VowAdvancedParser(src).parse_program()), g)
    return g


def test_threshold_autopsy_fields():
    g = build()
    g['quest_BigBatch']()
    reason = g['VowScarMemory'].all()[-1]['context']['reason']
    assert reason['prove'] == 'batch_size < 500'
    assert reason['kind'] == 'threshold_violated'
    assert reason['bindings'] == {'batch_size': 600}
    assert reason['margin'] == {'op': '<', 'actual': 600,
                                'expected': 500, 'off_by': 100}


def test_kind_classification():
    g = build()
    g['quest_Greeting']()
    reasons = {x['context'].get('strategy'): x['context']['reason']
               for x in g['VowScarMemory'].all()
               if isinstance(x.get('context'), dict) and 'reason' in x['context']}
    assert reasons['exact_match']['kind'] == 'equality_mismatch'
    assert reasons['exact_match']['margin']['op'] == '=='
    assert reasons['presence']['kind'] == 'falsy_value'


def test_diff_vs_success():
    g = build()
    g['quest_SmallBatch']()   # big_batch works at 450
    g['quest_BigBatch']()     # same strategy fails at 600
    reason = g['VowScarMemory'].all()[-1]['context']['reason']
    diff = {d['key']: d for d in reason['diff_vs_success']}
    assert diff['batch_size'] == {'key': 'batch_size', 'was': 450, 'now': 600}


def test_failed_tournament_entry_carries_reason():
    g = build()
    r = g['quest_BigBatch']()
    entry = {t['strategy']: t for t in r['tournament']}['big_batch']
    assert entry['proof_success'] == 0.0
    assert entry['reason']['kind'] == 'threshold_violated'


def test_caution_entry_carries_prior_reason():
    g = build(DISC)
    g['quest_BatchA']()       # scars big_batch (600)
    rb = g['quest_BatchB']()  # cautionary retry (450)
    entry = {t['strategy']: t for t in rb['tournament']}['big_batch']
    assert entry['caution'] == 'similar_scar'
    assert entry['prior_reason']['prove'] == 'batch_size < 500'
    assert entry['prior_reason']['margin']['off_by'] == 100


def test_learning_clusters_by_prove():
    from vow.self_learning_system import SelfLearningSystem
    sys_learn = SelfLearningSystem()
    g = build()
    g['quest_BigBatch']()
    r2 = g['quest_BigBatch']()  # exact-scarred -> skipped entry, no double feed
    for results in ([t for t in g['_vow_tournament_results']],):
        sys_learn.on_tournament_results('BigBatch', results)
    g['VowScarMemory'].clear()
    g['quest_Greeting']()
    sys_learn.on_tournament_results('Greeting', g['_vow_tournament_results'])
    patterns = sys_learn.analyzer.analyze_patterns()
    labels = [p.description for p in patterns]
    assert any('`batch_size < 500` failed' in l for l in labels), labels
    assert any('`tier == "platinum"` failed' in l for l in labels), labels


def test_autopsy_round_trip():
    from vow.vow_reverse import VowReverseTranspiler
    shadow = VowTranspiler(True).transpile(VowAdvancedParser(SRC).parse_program())
    back = VowReverseTranspiler().reverse_shadow(shadow)
    g1, g2 = {}, {}
    exec(shadow, g1)
    exec(VowTranspiler(True).transpile(VowAdvancedParser(back).parse_program()), g2)
    g1['quest_BigBatch'](); g2['quest_BigBatch']()
    r1 = g1['VowScarMemory'].all()[-1]['context']['reason']
    r2 = g2['VowScarMemory'].all()[-1]['context']['reason']
    assert r1 == r2, (r1, r2)
