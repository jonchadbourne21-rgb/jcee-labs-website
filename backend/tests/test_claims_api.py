from __future__ import annotations

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app import create_app, kitchen_water_vision_payload
from backend.pricing import compute_claim_estimate, regional_multiplier
from backend.storage import ClaimsRepository


@pytest.fixture
def client(tmp_path: Path) -> TestClient:
    app = create_app(
        tmp_path / "claims.json",
        allowed_origins=["http://localhost:3000"],
        vow_data_dir=tmp_path / "vow",
    )
    with TestClient(app) as test_client:
        yield test_client


def kitchen_payload() -> dict:
    return kitchen_water_vision_payload("CLM_TEST", "2026-09-12T17:48:00Z")


def submission_payload(**overrides: object) -> dict:
    payload: dict = {
        "incident_description": "Kitchen pipe burst overnight and water saturated the floor.",
        "property_address": "1847 Hawthorne Avenue, Dallas, TX",
        "zip_code": "75201",
        "deductible": 1000,
        "material_age_years": 4,
        "peril": "WATER",
        "homeowner_name": "Jordan Morgan",
        "policy_number": "APH-48392071",
        "evidence": [{"media_url": "https://example.test/kitchen.jpg", "media_type": "IMAGE"}],
    }
    payload.update(overrides)
    return payload


def submit_and_analyze(client: TestClient) -> tuple[str, dict]:
    submitted = client.post("/api/claims/submit", json=submission_payload())
    assert submitted.status_code == 201, submitted.json()
    claim_id = submitted.json()["claim_id"]
    analyzed = client.post(f"/api/claims/{claim_id}/analyze", json={})
    assert analyzed.status_code == 200, analyzed.json()
    return claim_id, analyzed.json()


def test_kitchen_water_damage_exact_reference_totals() -> None:
    estimate = compute_claim_estimate(kitchen_payload())
    assert estimate == {
        "line_items": [
            {
                "zone_id": "ZN_01_BASEBOARD", "room": "KITCHEN", "cat_sel": "FNC BASE4",
                "description": "Tear out & replace MDF baseboard - up to 4-1/4\"", "quantity": 28.0, "unit": "LF",
                "unit_price": 7.4, "rcv": 207.2, "depreciation": 24.86, "acv": 182.34, "is_covered": True,
            },
            {
                "zone_id": "ZN_02_DRYWALL", "room": "KITCHEN", "cat_sel": "DRY LF",
                "description": "Tear out wet drywall up to 2-ft flood cut, hang & tape", "quantity": 28.0, "unit": "LF",
                "unit_price": 15.66, "rcv": 438.48, "depreciation": 24.55, "acv": 413.93, "is_covered": True,
            },
            {
                "zone_id": "ZN_03_FLOORING", "room": "KITCHEN", "cat_sel": "FCW LAM",
                "description": "Tear out & replace engineered hardwood/laminate", "quantity": 110.0, "unit": "SF",
                "unit_price": 12.15, "rcv": 1336.5, "depreciation": 160.38, "acv": 1176.12, "is_covered": True,
            },
            {
                "zone_id": "ZN_04_DRYOUT_AIRMOVER", "room": "KITCHEN", "cat_sel": "WTR DRY",
                "description": "Centrifugal air mover setup & monitoring", "quantity": 3.0, "unit": "DA",
                "unit_price": 41.04, "rcv": 123.12, "depreciation": 0.0, "acv": 123.12, "is_covered": True,
            },
        ],
        "gross_rcv": 2105.3,
        "total_depreciation": 209.79,
        "net_acv": 1895.51,
        "deductible": 1000.0,
        "net_payout": 895.51,
    }


def test_regional_index_and_unmapped_pricing_code_behavior() -> None:
    assert regional_multiplier("75201") == 1.08
    assert regional_multiplier("98109") == 1.0

    payload = kitchen_payload()
    payload["rooms"][0]["damaged_zones"].append(
        {
            "zone_id": "ZN_UNKNOWN", "damage_age_classification": "SUDDEN_ACCIDENTAL",
            "measurements": {"affected_quantity": 9},
            "xactimate_candidate": {"cat_code": "NOPE", "sel_code": "NOPE", "action": "&"},
        }
    )
    estimate = compute_claim_estimate(payload, zip_code="98109")
    assert len(estimate["line_items"]) == 4
    assert all(item["zone_id"] != "ZN_UNKNOWN" for item in estimate["line_items"])
    assert estimate["line_items"][0]["unit_price"] == 6.85


