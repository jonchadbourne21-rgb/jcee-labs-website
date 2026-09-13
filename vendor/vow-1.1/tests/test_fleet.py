"""Fleet scar sharing (.vowscars): redaction, provenance, merge semantics,
and the runtime contract — imported lessons advise (inherited_scar
caution) but never exact-skip.

OWED 6 (2026-07-25): signed PROVENANCE. v2 packs answer whose wound
(ed25519 key_id), when (exported_at + per-lesson recorded_at), under
what engine (real attestation hash) — verifiable by anyone holding the
origin's published .pubkey, no shared secret. A borrowed scar with no
signature is a rumor with consequences: v2 provenance failures are
always refused; unsigned v1 legacy packs need --allow-unsigned and are
labeled rumors (verified: False) forever.
"""
import hashlib
import hmac
import json
import os
import subprocess
import sys
import tempfile

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}
sys.path.insert(0, PROJ)

from vow.fleet import (build_pack, verify_pack, verify_pack_v2,
                       export_lessons, to_scar_record, FORMAT,
                       LEGACY_FORMAT)

RAW = [{
    'quest_name': 'q', 'created_at': '2026-07-20T00:00:00',
    'message': 'prove failed: invoice_amount == po_amount [equality_mismatch]',
    'context': {
        'quest': 'q', 'strategy': 'pay_as_keyed', 'seed': 'abc123',
        'reason': {
            'prove': 'invoice_amount == po_amount',
            'kind': 'equality_mismatch',
            'margin': {'op': '==', 'actual': 4500, 'expected': 5400,
                       'off_by': 900},
            'bindings': {'invoice_amount': 4500, 'po_amount': 5400},
        },
    },
}]


def _base(tmp_path):
    return str(tmp_path) if tmp_path else tempfile.mkdtemp(prefix='vow_fleet_')


def _keybase(tmp_path):
    return os.path.join(_base(tmp_path), 'identity')


def test_export_is_redacted_by_default():
    lessons = export_lessons(RAW)
    assert lessons[0]['margin'] == {'op': '==', 'off_by': 900}
    assert 'bindings' not in lessons[0]
    assert 'actual' not in lessons[0]['margin']


def test_export_full_mode_keeps_values():
    lessons = export_lessons(RAW, full=True)
    assert lessons[0]['margin']['actual'] == 4500
    assert lessons[0]['bindings']['po_amount'] == 5400


def test_sign_and_verify_roundtrip(tmp_path=None):
    """Owed 6 re-litigation: build_pack now requires a signing identity
    (no silent-unsigned mode). The legacy HMAC layer still verifies via
    verify_pack; the v2 provenance verifies via verify_pack_v2."""
    pack = build_pack(RAW, 'fleet-a', key='s3cret',
                      key_base=_keybase(tmp_path))
    assert pack['format'] == FORMAT
    assert verify_pack(pack, 's3cret') is True        # legacy hmac layer
    assert verify_pack(pack, 'wrong') is False
    v = verify_pack_v2(pack)
    assert v['verified'] is True
    assert v['key_id'] == pack['provenance']['key_id']
    pack['lessons'][0]['note'] = 'nothing happened'   # tamper
    assert verify_pack(pack, 's3cret') is False
    assert verify_pack_v2(pack)['verified'] is False


def test_v2_has_no_unsigned_mode(tmp_path=None):
    """A v2 pack is provenance-signed by construction; omitting the
    fleet HMAC key just drops the legacy layer (verify_pack: None)."""
    pack = build_pack(RAW, 'fleet-a', key_base=_keybase(tmp_path))
    assert verify_pack(pack, 's3cret') is None
    assert verify_pack_v2(pack)['verified'] is True


def test_provenance_answers_the_three_questions(tmp_path=None):
    """WHOSE wound, WHEN, UNDER WHAT ENGINE — and the pin is the trust
    anchor: a pack swapped to an attacker's key dies against the
    published .pubkey."""
    base = _keybase(tmp_path)
    pack = build_pack(RAW, 'fleet-a', key_base=base)
    prov = pack['provenance']
    assert prov['key_id'] and len(prov['key_id']) == 16
    eng = pack['source']['engine']
    assert isinstance(eng, dict) and eng.get('engine_sha256')  # real
    # attestation, not a hardcoded string
    assert pack['exported_at']
    assert pack['lessons'][0]['recorded_at'] == '2026-07-20T00:00:00'
    # the pin: origin's published .pubkey verifies…
    v = verify_pack_v2(pack, pubkey_path=base + '.pubkey')
    assert v['verified'] is True and v['pinned'] is True
    # …and a forged .pubkey kills the pack
    from cryptography.hazmat.primitives.asymmetric.ed25519 import (
        Ed25519PrivateKey)
    attacker = Ed25519PrivateKey.generate().public_key() \
        .public_bytes_raw().hex()
    forged = base + '.forged.pubkey'
    with open(forged, 'w') as fh:
        fh.write(attacker)
    v2 = verify_pack_v2(pack, pubkey_path=forged)
    assert v2['verified'] is False and v2['pinned'] is False


