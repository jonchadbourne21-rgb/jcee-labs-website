"""Unit tests for the durability journal (Arc 3A, docs/DURABILITY.md).

The JournalRuntime is the keystone of crash durability: hash-chained
append-only events, a strict single replay cursor, and replay semantics
for effects, memory reads/writes, and tournament outcomes. These tests
pin the mechanism; the e2e crash tests live in test_crash_resume.py.
"""
import os
import sys
import tempfile

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJ)

try:
    import pytest
except ImportError:  # pytest-less machines: honest fallback, never an import error
    import re, unittest
    class _Shim:
        class _Raises:
            def __init__(self, exc, match=None): self.exc, self.match = exc, match
            def __enter__(self): return self
            def __exit__(self, t, v, tb):
                assert t is not None and issubclass(t, self.exc), f'expected {self.exc}'
                if self.match: assert re.search(self.match, str(v)), f'no match {self.match!r} in {v}'
                return True
        def raises(self, exc, match=None): return self._Raises(exc, match)
        def skip(self, reason=''): raise unittest.SkipTest(reason)
    pytest = _Shim()

from vow.database import SqliteDatabase  # noqa: E402
from vow.vow_transpiler import (JournalRuntime,  # noqa: E402
                                VowJournalMismatch)


def _live(tmp_path, name='m.db', run_id='run1'):
    db = SqliteDatabase(str(tmp_path / name))
    j = JournalRuntime(db, run_id, mode='live')
    db.journal = j
    return db, j


def _replay(tmp_path, source_db, run_id='run1', name='m2.db'):
    events = source_db.load_journal(run_id)
    db2 = SqliteDatabase(str(tmp_path / name))
    j2 = JournalRuntime(db2, run_id, mode='replay', events=events)
    db2.journal = j2
    return db2, j2


# --- hash chain ---------------------------------------------------------------

def test_chain_verifies_and_detects_tamper(tmp_path):
    db, j = _live(tmp_path)
    j.append('run_begin', {'quest': 'Q'})
    j.append('effect_intent', {'capability': 'shell', 'action': 'shell_exec',
                               'args': ['ls']})
    j.append('run_end', {'status': 'success'})
    events = db.load_journal('run1')
    ok, msg = JournalRuntime.verify_chain('run1', events)
    assert ok, msg
    # WRITE-ONCE LAW (author decree 2026-07-23): direct SQL tampering is
    # refused by the store itself — the wall is the first line.
    import sqlite3 as _sq
    try:
        db._conn.execute("UPDATE journal_events SET payload = '{}'"
                         " WHERE seq = 2")
        db._conn.commit()
        raise AssertionError('the wall did not refuse journal tampering')
    except _sq.IntegrityError as e:
        assert 'WRITE-ONCE LAW' in str(e)
    # defense in depth: an attacker with file access can drop the
    # trigger — and the CHAIN still catches the tamper (second line).
    db._conn.execute("DROP TRIGGER write_once_journal_events_update")
    db._conn.execute("UPDATE journal_events SET payload = '{}' WHERE seq = 2")
    db._conn.commit()
    ok, msg = JournalRuntime.verify_chain('run1', db.load_journal('run1'))
    assert not ok and 'seq 2' in msg
    # a wrong run_id fails verification too (the id is inside the hash)
    db._conn.execute("UPDATE journal_events SET payload = ? WHERE seq = 2",
                     (events[1]['payload'] and __import__('json').dumps(
                         events[1]['payload'], sort_keys=True),))
    db._conn.commit()
    ok, _ = JournalRuntime.verify_chain('WRONG', db.load_journal('run1'))
    assert not ok


# --- effects -------------------------------------------------------------------

