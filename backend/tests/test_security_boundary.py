from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from pathlib import Path

from fastapi.testclient import TestClient

from backend.app import create_app
from backend.config import Settings
from backend.object_storage import evidence_scope_prefix
from backend.tenant_context import bind_request


def jwt(payload: dict, secret: str) -> str:
    def encode(value: object) -> str:
        return base64.urlsafe_b64encode(json.dumps(value, separators=(",", ":")).encode()).rstrip(b"=").decode()
    header = encode({"alg": "HS256", "typ": "JWT"})
    body = encode(payload)
    signature = base64.urlsafe_b64encode(hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest()).rstrip(b"=").decode()
    return f"{header}.{body}.{signature}"


def test_demo_boundary_adds_request_id_and_security_headers(tmp_path: Path) -> None:
    app = create_app(tmp_path / "claims.json", vow_data_dir=tmp_path / "vow")
    with TestClient(app) as client:
        response = client.get("/health", headers={"X-Request-ID": "req-demo-1"})
    assert response.status_code == 200
    assert response.headers["x-request-id"] == "req-demo-1"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"


def test_evidence_upload_uses_private_local_store(tmp_path: Path) -> None:
    app = create_app(tmp_path / "claims.json", vow_data_dir=tmp_path / "vow")
    with TestClient(app) as client:
        submitted = client.post("/api/claims/submit", json={"incident_description": "Water loss", "zip_code": "75201", "evidence": []})
        claim_id = submitted.json()["claim_id"]
        response = client.post(f"/api/claims/{claim_id}/evidence", json={"filename": "inspection.jpg", "media_type": "image/jpeg", "content_base64": base64.b64encode(b"jpeg").decode()})
    assert response.status_code == 201
    uploaded = response.json()["evidence"][-1]
    assert uploaded["media_url"].startswith(evidence_scope_prefix("TENANT_DEMO", claim_id))
    assert uploaded["content_sha256"] == hashlib.sha256(b"jpeg").hexdigest()


def test_jwt_mode_requires_mfa_and_binds_tenant(tmp_path: Path) -> None:
    secret = "hardening-test-secret"
    settings = Settings(environment="test", auth_mode="jwt", jwt_secret=secret, oidc_issuer=None, oidc_audience=None)
    app = create_app(tmp_path / "claims.json", vow_data_dir=tmp_path / "vow", settings=settings)
    with TestClient(app) as client:
        missing = client.get("/health")
        assert missing.status_code == 401
        token = jwt({"sub": "USR_ADMIN_01", "tenant_id": "TENANT_A", "roles": ["ADMIN"], "exp": time.time() + 60}, secret)
        without_mfa = client.get("/health", headers={"Authorization": f"Bearer {token}"})
        assert without_mfa.status_code == 403
        verified = jwt({"sub": "USR_ADMIN_01", "tenant_id": "TENANT_A", "roles": ["ADMIN"], "amr": ["pwd", "mfa"], "exp": time.time() + 60}, secret)
        response = client.get("/health", headers={"Authorization": f"Bearer {verified}"})
    assert response.status_code == 200
    assert response.json()["claim_count"] == 0


