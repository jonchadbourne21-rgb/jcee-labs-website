# JCEE Labs Website and Aegis ClaimOS Prototype

This repository contains the existing JCEE Labs public website plus an isolated full-stack property insurance claims prototype. The prototype now uses the supplied, immutable **VOW 1.1** release as a proof-gated assurance boundary for settlement approval. The new services do not replace or change the existing Vite/Express application.

## Claims prototype architecture

| Layer | Directory | Technology | Default URL |
| --- | --- | --- | --- |
| Claims API | `backend/` | FastAPI, Pydantic v2, JSON persistence | `http://localhost:8000` |
| Claims interface | `frontend/` | Next.js App Router, React, Tailwind CSS | `http://localhost:3000` |
| Field and policyholder app | `mobile/` | Expo SDK 54, Expo Router, React Native | `http://localhost:8081` (web development) |
| Settlement assurance | `vendor/vow-1.1/`, `backend/vow_assurance.py` | Frozen VOW runtime, hash-chained journal, Ed25519 evidence | Internal |
| Recovery worker | `backend/vow_worker.py` | Persistent VOW sweeper | Internal |
| Existing JCEE site | root, `client/`, `server/` | Vite, React, Express | Existing root scripts |

The claims prototype ships with a pre-populated **Kitchen Water Damage** scenario. Its full workflow is:

1. **Intake:** review or edit the incident details, telemetry, peril, ZIP code, deductible, and material age.
2. **AI processing:** submit the claim and run the deterministic five-stage simulated analysis pipeline.
3. **Adjuster review:** inspect evidence overlays, coverage signals, line items, and RCV/ACV calculations.
4. **Approval:** edit quantities or rates if necessary, add review notes, and authorize the settlement through VOW's proof and capability gates.
5. **Payment control:** finance schedules and marks a mock payment instruction sent, then operations closes the claim. No funds move in this prototype.

The pricing engine uses the supplied Xactimate-style price book, ZIP-prefix regional multipliers, material-only depreciation, coverage filter, deductible, and payout calculation directly in the FastAPI service. It does not use an external AI or pricing API. VOW does not replace this logic; it controls the consequential settlement effect after server-side recalculation and emits independently verifiable evidence.

See [VOW 1.1 Integration for Aegis ClaimOS](docs/VOW_CLAIMS_INTEGRATION.md) for the package assessment, architecture, evidence flow, frozen-core boundary, corrected deployment reference, and production limitations.

## Run the integrated stack

