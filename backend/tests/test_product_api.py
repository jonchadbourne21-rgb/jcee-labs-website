from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app import create_app
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


def submission_payload(name: str = "Queue Search Insured") -> dict[str, object]:
    return {
        "incident_description": "Kitchen pipe burst overnight and water saturated the floor.",
        "property_address": "1847 Hawthorne Avenue, Dallas, TX 75201",
        "zip_code": "75201",
        "deductible": 1000,
        "material_age_years": 4,
        "peril": "WATER",
        "homeowner_name": name,
        "policy_number": "Q-UNIQUE-123",
        "evidence": [{"media_url": "https://example.test/kitchen.jpg", "media_type": "IMAGE"}],
    }


def reset_demo(client: TestClient) -> dict[str, object]:
    response = client.post("/api/demo/reset", json={})
    assert response.status_code == 200, response.json()
    return response.json()


def approve_demo(client: TestClient) -> dict[str, object]:
    response = client.post(
        "/api/claims/CLM_DEMO_KITCHEN/approve",
        json={"decision": "APPROVE", "adjuster_name": "Riley Thompson"},
    )
    assert response.status_code == 200, response.json()
    return response.json()


def test_repository_list_is_newest_first_and_defensive(tmp_path: Path) -> None:
    repository = ClaimsRepository(tmp_path / "claims.json")
    repository.create({"claim_id": "CLM_OLD", "created_at": "2026-09-10T00:00:00Z"})
    repository.create({"claim_id": "CLM_NEW", "updated_at": "2026-09-11T00:00:00Z"})

    listed = repository.list()
    assert [claim["claim_id"] for claim in listed] == ["CLM_NEW", "CLM_OLD"]
    listed[0]["claim_id"] = "MUTATED"
    assert repository.get("CLM_NEW")["claim_id"] == "CLM_NEW"


def test_legacy_dossier_serializes_with_product_defaults(client: TestClient) -> None:
    client.app.state.repository.create(
        {
            "claim_id": "CLM_LEGACY",
            "created_at": "2026-09-01T00:00:00Z",
            "status": "SUBMITTED",
            "submission": {"homeowner_name": "Legacy Insured", "property_address": "1 Legacy Way", "policy_number": "LEG-1"},
        }
    )

    response = client.get("/api/claims/CLM_LEGACY")
    assert response.status_code == 200
    dossier = response.json()
    assert dossier["assignments"] == {"field_adjuster_id": None, "desk_adjuster_id": None}
    assert dossier["tasks"] == []
    assert dossier["notes"] == []
    assert dossier["severity"] == "MEDIUM"
    assert dossier["sla_target"] == "2026-09-01T00:00:00Z"
    assert dossier["next_action"] == "Analyze submitted evidence"
    assert dossier["payment"]["status"] == "NOT_SCHEDULED"
    assert dossier["evidence_readiness"]["is_ready"] is False


def test_demo_reset_is_preanalyzed_idempotent_and_replaces_demo_state(client: TestClient) -> None:
    first = reset_demo(client)
    assert first["claim_id"] == "CLM_DEMO_KITCHEN"
    assert first["status"] == "IN_REVIEW"
    assert first["estimate"]["gross_rcv"] == 2105.30
    assert first["estimate"]["net_payout"] == 895.51
    assert first["assignments"] == {"field_adjuster_id": "USR_FIELD_01", "desk_adjuster_id": "USR_DESK_01"}
    assert len(first["tasks"]) == 2
    assert len(first["notes"]) == 2
    assert first["evidence_readiness"]["status"] == "READY"

    note = client.post(
        "/api/claims/CLM_DEMO_KITCHEN/notes",
        json={"author_id": "USR_DESK_01", "body": "This state must be replaced."},
    )
    assert note.status_code == 200
    second = reset_demo(client)
    assert second["estimate"] == first["estimate"]
    assert len(second["notes"]) == 2
    assert second["payment"]["status"] == "NOT_SCHEDULED"
    assert client.get("/api/claims?search=Jordan%20Morgan").json()["total"] == 1


