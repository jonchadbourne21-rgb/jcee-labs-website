# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_transpiler import (VowScarMemory, VowSideEffectRecorder, VowCapability,
                            VowProofFailure, vow_set_dry_run)


def setup_function(_):
    VowScarMemory.clear(); VowSideEffectRecorder.clear(); vow_set_dry_run(True)


def test_scar_record_recall_all_clear():
    VowScarMemory.record('failed parse', {'ctx': 1})
    VowScarMemory.record('timeout', None)
    assert len(VowScarMemory.all()) == 2
    assert len(VowScarMemory.recall('parse')) == 1
    assert len(VowScarMemory.recall()) == 2
    VowScarMemory.clear()
    assert VowScarMemory.all() == []


def test_dry_run_shadows_effect():
    vow_set_dry_run(True)
    state = {'called': 0}
    cap = VowCapability('deploy', lambda: state.update(called=1), shadow_result='SHADOW')
    assert cap() == 'SHADOW'
    assert state['called'] == 0
    fx = VowSideEffectRecorder.all()
    assert len(fx) == 1 and fx[0]['detail']['executed'] is False


def test_live_executes_effect():
    vow_set_dry_run(False)
    state = {'called': 0}
    cap = VowCapability('deploy', lambda: state.update(called=1) or 'OK')
    assert cap() == 'OK'
    assert state['called'] == 1
    fx = VowSideEffectRecorder.all()
    assert fx[0]['detail']['executed'] is True


def test_dry_run_toggle():
    vow_set_dry_run(True); assert __import__('vow.vow_transpiler', fromlist=['VOW_DRY_RUN']).VOW_DRY_RUN is True
    vow_set_dry_run(False); assert __import__('vow.vow_transpiler', fromlist=['VOW_DRY_RUN']).VOW_DRY_RUN is False


def test_proof_failure_is_exception():
    assert issubclass(VowProofFailure, Exception)