Prerequisites are Python 3.11 or newer, [`uv`](https://docs.astral.sh/uv/), Node.js 20 or newer, and `pnpm`.

```bash
chmod +x start.sh
./start.sh
```

The launcher installs locked dependencies, starts FastAPI on port `8000`, starts Next.js on port `3000`, starts the persistent VOW recovery worker, and stops all processes together when interrupted. Ports, the browser-facing API URL, VOW data directory, and sweep interval are configurable:

```bash
BACKEND_PORT=8100 FRONTEND_PORT=3100 \
NEXT_PUBLIC_API_URL=http://localhost:8100 \
VOW_ASSURANCE_DIR="$PWD/backend/.data/vow" \
VOW_SWEEP_INTERVAL_SECONDS=60 ./start.sh
```

Then open [http://localhost:3000](http://localhost:3000). Interactive API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

To run **API, VOW worker, Next.js/PWA, and Expo web/native development together**:

```bash
chmod +x start-all.sh
./start-all.sh
```

This starts the Expo development server on port `8081` in addition to the services above. For a physical device, set the API URL to a LAN-reachable address before launching Expo:

```bash
BACKEND_PORT=8100 FRONTEND_PORT=3100 MOBILE_PORT=8181 \
NEXT_PUBLIC_API_URL=http://192.168.1.50:8100 \
EXPO_PUBLIC_API_URL=http://192.168.1.50:8100 ./start-all.sh
```

Open the web/PWA at port `3000` (or `3100` above). In Expo Go, scan the QR code printed by the Expo server; use `pnpm --dir mobile ios`, `pnpm --dir mobile android`, or `pnpm --dir mobile web` for direct development.

## Run services separately

### Backend

```bash
cd backend
uv sync --extra test
uv run uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

To run backend tests:

```bash
cd backend
uv run --extra test pytest tests
```

Set `CLAIMS_DATA_FILE` to override the default local JSON persistence path. See `backend/README.md` for API request details.

To run the recovery worker separately:

```bash
uv run --project backend python -m backend.vow_worker
```

### Frontend

```bash
cd frontend
pnpm install --frozen-lockfile
NEXT_PUBLIC_API_URL=http://localhost:8000 pnpm dev
```

To validate a production build:

```bash
cd frontend
pnpm typecheck
pnpm build
```

See `frontend/README.md` for interface details and environment configuration.

### Mobile app

```bash
cd mobile
pnpm install --frozen-lockfile
EXPO_PUBLIC_API_URL=http://localhost:8000 pnpm start
```

Use `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm build:web` to validate the native client and its static web target. See `mobile/README.md` for emulator, Expo Go, LAN, and offline-queue instructions.

## Claims API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Service and persistence health check |
| `POST` | `/api/claims/submit` | Create an intake record and claim ID |
| `POST` | `/api/claims/{claim_id}/analyze` | Generate CV telemetry and calculate the estimate |
| `GET` | `/api/claims/{claim_id}` | Retrieve the complete claim dossier |
| `POST` | `/api/claims/{claim_id}/approve` | Save adjuster changes or approve settlement |
| `GET` | `/api/dashboard` | Portfolio metrics, status distribution, activity, and workload |
| `GET` | `/api/claims` | Searchable and filterable claim queue |
| `GET` | `/api/team` | Demo team and workload identities |
| `POST` | `/api/demo/reset` | Reset the pre-analyzed Kitchen Water Damage claim |
| `POST` | `/api/claims/{claim_id}/assign` | Assign field and desk adjusters |
| `POST` | `/api/claims/{claim_id}/tasks` | Add a claim task |
| `POST` | `/api/claims/{claim_id}/tasks/{task_id}/complete` | Complete a task |
| `POST` | `/api/claims/{claim_id}/notes` | Add an internal or policyholder-visible note |
| `POST` | `/api/claims/{claim_id}/status` | Move through controlled non-financial workflow states |
| `POST` | `/api/claims/{claim_id}/payment` | Schedule or mark the mock payment instruction sent |
| `POST` | `/api/claims/{claim_id}/evidence` | Upload validated evidence to private local/S3-compatible storage |
| `GET` | `/api/claims/{claim_id}/assurance/evidence` | Download the signed VOW evidence pack |
| `GET` | `/api/claims/{claim_id}/assurance/verify` | Re-run independent VOW evidence verification |

## Existing JCEE Labs site

The original public site remains available through the root package scripts:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Its existing checks remain unchanged and can be run with `pnpm release:check`.

## Production hardening

The backend now has explicit adapter boundaries for tenant-scoped PostgreSQL persistence, private local/S3-compatible evidence storage, JWT/OIDC-ready authentication with MFA assurance, provider-backed payments, request IDs, security headers, rate limiting, and capacity smoke testing. The default demo remains credential-free and uses local JSON, local evidence files, demo users, and mock payments.

For deployment configuration, migration/rollback procedures, and release gates, read [`deploy/production/README.md`](deploy/production/README.md) and [`docs/production-hardening-verification.md`](docs/production-hardening-verification.md). Apply the PostgreSQL schema from [`backend/migrations/001_claims.sql`](backend/migrations/001_claims.sql). Run a staging capacity check with:

```bash
./scripts/capacity-smoke.sh --base-url http://127.0.0.1:8000 --duration 30 --concurrency 8
```

Production mode is fail-closed: it requires `CLAIMS_DATABASE_URL`, `CLAIMS_AUTH_MODE=oidc`, private S3 settings, and a non-mock payment provider. No production credentials are committed or required for the Kitchen Water Damage demo.
