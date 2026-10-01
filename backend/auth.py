"""Authentication and tenant authorization boundary.

Demo mode preserves the current prototype user IDs. JWT/OIDC modes require a
server-verified token and never trust tenant or actor values from request JSON.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from typing import Any

from fastapi import HTTPException, Request, status

from backend.config import ConfigurationError, Settings
from backend.product import team_member


@dataclass(frozen=True)
class AuthenticatedPrincipal:
    subject: str
    tenant_id: str
    roles: frozenset[str]
    mfa_verified: bool
    issuer: str | None = None

    def can(self, role: str) -> bool:
        return role in self.roles or "ADMIN" in self.roles


def _decode_segment(segment: str) -> dict[str, Any]:
    padding = "=" * (-len(segment) % 4)
    try:
        return json.loads(base64.urlsafe_b64decode(segment + padding))
    except (ValueError, json.JSONDecodeError) as exc:
        raise ValueError("Malformed JWT") from exc


def _verify_hs256(token: str, secret: str) -> dict[str, Any]:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Malformed JWT")
    header = _decode_segment(parts[0])
    if header.get("alg") != "HS256":
        raise ValueError("Unsupported JWT algorithm")
    expected = base64.urlsafe_b64encode(hmac.new(secret.encode(), f"{parts[0]}.{parts[1]}".encode(), hashlib.sha256).digest()).rstrip(b"=").decode()
    if not hmac.compare_digest(expected, parts[2]):
        raise ValueError("Invalid JWT signature")
    payload = _decode_segment(parts[1])
    if payload.get("exp", 0) < time.time():
        raise ValueError("Expired JWT")
    return payload


def principal_from_request(request: Request, settings: Settings) -> AuthenticatedPrincipal:
    if settings.auth_mode == "demo":
        subject = request.headers.get("X-AEGIS-Actor", "USR_ADMIN_01")
        user = team_member(subject)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown demo actor")
        return AuthenticatedPrincipal(subject=user.user_id, tenant_id=request.headers.get(settings.tenant_header, "TENANT_DEMO"), roles=frozenset({user.role, "DEMO"}), mfa_verified=True)

    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer authentication required")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        if settings.auth_mode == "jwt":
            if not settings.jwt_secret:
                raise ConfigurationError("JWT secret is not configured")
            claims = _verify_hs256(token, settings.jwt_secret)
        elif settings.auth_mode == "oidc":
            # Production deployments should replace this verifier with the configured
            # provider SDK/JWKS cache. The boundary is intentionally explicit rather
            # than silently accepting an unsigned token.
            raise ValueError("OIDC JWKS verifier is not configured in this build")
        else:
            raise ValueError("Unsupported auth mode")
    except (ConfigurationError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token") from exc

    tenant_id = claims.get("tenant_id")
    subject = claims.get("sub")
    roles = claims.get("roles", [])
    if not isinstance(tenant_id, str) or not tenant_id or not isinstance(subject, str) or not subject:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token is missing tenant or subject claims")
    if not isinstance(roles, list):
        roles = [roles]
    mfa = claims.get("amr", [])
    mfa_verified = "mfa" in mfa if isinstance(mfa, list) else bool(claims.get("mfa_verified"))
    if not mfa_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="MFA assurance is required")
    return AuthenticatedPrincipal(subject=subject, tenant_id=tenant_id, roles=frozenset(str(role) for role in roles), mfa_verified=True, issuer=claims.get("iss"))


def require_role(principal: AuthenticatedPrincipal, *roles: str) -> None:
    if not any(principal.can(role) for role in roles):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role for this operation")
