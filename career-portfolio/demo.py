"""Recruiting-only deterministic consequence-flow demonstrator.

Authored from scratch for the public JCEE Labs career portfolio. This module is
intentionally generic and is not copied from any proprietary JCEE system.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from decimal import Decimal, InvalidOperation
import hashlib
import json
from typing import Iterable


@dataclass(frozen=True)
class Proposal:
    proposal_id: str
    target: str
    amount: str
    purpose: str


@dataclass(frozen=True)
class Policy:
    allowed_targets: tuple[str, ...]
    max_amount: str
    require_purpose: bool = True


@dataclass(frozen=True)
class GateDecision:
    allowed: bool
    reason: str


class SimulatedEffectStore:
    """In-memory effect boundary used only by this recruiting toy."""

    def __init__(self) -> None:
        self._effects: dict[str, dict[str, str]] = {}

    def already_materialized(self, proposal_id: str) -> bool:
        return proposal_id in self._effects

    def materialize(self, proposal: Proposal) -> dict[str, str]:
        if self.already_materialized(proposal.proposal_id):
            raise ValueError("duplicate proposal_id at effect boundary")

        effect = {
            "effect_id": f"simulated:{proposal.proposal_id}",
            "status": "simulated",
            "target": proposal.target,
            "amount": proposal.amount,
        }
        self._effects[proposal.proposal_id] = effect
        return effect


def _money(value: str) -> Decimal:
    try:
        parsed = Decimal(value)
    except InvalidOperation as exc:
        raise ValueError("amount must be a decimal string") from exc
    if not parsed.is_finite():
        raise ValueError("amount must be finite")
    return parsed


def evaluate(proposal: Proposal, policy: Policy, consumed_ids: Iterable[str]) -> GateDecision:
    """Return a deterministic allow/refuse decision from explicit inputs."""

    consumed = set(consumed_ids)

    if not proposal.proposal_id.strip():
        return GateDecision(False, "missing_proposal_id")
    if proposal.proposal_id in consumed:
        return GateDecision(False, "proposal_already_consumed")
    if proposal.target not in policy.allowed_targets:
        return GateDecision(False, "target_not_allowed")

    amount = _money(proposal.amount)
    limit = _money(policy.max_amount)
    if amount <= 0:
        return GateDecision(False, "amount_must_be_positive")
    if amount > limit:
        return GateDecision(False, "amount_exceeds_demo_limit")
    if policy.require_purpose and not proposal.purpose.strip():
        return GateDecision(False, "purpose_required")

    return GateDecision(True, "approved_by_demo_policy")


def _receipt_id(payload: dict) -> str:
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:16]
    return f"career-demo-{digest}"


def process(proposal: Proposal, policy: Policy, store: SimulatedEffectStore) -> dict:
    """Evaluate, optionally simulate one effect, and return a bounded receipt."""

    decision = evaluate(proposal, policy, store._effects.keys())
    effect = store.materialize(proposal) if decision.allowed else None

    core = {
        "receipt_version": "career-demo-1",
        "proposal": asdict(proposal),
        "decision": {"allowed": decision.allowed, "reason": decision.reason},
        "effect": effect,
        "scope": "recruiting_only_simulation",
        "notice": (
            "Invented public example. Records only this toy's deterministic decision "
            "and simulated effect; it is not a production, compliance, or external-truth claim."
        ),
    }
    return {"receipt_id": _receipt_id(core), **core}


def _print_example(title: str, proposal: Proposal, policy: Policy, store: SimulatedEffectStore) -> None:
    print(f"\n{title}")
    print(json.dumps(process(proposal, policy, store), indent=2, sort_keys=True))


if __name__ == "__main__":
    demo_policy = Policy(
        allowed_targets=("sandbox-vendor-a", "sandbox-vendor-b"),
        max_amount="500.00",
    )

    _print_example(
        "APPROVED EXAMPLE",
        Proposal("proposal-001", "sandbox-vendor-a", "125.00", "demo invoice"),
        demo_policy,
        SimulatedEffectStore(),
    )

    _print_example(
        "REFUSED EXAMPLE",
        Proposal("proposal-002", "unknown-target", "125.00", "demo invoice"),
        demo_policy,
        SimulatedEffectStore(),
    )
