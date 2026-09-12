# JCEE Labs Website and Aegis ClaimOS Prototype

This repository contains the existing JCEE Labs public website plus an isolated full-stack property insurance claims prototype. The new services do not replace or change the existing Vite/Express application.

## Claims prototype architecture

| Layer | Directory | Technology | Default URL |
| --- | --- | --- | --- |
| Claims API | `backend/` | FastAPI, Pydantic v2, JSON persistence | `http://localhost:8000` |
| Claims interface | `frontend/` | Next.js App Router, React, Tailwind CSS | `http://localhost:3000` |
| Existing JCEE site | root, `client/`, `server/` | Vite, React, Express | Existing root scripts |

The claims prototype ships with a pre-populated **Kitchen Water Damage** scenario. Its full workflow is:

1. **Intake:** review or edit the incident details, telemetry, peril, ZIP code, deductible, and material age.
2. **AI processing:** submit the claim and run the deterministic five-stage simulated analysis pipeline.
3. **Adjuster review:** inspect evidence overlays, coverage signals, line items, and RCV/ACV calculations.
4. **Approval:** edit quantities or rates if necessary, add review notes, and approve the settlement.

The pricing engine uses the supplied Xactimate-style price book, ZIP-prefix regional multipliers, material-only depreciation, coverage filter, deductible, and payout calculation directly in the FastAPI service. It does not use an external AI or pricing API.

## Run both services

Prerequisites are Python 3.11 or newer, [`uv`](https://docs.astral.sh/uv/), Node.js 20 or newer, and `pnpm`.

```bash
chmod +x start.sh
./start.sh
```

The launcher installs locked dependencies, starts FastAPI on port `8000`, starts Next.js on port `3000`, and stops both processes together when interrupted. Ports and the browser-facing API URL are configurable:

```bash
BACKEND_PORT=8100 FRONTEND_PORT=3100 \
NEXT_PUBLIC_API_URL=http://localhost:8100 ./start.sh
```

Then open [http://localhost:3000](http://localhost:3000). Interactive API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Run services separately

### Backend

```bash
uv sync --project backend --extra test
uv run --project backend uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

To run backend tests:

```bash
uv run --project backend pytest backend/tests
```

Set `CLAIMS_DATA_FILE` to override the default local JSON persistence path. See `backend/README.md` for API request details.

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

## Claims API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Service and persistence health check |
| `POST` | `/api/claims/submit` | Create an intake record and claim ID |
| `POST` | `/api/claims/{claim_id}/analyze` | Generate CV telemetry and calculate the estimate |
| `GET` | `/api/claims/{claim_id}` | Retrieve the complete claim dossier |
| `POST` | `/api/claims/{claim_id}/approve` | Save adjuster changes or approve settlement |

## Existing JCEE Labs site

The original public site remains available through the root package scripts:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Its existing checks remain unchanged and can be run with `pnpm release:check`.
