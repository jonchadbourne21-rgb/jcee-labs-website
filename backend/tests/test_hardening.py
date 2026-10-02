from __future__ import annotations

import pytest

from backend.config import ConfigurationError, Settings
from backend.object_storage import LocalEvidenceStore, S3EvidenceStore, evidence_scope_prefix
from backend.payments import MockPaymentProvider, payment_operation_key, payment_provider
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
    stored = store.put(tenant_id="TENANT_A", claim_id="CLM_1", filename="../kitchen.jpg", content=b"\xff\xd8\xff\xe0jpeg", media_type="image/jpeg")
    assert stored.object_key.startswith(evidence_scope_prefix("TENANT_A", "CLM_1"))
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



class _FakeS3Client:
    def __init__(self) -> None:
        self.calls: list[tuple[str, dict, int]] = []

    def generate_presigned_url(self, operation: str, *, Params: dict, ExpiresIn: int) -> str:
        self.calls.append((operation, Params, ExpiresIn))
        return f"https://signed.example/{Params['Key']}"


def _fake_s3_store(ttl: int = 300) -> S3EvidenceStore:
    store = object.__new__(S3EvidenceStore)
    store.bucket = "private-evidence"
    store.client = _FakeS3Client()
    store.ttl = ttl
    return store


def test_evidence_scope_encoding_is_lossless_and_collision_resistant() -> None:
    slash = evidence_scope_prefix("tenant/a", "claim:1")
    colon = evidence_scope_prefix("tenant:a", "claim:1")
    assert slash != colon
    assert "/" not in slash.removeprefix("tenants/").split("/claims/", 1)[0]
    long_tenant = "tenant-" + ("x" * 180)
    long_prefix = evidence_scope_prefix(long_tenant, "CLM_LONG")
    assert long_prefix.startswith("tenants/")
    assert long_prefix.endswith("/claims/Q0xNX0xPTkc/")


def test_s3_signed_url_requires_exact_tenant_and_claim_scope() -> None:
    store = _fake_s3_store(ttl=120)
    key = f"{evidence_scope_prefix('tenant/a', 'CLM_1')}evidence.jpg"

    signed = store.signed_url(
        tenant_id="tenant/a",
        claim_id="CLM_1",
        object_key=key,
        expires_in=999,
    )
    assert signed.endswith(key)
    assert store.client.calls[-1][2] == 120

    with pytest.raises(PermissionError):
        store.signed_url(
            tenant_id="tenant:a",
            claim_id="CLM_1",
            object_key=key,
            expires_in=60,
        )
    with pytest.raises(PermissionError):
        store.signed_url(
            tenant_id="tenant/a",
            claim_id="CLM_2",
            object_key=key,
            expires_in=60,
        )
    with pytest.raises(ValueError):
        store.signed_url(
            tenant_id="tenant/a",
            claim_id="CLM_1",
            object_key=key,
            expires_in=0,
        )


def test_local_evidence_store_refuses_fake_signed_delivery(tmp_path) -> None:
    store = LocalEvidenceStore(tmp_path)
    key = store.put(
        tenant_id="TENANT_A",
        claim_id="CLM_1",
        filename="inspection.jpg",
        content=b"\xff\xd8\xff\xe0jpeg",
        media_type="image/jpeg",
    ).object_key
    with pytest.raises(NotImplementedError, match="authenticated proxy"):
        store.signed_url(
            tenant_id="TENANT_A",
            claim_id="CLM_1",
            object_key=key,
            expires_in=60,
        )



def test_stripe_provider_does_not_claim_unimplemented_disbursement() -> None:
    provider = payment_provider(Settings(payment_provider="stripe", stripe_secret_key="sk_test_only"))
    with pytest.raises(RuntimeError, match="disbursement scheduling is not implemented"):
        provider.schedule(
            claim_id="CLM_1",
            amount=10.0,
            currency="USD",
            method="ACH",
            idempotency_key="claim-payment:TENANT_A:CLM_1:v1",
        )
    instruction = type("Instruction", (), {
        "provider": "stripe",
        "provider_id": "pi_test",
        "idempotency_key": "claim-payment:TENANT_A:CLM_1:v1",
        "amount": 10.0,
        "currency": "USD",
        "status": "SCHEDULED",
        "mock": False,
    })()
    with pytest.raises(RuntimeError, match="verified provider reconciliation"):
        provider.mark_sent(instruction=instruction)



