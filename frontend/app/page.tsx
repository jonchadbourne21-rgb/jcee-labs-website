"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, FileCheck2, Loader2, RefreshCw, ShieldCheck, WalletCards } from "lucide-react";
import { AppShell, PageHeading } from "@/components/app-shell";
import { ClaimWorkspace } from "@/components/claim-workspace";
import { ClaimsView } from "@/components/claims-view";
import { DashboardView, EmptyCopy } from "@/components/dashboard-view";
import { PolicyholderView } from "@/components/policyholder-view";
import { PwaRegister } from "@/components/pwa-register";
import { claimApi, describeApiError } from "@/lib/api";
import type { ApiHealth, ClaimDossier, Role, ViewName } from "@/lib/types";
import { DEMO_ACTOR_BY_ROLE, claimsFromResponse } from "@/lib/types";

export default function ClaimOSApp() {
  const [view, setView] = useState<ViewName>("overview");
  const [role, setRole] = useState<Role>("PROGRAM_ADMIN");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const refreshHealth = useCallback(async () => {
    setHealthLoading(true);
    try { setHealth(await claimApi.health()); } catch { setHealth(null); } finally { setHealthLoading(false); }
  }, []);
  useEffect(() => { void refreshHealth(); }, [refreshHealth]);
  const openClaim = (claimId: string) => { setSelectedClaimId(claimId); setView("claims"); };
  const navigate = (next: ViewName) => { setView(next); if (next !== "claims") setSelectedClaimId(null); };
  let content: React.ReactNode;
  if (view === "overview") content = <DashboardView onOpenClaim={openClaim} />;
  else if (view === "claims") content = selectedClaimId
    ? <ClaimWorkspace claimId={selectedClaimId} role={role} onBack={() => { setSelectedClaimId(null); setView("claims"); }} />
    : <ClaimsView onOpenClaim={openClaim} />;
  else if (view === "my-work") content = <MyWorkView role={role} onOpenClaim={openClaim} />;
  else if (view === "policyholder") content = <PolicyholderView initialClaimId={selectedClaimId} onOpenClaim={openClaim} />;
  else if (view === "finance") content = <FinanceView role={role} onOpenClaim={openClaim} />;
  else content = <AssuranceView onOpenClaim={openClaim} />;
  return <><PwaRegister /><AppShell activeView={view} onNavigate={navigate} role={role} onRoleChange={setRole} health={health} healthLoading={healthLoading} onRefreshHealth={() => void refreshHealth()}>{content}</AppShell></>;
}

function MyWorkView({ role, onOpenClaim }: { role: Role; onOpenClaim: (claimId: string) => void }) {
  return <QueueSurface eyebrow="My work" title="Your assigned claim work" description="This role-specific queue uses the planned assignee query. If the API cannot provide ownership data, AEGIS shows a clear unavailable state." query={{ assignee: DEMO_ACTOR_BY_ROLE[role], limit: 50 }} emptyTitle="No assigned work returned" emptyDetail="There are no API-returned claims assigned to this demo role." onOpenClaim={onOpenClaim} />;
}
function FinanceView({ role, onOpenClaim }: { role: Role; onOpenClaim: (claimId: string) => void }) {
  return <QueueSurface eyebrow="Finance control" title="Authorized payment workflow" description="Only API-returned claims flow into mock payment scheduling. No control in this app transfers funds." query={{ status: "APPROVED", assignee: role === "FINANCE" ? DEMO_ACTOR_BY_ROLE[role] : undefined, limit: 50 }} emptyTitle="No authorized payment work returned" emptyDetail="Approved claims appear when the API returns them. Payment actions remain inside a selected claim workspace." onOpenClaim={onOpenClaim} icon={<WalletCards className="h-5 w-5 text-cyan" />} />;
}
function AssuranceView({ onOpenClaim }: { onOpenClaim: (claimId: string) => void }) {
  return <QueueSurface eyebrow="Assurance" title="Proof-gated authorization records" description="Review claim files with an authorization state. The VOW evidence pack and verification controls are available only after the API records assurance." query={{ status: "APPROVED", limit: 50 }} emptyTitle="No authorized claim records returned" emptyDetail="Approved claim files will appear here after VOW authorization." onOpenClaim={onOpenClaim} icon={<ShieldCheck className="h-5 w-5 text-cyan" />} />;
}

function QueueSurface({ eyebrow, title, description, query, emptyTitle, emptyDetail, onOpenClaim, icon }: { eyebrow: string; title: string; description: string; query: { status?: string; assignee?: string; limit: number }; emptyTitle: string; emptyDetail: string; onOpenClaim: (claimId: string) => void; icon?: React.ReactNode }) {
  const [claims, setClaims] = useState<ClaimDossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { setClaims(claimsFromResponse(await claimApi.list(query))); } catch (caught) { setError(describeApiError(caught)); setClaims([]); } finally { setLoading(false); } }, [query]);
  useEffect(() => { void load(); }, [load]);
  return <div className="page-frame"><PageHeading eyebrow={eyebrow} title={title} description={description} action={<button type="button" className="secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>} />{error && <div role="alert" className="state-error"><AlertTriangle className="h-5 w-5" /><div><strong>This work queue is unavailable.</strong><p>{error}</p></div><button type="button" className="secondary-button" onClick={() => void load()}>Retry</button></div>}<section className="card"><div className="section-heading"><div><p>Claim work</p><h2>{loading ? "Loading API queue" : `${claims.length} file${claims.length === 1 ? "" : "s"} returned`}</h2></div>{icon || <FileCheck2 className="h-5 w-5 text-cyan" />}</div>{loading ? <div className="space-y-4 p-5">{[1, 2, 3].map((entry) => <span key={entry} className="skeleton-line block w-full" />)}</div> : claims.length ? <div className="divide-y divide-slate-100">{claims.map((claim) => <button type="button" key={claim.claim_id} className="claim-row-button" onClick={() => onOpenClaim(claim.claim_id)}><span><strong>{claim.submission?.homeowner_name || claim.submission?.insured_name || claim.claim_id}</strong><small>{claim.claim_id} · {claim.status.replaceAll("_", " ")}</small></span><span className="text-sm font-bold text-cyan">Open file</span></button>)}</div> : <EmptyCopy title={emptyTitle} detail={emptyDetail} />}</section><section className="mt-6 border border-ink bg-ink p-5 text-white"><p className="text-xs font-bold uppercase tracking-[.14em] text-cyan">Control boundary</p><p className="mt-2 text-sm leading-6 text-slate-300">Claim data, lifecycle state, authorization, and payment instructions are API-authoritative. Refresh the selected claim after any action to see the latest record.</p></section></div>;
}
