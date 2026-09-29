# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, subprocess, sys

PROJ = os.path.join(os.path.dirname(__file__), '..')

QUEST = '''quest PathChooser {
  goal "get there safely"
  tournament {
    score by proof_success * 0.6 + safety * 0.4
    strategy shortcut {
      cost 1
      risk 0.2
      let distance = 5
      prove distance > 10
    }
    strategy long_way {
      cost 2
      risk 0.1
      let distance = 12
      prove distance > 10
    }
  }
  success when distance > 10
}
'''


def run_repl(script, extra_args=None, cwd=PROJ):
    args = [sys.executable, 'vow_cli.py', 'repl'] + (extra_args or [])
    return subprocess.run(args, input=script, capture_output=True,
                          text=True, cwd=cwd, timeout=120)


def test_define_and_run_quest():
    r = run_repl(QUEST + ':run PathChooser\n:quit\n')
    assert r.returncode == 0, r.stderr[-500:]
    assert 'quest PathChooser defined' in r.stdout
    assert 'PathChooser: SUCCESS' in r.stdout
    assert 'why shortcut failed: distance > 10' in r.stdout
    assert 'off by 5' in r.stdout  # the autopsy, live


def test_learning_visible_across_runs_in_session():
    r = run_repl(QUEST + ':run PathChooser\n:run PathChooser\n:scars\n:quit\n')
    assert 'SKIPPED(scar_memory)' in r.stdout  # second run avoided it
    assert '1 scar(s)' in r.stdout
    assert 'threshold_violated' in r.stdout


def test_syntax_error_does_not_kill_session():
    r = run_repl('quest Broken { goal "x" prove }\n'
                 + QUEST + ':run PathChooser\n:quit\n')
    assert 'syntax error (nothing stored)' in r.stdout
    assert 'PathChooser: SUCCESS' in r.stdout  # session survived


def test_memory_persists_across_sessions_with_db(tmp_path):
    db = str(tmp_path / 'repl.db')
    r1 = run_repl(QUEST + ':run PathChooser\n:quit\n', ['--db', db])
    assert r1.returncode == 0, r1.stderr[-300:]
    # brand-new REPL process, same db: the scar is remembered
    r2 = run_repl(QUEST + ':run PathChooser\n:scars\n:quit\n', ['--db', db])
    assert 'SKIPPED(scar_memory)' in r2.stdout
    assert '1 scar(s)' in r2.stdout


def test_commands():
    r = run_repl(QUEST + ':quests\n:source PathChooser\n:ttl 60\n:dry\n:quit\n')
    assert 'defined quests: PathChooser' in r.stdout
    assert 'goal "get there safely"' in r.stdout
    assert 'scar TTL = 60' in r.stdout
    assert 'dry-run mode' in r.stdout
