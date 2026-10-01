CREATE TABLE IF NOT EXISTS aegis_tenants (
  tenant_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aegis_claims (
  tenant_id TEXT NOT NULL REFERENCES aegis_tenants(tenant_id),
  claim_id TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dossier JSONB NOT NULL,
  PRIMARY KEY (tenant_id, claim_id)
);

CREATE INDEX IF NOT EXISTS idx_aegis_claims_tenant_updated ON aegis_claims (tenant_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_aegis_claims_tenant_status ON aegis_claims (tenant_id, status);

CREATE TABLE IF NOT EXISTS aegis_claim_events (
  tenant_id TEXT NOT NULL,
  claim_id TEXT NOT NULL,
  event_id BIGSERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_hash TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  FOREIGN KEY (tenant_id, claim_id) REFERENCES aegis_claims(tenant_id, claim_id)
);

CREATE INDEX IF NOT EXISTS idx_aegis_events_claim_time ON aegis_claim_events (tenant_id, claim_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS aegis_claim_evidence (
  tenant_id TEXT NOT NULL,
  claim_id TEXT NOT NULL,
  evidence_id UUID PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  media_type TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  byte_size BIGINT NOT NULL CHECK (byte_size >= 0),
  captured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (tenant_id, claim_id) REFERENCES aegis_claims(tenant_id, claim_id)
);

ALTER TABLE aegis_claim_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE aegis_claim_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE aegis_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY aegis_claims_tenant_isolation ON aegis_claims
  USING (tenant_id = current_setting('aegis.tenant_id', true));
CREATE POLICY aegis_events_tenant_isolation ON aegis_claim_events
  USING (tenant_id = current_setting('aegis.tenant_id', true));
CREATE POLICY aegis_evidence_tenant_isolation ON aegis_claim_evidence
  USING (tenant_id = current_setting('aegis.tenant_id', true));
