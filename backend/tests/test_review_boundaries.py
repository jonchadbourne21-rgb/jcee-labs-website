from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time

import pytest
from backend.app import create_app
from backend.config import Settings
from fastapi.testclient import TestClient


def headers(roles=None, subject="reviewer"):
    def encode(value):
        return base64.urlsafe_b64encode(json.dumps(value).encode()).rstrip(b"=").decode()
    h = encode({"alg": "HS256", "typ": "JWT"})
    b = encode({"sub": subject, "tenant_id": "REVIEW", "roles": ["ADMIN"] if roles is None else roles, "amr": ["mfa"], "exp": time.time() + 600})
    s = base64.urlsafe_b64encode(hmac.new(b"local-review-only", f"{h}.{b}".encode(), hashlib.sha256).digest()).rstrip(b"=").decode()
    return {"Authorization": f"Bearer {h}.{b}.{s}"}


def application(root):
    return create_app(root / "claims.json", vow_data_dir=root / "vow", evidence_dir=root / "objects", settings=Settings(environment="test", auth_mode="jwt", jwt_secret="local-review-only"))


def setup_claim(client):
    r = client.post("/api/claims/submit", headers=headers(), json={"incident_description": "Synthetic water damage", "zip_code": "75201", "evidence": []})
    assert r.status_code == 201, r.text
    url = "/api/claims/" + r.json()["claim_id"]
    assert client.post(url + "/analyze", headers=headers(), json={}).status_code == 200
    return url


def approve(client, url):
    return client.post(url + "/approve", headers=headers(), json={"decision": "APPROVE"})


def upload(client, url):
    return client.post(url + "/evidence", headers=headers(), json={"filename": "new.jpg", "media_type": "image/jpeg", "content_base64": base64.b64encode(b"\xff\xd8\xff\xe0new").decode()})


def pay(client, url):
    return client.post(url + "/payment", headers=headers(), json={"action": "SCHEDULE", "actor_id": "reviewer"})


def test_evidence_invalidates_and_reapproval_binds_new_snapshot(tmp_path):
    app = application(tmp_path)
    with TestClient(app) as c:
        url = setup_claim(c)
        first = approve(c, url)
        assert first.status_code == 200, first.text
        old = first.json()["assurance"]
        changed = upload(c, url)
        assert changed.status_code == 201
        assert changed.json()["status"] == "IN_REVIEW"
        assert changed.json()["approval_history"][0]["assurance"] == old
        assert c.get(url + "/assurance/verify", headers=headers()).status_code == 409
        assert pay(c, url).status_code == 409
        new = approve(c, url)
        assert new.status_code == 200, new.text
        assert new.json()["assurance"]["reviewed_snapshot_sha256"] != old["reviewed_snapshot_sha256"]
        assert c.get(url + "/assurance/verify", headers=headers()).json()["status"] == "VERIFIED"
        assert pay(c, url).status_code == 200
        assert upload(c, url).status_code == 409


def test_roleless_and_external_users_cannot_read_operational_surfaces(tmp_path):
    with TestClient(application(tmp_path)) as c:
        url = setup_claim(c)
        for roles in ([], ["HOMEOWNER"], ["UNKNOWN"]):
            for route in (url, "/api/claims", "/api/dashboard", "/api/team", url + "/assurance/evidence", url + "/assurance/verify"):
                assert c.get(route, headers=headers(roles, "external")).status_code == 403
        for role in ("FIELD_ADJUSTER", "DESK_ADJUSTER", "SUPERVISOR", "FINANCE", "PROGRAM_ADMINISTRATOR"):
            assert c.get(url, headers=headers([role])).status_code == 200


def test_crash_after_vow_before_dossier_commit_retries_one_effect(tmp_path, monkeypatch):
    app = application(tmp_path)
    with TestClient(app, raise_server_exceptions=False) as c:
        url = setup_claim(c)
        def crash():
            raise OSError("injected pre-commit crash")
        monkeypatch.setattr(app.state.repository, "_write_unlocked", crash)
        assert approve(c, url).status_code == 500
    assert len(list((tmp_path / "vow" / "effects").glob("*.json"))) == 1
    # Fresh repository instance reloads durable data; same request replays VOW.
    with TestClient(application(tmp_path)) as c:
        assert c.get(url, headers=headers()).json()["status"] == "IN_REVIEW"
        r = approve(c, url)
        assert r.status_code == 200, r.text
        assert r.json()["assurance"]["effect"]["idempotent_replay"] is True
        assert c.get(url + "/assurance/verify", headers=headers()).json()["status"] == "VERIFIED"
    assert len(list((tmp_path / "vow" / "effects").glob("*.json"))) == 1


def test_completed_approval_and_payment_survive_restart_without_duplicate(tmp_path):
    with TestClient(application(tmp_path)) as c:
        url = setup_claim(c)
        assert approve(c, url).status_code == 200
        assert pay(c, url).status_code == 200
    with TestClient(application(tmp_path)) as c:
        assert approve(c, url).status_code == 409
        assert pay(c, url).status_code == 409
        dossier = c.get(url, headers=headers()).json()
        assert dossier["status"] == "PAYMENT_SCHEDULED"
        assert len([e for e in dossier["audit_history"] if e["event"] == "PAYMENT_SCHEDULED"]) == 1
    assert len(list((tmp_path / "vow" / "effects").glob("*.json"))) == 1


