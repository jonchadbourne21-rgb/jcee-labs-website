# Aegis ClaimOS frontend

A Next.js 15 App Router frontend for an autonomous property insurance claims lifecycle. It provides a pre-populated **Kitchen Water Damage** intake, evidence telemetry, API-backed analysis progress, editable adjuster review, VOW proof-gated authorization, and approval confirmation with signed evidence access.

## Run locally

```bash
pnpm install
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000). Configure the backend with `NEXT_PUBLIC_API_URL`; it defaults to `http://localhost:8000`.

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 pnpm dev
```

## API integration

The UI calls these backend endpoints directly:

| Action | Endpoint | Request intent |
|---|---|---|
| Submit intake | `POST /api/claims/submit` | Claim details plus attached-evidence metadata |
| Start analysis | `POST /api/claims/{id}/analyze` | Begins backend claim analysis after a successful submit |
| Approve | `POST /api/claims/{id}/approve` | Edited quantity/unit-price line items and reviewer note; the backend recomputes totals and runs VOW assurance |
| Download evidence | `GET /api/claims/{id}/assurance/evidence` | Fetch the signed VOW evidence pack after approval |
| Verify evidence | `GET /api/claims/{id}/assurance/verify` | Re-run the frozen VOW verifier and show its JSON result |

The submit response must contain `claim_id`, `id`, or `claim.id`. API failures are visible in the workspace with a retry action. Agent statuses are only advanced after the relevant API call succeeds; the interface does not create a fake backend result. The approval page reads VOW assurance metadata from the approved dossier and does not synthesize receipt identifiers, hashes, or verification status.

## Validate

```bash
pnpm typecheck
pnpm build
```

The source image lives at `public/kitchen-water-damage.jpg` and is rendered using `next/image` in intake and review.
