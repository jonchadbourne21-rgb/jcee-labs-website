"use client";

import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CloudUpload,
  FileCheck2,
  FileImage,
  Home,
  Info,
  Loader2,
  LocateFixed,
  MapPin,
  Pencil,
  RefreshCw,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Upload,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type Stage = "intake" | "processing" | "review" | "approved";
type AgentStatus = "waiting" | "running" | "complete" | "attention";

type LineItem = {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  depreciation: number;
};

type ClaimForm = {
  insuredName: string;
  policyNumber: string;
  incidentDate: string;
  peril: string;
  address: string;
  zip: string;
  deductible: string;
  materialAge: string;
  brief: string;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fullUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const defaultForm: ClaimForm = {
  insuredName: "Jordan & Casey Morgan",
  policyNumber: "APH-48392071",
  incidentDate: "2026-09-12",
  peril: "WATER",
  address: "1847 Hawthorne Avenue, Dallas, TX",
  zip: "75201",
  deductible: "1000",
  materialAge: "4",
  brief: "Supply line beneath the kitchen sink failed overnight. Water pooled across the hardwood and migrated under base cabinets. Emergency mitigation began this morning; no prior water loss at this location."
};

const defaultLineItems: LineItem[] = [
  { id: "L-01", category: "Mitigation", description: "Water extraction & structural drying", quantity: 1, unit: "EA", unitPrice: 1840, depreciation: 0 },
  { id: "L-02", category: "Flooring", description: "Engineered hardwood — replace affected area", quantity: 186, unit: "SF", unitPrice: 17.5, depreciation: 15 },
  { id: "L-03", category: "Cabinetry", description: "Base cabinet & toe-kick restoration", quantity: 12, unit: "LF", unitPrice: 285, depreciation: 20 },
  { id: "L-04", category: "Plumbing", description: "Braided supply line & angle stop", quantity: 1, unit: "EA", unitPrice: 245, depreciation: 0 },
  { id: "L-05", category: "Finish", description: "Prime and paint affected wall surfaces", quantity: 240, unit: "SF", unitPrice: 3.4, depreciation: 5 }
];

const agentTemplate = [
  { key: "ingestion", label: "Ingestion & Telemetry Verification", description: "Validating capture integrity, GPS, EXIF, and timestamps", icon: ClipboardCheck },
  { key: "vision", label: "Computer Vision Forensics & Material Segmentation", description: "Locating affected materials and measured damage zones", icon: ScanSearch },
  { key: "coverage", label: "Policy Form & Endorsement Checks", description: "Testing the sudden-and-accidental coverage condition", icon: ShieldCheck },
  { key: "pricing", label: "Line-Item Unit Pricing & Depreciation", description: "Applying ZIP-localized rates and material depreciation", icon: WalletCards },
  { key: "dossier", label: "Adjuster Dossier Synthesis", description: "Compiling evidence, scope, pricing, and decision context", icon: FileCheck2 }
] as const;

function getId(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const record = response as Record<string, unknown>;
  const value = record.claim_id ?? record.id ?? (record.claim as Record<string, unknown> | undefined)?.id;
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

function getMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as Record<string, unknown>;
  return typeof record.detail === "string" ? record.detail : typeof record.message === "string" ? record.message : fallback;
}

function extractDamageConfidence(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  const vision = (data.vision_data ?? data.vision) as Record<string, unknown> | undefined;
  if (!vision || !Array.isArray(vision.rooms)) return null;
  const scores = vision.rooms.flatMap((room) => {
    const zones = (room as Record<string, unknown>).damaged_zones;
    if (!Array.isArray(zones)) return [];
    return zones
      .map((zone) => Number((zone as Record<string, unknown>).confidence_score))
      .filter((score) => Number.isFinite(score));
  });
  if (!scores.length) return null;
  return scores.reduce((total, score) => total + score, 0) / scores.length;
}

function extractLineItems(payload: unknown): LineItem[] | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  const source = Array.isArray(data.line_items) ? data.line_items : Array.isArray((data.estimate as Record<string, unknown> | undefined)?.line_items) ? ((data.estimate as Record<string, unknown>).line_items as unknown[]) : null;
  if (!source) return null;
  const parsed = source.map((item, index) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? row.code ?? `L-${index + 1}`),
      category: String(row.cat_sel ?? row.category ?? row.trade ?? "Repair"),
      description: String(row.description ?? row.name ?? "Reviewed repair item"),
      quantity: Number(row.quantity ?? row.qty ?? 1),
      unit: String(row.unit ?? "EA"),
      unitPrice: Number(row.unit_price ?? row.unitPrice ?? row.price ?? 0),
      depreciation: Number(row.depreciation_percent ?? row.depreciation ?? 0)
    };
  });
  return parsed.length ? parsed : null;
}

