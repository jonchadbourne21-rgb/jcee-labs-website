# AEGIS ClaimOS Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move AEGIS ClaimOS from a single-process JSON/demo prototype toward a production-ready service boundary with tenant isolation, PostgreSQL/object-storage adapters, SSO/MFA-ready identity, provider-backed payment adapters, and measurable security/capacity gates.

**Architecture:** Keep the current JSON repository and mock payment mode as explicit local/demo adapters. Add protocol-compatible PostgreSQL, S3-compatible object storage, identity, and payment implementations behind environment-selected factories. Every claim and audit mutation carries a tenant ID and actor context; settlement remains behind the frozen VOW proof gate. No real external payment or identity call is made unless the corresponding provider configuration is complete.

**Tech Stack:** FastAPI, Pydantic v2, SQLAlchemy 2, psycopg, PostgreSQL JSONB, S3-compatible object storage, JWT/OIDC boundary, Stripe-compatible payment adapter, pytest, Ruff, Locust-style HTTP capacity harness.

**Spec:** `docs/AEGIS_PRODUCT_SPEC.md`, `docs/VOW_CLAIMS_INTEGRATION.md`, and this plan.

## Global Constraints

- The frozen VOW 1.1 vendor tree must remain unchanged and its manifest must continue to verify.
- The current Kitchen Water Damage demo must continue to run with local JSON, mock payment, and no external credentials.
- Real payment adapters must fail closed when provider configuration is incomplete.
- Tenant identity must never be inferred from a claim ID, request body, or client-controlled role field.
- Object storage must not expose public buckets; evidence downloads use short-lived signed URLs or authenticated proxy responses.
- No production migration is complete without tests, a rollback path, and an explicit environment checklist.

---

### Task 1: Define configuration and adapter interfaces

**Files:**
- Create: `backend/config.py`
- Create: `backend/adapters.py`
- Modify: `backend/pyproject.toml`
- Test: `backend/tests/test_config.py`

