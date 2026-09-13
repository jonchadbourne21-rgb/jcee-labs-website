# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_parser import VowAdvancedParser
from vow.vow_transpiler import (VowTranspiler, verify_shadow_signature,
                                VowSecurityError)

KEY = os.urandom(32)


def signed(src, key=KEY):
    return VowTranspiler(True, signing_key=key).transpile(
        VowAdvancedParser(src).parse_program())


def test_unsigned_by_default():
    code = VowTranspiler(True).transpile(
        VowAdvancedParser('quest Q { goal "g" }').parse_program())
    assert 'VOW-SIGNATURE' not in code


def test_signed_when_keyed():
    assert '# VOW-SIGNATURE: ' in signed('quest Q { goal "g" }').splitlines()[0]


def test_valid_signature_passes():
    verify_shadow_signature(signed('quest Q { goal "g" }'), KEY)


def test_tampered_rejected():
    code = signed('quest Q { goal "g" success when true }')
    try:
        lines = code.splitlines(keepends=True)
        lines[1] = lines[1] + '# tampered\n'  # mutate body after sig line
        verify_shadow_signature(''.join(lines), KEY)
        assert False
    except VowSecurityError:
        pass


def test_unsigned_rejected():
    try:
        verify_shadow_signature('print(1)\n', KEY)
        assert False
    except VowSecurityError as e:
        assert 'unsigned' in str(e)


def test_wrong_key_rejected():
    try:
        verify_shadow_signature(signed('quest Q { goal "g" }'), os.urandom(32))
        assert False
    except VowSecurityError:
        pass


def test_engine_runs_signed_end_to_end():
    import asyncio
    import main as m
    src = open(os.path.join(os.path.dirname(__file__), '..', 'examples',
                            'tournament_mixed.vow')).read()
    trace = asyncio.run(
        m.VowEngineManager(m.MockDatabase())
         .execute_vow_quest(src, 'TournamentMixed', dry_run=True))
    assert trace['status'] == 'success'
    assert trace['shadow_python'].startswith('# VOW-SIGNATURE: ')


def test_sandbox_builtins():
    import main as m
    sb = m._vow_sandbox_builtins()
    for dangerous in ('eval', 'exec', 'compile', 'input'):
        assert dangerous not in sb
    for needed in ('open', 'len', 'max', 'print'):
        assert needed in sb
    try:
        sb['__import__']('os')
        assert False
    except ImportError:
        pass
    assert sb['__import__']('time')


def test_engine_refuses_forged_shadow():
    """Directly verify the engine's exec step cannot be fed foreign code."""
    import main as m
    mgr = m.VowEngineManager(m.MockDatabase())
    try:
        verify_shadow_signature('# forged by hand\nprint(1)\n',
                                mgr._signing_key)
        assert False
    except VowSecurityError:
        pass