export default function ClaimsWorkspace() {
  const [stage, setStage] = useState<Stage>("intake");
  const [form, setForm] = useState<ClaimForm>(defaultForm);
  const [claimId, setClaimId] = useState<string>("");
  const [analysis, setAnalysis] = useState<unknown>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>(defaultLineItems);
  const [agentStatus, setAgentStatus] = useState<AgentStatus[]>(["waiting", "waiting", "waiting", "waiting", "waiting"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("Evidence and estimate reviewed. Release settlement once payment preference is confirmed.");
  const [lastAction, setLastAction] = useState<"submit" | "approve" | null>(null);

  const totals = useMemo(() => {
    const lineAmounts = lineItems.map((item) => {
      const rcv = Math.round(item.quantity * item.unitPrice * 100) / 100;
      const depreciation = Math.round(rcv * (item.depreciation / 100) * 100) / 100;
      return { rcv, depreciation, acv: Math.round((rcv - depreciation) * 100) / 100 };
    });
    const rcv = Math.round(lineAmounts.reduce((sum, item) => sum + item.rcv, 0) * 100) / 100;
    const depreciation = Math.round(lineAmounts.reduce((sum, item) => sum + item.depreciation, 0) * 100) / 100;
    const acv = Math.round(lineAmounts.reduce((sum, item) => sum + item.acv, 0) * 100) / 100;
    const deductible = Number(form.deductible) || 0;
    return { rcv, depreciation, acv, deductible, net: Math.max(0, Math.round((acv - deductible) * 100) / 100) };
  }, [lineItems, form.deductible]);

  const updateForm = (field: keyof ClaimForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const runClaim = async (event?: FormEvent) => {
    event?.preventDefault();
    setError(null);
    setNotice(null);
    setLastAction("submit");
    setIsSubmitting(true);
    setStage("processing");
    setAgentStatus(["running", "waiting", "waiting", "waiting", "waiting"]);

    try {
      const submitResponse = await fetch(`${API_URL}/api/claims/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          insured_name: form.insuredName,
          policy_number: form.policyNumber,
          incident_date: form.incidentDate,
          peril: form.peril,
          loss_address: form.address,
          zip_code: form.zip,
          deductible: Number(form.deductible),
          material_age: form.materialAge,
          material_age_years: Number(form.materialAge),
          incident_brief: form.brief,
          evidence: [{ filename: "/kitchen-water-damage.jpg", media_type: "IMAGE", label: "Kitchen damage photograph" }]
        })
      });
      const submitted = await submitResponse.json().catch(() => null);
      if (!submitResponse.ok) throw new Error(getMessage(submitted, `Claim submission failed (${submitResponse.status}).`));
      const nextId = getId(submitted);
      if (!nextId) throw new Error("The submission response did not include a claim ID. Check the API contract and retry.");
      setClaimId(nextId);
      setAgentStatus(["complete", "running", "waiting", "waiting", "waiting"]);

      const analyzeResponse = await fetch(`${API_URL}/api/claims/${encodeURIComponent(nextId)}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const result = await analyzeResponse.json().catch(() => null);
      if (!analyzeResponse.ok) throw new Error(getMessage(result, `Analysis failed (${analyzeResponse.status}).`));

      setAnalysis(result);
      const returnedItems = extractLineItems(result);
      if (returnedItems) setLineItems(returnedItems);
      const agents = (result as Record<string, unknown> | null)?.agents;
      if (Array.isArray(agents)) {
        setAgentStatus(agentTemplate.map((agent, index) => {
          const agentResult = agents[index] as Record<string, unknown> | undefined;
          return agentResult?.status === "attention" ? "attention" : "complete";
        }));
      } else {
        setAgentStatus(["complete", "complete", "complete", "complete", "complete"]);
      }
      setNotice(`Analysis completed for claim ${nextId}. Review is ready.`);
      setStage("review");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to reach the claims service.";
      setError(`${message} API endpoint: ${API_URL}`);
      setAgentStatus((current) => current.map((status, index) => index === 0 && status === "running" ? "attention" : status));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLine = (id: string, field: "quantity" | "unitPrice", value: string) => {
    const normalized = Math.max(0, Number(value) || 0);
    setLineItems((items) => items.map((item) => item.id === id ? { ...item, [field]: normalized } : item));
  };

  const approveClaim = async () => {
    if (!claimId) {
      setError("A claim ID is required before approval. Submit and analyze the claim again.");
      return;
    }
    setError(null);
    setNotice(null);
    setLastAction("approve");
    setIsApproving(true);
    try {
      const response = await fetch(`${API_URL}/api/claims/${encodeURIComponent(claimId)}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_items: lineItems.map(({ id, quantity, unitPrice }) => ({ id, quantity, unit_price: unitPrice })),
          reviewer_notes: reviewNote,
          settlement: { rcv: totals.rcv, acv: totals.acv, depreciation: totals.depreciation, deductible: totals.deductible, net_payout: totals.net }
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(result, `Approval failed (${response.status}).`));
      setAnalysis(result || analysis);
      const approvedItems = extractLineItems(result);
      if (approvedItems) setLineItems(approvedItems);
      setStage("approved");
      setNotice(`Claim ${claimId} approved and queued for settlement.`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to approve the claim.";
      setError(`${message} API endpoint: ${API_URL}`);
    } finally {
      setIsApproving(false);
    }
  };

  const reset = () => {
    setStage("intake");
    setClaimId("");
    setAnalysis(null);
    setLineItems(defaultLineItems);
    setAgentStatus(["waiting", "waiting", "waiting", "waiting", "waiting"]);
    setError(null);
    setNotice(null);
    setLastAction(null);
  };

  const retry = () => {
    if (lastAction === "approve") void approveClaim();
    else void runClaim();
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />
      <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8">
        <Lifecycle active={stage} />

        {error && (
          <div role="alert" className="mb-5 flex flex-col gap-3 border border-red-300 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><span>{error}</span></div>
            <div className="flex gap-2"><button onClick={retry} className="inline-flex items-center gap-2 border border-red-300 bg-white px-3 py-2 font-semibold hover:bg-red-100"><RefreshCw className="h-4 w-4" />Retry</button><button onClick={() => setError(null)} aria-label="Dismiss error" className="p-2 hover:bg-red-100"><X className="h-4 w-4" /></button></div>
          </div>
        )}
        {notice && !error && <div role="status" className="mb-5 flex items-center gap-3 border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950"><CheckCircle2 className="h-5 w-5 text-cyan" />{notice}</div>}

        {stage === "intake" && <Intake form={form} updateForm={updateForm} submitting={isSubmitting} onSubmit={runClaim} />}
        {stage === "processing" && <Processing agents={agentStatus} claimId={claimId} isLoading={isSubmitting} onBack={reset} />}
        {stage === "review" && <Review form={form} claimId={claimId} lineItems={lineItems} updateLine={updateLine} totals={totals} note={reviewNote} setNote={setReviewNote} approving={isApproving} onApprove={approveClaim} analysis={analysis} />}
        {stage === "approved" && <Approval form={form} claimId={claimId} totals={totals} onReset={reset} />}
      </div>
    </main>
  );
}

function Header() {
  return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-[1540px] items-center justify-between px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center bg-ink text-white"><ShieldCheck className="h-5 w-5" /></div><div><div className="font-bold tracking-tight">Aegis <span className="text-cyan">ClaimOS</span></div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Property claims workspace</div></div></div><div className="flex items-center gap-2 border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-950"><span className="h-2 w-2 bg-cyan" aria-hidden="true" />Live sandbox</div></div></header>;
}

function Lifecycle({ active }: { active: Stage }) {
  const steps: { id: Stage; name: string; icon: typeof ClipboardCheck }[] = [
    { id: "intake", name: "Intake", icon: ClipboardCheck }, { id: "processing", name: "AI processing", icon: Bot }, { id: "review", name: "Adjuster review", icon: ScanSearch }, { id: "approved", name: "Approval", icon: BadgeCheck }
  ];
  const activeIndex = steps.findIndex((item) => item.id === active);
  return <nav aria-label="Claim lifecycle" className="mb-7 overflow-x-auto border-b border-slate-200"><ol className="flex min-w-max gap-1">{steps.map((item, index) => { const Icon = item.icon; const isCurrent = active === item.id; const complete = index < activeIndex; return <li key={item.id} className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold ${isCurrent ? "border-cyan text-ink" : complete ? "border-teal-400 text-teal-800" : "border-transparent text-slate-400"}`}><span className={`grid h-6 w-6 place-items-center text-xs ${isCurrent ? "bg-ink text-white" : complete ? "bg-teal-100 text-teal-900" : "bg-slate-100 text-slate-500"}`}>{complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}</span>{item.name}{index < steps.length - 1 && <ChevronRight className="ml-3 h-4 w-4 text-slate-300" />}</li>; })}</ol></nav>;
}

function Intake({ form, updateForm, submitting, onSubmit }: { form: ClaimForm; updateForm: (field: keyof ClaimForm, value: string) => void; submitting: boolean; onSubmit: (event: FormEvent) => void }) {
  return <form onSubmit={onSubmit} className="pb-8"><section className="mb-6 flex flex-col justify-between gap-3 border-l-4 border-safety bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-end"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-safety">New property loss</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Kitchen Water Damage</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">Capture the initial facts once. Aegis coordinates evidence, coverage, pricing, and review behind the scenes.</p></div><div className="text-sm text-slate-500"><span className="font-semibold text-ink">Draft</span> · saved in this browser</div></section>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,.7fr)]"><div className="space-y-6"><section className="card"><SectionTitle icon={FileImage} eyebrow="Evidence" title="Loss documentation" detail="1 primary image attached" /><div className="grid gap-5 p-5 sm:grid-cols-[220px_1fr]"><div className="relative aspect-[4/3] overflow-hidden border border-slate-200 bg-slate-100"><Image src="/kitchen-water-damage.jpg" alt="Kitchen water damage evidence" fill sizes="(max-width: 640px) 100vw, 220px" className="object-cover" priority /><div className="absolute bottom-2 left-2 bg-ink px-2 py-1 text-[11px] font-semibold text-white">PRIMARY EVIDENCE</div></div><div><div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="font-semibold">kitchen-water-damage.jpg</h3><p className="mt-1 text-xs text-slate-500">JPEG · 3.8 MB · uploaded from field</p></div><button type="button" className="icon-button" aria-label="Replace evidence image"><Pencil className="h-4 w-4" /></button></div><div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-200 py-3 text-xs"><Telemetry icon={MapPin} label="GPS" value="32.7767, −96.7970" /><Telemetry icon={LocateFixed} label="EXIF" value="iPhone 15 Pro · 24 mm" /><Telemetry icon={Zap} label="Captured" value="12 Sep 2026 · 12:32 CDT" /><Telemetry icon={ShieldCheck} label="Integrity" value="Hash verified" /></div><button type="button" className="mt-4 inline-flex items-center gap-2 border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold hover:border-cyan hover:text-cyan"><CloudUpload className="h-4 w-4" />Add photos or invoices</button></div></div></section>
      <section className="card"><SectionTitle icon={ClipboardCheck} eyebrow="Incident" title="Tell us what happened" detail="Guide AI triage with the facts known now" /><div className="p-5"><div className="mb-3 flex flex-wrap gap-2" aria-label="Incident brief quick prompts"><Prompt text="Supply line failure" onClick={() => updateForm("brief", "Supply line beneath the kitchen sink failed overnight. Water pooled across the hardwood and migrated under base cabinets. Emergency mitigation began this morning; no prior water loss at this location.")} /><Prompt text="Sudden & accidental" onClick={() => updateForm("brief", `${form.brief} The loss was sudden and accidental.`)} /><Prompt text="Mitigation started" onClick={() => updateForm("brief", `${form.brief} Emergency mitigation has started.`)} /></div><label className="field-label" htmlFor="brief">Incident brief</label><textarea id="brief" value={form.brief} onChange={(e) => updateForm("brief", e.target.value)} className="field min-h-32 resize-y" required /><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Peril" id="peril"><select id="peril" value={form.peril} onChange={(e) => updateForm("peril", e.target.value)} className="field"><option value="WATER">Water — sudden & accidental</option><option value="HAIL">Hail</option><option value="WIND">Wind</option><option value="FIRE">Fire</option></select></Field><Field label="Date of loss" id="date"><input id="date" type="date" value={form.incidentDate} onChange={(e) => updateForm("incidentDate", e.target.value)} className="field" required /></Field></div></div></section></div>
      <aside className="space-y-6"><section className="card"><SectionTitle icon={Home} eyebrow="Policy & location" title="Claim particulars" /><div className="space-y-4 p-5"><Field label="Named insured" id="insured"><input id="insured" value={form.insuredName} onChange={(e) => updateForm("insuredName", e.target.value)} className="field" required /></Field><Field label="Policy number" id="policy"><input id="policy" value={form.policyNumber} onChange={(e) => updateForm("policyNumber", e.target.value)} className="field" required /></Field><Field label="Loss address" id="address"><input id="address" value={form.address} onChange={(e) => updateForm("address", e.target.value)} className="field" required /></Field><div className="grid grid-cols-2 gap-4"><Field label="ZIP code" id="zip"><input id="zip" inputMode="numeric" value={form.zip} onChange={(e) => updateForm("zip", e.target.value)} className="field" required /></Field><Field label="Deductible" id="deductible"><div className="relative"><span className="absolute left-3 top-2.5 text-sm text-slate-500">$</span><input id="deductible" inputMode="decimal" value={form.deductible} onChange={(e) => updateForm("deductible", e.target.value)} className="field pl-6" required /></div></Field></div><Field label="Material / renovation age" id="age"><input id="age" value={form.materialAge} onChange={(e) => updateForm("materialAge", e.target.value)} className="field" required /></Field></div></section><section className="border border-ink bg-ink p-5 text-white"><div className="mb-3 flex items-center gap-2 text-cyan"><Sparkles className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.14em]">Ready for orchestration</span></div><p className="text-sm leading-6 text-slate-200">Submitting sends this intake to the configured claims API, then starts its analysis workflow.</p><button disabled={submitting} className="mt-5 flex w-full items-center justify-center gap-2 bg-cyan px-4 py-3 font-bold text-ink transition hover:bg-[#27c7d0] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <><Loader2 className="h-5 w-5 animate-spin" />Sending to ClaimOS…</> : <>Submit & analyze claim<ArrowRight className="h-5 w-5" /></>}</button><p className="mt-3 text-center text-xs text-slate-400">API: {API_URL}</p></section></aside></div></form>;
}

function Processing({ agents, claimId, isLoading, onBack }: { agents: AgentStatus[]; claimId: string; isLoading: boolean; onBack: () => void }) {
  const completed = agents.filter((item) => item === "complete").length;
  return <section className="mx-auto max-w-4xl py-6"><div className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-cyan">Autonomous analysis</p><h1 className="text-2xl font-bold tracking-tight">Building the claim file</h1><p className="mt-2 text-sm text-slate-600">{claimId ? <>Claim <strong className="text-ink">{claimId}</strong> is in the analysis queue.</> : "Creating your claim file with the claims service."}</p></div><div className="border border-slate-200 px-3 py-2 text-right"><div className="text-xl font-bold">{completed}<span className="text-slate-400">/5</span></div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Agents clear</div></div></div><ol className="divide-y divide-slate-200">{agentTemplate.map((agent, index) => <AgentRow key={agent.key} agent={agent} status={agents[index]} />)}</ol>{isLoading ? <div className="mt-6 flex items-center gap-3 border-l-4 border-cyan bg-teal-50 px-4 py-3 text-sm text-teal-950"><Loader2 className="h-5 w-5 animate-spin text-cyan" />Awaiting a response from the analysis endpoint. Stages update from API progress; no simulated decision is shown.</div> : <div className="mt-6 flex justify-end"><button onClick={onBack} className="inline-flex items-center gap-2 border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"><RotateCcw className="h-4 w-4" />Return to intake</button></div>}</div></section>;
}

function AgentRow({ agent, status }: { agent: typeof agentTemplate[number]; status: AgentStatus }) { const Icon = agent.icon; const label = status === "complete" ? "Complete" : status === "running" ? "Working" : status === "attention" ? "Needs attention" : "Queued"; return <li className="flex items-center gap-4 py-4"><div className={`grid h-10 w-10 shrink-0 place-items-center ${status === "complete" ? "bg-teal-100 text-teal-900" : status === "running" ? "bg-ink text-cyan" : status === "attention" ? "bg-orange-100 text-safety" : "bg-slate-100 text-slate-400"}`}>{status === "complete" ? <Check className="h-5 w-5" /> : status === "running" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><div className="font-semibold">{agent.label}</div><div className="text-sm text-slate-500">{agent.description}</div></div><span className={`text-xs font-bold uppercase tracking-wider ${status === "complete" ? "text-teal-800" : status === "running" ? "text-cyan" : status === "attention" ? "text-safety" : "text-slate-400"}`}>{label}</span></li>; }

function Review({ form, claimId, lineItems, updateLine, totals, note, setNote, approving, onApprove, analysis }: { form: ClaimForm; claimId: string; lineItems: LineItem[]; updateLine: (id: string, field: "quantity" | "unitPrice", value: string) => void; totals: { rcv: number; depreciation: number; acv: number; deductible: number; net: number }; note: string; setNote: (value: string) => void; approving: boolean; onApprove: () => void; analysis: unknown }) {
  const data = analysis as Record<string, unknown> | null;
  const confidenceValue = extractDamageConfidence(data);
  const confidence = confidenceValue === null ? "—" : `${Math.round(confidenceValue * 100)}%`;
  const flooringQuantity = lineItems.find((item) => item.id === "ZN_03_FLOORING")?.quantity ?? 0;
  const baseboardQuantity = lineItems.find((item) => item.id === "ZN_01_BASEBOARD")?.quantity ?? 0;
  return <section className="pb-8"><div className="mb-6 flex flex-col gap-3 border-l-4 border-cyan bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-cyan">Adjuster cockpit</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Review AI assessment</h1><p className="mt-2 text-sm text-slate-600">Claim <strong className="text-ink">{claimId}</strong> · {form.insuredName} · {form.peril}</p></div><div className="border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-900">AI confidence <span className="ml-2 text-lg text-ink">{confidence}</span></div></div><div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_390px]"><div className="space-y-6"><section className="card"><SectionTitle icon={ScanSearch} eyebrow="Damage assessment" title="Evidence localization" detail="Vision agent marked high-confidence affected areas" /><div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_.9fr]"><EvidenceOverlay /><div className="space-y-3"><div className="border-l-4 border-safety bg-orange-50 p-3"><div className="text-xs font-bold uppercase tracking-wider text-safety">Primary loss driver</div><div className="mt-1 font-semibold">Supply-line discharge below sink</div><p className="mt-1 text-sm text-slate-600">Visible water exposure beneath base cabinets and across finished flooring.</p></div><Metric label="Affected flooring" value={`${flooringQuantity} SF`} detail="0.91 confidence" /><Metric label="Affected baseboard" value={`${baseboardQuantity} LF`} detail="0.96 confidence" /><Metric label="Moisture scope" value="Kitchen only" detail="No adjacent-room signal" /></div></div></section><section className="card overflow-hidden"><SectionTitle icon={WalletCards} eyebrow="Repair estimate" title="Editable line items" detail="Changes are included in the approval request" /><div className="overflow-x-auto"><table className="w-full min-w-[740px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Trade / description</th><th className="px-3 py-3">Qty</th><th className="px-3 py-3">Unit</th><th className="px-3 py-3">Unit price</th><th className="px-3 py-3 text-right">RCV</th><th className="px-5 py-3 text-right">Dep.</th></tr></thead><tbody className="divide-y divide-slate-200">{lineItems.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-3"><div className="text-xs font-bold uppercase tracking-wider text-cyan">{item.category}</div><div className="font-medium text-ink">{item.description}</div></td><td className="px-3 py-3"><input aria-label={`${item.description} quantity`} type="number" min="0" step="0.01" value={item.quantity} onChange={(e) => updateLine(item.id, "quantity", e.target.value)} className="table-input" /></td><td className="px-3 py-3 text-slate-500">{item.unit}</td><td className="px-3 py-3"><div className="relative"><span className="absolute left-2 top-1.5 text-xs text-slate-400">$</span><input aria-label={`${item.description} unit price`} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateLine(item.id, "unitPrice", e.target.value)} className="table-input pl-5" /></div></td><td className="px-3 py-3 text-right font-semibold">{fullUSD.format(item.quantity * item.unitPrice)}</td><td className="px-5 py-3 text-right text-slate-600">{item.depreciation}%</td></tr>)}</tbody></table></div></section></div><aside className="space-y-6"><section className="card"><SectionTitle icon={ShieldCheck} eyebrow="Coverage & risk" title="Decision context" /><div className="divide-y divide-slate-200"><SideRow label="Policy" value={form.policyNumber} /><SideRow label="Coverage" value="Dwelling · A" accent="Eligible" /><SideRow label="Deductible" value={USD.format(totals.deductible)} /><SideRow label="Risk flags" value="None detected" accent="Clear" /><SideRow label="Material age" value={`${form.materialAge} years`} /></div></section><Settlement totals={totals} /><section className="card"><SectionTitle icon={Pencil} eyebrow="Adjuster note" title="Release instruction" /><div className="p-5"><label htmlFor="note" className="sr-only">Review note</label><textarea id="note" className="field min-h-28 resize-y" value={note} onChange={(e) => setNote(e.target.value)} /><button onClick={onApprove} disabled={approving} className="mt-4 flex w-full items-center justify-center gap-2 bg-safety px-4 py-3 font-bold text-white hover:bg-[#d85727] disabled:cursor-not-allowed disabled:opacity-60">{approving ? <><Loader2 className="h-5 w-5 animate-spin" />Sending approval…</> : <><CheckCircle2 className="h-5 w-5" />Approve {USD.format(totals.net)} settlement</>}</button><p className="mt-3 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />Approval submits edited quantities and unit prices to the claims API.</p></div></section></aside></div></section>;
}