- [ ] Add typed settings for `CLAIMS_DATABASE_URL`, `CLAIMS_STORAGE_BACKEND`, `CLAIMS_S3_BUCKET`, `CLAIMS_S3_ENDPOINT`, `CLAIMS_S3_REGION`, `CLAIMS_S3_ACCESS_KEY_ID`, `CLAIMS_S3_SECRET_ACCESS_KEY`, `CLAIMS_AUTH_MODE`, `CLAIMS_OIDC_ISSUER`, `CLAIMS_OIDC_AUDIENCE`, `CLAIMS_JWT_SECRET`, `CLAIMS_PAYMENT_PROVIDER`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLAIMS_TENANT_HEADER`, and `CLAIMS_RATE_LIMIT_PER_MINUTE`.
- [ ] Add `ClaimsStore` and `EvidenceStore` protocols with explicit tenant parameters.
- [ ] Add `PaymentProvider` protocol returning an immutable payment instruction with provider, idempotency key, amount, currency, and status.
- [ ] Test demo defaults, production validation, secret redaction, and fail-closed provider selection.
- [ ] Run `uv run --project backend --extra test pytest backend/tests/test_config.py`.

### Task 2: Add tenant-scoped PostgreSQL persistence

**Files:**
- Create: `backend/postgres_storage.py`
- Create: `backend/migrations/001_claims.sql`
- Modify: `backend/storage.py`
- Modify: `backend/app.py`
- Modify: `backend/pyproject.toml`
- Test: `backend/tests/test_tenant_isolation.py`

- [ ] Create PostgreSQL tables for `tenants`, `claims`, `claim_events`, and `claim_evidence` with tenant-qualified primary/unique keys, timestamps, JSONB dossiers, and indexes on `(tenant_id, updated_at)` and `(tenant_id, status)`.
- [ ] Implement `PostgresClaimsRepository` using parameterized SQL, transactions, and `SELECT ... FOR UPDATE` for mutations.
- [ ] Add a repository factory: `CLAIMS_DATABASE_URL` selects PostgreSQL; absent configuration selects JSON only when `CLAIMS_ENV=demo` or `CLAIMS_ENV=test`.
- [ ] Require `tenant_id` in every repository read, list, create, replace, and mutate operation.
- [ ] Test that tenant A cannot read, list, mutate, or replace tenant B’s claim, including identical claim IDs in separate tenants.
- [ ] Run the tests against SQLite-independent fake store tests and validate SQL migration syntax with a parser or a PostgreSQL container when Docker is available.

### Task 3: Add private object-storage evidence adapter

**Files:**
- Create: `backend/object_storage.py`
- Modify: `backend/app.py`
- Modify: `backend/models.py`
- Test: `backend/tests/test_object_storage.py`

- [ ] Implement `LocalEvidenceStore` for demo mode and `S3EvidenceStore` for S3-compatible storage.
- [ ] Store evidence metadata in PostgreSQL and binary content in object storage; never store long-lived public URLs in claim dossiers.
- [ ] Generate tenant- and claim-prefixed object keys with normalized filenames and content-type validation.
- [ ] Return short-lived signed download URLs only after authenticated tenant authorization.
- [ ] Test key isolation, path traversal rejection, MIME/size limits, signed URL expiry configuration, and local-mode compatibility.

### Task 4: Add SSO/OIDC and MFA-ready identity boundary

**Files:**
- Create: `backend/auth.py`
- Create: `backend/tenant_context.py`
- Modify: `backend/app.py`
- Modify: `backend/models.py`
- Test: `backend/tests/test_auth.py`

- [ ] Add `AuthenticatedPrincipal` containing subject, tenant ID, roles, MFA assurance, issuer, and token expiry.
- [ ] In demo mode, allow the existing fixed demo users only when `CLAIMS_AUTH_MODE=demo`.
- [ ] In OIDC mode, validate issuer, audience, signature, expiry, and required MFA assurance claim before accepting a request.
- [ ] Reject client-supplied actor IDs and tenant IDs when an authenticated principal exists.
- [ ] Apply role checks to claim assignment, approval, payment, evidence download, and tenant administration routes.
- [ ] Test expired tokens, wrong issuer/audience, missing MFA assurance, cross-tenant tokens, insufficient roles, and demo compatibility.

### Task 5: Add provider-backed payment adapters

**Files:**
- Create: `backend/payments.py`
- Modify: `backend/app.py`
- Modify: `backend/models.py`
- Test: `backend/tests/test_payments.py`

- [ ] Implement `MockPaymentProvider` for local demo mode.
- [ ] Implement `StripePaymentProvider` using server-side credentials, claim-scoped idempotency keys, amount/currency validation, and no card-data handling.
- [ ] Persist provider intent IDs and payment state transitions in the claim event ledger.
- [ ] Reject payment scheduling unless the claim is VOW-approved, tenant-authorized, and the provider is configured.
- [ ] Add webhook signature verification and monotonic payment-state transitions.
- [ ] Test idempotent retries, provider errors, invalid webhook signatures, duplicate webhooks, amount mismatch, and fail-closed missing credentials using mocked provider responses only.

### Task 6: Add API security controls and audit protections

**Files:**
- Create: `backend/security.py`
- Modify: `backend/app.py`
- Modify: `backend/storage.py`
- Modify: `frontend/lib/api.ts`
- Test: `backend/tests/test_security.py`

- [ ] Add request ID middleware, structured security logging, trusted-origin configuration, and security response headers.
- [ ] Add bounded per-principal/per-IP rate limiting with an in-memory demo implementation and a documented Redis production seam.
- [ ] Redact tokens, payment secrets, signed URLs, and evidence content from logs.
- [ ] Make audit events append-only at the API boundary and attach tenant, actor, request ID, event hash, and source IP metadata.
- [ ] Add maximum body-size enforcement and evidence upload limits.
- [ ] Test CORS allowlist behavior, rate-limit responses, request ID propagation, header presence, log redaction, and audit immutability.

### Task 7: Add capacity and resilience harness

**Files:**
- Create: `backend/tests/capacity_smoke.py`
- Create: `scripts/capacity-smoke.sh`
- Create: `deploy/production/README.md`
- Modify: `backend/README.md`

- [ ] Add a repeatable HTTP smoke harness for health, dashboard, claims list, claim read, and read-only evidence verification.
- [ ] Measure p50/p95/p99 latency, error rate, and concurrency with configurable base URL, tenant token, duration, and concurrency.
- [ ] Add database migration, backup, restore, object-storage lifecycle, secret rotation, and rollback procedures.
- [ ] Document PostgreSQL connection pooling, worker counts, reverse-proxy limits, health/readiness probes, and VOW worker recovery behavior.
- [ ] Define release gates: zero cross-tenant access findings, zero payment idempotency violations, VOW manifest verified, p95 read latency target recorded, and successful restore drill.

### Task 8: Full verification and delivery

**Files:**
- Modify: `README.md`
- Modify: `docs/AEGIS_PRODUCT_SPEC.md`
- Modify: `docs/VOW_CLAIMS_INTEGRATION.md`

- [ ] Run Ruff, backend tests, frontend typecheck/build, mobile checks, VOW manifest verification, shell checks, and capacity smoke against demo mode.
- [ ] Run a live demo lifecycle with two tenants and prove tenant separation.
- [ ] Run the migration parser and deployment configuration checks.
- [ ] Record exact commands, timestamps, commit hash, and known gaps in `docs/production-hardening-verification.md`.
- [ ] Commit with the required Manus co-author trailer, push `feat/production-hardening`, and open or update a pull request.