def test_effect_record_and_replay_ok(tmp_path):
    db, j = _live(tmp_path)
    shadow = {'shadow': True, 'action': 'file_write', 'args': ['f', 'v']}
    out = j.effect_record('file', 'write', ['f', 'v'], lambda: True, shadow)
    assert out is True
    db2, j2 = _replay(tmp_path, db)
    ins = j2.effect_replay('file', 'write', ['f', 'v'])
    assert ins is not None and ins['outcome'] == 'ok' and ins['result'] is True
    # cursor exhausted: the next call flips to live and appends replay_end
    assert j2.effect_replay('file', 'write', ['g', 'w']) is None
    assert j2.mode == 'live'
    kinds = [e['kind'] for e in db2.load_journal('run1')]
    assert 'replay_end' in kinds


def test_effect_shadow_outcome_roundtrips(tmp_path):
    db, j = _live(tmp_path)
    shadow = {'shadow': True, 'action': 'http_get', 'args': ['u']}
    out = j.effect_record('net', 'get', ['u'], lambda: shadow, shadow)
    assert out is shadow
    _, j2 = _replay(tmp_path, db)
    ins = j2.effect_replay('net', 'get', ['u'])
    assert ins['outcome'] == 'shadow' and ins['shadow'] == shadow


def test_effect_error_is_journaled_and_reraised(tmp_path):
    db, j = _live(tmp_path)
    def boom():
        raise ValueError('kaput')
    with pytest.raises(ValueError):
        j.effect_record('shell', 'exec', ['x'], boom, None)
    _, j2 = _replay(tmp_path, db)
    ins = j2.effect_replay('shell', 'exec', ['x'])
    assert ins['outcome'] == 'error' and 'kaput' in ins['error']


def test_effect_blocked_records_whisper(tmp_path):
    db, j = _live(tmp_path)
    shadow = {'shadow': True, 'action': 'file_write', 'blocked': True}
    j.effect_record_blocked('file', 'write', ['f', 'v'], shadow,
                            {'kind': 'intent_violation', 'detail': {'a': 1}})
    _, j2 = _replay(tmp_path, db)
    ins = j2.effect_replay('file', 'write', ['f', 'v'])
    assert ins['outcome'] == 'blocked' and ins['shadow']['blocked'] is True
    assert ins['whisper']['kind'] == 'intent_violation'


def test_crash_window_intent_without_result_goes_live(tmp_path):
    db, j = _live(tmp_path)
    j.append('run_begin', {'quest': 'Q'})
    j.append('effect_intent', {'capability': 'shell', 'action': 'shell_exec',
                               'args': ['sleep 3']})
    # process dies here: intent committed, result never written
    db2, j2 = _replay(tmp_path, db)
    assert j2.effect_replay('shell', 'shell_exec', ['sleep 3']) is None
    assert j2.mode == 'live'
    tail = db2.load_journal('run1')[-1]
    assert tail['kind'] == 'replay_end'
    assert 'crash window' in tail['payload'].get('note', '')


def test_effect_mismatch_refuses(tmp_path):
    db, j = _live(tmp_path)
    j.append('effect_intent', {'capability': 'file', 'action': 'write',
                               'args': ['a']})
    j.append('effect_result', {'capability': 'file', 'action': 'write',
                               'outcome': 'ok', 'result': True})
    _, j2 = _replay(tmp_path, db)
    with pytest.raises(VowJournalMismatch, match='diverged'):
        j2.effect_replay('file', 'write', ['DIFFERENT'])


# --- memory ---------------------------------------------------------------------

def test_mem_recall_live_journals_rows_and_replay_never_fetches(tmp_path):
    db, j = _live(tmp_path)
    rows = [{'message': 'm1', 'context': None}]
    out = j.mem_recall({'store': 'scar', 'scope': 'all'}, lambda: rows)
    assert out == rows
    _, j2 = _replay(tmp_path, db)
    def forbidden():
        raise AssertionError('replay must never consult the DB')
    assert j2.mem_recall({'store': 'scar', 'scope': 'all'}, forbidden) == rows


