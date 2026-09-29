"""Persistent recovery worker for VOW-journaled claim assurance runs."""
from __future__ import annotations

import json
import os
import signal
import threading
from datetime import UTC, datetime
from typing import Any

from backend.vow_assurance import (
    VowAssuranceError,
    run_recovery_cycle,
    verify_frozen_core,
)


def utc_now() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def run_worker(*, interval_seconds: float, stop_event: threading.Event | None = None) -> int:
    """Sweep once per interval until SIGTERM/SIGINT requests a clean stop."""
    if interval_seconds <= 0:
        raise ValueError("VOW sweep interval must be positive")
    stopper = stop_event or threading.Event()

    def request_stop(signum: int, _frame: Any) -> None:
        print(json.dumps({"service": "vow-recovery-worker", "event": "shutdown_requested", "signal": signum, "timestamp": utc_now()}), flush=True)
        stopper.set()

    if stop_event is None:
        signal.signal(signal.SIGTERM, request_stop)
        signal.signal(signal.SIGINT, request_stop)

    integrity = verify_frozen_core()
    print(
        json.dumps(
            {
                "service": "vow-recovery-worker",
                "event": "started",
                "timestamp": utc_now(),
                "interval_seconds": interval_seconds,
                "vow_version": integrity["version"],
                "core_manifest_sha256": integrity["manifest_sha256"],
            }
        ),
        flush=True,
    )

    while not stopper.is_set():
        try:
            result = run_recovery_cycle()
            print(json.dumps({"service": "vow-recovery-worker", "event": "sweep", "timestamp": utc_now(), **result}, default=str), flush=True)
        except VowAssuranceError as exc:
            print(json.dumps({"service": "vow-recovery-worker", "event": "sweep_failed", "timestamp": utc_now(), "error": str(exc)}), flush=True)
        stopper.wait(interval_seconds)

    print(json.dumps({"service": "vow-recovery-worker", "event": "stopped", "timestamp": utc_now()}), flush=True)
    return 0


def main() -> int:
    interval = float(os.getenv("VOW_SWEEP_INTERVAL_SECONDS", "60"))
    return run_worker(interval_seconds=interval)


if __name__ == "__main__":
    raise SystemExit(main())
