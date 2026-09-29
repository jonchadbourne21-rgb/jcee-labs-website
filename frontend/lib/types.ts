export type Role = "PROGRAM_ADMIN" | "FIELD_ADJUSTER" | "DESK_ADJUSTER" | "SUPERVISOR" | "FINANCE" | "POLICYHOLDER";
export type ViewName = "overview" | "claims" | "my-work" | "policyholder" | "finance" | "assurance";
export type WorkflowStatus = "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "PAYMENT_SCHEDULED" | "PAID" | "CLOSED";

export type LineItem = {
  id?: string;
  zone_id?: string;
  category?: string;
  trade?: string;
  description?: string;
  quantity: number;
  unit?: string;
  unit_price?: number;
  unitPrice?: number;
  rcv?: number;
  depreciation?: number;
  depreciation_percent?: number;
  acv?: number;
};

export type Evidence = {
  media_url?: string;
  file_name?: string;
  media_type?: string;
  label?: string | null;
  captured_at?: string;
};

export type Estimate = {
  rcv?: number;
  depreciation?: number;
  acv?: number;
  deductible?: number;
  net_payout?: number;
  line_items?: LineItem[];
};

export type Assurance = {
  status?: string;
  run_id?: string;
  authorization_sha256?: string;
  evidence?: { download_url?: string; verify_url?: string; signature_verified?: boolean; files_verified?: number };
  journal?: { event_count?: number; chain_intact?: boolean };
};

export type AuditEvent = {
  event: string;
  occurred_at?: string;
  actor?: string;
  details?: Record<string, unknown>;
};

export type ClaimTask = {
  task_id?: string;
  id?: string;
  title: string;
  owner_id?: string;
  owner_name?: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;
  due_at?: string | null;
  completed_at?: string | null;
  status?: "OPEN" | "COMPLETE" | string;
};

export type ClaimNote = {
  note_id?: string;
  id?: string;
  author_id?: string;
  author_name?: string;
  body: string;
  visibility?: "INTERNAL" | "POLICYHOLDER" | string;
  created_at?: string;
};

export type PaymentInstruction = {
  status?: "SCHEDULED" | "SENT" | string;
  method?: "ACH" | "CHECK" | string;
  amount?: number;
  scheduled_at?: string;
  sent_at?: string;
  instruction_id?: string;
};

export type TeamMember = {
  user_id: string;
  id?: string;
  name: string;
  role: Role | string;
  email?: string;
  workload_count?: number;
};

export type ClaimDossier = {
  claim_id: string;
  id?: string;
  status: WorkflowStatus | string;
  created_at?: string;
  updated_at?: string;
  submission?: {
    homeowner_name?: string;
    insured_name?: string;
    policy_number?: string;
    incident_date?: string;
    peril?: string;
    property_address?: string;
    loss_address?: string;
    zip_code?: string;
    deductible?: number;
    material_age_years?: number;
    incident_description?: string;
  };
  evidence?: Evidence[];
  estimate?: Estimate | null;
  line_items?: LineItem[];
  assurance?: Assurance | null;
  approval?: { status?: string; notes?: string | null; adjuster_name?: string | null; settlement?: { net_payout?: number } };
  audit_history?: AuditEvent[];
  assignments?: { field_adjuster_id?: string | null; desk_adjuster_id?: string | null; field_adjuster_name?: string; desk_adjuster_name?: string };
  tasks?: ClaimTask[];
  notes?: ClaimNote[];
  payment?: PaymentInstruction | null;
  payment_instruction?: PaymentInstruction | null;
  vision_data?: VisionData | null;
  telemetry?: { gps_match?: boolean; exif_tamper_flag?: boolean; depth_sensor_available?: boolean } | null;
};

export type VisionData = {
  loss_summary?: { primary_peril?: string; total_affected_rooms?: number; moisture_migration_detected?: boolean };
  rooms?: Array<{ room_name?: string; damaged_zones?: Array<{ zone_id?: string; surface_type?: string; confidence_score?: number; measurements?: { unit?: string; affected_quantity?: number } }> }>;
};

export type DashboardMetric = number | string | null | undefined;
export type DashboardPayload = {
  metrics?: Record<string, DashboardMetric>;
  status_distribution?: Record<string, number>;
  recent_activity?: AuditEvent[];
  team_workload?: Array<TeamMember & { open_claims?: number }>;
  exception_queue?: ClaimDossier[];
};

