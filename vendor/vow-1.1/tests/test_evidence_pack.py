"""Proofs for the HYBRID SIGNATURE ARC (author ruling 2026-07-24).

HMAC seals stay in the store; exports carry ed25519 signatures so anyone
holding the public key can verify a pack without our secret. These tests
pin the four failure modes the arc exists to catch:

  1. a clean pack verifies — fingerprint, signature, chains, pin;
  2. a touched body fails the fingerprint;
  3. a swapped key fails the pin against the published .pubkey;
  4. a compromised exporter (valid key, poisoned rows) fails the chains —
     the pack never trusts its own say-so.
"""
import json
import os
import sys

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJ)

from vow.database import SqliteDatabase          # noqa: E402
from vow.vow_transpiler import JournalRuntime    # noqa: E402
from vow.evidence_pack import (export_pack, verify_pack,  # noqa: E402
                               fingerprint_of, key_id_of)
from cryptography.hazmat.primitives.asymmetric.ed25519 import (  # noqa: E402
    Ed25519PrivateKey)


def _store(tmp_path, name='p.db', run_id='run1'):
    db = SqliteDatabase(str(tmp_path / name))
    db.create_run(run_id, 'QuestQ', 'srcsha', 'engsha')
    j = JournalRuntime(db, run_id, mode='live')
    db.journal = j
    j.append('run_begin', {'quest': 'QuestQ'})
    j.append('effect_intent', {'capability': 'shell',
                               'action': 'shell_exec', 'args': ['ls']})
    j.append('effect_result', {'capability': 'shell',
                               'action': 'shell_exec', 'result': 'ok'})
    db.record_scar_sync({'quest_name': 'QuestQ', 'message': 'boom',
                         'context': {'why': 'the proof needs a scar'}})
    j.append('run_end', {'status': 'success'})
    head, seq = j.head
    db.finish_run(run_id, 'success', head, seq)
    return db


def _export(tmp_path):
    db = _store(tmp_path)
    out = str(tmp_path / 'pack.json')
    summary = export_pack(db, out)
    return out, summary


def test_clean_pack_verifies(tmp_path):
    out, summary = _export(tmp_path)
    assert summary['counts']['journal_events'] == 5  # incl. scar mem_write
    assert summary['counts']['scars'] == 1
    report = verify_pack(out, pubkey_path=out + '.pubkey')
    assert report['ok'], json.dumps(report, indent=1)
    for name in ('fingerprint', 'signature', 'pinned_key',
                 'journal_chains', 'scar_chain'):
        assert report['checks'][name]['ok'] is True, name
    assert report['key_id'] == summary['key_id']


def test_touched_body_fails_fingerprint(tmp_path):
    out, _ = _export(tmp_path)
    pack = json.load(open(out))
    pack['body']['tables']['scars'][0]['message'] = 'nothing happened here'
    json.dump(pack, open(out, 'w'))
    report = verify_pack(out, pubkey_path=out + '.pubkey')
    assert not report['ok']
    assert report['checks']['fingerprint']['ok'] is False


def test_key_swap_fails_the_pin(tmp_path):
    """The attacker re-signs a forged pack with THEIR key and ships their
    public key inside. Without a pin that is trust-on-first-use; against
    the published .pubkey it dies."""
    out, _ = _export(tmp_path)
    pack = json.load(open(out))
    attacker = Ed25519PrivateKey.generate()
    fp = pack['fingerprint'].split(':', 1)[1]
    pack['signature_ed25519'] = attacker.sign(fp.encode()).hex()
    pack['public_key'] = attacker.public_key().public_bytes_raw().hex()
    json.dump(pack, open(out, 'w'))
    report = verify_pack(out, pubkey_path=out + '.pubkey')
    assert not report['ok']
    assert report['checks']['pinned_key']['ok'] is False


def test_compromised_exporter_fails_the_chains(tmp_path):
    """Even with the REAL key (exporter compromised), poisoned rows are
    caught: the verifier re-walks every chain from the pack itself."""
    out, _ = _export(tmp_path)
    pack = json.load(open(out))
    ev = pack['body']['tables']['journal_events']
    ev[1]['payload'] = json.dumps({'capability': 'shell',
                                   'action': 'shell_exec',
                                   'args': ['rm', '-rf', '/']})
    with open(out + '.seckey') as fh:  # the attacker holds the key
        priv = Ed25519PrivateKey.from_private_bytes(
            bytes.fromhex(fh.read().strip()))
    fp = fingerprint_of(pack['body'])
    pack['fingerprint'] = 'sha256:' + fp
    pack['signature_ed25519'] = priv.sign(fp.encode()).hex()
    json.dump(pack, open(out, 'w'))
    report = verify_pack(out, pubkey_path=out + '.pubkey')
    assert not report['ok']
    assert report['checks']['fingerprint']['ok'] is True   # honestly cut
    assert report['checks']['signature']['ok'] is True     # honestly signed
    assert report['checks']['journal_chains']['ok'] is False  # and still caught


def test_env_key_and_key_id(tmp_path):
    """VOW_ED25519_KEY overrides the keyfile; the key_id names the key."""
    seed = bytes(range(32)).hex()
    os.environ['VOW_ED25519_KEY'] = seed
    try:
        db = _store(tmp_path, name='env.db')
        out = str(tmp_path / 'envpack.json')
        summary = export_pack(db, out)
        expect_pub = Ed25519PrivateKey.from_private_bytes(
            bytes(range(32))).public_key().public_bytes_raw().hex()
        assert summary['public_key'] == expect_pub
        assert summary['key_id'] == key_id_of(expect_pub)
        assert not os.path.exists(out + '.seckey')  # env key: no keyfile
        assert verify_pack(out)['ok']
    finally:
        del os.environ['VOW_ED25519_KEY']
