"""Tests for the Daily Behavioral Intelligence Report (vow digest).

One JSON digest per deployment per date: scars by kind, golden paths,
success/latency stats, whispers, skips, fleet lessons. Pure aggregation
over durable memory — the overseer's complete, non-fabricated feed.
"""
import json
import os
import subprocess
import sys
import tempfile

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}


def _base(tmp_path):
    return str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_dg_')


def _seed(db):
    """Six golden-arc runs (promotes safe_route) + one shared-mutable run
    (shared_reference whisper + entangled-marked scar)."""
    for _ in range(6):
        r = subprocess.run(
            [sys.executable, 'vow_cli.py', 'run',
             'examples/golden_path.vow', '--db', db],
            capture_output=True, text=True, cwd=PROJ, env=ENV)
        assert r.returncode == 0, r.stderr[-600:]
    r = subprocess.run(
        [sys.executable, 'vow_cli.py', 'run',
         'examples/quantum_dict.vow', '--db', db],
        capture_output=True, text=True, cwd=PROJ, env=ENV)
    assert r.returncode == 0, r.stderr[-600:]


def _digest(db, *extra):
    r = subprocess.run([sys.executable, 'vow_cli.py', 'digest',
                        '--db', db, *extra],
                       capture_output=True, text=True, cwd=PROJ, env=ENV)
    assert r.returncode == 0, r.stderr[-600:]
    return json.loads(r.stdout)


def test_digest_aggregates_the_organism(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        _seed(db)
        d = _digest(db, '--label', 'test-deploy')
        assert d['digest'] == 'vow-behavioral-daily/1'
        assert d['deployment'] == 'test-deploy'
        assert d['runs'] == 7, d
        assert sorted(d['quests']) == ['GoldenPath', 'InventoryCheck']
        # scars: one equality_mismatch, marked entangled
        assert d['scars']['total'] == 1
        assert d['scars']['by_kind'] == {'equality_mismatch': 1}
        assert d['scars']['entangled_marked'] == 1
        # successes: safe_route swept all six golden-arc tournaments
        assert d['successes']['by_strategy']['safe_route']['wins'] == 6
        assert d['successes']['by_strategy']['risky_route']['wins'] == 0
        assert d['successes']['by_strategy']['safe_route'][
            'mean_duration'] is not None
        # the golden path is visible by name, streak, and situation
        assert d['golden_paths'] == [{
            'quest': 'GoldenPath', 'strategy': 'safe_route',
            'seed': d['golden_paths'][0]['seed'], 'wins': 6}]
        # whispers and skips reconcile: 2 engaged + 1 challenger + 1 shared
        assert d['whispers']['by_kind']['golden_path_engaged'] == 2
        assert d['whispers']['by_kind']['golden_path_challenger_run'] == 1
        assert d['whispers']['by_kind']['shared_reference'] == 1
        assert d['skips'] == {'golden_path': 2}
        assert d['fleet']['inherited_lessons'] == 0
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_digest_out_file(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    out = os.path.join(base, 'daily.json')
    try:
        _seed(db)
        _digest(db, '--out', out)
        written = json.load(open(out))
        assert written['runs'] == 7
        assert written['golden_paths'][0]['strategy'] == 'safe_route'
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_digest_empty_db_graceful(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        d = _digest(db)
        assert d['runs'] == 0
        assert d['scars']['total'] == 0
        assert d['golden_paths'] == []
        assert d['whispers']['total'] == 0
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_digest_date_filter(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        _seed(db)
        d = _digest(db, '--date', '1999-01-01')
        assert d['runs'] == 0 and d['scars']['total'] == 0
        assert d['successes']['total'] == 0
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)