def test_dashboard_team_queue_filters_search_and_pagination(client: TestClient) -> None:
    reset_demo(client)
    first = client.post("/api/claims/submit", json=submission_payload("Distinct Alpha Insured"))
    second = client.post("/api/claims/submit", json=submission_payload("Distinct Beta Insured"))
    assert first.status_code == 201
    assert second.status_code == 201

    dashboard = client.get("/api/dashboard")
    assert dashboard.status_code == 200
    payload = dashboard.json()
    assert payload["metrics"]["total_claims"] == 3
    assert payload["metrics"]["open_claims"] == 3
    assert payload["metrics"]["evidence_ready_claims"] == 1
    assert payload["status_distribution"]["IN_REVIEW"] == 1
    assert payload["status_distribution"]["SUBMITTED"] == 2
    assert payload["recent_activity"]
    assert any(item["user_id"] == "USR_FIELD_01" and item["assigned_claims"] == 1 for item in payload["team_workload"])

    team = client.get("/api/team")
    assert team.status_code == 200
    assert {member["user_id"] for member in team.json()["team"]} >= {"USR_FIELD_01", "USR_DESK_01", "USR_FINANCE_01"}

    searched = client.get("/api/claims?search=distinct%20beta")
    assert searched.status_code == 200
    assert searched.json()["total"] == 1
    assert searched.json()["items"][0]["submission"]["homeowner_name"] == "Distinct Beta Insured"

    submitted = client.get("/api/claims?status=SUBMITTED&limit=1&offset=1")
    assert submitted.status_code == 200
    assert submitted.json()["total"] == 2
    assert len(submitted.json()["items"]) == 1
    assigned = client.get("/api/claims?assignee=USR_FIELD_01")
    assert assigned.json()["total"] == 1
    assert assigned.json()["items"][0]["claim_id"] == "CLM_DEMO_KITCHEN"
    assert client.get("/api/claims?status=NOT_A_STATUS").status_code == 422
    assert client.get("/api/claims?limit=101").status_code == 422


def test_assignment_task_completion_and_note_append_audit_events(client: TestClient) -> None:
    reset_demo(client)
    assigned = client.post(
        "/api/claims/CLM_DEMO_KITCHEN/assign",
        json={"field_adjuster_id": "USR_FIELD_01", "desk_adjuster_id": "USR_DESK_01"},
    )
    assert assigned.status_code == 200

    created = client.post(
        "/api/claims/CLM_DEMO_KITCHEN/tasks",
        json={
            "title": "Confirm dry standard",
            "owner_id": "USR_FIELD_01",
            "priority": "HIGH",
            "due_at": "2026-09-13T09:00:00Z",
        },
    )
    assert created.status_code == 200, created.json()
    task = created.json()["tasks"][-1]
    assert task["status"] == "OPEN"
    assert task["priority"] == "HIGH"

    completed = client.post(
        f"/api/claims/CLM_DEMO_KITCHEN/tasks/{task['task_id']}/complete",
        json={"actor_id": "USR_FIELD_01"},
    )
    assert completed.status_code == 200
    done = next(item for item in completed.json()["tasks"] if item["task_id"] == task["task_id"])
    assert done["status"] == "COMPLETED"
    assert done["completed_by"] == "USR_FIELD_01"
    assert client.post(
        f"/api/claims/CLM_DEMO_KITCHEN/tasks/{task['task_id']}/complete",
        json={"actor_id": "USR_FIELD_01"},
    ).status_code == 409

    noted = client.post(
        "/api/claims/CLM_DEMO_KITCHEN/notes",
        json={"author_id": "USR_DESK_01", "body": "Desk review queued for supervisor.", "visibility": "INTERNAL"},
    )
    assert noted.status_code == 200
    newest_note = noted.json()["notes"][-1]
    assert newest_note["author_role"] == "DESK_ADJUSTER"
    events = [event["event"] for event in noted.json()["audit_history"]]
    assert events[-4:] == ["CLAIM_ASSIGNED", "TASK_CREATED", "TASK_COMPLETED", "NOTE_ADDED"]


def test_product_routes_validate_contracts_and_missing_resources(client: TestClient) -> None:
    assert client.post("/api/demo/reset", json={"unexpected": True}).status_code == 422
    assert client.post("/api/claims/unknown/assign", json={"field_adjuster_id": "USR_FIELD_01"}).status_code == 404
    assert client.post("/api/claims/unknown/tasks", json={"title": "x", "owner_id": "USR_FIELD_01"}).status_code == 404
    assert client.post("/api/claims/unknown/notes", json={"author_id": "USR_DESK_01", "body": "x"}).status_code == 404
    assert client.post("/api/claims/unknown/status", json={"status": "IN_REVIEW", "actor_id": "USR_FIELD_01"}).status_code == 404
    assert client.post("/api/claims/unknown/payment", json={"action": "SCHEDULE", "actor_id": "USR_FINANCE_01"}).status_code == 404

    reset_demo(client)
    assert client.post("/api/claims/CLM_DEMO_KITCHEN/assign", json={}).status_code == 422
    assert client.post(
        "/api/claims/CLM_DEMO_KITCHEN/assign", json={"field_adjuster_id": "USR_DESK_01"}
    ).status_code == 422
    assert client.post(
        "/api/claims/CLM_DEMO_KITCHEN/tasks", json={"title": "x", "owner_id": "UNKNOWN"}
    ).status_code == 422
    assert client.post(
        "/api/claims/CLM_DEMO_KITCHEN/tasks", json={"title": "x", "owner_id": "USR_FIELD_01", "extra": True}
    ).status_code == 422
    assert client.post(
        "/api/claims/CLM_DEMO_KITCHEN/notes", json={"author_id": "USR_DESK_01", "body": ""}
    ).status_code == 422
    assert client.post(
        "/api/claims/CLM_DEMO_KITCHEN/status", json={"status": "INVALID", "actor_id": "USR_FIELD_01"}
    ).status_code == 422
    assert client.post(
        "/api/claims/CLM_DEMO_KITCHEN/payment", json={"action": "SCHEDULE", "method": "WIRE", "actor_id": "USR_FINANCE_01"}
    ).status_code == 422


