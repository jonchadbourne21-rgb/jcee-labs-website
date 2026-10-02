"""Authentication and tenant authorization boundary.

Demo mode preserves the current prototype user IDs. JWT/OIDC modes require a
server-verified token and never trust tenant or actor values from request JSON.
"""
from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import json
import math
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


def _decode_object_segment(segment: str, *, label: str) -> dict[str, Any]:
    padding = "=" * (-len(segment) % 4)
    try:
        decoded = base64.b64decode(segment + padding, altchars=b"-_", validate=True)
        value = json.loads(decoded.decode("utf-8"))
    except (binascii.Error, UnicodeDecodeError, ValueError, json.JSONDecodeError) as exc:
        raise ValueError(f"Malformed JWT {label}") from exc
    if not isinstance(value, dict):
        raise ValueError(f"JWT {label} must be a JSON object")
    return value


def _decode_signature(segment: str) -> bytes:
    padding = "=" * (-len(segment) % 4)
    try:
        return base64.b64decode(segment + padding, altchars=b"-_", validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ValueError("Malformed JWT signature") from exc


def _numeric_date(claims: dict[str, Any], name: str, *, required: bool = False) -> float | None:
    value = claims.get(name)
    if value is None:
        if required:
            raise ValueError(f"JWT {name} is required")
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"JWT {name} must be numeric")
    numeric = float(value)
    if not math.isfinite(numeric):
        raise ValueError(f"JWT {name} must be finite")
    return numeric


def _validate_registered_claims(
    claims: dict[str, Any],
    *,
    expected_issuer: str | None = None,
    expected_audience: str | None = None,
) -> None:
    now = time.time()
    exp = _numeric_date(claims, "exp", required=True)
    assert exp is not None
    if exp <= now:
        raise ValueError("Expired JWT")

    nbf = _numeric_date(claims, "nbf")
    if nbf is not None and nbf > now:
        raise ValueError("JWT is not active yet")

    _numeric_date(claims, "iat")

    issuer = claims.get("iss")
    if issuer is not None and not isinstance(issuer, str):
        raise ValueError("JWT iss must be a string")
    if expected_issuer is not None and issuer != expected_issuer:
        raise ValueError("Unexpected JWT issuer")

    audience = claims.get("aud")
    if audience is None:
        audiences: list[str] = []
    elif isinstance(audience, str) and audience:
        audiences = [audience]
    elif isinstance(audience, list) and all(isinstance(item, str) and item for item in audience):
        audiences = audience
    else:
        raise ValueError("JWT aud must be a string or a list of strings")
    if expected_audience is not None and expected_audience not in audiences:
        raise ValueError("Unexpected JWT audience")


def _verify_hs256(
    token: str,
    secret: str,
    *,
    expected_issuer: str | None = None,
    expected_audience: str | None = None,
) -> dict[str, Any]:
    parts = token.split(".")
    if len(parts) != 3 or not all(parts):
        raise ValueError("Malformed JWT")
    header = _decode_object_segment(parts[0], label="header")
    if header.get("alg") != "HS256":
        raise ValueError("Unsupported JWT algorithm")
    if "typ" in header and header.get("typ") != "JWT":
        raise ValueError("Unsupported JWT type")

    supplied_signature = _decode_signature(parts[2])
    expected_signature = hmac.new(
        secret.encode("utf-8"),
        f"{parts[0]}.{parts[1]}".encode("ascii"),
        hashlib.sha256,
    ).digest()
    if not hmac.compare_digest(expected_signature, supplied_signature):
        raise ValueError("Invalid JWT signature")

    payload = _decode_object_segment(parts[1], label="payload")
    _validate_registered_claims(
        payload,
        expected_issuer=expected_issuer,
        expected_audience=expected_audience,
    )
    return payload


def principal_from_request(request: Request, settings: Settings) -> AuthenticatedPrincipal:
    if settings.auth_mode == "demo":
        subject = request.headers.get("X-AEGIS-Actor", "USR_ADMIN_01")
        user = team_member(subject)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown demo actor")
        return AuthenticatedPrincipal(
            subject=user.user_id,
            tenant_id=request.headers.get(settings.tenant_header, "TENANT_DEMO"),
            roles=frozenset({user.role, "DEMO"}),
            mfa_verified=True,
        )

    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer authentication required")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        if settings.auth_mode == "jwt":
            if not settings.jwt_secret:
                raise ConfigurationError("JWT secret is not configured")
            claims = _verify_hs256(
                token,
                settings.jwt_secret,
                expected_issuer=settings.oidc_issuer,
                expected_audience=settings.oidc_audience,
            )
        elif settings.auth_mode == "oidc":
            # Production deployments intentionally remain fail-closed until the
            # configured issuer's JWKS verifier and cache are implemented.
            raise ValueError("OIDC JWKS verifier is not configured in this build")
        else:
            raise ValueError("Unsupported auth mode")
    except (ConfigurationError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exc

    tenant_id = claims.get("tenant_id")
    subject = claims.get("sub")
    if (
        not isinstance(tenant_id, str)
        or not tenant_id.strip()
        or not isinstance(subject, str)
        or not subject.strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token is missing tenant or subject claims",
        )

    roles_claim = claims.get("roles", [])
    if isinstance(roles_claim, str) and roles_claim:
        roles = [roles_claim]
    elif isinstance(roles_claim, list) and all(
        isinstance(role, str) and role for role in roles_claim
    ):
        roles = roles_claim
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token roles claim is malformed",
        )

    if "amr" in claims:
        amr = claims["amr"]
        if not isinstance(amr, list) or not all(isinstance(item, str) for item in amr):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="MFA assurance claim is malformed",
            )
        mfa_verified = "mfa" in amr
    else:
        mfa_verified = claims.get("mfa_verified") is True
    if not mfa_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="MFA assurance is required",
        )

    issuer = claims.get("iss")
    return AuthenticatedPrincipal(
        subject=subject,
        tenant_id=tenant_id,
        roles=frozenset(roles),
        mfa_verified=True,
        issuer=issuer if isinstance(issuer, str) else None,
    )


def require_role(principal: AuthenticatedPrincipal, *roles: str) -> None:
    if not any(principal.can(role) for role in roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient role for this operation",
        )
