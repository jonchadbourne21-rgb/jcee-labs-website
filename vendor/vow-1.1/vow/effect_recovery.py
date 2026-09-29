# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""Typed authority reconciliation for ambiguous external effects.

This module deliberately separates three things that a local journal cannot
collapse safely: the authority's declared contract, its observed evidence,
and VOW's recovery decision.  The decision table is frozen in the associated
hypothesis ledger; adapters observe providers but do not choose policy.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from enum import Enum
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
from typing import Any, Callable, Optional

from .causal_effects import (
    CausalModelError,
    CausalRetryContext,
    RetryVerdict,
    decide_causal_retry,
)


EFFECT_ADAPTER_PROTOCOL_VERSION = "1.0"


@dataclass(frozen=True)
class EffectAdapterManifest:
    name: str
    version: str
    provider: str
    protocol_version: str
    operations: tuple[str, ...]

    @classmethod
    def from_value(cls, value: Any) -> "EffectAdapterManifest":
        if isinstance(value, cls):
            manifest = value
        elif isinstance(value, dict):
            manifest = cls(
                name=str(value.get("name", "")).strip(),
                version=str(value.get("version", "")).strip(),
                provider=str(value.get("provider", "")).strip(),
                protocol_version=str(value.get("protocol_version", "")).strip(),
                operations=tuple(str(item) for item in
                                 value.get("operations", ())),
            )
        else:
            raise TypeError("VOW_EFFECT_ADAPTER_MANIFEST must be a mapping "
                            "or EffectAdapterManifest")
        if not all((manifest.name, manifest.version, manifest.provider,
                    manifest.protocol_version, manifest.operations)):
            raise ValueError("effect adapter manifest fields must be non-empty")
        if manifest.protocol_version != EFFECT_ADAPTER_PROTOCOL_VERSION:
            raise ValueError(
                f"unsupported effect adapter protocol "
                f"{manifest.protocol_version!r}; runtime requires "
                f"{EFFECT_ADAPTER_PROTOCOL_VERSION!r}"
            )
        return manifest


class EvidenceStatus(str, Enum):
    ABSENT = "absent"
    QUEUED = "queued"
    DELIVERED = "delivered"
    PARTIAL = "partial"
    UNKNOWN = "unknown"


class RecoveryAction(str, Enum):
    PROBE = "probe"
    NOOP = "noop"
    WAIT = "wait"
    RETRY_SAME_KEY = "retry_same_key"
    RETRY_MISSING = "retry_missing"
    ESCALATE = "escalate"


@dataclass(frozen=True)
class EffectContract:
    authoritative_lookup: bool
    dedupe_window_seconds: int
    same_key_deduplicated: bool
    recipient_retry_supported: bool
    max_status_probes: int = 2


@dataclass(frozen=True)
class RecoveryEvidence:
    status: EvidenceStatus
    request_age_seconds: int
    probes_used: int
    result: Any = None
    retry_after_seconds: int = 5


@dataclass(frozen=True)
class RecoveryDecision:
    action: RecoveryAction
    reason: str
    causal_verdict: Optional[RetryVerdict] = None
    causal_reason: Optional[str] = None
    causal_receipt: Optional[dict[str, Any]] = None


@dataclass(frozen=True)
class AuthorityObservation:
    contract: EffectContract
    evidence: RecoveryEvidence
    causal_context: Optional[CausalRetryContext] = None


RecoveryResolver = Callable[..., AuthorityObservation]


