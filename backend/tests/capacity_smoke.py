"""Bounded read-only staging capacity smoke harness."""
from __future__ import annotations

import argparse
import json
import os
import statistics
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor


def request_once(
    base_url: str,
    path: str,
    *,
    token: str | None,
    timeout: float,
) -> tuple[str, float, int]:
    started = time.perf_counter()
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}{path}",
        headers=headers,
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            response.read()
            return path, (time.perf_counter() - started) * 1000, response.status
    except urllib.error.HTTPError as exc:
        exc.read()
        return path, (time.perf_counter() - started) * 1000, exc.code
    except (urllib.error.URLError, TimeoutError):
        return path, (time.perf_counter() - started) * 1000, 0


def percentile(values: list[float], value: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(len(ordered) - 1, round((len(ordered) - 1) * value))
    return round(ordered[index], 2)


def latency_summary(values: list[float]) -> dict[str, float]:
    return {
        "p50": percentile(values, 0.50),
        "p95": percentile(values, 0.95),
        "p99": percentile(values, 0.99),
        "mean": round(statistics.mean(values), 2) if values else 0.0,
    }


def target_paths(claim_id: str | None, verify_claim_id: str | None) -> list[str]:
    targets = ["/health", "/api/dashboard", "/api/claims?limit=1"]
    if claim_id:
        targets.append(f"/api/claims/{urllib.parse.quote(claim_id, safe='')}")
    if verify_claim_id:
        encoded = urllib.parse.quote(verify_claim_id, safe="")
        targets.append(f"/api/claims/{encoded}/assurance/verify")
    return targets


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    parser.add_argument("--duration", type=float, default=30)
    parser.add_argument("--concurrency", type=int, default=8)
    parser.add_argument("--timeout", type=float, default=10)
    parser.add_argument("--claim-id")
    parser.add_argument("--verify-claim-id")
    parser.add_argument(
        "--token",
        default=os.getenv("CLAIMS_CAPACITY_TOKEN"),
        help="Bearer token; defaults to CLAIMS_CAPACITY_TOKEN and is never printed",
    )
    args = parser.parse_args()
    if args.duration <= 0:
        parser.error("--duration must be > 0")
    if args.concurrency <= 0:
        parser.error("--concurrency must be > 0")
    if args.timeout <= 0:
        parser.error("--timeout must be > 0")
    if not args.base_url.startswith(("http://", "https://")):
        parser.error("--base-url must start with http:// or https://")

    targets = target_paths(args.claim_id, args.verify_claim_id)
    stop_at = time.monotonic() + args.duration
    results: list[tuple[str, float, int]] = []
    lock = threading.Lock()

    def worker(worker_index: int) -> None:
        index = worker_index
        while time.monotonic() < stop_at:
            path = targets[index % len(targets)]
            result = request_once(
                args.base_url,
                path,
                token=args.token,
                timeout=args.timeout,
            )
            with lock:
                results.append(result)
            index += args.concurrency

    with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        list(pool.map(worker, range(args.concurrency)))

    if not results:
        print(json.dumps({
            "status": "NO_SAMPLES",
            "base_url": args.base_url,
            "duration_seconds": args.duration,
            "concurrency": args.concurrency,
            "authenticated": bool(args.token),
            "targets": targets,
            "requests": 0,
            "errors": 0,
            "error_rate": None,
        }, indent=2))
        raise SystemExit(2)

    statuses = Counter(status for _, _, status in results)
    failures = sum(1 for _, _, status in results if status < 200 or status >= 300)
    latencies = [latency for _, latency, _ in results]
    by_endpoint: dict[str, dict[str, object]] = {}
    for path in targets:
        endpoint_results = [
            (latency, status)
            for result_path, latency, status in results
            if result_path == path
        ]
        endpoint_latencies = [latency for latency, _ in endpoint_results]
        endpoint_failures = sum(
            1 for _, status in endpoint_results if status < 200 or status >= 300
        )
        by_endpoint[path] = {
            "requests": len(endpoint_results),
            "errors": endpoint_failures,
            "error_rate": (
                round(endpoint_failures / len(endpoint_results), 4)
                if endpoint_results else None
            ),
            "latency_ms": latency_summary(endpoint_latencies),
        }

    output = {
        "status": "PASS" if failures == 0 else "FAIL",
        "base_url": args.base_url,
        "duration_seconds": args.duration,
        "concurrency": args.concurrency,
        "authenticated": bool(args.token),
        "targets": targets,
        "requests": len(results),
        "errors": failures,
        "error_rate": round(failures / len(results), 4),
        "rate_limited": statuses.get(429, 0),
        "authentication_failures": statuses.get(401, 0) + statuses.get(403, 0),
        "status_counts": {str(code): count for code, count in sorted(statuses.items())},
        "latency_ms": latency_summary(latencies),
        "endpoints": by_endpoint,
    }
    print(json.dumps(output, indent=2))
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
