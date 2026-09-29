# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import json
import os
import subprocess
import sys

PROJ = os.path.join(os.path.dirname(__file__), '..')


def run_unified(args, stdin=None):
    return subprocess.run([sys.executable, 'vow_unified.py'] + args,
                          input=stdin, capture_output=True, text=True,
                          cwd=PROJ, timeout=120)


def test_exec_file_emits_single_json_trace(tmp_path):
    db = str(tmp_path / 'u.db')
    r = run_unified(['exec', '--file', 'examples/discrimination.vow', '--db', db])
    assert r.returncode == 0, r.stderr[-400:]
    trace = json.loads(r.stdout)  # whole stdout is ONE JSON object
    assert trace['quest_name'] == 'BatchA'      # first quest by default
    assert trace['status'] == 'success'
    strategies = [t['strategy'] for t in trace['final_result']['tournament']]
    assert strategies == ['big_batch', 'split_batch']


def test_exec_stdin_memory_across_calls(tmp_path):
    """The Node.js pattern: two separate subprocess calls, one db — the
    second call remembers the first call's scar."""
    db = str(tmp_path / 'u.db')
    src = open(os.path.join(PROJ, 'examples', 'scar_avoidance.vow')).read()
    r1 = run_unified(['exec', '--db', db], stdin=src)
    assert r1.returncode == 0, r1.stderr[-300:]
    r2 = run_unified(['exec', '--db', db], stdin=src)
    trace = json.loads(r2.stdout)
    skipped = [t for t in trace['final_result']['tournament']
               if t.get('skipped')]
    assert skipped and skipped[0]['strategy'] == 'shortcut'


def test_exec_quest_selection(tmp_path):
    r = run_unified(['exec', '--file', 'examples/discrimination.vow',
                     '--quest', 'BatchB'])
    trace = json.loads(r.stdout)
    assert trace['quest_name'] == 'BatchB'


def test_passthrough_to_full_cli():
    r = run_unified(['run', 'examples/tournament_mixed.vow'])
    assert r.returncode == 0, r.stderr[-300:]
    assert json.loads(r.stdout[r.stdout.index('{'):])['status'] == 'success'


def test_error_exit_codes():
    r = run_unified(['exec', '--file', '/nonexistent.vow'])
    assert r.returncode == 2
    assert 'error' in json.loads(r.stdout)
    r = run_unified(['exec'], stdin='')          # no source at all
    assert r.returncode == 2
    r = run_unified(['exec'], stdin='goal "no quest here"')
    assert r.returncode == 3                     # parsed, but no quest


def test_python_api():
    sys.path.insert(0, PROJ)
    from vow_unified import execute_quest
    src = open(os.path.join(PROJ, 'examples', 'scar_avoidance.vow')).read()
    trace = execute_quest(src)                   # first quest, in-memory
    assert trace['status'] == 'success'
    trace2 = execute_quest(src, quest='PathChooser')
    assert trace2['quest_name'] == 'PathChooser'
