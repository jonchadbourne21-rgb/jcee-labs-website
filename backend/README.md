# AI Property Claims API

This directory contains a **Python 3.11+ / FastAPI / Pydantic v2** service for an autonomous property-insurance claims prototype. It receives a homeowner intake, produces a deterministic Kitchen Water Damage computer-vision dossier, generates a localized replacement-cost and actual-cash-value estimate, and supports auditable adjuster review or approval.

The service is intentionally a prototype. Its CV results are simulated, its price book is deliberately small, and it does not implement authentication, policy-administration integrations, payment execution, or multi-process claim-database coordination. Settlement approval is proof-gated and evidenced by the supplied frozen VOW 1.1 runtime, but this does not turn the prototype into a production insurance or payment system.

## Run locally

From the repository root, install the package with test dependencies and start Uvicorn:

```bash
uv sync --project backend --extra test
uv run --project backend uvicorn backend.app:app --host 0.0.0.0 --port 8000
```

Alternatively, `python -m backend.app` starts the same service on `0.0.0.0:8000`. The interactive OpenAPI document is available at `/docs`.

## Configuration

| Variable | Default | Purpose |
|---|---:|---|
| `CLAIMS_DATA_FILE` | `backend/claims_data.json` | Absolute or relative JSON persistence path. |
| `CLAIMS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001` | Comma-separated CORS origin allowlist. |
| `VOW_ASSURANCE_DIR` | `backend/.data/vow` | VOW SQLite journal, generated quests, settlement-intent receipts, signed evidence, and signing material. |
| `VOW_ED25519_KEY` | Generated local 32-byte seed | Optional hex-encoded Ed25519 seed supplied through secret management. |
| `VOW_SWEEP_INTERVAL_SECONDS` | `60` | Interval used by `python -m backend.vow_worker`. |
| `PORT` | `8000` | Port used by `python -m backend.app`. |

The persistence repository holds an in-process re-entrant lock across each read-modify-write operation. Writes are performed by flushing and fsyncing a unique temporary file and atomically replacing the target JSON file. This means a process will not expose a partially written file. A single JSON file and in-process lock do **not** provide safe concurrent writes from multiple Uvicorn workers or separate hosts; use one process for this prototype or replace the repository with a database for a scaled deployment.

## API lifecycle

| Method and route | Purpose | Main behavior |
|---|---|---|
| `GET /health` | Liveness | Returns service status, UTC timestamp, local claim count, and frozen VOW integrity metadata. |
| `POST /api/claims/submit` | Homeowner intake | Validates the request and creates a `CLM_…` UUID-backed `claim_id`. |
| `POST /api/claims/{claim_id}/analyze` | AI scoping | Produces the reference CV payload and a canonical estimate. Optional body values can override `zip_code`, `deductible`, and `material_age_years`. |
| `GET /api/claims/{claim_id}` | Dossier retrieval | Returns submission, evidence, stages, telemetry, vision data, estimate, approval state, and audit history. |
| `POST /api/claims/{claim_id}/approve` | Adjuster action | Saves a review (`SAVE_REVIEW`) or proof-gates and approves a settlement (`APPROVE`) after recomputing every aggregate. |
| `GET /api/claims/{claim_id}/assurance/evidence` | Evidence download | Returns the run-scoped, Ed25519-signed VOW evidence pack after approval. |
| `GET /api/claims/{claim_id}/assurance/verify` | Evidence verification | Re-runs the frozen VOW verifier against the evidence pack and pinned public key. |

All returned timestamps use timezone-aware UTC with a `Z` suffix. `404` indicates a missing claim or evidence artifact, `409` indicates an invalid lifecycle transition or failed VOW settlement proof, `503` indicates that assurance evidence could not be produced or verified, and Pydantic produces `422` for malformed request bodies or negative adjustments.

### Example intake and analysis

