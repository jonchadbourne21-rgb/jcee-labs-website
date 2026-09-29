"""HYBRID SIGNATURE ARC (author ruling 2026-07-24: "no preference — build
the recommendation").

The store keeps its HMAC seals — fast, local, already proven. Anything
that LEAVES the building additionally carries an ed25519 signature:

  * the chain proves INTEGRITY (nothing was touched),
  * the HMAC seals prove row AUTHORSHIP to whoever holds the store key,
  * the ed25519 signature proves pack AUTHORSHIP to ANYONE holding the
    public key — an auditor, a customer, a court — without our secret.

"Tamper-evident inside, independently verifiable outside."

Key management mirrors the HMAC arc's posture:
  1. VOW_ED25519_KEY env var (hex, 32-byte seed) — production posture,
     delivered by secrets management.
  2. A per-base '<base>.seckey' file (hex seed, O_EXCL, 0o600) generated
     on first use, with the publishable half written to '<base>.pubkey'.
There is no silent-unsigned mode: an export without any key refuses.

The public key travels INSIDE the pack for convenience; the authoritative
copy is the separately published '<base>.pubkey'. verify_pack pins
against it when given — a pack that swapped both key and signature fails
the pin. Trust anchor: the .pubkey you received out-of-band, never the
pack itself.
"""
import datetime
import hashlib
import json
import os
import stat
from typing import Any, Dict, Optional, Tuple

from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey, Ed25519PublicKey)
from cryptography.exceptions import InvalidSignature

PACK_FORMAT = 'vow-evidence-pack/1'


def _canonical(obj: Any) -> bytes:
    """One byte stream per evidence body — the fingerprint's input."""
    return json.dumps(obj, sort_keys=True, separators=(',', ':'),
                      default=str).encode('utf-8')


def fingerprint_of(body: Dict[str, Any]) -> str:
    return hashlib.sha256(_canonical(body)).hexdigest()


def key_id_of(public_key_hex: str) -> str:
    """Short, quotable name for a public key — 'which engine signed this?'"""
    return hashlib.sha256(bytes.fromhex(public_key_hex)).hexdigest()[:16]


