"""Tests for the WHY query (vow_cli.py why): a read-only causal explanation
of a quest's durable memory — what hurt, what works, what happens next.
"""
import json
import os
import subprocess
import sys
import tempfile

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}


def _base(tmp_path):
    return str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_why_')


def _seed_memory(db):
    """One CLI run of tournament_mixed: wrong_answer fails (41 != 42) and
    records a scar; safe_and_correct wins and records a success."""
    r = subprocess.run(
        [sys.executable, 'vow_cli.py', 'run', 'examples/tournament_mixed.vow',
         '--db', db],
        capture_output=True, text=True, cwd=PROJ, env=ENV)
    assert r.returncode == 0, r.stderr[-600:]


def _why(db, *extra):
    return subprocess.run(
        [sys.executable, 'vow_cli.py', 'why', 'TournamentMixed',
         '--db', db, *extra],
        capture_output=True, text=True, cwd=PROJ, env=ENV)


def test_why_human_report(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        _seed_memory(db)
        r = _why(db)
        assert r.returncode == 0, r.stderr[-600:]
        out = r.stdout
        assert "WHY - quest 'TournamentMixed'" in out
        assert 'WHAT HURT (1)' in out, out
        assert 'wrong_answer' in out
        assert 'prove failed: result == answer [equality_mismatch]' in out, out
        assert 'off by 1' in out, out
        assert 'safe_and_correct' in out
        assert 'WHAT HAPPENS NEXT TIME' in out
        assert 'SKIPPED on identical recurrence' in out
        assert 'runs under CAUTION' in out
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_why_json_report(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        _seed_memory(db)
        r = _why(db, '--json')
        assert r.returncode == 0, r.stderr[-600:]
        rep = json.loads(r.stdout[r.stdout.index('{'):])
        assert rep['quest'] == 'TournamentMixed'
        assert rep['scar_count'] == 1
        assert rep['success_count'] >= 1
        hurt = rep['what_hurt'][0]
        assert hurt['strategy'] == 'wrong_answer'
        assert hurt['kind'] == 'equality_mismatch'
        assert hurt['margin']['off_by'] == 1
        assert any(n['prediction'].startswith('SKIPPED')
                   for n in rep['next_time'])
        assert any(n['prediction'] == 'runs clean'
                   and n['subject'] == 'safe_and_correct'
                   for n in rep['next_time'])
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_why_unknown_quest_is_graceful(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        r = subprocess.run(
            [sys.executable, 'vow_cli.py', 'why', 'NoSuchQuest',
             '--db', db],
            capture_output=True, text=True, cwd=PROJ, env=ENV)
        assert r.returncode == 0, r.stderr[-400:]
        assert 'no memory' in r.stdout
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_why_strategy_filter(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        _seed_memory(db)
        r = _why(db, '--strategy', 'safe_and_correct', '--json')
        rep = json.loads(r.stdout[r.stdout.index('{'):])
        assert rep['scar_count'] == 0
        assert rep['success_count'] >= 1
        assert all(w['strategy'] == 'safe_and_correct'
                   for w in rep['what_works'])
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)
