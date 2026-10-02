"""Private evidence storage adapters."""
from __future__ import annotations

import base64
import hashlib
import mimetypes
import re
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from backend.config import Settings

_SAFE_NAME = re.compile(r"[^A-Za-z0-9._-]+")
_ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "video/mp4", "application/pdf"}
_MAX_SCOPE_BYTES = 256


@dataclass(frozen=True)
class StoredEvidence:
    object_key: str
    content_sha256: str
    byte_size: int
    media_type: str


class EvidenceStore(Protocol):
    def put(
        self,
        *,
        tenant_id: str,
        claim_id: str,
        filename: str,
        content: bytes,
        media_type: str | None = None,
    ) -> StoredEvidence: ...

    def signed_url(
        self,
        *,
        tenant_id: str,
        claim_id: str,
        object_key: str,
        expires_in: int,
    ) -> str: ...


def _scope_segment(value: str, *, label: str) -> str:
    """Encode identity losslessly into a path-safe component.

    Do not normalize, truncate, or replace identity characters: authorization
    scope must remain one-to-one with the authenticated tenant/claim value.
    """
    if not isinstance(value, str) or not value:
        raise ValueError(f"Evidence {label} is invalid")
    raw = value.encode("utf-8")
    if len(raw) > _MAX_SCOPE_BYTES:
        raise ValueError(f"Evidence {label} exceeds {_MAX_SCOPE_BYTES} UTF-8 bytes")
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def evidence_scope_prefix(tenant_id: str, claim_id: str) -> str:
    return (
        f"tenants/{_scope_segment(tenant_id, label='tenant_id')}/"
        f"claims/{_scope_segment(claim_id, label='claim_id')}/"
    )


def object_key(tenant_id: str, claim_id: str, filename: str) -> str:
    clean_name = _SAFE_NAME.sub("-", Path(filename).name).strip(".-")[:160]
    if not clean_name:
        raise ValueError("Evidence filename is invalid")
    return f"{evidence_scope_prefix(tenant_id, claim_id)}{uuid.uuid4().hex}-{clean_name}"


def validate_media(content: bytes, filename: str, media_type: str | None) -> str:
    resolved = (media_type or mimetypes.guess_type(filename)[0] or "application/octet-stream").lower()
    if resolved not in _ALLOWED_TYPES:
        raise ValueError("Unsupported evidence media type")
    if not content:
        raise ValueError("Evidence content cannot be empty")
    if len(content) > 25 * 1024 * 1024:
        raise ValueError("Evidence content exceeds the 25 MB limit")
    return resolved


class LocalEvidenceStore:
    def __init__(self, root: str | Path) -> None:
        self.root = Path(root).expanduser().resolve()

    def put(
        self,
        *,
        tenant_id: str,
        claim_id: str,
        filename: str,
        content: bytes,
        media_type: str | None = None,
    ) -> StoredEvidence:
        resolved_type = validate_media(content, filename, media_type)
        key = object_key(tenant_id, claim_id, filename)
        destination = (self.root / key).resolve()
        try:
            destination.relative_to(self.root)
        except ValueError as exc:
            raise PermissionError("Evidence destination is outside the configured root") from exc
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(content)
        return StoredEvidence(key, hashlib.sha256(content).hexdigest(), len(content), resolved_type)

    def signed_url(
        self,
        *,
        tenant_id: str,
        claim_id: str,
        object_key: str,
        expires_in: int,
    ) -> str:
        # Local demo files currently have no authenticated evidence-download
        # endpoint. Refuse to manufacture a URL that only looks signed.
        raise NotImplementedError("Local evidence delivery requires an authenticated proxy")


class S3EvidenceStore:
    def __init__(self, settings: Settings) -> None:
        import boto3

        self.bucket = settings.storage_bucket
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.storage_endpoint,
            region_name=settings.storage_region,
            aws_access_key_id=settings.storage_access_key_id,
            aws_secret_access_key=settings.storage_secret_access_key,
        )
        self.ttl = settings.evidence_url_ttl_seconds

    def put(
        self,
        *,
        tenant_id: str,
        claim_id: str,
        filename: str,
        content: bytes,
        media_type: str | None = None,
    ) -> StoredEvidence:
        resolved_type = validate_media(content, filename, media_type)
        key = object_key(tenant_id, claim_id, filename)
        self.client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=content,
            ContentType=resolved_type,
            ServerSideEncryption="AES256",
        )
        return StoredEvidence(key, hashlib.sha256(content).hexdigest(), len(content), resolved_type)

    def signed_url(
        self,
        *,
        tenant_id: str,
        claim_id: str,
        object_key: str,
        expires_in: int,
    ) -> str:
        expected_prefix = evidence_scope_prefix(tenant_id, claim_id)
        if not object_key.startswith(expected_prefix):
            raise PermissionError("Evidence object is outside the authorized tenant/claim scope")
        if expires_in <= 0:
            raise ValueError("Evidence URL expiry must be positive")
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": object_key},
            ExpiresIn=min(expires_in, self.ttl),
        )


def evidence_store(settings: Settings, root: str | Path) -> EvidenceStore:
    return S3EvidenceStore(settings) if settings.storage_backend == "s3" else LocalEvidenceStore(root)
