# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""Evidence-backed causal retry decisions for VOW.

The module implements the smallest representation that survived QG-001:
hypergraph relations interpreted by a branching, graph-rewriting automaton.
It is intentionally domain-neutral. Adapters describe causal identities and
evidence; the VOW runtime owns the fail-closed retry policy.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
import hashlib
import json
from typing import Any, Iterable, Mapping, Optional


CAUSAL_EFFECT_PROTOCOL_VERSION = "1.0"


class CausalModelError(ValueError):
    """A causal contract or receipt trace is malformed or contradictory."""


class RetryVerdict(str, Enum):
    SAFE_TO_RETRY = "safe_to_retry"
    DO_NOT_RETRY = "do_not_retry"
    OBSERVE_FIRST = "observe_first"


class CausalReceiptKind(str, Enum):
    RESERVE = "reserve"
    RELEASE = "release"
    TRANSITION = "transition"
    OBSERVE = "observe"


def _tokens(values: Iterable[Any], label: str) -> tuple[str, ...]:
    result = tuple(str(value).strip() for value in values)
    if any(not value for value in result):
        raise CausalModelError(f"{label} cannot contain empty tokens")
    if len(set(result)) != len(result):
        raise CausalModelError(f"{label} cannot contain duplicates")
    return result


@dataclass(frozen=True)
class CausalMode:
    name: str
    relations: tuple[tuple[str, ...], ...] = ()
    aliases: Mapping[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise CausalModelError("mode name must be non-empty")
        normalized_relations = []
        seen = set()
        for index, relation in enumerate(self.relations):
            normalized = _tokens(relation, f"relations[{index}]")
            if len(normalized) < 2:
                raise CausalModelError("causal relations require at least two members")
            key = frozenset(normalized)
            if key in seen:
                raise CausalModelError("duplicate causal relation")
            seen.add(key)
            normalized_relations.append(tuple(sorted(key)))
        normalized_aliases = {
            str(alias).strip(): str(target).strip()
            for alias, target in dict(self.aliases).items()
        }
        if any(not alias or not target for alias, target in normalized_aliases.items()):
            raise CausalModelError("aliases and canonical targets must be non-empty")
        if any(alias == target for alias, target in normalized_aliases.items()):
            raise CausalModelError("identity aliases cannot map a token to itself")
        if set(normalized_aliases) & set(normalized_aliases.values()):
            raise CausalModelError("alias chains are not allowed; map directly to canonical identity")
        object.__setattr__(self, "relations", tuple(normalized_relations))
        object.__setattr__(self, "aliases", normalized_aliases)

    @classmethod
    def from_value(cls, value: Any) -> "CausalMode":
        if isinstance(value, cls):
            return value
        if not isinstance(value, Mapping):
            raise CausalModelError("mode must be a mapping or CausalMode")
        return cls(
            name=str(value.get("name", "")),
            relations=tuple(tuple(item) for item in value.get("relations", ())),
            aliases=dict(value.get("aliases", {})),
        )


@dataclass(frozen=True)
class CausalTransition:
    source: str
    event: str
    target: str

    def __post_init__(self) -> None:
        if not self.source.strip() or not self.event.strip() or not self.target.strip():
            raise CausalModelError("transition source, event, and target must be non-empty")

    @classmethod
    def from_value(cls, value: Any) -> "CausalTransition":
        if isinstance(value, cls):
            return value
        if not isinstance(value, Mapping):
            raise CausalModelError("transition must be a mapping or CausalTransition")
        return cls(
            source=str(value.get("source", "")),
            event=str(value.get("event", "")),
            target=str(value.get("target", "")),
        )


@dataclass(frozen=True)
class CausalEffectContract:
    modes: tuple[CausalMode, ...]
    initial_modes: tuple[str, ...]
    transitions: tuple[CausalTransition, ...] = ()
    max_diagnostic_observations: int = 1
    protocol_version: str = CAUSAL_EFFECT_PROTOCOL_VERSION

    def __post_init__(self) -> None:
        if self.protocol_version != CAUSAL_EFFECT_PROTOCOL_VERSION:
            raise CausalModelError(
                f"unsupported causal-effect protocol {self.protocol_version!r}; "
                f"runtime requires {CAUSAL_EFFECT_PROTOCOL_VERSION!r}"
            )
        modes = tuple(CausalMode.from_value(mode) for mode in self.modes)
        if not modes:
            raise CausalModelError("causal contract requires at least one mode")
        names = [mode.name for mode in modes]
        if len(set(names)) != len(names):
            raise CausalModelError("causal mode names must be unique")
        initial = _tokens(self.initial_modes, "initial_modes")
        unknown_initial = set(initial) - set(names)
        if unknown_initial:
            raise CausalModelError(f"unknown initial modes: {sorted(unknown_initial)}")
        transitions = tuple(CausalTransition.from_value(item) for item in self.transitions)
        keys = set()
        for transition in transitions:
            if transition.source not in names or transition.target not in names:
                raise CausalModelError("transition references an unknown mode")
            key = (transition.source, transition.event)
            if key in keys:
                raise CausalModelError("transition source/event pairs must be deterministic")
            keys.add(key)
        if self.max_diagnostic_observations < 0:
            raise CausalModelError("max_diagnostic_observations cannot be negative")
        object.__setattr__(self, "modes", modes)
        object.__setattr__(self, "initial_modes", initial)
        object.__setattr__(self, "transitions", transitions)

    @classmethod
    def from_value(cls, value: Any) -> "CausalEffectContract":
        if isinstance(value, cls):
            return value
        if not isinstance(value, Mapping):
            raise CausalModelError("causal contract must be a mapping")
        return cls(
            modes=tuple(CausalMode.from_value(item) for item in value.get("modes", ())),
            initial_modes=tuple(value.get("initial_modes", ())),
            transitions=tuple(
                CausalTransition.from_value(item)
                for item in value.get("transitions", ())
            ),
            max_diagnostic_observations=int(value.get("max_diagnostic_observations", 1)),
            protocol_version=str(
                value.get("protocol_version", CAUSAL_EFFECT_PROTOCOL_VERSION)
            ),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "protocol_version": self.protocol_version,
            "initial_modes": list(self.initial_modes),
            "max_diagnostic_observations": self.max_diagnostic_observations,
            "modes": [
                {
                    "name": mode.name,
                    "relations": [list(relation) for relation in mode.relations],
                    "aliases": dict(mode.aliases),
                }
                for mode in self.modes
            ],
            "transitions": [asdict(transition) for transition in self.transitions],
        }

    @property
    def sha256(self) -> str:
        payload = json.dumps(self.to_dict(), sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(payload.encode()).hexdigest()


@dataclass(frozen=True)
class CausalEffectReceipt:
    receipt_id: str
    effect_id: str
    sequence: int
    kind: CausalReceiptKind
    territories: tuple[str, ...] = ()
    event: Optional[str] = None
    observed_mode: Optional[str] = None
    evidence_ref: Optional[str] = None

    def __post_init__(self) -> None:
        if not self.receipt_id.strip() or not self.effect_id.strip():
            raise CausalModelError("receipt_id and effect_id must be non-empty")
        if self.sequence < 1:
            raise CausalModelError("receipt sequence must be positive")
        kind = CausalReceiptKind(self.kind)
        territories = _tokens(self.territories, "receipt territories")
        if kind in {CausalReceiptKind.RESERVE, CausalReceiptKind.RELEASE}:
            if not territories or self.event is not None or self.observed_mode is not None:
                raise CausalModelError(
                    f"{kind.value} receipts require territories only"
                )
        elif kind == CausalReceiptKind.TRANSITION:
            if not self.event or territories or self.observed_mode is not None:
                raise CausalModelError("transition receipts require exactly one event")
        elif kind == CausalReceiptKind.OBSERVE:
            if not self.observed_mode or territories or self.event is not None:
                raise CausalModelError("observe receipts require exactly one observed_mode")
        object.__setattr__(self, "kind", kind)
        object.__setattr__(self, "territories", territories)

    @classmethod
    def from_value(cls, value: Any) -> "CausalEffectReceipt":
        if isinstance(value, cls):
            return value
        if not isinstance(value, Mapping):
            raise CausalModelError("causal receipt must be a mapping")
        return cls(
            receipt_id=str(value.get("receipt_id", "")),
            effect_id=str(value.get("effect_id", "")),
            sequence=int(value.get("sequence", 0)),
            kind=CausalReceiptKind(value.get("kind")),
            territories=tuple(value.get("territories", ())),
            event=value.get("event"),
            observed_mode=value.get("observed_mode"),
            evidence_ref=value.get("evidence_ref"),
        )

    def to_dict(self) -> dict[str, Any]:
        value = {
            "receipt_id": self.receipt_id,
            "effect_id": self.effect_id,
            "sequence": self.sequence,
            "kind": self.kind.value,
            "territories": list(self.territories),
        }
        if self.event is not None:
            value["event"] = self.event
        if self.observed_mode is not None:
            value["observed_mode"] = self.observed_mode
        if self.evidence_ref is not None:
            value["evidence_ref"] = self.evidence_ref
        return value


@dataclass(frozen=True)
class CausalRetryContext:
    contract: CausalEffectContract
    effect_id: str
    receipts: tuple[CausalEffectReceipt, ...]
    proposal: tuple[str, ...]

    def __post_init__(self) -> None:
        contract = CausalEffectContract.from_value(self.contract)
        if not self.effect_id.strip():
            raise CausalModelError("causal retry effect_id must be non-empty")
        receipts = tuple(CausalEffectReceipt.from_value(item) for item in self.receipts)
        if any(item.effect_id != self.effect_id for item in receipts):
            raise CausalModelError("all causal receipts must match the retry effect_id")
        sequences = [item.sequence for item in receipts]
        if sequences != sorted(sequences) or len(set(sequences)) != len(sequences):
            raise CausalModelError("causal receipt sequences must be unique and increasing")
        ids = [item.receipt_id for item in receipts]
        if len(set(ids)) != len(ids):
            raise CausalModelError("causal receipt identifiers must be unique")
        proposal = _tokens(self.proposal, "retry proposal")
        if not proposal:
            raise CausalModelError("retry proposal requires at least one territory")
        object.__setattr__(self, "contract", contract)
        object.__setattr__(self, "receipts", receipts)
        object.__setattr__(self, "proposal", proposal)

    @classmethod
    def from_value(cls, value: Any) -> "CausalRetryContext":
        if isinstance(value, cls):
            return value
        if not isinstance(value, Mapping):
            raise CausalModelError("causal retry context must be a mapping")
        return cls(
            contract=CausalEffectContract.from_value(value.get("contract")),
            effect_id=str(value.get("effect_id", "")),
            receipts=tuple(
                CausalEffectReceipt.from_value(item)
                for item in value.get("receipts", ())
            ),
            proposal=tuple(value.get("proposal", ())),
        )


@dataclass(frozen=True)
class CausalRetryDecision:
    verdict: RetryVerdict
    reason: str
    possible_modes: tuple[str, ...]
    safe_modes: tuple[str, ...]
    unsafe_modes: tuple[str, ...]
    observations_used: int
    blocking_relations: Mapping[str, tuple[tuple[str, ...], ...]]
    reservations: Mapping[str, tuple[str, ...]]
    contract_sha256: str
    trace_sha256: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "verdict": self.verdict.value,
            "reason": self.reason,
            "possible_modes": list(self.possible_modes),
            "safe_modes": list(self.safe_modes),
            "unsafe_modes": list(self.unsafe_modes),
            "observations_used": self.observations_used,
            "blocking_relations": {
                mode: [list(relation) for relation in relations]
                for mode, relations in self.blocking_relations.items()
            },
            "reservations": {
                mode: list(items) for mode, items in self.reservations.items()
            },
            "contract_sha256": self.contract_sha256,
            "trace_sha256": self.trace_sha256,
        }


def _canonical(token: str, mode: CausalMode) -> str:
    return mode.aliases.get(token, token)


def _blocking_relations(
    reserved: set[str], proposal: set[str], mode: CausalMode
) -> tuple[tuple[str, ...], ...]:
    blocked = []
    for relation in mode.relations:
        members = set(relation)
        if members <= reserved | proposal and members & reserved and members & proposal:
            blocked.append(tuple(sorted(members)))
    for overlap in sorted(reserved & proposal):
        blocked.append((overlap, overlap))
    return tuple(blocked)


def decide_causal_retry(context: CausalRetryContext | Mapping[str, Any]) -> CausalRetryDecision:
    """Replay receipts and decide safely across every still-possible mode.

    The interpreter is label-blind: it reads only the supplied contract and
    evidence. A retry is authorized only when every possible causal branch is
    safe. Disagreement between branches requests observation. Agreement that
    any reservation/relation would be duplicated refuses the retry.
    """
    context = CausalRetryContext.from_value(context)
    modes = {mode.name: mode for mode in context.contract.modes}
    transitions = {
        (item.source, item.event): item.target for item in context.contract.transitions
    }
    possible = set(context.contract.initial_modes)
    reservations: dict[str, set[str]] = {name: set() for name in possible}
    observations_used = 0

    for receipt in context.receipts:
        if receipt.kind == CausalReceiptKind.TRANSITION:
            next_possible = set()
            next_reservations: dict[str, set[str]] = {}
            for name in possible:
                key = (name, str(receipt.event))
                if key not in transitions:
                    raise CausalModelError(
                        f"no transition for mode {name!r} and event {receipt.event!r}"
                    )
                target = transitions[key]
                next_possible.add(target)
                next_reservations.setdefault(target, set()).update(reservations[name])
            possible = next_possible
            reservations = next_reservations
            continue

        if receipt.kind == CausalReceiptKind.OBSERVE:
            observations_used += 1
            if observations_used > context.contract.max_diagnostic_observations:
                raise CausalModelError("diagnostic observation budget exceeded")
            observed = str(receipt.observed_mode)
            if observed not in possible:
                raise CausalModelError(
                    f"observed mode {observed!r} contradicts possible modes"
                )
            possible = {observed}
            reservations = {observed: reservations[observed]}
            continue

        for name in possible:
            translated = {_canonical(token, modes[name]) for token in receipt.territories}
            if receipt.kind == CausalReceiptKind.RESERVE:
                reservations[name].update(translated)
            elif receipt.kind == CausalReceiptKind.RELEASE:
                reservations[name].difference_update(translated)

    safe_modes = []
    unsafe_modes = []
    blocked: dict[str, tuple[tuple[str, ...], ...]] = {}
    for name in sorted(possible):
        proposal = {_canonical(token, modes[name]) for token in context.proposal}
        blockers = _blocking_relations(reservations[name], proposal, modes[name])
        blocked[name] = blockers
        if blockers:
            unsafe_modes.append(name)
        else:
            safe_modes.append(name)

    if safe_modes and not unsafe_modes:
        verdict = RetryVerdict.SAFE_TO_RETRY
        reason = "every possible causal mode permits the proposed retry"
    elif unsafe_modes and not safe_modes:
        verdict = RetryVerdict.DO_NOT_RETRY
        reason = "every possible causal mode contains a conflicting reservation"
    else:
        verdict = RetryVerdict.OBSERVE_FIRST
        reason = "possible causal modes disagree; observation is required before intervention"

    trace_payload = {
        "effect_id": context.effect_id,
        "receipts": [receipt.to_dict() for receipt in context.receipts],
        "proposal": list(context.proposal),
    }
    trace_json = json.dumps(trace_payload, sort_keys=True, separators=(",", ":"))
    return CausalRetryDecision(
        verdict=verdict,
        reason=reason,
        possible_modes=tuple(sorted(possible)),
        safe_modes=tuple(safe_modes),
        unsafe_modes=tuple(unsafe_modes),
        observations_used=observations_used,
        blocking_relations=blocked,
        reservations={
            name: tuple(sorted(reservations[name])) for name in sorted(possible)
        },
        contract_sha256=context.contract.sha256,
        trace_sha256=hashlib.sha256(trace_json.encode()).hexdigest(),
    )


__all__ = [
    "CAUSAL_EFFECT_PROTOCOL_VERSION",
    "CausalEffectContract",
    "CausalEffectReceipt",
    "CausalMode",
    "CausalModelError",
    "CausalReceiptKind",
    "CausalRetryContext",
    "CausalRetryDecision",
    "CausalTransition",
    "RetryVerdict",
    "decide_causal_retry",
]
