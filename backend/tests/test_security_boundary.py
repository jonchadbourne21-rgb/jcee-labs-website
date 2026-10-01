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
    assert uploaded["media_url"].startswith("tenants/TENANT_DEMO/claims/")
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