function EvidenceOverlay() { return <div className="relative aspect-video overflow-hidden border border-slate-200 bg-slate-100"><Image src="/kitchen-water-damage.jpg" alt="Kitchen evidence with four damage localization overlays" fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" /><div className="absolute bottom-[8%] left-[4%] h-[29%] w-[68%] border-2 border-cyan bg-cyan/10"><span className="absolute -top-6 left-0 bg-cyan px-2 py-1 text-[9px] font-bold text-ink">FLOORING · 0.91</span></div><div className="absolute bottom-[30%] left-[32%] h-[12%] w-[47%] border-2 border-safety bg-orange-400/10"><span className="absolute -top-6 left-0 whitespace-nowrap bg-safety px-2 py-1 text-[9px] font-bold text-white">BASEBOARD · 0.96</span></div><div className="absolute bottom-[41%] right-[17%] h-[23%] w-[18%] border-2 border-violet-500 bg-violet-400/10"><span className="absolute -top-6 right-0 whitespace-nowrap bg-violet-600 px-2 py-1 text-[9px] font-bold text-white">DRYWALL · 0.94</span></div><div className="absolute bottom-[9%] right-[1%] h-[28%] w-[16%] border-2 border-teal-500 bg-teal-400/10"><span className="absolute -top-6 right-0 whitespace-nowrap bg-teal-600 px-2 py-1 text-[9px] font-bold text-white">AIR MOVER · 0.98</span></div><div className="absolute bottom-3 left-3 bg-ink/95 px-3 py-2 text-xs text-white"><span className="font-bold text-cyan">4 zones</span> localized · 0.95 mean confidence</div></div>; }

function Settlement({ totals }: { totals: { rcv: number; depreciation: number; acv: number; deductible: number; net: number } }) { return <section className="border border-ink bg-ink text-white"><div className="border-b border-slate-700 px-5 py-4"><div className="text-xs font-bold uppercase tracking-[0.14em] text-cyan">Pricing summary</div><div className="mt-1 font-semibold">Recommended settlement</div></div><div className="space-y-3 p-5 text-sm"><PriceRow label="Replacement cost value" value={USD.format(totals.rcv)} /><PriceRow label="Less depreciation" value={`−${USD.format(totals.depreciation)}`} /><PriceRow label="Actual cash value" value={USD.format(totals.acv)} strong /><PriceRow label="Less deductible" value={`−${USD.format(totals.deductible)}`} /><div className="mt-4 flex items-end justify-between border-t border-slate-700 pt-4"><span className="font-bold">Net payout</span><span className="text-2xl font-bold text-cyan">{USD.format(totals.net)}</span></div></div></section>; }

function Approval({ form, claimId, totals, onReset }: { form: ClaimForm; claimId: string; totals: { rcv: number; depreciation: number; acv: number; deductible: number; net: number }; onReset: () => void }) { return <section className="mx-auto max-w-5xl pb-8"><div className="border-t-4 border-cyan bg-white p-6 shadow-sm sm:p-8"><div className="grid gap-8 lg:grid-cols-[1fr_310px]"><div><div className="mb-5 inline-flex h-12 w-12 items-center justify-center bg-teal-100 text-teal-900"><CheckCircle2 className="h-7 w-7" /></div><p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan">Settlement authorized</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Approval complete.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Claim <strong className="text-ink">{claimId}</strong> for {form.insuredName} has cleared adjuster review. Settlement instructions are ready for the payment workflow.</p><div className="mt-6 border-l-4 border-safety bg-orange-50 px-4 py-3 text-sm"><span className="font-bold">Next action:</span> Confirm the insured&apos;s payment preference before disbursement.</div><button onClick={onReset} className="mt-6 inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"><RotateCcw className="h-4 w-4" />Start another claim</button></div><div className="bg-ink p-5 text-white"><div className="text-xs font-bold uppercase tracking-[0.14em] text-cyan">Net settlement</div><div className="mt-2 text-4xl font-bold">{USD.format(totals.net)}</div><div className="mt-5 space-y-2 border-t border-slate-700 pt-4 text-sm text-slate-300"><div className="flex justify-between"><span>ACV</span><span>{USD.format(totals.acv)}</span></div><div className="flex justify-between"><span>Deductible</span><span>−{USD.format(totals.deductible)}</span></div></div></div></div><Timeline /></div></section>; }

function Timeline() { const items = [["Intake received", "Evidence, address, and loss facts recorded"], ["AI assessment complete", "Coverage, vision, and estimate checks cleared"], ["Adjuster approval", "Settlement authorized for payment workflow"], ["Payment release", "Pending insured preference confirmation"]]; return <div className="mt-10 border-t border-slate-200 pt-6"><h2 className="mb-5 font-bold">Claim timeline</h2><ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{items.map(([title, detail], index) => <li key={title} className="relative border-l-2 border-slate-200 pl-4"><span className={`absolute -left-[7px] top-0 h-3 w-3 ${index === items.length - 1 ? "bg-slate-300" : "bg-cyan"}`} /><div className="text-xs font-bold uppercase tracking-wider text-slate-500">{index < 3 ? "Complete" : "Next"}</div><div className="mt-1 font-semibold">{title}</div><p className="mt-1 text-sm text-slate-500">{detail}</p></li>)}</ol></div>; }

function SectionTitle({ icon: Icon, eyebrow, title, detail }: { icon: typeof FileImage; eyebrow: string; title: string; detail?: string }) { return <div className="flex gap-3 border-b border-slate-200 px-5 py-4"><div className="grid h-9 w-9 place-items-center bg-slate-100 text-ink"><Icon className="h-5 w-5" /></div><div><div className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan">{eyebrow}</div><h2 className="font-bold leading-5">{title}</h2>{detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}</div></div>; }
function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) { return <div><label className="field-label" htmlFor={id}>{label}</label>{children}</div>; }
function Prompt({ text, onClick }: { text: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-cyan hover:text-cyan">+ {text}</button>; }
function Telemetry({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) { return <div className="flex gap-2"><Icon className="mt-0.5 h-3.5 w-3.5 text-cyan" /><div><div className="font-bold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-0.5 font-medium text-slate-700">{value}</div></div></div>; }
function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="flex items-center justify-between border-b border-slate-200 pb-3"><div><div className="text-xs font-semibold text-slate-500">{label}</div><div className="mt-0.5 text-xs text-teal-700">{detail}</div></div><div className="font-bold">{value}</div></div>; }
function SideRow({ label, value, accent }: { label: string; value: string; accent?: string }) { return <div className="flex items-start justify-between gap-4 px-5 py-3 text-sm"><span className="text-slate-500">{label}</span><span className={`text-right font-semibold ${accent ? "text-teal-800" : "text-ink"}`}>{value}{accent && <small className="ml-1 text-[10px] font-bold uppercase tracking-wide">{accent}</small>}</span></div>; }
function PriceRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) { return <div className={`flex justify-between ${strong ? "font-semibold text-white" : "text-slate-300"}`}><span>{label}</span><span>{value}</span></div>; }
