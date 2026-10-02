# AEGIS ClaimOS Production Runbook

## Deployment shape

Run FastAPI behind a TLS-terminating reverse proxy with multiple Uvicorn workers. Use PostgreSQL for dossiers, events, tenants, and evidence metadata; use a private S3-compatible bucket for binary evidence; and run the VOW recovery worker as a separately supervised process. Apply migrations with an owner/migration role, but run the API with a separate non-owner PostgreSQL role that has no BYPASSRLS privilege. Runtime code does not create or repair schema. The Next.js/PWA and Expo clients must use the API's public origin and never receive database, object-storage, payment, or OIDC client secrets.

## Required configuration

Set `CLAIMS_ENV=production`, `CLAIMS_DATABASE_URL`, `CLAIMS_STORAGE_BACKEND=s3`, `CLAIMS_S3_BUCKET`, `CLAIMS_S3_REGION`, `CLAIMS_S3_ACCESS_KEY_ID`, `CLAIMS_S3_SECRET_ACCESS_KEY`, `CLAIMS_AUTH_MODE=oidc`, `CLAIMS_OIDC_ISSUER`, `CLAIMS_OIDC_AUDIENCE`, `CLAIMS_PAYMENT_PROVIDER=stripe`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLAIMS_ALLOWED_ORIGINS`, and a bounded `CLAIMS_RATE_LIMIT_PER_MINUTE`. Inject secrets from the deployment secret manager; do not commit `.env` files. These settings only select the production seams: this build still refuses real payment scheduling and manual completion until a supported disbursement adapter and verified reconciliation/webhook path are implemented.

## Migration and rollback

1. Take a PostgreSQL snapshot and an object-store inventory before migration.
2. Apply `backend/migrations/001_claims.sql` using a migration runner with transactional DDL where supported.
3. Backfill dossiers from the JSON export into `aegis_claims`, preserving `tenant_id=TENANT_DEMO` for legacy records and recording a migration event for each imported claim.
4. Upload binary evidence, verify SHA-256 hashes, and replace long-lived media URLs with private object keys.
5. Deploy one read-only canary using `CLAIMS_DATABASE_URL`; compare claim counts, status distributions, and VOW verification results against the JSON source.
6. Enable writes only after the canary and restore drill pass.
7. Roll back by switching traffic to the prior application and JSON snapshot; never delete PostgreSQL or object-storage data as part of a failed deploy.

## Operational gates

The release is blocked if any cross-tenant read or mutation is observed, if payment idempotency keys are not stable across retries, if the VOW frozen manifest differs, if evidence buckets are public, if MFA assurance is absent, or if the restore drill fails. Record p50/p95/p99 latency and error rate from `scripts/capacity-smoke.sh` against a staging deployment before production promotion.

## Backup and recovery

Use point-in-time PostgreSQL recovery and daily encrypted snapshots. Enable object-store versioning and lifecycle policies. Rotate database, object-store, OIDC, and Stripe secrets independently. The VOW recovery worker must restart safely and replay only claim-scoped idempotent effects; container restart is not a scheduler.
