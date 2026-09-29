"""Product-domain helpers for the AEGIS ClaimOS demonstrable MVP.

This module owns UI-facing dossier defaults, static demo identities, queue/dashboard
projections, and deterministic demo reset state. It deliberately does not perform
pricing or settlement authorization; those remain in their existing server-authoritative
modules.
"""
from __future__ import annotations

import copy
import uuid
from collections.abc import Callable, Iterable
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from typing import Any

from backend.models import WorkflowStatus
from backend.pricing import compute_claim_estimate, regional_multiplier

DEMO_CLAIM_ID = "CLM_DEMO_KITCHEN"


@dataclass(frozen=True)
class DemoUser:
    """An immutable demo user exposed through the role-switcher API."""

    user_id: str
    name: str
    role: str
    email: str


DEMO_TEAM: tuple[DemoUser, ...] = (
    DemoUser("USR_FIELD_01", "Maya Chen", "FIELD_ADJUSTER", "maya.chen@aegis.demo"),
    DemoUser("USR_DESK_01", "Alex Rivera", "DESK_ADJUSTER", "alex.rivera@aegis.demo"),
    DemoUser("USR_SUPERVISOR_01", "Riley Thompson", "SUPERVISOR", "riley.thompson@aegis.demo"),
    DemoUser("USR_FINANCE_01", "Morgan Patel", "FINANCE", "morgan.patel@aegis.demo"),
    DemoUser("USR_ADMIN_01", "Casey Brooks", "PROGRAM_ADMINISTRATOR", "casey.brooks@aegis.demo"),
)

TEAM_BY_ID = {member.user_id: member for member in DEMO_TEAM}
ASSIGNMENT_ROLES = {
    "field_adjuster_id": "FIELD_ADJUSTER",
    "desk_adjuster_id": "DESK_ADJUSTER",
}

# Financial lifecycle entries are intentionally absent. /approve and /payment own
# those transitions, while this table allows only harmless workflow progression and
# the terminal close boundary.
CONTROLLED_STATUS_TRANSITIONS: dict[str, frozenset[str]] = {
    WorkflowStatus.SUBMITTED.value: frozenset({WorkflowStatus.IN_REVIEW.value}),
    WorkflowStatus.PAID.value: frozenset({WorkflowStatus.CLOSED.value}),
}

NEXT_ACTION_BY_STATUS = {
    WorkflowStatus.SUBMITTED.value: "Analyze submitted evidence",
    WorkflowStatus.IN_REVIEW.value: "Review deterministic estimate",
    WorkflowStatus.APPROVED.value: "Schedule mock payment instruction",
    WorkflowStatus.PAYMENT_SCHEDULED.value: "Mark mock payment sent",
    WorkflowStatus.PAID.value: "Close claim",
    WorkflowStatus.CLOSED.value: "No further action",
}


def team_members() -> list[dict[str, str]]:
    """Return new JSON-safe copies of immutable demo user records."""
    return [asdict(member) for member in DEMO_TEAM]


def team_member(user_id: str) -> DemoUser | None:
    return TEAM_BY_ID.get(user_id)


def utc_now() -> str:
    """Return an RFC 3339 timestamp with an explicit UTC marker."""
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def make_task_id() -> str:
    return f"TSK_{uuid.uuid4().hex.upper()}"


def make_note_id() -> str:
    return f"NOTE_{uuid.uuid4().hex.upper()}"


def _as_dict(value: Any, fallback: dict[str, Any]) -> dict[str, Any]:
    return copy.deepcopy(value) if isinstance(value, dict) else copy.deepcopy(fallback)