def ensure_keypair(base_path: str) -> Tuple[Ed25519PrivateKey, str, bool]:
    """Resolve the ed25519 signing key. Returns (private_key, pubkey_hex,
    created). Resolution: VOW_ED25519_KEY env, else '<base>.seckey'
    (generated on first use; the publishable half lands in '<base>.pubkey').
    """
    key_hex = os.environ.get('VOW_ED25519_KEY')
    if key_hex:
        seed = bytes.fromhex(key_hex.strip())
        if len(seed) != 32:
            raise ValueError('VOW_ED25519_KEY must be a 32-byte seed (hex)')
        priv = Ed25519PrivateKey.from_private_bytes(seed)
        return priv, priv.public_key().public_bytes_raw().hex(), False
    sec_path = base_path + '.seckey'
    pub_path = base_path + '.pubkey'
    if os.path.exists(sec_path):
        with open(sec_path) as fh:
            seed = bytes.fromhex(fh.read().strip())
        priv = Ed25519PrivateKey.from_private_bytes(seed)
        return priv, priv.public_key().public_bytes_raw().hex(), False
    # first use: mint, write the secret with owner-only permissions,
    # publish the public half — created via O_EXCL so a pre-planted key
    # can never be silently adopted.
    priv = Ed25519PrivateKey.generate()
    seed = priv.private_bytes_raw()
    fd = os.open(sec_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as fh:
        fh.write(seed.hex())
    os.chmod(sec_path, stat.S_IRUSR | stat.S_IWUSR)
    pub_hex = priv.public_key().public_bytes_raw().hex()
    with open(pub_path, 'w') as fh:
        fh.write(pub_hex + '\n')
    return priv, pub_hex, True


def export_pack(database, out_path: str,
                run_id: Optional[str] = None) -> Dict[str, Any]:
    """Bundle a store's evidence and sign it for travel. The rows keep
    their HMAC seals (cross-checkable by the store-key holder); the pack
    as a whole is ed25519-signed (verifiable by anyone)."""
    from vow.compliance import engine_attestation
    evidence = database.dump_evidence(run_id)
    body = {
        'format': PACK_FORMAT,
        'exported_at': datetime.datetime.now(
            datetime.timezone.utc).isoformat(timespec='seconds'),
        'engine': engine_attestation(),
        'scope': run_id or 'store',
        'tables': evidence,
        'counts': {k: len(v) for k, v in evidence.items()},
    }
    fingerprint = fingerprint_of(body)
    priv, pub_hex, created = ensure_keypair(out_path)
    signature = priv.sign(fingerprint.encode('utf-8')).hex()
    pack = {
        'format': PACK_FORMAT,
        'body': body,
        'fingerprint': 'sha256:' + fingerprint,
        'signature_ed25519': signature,
        'public_key': pub_hex,
        'key_id': key_id_of(pub_hex),
    }
    with open(out_path, 'w') as fh:
        json.dump(pack, fh, indent=1, default=str)
        fh.write('\n')
    return {'out': out_path, 'fingerprint': fingerprint,
            'key_id': key_id_of(pub_hex), 'public_key': pub_hex,
            'key_created': created, 'counts': body['counts'],
            'scope': body['scope']}


def _verify_journal_chains(events) -> Dict[str, Any]:
    """Re-verify every run's hash chain FROM THE PACK ALONE — doctrine:
    JournalRuntime.verify_chain (lazy import: same package, no cycle)."""
    from vow.vow_transpiler import JournalRuntime
    by_run: Dict[str, list] = {}
    for e in events:
        ev = dict(e)
        ev['payload'] = (json.loads(ev['payload'])
                         if isinstance(ev['payload'], str)
                         else ev['payload'])
        by_run.setdefault(ev['run_id'], []).append(ev)
    chains, broken = {}, []
    for rid, evs in sorted(by_run.items()):
        evs.sort(key=lambda e: e['seq'])
        ok, msg = JournalRuntime.verify_chain(rid, evs)
        chains[rid] = {'ok': ok, 'message': msg, 'events': len(evs)}
        if not ok:
            broken.append(rid)
    return {'chains': chains, 'broken': broken}


def _verify_scar_chain(scars) -> Dict[str, Any]:
    """Re-verify the scar fingerprint chain from pack rows alone —
    doctrine: SqliteDatabase._scar_fingerprint."""
    from vow.database import SqliteDatabase
    chained = [s for s in scars if s.get('scar_hash')]
    prev, bad = None, []
    for s in sorted(chained, key=lambda x: x['id']):
        expect = SqliteDatabase._scar_fingerprint(
            s['quest_name'], s['message'], s['context'],
            s['created_at'], prev)
        if s['prev_hash'] != prev or s['scar_hash'] != expect:
            bad.append(s['id'])
        prev = s['scar_hash']
    return {'checked': len(chained), 'bad': bad}


def verify_pack(pack_path: str,
                pubkey_path: Optional[str] = None) -> Dict[str, Any]:
    """Verify an exported pack WITHOUT the store: fingerprint (integrity),
    ed25519 signature (authorship, against the pinned public key when
    given), and every chain re-walked from the pack's own rows. Nothing
    here trusts the pack's say-so — every check is recomputed."""
    with open(pack_path) as fh:
        pack = json.load(fh)
    report: Dict[str, Any] = {'pack': pack_path, 'ok': True, 'checks': {}}

    def fail(name, why):
        report['ok'] = False
        report['checks'][name] = {'ok': False, 'reason': why}

    if pack.get('format') != PACK_FORMAT:
        fail('format', 'unknown pack format: %r' % pack.get('format'))
        return report
    body = pack.get('body')
    if not isinstance(body, dict):
        fail('format', 'pack carries no body')
        return report

    actual_fp = fingerprint_of(body)
    claimed = str(pack.get('fingerprint', ''))
    if claimed != 'sha256:' + actual_fp:
        fail('fingerprint',
             'body was touched after signing (claimed %s, actual sha256:%s)'
             % (claimed, actual_fp))
    else:
        report['checks']['fingerprint'] = {'ok': True,
                                           'sha256': actual_fp}

    pub_hex = pack.get('public_key', '')
    if pubkey_path:
        with open(pubkey_path) as fh:
            pinned = fh.read().strip()
        if pinned != pub_hex:
            fail('pinned_key',
                 'pack key %s… does not match the published key %s…'
                 % (pub_hex[:16], pinned[:16]))
        else:
            report['checks']['pinned_key'] = {'ok': True,
                                              'key_id': key_id_of(pinned)}
    else:
        report['checks']['pinned_key'] = {
            'ok': None,
            'note': 'no authoritative .pubkey given — signature checked '
                    'against the in-pack key only (trust-on-first-use)'}
    try:
        Ed25519PublicKey.from_public_bytes(bytes.fromhex(pub_hex)).verify(
            bytes.fromhex(pack.get('signature_ed25519', '')),
            actual_fp.encode('utf-8'))
        report['checks']['signature'] = {'ok': True,
                                         'key_id': key_id_of(pub_hex)}
    except (InvalidSignature, ValueError) as exc:
        fail('signature', 'ed25519 verification failed: %s'
             % type(exc).__name__)

    tables = body.get('tables', {})
    jr = _verify_journal_chains(tables.get('journal_events', []))
    report['checks']['journal_chains'] = {
        'ok': not jr['broken'], 'broken': jr['broken'],
        'runs': len(jr['chains'])}
    if jr['broken']:
        report['ok'] = False
    sc = _verify_scar_chain(tables.get('scars', []))
    report['checks']['scar_chain'] = {'ok': not sc['bad'],
                                      'checked': sc['checked'],
                                      'bad': sc['bad']}
    if sc['bad']:
        report['ok'] = False
    report['counts'] = body.get('counts', {})
    report['key_id'] = key_id_of(pub_hex) if pub_hex else None
    return report