def _typed_recovery(contract: EffectContract,
                    evidence: RecoveryEvidence) -> RecoveryDecision:
    """Original v1 typed decision table, before the optional causal veto."""
    status = evidence.status
    if status == EvidenceStatus.DELIVERED:
        return RecoveryDecision(RecoveryAction.NOOP,
                                "authority confirms completed effect")
    if status == EvidenceStatus.QUEUED:
        return RecoveryDecision(RecoveryAction.WAIT,
                                "authority confirms pending activation")
    if status == EvidenceStatus.ABSENT:
        inside_window = (
            evidence.request_age_seconds <= contract.dedupe_window_seconds
        )
        if (contract.authoritative_lookup and inside_window
                and contract.same_key_deduplicated):
            return RecoveryDecision(
                RecoveryAction.RETRY_SAME_KEY,
                "authoritative absence inside same-key dedupe window",
            )
        return RecoveryDecision(
            RecoveryAction.ESCALATE,
            "absence is not safely retryable under the declared contract",
        )
    if status == EvidenceStatus.PARTIAL:
        if contract.recipient_retry_supported:
            return RecoveryDecision(RecoveryAction.RETRY_MISSING,
                                    "authority supports missing-target retry")
        return RecoveryDecision(
            RecoveryAction.ESCALATE,
            "partial effect lacks missing-target retry support",
        )
    if (status == EvidenceStatus.UNKNOWN
            and evidence.probes_used < contract.max_status_probes):
        return RecoveryDecision(RecoveryAction.PROBE,
                                "evidence unresolved; probe budget remains")
    return RecoveryDecision(RecoveryAction.ESCALATE,
                            "evidence unresolved after safe probe budget")


def decide_recovery(
        contract: EffectContract,
        evidence: RecoveryEvidence,
        causal_context: Optional[CausalRetryContext] = None,
) -> RecoveryDecision:
    """Typed authority policy plus an optional, non-broadening causal gate.

    The causal layer may veto or delay a retry that the typed table would
    otherwise allow. It can never turn WAIT, NOOP, or ESCALATE into a retry.
    This monotonic rule preserves the safety behavior of existing adapters.
    """
    typed = _typed_recovery(contract, evidence)
    if causal_context is None:
        return typed
    try:
        causal = decide_causal_retry(causal_context)
    except (CausalModelError, TypeError, ValueError) as exc:
        return RecoveryDecision(
            RecoveryAction.ESCALATE,
            f"causal-effect evidence invalid; retry refused: {exc}",
            causal_verdict=RetryVerdict.DO_NOT_RETRY,
            causal_reason="invalid causal evidence cannot authorize intervention",
            causal_receipt={"error": str(exc)},
        )

    causal_payload = causal.to_dict()
    retry_actions = {
        RecoveryAction.RETRY_SAME_KEY,
        RecoveryAction.RETRY_MISSING,
    }
    if typed.action not in retry_actions:
        return RecoveryDecision(
            typed.action,
            typed.reason,
            causal_verdict=causal.verdict,
            causal_reason=causal.reason,
            causal_receipt=causal_payload,
        )
    if causal.verdict == RetryVerdict.SAFE_TO_RETRY:
        return RecoveryDecision(
            typed.action,
            f"{typed.reason}; causal gate authorizes the proposed territory",
            causal_verdict=causal.verdict,
            causal_reason=causal.reason,
            causal_receipt=causal_payload,
        )
    if (causal.verdict == RetryVerdict.OBSERVE_FIRST
            and evidence.probes_used < contract.max_status_probes):
        return RecoveryDecision(
            RecoveryAction.PROBE,
            "causal branches disagree; acquire one more authority observation",
            causal_verdict=causal.verdict,
            causal_reason=causal.reason,
            causal_receipt=causal_payload,
        )
    return RecoveryDecision(
        RecoveryAction.ESCALATE,
        "typed recovery proposed a retry, but the causal-effect gate did not authorize it",
        causal_verdict=causal.verdict,
        causal_reason=causal.reason,
        causal_receipt=causal_payload,
    )


