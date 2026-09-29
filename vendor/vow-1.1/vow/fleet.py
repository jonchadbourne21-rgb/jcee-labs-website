"""Fleet scar sharing (.vowscars): export local scars as redacted, signed
lesson packs; import another deployment's lessons as cautionary-only memory.

The wound travels; the payload never does. Default exports strip bindings
and absolute values (invoice amounts, PO numbers) and keep only the failure
SHAPE: quest, strategy, prove expression, failure kind, margin op + off_by.
Imported lessons carry seed=None — they advise (caution) but can never
exact-skip a local strategy, and every one is tagged with its source so
`why` can distinguish testimony from hearsay.

OWED 6 (cured 2026-07-25): signed PROVENANCE. A borrowed scar with no
signature is a rumor with consequences, so a v2 pack answers three
questions under ed25519 (the hybrid arc: anyone holding the origin's
published .pubkey verifies — no shared secret required):
  WHOSE wound — the exporting deployment's key_id (one identity per
      store: '<db>.seckey' minted once, '.pubkey' published; env
      VOW_ED25519_KEY overrides),
  WHEN — exported_at, plus each lesson's own recorded_at,
  UNDER WHAT ENGINE — the real engine attestation hash, not a string.
v1 packs (HMAC fleet key) remain importable — legacy, labeled as such;
unsigned v1 requires --allow-unsigned and is tagged verified: False,
a rumor admitted deliberately, never silently.
"""
import hashlib
import hmac
import json
from datetime import datetime, timezone

FORMAT = "vowscars/2"
LEGACY_FORMAT = "vowscars/1"


def _canonical(obj):
    return json.dumps(obj, sort_keys=True, separators=(",", ":"),
                      default=str)


def _sign(lessons, key):
    return hmac.new(key.encode(), _canonical(lessons).encode(),
                    hashlib.sha256).hexdigest()


def export_lessons(scars, full=False):
    """Project raw scar records into shareable lessons.
    full=False (default) strips bindings and absolute margin values."""
    lessons = []
    for s in scars:
        ctx = s.get("context") if isinstance(s.get("context"), dict) else {}
        reason = ctx.get("reason") if isinstance(ctx.get("reason"), dict) \
            else {}
        margin = reason.get("margin") if isinstance(reason.get("margin"),
                                                    dict) else {}
        lesson = {
            "quest": s.get("quest_name") or ctx.get("quest"),
            "strategy": ctx.get("strategy"),
            "prove": reason.get("prove"),
            "kind": reason.get("kind"),
            "note": s.get("message"),
            "recorded_at": s.get("created_at"),
        }
        if margin:
            m = {"op": margin.get("op"), "off_by": margin.get("off_by")}
            if full:
                m["actual"], m["expected"] = (margin.get("actual"),
                                              margin.get("expected"))
            lesson["margin"] = m
        if full and reason.get("bindings"):
            lesson["bindings"] = reason["bindings"]
        lessons.append(lesson)
    return lessons


def build_pack(scars, label, key=None, full=False, key_base=None):
    """Build a vowscars/2 pack: redacted lessons + REAL provenance,
    ed25519-signed. No silent-unsigned mode (the evidence-pack law):
    key_base (usually the store path, one identity per deployment)
    mints '<base>.seckey'/'.pubkey' on first use; VOW_ED25519_KEY
    overrides. `key` adds the legacy HMAC fleet-secret layer on top.
    """
    from vow.compliance import engine_attestation
    from vow.evidence_pack import ensure_keypair, key_id_of
    lessons = export_lessons(scars, full=full)
    body = {
        "format": FORMAT,
        "exported_at": datetime.now(timezone.utc).isoformat(
            timespec='seconds'),
        "source": {
            "label": label,
            "engine": engine_attestation(),
        },
        "redacted": not full,
        "lessons": lessons,
    }
    if key_base is None:
        raise ValueError('build_pack requires key_base (the signing '
                         'identity — usually the store path); there is '
                         'no silent-unsigned mode')
    priv, pub_hex, _created = ensure_keypair(key_base)
    fingerprint = hashlib.sha256(_canonical(body).encode()).hexdigest()
    pack = dict(body)
    pack['provenance'] = {
        'fingerprint': 'sha256:' + fingerprint,
        'signature_ed25519': priv.sign(fingerprint.encode()).hex(),
        'public_key': pub_hex,
        'key_id': key_id_of(pub_hex),
    }
    if key:
        pack['signature'] = {'algo': 'HMAC-SHA256',
                             'value': _sign(lessons, key)}
    return pack


