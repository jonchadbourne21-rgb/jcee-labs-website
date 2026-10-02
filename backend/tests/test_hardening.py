from __future__ import annotations

import pytest

from backend.config import ConfigurationError, Settings
from backend.object_storage import LocalEvidenceStore
from backend.payments import MockPaymentProvider, payment_provider
from backend.storage import ClaimsRepository
from backend.tenant_context import bind_request


def test_production_settings_fail_closed_without_database_and_oidc() -> None:
    with pytest.raises(ConfigurationError):
        Settings(environment="production").validate()


def test_stripe_selection_fails_closed_without_secret() -> None:
    settings = Settings(payment_provider="stripe")
    with pytest.raises(ConfigurationError):
        payment_provider(settings)


def test_json_repository_cannot_cross_tenant_read_or_mutate(tmp_path) -> None:
    repository = ClaimsRepository(tmp_path / "claims.json")
    with bind_request(tenant_id="TENANT_A", actor_id="a", request_id="r1"):
        repository.create({"claim_id": "CLM_A", "status": "SUBMITTED"})
        assert repository.get("CLM_A") is not None
    with bind_request(tenant_id="TENANT_B", actor_id="b", request_id="r2"):
        assert repository.get("CLM_A") is None
        assert repository.list() == []
        assert repository.mutate("CLM_A", lambda claim: claim.update(status="CLOSED")) is None


def test_local_evidence_store_scopes_keys_and_rejects_unsafe_content(tmp_path) -> None:
    store = LocalEvidenceStore(tmp_path)
    stored = store.put(tenant_id="TENANT_A", claim_id="CLM_1", filename="../kitchen.jpg", content=b"jpeg", media_type="image/jpeg")
    assert stored.object_key.startswith("tenants/TENANT_A/claims/CLM_1/")
    assert (tmp_path / stored.object_key).read_bytes() == b"jpeg"
    with pytest.raises(ValueError):
        store.put(tenant_id="TENANT_A", claim_id="CLM_1", filename="secret.exe", content=b"x", media_type="application/octet-stream")


def test_mock_provider_is_idempotency_ready() -> None:
    provider = MockPaymentProvider()
    instruction = provider.schedule(claim_id="CLM_1", amount=10.0, currency="USD", method="CHECK", idempotency_key="claim-payment:CLM_1:v1")
    assert instruction.provider == "mock"
    assert instruction.idempotency_key == "claim-payment:CLM_1:v1"
    assert provider.mark_sent(instruction=instruction).status == "SENT"


def test_json_repository_rejects_cross_tenant_duplicate_claim_id_without_data_loss(tmp_path) -> None:
    path = tmp_path / "claims.json"
    repository = ClaimsRepository(path)
    with bind_request(tenant_id="TENANT_A", actor_id="a", request_id="r1"):
        repository.create({"claim_id": "CLM_SHARED", "status": "SUBMITTED", "marker": "tenant-a"})
    with bind_request(tenant_id="TENANT_B", actor_id="b", request_id="r2"):
        with pytest.raises(KeyError):
            repository.create({"claim_id": "CLM_SHARED", "status": "SUBMITTED", "marker": "tenant-b"})
        assert repository.get("CLM_SHARED") is None

    reloaded = ClaimsRepository(path)
    with bind_request(tenant_id="TENANT_A", actor_id="a", request_id="r3"):
        preserved = reloaded.get("CLM_SHARED")
        assert preserved is not None
        assert preserved["marker"] == "tenant-a"


class _RecordingResult:
    def __init__(self, scalar=None) -> None:
        self.scalar = scalar

    def scalar_one_or_none(self):
        return self.scalar

    def scalar_one(self):
        return 0 if self.scalar is None else self.scalar

    def scalars(self):
        return self

    def all(self):
        return []


class _RecordingConnection:
    def __init__(self, statements: list[tuple[str, dict | None]]) -> None:
        self.statements = statements

    def execute(self, statement, params=None):
        self.statements.append((str(statement), params))
        return _RecordingResult()


class _RecordingBegin:
    def __init__(self, connection: _RecordingConnection) -> None:
        self.connection = connection

    def __enter__(self):
        return self.connection

    def __exit__(self, exc_type, exc, tb):
        return False


class _RecordingEngine:
    def __init__(self) -> None:
        self.statements: list[tuple[str, dict | None]] = []
        self.connection = _RecordingConnection(self.statements)

    def begin(self):
        return _RecordingBegin(self.connection)


def test_postgres_repository_requires_bound_context_and_sets_rls_tenant_each_transaction() -> None:
    from backend.postgres_storage import PostgresClaimsRepository

    engine = _RecordingEngine()
    repository = PostgresClaimsRepository("postgresql://unused", engine=engine)
    assert engine.statements == []

    with pytest.raises(RuntimeError, match="tenant context is not bound"):
        repository.get("CLM_1")

    for tenant, request_id in (("TENANT_A", "r1"), ("TENANT_B", "r2"), ("TENANT_A", "r3")):
        with bind_request(tenant_id=tenant, actor_id="actor", request_id=request_id):
            assert repository.get("CLM_1") is None

    bindings = [
        params["tenant_id"]
        for sql, params in engine.statements
        if "set_config('aegis.tenant_id'" in sql and params is not None
    ]
    assert bindings == ["TENANT_A", "TENANT_B", "TENANT_A"]


def test_postgres_explicit_tenant_cannot_override_authenticated_tenant() -> None:
    from backend.postgres_storage import PostgresClaimsRepository

    engine = _RecordingEngine()
    repository = PostgresClaimsRepository("postgresql://unused", engine=engine)
    with bind_request(tenant_id="TENANT_A", actor_id="actor", request_id="r1"):
        with pytest.raises(PermissionError, match="conflicts with authenticated request tenant"):
            repository.get("CLM_1", tenant_id="TENANT_B")
