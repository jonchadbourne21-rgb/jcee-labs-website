"""Persistence selection for explicit demo/test versus production deployment modes."""
from __future__ import annotations

from pathlib import Path
from typing import Any

from backend.config import Settings
from backend.postgres_storage import PostgresClaimsRepository
from backend.storage import ClaimsRepository


def claims_repository(settings: Settings, data_file: str | Path | None = None) -> Any:
    if settings.database_url:
        return PostgresClaimsRepository(settings.database_url)
    if settings.is_production:
        raise RuntimeError("Production claims persistence requires CLAIMS_DATABASE_URL")
    return ClaimsRepository(data_file or Path("claims_data.json"))
