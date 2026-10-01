"""Private evidence storage adapters."""
from __future__ import annotations

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


@dataclass(frozen=True)
class StoredEvidence:
    object_key: str
    content_sha256: str
    byte_size: int
    media_type: str


class EvidenceStore(Protocol):
    def put(self, *, tenant_id: str, claim_id: str, filename: str, content: bytes, media_type: str | None = None) -> StoredEvidence: ...
    def signed_url(self, *, tenant_id: str, object_key: str, expires_in: int) -> str: ...


def object_key(tenant_id: str, claim_id: str, filename: str) -> str:
    clean_tenant = _SAFE_NAME.sub("-", tenant_id).strip(".-")[:80]
    clean_claim = _SAFE_NAME.sub("-", claim_id).strip(".-")[:80]
    clean_name = _SAFE_NAME.sub("-", Path(filename).name).strip(".-")[:160]
    if not clean_tenant or not clean_claim or not clean_name:
        raise ValueError("Evidence filename or scope is invalid")
    return f"tenants/{clean_tenant}/claims/{clean_claim}/{uuid.uuid4().hex}-{clean_name}"


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

    def put(self, *, tenant_id: str, claim_id: str, filename: str, content: bytes, media_type: str | None = None) -> StoredEvidence:
        resolved_type = validate_media(content, filename, media_type)
        key = object_key(tenant_id, claim_id, filename)
        destination = self.root / key
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(content)
        return StoredEvidence(key, hashlib.sha256(content).hexdigest(), len(content), resolved_type)

    def signed_url(self, *, tenant_id: str, object_key: str, expires_in: int) -> str:
        path = (self.root / object_key).resolve()
        if not str(path).startswith(str(self.root)) or not path.is_file():
            raise FileNotFoundError(object_key)
        return f"/api/evidence/local/{object_key}?tenant_id={tenant_id}&expires_in={expires_in}"


class S3EvidenceStore:
    def __init__(self, settings: Settings) -> None:
        import boto3
        self.bucket = settings.storage_bucket
        self.client = boto3.client("s3", endpoint_url=settings.storage_endpoint, region_name=settings.storage_region, aws_access_key_id=settings.storage_access_key_id, aws_secret_access_key=settings.storage_secret_access_key)
        self.ttl = settings.evidence_url_ttl_seconds

    def put(self, *, tenant_id: str, claim_id: str, filename: str, content: bytes, media_type: str | None = None) -> StoredEvidence:
        resolved_type = validate_media(content, filename, media_type)
        key = object_key(tenant_id, claim_id, filename)
        self.client.put_object(Bucket=self.bucket, Key=key, Body=content, ContentType=resolved_type, ServerSideEncryption="AES256")
        return StoredEvidence(key, hashlib.sha256(content).hexdigest(), len(content), resolved_type)

    def signed_url(self, *, tenant_id: str, object_key: str, expires_in: int) -> str:
        expected_prefix = f"tenants/{_SAFE_NAME.sub('-', tenant_id).strip('.-')}/"
        if not object_key.startswith(expected_prefix):
            raise PermissionError("Evidence object is outside the tenant scope")
        return self.client.generate_presigned_url("get_object", Params={"Bucket": self.bucket, "Key": object_key}, ExpiresIn=min(expires_in, self.ttl))


def evidence_store(settings: Settings, root: str | Path) -> EvidenceStore:
    return S3EvidenceStore(settings) if settings.storage_backend == "s3" else LocalEvidenceStore(root)
