# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_parser import VowAdvancedParser
from vow.vow_transpiler import VowTranspiler

SRC = open(os.path.join(os.path.dirname(__file__), '..', 'examples',
                        'discrimination.vow')).read()


def build(src=SRC):
    g = {}
    exec(VowTranspiler(True).transpile(VowAdvancedParser(src).parse_program()), g)
    return g


def test_exact_same_situation_is_skipped():
    g = build()
    g['quest_BatchA']()  # hurts big_batch with batch 600
    r2 = g['quest_BatchA']()  # identical situation
    by = {t['strategy']: t for t in r2['tournament']}
    assert by['big_batch'].get('skipped') == 'scar_memory'
    assert 'skipped' not in by['split_batch']


def test_similar_but_different_gets_cautionary_retry():
    g = build()
    g['quest_BatchA']()          # scar: big_batch @ batch 600
    rb = g['quest_BatchB']()     # similar path, different detail (450)
    by = {t['strategy']: t for t in rb['tournament']}
    assert 'skipped' not in by['big_batch'], 'similar != exact: must still try'
    assert by['big_batch'].get('caution') == 'similar_scar'
    assert by['big_batch']['proof_success'] == 1.0  # and it works
    assert rb['success'] is True


def test_failed_retry_creates_distinct_scar():
    g = build()
    g['quest_BatchA']()  # scar #1: seed for batch 600
    # same strategy name, new situation that ALSO fails (batch 700)
    src = SRC.replace('quest BatchB {', 'quest BatchB2 {') \
             .replace('let batch_size = 450', 'let batch_size = 700')
    g2 = {}
    exec(VowTranspiler(True).transpile(VowAdvancedParser(src).parse_program()), g2)
    g2['VowScarMemory'] = g['VowScarMemory']  # share memory
    g2['quest_BatchB2']()
    seeds = {x['context'].get('seed') for x in g['VowScarMemory'].all()
             if isinstance(x.get('context'), dict)}
    assert len(seeds) == 2, f'expected 2 distinct situation scars, got {seeds}'


def test_scars_carry_seed_and_quest():
    g = build()
    g['quest_BatchA']()
    ctx = g['VowScarMemory'].all()[0]['context']
    assert ctx['strategy'] == 'big_batch'
    assert ctx['quest'] == 'BatchA'
    assert isinstance(ctx['seed'], str) and len(ctx['seed']) == 16


def test_cross_quest_caution_through_engine(tmp_path):
    """Full stack: VowEngineManager + SqliteDatabase. BatchA scars big_batch;
    BatchB (different quest, same strategy name, different situation) must
    see the scar via recall_all and retry with caution — not skip."""
    import asyncio, ast
    from main import VowEngineManager
    from vow.database import SqliteDatabase
    mgr = VowEngineManager(SqliteDatabase(str(tmp_path / 'm.db')))
    asyncio.run(mgr.execute_vow_quest(SRC, 'BatchA', dry_run=True))
    trace = asyncio.run(mgr.execute_vow_quest(SRC, 'BatchB', dry_run=True))
    result = ast.literal_eval(trace['final_result'])
    by = {t['strategy']: t for t in result['tournament']}
    assert 'skipped' not in by['big_batch']
    assert by['big_batch'].get('caution') == 'similar_scar'
    assert by['big_batch']['proof_success'] == 1.0


def test_cross_quest_exact_skip_still_quest_scoped(tmp_path):
    """Same quest + same situation -> skip, even through the engine."""
    import asyncio, ast
    from main import VowEngineManager
    from vow.database import SqliteDatabase
    mgr = VowEngineManager(SqliteDatabase(str(tmp_path / 'm.db')))
    asyncio.run(mgr.execute_vow_quest(SRC, 'BatchA', dry_run=True))
    trace = asyncio.run(mgr.execute_vow_quest(SRC, 'BatchA', dry_run=True))
    result = ast.literal_eval(trace['final_result'])
    by = {t['strategy']: t for t in result['tournament']}
    assert by['big_batch'].get('skipped') == 'scar_memory'
    assert 'skipped' not in by['split_batch']
