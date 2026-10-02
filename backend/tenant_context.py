"""Tenant context propagation for request and repository boundaries."""
from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
from contextvars import ContextVar

_DEFAULT_TENANT = "TENANT_DEMO"
_current_tenant: ContextVar[str] = ContextVar("aegis_tenant", default=_DEFAULT_TENANT)
_current_actor: ContextVar[str] = ContextVar("aegis_actor", default="SYSTEM")
_current_request_id: ContextVar[str] = ContextVar("aegis_request_id", default="-")
_current_roles: ContextVar[frozenset[str]] = ContextVar("aegis_roles", default=frozenset())


def current_tenant_id() -> str:
    return _current_tenant.get()


def current_actor_id() -> str:
    return _current_actor.get()


def current_request_id() -> str:
    return _current_request_id.get()


def current_roles() -> frozenset[str]:
    return _current_roles.get()


@contextmanager
def bind_request(
    *,
    tenant_id: str,
    actor_id: str,
    request_id: str,
    roles: frozenset[str] | None = None,
) -> Iterator[None]:
    tenant_token = _current_tenant.set(tenant_id)
    actor_token = _current_actor.set(actor_id)
    request_token = _current_request_id.set(request_id)
    roles_token = _current_roles.set(roles or frozenset())
    try:
        yield
    finally:
        _current_tenant.reset(tenant_token)
        _current_actor.reset(actor_token)
        _current_request_id.reset(request_token)
        _current_roles.reset(roles_token)