```bash
curl -sS -X POST http://localhost:8000/api/claims/submit \
  -H 'Content-Type: application/json' \
  -d '{
    "incident_description": "A kitchen supply line burst overnight.",
    "zip_code": "75201",
    "deductible": 1000,
    "material_age_years": 4,
    "peril": "WATER"
  }'

curl -sS -X POST http://localhost:8000/api/claims/CLM_REPLACE_ME/analyze \
  -H 'Content-Type: application/json' -d '{}'
```

The API also accepts UI-oriented aliases such as `incident_brief`, `insured_name`, `loss_address`, evidence `filename`, reviewer `reviewer_notes`, and per-line `id`; their normalized canonical values are persisted in the dossier. Critical enums, including `peril`, approval `decision`, and evidence media type, are controlled.

### Adjuster review or approval

```json
{
  "decision": "SAVE_REVIEW",
  "adjuster_name": "A. Adjuster",
  "notes": "Repriced the measured baseboard length.",
  "line_items": [
    {"zone_id": "ZN_01_BASEBOARD", "quantity": 30, "unit_price": 8.00}
  ]
}
```

Use `"decision": "APPROVE"` to approve the settlement. The request deliberately has no aggregate-total fields. Any UI-supplied `settlement`, line `acv`, or line `depreciation` values are ignored for calculation; the server validates modified monetary/quantity amounts are nonnegative and recomputes line and aggregate values itself. It does not allow an adjuster to change coverage status because coverage is determined by the source semantics: only `SUDDEN_ACCIDENTAL` is included in aggregate values.

For approval, the server renders a claim-specific VOW quest after recalculation. The quest proves analysis completion, confirmed coverage, positive covered replacement cost, payout bounds, a nonnegative deductible, and the human decision. Only then does it execute a keyed settlement-intent effect. The backend verifies the hash-chained journal and a signed evidence pack before changing the claim to `APPROVED`. An exact retry of the same effect key uses VOW's `idempotent_replay` result instead of executing the effect again.

The prototype effect is a local settlement-intent outbox file. It **does not disburse funds**. A production payment flow requires a reviewed provider-specific adapter and authoritative reconciliation.

## VOW recovery worker

Run the worker as a separate long-lived process when the API is started manually:

```bash
uv run --project backend python -m backend.vow_worker
```

The worker calls the frozen `vow sweep` command at a configurable interval. It relies on VOW's heartbeat, atomic run claims, source and engine pinning, and strict replay rules. It never grants pending human approvals. `start.sh` starts and stops this worker automatically with the API and frontend.

## Deterministic Kitchen Water Damage calculation

Analysis returns the exact required CV shape: `claim_id`, `inspection_id`, UTC `timestamp`, telemetry verification, loss summary, one Kitchen room, its dimensions, and four damage zones. Unless a caller supplies analysis overrides, the calculation uses **ZIP 75201**, **$1,000 deductible**, and **material age 4 years**.

The engine preserves the supplied algorithm's semantics exactly:

- `REGIONAL_INDICES` are keyed by the first three ZIP digits; unknown prefixes use `1.0`.
- It rounds the regionalized unit price to cents before calculating RCV, then rounds RCV to cents.
- Depreciation is `min(age / lifespan, 0.50) * material_ratio`, so the 50% cap occurs before the material ratio; depreciation dollars are rounded to cents.
- Remediation has zero depreciation.
- Only zones classified `SUDDEN_ACCIDENTAL` contribute to `gross_rcv`, `total_depreciation`, `net_acv`, and `net_payout`.
- `net_payout` is `max(0, net_acv - deductible)`.
- Unknown price-book candidates are skipped, exactly as in the supplied logic.

At the default assumptions, the four line items produce **$2,105.30 gross RCV**, **$209.79 depreciation**, **$1,895.51 net ACV**, and **$895.51 net payout**.

## Test

```bash
uv run --project backend pytest backend/tests
```

The test suite covers exact default Kitchen totals; regional-index/default behavior; unknown-code skipping; submit/analyze/get/save-review/approve lifecycle; VOW frozen-core integrity; fail-closed proof behavior; keyed-effect idempotent replay; journal verification; signed evidence verification; error responses; CORS; and persisted-document reload/atomic-write behavior.
