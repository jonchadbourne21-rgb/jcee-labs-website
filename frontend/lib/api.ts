import type {
  ApiHealth,
  ApprovalPayload,
  AssignmentPayload,
  ClaimDossier,
  ClaimListResponse,
  ClaimSubmission,
  DashboardPayload,
  NotePayload,
  PaymentPayload,
  TaskPayload,
  TeamResponse,
  VerificationResponse,
  WorkflowStatus,
} from "@/lib/types";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly endpoint: string;
  readonly detail?: unknown;

  constructor(message: string, status: number, endpoint: string, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.endpoint = endpoint;
    this.detail = detail;
  }
}

function messageFrom(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.detail === "string") return record.detail;
    if (typeof record.message === "string") return record.message;
  }
  return fallback;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const endpoint = `${API_BASE_URL}${path}`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...init,
      cache: "no-store",
      headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
  } catch (cause) {
    throw new ApiError("Unable to reach the ClaimOS API. Check your connection and retry.", 0, endpoint, cause);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(messageFrom(payload, `Request failed (${response.status}).`), response.status, endpoint, payload);
  }
  return payload as T;
}

function queryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export const claimApi = {
  health: () => apiRequest<ApiHealth>("/health"),
  dashboard: () => apiRequest<DashboardPayload>("/api/dashboard"),
  list: (params: { status?: string; assignee?: string; search?: string; limit?: number; offset?: number } = {}) =>
    apiRequest<ClaimListResponse>(`/api/claims${queryString(params)}`),
  get: (claimId: string) => apiRequest<ClaimDossier>(`/api/claims/${encodeURIComponent(claimId)}`),
  submit: (payload: ClaimSubmission) => apiRequest<ClaimDossier>("/api/claims/submit", { method: "POST", body: JSON.stringify(payload) }),
  analyze: (claimId: string) => apiRequest<ClaimDossier>(`/api/claims/${encodeURIComponent(claimId)}/analyze`, { method: "POST", body: "{}" }),
  approve: (claimId: string, payload: ApprovalPayload) =>
    apiRequest<ClaimDossier>(`/api/claims/${encodeURIComponent(claimId)}/approve`, { method: "POST", body: JSON.stringify(payload) }),
  resetDemo: () => apiRequest<ClaimDossier>("/api/demo/reset", { method: "POST", body: "{}" }),
  team: () => apiRequest<TeamResponse>("/api/team"),
  assign: (claimId: string, payload: AssignmentPayload) =>
    apiRequest<ClaimDossier>(`/api/claims/${encodeURIComponent(claimId)}/assign`, { method: "POST", body: JSON.stringify(payload) }),
  createTask: (claimId: string, payload: TaskPayload) =>
    apiRequest<ClaimDossier>(`/api/claims/${encodeURIComponent(claimId)}/tasks`, { method: "POST", body: JSON.stringify(payload) }),
  completeTask: (claimId: string, taskId: string, actorId: string) =>
    apiRequest<ClaimDossier>(`/api/claims/${encodeURIComponent(claimId)}/tasks/${encodeURIComponent(taskId)}/complete`, {
      method: "POST",
      body: JSON.stringify({ actor_id: actorId }),
    }),
  addNote: (claimId: string, payload: NotePayload) =>
    apiRequest<ClaimDossier>(`/api/claims/${encodeURIComponent(claimId)}/notes`, { method: "POST", body: JSON.stringify(payload) }),
  setStatus: (claimId: string, status: WorkflowStatus, actorId: string) =>
    apiRequest<ClaimDossier>(`/api/claims/${encodeURIComponent(claimId)}/status`, { method: "POST", body: JSON.stringify({ status, actor_id: actorId }) }),
  payment: (claimId: string, payload: PaymentPayload) =>
    apiRequest<ClaimDossier>(`/api/claims/${encodeURIComponent(claimId)}/payment`, { method: "POST", body: JSON.stringify(payload) }),
  verifyEvidence: (claimId: string) => apiRequest<VerificationResponse>(`/api/claims/${encodeURIComponent(claimId)}/assurance/verify`),
  evidenceUrl: (claimId: string) => `${API_BASE_URL}/api/claims/${encodeURIComponent(claimId)}/assurance/evidence`,
};

export function describeApiError(error: unknown): string {
  if (error instanceof ApiError) return `${error.message} (${error.endpoint})`;
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

export function isMissingEndpoint(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
