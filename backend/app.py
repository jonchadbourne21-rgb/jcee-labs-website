"""FastAPI service for the autonomous AI property claims prototype."""
from __future__ import annotations

import base64
import copy
import os
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Annotated, Any

from fastapi import FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from backend.auth import principal_from_request
from backend.config import Settings, get_settings
from backend.models import (
    AnalyzeRequest,
    ApprovalDecision,
    ApprovalRequest,
    AssignmentRequest,
    DemoResetRequest,
    EvidenceUploadRequest,
    HomeownerSubmission,
    NoteCreateRequest,
    PaymentAction,
    PaymentRequest,
    TaskCompletionRequest,
    TaskCreateRequest,
    WorkflowStatus,
    WorkflowStatusRequest,
)
from backend.object_storage import evidence_store
from backend.payments import PaymentInstruction, payment_operation_key, payment_provider
from backend.pricing import (
    compute_claim_estimate,
    recompute_adjusted_estimate,
    regional_multiplier,
)
from backend.product import (
    ASSIGNMENT_ROLES,
    CONTROLLED_STATUS_TRANSITIONS,
    NEXT_ACTION_BY_STATUS,
    dashboard_payload,
    enrich_claim_defaults,
    evidence_readiness,
    filter_claims,
    make_note_id,
    make_task_id,
    seed_demo_claim,
    team_member,
    team_workload,
)
from backend.repositories import claims_repository
from backend.security import SecurityMiddleware
from backend.tenant_context import current_actor_id, current_roles, current_tenant_id
from backend.vow_assurance import (
    VowAssuranceError,
    VowPolicyDenied,
    authorize_settlement,
    default_data_dir,
    evidence_pack_path,
    verify_evidence,
    verify_frozen_core,
)

DEFAULT_DATA_FILE = Path(__file__).with_name("claims_data.json")
DEFAULT_ALLOWED_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"

STAGE_DEFINITIONS = (
    ("ingestion", "Ingestion & Telemetry Verification"),
    ("vision", "Computer Vision Forensics & Material Segmentation"),
    ("coverage", "Policy Form & Endorsement Checks"),
    ("pricing", "Line-Item Unit Pricing & Depreciation"),
    ("dossier", "Adjuster Dossier Synthesis"),
)


def utc_now() -> str:
    """Return an RFC 3339 UTC timestamp with an explicit Z designator."""
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def stage_records(completed_count: int, timestamp: str | None = None) -> list[dict[str, Any]]:
    return [
        {
            "id": stage_id,
            "name": name,
            "status": "COMPLETE" if position < completed_count else "PENDING",
            "completed_at": timestamp if position < completed_count else None,
        }
        for position, (stage_id, name) in enumerate(STAGE_DEFINITIONS)
    ]


