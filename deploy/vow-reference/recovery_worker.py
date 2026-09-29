"""Persistent VOW recovery worker for the local/integration reference stack."""
from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
import threading
from datetime import UTC, datetime


STOP = threading.Event()
VOW_CLI = "/opt/vow/vow_cli.py"


def now() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def stop(signum: int, _frame: object) -> None:
    print(json.dumps({"service": "vow-recovery-worker", "event": "shutdown_requested", "signal": signum, "timestamp": now()}), flush=True)
    STOP.set()


def sweep(postgres_dsn: str, stale_after: float) -> int:
    completed = subprocess.run(
        [
            sys.executable,
            VOW_CLI,
            "sweep",
            "--crashed",
            "--stale-after",
            str(stale_after),
            "--postgres",
            postgres_dsn,
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    payload = {
        "service": "vow-recovery-worker",
        "event": "sweep",
        "timestamp": now(),
        "exit_code": completed.returncode,
    }
    if completed.stdout.strip():
        try:
            payload["result"] = json.loads(completed.stdout)
        except json.JSONDecodeError:
            payload["result"] = completed.stdout[-1000:]
    if completed.stderr.strip():
        payload["diagnostic"] = completed.stderr[-1000:]
    print(json.dumps(payload, default=str), flush=True)
    return completed.returncode


def main() -> int:
    postgres_dsn = os.environ.get("POSTGRES_DSN", "").strip()
    if not postgres_dsn:
        print(json.dumps({"service": "vow-recovery-worker", "event": "configuration_error", "error": "POSTGRES_DSN is required"}), flush=True)
        return 2
    interval = float(os.environ.get("VOW_SWEEP_INTERVAL_SECONDS", "60"))
    stale_after = float(os.environ.get("VOW_RUN_STALE_SECONDS", "30"))
    if interval <= 0 or stale_after <= 0:
        print(json.dumps({"service": "vow-recovery-worker", "event": "configuration_error", "error": "intervals must be positive"}), flush=True)
        return 2

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    print(json.dumps({"service": "vow-recovery-worker", "event": "started", "timestamp": now(), "interval_seconds": interval}), flush=True)
    while not STOP.is_set():
        sweep(postgres_dsn, stale_after)
        STOP.wait(interval)
    print(json.dumps({"service": "vow-recovery-worker", "event": "stopped", "timestamp": now()}), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
