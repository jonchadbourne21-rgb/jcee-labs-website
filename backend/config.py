"""Environment-backed configuration for demo and production deployments."""
from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache


class ConfigurationError(RuntimeError):
    """Raised when a production adapter is selected without required settings."""


@dataclass(frozen=True)
class Settings:
    environment: str = "demo"
    database_url: str | None = None
    storage_backend: str = "local"
    storage_bucket: str | None = None
    storage_endpoint: str | None = None
    storage_region: str = "us-east-1"
    storage_access_key_id: str | None = None
    storage_secret_access_key: str | None = None
    auth_mode: str = "demo"
    oidc_issuer: str | None = None
    oidc_audience: str | None = None
    jwt_secret: str | None = None
    tenant_header: str = "X-AEGIS-Tenant"
    payment_provider: str = "mock"
    stripe_secret_key: str | None = None
    stripe_webhook_secret: str | None = None
    rate_limit_per_minute: int = 120
    max_request_bytes: int = 10 * 1024 * 1024
    evidence_url_ttl_seconds: int = 300

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in {"production", "prod", "staging"}

    def validate(self) -> None:
        if self.is_production and not self.database_url:
            raise ConfigurationError("CLAIMS_DATABASE_URL is required outside demo/test mode")
        if self.storage_backend == "s3":
            missing = [name for name, value in (("CLAIMS_S3_BUCKET", self.storage_bucket), ("CLAIMS_S3_ACCESS_KEY_ID", self.storage_access_key_id), ("CLAIMS_S3_SECRET_ACCESS_KEY", self.storage_secret_access_key)) if not value]
            if missing:
                raise ConfigurationError(f"S3 storage requires: {', '.join(missing)}")
        if self.is_production and self.auth_mode != "oidc":
            raise ConfigurationError("CLAIMS_AUTH_MODE=oidc is required outside demo/test mode")
        if self.auth_mode == "oidc" and (not self.oidc_issuer or not self.oidc_audience):
            raise ConfigurationError("OIDC mode requires CLAIMS_OIDC_ISSUER and CLAIMS_OIDC_AUDIENCE")
        if self.auth_mode == "jwt" and not self.jwt_secret:
            raise ConfigurationError("JWT mode requires CLAIMS_JWT_SECRET")
        if self.is_production and self.payment_provider == "mock":
            raise ConfigurationError("Mock payment provider is not allowed outside demo/test mode")
        if self.payment_provider == "stripe" and not self.stripe_secret_key:
            raise ConfigurationError("Stripe payment provider requires STRIPE_SECRET_KEY")

    def redacted(self) -> dict[str, object]:
        return {
            "environment": self.environment,
            "database_configured": bool(self.database_url),
            "storage_backend": self.storage_backend,
            "storage_bucket": self.storage_bucket,
            "auth_mode": self.auth_mode,
            "oidc_issuer": self.oidc_issuer,
            "payment_provider": self.payment_provider,
            "rate_limit_per_minute": self.rate_limit_per_minute,
        }


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError as exc:
        raise ConfigurationError(f"{name} must be an integer") from exc


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings(
        environment=os.getenv("CLAIMS_ENV", "demo"),
        database_url=os.getenv("CLAIMS_DATABASE_URL"),
        storage_backend=os.getenv("CLAIMS_STORAGE_BACKEND", "local").lower(),
        storage_bucket=os.getenv("CLAIMS_S3_BUCKET"),
        storage_endpoint=os.getenv("CLAIMS_S3_ENDPOINT"),
        storage_region=os.getenv("CLAIMS_S3_REGION", "us-east-1"),
        storage_access_key_id=os.getenv("CLAIMS_S3_ACCESS_KEY_ID"),
        storage_secret_access_key=os.getenv("CLAIMS_S3_SECRET_ACCESS_KEY"),
        auth_mode=os.getenv("CLAIMS_AUTH_MODE", "demo").lower(),
        oidc_issuer=os.getenv("CLAIMS_OIDC_ISSUER"),
        oidc_audience=os.getenv("CLAIMS_OIDC_AUDIENCE"),
        jwt_secret=os.getenv("CLAIMS_JWT_SECRET"),
        tenant_header=os.getenv("CLAIMS_TENANT_HEADER", "X-AEGIS-Tenant"),
        payment_provider=os.getenv("CLAIMS_PAYMENT_PROVIDER", "mock").lower(),
        stripe_secret_key=os.getenv("STRIPE_SECRET_KEY"),
        stripe_webhook_secret=os.getenv("STRIPE_WEBHOOK_SECRET"),
        rate_limit_per_minute=_int_env("CLAIMS_RATE_LIMIT_PER_MINUTE", 120),
        max_request_bytes=_int_env("CLAIMS_MAX_REQUEST_BYTES", 10 * 1024 * 1024),
        evidence_url_ttl_seconds=_int_env("CLAIMS_EVIDENCE_URL_TTL_SECONDS", 300),
    )
    settings.validate()
    return settings