def test_imported_lesson_never_exact_skips(tmp_path=None):
    lesson = export_lessons(RAW)[0]
    prov = {'verified': True, 'key_id': 'abc123def4567890',
            'engine': {'engine_sha256': 'deadbeef'},
            'exported_at': '2026-07-25T00:00:00+00:00'}
    rec = to_scar_record(lesson, 'fleet-a', provenance=prov)
    ctx = rec['context']
    assert ctx['inherited'] is True
    assert ctx['seed'] is None
    assert ctx['source'] == 'fleet-a'
    # OWED 6: the full provenance travels into the record
    assert ctx['verified'] is True
    assert ctx['origin_key_id'] == 'abc123def4567890'
    assert ctx['origin_engine'] == 'deadbeef'
    assert ctx['pack_exported_at'] == '2026-07-25T00:00:00+00:00'
    # and an admitted rumor is labeled forever
    rumor = to_scar_record(lesson, 'fleet-x',
                           provenance={'verified': False})
    assert rumor['context']['verified'] is False
    assert rumor['context']['origin_key_id'] is None


def _run(db, extra_env=None):
    env = dict(ENV)
    if extra_env:
        env.update(extra_env)
    return subprocess.run(
        [sys.executable, 'vow_cli.py', 'run', 'examples/tournament_mixed.vow',
         '--db', db],
        capture_output=True, text=True, cwd=PROJ, env=env)


def _scars_cli(db, *cli_args, env_extra=None):
    env = dict(ENV)
    if env_extra:
        env.update(env_extra)
    return subprocess.run(
        [sys.executable, 'vow_cli.py', 'scars', *cli_args, '--db', db],
        capture_output=True, text=True, cwd=PROJ, env=env)


def _trace_of_run(r):
    import ast
    fr = r.stdout[r.stdout.index('{'):]
    data = json.loads(fr)
    result = data.get('final_result')
    if isinstance(result, str):
        result = ast.literal_eval(result)
    return result


def test_fleet_end_to_end(tmp_path=None):
    """Deployment A hurts itself and exports (provenance signed by A's
    store identity); fresh deployment B pins A's published .pubkey,
    inherits, and gets cautionary wisdom on its FIRST run — never an
    exact skip."""
    base = _base(tmp_path)
    db_a, db_b = (os.path.join(base, 'a.db'), os.path.join(base, 'b.db'))
    pack_path = os.path.join(base, 'fleet.vowscars')
    try:
        assert _run(db_a).returncode == 0  # A records the wrong_answer scar

        r = _scars_cli(db_a, 'export', '--out', pack_path, '--label',
                       'dep-a')
        assert r.returncode == 0, r.stderr[-400:]
        out = json.loads(r.stdout)
        assert out['format'] == FORMAT and out['key_id']
        assert os.path.isfile(db_a + '.pubkey')   # the publishable half

        # B pins A's published key — no trust-on-first-use
        r = _scars_cli(db_b, 'inherit', pack_path,
                       '--pubkey', db_a + '.pubkey')
        assert r.returncode == 0, r.stderr[-400:]
        payload = json.loads(r.stdout)
        assert payload['inherited'] == 1 and payload['duplicates_skipped'] == 0
        assert payload['signature'].startswith('verified (key '
                                               + out['key_id'])

        # importing again dedups
        r = _scars_cli(db_b, 'inherit', pack_path,
                       '--pubkey', db_a + '.pubkey')
        assert json.loads(r.stdout)['duplicates_skipped'] == 1

        # B's FIRST run: wrong_answer runs under inherited caution, not skip
        r = _run(db_b)
        assert r.returncode == 0, r.stderr[-400:]
        result = _trace_of_run(r)
        by_name = {m['strategy']: m for m in result['tournament']}
        entry = by_name['wrong_answer']
        assert entry.get('caution') == 'inherited_scar', entry
        assert 'skipped' not in entry, entry

        # the scar record carries the provenance…
        from vow.database import SqliteDatabase
        scars = SqliteDatabase(db_b).recall_all_scars_sync()
        inh = [s for s in scars
               if (s.get('context') or {}).get('inherited')][0]
        ctx = inh['context'] if isinstance(inh['context'], dict) \
            else json.loads(inh['context'])
        assert ctx['verified'] is True
        assert ctx['origin_key_id'] == out['key_id']
        assert ctx['origin_engine']
        assert ctx['pack_exported_at']

        # …and `why` says it out loud
        r = subprocess.run(
            [sys.executable, 'vow_cli.py', 'why', 'TournamentMixed',
             '--db', db_b],
            capture_output=True, text=True, cwd=PROJ, env=ENV)
        assert 'inherited from dep-a' in r.stdout, r.stdout
        assert 'verified' in r.stdout, r.stdout
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def test_inherit_refuses_tampering_and_wrong_keys(tmp_path=None):
    """Owed 6 re-litigation: v2 provenance failures are ALWAYS refused
    (--allow-unsigned cannot save a v2 pack — failure means tampering);
    a wrong fleet HMAC key is refused too (defense in depth)."""
    base = _base(tmp_path)
    db_a, db_b = (os.path.join(base, 'a.db'), os.path.join(base, 'b.db'))
    pack_path = os.path.join(base, 'fleet.vowscars')
    try:
        assert _run(db_a).returncode == 0
        assert _scars_cli(db_a, 'export', '--out', pack_path,
                          '--label', 'dep-a',
                          env_extra={'VOW_FLEET_KEY': 'k'}).returncode == 0
        # wrong fleet HMAC key: ed25519 is fine but the legacy layer fails
        r = _scars_cli(db_b, 'inherit', pack_path,
                       env_extra={'VOW_FLEET_KEY': 'WRONG'})
        assert r.returncode == 2
        # tampered lessons: refused even WITH --allow-unsigned
        pack = json.load(open(pack_path))
        pack['lessons'][0]['note'] = 'nothing happened'
        json.dump(pack, open(pack_path, 'w'))
        r = _scars_cli(db_b, 'inherit', pack_path, '--allow-unsigned')
        assert r.returncode == 2
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)


