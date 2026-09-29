"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, BarChart3, CheckCircle2, ClipboardList, RefreshCw, UsersRound } from "lucide-react";
import { PageHeading } from "@/components/app-shell";
import { claimApi, describeApiError, isMissingEndpoint } from "@/lib/api";
import type { ClaimDossier, DashboardPayload } from "@/lib/types";
import { claimInsuredName } from "@/lib/types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function metricValue(value: number | string | null | undefined, formatter?: (value: number) => string): string {
  if (typeof value === "number") return formatter ? formatter(value) : String(value);
  if (typeof value === "string") return value;
  return "Unknown";
}

export function DashboardView({ onOpenClaim }: { onOpenClaim: (claimId: string) => void }) {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await claimApi.dashboard()); } catch (caught) { setError(describeApiError(caught)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const metrics = data?.metrics;
  const cards = [
    { label: "Open claims", key: "open_claims", icon: ClipboardList, tone: "cyan", value: metricValue(metrics?.open_claims) },
    { label: "Evidence ready", key: "evidence_readiness_rate", icon: CheckCircle2, tone: "teal", value: metricValue(metrics?.evidence_readiness_rate, (value) => `${Math.round(value * (value <= 1 ? 100 : 1))}%`) },
    { label: "Approval throughput", key: "approval_throughput", icon: Activity, tone: "orange", value: metricValue(metrics?.approval_throughput) },
    { label: "Authorized exposure", key: "authorized_exposure", icon: BarChart3, tone: "ink", value: metricValue(metrics?.authorized_exposure, money.format) },
  ];
  const missing = error ? isMissingEndpoint(new Error()) : false;
  return <div className="page-frame">
    <PageHeading eyebrow="Operations command center" title="Portfolio at a glance" description="Live portfolio visibility from the ClaimOS API. AEGIS does not infer metrics when the authoritative dashboard response is absent." action={<button type="button" className="secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>} />
    {error && <div role="alert" className="state-error"><AlertTriangle className="h-5 w-5" /><div><strong>Dashboard unavailable.</strong><p>{error}</p>{missing && <p className="mt-1">This API deployment does not yet provide the planned dashboard endpoint. Metric values remain unknown.</p>}</div><button type="button" onClick={() => void load()} className="secondary-button">Retry</button></div>}
    <section aria-label="Portfolio metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <article key={card.key} className={`metric-card metric-${card.tone}`}><Icon className="h-5 w-5" /><div><p>{card.label}</p>{loading ? <span className="skeleton-line mt-2 w-20" /> : <strong>{error ? "Unknown" : card.value}</strong>}</div></article>; })}</section>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <section className="card"><div className="section-heading"><div><p>Status distribution</p><h2>Claims by lifecycle state</h2></div><BarChart3 className="h-5 w-5 text-cyan" /></div>{loading ? <div className="space-y-3 p-5">{[1,2,3,4].map((line) => <span key={line} className="skeleton-line block w-full" />)}</div> : data?.status_distribution && Object.keys(data.status_distribution).length ? <div className="divide-y divide-slate-100">{Object.entries(data.status_distribution).map(([status, count]) => <div key={status} className="flex items-center justify-between px-5 py-3 text-sm"><span className="status-badge">{status.replaceAll("_", " ")}</span><strong>{count}</strong></div>)}</div> : <EmptyCopy title="No status distribution returned" detail="The command center will display counts when the API provides them." />}</section>
      <section className="card"><div className="section-heading"><div><p>Team workload</p><h2>Assigned work</h2></div><UsersRound className="h-5 w-5 text-cyan" /></div>{loading ? <div className="space-y-3 p-5">{[1,2,3].map((line) => <span key={line} className="skeleton-line block w-full" />)}</div> : data?.team_workload?.length ? <div className="divide-y divide-slate-100">{data.team_workload.map((member) => <div key={member.user_id} className="flex items-center justify-between gap-4 px-5 py-3"><div><p className="text-sm font-bold">{member.name}</p><p className="text-xs text-slate-500">{String(member.role).replaceAll("_", " ")}</p></div><span className="text-sm font-bold text-ink">{member.open_claims ?? member.workload_count ?? "Unknown"}</span></div>)}</div> : <EmptyCopy title="No team workload returned" detail="Workload counts are shown only when returned by the API." />}</section>
    </div>
    <section className="card mt-6"><div className="section-heading"><div><p>Exception queue</p><h2>Claims needing attention</h2></div><AlertTriangle className="h-5 w-5 text-safety" /></div>{loading ? <div className="space-y-3 p-5">{[1,2].map((line) => <span key={line} className="skeleton-line block w-full" />)}</div> : data?.exception_queue?.length ? <div className="divide-y divide-slate-100">{data.exception_queue.map((claim: ClaimDossier) => <button type="button" key={claim.claim_id} className="claim-row-button" onClick={() => onOpenClaim(claim.claim_id)}><span><strong>{claimInsuredName(claim)}</strong><small>{claim.claim_id}</small></span><span className="status-badge">{claim.status}</span><ArrowRight className="h-4 w-4" /></button>)}</div> : <EmptyCopy title="No exceptions returned" detail="There are no API-reported exception claims to prioritize." />}</section>
    <section className="mt-6 grid gap-4 lg:grid-cols-2"><section className="card"><div className="section-heading"><div><p>Recent activity</p><h2>Portfolio event stream</h2></div><Activity className="h-5 w-5 text-cyan" /></div>{data?.recent_activity?.length ? <ol className="divide-y divide-slate-100">{data.recent_activity.slice(0, 5).map((event, index) => <li key={`${event.event}-${index}`} className="px-5 py-3"><p className="text-sm font-semibold">{event.event.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-slate-500">{event.actor || "System"}{event.occurred_at ? ` · ${new Date(event.occurred_at).toLocaleString()}` : ""}</p></li>)}</ol> : <EmptyCopy title="No activity returned" detail="Events will appear when they are supplied by the dashboard API." />}</section>
      <aside className="border border-ink bg-ink p-5 text-white"><p className="text-xs font-bold uppercase tracking-[.14em] text-cyan">Decision discipline</p><h2 className="mt-2 text-lg font-extrabold">Authoritative data stays authoritative.</h2><p className="mt-3 text-sm leading-6 text-slate-300">Numbers in this view are rendered from <code>/api/dashboard</code>. If a metric is absent, AEGIS labels it <strong className="text-white">Unknown</strong> rather than constructing a proxy.</p></aside>
    </section>
  </div>;
}

export function EmptyCopy({ title, detail }: { title: string; detail: string }) { return <div className="p-5 text-sm"><p className="font-bold text-ink">{title}</p><p className="mt-1 leading-6 text-slate-500">{detail}</p></div>; }