def resolve_effect(resolver: RecoveryResolver, capability: str, action: str,
                   args: list[str], key: str
                   ) -> tuple[AuthorityObservation, RecoveryDecision]:
    """Observe until the frozen table returns a terminal decision."""
    probe = 1
    while True:
        observation = resolver(
            capability=capability,
            action=action,
            args=list(args),
            key=key,
            probes_used=probe,
        )
        if not isinstance(observation, AuthorityObservation):
            raise TypeError("effect recovery adapter must return "
                            "AuthorityObservation")
        evidence = observation.evidence
        if evidence.probes_used != probe:
            raise ValueError("adapter evidence probes_used does not match "
                             "the requested probe number")
        decision = decide_recovery(
            observation.contract, evidence, observation.causal_context)
        if decision.action != RecoveryAction.PROBE:
            return observation, decision
        probe += 1


def recovery_receipt(observation: AuthorityObservation,
                     decision: RecoveryDecision, *, capability: str,
                     action: str, key: str) -> dict[str, Any]:
    contract = asdict(observation.contract)
    evidence = asdict(observation.evidence)
    evidence["status"] = observation.evidence.status.value
    contract_json = json.dumps(contract, sort_keys=True, separators=(",", ":"))
    return {
        "capability": capability,
        "action": action,
        "key": key,
        "contract": contract,
        "contract_sha256": hashlib.sha256(contract_json.encode()).hexdigest(),
        "evidence": evidence,
        "decision": decision.action.value,
        "reason": decision.reason,
        "causal_gate": (
            {
                "verdict": decision.causal_verdict.value,
                "reason": decision.causal_reason,
                "receipt": decision.causal_receipt,
            }
            if decision.causal_verdict is not None else None
        ),
    }


def adapter_identity(resolver: Optional[RecoveryResolver]) -> Optional[dict]:
    if resolver is None:
        return None
    manifest = getattr(resolver, "_vow_adapter_manifest", None)
    if manifest is None:
        return {
            "protocol_version": "prototype",
            "sha256": getattr(resolver, "_vow_adapter_sha256", None),
            "function": getattr(resolver, "_vow_adapter_function", None),
        }
    value = asdict(manifest)
    value["operations"] = list(manifest.operations)
    value["sha256"] = getattr(resolver, "_vow_adapter_sha256", None)
    value["function"] = getattr(resolver, "_vow_adapter_function", None)
    return value


def load_recovery_adapter(spec: Optional[str], *, require_manifest: bool = False
                          ) -> Optional[RecoveryResolver]:
    """Load ``/absolute/adapter.py:function`` from an explicit operator spec."""
    if not spec:
        return None
    try:
        raw_path, function_name = spec.rsplit(":", 1)
    except ValueError as exc:
        raise ValueError("VOW_EFFECT_RECOVERY_ADAPTER must be "
                         "/absolute/file.py:function") from exc
    path = Path(raw_path).resolve()
    if not path.is_absolute() or not path.is_file():
        raise ValueError(f"effect recovery adapter not found: {path}")
    module_name = "_vow_effect_recovery_" + hashlib.sha256(
        str(path).encode()).hexdigest()[:16]
    module_spec = importlib.util.spec_from_file_location(module_name, path)
    if module_spec is None or module_spec.loader is None:
        raise ValueError(f"cannot load effect recovery adapter: {path}")
    module = importlib.util.module_from_spec(module_spec)
    sys.modules[module_name] = module
    module_spec.loader.exec_module(module)
    resolver = getattr(module, function_name, None)
    if not callable(resolver):
        raise ValueError(f"effect recovery adapter has no callable "
                         f"{function_name!r}")
    resolver._vow_adapter_sha256 = hashlib.sha256(path.read_bytes()).hexdigest()
    resolver._vow_adapter_function = function_name
    raw_manifest = getattr(module, "VOW_EFFECT_ADAPTER_MANIFEST", None)
    if raw_manifest is None:
        if require_manifest:
            raise ValueError("official effect adapters must declare "
                             "VOW_EFFECT_ADAPTER_MANIFEST")
    else:
        resolver._vow_adapter_manifest = EffectAdapterManifest.from_value(
            raw_manifest)
    return resolver