def test_submit_analyze_get_save_review_and_approval_lifecycle(client: TestClient) -> None:
    submitted = client.post("/api/claims/submit", json=submission_payload())
    assert submitted.status_code == 201
    claim_id = submitted.json()["claim_id"]
    assert claim_id.startswith("CLM_")
    assert submitted.json()["status"] == "SUBMITTED"
    assert submitted.json()["stages"][0]["status"] == "COMPLETE"
    assert submitted.json()["created_at"].endswith("Z")

    analyzed = client.post(f"/api/claims/{claim_id}/analyze", json={})
    assert analyzed.status_code == 200
    dossier = analyzed.json()
    assert dossier["status"] == "IN_REVIEW"
    assert dossier["vision"]["claim_id"] == claim_id
    assert dossier["vision"]["loss_summary"]["primary_peril"] == "WATER_SUDDEN_ACCIDENTAL"
    assert set(dossier["vision"].keys()) == {"claim_id", "inspection_id", "timestamp", "telemetry_verification", "loss_summary", "rooms"}
    assert dossier["estimate"]["net_payout"] == 895.51
    assert dossier["pricing_context"] == {"zip_code": "75201", "regional_index": 1.08, "deductible": 1000.0, "material_age_years": 4.0, "price_book": "prototype-2026-09"}
    assert len(dossier["line_items"]) == 4
    assert all(stage["status"] == "COMPLETE" for stage in dossier["stages"])

    saved = client.post(
        f"/api/claims/{claim_id}/approve",
        json={"decision": "SAVE_REVIEW", "adjuster_name": "A. Adjuster", "notes": "Repriced baseboard.", "line_items": [{"zone_id": "ZN_01_BASEBOARD", "quantity": 30, "unit_price": 8}]},
    )
    assert saved.status_code == 200, saved.json()
    reviewed = saved.json()
    assert reviewed["status"] == "IN_REVIEW"
    assert reviewed["approval"]["status"] == "REVIEW_SAVED"
    # The server recalculates all totals from line amounts; client totals cannot influence them.
    assert reviewed["estimate"]["gross_rcv"] == 2138.1
    assert reviewed["estimate"]["total_depreciation"] == 213.73
    assert reviewed["estimate"]["net_acv"] == 1924.37
    assert reviewed["estimate"]["net_payout"] == 924.37

    approved = client.post(f"/api/claims/{claim_id}/approve", json={"decision": "APPROVE", "adjuster_name": "A. Adjuster"})
    assert approved.status_code == 200, approved.json()
    assert approved.json()["status"] == "APPROVED"
    assert approved.json()["approval"]["settlement"] == {"currency": "USD", "net_payout": 924.37, "status": "APPROVED"}
    assurance = approved.json()["assurance"]
    assert assurance["status"] == "VERIFIED"
    assert assurance["runtime"] == "VOW"
    assert assurance["version"] == "1.1.0"
    assert assurance["journal"]["chain_intact"] is True
    assert assurance["journal"]["event_count"] == 4
    assert assurance["effect"]["outcome"] == "ok"
    assert assurance["evidence"]["signature_verified"] is True
    assert assurance["files_verified"] >= 100
    assert [event["event"] for event in approved.json()["audit_history"]] == ["CLAIM_SUBMITTED", "ANALYSIS_COMPLETED", "REVIEW_SAVED", "SETTLEMENT_APPROVED"]
    assert approved.json()["audit_history"][-1]["details"]["vow_run_id"] == assurance["run_id"]

    evidence = client.get(f"/api/claims/{claim_id}/assurance/evidence")
    assert evidence.status_code == 200
    assert evidence.json()["format"] == "vow-evidence-pack/1"
    verified = client.get(f"/api/claims/{claim_id}/assurance/verify")
    assert verified.status_code == 200
    assert verified.json()["status"] == "VERIFIED"
    assert verified.json()["verification"]["checks"]["signature"]["ok"] is True
    assert verified.json()["verification"]["checks"]["journal_chains"]["ok"] is True

    fetched = client.get(f"/api/claims/{claim_id}")
    assert fetched.status_code == 200
    assert fetched.json()["estimate"] == approved.json()["estimate"]


