export type Role = 'FIELD_ADJUSTER' | 'POLICYHOLDER';

export interface ApiRecord { [key: string]: unknown; }
export interface Claim extends ApiRecord {
  claim_id?: string; id?: string; status?: string; insured?: ApiRecord; tasks?: ClaimTask[];
  notes?: ClaimNote[]; audit_history?: TimelineEvent[]; estimate?: ApiRecord; assignments?: ApiRecord; assurance?: ApiRecord | null;
}
export interface ClaimTask extends ApiRecord { task_id?: string; id?: string; title?: string; status?: string; completed?: boolean; due_at?: string; priority?: string; }
export interface ClaimNote extends ApiRecord { note_id?: string; body?: string; author_id?: string; author_name?: string; visibility?: string; created_at?: string; }
export interface TimelineEvent extends ApiRecord { event?: string; created_at?: string; timestamp?: string; details?: ApiRecord; }
export interface ClaimsResponse extends ApiRecord { claims?: Claim[]; items?: Claim[]; }
export interface Dashboard extends ApiRecord { metrics?: ApiRecord; team_workload?: ApiRecord[]; recent_activity?: TimelineEvent[]; next_inspection?: ApiRecord | string; }
export interface Health extends ApiRecord { status?: string; timestamp?: string; vow?: ApiRecord; }
export type OfflineAction =
  | { id: string; type: 'note'; claimId: string; payload: { author_id: string; body: string; visibility: string }; createdAt: string }
  | { id: string; type: 'task'; claimId: string; taskId: string; payload: { actor_id: string }; createdAt: string }
  | { id: string; type: 'photo_metadata'; claimId: string; payload: { fileName: string; mimeType: string | null; uri: string; width: number | null; height: number | null }; createdAt: string };

export const asRecord = (value: unknown): ApiRecord => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as ApiRecord : {};
export const asArray = <T,>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];
export function text(value: unknown, fallback = 'Not available'): string { return typeof value === 'string' && value.trim() ? value : typeof value === 'number' ? String(value) : fallback; }
export function claimId(claim: Claim): string { return text(claim.claim_id ?? claim.id, 'Unknown claim'); }
export function taskId(task: ClaimTask): string { return text(task.task_id ?? task.id, ''); }
export function claimValue(claim: Claim, keys: string[], fallback = 'Not available'): string { for (const key of keys) { const value = claim[key]; if (typeof value === 'string' || typeof value === 'number') return text(value, fallback); } return fallback; }
export function nestedValue(record: ApiRecord | undefined, keys: string[], fallback = 'Not available'): string { if (!record) return fallback; for (const key of keys) { const value = record[key]; if (typeof value === 'string' || typeof value === 'number') return text(value, fallback); } return fallback; }
export function statusLabel(status: unknown): string { return text(status, 'SUBMITTED').replaceAll('_', ' '); }
export function money(value: unknown): string { return typeof value === 'number' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) : 'Not calculated'; }
