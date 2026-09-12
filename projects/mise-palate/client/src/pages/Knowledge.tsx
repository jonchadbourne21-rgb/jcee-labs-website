import { useAuth } from "@/_core/hooks/useAuth";
import AppShell from "@/components/product/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { BookOpen, Check, ExternalLink, Loader2, Pencil, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Knowledge() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const list = trpc.knowledge.list.useQuery();
  const [type, setType] = useState("all");
  const [editing, setEditing] = useState<any>(null);
  const [contentText, setContentText] = useState("");
  const update = trpc.knowledge.update.useMutation({ onSuccess: async () => { await utils.knowledge.list.invalidate(); toast.success("Chef Knowledge updated"); setEditing(null); }, onError: error => toast.error(error.message) });
  const filtered = (list.data ?? []).filter(item => type === "all" || item.type === type);
  const types = ["all", "technique", "ingredient", "cut", "error", "recovery", "sensory_transformation", "safety"];

  function startEdit(item: any) {
    setEditing(item);
    setContentText(JSON.stringify(item.content, null, 2));
  }

  function save() {
    if (!editing) return;
    try {
      update.mutate({ id: editing.id, title: editing.title, summary: editing.summary, content: JSON.parse(contentText), reviewStatus: editing.reviewStatus });
    } catch {
      toast.error("Content must be valid JSON");
    }
  }

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_20rem]"><div><p className="eyebrow">Chef Knowledge</p><h1 className="page-title mt-3">Reasoning you can inspect.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-muted-ink">This layer is separate from generation. A chef can improve technique knowledge without changing application code, while authoritative safety records keep their source and review status.</p></div><div className="rounded-[1.5rem] border border-sage/30 bg-sage/14 p-5"><div className="flex gap-3"><ShieldCheck className="size-5 shrink-0 text-sage-deep" /><div><p className="text-sm font-bold">Three kinds of truth</p><p className="mt-2 text-xs leading-5 text-muted-ink">Authoritative safety facts, chef-reviewed culinary knowledge, and generated situational judgment are labeled separately.</p></div></div></div></section>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">{types.map(value => <button key={value} onClick={() => setType(value)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold capitalize ${type === value ? "bg-ink text-white" : "border border-ink/10 bg-white/55 text-muted-ink"}`}>{value.replace("_", " ")}</button>)}</div>
      {list.isLoading ? <div className="grid min-h-72 place-items-center"><Loader2 className="size-6 animate-spin" /></div> : <div className="mt-5 grid gap-4 md:grid-cols-2">{filtered.map(item => <article key={item.id} className="surface p-6"><div className="flex items-start justify-between gap-4"><span className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.11em] ${item.reviewStatus === "authoritative" ? "bg-sage/20 text-sage-deep" : item.reviewStatus === "chef_reviewed" ? "bg-copper/18 text-copper-deep" : "bg-ink/6 text-muted-ink"}`}>{item.reviewStatus.replace("_", " ")}</span>{user?.role === "admin" && item.editable && <button onClick={() => startEdit(item)} className="grid size-9 place-items-center rounded-full bg-ink/6"><Pencil className="size-4" /></button>}</div><BookOpen className="mt-6 size-5 text-copper-deep" /><h2 className="mt-3 font-display text-3xl">{item.title}</h2><p className="mt-2 text-sm leading-6 text-muted-ink">{item.summary}</p>{item.type === "cut" && <CutDiagram slug={item.slug} content={item.content as any} />}<pre className="mt-5 max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-ink p-4 font-mono text-[0.68rem] leading-5 text-white/67">{JSON.stringify(item.content, null, 2)}</pre>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sage-deep">{item.sourceLabel || "Source"}<ExternalLink className="size-3" /></a>}</article>)}</div>}
      {editing && <div className="fixed inset-0 z-50 grid items-end bg-black/60 p-3 sm:place-items-center"><div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[2rem] bg-cream p-6 sm:p-8"><div className="flex items-start justify-between"><div><p className="eyebrow">Chef editor</p><h2 className="mt-2 font-display text-4xl">{editing.title}</h2></div><button onClick={() => setEditing(null)} className="grid size-10 place-items-center rounded-full bg-ink/6"><X className="size-5" /></button></div><label className="mt-6 grid gap-2 text-sm font-bold">Summary<Textarea value={editing.summary} onChange={event => setEditing({ ...editing, summary: event.target.value })} className="min-h-24 rounded-xl bg-white" /></label><label className="mt-5 grid gap-2 text-sm font-bold">Structured content<Textarea value={contentText} onChange={event => setContentText(event.target.value)} className="min-h-64 rounded-xl bg-ink font-mono text-xs leading-5 text-white" /></label><Button onClick={save} disabled={update.isPending} className="mt-5 h-12 w-full rounded-full bg-ink text-white"><Check className="mr-2 size-4" /> Save reviewed knowledge</Button></div></div>}
    </AppShell>
  );
}

function CutDiagram({ slug, content }: { slug: string; content: { targetDimensionsMm?: number[] } }) {
  const dimensions = content.targetDimensionsMm ?? [];
  const isDice = slug === "brunoise";
  return <div className="mt-5 rounded-2xl border border-ink/8 bg-white/55 p-4"><p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-copper-deep">Geometry-only safe guide</p><div className="mt-4 flex min-h-24 items-end justify-center gap-2">{Array.from({ length: isDice ? 5 : 6 }, (_, index) => <span key={index} className={`block rounded-sm bg-copper/75 shadow-sm ${isDice ? "size-8" : "h-20 w-2.5"}`} />)}</div><p className="mt-3 text-center font-mono text-xs text-muted-ink">Target cut: {dimensions.length ? dimensions.join(" × ") : "review dimensions"} mm</p><p className="mt-2 text-center text-[0.68rem] leading-5 text-muted-ink">No hand-and-blade imagery. Follow the reviewed stabilization and fingertip-safety notes below.</p></div>;
}
