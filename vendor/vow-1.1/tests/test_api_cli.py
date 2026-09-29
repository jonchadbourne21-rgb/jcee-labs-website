# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""REST API entry point (api_server.py) + extended CLI surface."""
import json, os, subprocess, sys, tempfile, threading, urllib.request
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import api_server
from main import MockDatabase

PROJ = os.path.join(os.path.dirname(__file__), '..')

QUEST = '''
quest hello_api {
  goal "api smoke"
  capability model
  strategy s {
    let x = 1
    prove x == 1
  }
  success when true
}
'''

FAIL_QUEST = '''
@learn
quest api_fail {
  goal "records a scar"
  capability model
  strategy s {
    scar "api_fail lesson"
    let x = 1
    prove x == 2
  }
  success when true
}
'''


def _server():
    srv = api_server.VowApiServer(('127.0.0.1', 0), MockDatabase())
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    return srv, srv.server_address[1]


def _get(port, path, expect=200):
    try:
        with urllib.request.urlopen(
                f'http://127.0.0.1:{port}{path}', timeout=10) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def _post(port, path, body, expect=200):
    req = urllib.request.Request(
        f'http://127.0.0.1:{port}{path}',
        data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def test_health():
    srv, port = _server()
    try:
        status, body = _get(port, '/health')
        assert status == 200 and body['status'] == 'ok'
    finally:
        srv.shutdown()


def test_run_and_transpile_and_traces():
    srv, port = _server()
    try:
        status, trace = _post(port, '/run', {'source': QUEST})
        assert status == 200 and trace['status'] == 'success'
        assert trace['quest_name'] == 'hello_api'
        assert 'scar_injection' in trace      # validator evidence wired
        status, out = _post(port, '/transpile', {'source': QUEST})
        assert status == 200 and 'def quest_hello_api' in out['shadow_python']
        run_id = trace['run_id']
        status, saved = _get(port, f'/traces/{run_id}')
        assert status == 200 and saved['quest_name'] == 'hello_api'
        status, body = _get(port, '/traces/nope')
        assert status == 404 and 'unknown run_id' in body['error']
    finally:
        srv.shutdown()


def test_run_scar_then_read_scars():
    srv, port = _server()
    try:
        status, trace = _post(port, '/run', {'source': FAIL_QUEST})
        assert status == 200
        status, body = _get(port, '/scars?quest=api_fail')
        assert status == 200 and body['count'] >= 1
        assert any('api_fail lesson' in (x['message'] or '')
                   for x in body['scars'])
    finally:
        srv.shutdown()


def test_bad_requests_are_honest_errors():
    srv, port = _server()
    try:
        req = urllib.request.Request(
            f'http://127.0.0.1:{port}/run', data=b'{not json',
            headers={'Content-Type': 'application/json'})
        try:
            urllib.request.urlopen(req, timeout=10)
            assert False, 'expected 400'
        except urllib.error.HTTPError as e:
            assert e.code == 400
            assert 'invalid JSON' in json.loads(e.read())['error']
        status, body = _post(port, '/run', {'source': ''})
        assert status == 400
        status, body = _get(port, '/nonexistent')
        assert status == 404
    finally:
        srv.shutdown()


def test_dry_run_is_default_live_is_explicit():
    srv, port = _server()
    try:
        src = '''
quest modes {
  goal "mode check"
  capability file_read
  let c = file_read("/etc/hostname")
  strategy s {
    let ok = 1
    prove ok == 1
  }
  success when true
}
'''
        status, trace = _post(port, '/run', {'source': src})
        assert status == 200 and trace['dry_run'] is True
        status, trace = _post(port, '/run', {'source': src, 'live': True})
        assert status == 200 and trace['dry_run'] is False
    finally:
        srv.shutdown()


# ---------------- CLI surface ----------------
def _cli(*argv, cwd=PROJ):
    return subprocess.run([sys.executable, 'vow_cli.py'] + list(argv),
                          capture_output=True, text=True, cwd=cwd)


def test_cli_transpile_and_shadow_alias():
    r = _cli('transpile', 'examples/control_flow.vow')
    assert r.returncode == 0 and 'def quest_' in r.stdout
    r2 = _cli('shadow', 'examples/control_flow.vow')
    assert r2.returncode == 0 and r2.stdout == r.stdout


def test_cli_validate_shadow_and_roundtrip():
    r = _cli('validate-shadow', 'examples/control_flow.vow')
    assert r.returncode == 0
    assert json.loads(r.stdout)['reversible'] is True
    r = _cli('roundtrip', 'examples/control_flow.vow')
    assert r.returncode == 0
    body = json.loads(r.stdout)
    assert body['reversible'] is True
    assert 'quest ' in body['roundtrip_vow']


def test_cli_scars_list_and_stats():
    with tempfile.TemporaryDirectory() as td:
        db = os.path.join(td, 'm.db')
        r = _cli('run', 'examples/learning_loop.vow', '--db', db)
        assert r.returncode == 0
        r = _cli('scars', 'list', '--db', db)
        assert r.returncode == 0
        scars = json.loads(r.stdout)['scars']
        assert any('prove failed' in (x['message'] or '') for x in scars)
        r = _cli('scars', 'stats', '--db', db, '--quest', 'CheckoutBatcher')
        assert r.returncode == 0
        stats = json.loads(r.stdout)
        assert stats['total'] >= 1
        assert 'CheckoutBatcher' in stats['by_quest']
        assert stats['by_strategy'].get('big_batch', 0) >= 1


def test_cli_fmt_and_lint():
    messy = 'quest q {\ngoal "x"\ncapability model\nstrategy s {\nlet a = 1\nprove a == 1\n}\nsuccess when true\n}\n'
    with tempfile.TemporaryDirectory() as td:
        f = os.path.join(td, 'messy.vow')
        open(f, 'w').write(messy)
        r = _cli('fmt', f)
        assert r.returncode == 0 and '  goal "x"' in r.stdout
        r = _cli('fmt', f, '--check')
        assert r.returncode == 1      # not yet formatted
        assert json.loads(r.stdout)['formatted_already'] is False
        r = _cli('lint', f)
        assert r.returncode == 0
        assert json.loads(r.stdout)['errors'] == 0
    r = _cli('lint', 'examples/learning_loop.vow')
    assert r.returncode == 0


def test_cli_lint_catches_learn_without_scars():
    bad = '''
@learn
quest bare {
  goal "no lessons"
  capability model
  strategy s {
    let x = 1
    prove x == 2
  }
  success when true
}
'''
    with tempfile.TemporaryDirectory() as td:
        f = os.path.join(td, 'bad.vow')
        open(f, 'w').write(bad)
        r = _cli('lint', f)
        assert r.returncode == 1
        findings = json.loads(r.stdout)['findings']
        assert any(x['rule'] == 'scar-injection' and x['severity'] == 'error'
                   for x in findings)


def test_unified_file_first_forms():
    def u(*argv):
        return subprocess.run([sys.executable, 'vow_unified.py'] + list(argv),
                              capture_output=True, text=True, cwd=PROJ)
    r = u('examples/control_flow.vow', 'run')
    assert r.returncode == 0
    assert json.loads(r.stdout[r.stdout.index('{'):])['status'] == 'success'
    r = u('examples/control_flow.vow', 'transpile', '--to-python')
    assert r.returncode == 0 and 'def quest_' in r.stdout
    # command-first remains valid
    r = u('run', 'examples/control_flow.vow')
    assert r.returncode == 0
