"""Run: python backend/tests/capacity_smoke.py --base-url http://127.0.0.1:8000 --duration 30 --concurrency 8"""
from __future__ import annotations

import argparse
import json
import statistics
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor


def request_once(base_url: str) -> tuple[float, int]:
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(f"{base_url.rstrip('/')}/health", timeout=10) as response:
            response.read()
            return (time.perf_counter() - started) * 1000, response.status
    except urllib.error.HTTPError as exc:
        return (time.perf_counter() - started) * 1000, exc.code
    except (urllib.error.URLError, TimeoutError):
        return (time.perf_counter() - started) * 1000, 0


def percentile(values: list[float], value: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(len(ordered) - 1, round((len(ordered) - 1) * value))
    return round(ordered[index], 2)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    parser.add_argument("--duration", type=float, default=30)
    parser.add_argument("--concurrency", type=int, default=8)
    args = parser.parse_args()
    stop_at = time.monotonic() + args.duration
    results: list[tuple[float, int]] = []
    lock = threading.Lock()

    def worker() -> None:
        while time.monotonic() < stop_at:
            result = request_once(args.base_url)
            with lock:
                results.append(result)

    with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        list(pool.map(lambda _: worker(), range(args.concurrency)))
    latencies = [latency for latency, _ in results]
    failures = sum(1 for _, status in results if status < 200 or status >= 300)
    output = {
        "base_url": args.base_url,
        "duration_seconds": args.duration,
        "concurrency": args.concurrency,
        "requests": len(results),
        "errors": failures,
        "error_rate": round(failures / len(results), 4) if results else 1.0,
        "latency_ms": {"p50": percentile(latencies, 0.50), "p95": percentile(latencies, 0.95), "p99": percentile(latencies, 0.99), "mean": round(statistics.mean(latencies), 2) if latencies else 0.0},
    }
    print(json.dumps(output, indent=2))
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
