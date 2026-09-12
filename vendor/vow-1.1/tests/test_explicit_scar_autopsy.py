"""Tests for OWED 8 — explicit scars carry an autopsy (2026-07-25).

The dissertation's debt: "An `on fail { scar "..." }` row stores the
message the author wrote, with no reason block of the kind `_vow_prove`
attaches automatically… A small change — capture the failing context at
the `on fail` site — would make explicit lessons as rich as automatic
ones."

The cure: at the on-fail site the explicit scar ADOPTS the triggering
failure's autopsy (a prove failure's reason; a success-clause failure
gets an autopsy of its own, staged by _vow_finish before on_fail runs).
No quest/strategy/seed keys are added — exact-skip/caution matching
reads those, and explicit scars keep their long-standing matching
semantics. This debt was about a THIN REASON, not about who skips.
"""
import ast
import asyncio
import json
import os
import sys

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJ)

from main import VowEngineManager                     # noqa: E402
from vow.database import SqliteDatabase               # noqa: E402

SRC_PROVE = '''quest Wounded {
  goal "g"
  believe amount = 100 confidence 1.0 source "s"
  let doubled = amount * 2
  prove doubled == 300
  on fail {
    scar "invoice mismatch on doubled amount"
  }
  success when true
}
'''

SRC_SUCCESS = '''quest Missed {
  goal "g"
  believe amount = 100 confidence 1.0 source "s"
  let doubled = amount * 2
  on fail {
    scar "did not reach the target"
  }
  success when doubled == 300
}
'''

SRC_BODY = '''quest Manual {
  goal "g"
  let x = 1
  scar "operator note: watch this path"
  success when x == 1
}
'''

SRC_TOURN = '''quest Field {
  goal "g"
  believe n = 2 confidence 1.0 source "s"
  tournament {
    score by proof_success * 0.8 + safety * 0.2
    strategy alpha {
      cost 1
      risk 0.1
      let out = n + 1
      prove out == 3
    }
    strategy beta {
      cost 1
      risk 0.9
      let out = n * 2
      prove out == 4
    }
  }
  on fail {
    scar "field missed its mark"
  }
  success when out == 999
}
'''


def _run(db, src, quest):
    """Returns the trace. A quest that RAISES (body prove failure)
    yields an error trace (status 'failed'); a quest whose success
    clause merely fails yields final_result with success False."""
    m = VowEngineManager(SqliteDatabase(db))
    return asyncio.run(m.execute_vow_quest(src, quest, dry_run=True))


def _fin(t):
    return ast.literal_eval(t['final_result'])


def _scars(db):
    out = []
    for s in SqliteDatabase(db).recall_all_scars_sync():
        ctx = s.get('context')
        if isinstance(ctx, str):
            ctx = json.loads(ctx)
        out.append((s, ctx or {}))
    return out


def test_prove_triggered_scar_adopts_the_full_autopsy(tmp_path):
    db = str(tmp_path / 'p.db')
    t = _run(db, SRC_PROVE, 'Wounded')
    assert t['status'] == 'failed_proof'   # the prove raised
    scars = _scars(db)
    assert len(scars) == 2   # the automatic prove scar + the explicit one
    auto = [c for _s, c in scars if not c.get('explicit')][0]
    expl_s, expl = [(s, c) for s, c in scars if c.get('explicit')][0]
    # the author's message is preserved…
    assert expl_s['message'] == 'invoice mismatch on doubled amount'
    # …and the reason is as rich as the automatic one's
    reason = expl['reason']
    assert reason['kind'] == 'equality_mismatch'
    assert reason['prove'] == 'doubled == 300'
    assert reason['margin']['off_by'] == 100
    assert reason['margin']['actual'] == 200
    assert reason == auto['reason']


def test_success_clause_failure_stages_its_own_autopsy(tmp_path):
    """No prove anywhere — the failing context is the success clause
    itself, and _vow_finish stages its autopsy before on_fail runs."""
    db = str(tmp_path / 's.db')
    fin = _fin(_run(db, SRC_SUCCESS, 'Missed'))
    assert fin['success'] is False
    scars = _scars(db)
    assert len(scars) == 1
    _s, ctx = scars[0]
    assert ctx['explicit'] is True
    reason = ctx['reason']
    assert reason['kind'] == 'equality_mismatch'
    assert reason['prove'] == 'doubled == 300'
    assert reason['margin']['off_by'] == 100


def test_no_failure_means_an_honest_label(tmp_path):
    """A manual scar with no triggering failure says so — it never
    borrows an unrelated autopsy."""
    db = str(tmp_path / 'm.db')
    fin = _fin(_run(db, SRC_BODY, 'Manual'))
    assert fin['success'] is True
    _s, ctx = _scars(db)[0]
    assert ctx['explicit'] is True
    assert ctx['reason'] == {'prove': None, 'kind': 'explicit_scar'}


def test_matching_semantics_unchanged(tmp_path):
    """Explicit scars still skip and caution NOTHING (no strategy/quest/
    seed keys are added): the field reruns clean on the second pass —
    this debt was about a thin reason, not about who skips."""
    db = str(tmp_path / 't.db')
    _run(db, SRC_TOURN, 'Field')
    _s, ctx = _scars(db)[0]
    assert ctx['explicit'] is True
    assert ctx['reason']['kind'] == 'equality_mismatch'
    assert 'strategy' not in ctx and 'seed' not in ctx
    fin2 = _fin(_run(db, SRC_TOURN, 'Field'))
    by = {m['strategy']: m for m in fin2['tournament']}
    assert by['alpha'].get('skipped') is None
    assert by['beta'].get('skipped') is None
    assert by['alpha'].get('caution') is None
    assert by['beta'].get('caution') is None


def test_exported_lessons_are_rich_now(tmp_path):
    """The dividend: explicit lessons crossing the fleet boundary carry
    prove/kind/margin instead of three Nones — as rich as automatic
    ones, exactly as the debt ordered."""
    db = str(tmp_path / 'f.db')
    _run(db, SRC_PROVE, 'Wounded')
    from vow.fleet import export_lessons
    scars = [s for s, c in
             [(s, (json.loads(s['context']) if isinstance(s['context'], str)
                   else s.get('context')) or {})
              for s in SqliteDatabase(db).recall_all_scars_sync()]
             if c.get('explicit')]
    lesson = export_lessons(scars)[0]
    assert lesson['prove'] == 'doubled == 300'
    assert lesson['kind'] == 'equality_mismatch'
    assert lesson['margin'] == {'op': '==', 'off_by': 100}
    assert lesson['note'] == 'invoice mismatch on doubled amount'
