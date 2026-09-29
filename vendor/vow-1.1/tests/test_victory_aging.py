"""Tests for OWED 5 — victory aging (2026-07-24).

The dissertation's debt: "Scars decay through the TTL cycle into
cautionary retry; victories do not decay at all. A golden path earned
three months ago is golden today even if the world drifted under an
identical input fingerprint… Victories should age the way wounds do,
gently."

The cure: runbook row `success_ttl` — a victory older than the TTL stops
counting toward golden-path qualification. GENTLY: the streak fades win
by win (a 5-win golden keeps the crown while 3 wins stay fresh), the
field simply reopens, the faded crown is a WHISPER never a silence, and
the rows are history — never deleted, never touched. Runbook-only (no
flag): the standing law is the point.
"""
import ast
import asyncio
import os
import sys
from datetime import timedelta

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJ)

try:
    import pytest
except ImportError:  # pytest-less machines: honest fallback
    import re
    import unittest

    class _Shim:
        class _Raises:
            def __init__(self, exc, match=None):
                self.exc, self.match = exc, match

            def __enter__(self):
                return self

            def __exit__(self, t, v, tb):
                assert t is not None and issubclass(t, self.exc), \
                    f'expected {self.exc}'
                if self.match:
                    assert re.search(self.match, str(v)), \
                        f'no match {self.match!r} in {v}'
                return True

        def raises(self, exc, match=None):
            return self._Raises(exc, match)

        def skip(self, reason=''):
            raise unittest.SkipTest(reason)

    pytest = _Shim()

from vow.vow_parser import VowAdvancedParser                      # noqa: E402
from vow.vow_transpiler import VowTranspiler, VowTranspileError   # noqa: E402

SRC_TTL = '''domain "sop"
runbook {
  success_ttl = 3600
}
quest Victors {
  goal "keep the map honest"
  believe batch = 100 confidence 1.0 source "sop manual"
  tournament {
    score by proof_success * 0.8 + safety * 0.2
    strategy risky_route {
      cost 1
      risk 0.9
      let result = batch * 2
      prove result == 200
    }
    strategy safe_route {
      cost 1
      risk 0.1
      let result = batch + batch
      prove result == 200
    }
  }
  success when result == 200
}
'''

SRC_PLAIN = SRC_TTL.replace('runbook {\n  success_ttl = 3600\n}\n', '')


def _run(db, src):
    from main import VowEngineManager
    from vow.database import SqliteDatabase
    m = VowEngineManager(SqliteDatabase(db))
    t = asyncio.run(m.execute_vow_quest(src, 'Victors', dry_run=True))
    return ast.literal_eval(t['final_result'])


def _stage(db, src, old_runs, fresh_runs):
    """History is WRITTEN old (an import, a migration — never backdated:
    the rows' timestamps are their true declared birth, honestly
    fingerprinted and signed by the old clock)."""
    import vow.database as vdb
    real_dt = vdb.datetime
    if old_runs:
        old_dt = real_dt.now() - timedelta(days=2)

        class _OldClock:
            @staticmethod
            def now(*a, **k):
                return old_dt

        vdb.datetime = _OldClock
    try:
        for _ in range(old_runs):
            _run(db, src)
    finally:
        vdb.datetime = real_dt
    for _ in range(fresh_runs):
        _run(db, src)


def _whisper_kinds(fin):
    return [w.get('kind') or w.get('type') for w in fin['whispers']]


# --- transpiler surface -----------------------------------------------------

def test_success_ttl_resolves_and_emits_guarded_law():
    code = VowTranspiler().transpile(
        VowAdvancedParser(SRC_TTL).parse_program())
    assert "'success_ttl': 3600" in code
    assert 'if _VOW_SUCCESS_TTL is None:' in code
    g = {}
    exec(code, g)
    assert g['_VOW_SUCCESS_TTL'] == 3600
    g2 = {}
    exec(VowTranspiler().transpile(
        VowAdvancedParser(SRC_PLAIN).parse_program()), g2)
    assert g2['_VOW_SUCCESS_TTL'] is None        # default: never age