def _v1_pack(lessons, key=None):
    """Hand-craft a legacy vowscars/1 pack (the pre-Owed-6 shape)."""
    pack = {'format': LEGACY_FORMAT,
            'exported_at': '2026-07-20T00:00:00+00:00',
            'source': {'label': 'old-fleet', 'engine': 'v20',
                       'fingerprint': 'abc123'},
            'redacted': True,
            'lessons': lessons}
    if key:
        pack['signature'] = {
            'algo': 'HMAC-SHA256',
            'value': hmac.new(key.encode(),
                              json.dumps(lessons, sort_keys=True,
                                         separators=(',', ':'),
                                         default=str).encode(),
                              hashlib.sha256).hexdigest()}
    return pack


def test_v1_legacy_pack_still_imports_labeled(tmp_path=None):
    """v1 packs keep working: HMAC-verified imports land verified; an
    UNSIGNED v1 pack needs --allow-unsigned and is labeled a rumor
    (verified: False) in the record forever."""
    base = _base(tmp_path)
    db_b = os.path.join(base, 'b.db')
    lessons = export_lessons(RAW)
    pack_path = os.path.join(base, 'legacy.vowscars')
    try:
        # signed v1: imports with the fleet key
        json.dump(_v1_pack(lessons, key='fleet-secret'),
                  open(pack_path, 'w'))
        r = _scars_cli(db_b, 'inherit', pack_path,
                       env_extra={'VOW_FLEET_KEY': 'fleet-secret'})
        assert r.returncode == 0, r.stderr[-400:]
        assert json.loads(r.stdout)['signature'] == 'verified (v1 hmac)'
        # unsigned v1 (a different label — the dedupe key includes the
        # source, and honestly so: same rumor, same source = same rumor):
        # refused by default…
        rumor = _v1_pack(lessons)
        rumor['source']['label'] = 'old-fleet-unsigned'
        json.dump(rumor, open(pack_path, 'w'))
        r = _scars_cli(db_b, 'inherit', pack_path)
        assert r.returncode == 2
        # …admitted deliberately as a LABELED rumor
        r = _scars_cli(db_b, 'inherit', pack_path, '--allow-unsigned')
        assert r.returncode == 0, r.stderr[-400:]
        assert 'UNSIGNED — rumor admitted deliberately' \
            in json.loads(r.stdout)['signature']
        from vow.database import SqliteDatabase
        scars = SqliteDatabase(db_b).recall_all_scars_sync()
        inherited = [(s.get('context') or {}) for s in scars
                     if (s.get('context') or {}).get('inherited')]
        by_source = {}
        for c in inherited:
            c = c if isinstance(c, dict) else json.loads(c)
            by_source.setdefault(c.get('source'), []).append(c)
        assert by_source['old-fleet'][0]['verified'] is True
        assert by_source['old-fleet-unsigned'][0]['verified'] is False
    finally:
        import shutil
        shutil.rmtree(base, ignore_errors=True)
