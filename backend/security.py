"""Small dependency-free security controls for the FastAPI boundary."""
from __future__ import annotations

import re
import time
import uuid
from collections import OrderedDict, deque
from threading import Lock
from typing import Any

from fastapi import Request
from fastapi.exceptions import HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from backend.config import Settings
from backend.tenant_context import bind_request

_SECRET_KEYS = re.compile(r"token|secret|authorization|password|signed_url|private_key|card", re.IGNORECASE)


def redact(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: "[REDACTED]" if _SECRET_KEYS.search(str(key)) else redact(item)
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [redact(item) for item in value]
    return value


class RateLimiter:
    """Bounded in-memory sliding-window limiter for one process."""

    def __init__(self, limit: int, window_seconds: int = 60, max_keys: int = 10_000) -> None:
        if limit <= 0 or window_seconds <= 0 or max_keys <= 0:
            raise ValueError("Rate limiter limits must be positive")
        self.limit = limit
        self.window_seconds = window_seconds
        self.max_keys = max_keys
        self._events: OrderedDict[str, deque[float]] = OrderedDict()
        self._lock = Lock()

    @property
    def key_count(self) -> int:
        with self._lock:
            return len(self._events)

    def allowed(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            events = self._events.get(key)
            if events is None:
                while len(self._events) >= self.max_keys:
                    self._events.popitem(last=False)
                events = deque()
                self._events[key] = events
            else:
                self._events.move_to_end(key)

            while events and events[0] <= now - self.window_seconds:
                events.popleft()
            if len(events) >= self.limit:
                return False
            events.append(now)
            return True


def _apply_security_headers(response: Any, request_id: str) -> Any:
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


def _scope_header(scope: dict[str, Any], name: bytes) -> str | None:
    for key, value in scope.get("headers", []):
        if key.lower() == name:
            return value.decode("latin-1")
    return None


class _RequestBodyTooLarge(Exception):
    pass


class RequestSizeLimitMiddleware:
    """Reject bodies that exceed Settings.max_request_bytes before model parsing."""

    def __init__(self, app: Any, *, settings: Settings) -> None:
        self.app = app
        self.max_request_bytes = settings.max_request_bytes

    async def _respond(
        self,
        scope: dict[str, Any],
        receive: Any,
        send: Any,
        *,
        status_code: int,
        detail: str,
        request_id: str,
    ) -> None:
        response = _apply_security_headers(
            JSONResponse(
                {"detail": detail, "request_id": request_id},
                status_code=status_code,
            ),
            request_id,
        )
        await response(scope, receive, send)

    async def __call__(self, scope: dict[str, Any], receive: Any, send: Any) -> None:
        if scope.get("type") != "http":
            await self.app(scope, receive, send)
            return

        request_id = _scope_header(scope, b"x-request-id") or uuid.uuid4().hex
        content_length = _scope_header(scope, b"content-length")
        if content_length is not None:
            try:
                declared_length = int(content_length)
            except ValueError:
                await self._respond(
                    scope,
                    receive,
                    send,
                    status_code=400,
                    detail="Invalid Content-Length",
                    request_id=request_id,
                )
                return
            if declared_length < 0:
                await self._respond(
                    scope,
                    receive,
                    send,
                    status_code=400,
                    detail="Invalid Content-Length",
                    request_id=request_id,
                )
                return
            if declared_length > self.max_request_bytes:
                await self._respond(
                    scope,
                    receive,
                    send,
                    status_code=413,
                    detail="Request body exceeds configured limit",
                    request_id=request_id,
                )
                return

        observed = 0
        response_started = False

        async def limited_receive() -> dict[str, Any]:
            nonlocal observed
            message = await receive()
            if message.get("type") == "http.request":
                observed += len(message.get("body", b""))
                if observed > self.max_request_bytes:
                    raise _RequestBodyTooLarge
            return message

        async def tracked_send(message: dict[str, Any]) -> None:
            nonlocal response_started
            if message.get("type") == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, limited_receive, tracked_send)
        except _RequestBodyTooLarge:
            if response_started:
                raise
            await self._respond(
                scope,
                receive,
                send,
                status_code=413,
                detail="Request body exceeds configured limit",
                request_id=request_id,
            )


class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: Any, *, settings: Settings, principal_resolver: Any) -> None:
        super().__init__(app)
        self.settings = settings
        self.principal_resolver = principal_resolver
        self.ip_limiter = RateLimiter(settings.rate_limit_per_minute)
        self.principal_limiter = RateLimiter(settings.rate_limit_per_minute)

    @staticmethod
    def _limited(request_id: str) -> Any:
        return _apply_security_headers(
            JSONResponse(
                {"detail": "Rate limit exceeded", "request_id": request_id},
                status_code=429,
                headers={"Retry-After": "60"},
            ),
            request_id,
        )

    async def dispatch(self, request: Request, call_next: Any) -> Any:
        request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
        client_ip = request.client.host if request.client else "unknown"
        if not self.ip_limiter.allowed(client_ip):
            return self._limited(request_id)

        try:
            principal = self.principal_resolver(request)
            principal_key = repr((principal.tenant_id, principal.subject))
            if not self.principal_limiter.allowed(principal_key):
                return self._limited(request_id)
            with bind_request(
                tenant_id=principal.tenant_id,
                actor_id=principal.subject,
                request_id=request_id,
                roles=principal.roles,
            ):
                response = await call_next(request)
        except HTTPException as exc:
            response = JSONResponse(
                {"detail": exc.detail, "request_id": request_id},
                status_code=exc.status_code,
                headers={"WWW-Authenticate": "Bearer"} if exc.status_code == 401 else None,
            )
            return _apply_security_headers(response, request_id)
        return _apply_security_headers(response, request_id)