export type ClaimListResponse = ClaimDossier[] | { claims?: ClaimDossier[]; items?: ClaimDossier[]; total?: number; limit?: number; offset?: number };
export type TeamResponse = TeamMember[] | { users?: TeamMember[]; team?: TeamMember[] };
export type ApiHealth = { status?: string; service?: string; timestamp?: string; claim_count?: number; vow?: { status?: string; version?: string; files_verified?: number } };
export type VerificationResponse = { claim_id?: string; status?: string; verification?: { checks?: Record<string, { ok?: boolean; message?: string }> } };

export type ClaimSubmission = {
  insured_name: string;
  policy_number: string;
  incident_date: string;
  peril: string;
  loss_address: string;
  zip_code: string;
  deductible: number;
  material_age: string;
  material_age_years: number;
  incident_brief: string;
  evidence: Array<{ filename: string; media_type: "IMAGE"; label: string }>;
};

export type ApprovalPayload = {
  decision: "APPROVE" | "SAVE_REVIEW";
  line_items: Array<{ id: string; quantity: number; unit_price: number }>;
  reviewer_notes: string;
  adjuster_name: string;
};
export type AssignmentPayload = { field_adjuster_id?: string | null; desk_adjuster_id?: string | null };
export type TaskPayload = { title: string; owner_id: string; priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"; due_at?: string };
export type NotePayload = { author_id: string; body: string; visibility: "INTERNAL" | "POLICYHOLDER" };
export type PaymentPayload = { action: "SCHEDULE" | "MARK_SENT"; method?: "ACH" | "CHECK"; actor_id: string };

export const ROLE_OPTIONS: Array<{ id: Role; label: string; summary: string }> = [
  { id: "PROGRAM_ADMIN", label: "Program administrator", summary: "Portfolio command center" },
  { id: "FIELD_ADJUSTER", label: "Field adjuster", summary: "Inspections and field tasks" },
  { id: "DESK_ADJUSTER", label: "Desk adjuster", summary: "Review and pricing" },
  { id: "SUPERVISOR", label: "Supervisor", summary: "Proof-gated authorization" },
  { id: "FINANCE", label: "Finance", summary: "Mock payment instructions" },
  { id: "POLICYHOLDER", label: "Policyholder", summary: "Plain-language claim status" },
];

export function claimInsuredName(claim: ClaimDossier): string {
  return claim.submission?.homeowner_name || claim.submission?.insured_name || "Policyholder not recorded";
}
export function claimAddress(claim: ClaimDossier): string { return claim.submission?.property_address || claim.submission?.loss_address || "Address not recorded"; }
export function claimPayment(claim: ClaimDossier): PaymentInstruction | null { return claim.payment || claim.payment_instruction || null; }
export function tasksForClaim(claim: ClaimDossier): ClaimTask[] { return Array.isArray(claim.tasks) ? claim.tasks : []; }
export function notesForClaim(claim: ClaimDossier): ClaimNote[] { return Array.isArray(claim.notes) ? claim.notes : []; }
export function auditForClaim(claim: ClaimDossier): AuditEvent[] { return Array.isArray(claim.audit_history) ? claim.audit_history : []; }
export function itemsForClaim(claim: ClaimDossier): LineItem[] { return claim.line_items?.length ? claim.line_items : claim.estimate?.line_items || []; }
export function membersFromResponse(response: TeamResponse | null): TeamMember[] {
  if (!response) return [];
  return Array.isArray(response) ? response : response.users || response.team || [];
}
export function claimsFromResponse(response: ClaimListResponse): ClaimDossier[] {
  return Array.isArray(response) ? response : response.claims || response.items || [];
}

export const DEMO_CLAIM_ID = "CLM_DEMO_KITCHEN";
export const DEMO_ACTOR_BY_ROLE: Record<Role, string> = {
  PROGRAM_ADMIN: "USR_ADMIN_01",
  FIELD_ADJUSTER: "USR_FIELD_01",
  DESK_ADJUSTER: "USR_DESK_01",
  SUPERVISOR: "USR_SUPERVISOR_01",
  FINANCE: "USR_FINANCE_01",
  POLICYHOLDER: "USR_POLICYHOLDER_01",
};
