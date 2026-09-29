# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_parser import VowAdvancedParser
from vow.vow_transpiler import VowTranspiler

SRC = open(os.path.join(os.path.dirname(__file__), '..', 'examples',
                        'scar_autopsy.vow')).read()


def test_cross_process_diff_via_engine(tmp_path):
    """Process A records a success; process B's failure diffs against it."""
    import asyncio, ast
    from main import VowEngineManager
    from vow.database import SqliteDatabase
    db = str(tmp_path / 'm.db')
    m1 = VowEngineManager(SqliteDatabase(db))
    asyncio.run(m1.execute_vow_quest(SRC, 'SmallBatch', dry_run=True))
    m2 = VowEngineManager(SqliteDatabase(db))  # separate engine = new process
    t2 = asyncio.run(m2.execute_vow_quest(SRC, 'BigBatch', dry_run=True))
    res = ast.literal_eval(t2['final_result'])
    entry = {x['strategy']: x for x in res['tournament']}['big_batch']
    diff = {d['key']: d for d in entry['reason']['diff_vs_success']}
    assert diff['batch_size'] == {'key': 'batch_size', 'was': 450, 'now': 600}


def test_same_quest_preferred_in_recall(tmp_path):
    from vow.database import SqliteDatabase
    db = SqliteDatabase(str(tmp_path / 'm.db'))
    db.record_success_sync({'quest': 'QuestX', 'strategy': 's', 'seed': 'a',
                            'env': {'v': 1}})
    db.record_success_sync({'quest': 'QuestY', 'strategy': 's', 'seed': 'b',
                            'env': {'v': 2}})
    got = db.recall_success_sync('QuestY', 's')
    assert all(e['quest'] == 'QuestY' for e in got)
    assert got[-1]['env'] == {'v': 2}
    # unknown quest falls back to any-quest entries
    got2 = db.recall_success_sync('QuestZ', 's')
    assert len(got2) == 2


def test_retention_cap(tmp_path):
    from vow.database import SqliteDatabase
    db = SqliteDatabase(str(tmp_path / 'm.db'))
    for i in range(12):
        db.record_success_sync({'quest': 'Q', 'strategy': 's',
                                'seed': str(i), 'env': {'i': i}})
    got = db.recall_success_sync('Q', 's')
    assert len(got) == db.SUCCESS_RETENTION == 10
    assert got[-1]['env'] == {'i': 11}     # newest kept
    assert got[0]['env'] == {'i': 2}       # oldest two pruned


def test_in_memory_fallback_prefers_same_quest():
    from vow.vow_transpiler import VowSuccessLog
    VowSuccessLog._entries.clear()
    VowSuccessLog._entries.append({'quest': 'A', 'strategy': 's', 'env': {'v': 1}})
    VowSuccessLog._entries.append({'quest': 'B', 'strategy': 's', 'env': {'v': 2}})
    assert VowSuccessLog.recall('B', 's')[-1]['env'] == {'v': 2}
    assert len(VowSuccessLog.recall('C', 's')) == 2  # fallback: any quest
    VowSuccessLog._entries.clear()


def test_raw_exec_diff_still_works():
    """No engine, no db: the preamble fallback keeps diff_vs_success alive."""
    g = {}
    exec(VowTranspiler(True).transpile(VowAdvancedParser(SRC).parse_program()), g)
    g['quest_SmallBatch']()
    g['quest_BigBatch']()
    diff = {d['key']: d for d in
            g['VowScarMemory'].all()[-1]['context']['reason']['diff_vs_success']}
    assert diff['batch_size']['was'] == 450
