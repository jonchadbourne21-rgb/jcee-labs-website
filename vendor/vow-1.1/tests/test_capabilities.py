# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_parser import VowAdvancedParser
from vow.vow_transpiler import VowTranspiler, VowTranspileError


def transpile(src):
    ast = VowAdvancedParser(src).parse_program()
    return VowTranspiler(True).transpile(ast)


def build(src):
    g = {}
    exec(transpile(src), g)
    return g


def test_declared_gated_call_compiles():
    code = transpile('quest Q { capability network let p = http_get("http://x") '
                     'success when true }')
    assert "_vow_gated('network', 'http_get'" in code


def test_undeclared_gated_call_is_compile_error():
    try:
        transpile('quest Q { let p = http_get("http://x") success when true }')
        assert False
    except VowTranspileError as e:
        assert 'capability network' in str(e)


def test_gated_call_in_strategy_is_compile_error():
    try:
        transpile('''quest Q { capability network
          tournament { score by proof_success
            strategy s { cost 1 risk 0.0 let d = http_get("http://x") prove true } }
          success when true }''')
        assert False
    except VowTranspileError as e:
        assert 'pure computation' in str(e)


def test_dry_run_returns_shadow_and_records():
    g = build('quest Q { capability file_read let h = file_read("/etc/hostname") '
              'success when true }')
    g['vow_set_dry_run'](True)
    g['VowSideEffectRecorder'].clear()
    res = g['quest_Q']()
    assert res['success'] is True
    assert res['result']['h']['shadow'] is True
    fx = g['VowSideEffectRecorder'].all()
    assert len(fx) == 1 and fx[0]['detail']['executed'] is False
    assert fx[0]['kind'] == 'file_read:file_read'


def test_live_executes_real_effect():
    g = build('quest Q { capability file_write capability file_read '
              'let w = file_write("/tmp/vow_gate_test.txt", "hello vow") '
              'let r = file_read("/tmp/vow_gate_test.txt") '
              'success when r == "hello vow" }')
    g['vow_set_dry_run'](False)
    res = g['quest_Q']()
    g['vow_set_dry_run'](True)
    assert res['success'] is True
    assert open('/tmp/vow_gate_test.txt').read() == 'hello vow'
    os.remove('/tmp/vow_gate_test.txt')


def test_model_ask_requires_handler_live():
    g = build('quest Q { capability model let a = model_ask("hi") success when true }')
    g['vow_set_dry_run'](False)
    try:
        g['quest_Q']()
        assert False
    except RuntimeError as e:
        assert '_vow_model_handler' in str(e)
    g['vow_set_dry_run'](True)
