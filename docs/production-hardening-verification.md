# AEGIS ClaimOS Production-Hardening Verification

**Scope:** PostgreSQL/object-storage migration seams, tenant isolation, SSO/MFA-ready authentication, provider-backed payments, API security controls, and capacity testing.

## Implemented boundary

The application now selects adapters through explicit configuration. Demo/test mode remains local JSON, local evidence storage, demo identity, and mock payments. Production/staging configuration validation requires PostgreSQL, OIDC authentication, private S3-compatible storage, Stripe configuration including a webhook secret, and bounded request/rate/URL-TTL limits. Unknown environment or adapter names fail closed. The frozen VOW 1.1 tree remains an unchanged verification boundary.

Every JSON repository operation is tenant-filtered through request context, and the PostgreSQL adapter uses `(tenant_id, claim_id)` keys plus row locks. Evidence uploads use lossless tenant/claim-scoped keys, content hashes, lightweight file-signature checks, and compensating object deletion if dossier metadata cannot be committed. Binary evidence delivery remains gated until authenticated retrieval is implemented. The normalized `aegis_claim_events` and `aegis_claim_evidence` tables in the migration are schema groundwork; the current repository still persists audit/evidence metadata inside the tenant-scoped dossier JSONB and must not be described as an append-only normalized ledger. Mock payment scheduling uses a tenant/claim/logical-settlement operation key through the provider protocol, and the VOW integration key uses the same scope boundary without changing the frozen VOW core. Stripe is a configuration seam only in this build: real claimant disbursement scheduling and manual completion are deliberately disabled until a durable pre-dispatch operation record, supported money-movement semantics, and verified provider reconciliation exist.

## Verification commands

```bash
cd /home/ubuntu/jcee-labs-website
uvx ruff check backend
uv run --directory backend --extra test pytest tests
bash -n start.sh start-all.sh scripts/capacity-smoke.sh
python3 - <<'PY'
from pathlib import Path
sql = Path('backend/migrations/001_claims.sql').read_text()
assert 'ROW LEVEL SECURITY' in sql
assert 'aegis_claims' in sql
print('migration static checks: PASS')
PY
```

**Historical observation at the original PR head (2026-10-01):** Ruff passed and the backend suite was reported as 28 tests passing. Those results predate the security-repair commits and are not evidence that the repaired head has executed the expanded suite. The repaired head still requires a clean runner/CI receipt before merge consideration.

## Review-boundary repair (2026-10-15)

The mock workflow now binds a material reviewed snapshot (tenant, claim, submission,
evidence metadata/content hashes, vision, pricing context, estimate and currency)
inside the signed VOW authorization. Scheduling requires both current snapshot
correspondence and verified signed intent correspondence. Legacy approvals without
this binding cannot schedule. Evidence added after approval preserves the old
receipt in approval history and returns the claim to review; evidence changes after
scheduling are rejected. A new reviewed snapshot receives a separate logical
settlement slot. Exact interrupted approval retries reuse the same slot.

Operational claim/list/dashboard/team reads require an operational staff role.
This version explicitly treats these staff roles as tenant-wide trusted readers;
it does not provide claimant-facing or assignment-restricted read access. Roleless,
homeowner and unknown-role tokens cannot read these surfaces. Demo mode retains
its role-switcher behavior and must not be exposed as production identity.

The repair tests cover evidence invalidation/reapproval, roleless reads, stale and
rehashed dossier rejection, failed dossier persistence after VOW completion,
abrupt process exit after VOW completion, completed-operation retries, mock
scheduling persistence failure and unresolved VOW failure. These checks qualify
local JSON/mock behavior only. They do not qualify PostgreSQL crash recovery,
real disbursement, delegated-authority revocation, or distributed atomicity.

The stale upload test now expects the exact uploaded JPEG-prefixed bytes.

## Production gates remain open

The environment still needs a provisioned PostgreSQL instance exercised with the intended non-owner RLS role, a private object-storage bucket, OIDC provider/JWKS verifier integration, authenticated binary-evidence retrieval, a supported real disbursement/reconciliation path, shared multi-worker rate limiting, secret-manager injection, a post-write-safe restore drill, and an authenticated staging capacity run. These are deployment gates, not claims that the local demo has completed them.