def verify_pack_v2(pack, pubkey_path=None, key=None):
    """Verify a vowscars/2 pack WITHOUT trusting it: recompute the
    fingerprint, pin the key when the origin's published .pubkey is
    given (recommended — the in-pack key alone is trust-on-first-use),
    verify the ed25519 provenance signature; the legacy HMAC layer is
    checked too when a fleet key is supplied. Returns a verdict dict —
    never a bare boolean: provenance is a story, not a bit."""
    from cryptography.hazmat.primitives.asymmetric.ed25519 import (
        Ed25519PublicKey)
    from cryptography.exceptions import InvalidSignature
    prov = pack.get('provenance') or {}
    body = {k: pack[k] for k in ('format', 'exported_at', 'source',
                                 'redacted', 'lessons') if k in pack}
    verdict = {
        'format_ok': pack.get('format') == FORMAT,
        'label': (pack.get('source') or {}).get('label', 'unknown'),
        'engine': (pack.get('source') or {}).get('engine'),
        'exported_at': pack.get('exported_at'),
        'key_id': prov.get('key_id'),
        'verified': False,
    }
    if not verdict['format_ok']:
        verdict['error'] = 'not a vowscars/2 pack'
        return verdict
    fp = hashlib.sha256(_canonical(body).encode()).hexdigest()
    if prov.get('fingerprint') != 'sha256:' + fp:
        verdict['error'] = 'fingerprint mismatch — body touched after signing'
        return verdict
    pub_hex = prov.get('public_key', '')
    if pubkey_path:
        with open(pubkey_path) as fh:
            pinned = fh.read().strip()
        verdict['pinned'] = pinned == pub_hex
        if not verdict['pinned']:
            verdict['error'] = 'pack key is not the published .pubkey'
            return verdict
    else:
        verdict['pinned'] = None  # trust-on-first-use, honestly reported
    try:
        Ed25519PublicKey.from_public_bytes(bytes.fromhex(pub_hex)).verify(
            bytes.fromhex(prov.get('signature_ed25519', '')),
            fp.encode())
        verdict['verified'] = True
    except (InvalidSignature, ValueError):
        verdict['error'] = 'ed25519 verification failed'
        return verdict
    if pack.get('signature'):
        verdict['hmac'] = (hmac.compare_digest(
            _sign(pack.get('lessons', []), key or ''),
            pack['signature'].get('value', '')) if key else None)
    return verdict


def verify_pack(pack, key):
    """v1 LEGACY verifier (HMAC fleet key). True = signature valid,
    False = tampered/wrong key, None = pack is unsigned."""
    sig = pack.get("signature")
    if not sig:
        return None
    if not key:
        return False
    expected = _sign(pack.get("lessons", []), key)
    return hmac.compare_digest(expected, sig.get("value", ""))


def lesson_key(lesson, source_label):
    return (lesson.get("quest"), lesson.get("strategy"),
            lesson.get("prove"), lesson.get("kind"), source_label)


def to_scar_record(lesson, source_label, provenance=None):
    """Project an imported lesson into a local scar record: cautionary-only
    (seed=None → can never exact-skip), provenance-tagged. OWED 6: the
    full provenance travels into the record — whose wound (key_id),
    when (pack exported_at + the wound's own recorded_at), under what
    engine — and whether the signature VERIFIED. verified=False is a
    rumor admitted deliberately (unsigned v1 + --allow-unsigned),
    labeled forever."""
    prov = provenance or {}
    engine = prov.get('engine') if isinstance(prov.get('engine'), dict) \
        else {}
    return {
        "quest_name": lesson.get("quest"),
        "message": lesson.get("note")
                   or "prove failed: %s [%s]" % (lesson.get("prove"),
                                                 lesson.get("kind")),
        "context": {
            "inherited": True,
            "source": source_label,
            "quest": lesson.get("quest"),
            "strategy": lesson.get("strategy"),
            "seed": None,
            "imported_at": datetime.now(timezone.utc).isoformat(),
            "recorded_at": lesson.get("recorded_at"),
            "verified": bool(prov.get('verified')),
            "origin_key_id": prov.get('key_id'),
            "origin_engine": engine.get('engine_sha256'),
            "pack_exported_at": prov.get('exported_at'),
            "reason": {
                "prove": lesson.get("prove"),
                "kind": lesson.get("kind"),
                "margin": lesson.get("margin"),
            },
        },
    }
