"""Small dependency-free security controls for the FastAPI boundary."""
from __future__ import annotations

import re
import threading
import time
import uuid
from collections import defaultdict, deque
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
        return {key: "[REDACTED]" if _SECRET_KEYS.search(str(key)) else redact(item) for key, item in value.items()}
    if isinstance(value, list):
        return [redact(item) for item in value]
    return value


class RateLimiter:
    def __init__(self, limit: int, window_seconds: int = 60) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def allowed(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            events = self._events[key]
            while events and events[0] <= now - self.window_seconds:
                events.popleft()
            if len(events) >= self.limit:
                return False
            events.append(now)
            return True


class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: Any, *, settings: Settings, principal_resolver: Any) -> None:
        super().__init__(app)
        self.settings = settings
        self.principal_resolver = principal_resolver
        self.limiter = RateLimiter(settings.rate_limit_per_minute)

    async def dispatch(self, request: Request, call_next: Any) -> Any:
        request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
        client_ip = request.client.host if request.client else "unknown"
        if not self.limiter.allowed(f"{client_ip}:{request.url.path}"):
            return JSONResponse({"detail": "Rate limit exceeded", "request_id": request_id}, status_code=429, headers={"Retry-After": "60", "X-Request-ID": request_id})
        try:
            principal = self.principal_resolver(request)
            with bind_request(
                tenant_id=principal.tenant_id,
                actor_id=principal.subject,
                request_id=request_id,
                roles=principal.roles,
            ):
                response = await call_next(request)
        except HTTPException as exc:
            return JSONResponse({"detail": exc.detail, "request_id": request_id}, status_code=exc.status_code, headers={"WWW-Authenticate": "Bearer"} if exc.status_code == 401 else None)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response