def test_mem_recall_key_mismatch_refuses(tmp_path):
    db, j = _live(tmp_path)
    j.mem_recall({'store': 'scar', 'scope': 'all'}, lambda: [])
    _, j2 = _replay(tmp_path, db)
    with pytest.raises(VowJournalMismatch, match='memory read diverged'):
        j2.mem_recall({'store': 'success', 'scope': 'all'}, lambda: [])


def test_mem_write_suppression_and_mismatch(tmp_path):
    db, j = _live(tmp_path)
    payload = {'store': 'scar', 'quest': 'Q', 'message': 'm', 'context': None}
    assert j.mem_write_decision(payload) is False   # live: caller writes
    db.record_scar_sync({'quest_name': 'Q', 'message': 'm', 'context': None})
    _, j2 = _replay(tmp_path, db)
    assert j2.mem_write_decision(payload) is True    # replay: suppressed
    # and a divergent write refuses
    db3, j3 = _replay(tmp_path, db, name='m3.db')
    with pytest.raises(VowJournalMismatch, match='memory write diverged'):
        j3.mem_write_decision({'store': 'scar', 'quest': 'Q',
                               'message': 'OTHER', 'context': None})


def test_mem_write_event_is_atomic_with_the_row(tmp_path):
    """The mem_write event and its scar row commit in one transaction."""
    db, j = _live(tmp_path)
    db.record_scar_sync({'quest_name': 'Q', 'message': 'm', 'context': None})
    evs = [e for e in db.load_journal('run1') if e['kind'] == 'mem_write']
    assert len(evs) == 1 and evs[0]['payload']['message'] == 'm'
    rows = db._conn.execute("SELECT COUNT(*) FROM scars").fetchone()
    assert rows[0] == 1


# --- tournaments ------------------------------------------------------------------

def test_tournament_event_live_and_replay(tmp_path):
    db, j = _live(tmp_path)
    results = [{'strategy': 'a', 'score': 9}, {'strategy': 'b', 'score': 3}]
    assert j.tournament_event('seed1', results, 'a', ['a', 'b']) is None
    _, j2 = _replay(tmp_path, db)
    p = j2.tournament_event('seed1', [], 'IGNORED', ['a', 'b'])
    assert p['winner'] == 'a' and p['results'] == results


def test_tournament_replay_validates_winner_and_seed(tmp_path):
    db, j = _live(tmp_path)
    j.tournament_event('seed1', [{'strategy': 'a', 'score': 9}], 'a', ['a'])
    _, j2 = _replay(tmp_path, db)
    with pytest.raises(VowJournalMismatch, match='did not pass proofs'):
        j2.tournament_event('seed1', [], 'IGNORED', ['b'])  # winner not live
    db3, j3 = _replay(tmp_path, db, name='m3.db')
    with pytest.raises(VowJournalMismatch, match='seed diverged'):
        j3.tournament_event('OTHER', [], 'IGNORED', ['a'])


# --- cursor discipline --------------------------------------------------------------

def test_markers_are_skipped_by_the_cursor(tmp_path):
    db, j = _live(tmp_path)
    j.append('run_begin', {'quest': 'Q'})
    j.append('effect_intent', {'capability': 'c', 'action': 'a', 'args': []})
    j.append('effect_result', {'capability': 'c', 'action': 'a',
                               'outcome': 'ok', 'result': 1})
    j.append('resume_begin', {'at_seq': 3})   # a prior life's marker
    j.append('replay_end', {'at_seq': 3})
    j.append('effect_intent', {'capability': 'c', 'action': 'b', 'args': []})
    j.append('effect_result', {'capability': 'c', 'action': 'b',
                               'outcome': 'ok', 'result': 2})
    _, j2 = _replay(tmp_path, db)
    assert j2.effect_replay('c', 'a', [])['result'] == 1
    assert j2.effect_replay('c', 'b', [])['result'] == 2
    assert j2.unconsumed == 0
