import type { ApiRecord, Claim, ClaimsResponse, Dashboard, Health } from './types';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const apiBaseUrl = (configuredUrl || 'http://localhost:8000').replace(/\/$/, '');
export class ApiError extends Error { constructor(message: string, public readonly status: number, public readonly body: unknown) { super(message); this.name = 'ApiError'; } }
async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try { response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init.headers } }); }
  catch (error) { throw new ApiError(error instanceof Error ? error.message : 'Network request failed.', 0, null); }
  const raw = await response.text(); let body: unknown = null;
  try { body = raw ? JSON.parse(raw) : null; } catch { body = raw; }
  if (!response.ok) { const detail = body && typeof body === 'object' && 'detail' in body ? String(body.detail) : `Request failed (${response.status}).`; throw new ApiError(detail, response.status, body); }
  return body as T;
}
export const isConnectivityError = (error: unknown): boolean => error instanceof ApiError && error.status === 0;
function normalizeClaims(payload: ClaimsResponse | Claim[]): Claim[] { return Array.isArray(payload) ? payload : payload.claims ?? payload.items ?? []; }
export const api = {
  health: () => apiRequest<Health>('/health'), dashboard: () => apiRequest<Dashboard>('/api/dashboard'),
  claims: async () => normalizeClaims(await apiRequest<ClaimsResponse | Claim[]>('/api/claims?limit=100')),
  claim: (id: string) => apiRequest<Claim>(`/api/claims/${encodeURIComponent(id)}`),
  analyze: (id: string) => apiRequest<Claim>(`/api/claims/${encodeURIComponent(id)}/analyze`, { method: 'POST', body: '{}' }),
  addNote: (id: string, payload: { author_id: string; body: string; visibility: string }) => apiRequest<Claim>(`/api/claims/${encodeURIComponent(id)}/notes`, { method: 'POST', body: JSON.stringify(payload) }),
  completeTask: (claimId: string, taskId: string, payload: { actor_id: string }) => apiRequest<Claim>(`/api/claims/${encodeURIComponent(claimId)}/tasks/${encodeURIComponent(taskId)}/complete`, { method: 'POST', body: JSON.stringify(payload) }),
  verifyVow: (id: string) => apiRequest<ApiRecord>(`/api/claims/${encodeURIComponent(id)}/assurance/verify`),
  resetDemo: () => apiRequest<ApiRecord>('/api/demo/reset', { method: 'POST', body: '{}' }),
};
export function demoClaimId(payload: ApiRecord): string | null { const direct = payload.claim_id ?? payload.id; if (typeof direct === 'string') return direct; const nested = payload.claim; if (nested && typeof nested === 'object') { const claim = nested as ApiRecord; return typeof claim.claim_id === 'string' ? claim.claim_id : typeof claim.id === 'string' ? claim.id : null; } return null; }