def test_success_ttl_validation_is_loud():
    with pytest.raises(VowTranspileError, match='non-negative'):
        VowTranspiler().transpile(VowAdvancedParser(
            'runbook { success_ttl = 0 - 5 }\n'
            'quest Q { goal "g" success when true }').parse_program())
    with pytest.raises(VowTranspileError):
        VowTranspiler().transpile(VowAdvancedParser(
            'runbook { success_ttl = runtime_ref }\n'
            'quest Q { goal "g" success when true }').parse_program())


# --- the arc -----------------------------------------------------------------

def test_stale_gold_loses_the_crown(tmp_path):
    """Three victories two days old + a one-hour TTL: the field reopens,
    the fade is whispered, nothing is skipped, nothing is deleted."""
    db = str(tmp_path / 'aged.db')
    _stage(db, SRC_TTL, old_runs=3, fresh_runs=0)
    fin = _run(db, SRC_TTL)
    kinds = _whisper_kinds(fin)
    assert 'golden_path_faded' in kinds
    assert 'golden_path_engaged' not in kinds
    faded = [w['detail'] for w in fin['whispers']
             if (w.get('kind') or w.get('type')) == 'golden_path_faded'][0]
    assert faded['strategy'] == 'safe_route'
    assert faded['stale_wins'] == 3
    assert faded['fresh_wins'] == 0
    assert faded['ttl'] == 3600
    by = {t['strategy']: t for t in fin['tournament']}
    assert by['risky_route'].get('skipped') is None   # the field reopened
    assert by['safe_route'].get('skipped') is None
    # and the rows are history, untouched: 3 wins + this run's = 4
    from vow.database import SqliteDatabase
    wins = SqliteDatabase(db).recall_success_sync('Victors', 'safe_route')
    assert len([w for w in wins if w['won']]) == 4


def test_default_victories_never_age(tmp_path):
    """Same staging without the runbook row: two-day-old gold still
    crowns — the pre-Owed-5 behavior is the honest default."""
    db = str(tmp_path / 'plain.db')
    _stage(db, SRC_PLAIN, old_runs=3, fresh_runs=0)
    fin = _run(db, SRC_PLAIN)
    kinds = _whisper_kinds(fin)
    assert 'golden_path_engaged' in kinds
    by = {t['strategy']: t for t in fin['tournament']}
    assert by['risky_route'].get('skipped') == 'golden_path'


def test_fresh_gold_still_crowns_under_ttl(tmp_path):
    """Aging is not amnesia: victories inside the TTL count as always."""
    db = str(tmp_path / 'fresh.db')
    _stage(db, SRC_TTL, old_runs=0, fresh_runs=3)
    fin = _run(db, SRC_TTL)
    assert 'golden_path_engaged' in _whisper_kinds(fin)
    by = {t['strategy']: t for t in fin['tournament']}
    assert by['risky_route'].get('skipped') == 'golden_path'


def test_the_fade_is_gentle_win_by_win(tmp_path):
    """The crown fades WIN BY WIN, not all at once: 1 old + 3 fresh
    keeps the crown (3 fresh qualify); 2 old + 2 fresh loses it (only 2
    fresh — and the whisper says exactly that)."""
    db = str(tmp_path / 'mixed.db')
    _stage(db, SRC_TTL, old_runs=1, fresh_runs=3)
    fin = _run(db, SRC_TTL)
    assert 'golden_path_engaged' in _whisper_kinds(fin)

    db2 = str(tmp_path / 'mixed2.db')
    _stage(db2, SRC_TTL, old_runs=2, fresh_runs=2)
    fin2 = _run(db2, SRC_TTL)
    kinds2 = _whisper_kinds(fin2)
    assert 'golden_path_engaged' not in kinds2
    faded = [w['detail'] for w in fin2['whispers']
             if (w.get('kind') or w.get('type')) == 'golden_path_faded'][0]
    assert faded['stale_wins'] == 2
    assert faded['fresh_wins'] == 2
