"""FastAPI service for the autonomous AI property claims prototype."""
from __future__ import annotations

import copy
import os
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware

from backend.models import AnalyzeRequest, ApprovalDecision, ApprovalRequest, HomeownerSubmission
from backend.pricing import compute_claim_estimate, recompute_adjusted_estimate, regional_multiplier
from backend.storage import ClaimsRepository

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
    output = copy.deepcopy(claim)
    output["id"] = output["claim_id"]
    output["agents"] = agent_records(output["stages"])
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
    return {
        "claim_id": claim_id,
        "status": "SUBMITTED",
        "created_at": now,
        "updated_at": now,
        "submission": intake,
        "evidence": evidence,
        "stages": stage_records(1, now),
        "vision": None,
        "estimate": None,
        "approval": {"status": "NOT_REVIEWED", "reviewed_at": None, "approved_at": None, "adjuster_name": None, "notes": None},
        "audit_history": [audit_event("CLAIM_SUBMITTED", now, "HOMEOWNER", {"peril": intake["peril"], "evidence_count": len(evidence)})],
    }


def input_assumptions(claim: dict[str, Any], request: AnalyzeRequest | None) -> tuple[str, float, float]:
    submission = claim["submission"]
    return (
        request.zip_code if request and request.zip_code is not None else submission["zip_code"],
        request.deductible if request and request.deductible is not None else submission["deductible"],
        request.material_age_years if request and request.material_age_years is not None else submission["material_age_years"],
    )


def create_app(data_file: str | Path | None = None, allowed_origins: list[str] | None = None) -> FastAPI:
    """Create the application. ``data_file`` exists to support isolated deployments/tests."""
    resolved_data_file = data_file or os.getenv("CLAIMS_DATA_FILE") or DEFAULT_DATA_FILE
    origins = allowed_origins or [origin.strip() for origin in os.getenv("CLAIMS_ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS).split(",") if origin.strip()]
    repository = ClaimsRepository(resolved_data_file)

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
    application.state.repository = repository
    application.state.data_file = str(Path(resolved_data_file).expanduser())

    @application.get("/health")
    def health() -> dict[str, Any]:
        return {"status": "ok", "service": "ai-property-claims-api", "timestamp": utc_now(), "claim_count": repository.count()}

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
        def analyze(claim: dict[str, Any]) -> dict[str, Any]:
            if claim["status"] == "APPROVED":
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An approved claim cannot be re-analyzed")
            now = utc_now()
            zip_code, deductible, material_age_years = input_assumptions(claim, request)
            vision = kitchen_water_vision_payload(claim_id, now)
            estimate = compute_claim_estimate(vision, zip_code=zip_code, deductible=deductible, material_age_years=material_age_years)
            # Put assumptions next to (not inside) the canonical source-algorithm result.
            claim["vision"] = vision
            claim["estimate"] = estimate
            claim["pricing_context"] = {
                "zip_code": zip_code,
                "regional_index": regional_multiplier(zip_code),
                "deductible": deductible,
                "material_age_years": material_age_years,
                "price_book": "prototype-2026-09",
            }
            claim["status"] = "IN_REVIEW"
            claim["updated_at"] = now
            claim["stages"] = stage_records(5, now)
            claim["approval"] = {"status": "NOT_REVIEWED", "reviewed_at": None, "approved_at": None, "adjuster_name": None, "notes": None}
            claim["audit_history"].append(audit_event("ANALYSIS_COMPLETED", now, "AI_PIPELINE", {"inspection_id": vision["inspection_id"], "line_item_count": len(estimate["line_items"]), "regional_index": regional_multiplier(zip_code)}))
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

    @application.post("/api/claims/{claim_id}/approve")
    def approve_claim(claim_id: str, request: ApprovalRequest) -> dict[str, Any]:
        def approve(claim: dict[str, Any]) -> dict[str, Any]:
            if claim["estimate"] is None or claim["vision"] is None:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Claim analysis must complete before review or approval")
            if claim["status"] == "APPROVED":
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Claim has already been approved")
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
            claim["estimate"] = revised_estimate
            is_approved = request.decision == ApprovalDecision.APPROVE
            claim["status"] = "APPROVED" if is_approved else "IN_REVIEW"
            claim["updated_at"] = now
            claim["approval"] = {
                "status": "APPROVED" if is_approved else "REVIEW_SAVED",
                "decision": request.decision.value,
                "reviewed_at": now,
                "approved_at": now if is_approved else None,
                "adjuster_name": request.adjuster_name or "Adjuster",
                "notes": request.notes,
                "settlement": {"currency": "USD", "net_payout": revised_estimate["net_payout"], "status": "APPROVED" if is_approved else "PENDING_APPROVAL"},
            }
            claim["audit_history"].append(audit_event("SETTLEMENT_APPROVED" if is_approved else "REVIEW_SAVED", now, request.adjuster_name or "ADJUSTER", {"decision": request.decision.value, "modified_zone_ids": sorted(requested_zone_ids), "net_payout": revised_estimate["net_payout"]}))
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
