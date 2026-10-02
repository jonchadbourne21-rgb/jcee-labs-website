"""PostgreSQL persistence adapter for production claim dossiers."""
from __future__ import annotations

import copy
import json
from collections.abc import Callable
from typing import Any, TypeVar

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Connection, Engine

from backend.tenant_context import current_tenant_id, request_context_bound

T = TypeVar("T")


class PostgresClaimsRepository:
    """Store complete dossiers in JSONB while enforcing request-bound tenant context."""

    def __init__(self, database_url: str, *, engine: Engine | None = None) -> None:
        # Schema ownership belongs to migrations. Runtime startup must never silently
        # create a weaker table that omits the migration's constraints or RLS policy.
        self.engine = engine or create_engine(database_url, pool_pre_ping=True, pool_size=5, max_overflow=10)

    @staticmethod
    def _bind_tenant(connection: Connection, tenant_id: str) -> None:
        """Bind RLS to this transaction/connection before any tenant-scoped SQL."""
        connection.execute(
            text("SELECT set_config('aegis.tenant_id', :tenant_id, true)"),
            {"tenant_id": tenant_id},
        )

    @staticmethod
    def _resolve_tenant(tenant_id: str | None = None) -> str:
        if tenant_id is not None:
            if not tenant_id:
                raise ValueError("tenant_id cannot be empty")
            if request_context_bound() and tenant_id != current_tenant_id():
                raise PermissionError("Explicit tenant_id conflicts with authenticated request tenant")
            return tenant_id
        if not request_context_bound():
            raise RuntimeError("PostgreSQL tenant context is not bound")
        return current_tenant_id()

    def create(self, claim: dict[str, Any], tenant_id: str | None = None) -> dict[str, Any]:
        tenant = self._resolve_tenant(tenant_id)
        claim = copy.deepcopy(claim)
        claim["tenant_id"] = tenant
        with self.engine.begin() as connection:
            self._bind_tenant(connection, tenant)
            connection.execute(
                text(
                    "INSERT INTO aegis_claims "
                    "(tenant_id, claim_id, status, updated_at, dossier) "
                    "VALUES (:tenant_id, :claim_id, :status, COALESCE(:updated_at, NOW()), CAST(:dossier AS JSONB))"
                ),
                {
                    "tenant_id": tenant,
                    "claim_id": claim["claim_id"],
                    "status": claim.get("status", "SUBMITTED"),
                    "updated_at": claim.get("updated_at"),
                    "dossier": json.dumps(claim),
                },
            )
        return claim

    def get(self, claim_id: str, tenant_id: str | None = None) -> dict[str, Any] | None:
        tenant = self._resolve_tenant(tenant_id)
        with self.engine.begin() as connection:
            self._bind_tenant(connection, tenant)
            row = connection.execute(
                text("SELECT dossier FROM aegis_claims WHERE tenant_id=:tenant_id AND claim_id=:claim_id"),
                {"tenant_id": tenant, "claim_id": claim_id},
            ).scalar_one_or_none()
        return copy.deepcopy(row) if isinstance(row, dict) else (json.loads(row) if row else None)

    def list(self, tenant_id: str | None = None) -> list[dict[str, Any]]:
        tenant = self._resolve_tenant(tenant_id)
        with self.engine.begin() as connection:
            self._bind_tenant(connection, tenant)
            rows = connection.execute(
                text("SELECT dossier FROM aegis_claims WHERE tenant_id=:tenant_id ORDER BY updated_at DESC"),
                {"tenant_id": tenant},
            ).scalars().all()
        return [copy.deepcopy(row) if isinstance(row, dict) else json.loads(row) for row in rows]

    def mutate(
        self,
        claim_id: str,
        mutator: Callable[[dict[str, Any]], T],
        tenant_id: str | None = None,
    ) -> T | None:
        tenant = self._resolve_tenant(tenant_id)
        with self.engine.begin() as connection:
            self._bind_tenant(connection, tenant)
            row = connection.execute(
                text(
                    "SELECT dossier FROM aegis_claims "
                    "WHERE tenant_id=:tenant_id AND claim_id=:claim_id FOR UPDATE"
                ),
                {"tenant_id": tenant, "claim_id": claim_id},
            ).scalar_one_or_none()
            if row is None:
                return None
            working = copy.deepcopy(row) if isinstance(row, dict) else json.loads(row)
            working["tenant_id"] = tenant
            result = mutator(working)
            # Tenant identity is repository-owned and cannot be changed by a mutator.
            working["tenant_id"] = tenant
            connection.execute(
                text(
                    "UPDATE aegis_claims "
                    "SET status=:status, updated_at=COALESCE(:updated_at, NOW()), dossier=CAST(:dossier AS JSONB) "
                    "WHERE tenant_id=:tenant_id AND claim_id=:claim_id"
                ),
                {
                    "tenant_id": tenant,
                    "claim_id": claim_id,
                    "status": working.get("status", "SUBMITTED"),
                    "updated_at": working.get("updated_at"),
                    "dossier": json.dumps(working),
                },
            )
            return copy.deepcopy(result)

    def replace(self, claim: dict[str, Any], tenant_id: str | None = None) -> dict[str, Any]:
        tenant = self._resolve_tenant(tenant_id)
        claim = copy.deepcopy(claim)
        claim["tenant_id"] = tenant
        with self.engine.begin() as connection:
            self._bind_tenant(connection, tenant)
            connection.execute(
                text(
                    """
                    INSERT INTO aegis_claims (tenant_id, claim_id, status, updated_at, dossier)
                    VALUES (:tenant_id, :claim_id, :status, COALESCE(:updated_at, NOW()), CAST(:dossier AS JSONB))
                    ON CONFLICT (tenant_id, claim_id)
                    DO UPDATE SET status=EXCLUDED.status, updated_at=EXCLUDED.updated_at, dossier=EXCLUDED.dossier
                    """
                ),
                {
                    "tenant_id": tenant,
                    "claim_id": claim["claim_id"],
                    "status": claim.get("status", "SUBMITTED"),
                    "updated_at": claim.get("updated_at"),
                    "dossier": json.dumps(claim),
                },
            )
        return claim

    def count(self, tenant_id: str | None = None) -> int:
        tenant = self._resolve_tenant(tenant_id)
        with self.engine.begin() as connection:
            self._bind_tenant(connection, tenant)
            return int(
                connection.execute(
                    text("SELECT COUNT(*) FROM aegis_claims WHERE tenant_id=:tenant_id"),
                    {"tenant_id": tenant},
                ).scalar_one()
            )
