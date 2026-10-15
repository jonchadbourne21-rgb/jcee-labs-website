"""Material dossier snapshot binding for the mock settlement workflow.

This binds reviewed data, not real delegated authority or provider finality.
"""
from __future__ import annotations

import copy
import hashlib
import json
from typing import Any


def digest(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()


def snapshot(claim: dict[str, Any], *, tenant_id: str, estimate: dict[str, Any] | None = None) -> dict[str, Any]:
    return copy.deepcopy({
        "schema": "aegis.reviewed-snapshot/1",
        "tenant_id": tenant_id,
        "claim_id": claim["claim_id"],
        "submission": claim.get("submission"),
        "evidence": claim.get("evidence", []),
        "vision": claim.get("vision"),
        "pricing_context": claim.get("pricing_context"),
        "estimate": estimate if estimate is not None else claim.get("estimate"),
        "currency": "USD",
    })


def matches(claim: dict[str, Any], tenant_id: str) -> bool:
    assurance = claim.get("assurance") or {}
    expected = digest(snapshot(claim, tenant_id=tenant_id))
    return (
        assurance.get("reviewed_snapshot_sha256") == expected
        and digest(assurance.get("reviewed_snapshot")) == expected
    )
