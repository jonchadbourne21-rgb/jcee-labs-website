# Aegis ClaimOS frontend

A Next.js 15 App Router frontend for an autonomous property insurance claims lifecycle. It provides a pre-populated **Kitchen Water Damage** intake, evidence telemetry, API-backed analysis progress, editable adjuster review, and approval confirmation.

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
| Approve | `POST /api/claims/{id}/approve` | Edited quantity/unit-price line items, reviewer note, and settlement totals |

The submit response must contain `claim_id`, `id`, or `claim.id`. API failures are visible in the workspace with a retry action. Agent statuses are only advanced after the relevant API call succeeds; the interface does not create a fake backend result.

## Validate

```bash
pnpm typecheck
pnpm build
```

The source image lives at `public/kitchen-water-damage.jpg` and is rendered using `next/image` in intake and review.
