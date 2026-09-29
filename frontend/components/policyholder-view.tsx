"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, CircleHelp, FileImage, Loader2, MapPin, RefreshCw, UserRound, WalletCards } from "lucide-react";
import { PageHeading } from "@/components/app-shell";
import { EmptyCopy } from "@/components/dashboard-view";
import { claimApi, describeApiError, isMissingEndpoint } from "@/lib/api";
import type { ClaimDossier } from "@/lib/types";
import { claimAddress, claimInsuredName, claimPayment, claimsFromResponse, tasksForClaim } from "@/lib/types";

export function PolicyholderView({ initialClaimId, onOpenClaim }: { initialClaimId: string | null; onOpenClaim: (claimId: string) => void }) {
  const [claim, setClaim] = useState<ClaimDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingContract, setMissingContract] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError(null); setMissingContract(false);
    try {
      if (initialClaimId) { setClaim(await claimApi.get(initialClaimId)); return; }
      const candidates = claimsFromResponse(await claimApi.list({ limit: 20 }));
      setClaim(candidates[0] || null);
    } catch (caught) { setError(describeApiError(caught)); setMissingContract(isMissingEndpoint(caught)); } finally { setLoading(false); }
  }, [initialClaimId]);
  useEffect(() => { void load(); }, [load]);
  const payment = claim ? claimPayment(claim) : null;
  const taskList = claim ? tasksForClaim(claim) : [];
  const milestones = claim ? [
    { label: "Loss reported", complete: true, detail: "We recorded your loss details and evidence." },
    { label: "Estimate reviewed", complete: Boolean(claim.estimate), detail: claim.estimate ? "Your repair estimate is being reviewed." : "We are preparing your estimate." },
    { label: "Settlement authorized", complete: claim.status === "APPROVED" || Boolean(claim.assurance) || Boolean(payment), detail: claim.status === "APPROVED" || Boolean(claim.assurance) ? "Your settlement is authorized for payment processing." : "A supervisor must complete authorization." },
    { label: "Payment update", complete: payment?.status === "SENT" || claim.status === "PAID" || claim.status === "CLOSED", detail: payment?.status === "SENT" || claim.status === "PAID" ? "Your payment instruction has been sent." : payment?.status === "SCHEDULED" ? "Your payment instruction is scheduled." : "Payment becomes available after authorization." },
  ] : [];
  return <div className="page-frame policyholder-surface">
    <PageHeading eyebrow="Policyholder portal" title="Your claim, explained plainly" description="Follow progress, understand what we need next, and see the milestones for your Kitchen Water Damage claim." action={<button type="button" className="secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>} />
    {error && <div role="alert" className="state-error"><AlertTriangle className="h-5 w-5" /><div><strong>We could not load claim progress.</strong><p>{error}</p>{missingContract && <p className="mt-1">The claim list service is not available at this deployment. Please reconnect and try again.</p>}</div><button type="button" className="secondary-button" onClick={() => void load()}>Retry</button></div>}
    {loading ? <div className="card space-y-5 p-6">{[1,2,3,4].map((item) => <span key={item} className="skeleton-line block w-full" />)}</div> : !claim ? <section className="card"><EmptyCopy title="No claim is available to display" detail="When a submitted claim is returned by the API, its plain-language status will appear here." /></section> : <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <div className="space-y-6"><section className="card overflow-hidden"><div className="bg-ink p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.15em] text-cyan">Claim progress</p><h2 className="mt-2 text-2xl font-extrabold">{claimInsuredName(claim)}</h2><p className="mt-2 text-sm text-slate-300">Claim {claim.claim_id} · {claim.submission?.peril || "Property loss"}</p><span className="mt-4 inline-flex bg-cyan px-3 py-1.5 text-xs font-extrabold text-ink">{claim.status.replaceAll("_", " ")}</span></div><ol className="divide-y divide-slate-100">{milestones.map((milestone) => <li key={milestone.label} className="flex gap-4 p-5"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${milestone.complete ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-400"}`}>{milestone.complete ? <CheckCircle2 className="h-5 w-5" /> : <CircleHelp className="h-5 w-5" />}</span><div><h3 className="font-bold">{milestone.label}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{milestone.detail}</p></div></li>)}</ol></section>
        <section className="card"><div className="section-heading"><div><p>What we need from you</p><h2>Requested actions</h2></div><CalendarDays className="h-5 w-5 text-cyan" /></div>{taskList.length ? <ul className="divide-y divide-slate-100">{taskList.map((task, index) => <li key={task.task_id || task.id || index} className="flex gap-3 p-4"><CheckCircle2 className={`mt-0.5 h-5 w-5 ${task.completed_at || task.status === "COMPLETE" ? "text-teal-600" : "text-slate-300"}`} /><div><p className="text-sm font-bold">{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.completed_at || task.status === "COMPLETE" ? "Completed" : "In progress"}{task.due_at ? ` · Due ${new Date(task.due_at).toLocaleDateString()}` : ""}</p></div></li>)}</ul> : <EmptyCopy title="No actions needed right now" detail="We will show anything needed from you here." />}</section>
      </div>
      <aside className="space-y-6"><section className="card"><div className="section-heading"><div><p>Your loss details</p><h2>Claim information</h2></div><MapPin className="h-5 w-5 text-cyan" /></div><div className="p-5"><PolicyDetail label="Loss address" value={claimAddress(claim)} /><PolicyDetail label="Date of loss" value={claim.submission?.incident_date || "Not recorded"} /><PolicyDetail label="Evidence received" value={claim.evidence ? `${claim.evidence.length} item${claim.evidence.length === 1 ? "" : "s"}` : "Unknown"} /><PolicyDetail label="Estimate status" value={claim.estimate ? "Estimate prepared" : "In progress"} /></div></section><section className="card"><div className="section-heading"><div><p>Your contact</p><h2>Claim team</h2></div><UserRound className="h-5 w-5 text-cyan" /></div><div className="p-5"><p className="font-bold">{claim.assignments?.desk_adjuster_name || "Claim team assigned"}</p><p className="mt-1 text-sm leading-6 text-slate-600">Your claim team will contact you if more information is needed.</p></div></section><section className="card"><div className="section-heading"><div><p>Payment</p><h2>Payment progress</h2></div><WalletCards className="h-5 w-5 text-cyan" /></div><div className="p-5"><PolicyDetail label="Status" value={payment?.status || "Not scheduled"} /><PolicyDetail label="Method" value={payment?.method || "Not selected"} /><p className="mt-4 text-xs leading-5 text-slate-500">Payment activity is a claim-status update. For safety, this portal does not expose internal financial controls.</p></div></section><button type="button" className="secondary-button w-full justify-center" onClick={() => onOpenClaim(claim.claim_id)}><Loader2 className="h-4 w-4" />Open operations view</button></aside>
    </div>}
  </div>;
}
function PolicyDetail({ label, value }: { label: string; value: string }) { return <div className="border-b border-slate-100 py-3 text-sm last:border-b-0"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-semibold text-ink">{value}</p></div>; }
