"""PostgreSQL persistence adapter for production claim dossiers."""
from __future__ import annotations

import copy
import json
from collections.abc import Callable
from typing import Any, TypeVar

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from backend.tenant_context import current_tenant_id

T = TypeVar("T")


class PostgresClaimsRepository:
    """Store complete dossiers in JSONB while indexing tenant/status metadata."""

    def __init__(self, database_url: str, *, engine: Engine | None = None) -> None:
        self.engine = engine or create_engine(database_url, pool_pre_ping=True, pool_size=5, max_overflow=10)
        self._ensure_schema()

    def _ensure_schema(self) -> None:
        with self.engine.begin() as connection:
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS aegis_claims (
                    tenant_id TEXT NOT NULL,
                    claim_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    dossier JSONB NOT NULL,
                    PRIMARY KEY (tenant_id, claim_id)
                )
            """))
            connection.execute(text("CREATE INDEX IF NOT EXISTS idx_aegis_claims_tenant_updated ON aegis_claims (tenant_id, updated_at DESC)"))
            connection.execute(text("CREATE INDEX IF NOT EXISTS idx_aegis_claims_tenant_status ON aegis_claims (tenant_id, status)"))

    def create(self, claim: dict[str, Any], tenant_id: str | None = None) -> dict[str, Any]:
        tenant = tenant_id or claim.get("tenant_id") or current_tenant_id()
        claim = copy.deepcopy(claim)
        claim["tenant_id"] = tenant
        with self.engine.begin() as connection:
            connection.execute(text("INSERT INTO aegis_claims (tenant_id, claim_id, status, updated_at, dossier) VALUES (:tenant_id, :claim_id, :status, COALESCE(:updated_at, NOW()), CAST(:dossier AS JSONB))"), {"tenant_id": tenant, "claim_id": claim["claim_id"], "status": claim.get("status", "SUBMITTED"), "updated_at": claim.get("updated_at"), "dossier": json.dumps(claim)})
        return claim

    def get(self, claim_id: str, tenant_id: str | None = None) -> dict[str, Any] | None:
        tenant = tenant_id or current_tenant_id()
        with self.engine.connect() as connection:
            row = connection.execute(text("SELECT dossier FROM aegis_claims WHERE tenant_id=:tenant_id AND claim_id=:claim_id"), {"tenant_id": tenant, "claim_id": claim_id}).scalar_one_or_none()
        return copy.deepcopy(row) if isinstance(row, dict) else (json.loads(row) if row else None)

    def list(self, tenant_id: str | None = None) -> list[dict[str, Any]]:
        tenant = tenant_id or current_tenant_id()
        with self.engine.connect() as connection:
            rows = connection.execute(text("SELECT dossier FROM aegis_claims WHERE tenant_id=:tenant_id ORDER BY updated_at DESC"), {"tenant_id": tenant}).scalars().all()
        return [copy.deepcopy(row) if isinstance(row, dict) else json.loads(row) for row in rows]

    def mutate(self, claim_id: str, mutator: Callable[[dict[str, Any]], T], tenant_id: str | None = None) -> T | None:
        tenant = tenant_id or current_tenant_id()
        with self.engine.begin() as connection:
            row = connection.execute(text("SELECT dossier FROM aegis_claims WHERE tenant_id=:tenant_id AND claim_id=:claim_id FOR UPDATE"), {"tenant_id": tenant, "claim_id": claim_id}).scalar_one_or_none()
            if row is None:
                return None
            working = copy.deepcopy(row) if isinstance(row, dict) else json.loads(row)
            result = mutator(working)
            connection.execute(text("UPDATE aegis_claims SET status=:status, updated_at=COALESCE(:updated_at, NOW()), dossier=CAST(:dossier AS JSONB) WHERE tenant_id=:tenant_id AND claim_id=:claim_id"), {"tenant_id": tenant, "claim_id": claim_id, "status": working.get("status", "SUBMITTED"), "updated_at": working.get("updated_at"), "dossier": json.dumps(working)})
            return copy.deepcopy(result)

    def replace(self, claim: dict[str, Any], tenant_id: str | None = None) -> dict[str, Any]:
        tenant = tenant_id or claim.get("tenant_id") or current_tenant_id()
        claim = copy.deepcopy(claim)
        claim["tenant_id"] = tenant
        with self.engine.begin() as connection:
            connection.execute(text("""
                INSERT INTO aegis_claims (tenant_id, claim_id, status, updated_at, dossier)
                VALUES (:tenant_id, :claim_id, :status, COALESCE(:updated_at, NOW()), CAST(:dossier AS JSONB))
                ON CONFLICT (tenant_id, claim_id) DO UPDATE SET status=EXCLUDED.status, updated_at=EXCLUDED.updated_at, dossier=EXCLUDED.dossier
            """), {"tenant_id": tenant, "claim_id": claim["claim_id"], "status": claim.get("status", "SUBMITTED"), "updated_at": claim.get("updated_at"), "dossier": json.dumps(claim)})
        return claim

    def count(self, tenant_id: str | None = None) -> int:
        tenant = tenant_id or current_tenant_id()
        with self.engine.connect() as connection:
            return int(connection.execute(text("SELECT COUNT(*) FROM aegis_claims WHERE tenant_id=:tenant_id"), {"tenant_id": tenant}).scalar_one())