def test_error_responses_and_nonnegative_adjustment_validation(client: TestClient) -> None:
    assert client.get("/api/claims/not-real").status_code == 404
    assert client.post("/api/claims/not-real/analyze", json={}).status_code == 404
    assert client.post("/api/claims/not-real/approve", json={}).status_code == 404

    malformed = client.post("/api/claims/submit", json={"incident_description": "x", "zip_code": "not-a-zip"})
    assert malformed.status_code == 422

    submitted = client.post("/api/claims/submit", json=submission_payload())
    claim_id = submitted.json()["claim_id"]
    pre_analysis = client.post(f"/api/claims/{claim_id}/approve", json={})
    assert pre_analysis.status_code == 409

    client.post(f"/api/claims/{claim_id}/analyze", json={})
    negative = client.post(f"/api/claims/{claim_id}/approve", json={"line_items": [{"zone_id": "ZN_01_BASEBOARD", "quantity": -1}]})
    assert negative.status_code == 422
    unknown = client.post(f"/api/claims/{claim_id}/approve", json={"line_items": [{"zone_id": "NO_SUCH_ZONE", "quantity": 1}]})
    assert unknown.status_code == 422


def test_persistence_atomic_document_and_reload(tmp_path: Path) -> None:
    data_file = tmp_path / "nested" / "claims.json"
    app_one = create_app(data_file)
    with TestClient(app_one) as first_client:
        created = first_client.post("/api/claims/submit", json=submission_payload())
        claim_id = created.json()["claim_id"]
        first_client.post(f"/api/claims/{claim_id}/analyze", json={})
    stored = json.loads(data_file.read_text(encoding="utf-8"))
    assert stored["version"] == 1
    assert claim_id in stored["claims"]
    assert not list(data_file.parent.glob("*.tmp"))

    app_two = create_app(data_file)
    with TestClient(app_two) as second_client:
        reloaded = second_client.get(f"/api/claims/{claim_id}")
    assert reloaded.status_code == 200
    assert reloaded.json()["estimate"]["net_payout"] == 895.51


def test_health_and_cors_preflight(client: TestClient) -> None:
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"
    assert health.json()["timestamp"].endswith("Z")
    assert health.json()["vow"]["status"] == "VERIFIED"
    assert health.json()["vow"]["version"] == "1.1.0"
    assert health.json()["vow"]["files_verified"] >= 100
    preflight = client.options("/api/claims/submit", headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"})
    assert preflight.status_code == 200
    assert preflight.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_repository_mutation_writes_complete_json(tmp_path: Path) -> None:
    repository = ClaimsRepository(tmp_path / "claims.json")
    repository.create({"claim_id": "CLM_UNIT", "number": 1})
    repository.mutate("CLM_UNIT", lambda claim: claim.update({"number": 2}))
    assert repository.get("CLM_UNIT") == {"claim_id": "CLM_UNIT", "number": 2}
    assert json.loads((tmp_path / "claims.json").read_text())["claims"]["CLM_UNIT"]["number"] == 2


def test_vow_policy_gate_fails_closed_before_zero_value_approval(client: TestClient) -> None:
    claim_id, dossier = submit_and_analyze(client)
    zeroed = [
        {"zone_id": item["zone_id"], "quantity": 0, "unit_price": item["unit_price"]}
        for item in dossier["estimate"]["line_items"]
    ]
    denied = client.post(
        f"/api/claims/{claim_id}/approve",
        json={"decision": "APPROVE", "adjuster_name": "A. Adjuster", "line_items": zeroed},
    )
    assert denied.status_code == 409
    assert "VOW settlement authorization failed" in denied.json()["detail"]
    fetched = client.get(f"/api/claims/{claim_id}").json()
    assert fetched["status"] == "IN_REVIEW"
    assert fetched["assurance"] is None
    assert client.get(f"/api/claims/{claim_id}/assurance/evidence").status_code == 409
