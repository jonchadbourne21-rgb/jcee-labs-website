"""Tests for the route block + intent/action policy.

The router classifies user input deterministically (zero tokens; first
match wins, fallback catches the rest). The intent declaration makes a
quest say what it IS; the runtime blocks the effects that intent denies —
whisper, blocked shadow, never executed, never a crash.
"""
import json
import os
import subprocess
import sys
import tempfile

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}
sys.path.insert(0, PROJ)

from vow.vow_parser import VowAdvancedParser  # noqa: E402

ROUTE_SRC = '''route intent from user_input {
  recognize "cancel", "refund" -> "termination_request"
  recognize "status", "where" -> "order_inquiry"
  fallback -> "general_inquiry"
}
quest Q {
  goal "g"
}
'''


def _base(tmp_path):
    return str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_rt_')


# --- router parsing + classification ---------------------------------------

def test_route_block_parses():
    prog = VowAdvancedParser(ROUTE_SRC).parse_program()
    assert len(prog.routes) == 1
    r = prog.routes[0]
    assert r.source == 'user_input'
    assert r.rows[0] == (['cancel', 'refund'], 'termination_request')
    assert r.rows[1] == (['status', 'where'], 'order_inquiry')
    assert r.fallback == 'general_inquiry'


def _classify(route, text):
    text = text.lower()
    for patterns, label in route.rows:
        for p in patterns:
            if p.lower() in text:
                return label
    return route.fallback


def test_classification_first_match_and_fallback():
    route = VowAdvancedParser(ROUTE_SRC).parse_program().routes[0]
    assert _classify(route, 'I want a REFUND') == 'termination_request'
    assert _classify(route, 'cancel my order') == 'termination_request'
    assert _classify(route, 'where is it?') == 'order_inquiry'
    assert _classify(route, 'hello') == 'general_inquiry'


def test_route_cli_e2e(tmp_path=None):
    base = _base(tmp_path)
    path = os.path.join(base, 'r.vow')
    try:
        with open(path, 'w') as fh:
            fh.write(ROUTE_SRC)
        cases = [('can I get a refund?', 'termination_request', 'refund'),
                 ('where is my package', 'order_inquiry', 'where'),
                 ('good morning', 'general_inquiry', None)]
        for text, intent, matched in cases:
            r = subprocess.run(
                [sys.executable, 'vow_cli.py', 'route', path, text],
                capture_output=True, text=True, cwd=PROJ, env=ENV)
            assert r.returncode == 0, r.stderr[-400:]
            out = json.loads(r.stdout)
            assert out['intent'] == intent, (text, out)
            assert out['matched'] == matched, (text, out)
            assert out['source'] == 'user_input'
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_route_cli_no_block(tmp_path=None):
    base = _base(tmp_path)
    path = os.path.join(base, 'noroute.vow')
    try:
        with open(path, 'w') as fh:
            fh.write('quest Q {\n  goal "g"\n}\n')
        r = subprocess.run(
            [sys.executable, 'vow_cli.py', 'route', path, 'hi'],
            capture_output=True, text=True, cwd=PROJ, env=ENV)
        assert r.returncode == 1
        assert 'no route block' in r.stdout
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


# --- intent/action policy ---------------------------------------------------

def test_intent_decl_parses():
    src = ('quest Q {\n  goal "g"\n'
           '  intent "general_inquiry" denies file_write, http_post\n}')
    prog = VowAdvancedParser(src).parse_program()
    decl = next(i for i in prog.quests[0].items
                if i.__class__.__name__ == 'IntentDecl')
    assert decl.name == 'general_inquiry'
    assert decl.denied == ['file_write', 'http_post']


def test_intent_violation_blocked_e2e(tmp_path=None):
    """file_write under a general_inquiry intent: whispered, recorded as a
    blocked shadow, and never executed."""
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    log = '/tmp/vow_intent_demo_log.txt'
    if os.path.exists(log):
        os.remove(log)
    try:
        r = subprocess.run(
            [sys.executable, 'vow_cli.py', 'run',
             'examples/route_intent.vow', '--db', db],
            capture_output=True, text=True, cwd=PROJ, env=ENV)
        assert r.returncode == 0, r.stderr[-600:]
        out = r.stdout
        assert 'intent_violation' in out, out[-800:]
        assert "'action': 'file_write'" in out
        assert "'blocked': True" in out
        assert not os.path.exists(log)  # the effect never happened
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_intent_allows_unlisted_effects(tmp_path=None):
    """An intent that denies http_post does NOT block file_write —
    the policy is scoped, not a blanket lockdown."""
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    path = os.path.join(base, 'ok.vow')
    try:
        with open(path, 'w') as fh:
            fh.write('quest Q {\n  goal "g"\n'
                     '  intent "admin_task" denies http_post\n'
                     '  capability file_write\n'
                     '  let x = file_write("/tmp/vow_intent_ok.txt", "hi")\n'
                     '  prove true\n  success when true\n}')
        r = subprocess.run(
            [sys.executable, 'vow_cli.py', 'run', path, '--db', db],
            capture_output=True, text=True, cwd=PROJ, env=ENV)
        assert r.returncode == 0, r.stderr[-600:]
        # assert on the whispers field itself — the trace also embeds the
        # generated source, which literally contains the check's code
        assert "'whispers': []" in r.stdout, r.stdout[-800:]
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)