def agent_records(stages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """A compact UI-friendly representation of the same canonical stage state."""
    return [
        {
            "id": stage["id"],
            "name": stage["name"],
            "status": "complete" if stage["status"] == "COMPLETE" else "waiting",
            "completed_at": stage["completed_at"],
        }
        for stage in stages
    ]


def kitchen_water_vision_payload(claim_id: str, timestamp: str) -> dict[str, Any]:
    """Generate the reference CV payload shape exactly, substituting only IDs/time."""
    return {
        "claim_id": claim_id,
        "inspection_id": f"INS_{claim_id.removeprefix('CLM_')}",
        "timestamp": timestamp,
        "telemetry_verification": {
            "gps_match": True,
            "depth_sensor_available": True,
            "exif_tamper_flag": False,
            "calibration_factor_mm_per_px": 0.42,
        },
        "loss_summary": {
            "primary_peril": "WATER_SUDDEN_ACCIDENTAL",
            "total_affected_rooms": 1,
            "moisture_migration_detected": True,
        },
        "rooms": [
            {
                "room_id": "RM_01_KIT",
                "room_name": "KITCHEN",
                "dimensions": {
                    "length_ft": 14.0,
                    "width_ft": 12.0,
                    "ceiling_height_ft": 9.0,
                    "floor_area_sqft": 168.0,
                    "wall_perimeter_lf": 52.0,
                },
                "damaged_zones": [
                    {
                        "zone_id": "ZN_01_BASEBOARD",
                        "surface_type": "BASEBOARD",
                        "material_detected": "MDF Profile Baseboard 4-1/4\"",
                        "damage_class": "WATER_SATURATION",
                        "damage_age_classification": "SUDDEN_ACCIDENTAL",
                        "measurements": {"unit": "LF", "affected_quantity": 28.0, "recommended_cut_height_inches": 0},
                        "xactimate_candidate": {"cat_code": "FNC", "sel_code": "BASE4", "action": "&"},
                        "confidence_score": 0.96,
                    },
                    {
                        "zone_id": "ZN_02_DRYWALL",
                        "surface_type": "DRYWALL_LOWER",
                        "material_detected": "1/2\" Drywall - Taped and Floated",
                        "damage_class": "WATER_SATURATION",
                        "damage_age_classification": "SUDDEN_ACCIDENTAL",
                        "measurements": {"unit": "LF", "affected_quantity": 28.0, "recommended_cut_height_inches": 24},
                        "xactimate_candidate": {"cat_code": "DRY", "sel_code": "LF", "action": "&"},
                        "confidence_score": 0.94,
                    },
                    {
                        "zone_id": "ZN_03_FLOORING",
                        "surface_type": "FLOORING",
                        "material_detected": "Pre-finished Engineered Red Oak 5\"",
                        "damage_class": "BUCKLING_WARPING",
                        "damage_age_classification": "SUDDEN_ACCIDENTAL",
                        "measurements": {"unit": "SF", "affected_quantity": 110.0, "recommended_cut_height_inches": 0},
                        "xactimate_candidate": {"cat_code": "FCW", "sel_code": "LAM", "action": "&"},
                        "confidence_score": 0.91,
                    },
                    {
                        "zone_id": "ZN_04_DRYOUT_AIRMOVER",
                        "surface_type": "FLOORING",
                        "material_detected": "Open Cavity Air Circulation",
                        "damage_class": "WATER_SATURATION",
                        "damage_age_classification": "SUDDEN_ACCIDENTAL",
                        "measurements": {"unit": "DA", "affected_quantity": 3.0, "recommended_cut_height_inches": 0},
                        "xactimate_candidate": {"cat_code": "WTR", "sel_code": "DRY", "action": "+"},
                        "confidence_score": 0.98,
                    },
                ],
            }
        ],
    }


def audit_event(event: str, occurred_at: str, actor: str, details: dict[str, Any] | None = None) -> dict[str, Any]:
    return {"event": event, "occurred_at": occurred_at, "actor": actor, "details": details or {}}


def enrich_line_items(estimate: dict[str, Any]) -> list[dict[str, Any]]:
    """Add harmless UI aliases without changing canonical estimate calculations."""
    output: list[dict[str, Any]] = []
    for item in estimate["line_items"]:
        row = copy.deepcopy(item)
        row["id"] = item["zone_id"]
        row["category"] = item["cat_sel"].split(" ", 1)[0]
        row["trade"] = item["cat_sel"].split(" ", 1)[0]
        row["depreciation_percent"] = round((item["depreciation"] / item["rcv"] * 100), 2) if item["rcv"] else 0.0
        output.append(row)
    return output


def serialize_dossier(claim: dict[str, Any]) -> dict[str, Any]:
    """Return a defensive, frontend-ready representation of a persisted claim."""
    output = enrich_claim_defaults(claim)
    output["id"] = output["claim_id"]
    output["agents"] = agent_records(output.get("stages", []))
    vision = output.get("vision")
    output["telemetry"] = vision.get("telemetry_verification") if vision else None
    output["vision_data"] = vision
    output["line_items"] = enrich_line_items(output["estimate"]) if output.get("estimate") else []
    return output


def build_submission_claim(claim_id: str, submission: HomeownerSubmission) -> dict[str, Any]:
    now = utc_now()
    intake = submission.model_dump(mode="json")
    evidence = [
        {
            "media_url": item["media_url"],
            "media_type": item["media_type"],
            "captured_at": item.get("captured_at") or now,
            "file_name": item.get("file_name") or item["media_url"].rsplit("/", 1)[-1],
            "label": item.get("label"),
        }
        for item in intake["evidence"]
    ]
    return enrich_claim_defaults({
        "claim_id": claim_id,
        "status": "SUBMITTED",
        "created_at": now,
        "updated_at": now,
        "submission": intake,
        "evidence": evidence,
        "stages": stage_records(1, now),
        "vision": None,
        "estimate": None,
        "assurance": None,
        "approval": {"status": "NOT_REVIEWED", "reviewed_at": None, "approved_at": None, "adjuster_name": None, "notes": None},
        "audit_history": [audit_event("CLAIM_SUBMITTED", now, "HOMEOWNER", {"peril": intake["peril"], "evidence_count": len(evidence)})],
    })


def input_assumptions(claim: dict[str, Any], request: AnalyzeRequest | None) -> tuple[str, float, float]:
    submission = claim["submission"]
    return (
        request.zip_code if request and request.zip_code is not None else submission["zip_code"],
        request.deductible if request and request.deductible is not None else submission["deductible"],
        request.material_age_years if request and request.material_age_years is not None else submission["material_age_years"],
    )


def create_app(
    data_file: str | Path | None = None,
    allowed_origins: list[str] | None = None,
    vow_data_dir: str | Path | None = None,
    settings: Settings | None = None,
) -> FastAPI:
    """Create the application. ``data_file`` exists to support isolated deployments/tests."""
    resolved_settings = settings or get_settings()
    # Explicitly supplied Settings must pass the same fail-closed validation as env-backed settings.
    resolved_settings.validate()
    resolved_data_file = data_file or os.getenv("CLAIMS_DATA_FILE") or DEFAULT_DATA_FILE
    resolved_vow_data_dir = Path(vow_data_dir).expanduser().resolve() if vow_data_dir else default_data_dir()
    origins = allowed_origins or [origin.strip() for origin in os.getenv("CLAIMS_ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS).split(",") if origin.strip()]
    repository = claims_repository(resolved_settings, resolved_data_file)
    provider = payment_provider(resolved_settings)
    evidence_repository = evidence_store(
        resolved_settings,
        Path(os.getenv("CLAIMS_EVIDENCE_DIR", str(Path(__file__).with_name(".data") / "evidence"))),
    )
    vow_integrity = verify_frozen_core()

    application = FastAPI(
        title="AI Property Claims API",
        version="0.1.0",
        description="Deterministic prototype for AI-assisted property claim intake, scoping, pricing, review, and settlement.",
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )
    application.add_middleware(
        SecurityMiddleware,
        settings=resolved_settings,
        principal_resolver=lambda request: principal_from_request(request, resolved_settings),
    )
    application.state.repository = repository
    application.state.data_file = str(Path(resolved_data_file).expanduser())
    application.state.vow_data_dir = str(resolved_vow_data_dir)
    application.state.vow_integrity = vow_integrity
    application.state.settings = resolved_settings
    application.state.payment_provider = provider
    application.state.evidence_store = evidence_repository

    def prepare_mutation(claim: dict[str, Any]) -> None:
        """Persist defaults before operating on a legacy dossier in place."""
        claim.update(enrich_claim_defaults(claim))

    def validate_team_member(user_id: str, expected_role: str | None = None) -> None:
        """Validate an assignment/owner target without treating it as the caller identity."""
        user = team_member(user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=f"Unknown demo user: {user_id}")
        if expected_role is not None and user.role != expected_role:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"User {user_id} is not a {expected_role}",
            )

    def require_authenticated_actor(actor_id: str | None = None) -> str:
        """Return the verified actor and reject client-side impersonation outside demo mode."""
        if resolved_settings.auth_mode == "demo":
            if actor_id is not None:
                validate_team_member(actor_id)
                return actor_id
            return current_actor_id()
        actor = current_actor_id()
        if actor_id is not None and actor_id != actor:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Actor must match authenticated principal")
        return actor

    def require_roles(*allowed_roles: str) -> None:
        """Authorize from server-verified principal roles; demo mode keeps its role-switcher behavior."""
        if resolved_settings.auth_mode == "demo":
            return
        principal_roles = set(current_roles())
        if "PROGRAM_ADMIN" in principal_roles:
            principal_roles.add("PROGRAM_ADMINISTRATOR")
        if "ADMIN" in principal_roles or any(role in principal_roles for role in allowed_roles):
            return
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role for this operation")

    def authenticated_author_role(author_id: str) -> str:
        if resolved_settings.auth_mode == "demo":
            author = team_member(author_id)
            return author.role if author else "EXTERNAL"
        principal_roles = set(current_roles())
        if "PROGRAM_ADMIN" in principal_roles:
            principal_roles.add("PROGRAM_ADMINISTRATOR")
        operational = (
            "PROGRAM_ADMINISTRATOR",
            "SUPERVISOR",
            "FINANCE",
            "DESK_ADJUSTER",
            "FIELD_ADJUSTER",
        )
        return next((role for role in operational if role in principal_roles), "AUTHENTICATED")

    def update_claim_metadata(claim: dict[str, Any], now: str) -> None:
        claim["updated_at"] = now
        claim["next_action"] = NEXT_ACTION_BY_STATUS.get(claim["status"], "Review claim")
        # Re-enrichment refreshes readiness from canonical evidence/analysis data
        # and makes the product fields safe before the repository writes.
        claim["evidence_readiness"] = evidence_readiness(claim)

    def append_event(claim: dict[str, Any], event: str, now: str, actor: str, details: dict[str, Any]) -> None:
        claim["audit_history"].append(audit_event(event, now, actor, details))

    @application.get("/health")
    def health() -> dict[str, Any]:
        return {
            "status": "ok",
            "service": "ai-property-claims-api",
            "timestamp": utc_now(),
            "claim_count": repository.count(),
            "configuration": resolved_settings.redacted(),
            "vow": {
                "status": vow_integrity["status"],
                "version": vow_integrity["version"],
                "files_verified": vow_integrity["files_verified"],
                "manifest_sha256": vow_integrity["manifest_sha256"],
            },
        }

    @application.get("/api/dashboard")
    def get_dashboard() -> dict[str, Any]:
        return dashboard_payload(repository.list())

    @application.get("/api/team")
    def get_team() -> dict[str, Any]:
        return {"team": team_workload(repository.list())}

    @application.get("/api/claims")
    def list_claims(
        status_filter: Annotated[WorkflowStatus | None, Query(alias="status")] = None,
        assignee: Annotated[str | None, Query(min_length=1, max_length=64)] = None,
        search: Annotated[str | None, Query(max_length=500)] = None,
        limit: Annotated[int, Query(ge=1, le=100)] = 25,
        offset: Annotated[int, Query(ge=0)] = 0,
    ) -> dict[str, Any]:
        filtered = filter_claims(
            repository.list(),
            status=status_filter.value if status_filter else None,
            assignee=assignee,
            search=search,
        )
        page = [serialize_dossier(claim) for claim in filtered[offset : offset + limit]]
        return {"items": page, "total": len(filtered), "limit": limit, "offset": offset}

    @application.post("/api/demo/reset")
    def reset_demo(_request: DemoResetRequest) -> dict[str, Any]:
        if resolved_settings.auth_mode != "demo":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Demo reset is unavailable outside demo mode")
        claim = seed_demo_claim(repository, kitchen_water_vision_payload)
        return serialize_dossier(claim)

    @application.post("/api/claims/submit", status_code=status.HTTP_201_CREATED)
    def submit_claim(submission: HomeownerSubmission) -> dict[str, Any]:
        # UUID4 makes collision practically impossible; retain a deterministic retry for correctness.
        for _ in range(3):
            claim_id = f"CLM_{uuid.uuid4().hex.upper()}"
            try:
                claim = repository.create(build_submission_claim(claim_id, submission))
                return serialize_dossier(claim)
            except KeyError:
                continue
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Unable to allocate a unique claim ID")

    @application.post("/api/claims/{claim_id}/analyze")
    def analyze_claim(claim_id: str, request: AnalyzeRequest | None = None) -> dict[str, Any]:
        require_roles("DESK_ADJUSTER", "SUPERVISOR", "PROGRAM_ADMINISTRATOR")

        def analyze(claim: dict[str, Any]) -> dict[str, Any]:
            prepare_mutation(claim)
            if claim["status"] in {
                WorkflowStatus.APPROVED.value,
                WorkflowStatus.PAYMENT_SCHEDULED.value,
                WorkflowStatus.PAID.value,
                WorkflowStatus.CLOSED.value,
            }:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A financially progressed claim cannot be re-analyzed")
            now = utc_now()
            zip_code, deductible, material_age_years = input_assumptions(claim, request)
            vision = kitchen_water_vision_payload(claim_id, now)
            estimate = compute_claim_estimate(vision, zip_code=zip_code, deductible=deductible, material_age_years=material_age_years)
            # Put assumptions next to (not inside) the canonical source-algorithm result.
            claim["vision"] = vision
            claim["estimate"] = estimate
            claim["assurance"] = None
            claim["pricing_context"] = {
                "zip_code": zip_code,
                "regional_index": regional_multiplier(zip_code),
                "deductible": deductible,
                "material_age_years": material_age_years,
                "price_book": "prototype-2026-09",
            }
            claim["status"] = "IN_REVIEW"
            claim["stages"] = stage_records(5, now)
            claim["approval"] = {"status": "NOT_REVIEWED", "reviewed_at": None, "approved_at": None, "adjuster_name": None, "notes": None}
            update_claim_metadata(claim, now)
            append_event(claim, "ANALYSIS_COMPLETED", now, "AI_PIPELINE", {"inspection_id": vision["inspection_id"], "line_item_count": len(estimate["line_items"]), "regional_index": regional_multiplier(zip_code)})
            return serialize_dossier(claim)

        outcome = repository.mutate(claim_id, analyze)
        if outcome is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        return outcome

    @application.get("/api/claims/{claim_id}")
    def get_claim(claim_id: str) -> dict[str, Any]:
        claim = repository.get(claim_id)
        if claim is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        return serialize_dossier(claim)

    @application.post("/api/claims/{claim_id}/assign")
    def assign_claim(claim_id: str, request: AssignmentRequest) -> dict[str, Any]:
        require_roles("PROGRAM_ADMINISTRATOR")
        actor_id = require_authenticated_actor()

        def assign(claim: dict[str, Any]) -> dict[str, Any]:
            prepare_mutation(claim)
            changes: dict[str, str | None] = {}
            for field_name, required_role in ASSIGNMENT_ROLES.items():
                user_id = getattr(request, field_name)
                if user_id is not None:
                    validate_team_member(user_id, required_role)
                    claim["assignments"][field_name] = user_id
                    changes[field_name] = user_id
            now = utc_now()
            update_claim_metadata(claim, now)
            append_event(claim, "CLAIM_ASSIGNED", now, actor_id, {"assignments": changes})
            return serialize_dossier(claim)

        outcome = repository.mutate(claim_id, assign)
        if outcome is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        return outcome

    @application.post("/api/claims/{claim_id}/tasks")
    def create_task(claim_id: str, request: TaskCreateRequest) -> dict[str, Any]:
        require_roles("FIELD_ADJUSTER", "DESK_ADJUSTER", "SUPERVISOR", "PROGRAM_ADMINISTRATOR")
        actor_id = require_authenticated_actor()

        def add_task(claim: dict[str, Any]) -> dict[str, Any]:
            prepare_mutation(claim)
            validate_team_member(request.owner_id)
            now = utc_now()
            task = {
                "task_id": make_task_id(),
                "title": request.title,
                "owner_id": request.owner_id,
                "priority": request.priority.value,
                "due_at": request.due_at.isoformat().replace("+00:00", "Z") if request.due_at else None,
                "status": "OPEN",
                "created_at": now,
                "completed_at": None,
                "completed_by": None,
            }
            claim["tasks"].append(task)
            update_claim_metadata(claim, now)
            append_event(claim, "TASK_CREATED", now, actor_id, {"task_id": task["task_id"], "priority": task["priority"]})
            return serialize_dossier(claim)

        outcome = repository.mutate(claim_id, add_task)
        if outcome is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        return outcome

    @application.post("/api/claims/{claim_id}/tasks/{task_id}/complete")
    def complete_task(claim_id: str, task_id: str, request: TaskCompletionRequest) -> dict[str, Any]:
        require_roles("FIELD_ADJUSTER", "DESK_ADJUSTER", "SUPERVISOR", "PROGRAM_ADMINISTRATOR")
        actor_id = require_authenticated_actor(request.actor_id)

        def complete(claim: dict[str, Any]) -> dict[str, Any]:
            prepare_mutation(claim)
            task = next((item for item in claim["tasks"] if item.get("task_id") == task_id), None)
            if task is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
            if task.get("status") == "COMPLETED":
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Task has already been completed")
            now = utc_now()
            task["status"] = "COMPLETED"
            task["completed_at"] = now
            task["completed_by"] = actor_id
            update_claim_metadata(claim, now)
            append_event(claim, "TASK_COMPLETED", now, actor_id, {"task_id": task_id})
            return serialize_dossier(claim)

        outcome = repository.mutate(claim_id, complete)
        if outcome is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        return outcome

    @application.post("/api/claims/{claim_id}/notes")
    def create_note(claim_id: str, request: NoteCreateRequest) -> dict[str, Any]:
        require_roles("FIELD_ADJUSTER", "DESK_ADJUSTER", "SUPERVISOR", "PROGRAM_ADMINISTRATOR")
        author_id = require_authenticated_actor(request.author_id)

        def add_note(claim: dict[str, Any]) -> dict[str, Any]:
            prepare_mutation(claim)
            now = utc_now()
            note = {
                "note_id": make_note_id(),
                "author_id": author_id,
                "author_role": authenticated_author_role(author_id),
                "body": request.body,
                "visibility": request.visibility.value,
                "created_at": now,
            }
            claim["notes"].append(note)
            update_claim_metadata(claim, now)
            append_event(claim, "NOTE_ADDED", now, author_id, {"note_id": note["note_id"], "visibility": note["visibility"]})
            return serialize_dossier(claim)

        outcome = repository.mutate(claim_id, add_note)
        if outcome is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        return outcome

    @application.post("/api/claims/{claim_id}/status")
    def update_status(claim_id: str, request: WorkflowStatusRequest) -> dict[str, Any]:
        require_roles("DESK_ADJUSTER", "SUPERVISOR", "PROGRAM_ADMINISTRATOR", "FINANCE")
        actor_id = require_authenticated_actor(request.actor_id)

        def transition(claim: dict[str, Any]) -> dict[str, Any]:
            prepare_mutation(claim)
            current_status = claim["status"]
            target_status = request.status.value
            permitted = CONTROLLED_STATUS_TRANSITIONS.get(current_status, frozenset())
            if target_status not in permitted:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Controlled status transition {current_status} -> {target_status} is not allowed",
                )
            now = utc_now()
            claim["status"] = target_status
            update_claim_metadata(claim, now)
            append_event(claim, "STATUS_CHANGED", now, actor_id, {"from": current_status, "to": target_status})
            return serialize_dossier(claim)

        outcome = repository.mutate(claim_id, transition)
        if outcome is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        return outcome

    @application.post("/api/claims/{claim_id}/payment")
    def record_payment(claim_id: str, request: PaymentRequest) -> dict[str, Any]:
        require_roles("FINANCE")
        actor_id = require_authenticated_actor(request.actor_id)
        if resolved_settings.auth_mode == "demo":
            validate_team_member(actor_id, "FINANCE")

        def payment(claim: dict[str, Any]) -> dict[str, Any]:
            prepare_mutation(claim)
            now = utc_now()
            if request.action == PaymentAction.SCHEDULE:
                if resolved_settings.payment_provider != "mock":
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail=(
                            "Non-mock payment scheduling is disabled until a supported "
                            "disbursement and reconciliation boundary is implemented"
                        ),
                    )
                if claim["status"] != WorkflowStatus.APPROVED.value:
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Payment scheduling requires an APPROVED claim")
                estimate = claim.get("estimate")
                if not isinstance(estimate, dict):
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An approved estimate is required for payment scheduling")
                settlement_slot = str(claim.get("settlement_slot") or "v1")
                operation_key = payment_operation_key(
                    current_tenant_id(),
                    claim_id,
                    settlement_slot,
                )
                payment_instruction = provider.schedule(
                    claim_id=claim_id,
                    amount=float(estimate["net_payout"]),
                    currency="USD",
                    method=request.method.value,
                    idempotency_key=operation_key,
                )
                instruction = {
                    "status": "SCHEDULED",
                    "instruction_id": payment_instruction.provider_id,
                    "method": request.method.value,
                    "amount": payment_instruction.amount,
                    "currency": payment_instruction.currency,
                    "scheduled_at": now,
                    "sent_at": None,
                    "actor_id": actor_id,
                    "mock": payment_instruction.mock,
                }
                claim["payment"] = instruction
                claim["payment_provider"] = payment_instruction.provider
                claim["payment_idempotency_key"] = payment_instruction.idempotency_key
                claim["status"] = WorkflowStatus.PAYMENT_SCHEDULED.value
                update_claim_metadata(claim, now)
                append_event(claim, "PAYMENT_SCHEDULED", now, actor_id, {"instruction_id": instruction["instruction_id"], "method": instruction["method"], "amount": instruction["amount"], "provider": payment_instruction.provider, "mock": instruction["mock"]})
            else:
                if claim["status"] != WorkflowStatus.PAYMENT_SCHEDULED.value or claim["payment"].get("status") != "SCHEDULED":
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Payment must be scheduled before it can be marked sent")
                if resolved_settings.payment_provider != "mock" or not bool(claim["payment"].get("mock", True)):
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Manual mark-sent is available only for mock payments",
                    )
                provider_instruction = PaymentInstruction(
                    provider=str(claim.get("payment_provider", "mock")),
                    provider_id=str(claim["payment"].get("instruction_id")),
                    idempotency_key=str(
                        claim.get("payment_idempotency_key")
                        or payment_operation_key(
                            current_tenant_id(),
                            claim_id,
                            str(claim.get("settlement_slot") or "v1"),
                        )
                    ),
                    amount=float(claim["payment"].get("amount", 0)),
                    currency=str(claim["payment"].get("currency", "USD")),
                    status="SCHEDULED",
                    mock=bool(claim["payment"].get("mock", True)),
                )
                completed_instruction = provider.mark_sent(instruction=provider_instruction)
                if completed_instruction.status != "SENT" or not completed_instruction.mock:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Payment provider did not confirm mock completion",
                    )
                claim["payment"]["status"] = "SENT"
                claim["payment"]["sent_at"] = now
                claim["payment"]["actor_id"] = actor_id
                claim["status"] = WorkflowStatus.PAID.value
                update_claim_metadata(claim, now)
                append_event(claim, "PAYMENT_MARKED_SENT", now, actor_id, {"instruction_id": claim["payment"].get("instruction_id"), "provider": claim.get("payment_provider", "mock"), "mock": claim["payment"].get("mock", True)})
            return serialize_dossier(claim)

        outcome = repository.mutate(claim_id, payment)
        if outcome is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        return outcome

    @application.post("/api/claims/{claim_id}/evidence", status_code=status.HTTP_201_CREATED)
    def upload_evidence(claim_id: str, request: EvidenceUploadRequest) -> dict[str, Any]:
        require_roles("FIELD_ADJUSTER", "DESK_ADJUSTER", "SUPERVISOR", "PROGRAM_ADMINISTRATOR")
        actor_id = require_authenticated_actor()
        claim = repository.get(claim_id)
        if claim is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        try:
            stored = evidence_repository.put(
                tenant_id=str(claim.get("tenant_id", "TENANT_DEMO")),
                claim_id=claim_id,
                filename=request.filename,
                content=base64.b64decode(request.content_base64, validate=True),
                media_type=request.media_type,
            )
        except (ValueError, PermissionError) as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)) from exc

        def append_evidence(current: dict[str, Any]) -> dict[str, Any]:
            now = utc_now()
            current.setdefault("evidence", []).append({
                "media_url": stored.object_key,
                "media_type": stored.media_type,
                "file_name": request.filename,
                "content_sha256": stored.content_sha256,
                "byte_size": stored.byte_size,
                "captured_at": now,
            })
            update_claim_metadata(current, now)
            append_event(current, "EVIDENCE_UPLOADED", now, actor_id, {"object_key": stored.object_key, "byte_size": stored.byte_size, "content_sha256": stored.content_sha256})
            return serialize_dossier(current)

        outcome = repository.mutate(claim_id, append_evidence)
        if outcome is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        return outcome

    @application.get("/api/claims/{claim_id}/assurance/evidence")
    def download_assurance_evidence(claim_id: str) -> FileResponse:
        require_roles("DESK_ADJUSTER", "SUPERVISOR", "PROGRAM_ADMINISTRATOR", "FINANCE")
        claim = repository.get(claim_id)
        if claim is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        assurance = claim.get("assurance")
        if not assurance:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Claim has no VOW assurance evidence")
        try:
            pack_path = evidence_pack_path(assurance, data_dir=resolved_vow_data_dir)
        except VowAssuranceError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
        if not pack_path.is_file():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="VOW assurance evidence pack is missing")
        return FileResponse(pack_path, media_type="application/json", filename=f"{claim_id}-vow-evidence.json")

    @application.get("/api/claims/{claim_id}/assurance/verify")
    def verify_assurance_evidence(claim_id: str) -> dict[str, Any]:
        require_roles("DESK_ADJUSTER", "SUPERVISOR", "PROGRAM_ADMINISTRATOR", "FINANCE")
        claim = repository.get(claim_id)
        if claim is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        assurance = claim.get("assurance")
        if not assurance:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Claim has no VOW assurance evidence")
        try:
            result = verify_evidence(assurance, data_dir=resolved_vow_data_dir)
        except VowAssuranceError as exc:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
        return {"claim_id": claim_id, "status": "VERIFIED" if result.get("ok") else "FAILED", "verification": result}

    @application.post("/api/claims/{claim_id}/approve")
    def approve_claim(claim_id: str, request: ApprovalRequest) -> dict[str, Any]:
        if request.decision == ApprovalDecision.APPROVE:
            require_roles("SUPERVISOR", "PROGRAM_ADMINISTRATOR")
        else:
            require_roles("DESK_ADJUSTER", "SUPERVISOR", "PROGRAM_ADMINISTRATOR")
        actor_id = require_authenticated_actor()

        def approve(claim: dict[str, Any]) -> dict[str, Any]:
            prepare_mutation(claim)
            if claim["estimate"] is None or claim["vision"] is None:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Claim analysis must complete before review or approval")
            if claim["status"] != WorkflowStatus.IN_REVIEW.value:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only an IN_REVIEW claim can be approved")
            allowed_zone_ids = {item["zone_id"] for item in claim["estimate"]["line_items"]}
            requested_zone_ids = {line.zone_id for line in request.line_items}
            unknown_zone_ids = sorted(requested_zone_ids - allowed_zone_ids)
            if unknown_zone_ids:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=f"Unknown line-item zone_id(s): {', '.join(unknown_zone_ids)}")

            now = utc_now()
            # Coverage is set only by the CV age classification in the canonical algorithm.
            adjustments = []
            for line in request.line_items:
                adjustment = line.model_dump(exclude_none=True)
                adjustment.pop("is_covered", None)
                adjustment.pop("depreciation", None)
                adjustment.pop("acv", None)
                adjustments.append(adjustment)
            pricing_context = claim["pricing_context"]
            revised_estimate = recompute_adjusted_estimate(
                claim["estimate"], claim["vision"], pricing_context["material_age_years"], pricing_context["deductible"], adjustments
            )
            is_approved = request.decision == ApprovalDecision.APPROVE
            adjuster_name = (request.adjuster_name or "Adjuster") if resolved_settings.auth_mode == "demo" else actor_id
            if is_approved:
                try:
                    assurance = authorize_settlement(
                        tenant_id=current_tenant_id(),
                        claim_id=claim_id,
                        estimate=revised_estimate,
                        adjuster_name=adjuster_name,
                        notes=request.notes,
                        data_dir=resolved_vow_data_dir,
                        settlement_slot=str(claim.get("settlement_slot") or "v1"),
                    )
                except VowPolicyDenied as exc:
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
                except VowAssuranceError as exc:
                    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
            else:
                assurance = claim.get("assurance")
            claim["estimate"] = revised_estimate
            claim["assurance"] = assurance
            claim["status"] = "APPROVED" if is_approved else "IN_REVIEW"
            claim["approval"] = {
                "status": "APPROVED" if is_approved else "REVIEW_SAVED",
                "decision": request.decision.value,
                "reviewed_at": now,
                "approved_at": now if is_approved else None,
                "adjuster_name": adjuster_name,
                "notes": request.notes,
                "settlement": {"currency": "USD", "net_payout": revised_estimate["net_payout"], "status": "APPROVED" if is_approved else "PENDING_APPROVAL"},
            }
            update_claim_metadata(claim, now)
            append_event(
                claim,
                "SETTLEMENT_APPROVED" if is_approved else "REVIEW_SAVED",
                now,
                adjuster_name if resolved_settings.auth_mode == "demo" else actor_id,
                {
                    "decision": request.decision.value,
                    "modified_zone_ids": sorted(requested_zone_ids),
                    "net_payout": revised_estimate["net_payout"],
                    "vow_run_id": assurance.get("run_id") if assurance else None,
                    "vow_authorization_sha256": assurance.get("authorization_sha256") if assurance else None,
                },
            )
            return serialize_dossier(claim)

        outcome = repository.mutate(claim_id, approve)
        if outcome is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        return outcome

    @application.options("/{path:path}", include_in_schema=False)
    def options_handler(path: str) -> Response:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return application


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=False)