def _as_dict_list(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [copy.deepcopy(item) for item in value if isinstance(item, dict)]


def _payment_defaults(status: str, estimate: dict[str, Any] | None) -> dict[str, Any]:
    payout = estimate.get("net_payout") if isinstance(estimate, dict) else None
    if status in {WorkflowStatus.PAID.value, WorkflowStatus.CLOSED.value}:
        state = "SENT"
    elif status == WorkflowStatus.PAYMENT_SCHEDULED.value:
        state = "SCHEDULED"
    else:
        state = "NOT_SCHEDULED"
    return {
        "status": state,
        "instruction_id": None,
        "method": None,
        "amount": payout,
        "currency": "USD",
        "scheduled_at": None,
        "sent_at": None,
        "actor_id": None,
        "mock": True,
    }


def evidence_readiness(claim: dict[str, Any]) -> dict[str, Any]:
    """Derive a concise evidence-readiness signal without changing evidence data."""
    evidence = claim.get("evidence")
    has_evidence = isinstance(evidence, list) and len(evidence) > 0
    analyzed = isinstance(claim.get("vision"), dict) and isinstance(claim.get("estimate"), dict)
    ready = has_evidence and analyzed
    return {
        "status": "READY" if ready else "PENDING",
        "is_ready": ready,
        "evidence_count": len(evidence) if isinstance(evidence, list) else 0,
        "analysis_complete": analyzed,
    }


def enrich_claim_defaults(claim: dict[str, Any]) -> dict[str, Any]:
    """Return a defensive dossier copy with every product field safely present.

    Existing persisted dossiers predate the collaboration and payment fields. This
    projection preserves their canonical claim data while adding JSON-safe defaults,
    so a legacy document can be read by every current API route without a migration.
    """
    output = copy.deepcopy(claim)
    status = str(output.get("status") or WorkflowStatus.SUBMITTED.value)
    output["status"] = status
    output["assignments"] = _as_dict(
        output.get("assignments"),
        {"field_adjuster_id": None, "desk_adjuster_id": None},
    )
    output["assignments"].setdefault("field_adjuster_id", None)
    output["assignments"].setdefault("desk_adjuster_id", None)
    output["tasks"] = _as_dict_list(output.get("tasks"))
    output["notes"] = _as_dict_list(output.get("notes"))
    output["audit_history"] = _as_dict_list(output.get("audit_history"))
    output["stages"] = _as_dict_list(output.get("stages"))
    output["evidence"] = copy.deepcopy(output.get("evidence")) if isinstance(output.get("evidence"), list) else []
    output["severity"] = str(output.get("severity") or "MEDIUM")
    output["sla_target"] = output.get("sla_target") if output.get("sla_target") is not None else output.get("created_at")
    output["next_action"] = str(output.get("next_action") or NEXT_ACTION_BY_STATUS.get(status, "Review claim"))
    output["evidence_readiness"] = _as_dict(output.get("evidence_readiness"), evidence_readiness(output))
    output["evidence_readiness"].setdefault("status", evidence_readiness(output)["status"])
    output["evidence_readiness"].setdefault("is_ready", evidence_readiness(output)["is_ready"])
    output["evidence_readiness"].setdefault("evidence_count", len(output["evidence"]))
    output["evidence_readiness"].setdefault("analysis_complete", isinstance(output.get("estimate"), dict))
    output["payment"] = _as_dict(output.get("payment"), _payment_defaults(status, output.get("estimate")))
    for key, value in _payment_defaults(status, output.get("estimate")).items():
        output["payment"].setdefault(key, value)
    return output


def _claim_search_text(claim: dict[str, Any]) -> str:
    submission = claim.get("submission") if isinstance(claim.get("submission"), dict) else {}
    return " ".join(
        str(value or "")
        for value in (
            claim.get("claim_id"),
            submission.get("homeowner_name"),
            submission.get("property_address"),
            submission.get("policy_number"),
        )
    ).casefold()


def filter_claims(
    claims: Iterable[dict[str, Any]],
    *,
    status: str | None = None,
    assignee: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """Apply exact queue filters and a case-insensitive dossier search."""
    needle = search.casefold().strip() if search else ""
    filtered: list[dict[str, Any]] = []
    for source in claims:
        claim = enrich_claim_defaults(source)
        assignments = claim["assignments"]
        if status is not None and claim["status"] != status:
            continue
        if assignee is not None and assignee not in {
            assignments.get("field_adjuster_id"),
            assignments.get("desk_adjuster_id"),
        }:
            continue
        if needle and needle not in _claim_search_text(claim):
            continue
        filtered.append(claim)
    return filtered


def _event_sort_key(event: dict[str, Any]) -> tuple[str, str]:
    return (str(event.get("occurred_at") or ""), str(event.get("event") or ""))


def _open_status(status: str) -> bool:
    return status != WorkflowStatus.CLOSED.value


def team_workload(claims: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Aggregate assignments and open tasks for each fixed demo user."""
    prepared = [enrich_claim_defaults(claim) for claim in claims]
    workload: list[dict[str, Any]] = []
    for user in DEMO_TEAM:
        assignments = 0
        open_tasks = 0
        for claim in prepared:
            if user.user_id in claim["assignments"].values() and _open_status(claim["status"]):
                assignments += 1
            open_tasks += sum(
                1
                for task in claim["tasks"]
                if task.get("owner_id") == user.user_id and task.get("status", "OPEN") != "COMPLETED"
            )
        workload.append({**asdict(user), "assigned_claims": assignments, "open_tasks": open_tasks})
    return workload


def dashboard_payload(claims: Iterable[dict[str, Any]]) -> dict[str, Any]:
    """Build an API-only portfolio aggregate from enriched dossier projections."""
    prepared = [enrich_claim_defaults(claim) for claim in claims]
    status_distribution = {state.value: 0 for state in WorkflowStatus}
    recent_activity: list[dict[str, Any]] = []
    open_claims = [claim for claim in prepared if _open_status(claim["status"])]
    for claim in prepared:
        status_distribution[claim["status"]] = status_distribution.get(claim["status"], 0) + 1
        for event in claim["audit_history"]:
            recent_activity.append({"claim_id": claim.get("claim_id"), **copy.deepcopy(event)})

    def payout(claim: dict[str, Any]) -> float:
        estimate = claim.get("estimate")
        return float(estimate.get("net_payout", 0.0)) if isinstance(estimate, dict) else 0.0

    ready_count = sum(1 for claim in prepared if claim["evidence_readiness"].get("is_ready") is True)
    approved_states = {
        WorkflowStatus.APPROVED.value,
        WorkflowStatus.PAYMENT_SCHEDULED.value,
        WorkflowStatus.PAID.value,
        WorkflowStatus.CLOSED.value,
    }
    recent_activity.sort(key=_event_sort_key, reverse=True)
    total_claims = len(prepared)
    return {
        "metrics": {
            "total_claims": total_claims,
            "open_claims": len(open_claims),
            "open_exposure": round(sum(payout(claim) for claim in open_claims), 2),
            "evidence_ready_claims": ready_count,
            "evidence_readiness_rate": round(ready_count / total_claims, 4) if total_claims else 0.0,
            "approval_throughput": sum(1 for claim in prepared if claim["status"] in approved_states),
            "authorized_exposure": round(sum(payout(claim) for claim in prepared if claim["status"] in approved_states), 2),
        },
        "status_distribution": status_distribution,
        "recent_activity": recent_activity[:20],
        "team_workload": team_workload(prepared),
    }


def build_demo_claim(
    *,
    vision_payload: dict[str, Any],
    now: str | None = None,
    settlement_slot: str | None = None,
) -> dict[str, Any]:
    """Create the complete, pre-analyzed Kitchen Water Damage demo dossier.

    The deterministic pricing engine receives only the product's fixed reference
    assumptions, preserving the required $2,105.30 RCV and $895.51 net payout.
    """
    timestamp = now or utc_now()
    estimate = compute_claim_estimate(vision_payload, zip_code="75201", deductible=1000.0, material_age_years=4.0)
    claim = {
        "claim_id": DEMO_CLAIM_ID,
        "settlement_slot": settlement_slot or f"reset-{uuid.uuid4().hex[:12]}",
        "status": WorkflowStatus.IN_REVIEW.value,
        "created_at": timestamp,
        "updated_at": timestamp,
        "submission": {
            "incident_description": "Kitchen supply-line failure caused sudden water damage to flooring, drywall, and baseboard.",
            "property_address": "1847 Hawthorne Avenue, Dallas, TX 75201",
            "zip_code": "75201",
            "deductible": 1000.0,
            "material_age_years": 4.0,
            "peril": "WATER",
            "homeowner_name": "Jordan Morgan",
            "policy_number": "APH-48392071",
            "incident_date": "2026-09-10",
            "evidence": [
                {
                    "media_url": "https://example.test/aegis-demo/kitchen-water-damage.jpg",
                    "media_type": "IMAGE",
                    "captured_at": timestamp,
                    "file_name": "kitchen-water-damage.jpg",
                    "label": "Kitchen water damage inspection image",
                }
            ],
        },
        "evidence": [
            {
                "media_url": "https://example.test/aegis-demo/kitchen-water-damage.jpg",
                "media_type": "IMAGE",
                "captured_at": timestamp,
                "file_name": "kitchen-water-damage.jpg",
                "label": "Kitchen water damage inspection image",
            }
        ],
        "stages": [
            {"id": stage_id, "name": name, "status": "COMPLETE", "completed_at": timestamp}
            for stage_id, name in (
                ("ingestion", "Ingestion & Telemetry Verification"),
                ("vision", "Computer Vision Forensics & Material Segmentation"),
                ("coverage", "Policy Form & Endorsement Checks"),
                ("pricing", "Line-Item Unit Pricing & Depreciation"),
                ("dossier", "Adjuster Dossier Synthesis"),
            )
        ],
        "vision": copy.deepcopy(vision_payload),
        "estimate": estimate,
        "assurance": None,
        "pricing_context": {
            "zip_code": "75201",
            "regional_index": regional_multiplier("75201"),
            "deductible": 1000.0,
            "material_age_years": 4.0,
            "price_book": "prototype-2026-09",
        },
        "approval": {
            "status": "NOT_REVIEWED",
            "reviewed_at": None,
            "approved_at": None,
            "adjuster_name": None,
            "notes": None,
        },
        "assignments": {"field_adjuster_id": "USR_FIELD_01", "desk_adjuster_id": "USR_DESK_01"},
        "tasks": [
            {
                "task_id": "TSK_DEMO_FIELD_INSPECTION",
                "title": "Confirm moisture mitigation scope",
                "owner_id": "USR_FIELD_01",
                "priority": "HIGH",
                "due_at": timestamp,
                "status": "OPEN",
                "created_at": timestamp,
                "completed_at": None,
                "completed_by": None,
            },
            {
                "task_id": "TSK_DEMO_DESK_REVIEW",
                "title": "Review deterministic line-item estimate",
                "owner_id": "USR_DESK_01",
                "priority": "NORMAL",
                "due_at": timestamp,
                "status": "OPEN",
                "created_at": timestamp,
                "completed_at": None,
                "completed_by": None,
            },
        ],
        "notes": [
            {
                "note_id": "NOTE_DEMO_INTAKE",
                "author_id": "USR_FIELD_01",
                "author_role": "FIELD_ADJUSTER",
                "body": "Field evidence and moisture observations are ready for desk review.",
                "visibility": "INTERNAL",
                "created_at": timestamp,
            },
            {
                "note_id": "NOTE_DEMO_DESK",
                "author_id": "USR_DESK_01",
                "author_role": "DESK_ADJUSTER",
                "body": "Deterministic estimate prepared; supervisor authorization is the next settlement boundary.",
                "visibility": "INTERNAL",
                "created_at": timestamp,
            },
        ],
        "severity": "HIGH",
        "sla_target": timestamp,
        "next_action": NEXT_ACTION_BY_STATUS[WorkflowStatus.IN_REVIEW.value],
        "evidence_readiness": {
            "status": "READY",
            "is_ready": True,
            "evidence_count": 1,
            "analysis_complete": True,
        },
        "payment": _payment_defaults(WorkflowStatus.IN_REVIEW.value, estimate),
        "audit_history": [
            {
                "event": "CLAIM_DEMO_RESET",
                "occurred_at": timestamp,
                "actor": "SYSTEM",
                "details": {"demo_claim": True},
            },
            {
                "event": "ANALYSIS_COMPLETED",
                "occurred_at": timestamp,
                "actor": "AI_PIPELINE",
                "details": {
                    "inspection_id": vision_payload["inspection_id"],
                    "line_item_count": len(estimate["line_items"]),
                    "regional_index": regional_multiplier("75201"),
                },
            },
        ],
    }
    return enrich_claim_defaults(claim)


def seed_demo_claim(
    repository: Any,
    vision_builder: Callable[[str, str], dict[str, Any]],
) -> dict[str, Any]:
    """Idempotently replace the canonical Kitchen Water Damage demo dossier."""
    timestamp = utc_now()
    claim = build_demo_claim(
        vision_payload=vision_builder(DEMO_CLAIM_ID, timestamp),
        now=timestamp,
        settlement_slot=f"reset-{uuid.uuid4().hex[:12]}",
    )
    return repository.replace(claim)


__all__ = [
    "ASSIGNMENT_ROLES",
    "CONTROLLED_STATUS_TRANSITIONS",
    "DEMO_CLAIM_ID",
    "DEMO_TEAM",
    "NEXT_ACTION_BY_STATUS",
    "build_demo_claim",
    "dashboard_payload",
    "enrich_claim_defaults",
    "evidence_readiness",
    "filter_claims",
    "make_note_id",
    "make_task_id",
    "seed_demo_claim",
    "team_member",
    "team_members",
    "team_workload",
    "utc_now",
]
