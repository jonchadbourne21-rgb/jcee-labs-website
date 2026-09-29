# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_parser import VowAdvancedParser
from vow.vow_transpiler import VowTranspiler

SRC = open(os.path.join(os.path.dirname(__file__), '..', 'examples',
                        'scar_avoidance.vow')).read()


def build(ttl=None):
    g = {}
    exec(VowTranspiler(True).transpile(VowAdvancedParser(SRC).parse_program()), g)
    if ttl is not None:
        g['_VOW_SCAR_TTL'] = ttl
    return g


def test_fresh_exact_scar_skips_with_ttl():
    g = build(ttl=60)
    g['quest_PathChooser']()
    by = {t['strategy']: t for t in g['quest_PathChooser']()['tournament']}
    assert by['shortcut'].get('skipped') == 'scar_memory'


def test_aged_scar_demotes_to_cautionary_retry():
    g = build(ttl=60)
    g['quest_PathChooser']()
    g['VowScarMemory']._scars[0]['timestamp'] = time.time() - 3600
    by = {t['strategy']: t for t in g['quest_PathChooser']()['tournament']}
    assert 'skipped' not in by['shortcut']
    assert by['shortcut']['caution'] == 'aged_scar'
    assert by['shortcut']['proof_success'] == 0.0  # ran, failed, re-scarred


def test_no_ttl_never_decays():
    g = build()  # default: None
    g['quest_PathChooser']()
    g['VowScarMemory']._scars[0]['timestamp'] = time.time() - 86400 * 30
    by = {t['strategy']: t for t in g['quest_PathChooser']()['tournament']}
    assert by['shortcut'].get('skipped') == 'scar_memory'


def test_unknown_age_treated_as_fresh():
    g = build(ttl=1)
    g['quest_PathChooser']()
    del g['VowScarMemory']._scars[0]['timestamp']  # age unknowable
    by = {t['strategy']: t for t in g['quest_PathChooser']()['tournament']}
    assert by['shortcut'].get('skipped') == 'scar_memory'


def test_aged_scar_for_different_situation_is_similar_not_aged():
    DISC = SRC  # scar_avoidance: single env, so aged matches seed_now
    g = build(ttl=60)
    g['quest_PathChooser']()
    sc = g['VowScarMemory']._scars[0]
    sc['timestamp'] = time.time() - 3600
    sc['context']['seed'] = 'differentseed123'     # aged, but other situation
    by = {t['strategy']: t for t in g['quest_PathChooser']()['tournament']}
    assert by['shortcut']['caution'] == 'similar_scar'  # not aged_scar


def test_decay_through_engine_and_sqlite(tmp_path):
    """Cross-process: a scar BORN two days old (the WRITE-ONCE LAW forbids
    backdating existing rows — timestamps are untouchable — so the scar
    is written with an old clock, fingerprint honestly binding its true
    declared timestamp); engine with scar_ttl demotes to caution, engine
    without skips."""
    import asyncio, ast, sqlite3
    from datetime import timedelta
    from main import VowEngineManager
    import vow.database as vdb
    from vow.database import SqliteDatabase
    db = str(tmp_path / 'm.db')
    real_dt = vdb.datetime
    old_dt = real_dt.now() - timedelta(days=2)

    class _OldClock:
        @staticmethod
        def now(*a, **k):
            return old_dt

    vdb.datetime = _OldClock          # the scar is born two days old
    try:
        m1 = VowEngineManager(SqliteDatabase(db))
        asyncio.run(m1.execute_vow_quest(SRC, 'PathChooser', dry_run=True))
    finally:
        vdb.datetime = real_dt
    # the wall must refuse the old test's backdating move, and the chain
    # must still verify (the fingerprint bound the old clock honestly)
    con = sqlite3.connect(db)
    try:
        con.execute("UPDATE scars SET created_at = datetime('now', '-2 days')")
        con.commit()
        raise AssertionError('the wall did not refuse scar backdating')
    except sqlite3.IntegrityError as e:
        assert 'WRITE-ONCE LAW' in str(e)
    con.close()
    assert SqliteDatabase(db).verify_scar_chain()['ok']
    # with TTL of 1 day -> decayed -> cautionary retry
    m2 = VowEngineManager(SqliteDatabase(db), scar_ttl=86400)
    t2 = asyncio.run(m2.execute_vow_quest(SRC, 'PathChooser', dry_run=True))
    by = {x['strategy']: x for x in ast.literal_eval(t2['final_result'])['tournament']}
    assert 'skipped' not in by['shortcut']
    assert by['shortcut']['caution'] == 'aged_scar'
    # without TTL -> still skipped
    m3 = VowEngineManager(SqliteDatabase(db))
    t3 = asyncio.run(m3.execute_vow_quest(SRC, 'PathChooser', dry_run=True))
    by3 = {x['strategy']: x for x in ast.literal_eval(t3['final_result'])['tournament']}
    assert by3['shortcut'].get('skipped') == 'scar_memory'