def test_payment_operation_key_scopes_tenant_and_logical_settlement() -> None:
    a_v1 = payment_operation_key("TENANT_A", "CLM_SHARED", "v1")
    assert a_v1 == payment_operation_key("TENANT_A", "CLM_SHARED", "v1")
    assert a_v1 != payment_operation_key("TENANT_B", "CLM_SHARED", "v1")
    assert a_v1 != payment_operation_key("TENANT_A", "CLM_SHARED", "v2")



@pytest.mark.parametrize(
    ("settings", "message"),
    [
        (Settings(environment="prodution"), "Unsupported CLAIMS_ENV"),
        (Settings(storage_backend="filesystem"), "Unsupported CLAIMS_STORAGE_BACKEND"),
        (Settings(auth_mode="none"), "Unsupported CLAIMS_AUTH_MODE"),
        (Settings(payment_provider="other"), "Unsupported CLAIMS_PAYMENT_PROVIDER"),
        (Settings(rate_limit_per_minute=0), "CLAIMS_RATE_LIMIT_PER_MINUTE"),
        (Settings(rate_limit_per_minute=100_001), "CLAIMS_RATE_LIMIT_PER_MINUTE"),
        (Settings(max_request_bytes=0), "CLAIMS_MAX_REQUEST_BYTES"),
        (Settings(max_request_bytes=(64 * 1024 * 1024) + 1), "CLAIMS_MAX_REQUEST_BYTES"),
        (Settings(evidence_url_ttl_seconds=0), "CLAIMS_EVIDENCE_URL_TTL_SECONDS"),
        (Settings(evidence_url_ttl_seconds=3601), "CLAIMS_EVIDENCE_URL_TTL_SECONDS"),
    ],
)
def test_settings_reject_unknown_modes_and_unbounded_limits(settings: Settings, message: str) -> None:
    with pytest.raises(ConfigurationError, match=message):
        settings.validate()


def test_production_settings_require_the_documented_s3_oidc_and_stripe_seams() -> None:
    base = dict(
        environment="production",
        database_url="postgresql://example/aegis",
        auth_mode="oidc",
        oidc_issuer="https://issuer.example",
        oidc_audience="aegis",
        payment_provider="stripe",
        stripe_secret_key="sk_test_only",
        stripe_webhook_secret="whsec_test_only",
    )
    with pytest.raises(ConfigurationError, match="CLAIMS_STORAGE_BACKEND=s3"):
        Settings(**base).validate()

    valid = Settings(
        **base,
        storage_backend="s3",
        storage_bucket="private-evidence",
        storage_access_key_id="test-access",
        storage_secret_access_key="test-secret",
    )
    valid.validate()


def test_injected_settings_are_validated_before_adapter_construction(tmp_path) -> None:
    from backend.app import create_app

    with pytest.raises(ConfigurationError, match="Unsupported CLAIMS_STORAGE_BACKEND"):
        create_app(
            tmp_path / "claims.json",
            vow_data_dir=tmp_path / "vow",
            settings=Settings(environment="test", storage_backend="filesystem"),
        )



def test_evidence_media_type_is_checked_against_content_signature(tmp_path) -> None:
    store = LocalEvidenceStore(tmp_path)
    with pytest.raises(ValueError, match="does not match"):
        store.put(
            tenant_id="TENANT_A",
            claim_id="CLM_1",
            filename="spoof.jpg",
            content=b"%PDF-1.7\nnot really a jpeg",
            media_type="image/jpeg",
        )


def test_evidence_delete_is_scoped_to_exact_tenant_and_claim(tmp_path) -> None:
    store = LocalEvidenceStore(tmp_path)
    stored = store.put(
        tenant_id="TENANT_A",
        claim_id="CLM_1",
        filename="inspection.jpg",
        content=b"\xff\xd8\xff\xe0jpeg",
        media_type="image/jpeg",
    )
    with pytest.raises(PermissionError):
        store.delete(tenant_id="TENANT_B", claim_id="CLM_1", object_key=stored.object_key)
    with pytest.raises(PermissionError):
        store.delete(tenant_id="TENANT_A", claim_id="CLM_2", object_key=stored.object_key)
    assert (tmp_path / stored.object_key).is_file()
    store.delete(tenant_id="TENANT_A", claim_id="CLM_1", object_key=stored.object_key)
    assert not (tmp_path / stored.object_key).exists()
