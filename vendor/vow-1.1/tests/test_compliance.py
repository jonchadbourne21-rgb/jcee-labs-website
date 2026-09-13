# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import json
import os
import subprocess
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.compliance import ComplianceExporter

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}


def make_trace():
    """Run a real quest through the engine and return the trace."""
    sys.path.insert(0, PROJ)
    import asyncio
    import main as m
    src = open(os.path.join(PROJ, 'examples', 'tournament_mixed.vow')).read()
    return asyncio.run(
        m.VowEngineManager(m.MockDatabase())
         .execute_vow_quest(src, 'TournamentMixed', dry_run=True))


def test_build_evidence_structure():
    ev = ComplianceExporter().build_evidence(make_trace())
    for key in ('bundle_version', 'generated_at', 'disclaimer', 'system',
                'art12_event_log', 'permissions_manifest', 'oversight',
                'robustness_evidence', 'scar_memory', 'bundle_sha256'):
        assert key in ev, key
    assert ev['system']['quest'] == 'TournamentMixed'
    assert len(ev['bundle_sha256']) == 64


def test_event_log_is_real():
    ev = ComplianceExporter().build_evidence(make_trace())
    kinds = [e['event'] for e in ev['art12_event_log']]
    assert kinds[0] == 'quest_started' and kinds[-1] == 'quest_finished'
    assert 'proof_failed' in kinds
    assert sum(1 for k in kinds if k == 'strategy_evaluated') == 3


def test_no_fabricated_fields():
    ev = ComplianceExporter().build_evidence(
        {'quest_name': 'Q', 'status': 'success'})
    assert ev['oversight']['shadow_python'] == 'not recorded'
    assert ev['oversight']['shadow_python_sha256'] == 'not recorded'


def test_permissions_manifest_extracted():
    sys.path.insert(0, PROJ)
    import asyncio
    import main as m
    src = open(os.path.join(PROJ, 'examples', 'deontic_gate.vow')).read()
    trace = asyncio.run(
        m.VowEngineManager(m.MockDatabase())
         .execute_vow_quest(src, 'DeonticGate', dry_run=True))
    ev = ComplianceExporter().build_evidence(trace)
    pm = ev['permissions_manifest']
    assert pm['declared_capabilities'] == ['file_read', 'network']
    assert '(used) network' in pm['gated_calls_observed']


def test_render_markdown():
    md = ComplianceExporter().render_markdown(
        ComplianceExporter().build_evidence(make_trace()))
    for section in ('Art. 12', 'Permissions manifest', 'Human oversight',
                    'Robustness', 'Scar memory', 'quest_finished'):
        assert section in md, section


def test_cli_report(tmp_path=None):
    # Write the bundle to a per-test tmp dir (the runner passes a fresh one;
    # direct execution makes its own). The delivery tree lives on an overlay
    # filesystem where a subprocess's fresh writes can be momentarily
    # invisible to the parent — reading them back raced and flaked.
    import tempfile
    base = str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_comp_')
    outdir = os.path.join(base, '_tmp_compliance_out')
    try:
        r = subprocess.run(
            [sys.executable, 'vow_cli.py', 'report',
             'examples/tournament_mixed.vow', '--out', outdir],
            capture_output=True, text=True, cwd=PROJ, env=ENV)
        assert r.returncode == 0, r.stderr[-800:]
        payload = json.loads(r.stdout)
        ev = json.load(open(payload['evidence_json']))
        assert ev['system']['status'] == 'success'
        assert 'Art. 12' in open(payload['report_md']).read()
    finally:
        import shutil
        shutil.rmtree(outdir, ignore_errors=True)


def test_cli_report_with_persistent_db(tmp_path=None):
    """Regression: `vow report --db X` used to crash — cmd_report read
    database.scars, which only MockDatabase has; SqliteDatabase exposes
    recall_all_scars_sync(). The evidence bundle must carry the durable
    scar memory either way."""
    import tempfile
    base = str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_comp_')
    outdir = os.path.join(base, 'bundle')
    db = os.path.join(base, 'memory.db')
    try:
        r = subprocess.run(
            [sys.executable, 'vow_cli.py', 'report',
             'examples/tournament_mixed.vow', '--db', db, '--out', outdir],
            capture_output=True, text=True, cwd=PROJ, env=ENV)
        assert r.returncode == 0, r.stderr[-800:]
        payload = json.loads(r.stdout)
        ev = json.load(open(payload['evidence_json']))
        assert ev['system']['status'] == 'success'
        # tournament_mixed's wrong_answer fails -> one durable scar, and it
        # must land in the bundle's scar_memory section
        assert len(ev.get('scar_memory', [])) >= 1, ev.get('scar_memory')
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_rejects_bad_trace():
    try:
        ComplianceExporter().build_evidence({'nope': 1})
        assert False
    except ValueError:
        pass
