# AEGIS ClaimOS Production Runbook

## Deployment shape

Run FastAPI behind a TLS-terminating reverse proxy with multiple Uvicorn workers. Use PostgreSQL for tenant-scoped dossier JSONB and a private S3-compatible bucket for binary evidence. The migration also defines normalized event/evidence tables, but this build does not yet populate them and therefore does not claim an append-only normalized audit ledger. Run the VOW recovery worker as a separately supervised process. Apply migrations with an owner/migration role, but run the API with a separate non-owner PostgreSQL role that has no BYPASSRLS privilege. Runtime code does not create or repair schema. The Next.js/PWA and Expo clients must use the API's public origin and never receive database, object-storage, payment, or OIDC client secrets.

## Required configuration

Set `CLAIMS_ENV=production`, `CLAIMS_DATABASE_URL`, `CLAIMS_STORAGE_BACKEND=s3`, `CLAIMS_S3_BUCKET`, `CLAIMS_S3_REGION`, `CLAIMS_S3_ACCESS_KEY_ID`, `CLAIMS_S3_SECRET_ACCESS_KEY`, `CLAIMS_AUTH_MODE=oidc`, `CLAIMS_OIDC_ISSUER`, `CLAIMS_OIDC_AUDIENCE`, `CLAIMS_PAYMENT_PROVIDER=stripe`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLAIMS_ALLOWED_ORIGINS`, and a bounded `CLAIMS_RATE_LIMIT_PER_MINUTE`. Inject secrets from the deployment secret manager; do not commit `.env` files. These settings only select the production seams: this build still refuses real payment scheduling and manual completion until a supported disbursement adapter and verified reconciliation/webhook path are implemented.

## Migration and rollback

1. Take a PostgreSQL snapshot and an object-store inventory before migration.
2. Apply `backend/migrations/001_claims.sql` using a migration runner with transactional DDL where supported.
3. Backfill dossiers from the JSON export into `aegis_claims`, preserving `tenant_id=TENANT_DEMO` for legacy records and recording a migration event for each imported claim.
4. Upload binary evidence, verify SHA-256 hashes, and replace long-lived media URLs with private object keys.
5. Deploy one **read-only** canary using `CLAIMS_DATABASE_URL`; compare claim counts, status distributions, and VOW verification results against the JSON source.
6. Before enabling writes, record a cutover checkpoint identifying the authoritative PostgreSQL snapshot, object inventory, and source JSON snapshot. A read-only canary may be rolled back simply by routing traffic to the prior application.
7. Enable writes only after the canary and restore drill pass. Once any post-cutover write is accepted, the old JSON snapshot is stale and must **not** become authoritative by traffic switch alone.
8. A post-write rollback requires a write freeze, inventory of accepted PostgreSQL/object-store changes, reconciliation of any external-effect receipts, and a new coherent recovery/export point before traffic moves. Never delete PostgreSQL/object-storage evidence as part of rollback, and never represent a provider-side effect as undone merely because application traffic moved.

## Operational gates

The release is blocked if any cross-tenant read or mutation is observed, if payment idempotency keys are not stable across retries, if the VOW frozen manifest differs, if evidence buckets are public, if MFA assurance is absent, or if the restore drill fails. The in-process rate limiter is bounded but process-local; production promotion also requires a shared limiter or equivalent reverse-proxy enforcement across workers.\n\nRun `scripts/capacity-smoke.sh` against staging with the same authentication boundary and a rate-limit setting appropriate to the intended test load. Set `CLAIMS_CAPACITY_TOKEN` rather than placing a bearer token in shell history. The harness exercises health, dashboard, and claim-list reads, optionally a claim read and assurance verification, reports per-endpoint and overall p50/p95/p99 latency, and treats 401/403/429/network errors as failures. A run with zero samples is an error, never a PASS.

## Backup and recovery

Use point-in-time PostgreSQL recovery and daily encrypted snapshots. Enable object-store versioning and lifecycle policies. Rotate database, object-store, OIDC, and Stripe secrets independently. The VOW recovery worker must restart safely and replay only claim-scoped idempotent effects; container restart is not a scheduler.
