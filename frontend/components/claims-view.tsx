"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Filter, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { EmptyCopy } from "@/components/dashboard-view";
import { PageHeading } from "@/components/app-shell";
import { claimApi, describeApiError } from "@/lib/api";
import type { ClaimDossier, ClaimListResponse } from "@/lib/types";
import { claimAddress, claimInsuredName, claimsFromResponse } from "@/lib/types";

const statuses = ["", "SUBMITTED", "IN_REVIEW", "APPROVED", "PAYMENT_SCHEDULED", "PAID", "CLOSED"];

export function ClaimsView({ onOpenClaim }: { onOpenClaim: (claimId: string) => void }) {
  const [claims, setClaims] = useState<ClaimDossier[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const response: ClaimListResponse = await claimApi.list({ status: status || undefined, search: submittedSearch || undefined, limit: 50 }); setClaims(claimsFromResponse(response)); }
    catch (caught) { setError(describeApiError(caught)); setClaims([]); }
    finally { setLoading(false); }
  }, [status, submittedSearch]);
  useEffect(() => { void load(); }, [load]);
  const submitSearch = (event: FormEvent) => { event.preventDefault(); setSubmittedSearch(search.trim()); };
  return <div className="page-frame">
    <PageHeading eyebrow="Claims queue" title="Every file, one operational queue" description="Search and filter API-returned claims by status, assignee, insured, address, policy, or claim identifier." action={<button type="button" className="secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>} />
    <form className="mb-5 grid gap-3 rounded border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[1fr_210px_auto]" onSubmit={submitSearch}>
      <label className="relative"><span className="sr-only">Search claims</span><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="field pl-9" placeholder="Search insured, address, policy or claim ID" /></label>
      <label className="relative"><span className="sr-only">Filter by status</span><Filter className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><select className="field pl-9" value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((value) => <option key={value || "all"} value={value}>{value ? value.replaceAll("_", " ") : "All lifecycle states"}</option>)}</select></label>
      <button className="primary-button" type="submit"><SlidersHorizontal className="h-4 w-4" />Apply queue</button>
    </form>
    {error && <div role="alert" className="state-error"><AlertTriangle className="h-5 w-5" /><div><strong>Claims queue unavailable.</strong><p>{error}</p></div><button type="button" className="secondary-button" onClick={() => void load()}>Retry</button></div>}
    <section className="card overflow-hidden" aria-live="polite"><div className="section-heading"><div><p>Queue results</p><h2>{loading ? "Loading claims" : `${claims.length} claim${claims.length === 1 ? "" : "s"} returned`}</h2></div></div>{loading ? <QueueSkeleton /> : claims.length ? <><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr><th>Claim</th><th>Insured / location</th><th>Loss</th><th>Owner</th><th>Status</th><th><span className="sr-only">Open workspace</span></th></tr></thead><tbody>{claims.map((claim) => <tr key={claim.claim_id}><td><strong>{claim.claim_id}</strong><small>{claim.submission?.policy_number || "Policy unknown"}</small></td><td><strong>{claimInsuredName(claim)}</strong><small>{claimAddress(claim)}</small></td><td>{claim.submission?.incident_date || "Not recorded"}<small>{claim.submission?.peril || "Peril unknown"}</small></td><td>{claim.assignments?.desk_adjuster_name || claim.assignments?.desk_adjuster_id || "Unassigned"}</td><td><span className="status-badge">{claim.status.replaceAll("_", " ")}</span></td><td><button type="button" onClick={() => onOpenClaim(claim.claim_id)} className="row-action">Open<ArrowRight className="h-4 w-4" /></button></td></tr>)}</tbody></table></div><div className="divide-y divide-slate-100 md:hidden">{claims.map((claim) => <button key={claim.claim_id} type="button" onClick={() => onOpenClaim(claim.claim_id)} className="mobile-claim-card"><div><strong>{claimInsuredName(claim)}</strong><p>{claim.claim_id} · {claim.submission?.policy_number || "Policy unknown"}</p><p>{claimAddress(claim)}</p></div><div className="flex items-end gap-2"><span className="status-badge">{claim.status.replaceAll("_", " ")}</span><ArrowRight className="h-4 w-4" /></div></button>)}</div></> : <EmptyCopy title="No claims match this queue" detail="Change the search or lifecycle filters, then apply the queue again." />}</section>
  </div>;
}

function QueueSkeleton() { return <div className="space-y-4 p-5">{[1, 2, 3, 4].map((row) => <div key={row} className="grid grid-cols-4 gap-4"><span className="skeleton-line" /><span className="skeleton-line" /><span className="skeleton-line" /><span className="skeleton-line" /></div>)}</div>; }