def test_unresolved_vow_failure_never_approves_or_schedules(tmp_path, monkeypatch):
    import backend.app as module
    from backend.vow_assurance import VowAssuranceError
    app = application(tmp_path)
    def unresolved(**kwargs):
        raise VowAssuranceError("unresolved outcome")
    monkeypatch.setattr(module, "authorize_settlement", unresolved)
    def forbidden(**kwargs):
        pytest.fail("provider must not be called")
    monkeypatch.setattr(app.state.payment_provider, "schedule", forbidden)
    with TestClient(app) as c:
        url = setup_claim(c)
        assert approve(c, url).status_code == 503
        assert pay(c, url).status_code == 409
        assert c.get(url, headers=headers()).json()["status"] == "IN_REVIEW"


def test_material_dossier_drift_rejected_before_provider(tmp_path, monkeypatch):
    app = application(tmp_path)
    with TestClient(app) as c:
        url = setup_claim(c)
        assert approve(c, url).status_code == 200
        claim_id = url.rsplit("/", 1)[1]
        # Model a stale/corrupted persisted dossier without manufacturing a new receipt.
        app.state.repository.mutate(claim_id, lambda d: d["estimate"].update(net_payout=1), tenant_id="REVIEW")
        def forbidden(**kwargs):
            pytest.fail("provider must not be called")
        monkeypatch.setattr(app.state.payment_provider, "schedule", forbidden)
        assert pay(c, url).status_code == 409
        assert c.get(url + "/assurance/verify", headers=headers()).json()["status"] == "FAILED"


def test_rehashed_dossier_cannot_reuse_an_old_signed_receipt(tmp_path, monkeypatch):
    from backend.approval_snapshot import digest, snapshot
    app = application(tmp_path)
    with TestClient(app) as c:
        url = setup_claim(c)
        assert approve(c, url).status_code == 200
        def forge(d):
            d["estimate"]["net_payout"] = 1
            d["assurance"]["reviewed_snapshot"] = snapshot(d, tenant_id="REVIEW")
            d["assurance"]["reviewed_snapshot_sha256"] = digest(d["assurance"]["reviewed_snapshot"])
        app.state.repository.mutate(url.rsplit("/", 1)[1], forge, tenant_id="REVIEW")
        def forbidden(**kwargs):
            pytest.fail("provider must not be called")
        monkeypatch.setattr(app.state.payment_provider, "schedule", forbidden)
        assert pay(c, url).status_code == 409


def test_mock_schedule_write_failure_retries_same_operation_key(tmp_path, monkeypatch):
    keys = []
    app = application(tmp_path)
    def record(provider):
        original = provider.schedule
        def wrapped(**kwargs):
            keys.append(kwargs["idempotency_key"])
            return original(**kwargs)
        monkeypatch.setattr(provider, "schedule", wrapped)
    record(app.state.payment_provider)
    with TestClient(app, raise_server_exceptions=False) as c:
        url = setup_claim(c)
        assert approve(c, url).status_code == 200
        def crash():
            raise OSError("injected schedule persistence failure")
        monkeypatch.setattr(app.state.repository, "_write_unlocked", crash)
        assert pay(c, url).status_code == 500
    restarted = application(tmp_path)
    record(restarted.state.payment_provider)
    with TestClient(restarted) as c:
        assert c.get(url, headers=headers()).json()["status"] == "APPROVED"
        assert pay(c, url).status_code == 200
    assert len(keys) == 2 and keys[0] == keys[1]


def test_abrupt_process_exit_after_vow_reconciles_on_restart(tmp_path):
    import subprocess
    import sys
    from pathlib import Path

    script = """
import os, runpy, sys
from pathlib import Path
ns = runpy.run_path(sys.argv[1])
root = Path(sys.argv[2])
app = ns['application'](root)
with ns['TestClient'](app) as client:
    url = ns['setup_claim'](client)
    (root / 'claim-url.txt').write_text(url)
    app.state.repository._write_unlocked = lambda: os._exit(73)
    ns['approve'](client, url)
"""
    completed = subprocess.run([sys.executable, "-c", script, str(Path(__file__).resolve()), str(tmp_path)], capture_output=True, timeout=60)
    assert completed.returncode == 73, completed.stderr.decode()
    url = (tmp_path / "claim-url.txt").read_text()
    assert len(list((tmp_path / "vow" / "effects").glob("*.json"))) == 1
    with TestClient(application(tmp_path)) as c:
        assert c.get(url, headers=headers()).json()["status"] == "IN_REVIEW"
        replay = approve(c, url)
        assert replay.status_code == 200, replay.text
        assert replay.json()["assurance"]["effect"]["idempotent_replay"] is True
        assert pay(c, url).status_code == 200
    assert len(list((tmp_path / "vow" / "effects").glob("*.json"))) == 1
