"""Tests for ontology macros + engine-hash attestation.

Ontology: user-defined keywords map to host functions; the macro emits a
registry call; unbound keywords whisper and pass the value through (never
a silent transformation, never a crash). Attestation: every evidence
bundle carries the engine build hash, verifiable against a known build.
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
from vow.vow_transpiler import VowTranspiler  # noqa: E402
from vow.compliance import engine_attestation, ComplianceExporter  # noqa: E402

ONTO_SRC = '''ontology {
  define_keyword "audit" -> "host_audit_log"
}
quest Q {
  goal "g"
  let result = 41
  audit result
  prove result > 0
  success when result > 0
}
'''


def _base(tmp_path):
    return str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_on_')


# --- ontology macros ---------------------------------------------------------

def test_ontology_parses_and_emits():
    prog = VowAdvancedParser(ONTO_SRC).parse_program()
    assert prog.ontology == {'audit': 'host_audit_log'}
    calls = [i for i in prog.quests[0].items
             if i.__class__.__name__ == 'OntologyCall']
    assert len(calls) == 1 and calls[0].keyword == 'audit'
    code = VowTranspiler().transpile(prog)
    assert "_VOW_ONTOLOGY_MAP = {'audit': 'host_audit_log'}" in code
    assert "_vow_ontology_call('audit'," in code


def test_ontology_bound_host_function_unit():
    """A registered host function receives the value and its result is used."""
    from vow.vow_transpiler import (VowProofFailure, VowScarMemory,
                                    VowSuccessLog)
    prog = VowAdvancedParser(ONTO_SRC).parse_program()
    code = VowTranspiler().transpile(prog)
    seen = []
    # pre-seed the exec namespace: the preamble keeps a pre-existing
    # _VOW_ONTOLOGY instead of defaulting to empty (the host-injection path)
    ns = {'VowProofFailure': VowProofFailure,
          'VowScarMemory': VowScarMemory,
          'VowSuccessLog': VowSuccessLog,
          '_VOW_ONTOLOGY': {'audit': lambda v: seen.append(v) or (v + 1)}}
    exec(code, ns)
    fin = ns['quest_Q']()
    assert seen == [41], seen  # the host fn saw the audited value
    assert not any(w['kind'] == 'ontology_unbound'
                   for w in fin['whispers'])


def test_ontology_unbound_whispers_and_passes_through(tmp_path=None):
    base = _base(tmp_path)
    db = os.path.join(base, 'mem.db')
    try:
        r = subprocess.run(
            [sys.executable, 'vow_cli.py', 'run', 'examples/ontology.vow',
             '--db', db], capture_output=True, text=True, cwd=PROJ, env=ENV)
        assert r.returncode == 0, r.stderr[-600:]
        assert 'ontology_unbound' in r.stdout
        assert "'expected_host_fn': 'host_audit_log'" in r.stdout
        assert "'result': 42" in r.stdout  # value passed through unchanged
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


# --- engine-hash attestation -------------------------------------------------

def test_engine_attestation_deterministic_and_complete():
    a = engine_attestation()
    b = engine_attestation()
    assert a['engine_sha256'] == b['engine_sha256']
    assert len(a['engine_sha256']) == 64
    assert any('vow_transpiler.py' in f for f in a['engine_files'])
    assert 'main.py' in a['engine_files'] and 'vow_cli.py' in a['engine_files']


def test_engine_attestation_detects_modification(tmp_path=None):
    """Change one engine file and the attestation changes — tamper evidence."""
    base = _base(tmp_path)
    try:
        os.makedirs(os.path.join(base, 'vow'))
        f1 = os.path.join(base, 'vow', 'engine.py')
        with open(f1, 'w') as fh:
            fh.write('X = 1\n')
        with open(os.path.join(base, 'main.py'), 'w') as fh:
            fh.write('Y = 2\n')
        h1 = engine_attestation(base)['engine_sha256']
        with open(f1, 'a') as fh:
            fh.write('X = 2  # tampered\n')
        h2 = engine_attestation(base)['engine_sha256']
        assert h1 != h2
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_bundle_carries_engine_attestation():
    trace = {'quest_name': 'Q', 'status': 'success',
             'final_result': {'success': True},
             'db_scars': [], 'shadow_python': ''}
    evidence = ComplianceExporter().build_evidence(trace)
    eng = evidence.get('engine')
    assert eng and eng['engine_sha256'] == \
        engine_attestation()['engine_sha256']
    # the attestation is inside the hashed envelope, not appended after
    import hashlib
    payload = dict(evidence)
    payload.pop('bundle_sha256')
    assert evidence['bundle_sha256'] == hashlib.sha256(
        json.dumps(payload, sort_keys=True, default=str)
        .encode()).hexdigest()


def test_engine_hash_cli():
    r = subprocess.run([sys.executable, 'vow_cli.py', 'engine-hash'],
                       capture_output=True, text=True, cwd=PROJ, env=ENV)
    assert r.returncode == 0, r.stderr[-400:]
    out = json.loads(r.stdout)
    assert out['engine_sha256'] == engine_attestation()['engine_sha256']