def auth_headers(payload: dict, secret: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {jwt(payload, secret)}"}


def test_jwt_roles_fail_closed_before_sensitive_mutations(tmp_path: Path) -> None:
    secret = "hardening-test-secret"
    settings = Settings(environment="test", auth_mode="jwt", jwt_secret=secret)
    app = create_app(tmp_path / "claims.json", vow_data_dir=tmp_path / "vow", settings=settings)
    no_role = {
        "sub": "USR_FINANCE_01",
        "tenant_id": "TENANT_A",
        "roles": [],
        "amr": ["pwd", "mfa"],
        "exp": time.time() + 60,
    }
    headers = auth_headers(no_role, secret)
    with TestClient(app) as client:
        created = client.post(
            "/api/claims/submit",
            json={"incident_description": "Water loss", "zip_code": "75201", "evidence": []},
            headers=headers,
        )
        assert created.status_code == 201
        claim_id = created.json()["claim_id"]
        assert client.post("/api/demo/reset", json={}, headers=headers).status_code == 403
        assert client.post(
            f"/api/claims/{claim_id}/assign",
            json={"field_adjuster_id": "USR_FIELD_01"},
            headers=headers,
        ).status_code == 403
        assert client.post(
            f"/api/claims/{claim_id}/payment",
            json={"action": "SCHEDULE", "actor_id": "USR_FINANCE_01"},
            headers=headers,
        ).status_code == 403
        assert client.post(
            f"/api/claims/{claim_id}/evidence",
            json={
                "filename": "inspection.jpg",
                "media_type": "image/jpeg",
                "content_base64": base64.b64encode(b"jpeg").decode(),
            },
            headers=headers,
        ).status_code == 403


def test_jwt_program_admin_can_assign_another_team_member_without_impersonation(tmp_path: Path) -> None:
    secret = "hardening-test-secret"
    settings = Settings(environment="test", auth_mode="jwt", jwt_secret=secret)
    app = create_app(tmp_path / "claims.json", vow_data_dir=tmp_path / "vow", settings=settings)
    admin = {
        "sub": "USR_ADMIN_01",
        "tenant_id": "TENANT_A",
        "roles": ["PROGRAM_ADMINISTRATOR"],
        "amr": ["pwd", "mfa"],
        "exp": time.time() + 60,
    }
    headers = auth_headers(admin, secret)
    with TestClient(app) as client:
        created = client.post(
            "/api/claims/submit",
            json={"incident_description": "Water loss", "zip_code": "75201", "evidence": []},
            headers=headers,
        )
        claim_id = created.json()["claim_id"]
        assigned = client.post(
            f"/api/claims/{claim_id}/assign",
            json={"field_adjuster_id": "USR_FIELD_01"},
            headers=headers,
        )
    assert assigned.status_code == 200, assigned.json()
    assert assigned.json()["assignments"]["field_adjuster_id"] == "USR_FIELD_01"
    assert assigned.json()["audit_history"][-1]["actor"] == "USR_ADMIN_01"


def test_jwt_rejects_forged_note_actor_and_uses_verified_principal(tmp_path: Path) -> None:
    secret = "hardening-test-secret"
    settings = Settings(environment="test", auth_mode="jwt", jwt_secret=secret)
    app = create_app(tmp_path / "claims.json", vow_data_dir=tmp_path / "vow", settings=settings)
    desk = {
        "sub": "USR_DESK_01",
        "tenant_id": "TENANT_A",
        "roles": ["DESK_ADJUSTER"],
        "amr": ["pwd", "mfa"],
        "exp": time.time() + 60,
    }
    headers = auth_headers(desk, secret)
    with TestClient(app) as client:
        created = client.post(
            "/api/claims/submit",
            json={"incident_description": "Water loss", "zip_code": "75201", "evidence": []},
            headers=headers,
        )
        claim_id = created.json()["claim_id"]
        forged = client.post(
            f"/api/claims/{claim_id}/notes",
            json={"author_id": "USR_FIELD_01", "body": "forged"},
            headers=headers,
        )
        accepted = client.post(
            f"/api/claims/{claim_id}/notes",
            json={"author_id": "USR_DESK_01", "body": "verified"},
            headers=headers,
        )
    assert forged.status_code == 403
    assert accepted.status_code == 200, accepted.json()
    assert accepted.json()["notes"][-1]["author_id"] == "USR_DESK_01"
    assert accepted.json()["audit_history"][-1]["actor"] == "USR_DESK_01"


def test_jwt_review_role_is_distinct_from_settlement_approval_role(tmp_path: Path) -> None:
    secret = "hardening-test-secret"
    settings = Settings(environment="test", auth_mode="jwt", jwt_secret=secret)
    app = create_app(tmp_path / "claims.json", vow_data_dir=tmp_path / "vow", settings=settings)
    admin = {
        "sub": "USR_ADMIN_01",
        "tenant_id": "TENANT_A",
        "roles": ["PROGRAM_ADMINISTRATOR"],
        "amr": ["pwd", "mfa"],
        "exp": time.time() + 60,
    }
    desk = {
        "sub": "USR_DESK_01",
        "tenant_id": "TENANT_A",
        "roles": ["DESK_ADJUSTER"],
        "amr": ["pwd", "mfa"],
        "exp": time.time() + 60,
    }
    with TestClient(app) as client:
        created = client.post(
            "/api/claims/submit",
            json={
                "incident_description": "Water loss",
                "zip_code": "75201",
                "evidence": [{"media_url": "https://example.test/a.jpg", "media_type": "IMAGE"}],
            },
            headers=auth_headers(admin, secret),
        )
        claim_id = created.json()["claim_id"]
        analyzed = client.post(
            f"/api/claims/{claim_id}/analyze",
            json={},
            headers=auth_headers(admin, secret),
        )
        assert analyzed.status_code == 200, analyzed.json()
        saved = client.post(
            f"/api/claims/{claim_id}/approve",
            json={"decision": "SAVE_REVIEW", "adjuster_name": "Untrusted display name"},
            headers=auth_headers(desk, secret),
        )
        denied = client.post(
            f"/api/claims/{claim_id}/approve",
            json={"decision": "APPROVE", "adjuster_name": "Untrusted display name"},
            headers=auth_headers(desk, secret),
        )
    assert saved.status_code == 200, saved.json()
    assert saved.json()["audit_history"][-1]["actor"] == "USR_DESK_01"
    assert denied.status_code == 403



def test_nonmock_payment_cannot_be_manually_promoted_to_paid(tmp_path: Path) -> None:
    secret = "hardening-test-secret"
    settings = Settings(
        environment="test",
        auth_mode="jwt",
        jwt_secret=secret,
        payment_provider="stripe",
        stripe_secret_key="sk_test_only",
    )
    app = create_app(tmp_path / "claims.json", vow_data_dir=tmp_path / "vow", settings=settings)
    with bind_request(tenant_id="TENANT_A", actor_id="seed", request_id="seed"):
        app.state.repository.create({
            "claim_id": "CLM_STRIPE",
            "status": "PAYMENT_SCHEDULED",
            "payment": {
                "status": "SCHEDULED",
                "instruction_id": "pi_test",
                "method": "ACH",
                "amount": 10.0,
                "currency": "USD",
                "scheduled_at": "2026-10-02T12:00:00Z",
                "sent_at": None,
                "actor_id": "USR_FINANCE_01",
                "mock": False,
            },
            "payment_provider": "stripe",
            "payment_idempotency_key": "claim-payment:TENANT_A:CLM_STRIPE:v1",
            "audit_history": [],
        })

    finance = {
        "sub": "USR_FINANCE_01",
        "tenant_id": "TENANT_A",
        "roles": ["FINANCE"],
        "amr": ["pwd", "mfa"],
        "exp": time.time() + 60,
    }
    with TestClient(app) as client:
        response = client.post(
            "/api/claims/CLM_STRIPE/payment",
            json={"action": "MARK_SENT", "actor_id": "USR_FINANCE_01"},
            headers=auth_headers(finance, secret),
        )
    assert response.status_code == 409
    with bind_request(tenant_id="TENANT_A", actor_id="verify", request_id="verify"):
        persisted = app.state.repository.get("CLM_STRIPE")
    assert persisted is not None
    assert persisted["status"] == "PAYMENT_SCHEDULED"
    assert persisted["payment"]["status"] == "SCHEDULED"


def test_nonmock_payment_schedule_is_disabled_before_provider_call(tmp_path: Path) -> None:
    secret = "hardening-test-secret"
    settings = Settings(
        environment="test",
        auth_mode="jwt",
        jwt_secret=secret,
        payment_provider="stripe",
        stripe_secret_key="sk_test_only",
    )
    app = create_app(tmp_path / "claims.json", vow_data_dir=tmp_path / "vow", settings=settings)
    with bind_request(tenant_id="TENANT_A", actor_id="seed", request_id="seed"):
        app.state.repository.create({
            "claim_id": "CLM_APPROVED",
            "status": "APPROVED",
            "estimate": {"net_payout": 10.0},
            "payment": {"status": "NOT_SCHEDULED", "mock": False},
            "audit_history": [],
        })

    finance = {
        "sub": "USR_FINANCE_01",
        "tenant_id": "TENANT_A",
        "roles": ["FINANCE"],
        "amr": ["pwd", "mfa"],
        "exp": time.time() + 60,
    }
    with TestClient(app) as client:
        response = client.post(
            "/api/claims/CLM_APPROVED/payment",
            json={"action": "SCHEDULE", "actor_id": "USR_FINANCE_01"},
            headers=auth_headers(finance, secret),
        )
    assert response.status_code == 503
    with bind_request(tenant_id="TENANT_A", actor_id="verify", request_id="verify"):
        persisted = app.state.repository.get("CLM_APPROVED")
    assert persisted is not None
    assert persisted["status"] == "APPROVED"



def test_jwt_cors_preflight_is_handled_before_authentication(tmp_path: Path) -> None:
    settings = Settings(environment="test", auth_mode="jwt", jwt_secret="hardening-test-secret")
    app = create_app(
        tmp_path / "claims.json",
        allowed_origins=["https://app.example"],
        vow_data_dir=tmp_path / "vow",
        settings=settings,
    )
    with TestClient(app) as client:
        response = client.options(
            "/api/claims/submit",
            headers={
                "Origin": "https://app.example",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization,content-type",
            },
        )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://app.example"


def test_auth_errors_keep_cors_request_id_and_security_headers(tmp_path: Path) -> None:
    secret = "hardening-test-secret"
    settings = Settings(environment="test", auth_mode="jwt", jwt_secret=secret)
    app = create_app(
        tmp_path / "claims.json",
        allowed_origins=["https://app.example"],
        vow_data_dir=tmp_path / "vow",
        settings=settings,
    )
    without_mfa = jwt(
        {
            "sub": "USR_DESK_01",
            "tenant_id": "TENANT_A",
            "roles": ["DESK_ADJUSTER"],
            "exp": time.time() + 60,
        },
        secret,
    )
    with TestClient(app) as client:
        unauthorized = client.get(
            "/health",
            headers={"Origin": "https://app.example", "X-Request-ID": "req-401"},
        )
        forbidden = client.get(
            "/health",
            headers={
                "Origin": "https://app.example",
                "X-Request-ID": "req-403",
                "Authorization": f"Bearer {without_mfa}",
            },
        )
        disallowed = client.get(
            "/health",
            headers={"Origin": "https://evil.example", "X-Request-ID": "req-no-cors"},
        )

    for response, request_id, code in (
        (unauthorized, "req-401", 401),
        (forbidden, "req-403", 403),
    ):
        assert response.status_code == code
        assert response.headers["access-control-allow-origin"] == "https://app.example"
        assert response.headers["x-request-id"] == request_id
        assert response.headers["x-content-type-options"] == "nosniff"
        assert response.headers["x-frame-options"] == "DENY"
    assert "access-control-allow-origin" not in disallowed.headers


def test_rate_limit_response_keeps_security_headers(tmp_path: Path) -> None:
    settings = Settings(environment="test", rate_limit_per_minute=1)
    app = create_app(
        tmp_path / "claims.json",
        allowed_origins=["https://app.example"],
        vow_data_dir=tmp_path / "vow",
        settings=settings,
    )
    with TestClient(app) as client:
        first = client.get("/health", headers={"Origin": "https://app.example"})
        limited = client.get(
            "/health",
            headers={"Origin": "https://app.example", "X-Request-ID": "req-429"},
        )
    assert first.status_code == 200
    assert limited.status_code == 429
    assert limited.headers["access-control-allow-origin"] == "https://app.example"
    assert limited.headers["x-request-id"] == "req-429"
    assert limited.headers["x-content-type-options"] == "nosniff"
    assert limited.headers["x-frame-options"] == "DENY"
