# AEGIS ClaimOS Production-Hardening Verification

**Scope:** PostgreSQL/object-storage migration seams, tenant isolation, SSO/MFA-ready authentication, provider-backed payments, API security controls, and capacity testing.

## Implemented boundary

The application now selects adapters through explicit configuration. Demo/test mode remains local JSON, local evidence storage, demo identity, and mock payments. Production/staging configuration requires PostgreSQL, OIDC authentication, private S3-compatible storage, and a non-mock payment provider. The frozen VOW 1.1 tree remains an unchanged verification boundary.

Every JSON repository operation is tenant-filtered through request context, and the PostgreSQL adapter uses `(tenant_id, claim_id)` keys plus row locks. Evidence keys are tenant/claim-prefixed and content-hashed; binary evidence delivery remains gated until authenticated retrieval is implemented. Mock payment scheduling uses a tenant/claim/logical-settlement operation key through the provider protocol, and the VOW integration key uses the same scope boundary without changing the frozen VOW core. Stripe is a configuration seam only in this build: real claimant disbursement scheduling and manual completion are deliberately disabled until a durable pre-dispatch operation record, supported money-movement semantics, and verified provider reconciliation exist.

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

**Observed on 2026-10-01:** Ruff passed; backend suite passed with 28 tests. The existing Starlette/httpx deprecation warning is non-blocking and comes from the installed test-client compatibility layer.

## Remaining gates before real production traffic

The environment still needs a provisioned PostgreSQL instance, private object-storage bucket, OIDC provider/JWKS verifier integration, Stripe webhook endpoint, secret-manager injection, restore drill, and staging capacity run. These are deployment gates, not claims that the local demo has completed them.