def test_controlled_status_cannot_bypass_vow_or_payment_transitions(client: TestClient) -> None:
    reset_demo(client)
    assert client.post(
        "/api/claims/CLM_DEMO_KITCHEN/status",
        json={"status": "APPROVED", "actor_id": "USR_SUPERVISOR_01"},
    ).status_code == 409
    assert client.post(
        "/api/claims/CLM_DEMO_KITCHEN/status",
        json={"status": "PAYMENT_SCHEDULED", "actor_id": "USR_FINANCE_01"},
    ).status_code == 409
    assert client.post(
        "/api/claims/CLM_DEMO_KITCHEN/status",
        json={"status": "CLOSED", "actor_id": "USR_ADMIN_01"},
    ).status_code == 409
    assert client.post(
        "/api/claims/CLM_DEMO_KITCHEN/payment",
        json={"action": "SCHEDULE", "actor_id": "USR_FINANCE_01"},
    ).status_code == 409
    assert client.post(
        "/api/claims/CLM_DEMO_KITCHEN/payment",
        json={"action": "MARK_SENT", "actor_id": "USR_FINANCE_01"},
    ).status_code == 409


def test_payment_gating_mock_instruction_and_paid_close_transition(client: TestClient) -> None:
    reset_demo(client)
    approved = approve_demo(client)
    assert approved["status"] == "APPROVED"
    assert approved["assurance"]["status"] == "VERIFIED"

    wrong_role = client.post(
        "/api/claims/CLM_DEMO_KITCHEN/payment",
        json={"action": "SCHEDULE", "method": "CHECK", "actor_id": "USR_DESK_01"},
    )
    assert wrong_role.status_code == 422

    scheduled = client.post(
        "/api/claims/CLM_DEMO_KITCHEN/payment",
        json={"action": "SCHEDULE", "method": "CHECK", "actor_id": "USR_FINANCE_01"},
    )
    assert scheduled.status_code == 200, scheduled.json()
    scheduled_claim = scheduled.json()
    assert scheduled_claim["status"] == "PAYMENT_SCHEDULED"
    assert scheduled_claim["payment"] == {
        "status": "SCHEDULED",
        "instruction_id": "PMT_CLM_DEMO_KITCHEN_V1",
        "method": "CHECK",
        "amount": 895.51,
        "currency": "USD",
        "scheduled_at": scheduled_claim["payment"]["scheduled_at"],
        "sent_at": None,
        "actor_id": "USR_FINANCE_01",
        "mock": True,
    }
    assert client.post(
        "/api/claims/CLM_DEMO_KITCHEN/status",
        json={"status": "PAID", "actor_id": "USR_FINANCE_01"},
    ).status_code == 409

    paid = client.post(
        "/api/claims/CLM_DEMO_KITCHEN/payment",
        json={"action": "MARK_SENT", "actor_id": "USR_FINANCE_01"},
    )
    assert paid.status_code == 200
    assert paid.json()["status"] == "PAID"
    assert paid.json()["payment"]["status"] == "SENT"
    assert paid.json()["payment"]["sent_at"]

    closed = client.post(
        "/api/claims/CLM_DEMO_KITCHEN/status",
        json={"status": "CLOSED", "actor_id": "USR_ADMIN_01"},
    )
    assert closed.status_code == 200
    assert closed.json()["status"] == "CLOSED"
    events = [event["event"] for event in closed.json()["audit_history"]]
    assert events[-3:] == ["PAYMENT_SCHEDULED", "PAYMENT_MARKED_SENT", "STATUS_CHANGED"]


def test_submitted_claim_can_only_use_nonfinancial_controlled_transition(client: TestClient) -> None:
    created = client.post("/api/claims/submit", json=submission_payload())
    assert created.status_code == 201
    claim_id = created.json()["claim_id"]
    moved = client.post(
        f"/api/claims/{claim_id}/status",
        json={"status": "IN_REVIEW", "actor_id": "USR_DESK_01"},
    )
    assert moved.status_code == 200
    assert moved.json()["status"] == "IN_REVIEW"
    assert moved.json()["audit_history"][-1]["event"] == "STATUS_CHANGED"
    assert client.post(
        f"/api/claims/{claim_id}/status",
        json={"status": "APPROVED", "actor_id": "USR_SUPERVISOR_01"},
    ).status_code == 409
    assert client.post(
        f"/api/claims/{claim_id}/approve", json={"adjuster_name": "Riley Thompson"}
    ).status_code == 409
