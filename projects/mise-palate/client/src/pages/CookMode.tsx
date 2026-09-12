import { useAuth } from "@/_core/hooks/useAuth";
import { Wordmark } from "@/components/product/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock3, Eye, Flame, Loader2, Mic, Pause, Play, RotateCcw, ShieldCheck, Sparkles, Thermometer, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function CookMode({ params }: { params?: { id?: string } }) {
  useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const recipeId = Number(params?.id || 0);
  const recipes = trpc.recipes.list.useQuery(undefined, { enabled: !recipeId });
  const recipeQuery = trpc.recipes.get.useQuery({ recipeId: recipeId || 1 }, { enabled: recipeId > 0 });
  const [sessionId, setSessionId] = useState<number | null>(() => {
    const value = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("session") : null;
    return value ? Number(value) : null;
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [problem, setProblem] = useState("");
  const [recovery, setRecovery] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState<"loved" | "good" | "okay" | "not_for_me">("loved");
  const [adjustments, setAdjustments] = useState<string[]>([]);
  const utils = trpc.useUtils();
  const start = trpc.cook.start.useMutation({ onSuccess: session => session && setSessionId(session.id) });
  const progress = trpc.cook.progress.useMutation();
  const recover = trpc.cook.recover.useMutation({ onSuccess: data => setRecovery(data), onError: error => toast.error(error.message) });
  const rate = trpc.cook.rate.useMutation({ onSuccess: async data => { await Promise.all([utils.palate.get.invalidate(), utils.recipes.list.invalidate()]); toast.success(`Palate updated from ${data.changes.length} useful signal${data.changes.length === 1 ? "" : "s"}`); navigate("/"); }, onError: error => toast.error(error.message) });

  const record = recipeQuery.data;
  const recipe = record?.structured;
  const steps = recipe?.steps ?? [];
  const step = steps[stepIndex];
  const timerLabel = useMemo(() => `${String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`, [timerSeconds]);

  useEffect(() => {
    if (recipeId > 0 && record && !sessionId && !start.isPending) start.mutate({ recipeId });
  }, [recipeId, record, sessionId]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => setTimerSeconds(value => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    if (step?.minutes) {
      setTimerSeconds(0);
      setTimerRunning(false);
    }
  }, [stepIndex]);

  if (!recipeId) {
    return (
      <div className="min-h-screen bg-ink text-white"><header className="flex h-20 items-center px-5"><Wordmark /></header><main className="mx-auto max-w-3xl px-5 py-12"><p className="eyebrow !text-copper">Cook Mode</p><h1 className="mt-3 font-display text-5xl">Choose a recipe to begin.</h1>{recipes.isLoading ? <Loader2 className="mt-10 size-6 animate-spin" /> : recipes.data?.length ? <div className="mt-8 grid gap-3">{recipes.data.map(item => <Link key={item.id} href={`/recipe/${item.id}`} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"><img src={item.imageUrl || ""} className="size-16 rounded-xl object-cover" alt="" /><span><strong>{item.title}</strong><span className="mt-1 block text-xs text-white/45">{item.totalMinutes} minutes</span></span><ChevronRight className="ml-auto size-5 text-white/40" /></Link>)}</div> : <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8"><p className="text-white/60">There is nothing queued yet.</p><Link href="/discover" className="mt-4 inline-flex font-bold text-copper">Start with ingredients</Link></div>}</main></div>
    );
  }

  if (!recipe || !step) return <div className="grid min-h-screen place-items-center bg-ink text-copper"><Loader2 className="size-7 animate-spin" /></div>;
  const percent = Math.round(((stepIndex + 1) / steps.length) * 100);

  function nextStep() {
    if (!sessionId) return;
    if (stepIndex >= steps.length - 1) {
      progress.mutate({ sessionId, currentStep: stepIndex, status: "completed" });
      setShowRating(true);
      return;
    }
    const next = stepIndex + 1;
    setStepIndex(next);
    setRecovery(null);
    progress.mutate({ sessionId, currentStep: next });
  }

  function askRecovery(value = problem) {
    if (!sessionId || !value.trim()) return;
    setProblem(value);
    recover.mutate({ sessionId, recipeId, currentStep: stepIndex, problem: value });
  }

  function listen() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.info("Voice input is not supported in this browser. Type what is happening instead.");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const value = event.results[0][0].transcript;
      setProblem(value);
      askRecovery(value);
    };
    recognition.onerror = () => toast.error("I couldn’t hear that. Try again or type it.");
    recognition.start();
    toast.info("Listening…");
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/94 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-5xl items-center gap-4 px-4 sm:px-6"><button onClick={() => navigate(`/recipe/${recipeId}`)} aria-label="Leave Cook Mode" className="grid size-10 place-items-center rounded-full bg-white/8"><X className="size-5" /></button><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{recipe.title}</p><p className="mt-0.5 text-xs text-white/42">Step {stepIndex + 1} of {steps.length}</p></div><span className="font-mono text-xs text-copper">{percent}%</span></div>
        <div className="h-1 bg-white/8"><div className="h-full bg-copper transition-[width] duration-500" style={{ width: `${percent}%` }} /></div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_18rem] lg:py-10">
        <section className="rounded-[2rem] bg-cream p-6 text-ink shadow-2xl shadow-black/20 sm:p-10">
          <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{step.techniqueSlug.replaceAll("-", " ")}</p><h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-6xl">{step.title}</h1></div>{step.temperatureF > 0 && <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 py-2 font-mono text-xs text-copper"><Flame className="size-3.5" /> {step.temperatureF}°F</span>}</div>
          <p className="mt-7 text-xl leading-8 sm:text-2xl sm:leading-9">{step.instruction}</p>
          <div className="mt-7 rounded-2xl bg-copper/12 p-5"><p className="text-xs font-bold uppercase tracking-[0.13em] text-copper-deep">Why this matters</p><p className="mt-2 text-sm leading-6">{step.why}</p></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3"><CookCue icon={Eye} label="Look for" value={step.visualCue} /><CookCue icon={Sparkles} label="Smell for" value={step.smellCue} /><CookCue icon={Thermometer} label="Feel for" value={step.textureCue} /></div>
          <div className="mt-7 grid gap-3 rounded-2xl border border-ink/10 p-5 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-copper-deep">Common miss</p><p className="mt-2 text-sm leading-6 text-muted-ink">{step.commonMistake}</p></div><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-sage-deep">If it happens</p><p className="mt-2 text-sm leading-6 text-muted-ink">{step.recovery}</p></div></div>
          <Button onClick={nextStep} className="mt-8 h-16 w-full rounded-full bg-ink text-base font-bold text-white hover:bg-ink/90">{stepIndex === steps.length - 1 ? <><Check className="mr-2 size-5" /> Finish cooking</> : <>Next step <ArrowRight className="ml-2 size-5" /></>}</Button>
        </section>

        <aside className="space-y-4">
          {step.minutes > 0 && <section className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">Guide timer</p><Clock3 className="size-4 text-copper" /></div><p className="mt-4 font-mono text-4xl tracking-[-0.06em]">{timerLabel}</p><p className="mt-1 text-xs text-white/38">Cue target: {step.minutes} min</p><div className="mt-4 flex gap-2"><Button onClick={() => setTimerRunning(!timerRunning)} className="h-11 flex-1 rounded-full bg-copper text-ink hover:bg-[#ffb779]">{timerRunning ? <Pause className="size-4" /> : <Play className="size-4" />}</Button><Button onClick={() => { setTimerSeconds(0); setTimerRunning(false); }} variant="outline" className="size-11 rounded-full border-white/12 bg-white/5 p-0 text-white"><RotateCcw className="size-4" /></Button></div></section>}
          <button onClick={() => setShowHelp(!showHelp)} className="w-full rounded-[1.6rem] border border-copper/30 bg-copper/10 p-5 text-left"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-copper text-ink"><Mic className="size-4" /></span><div><p className="text-sm font-bold">Something changed?</p><p className="mt-1 text-xs text-white/45">Recover without restarting</p></div></div></button>
          <section className="rounded-[1.6rem] border border-sage/25 bg-sage/10 p-5"><div className="flex items-center gap-2 text-sage"><ShieldCheck className="size-4" /><p className="text-xs font-bold uppercase tracking-[0.12em]">Safety is fixed</p></div>{step.safetyRuleIds.length ? recipe.safetyRules.filter(rule => step.safetyRuleIds.includes(rule.id)).map(rule => <p key={rule.id} className="mt-3 text-xs leading-5 text-white/58">{rule.requirement}</p>) : <p className="mt-3 text-xs leading-5 text-white/48">This step has no temperature gate. General allergen and cross-contact rules still apply.</p>}</section>
        </aside>
      </main>

      {showHelp && <div className="fixed inset-0 z-50 grid items-end bg-black/60 p-3 sm:place-items-center"><div className="w-full max-w-lg rounded-[2rem] bg-cream p-6 text-ink sm:p-8"><div className="flex items-start justify-between"><div><p className="eyebrow">Live recovery</p><h2 className="mt-2 font-display text-4xl">Tell me what you see.</h2></div><button onClick={() => setShowHelp(false)} className="grid size-10 place-items-center rounded-full bg-ink/6"><X className="size-5" /></button></div><div className="mt-5 flex flex-wrap gap-2">{["Mine is browning too quickly.", "I don’t have heavy cream.", "The sauce is too thin.", "My chicken is already at 160°F.", "I forgot the garlic."].map(value => <button key={value} onClick={() => askRecovery(value)} className="rounded-full border border-ink/10 bg-white px-3 py-2 text-xs font-semibold">{value}</button>)}</div><Textarea value={problem} onChange={event => setProblem(event.target.value)} placeholder="What is happening?" className="mt-4 min-h-28 rounded-2xl bg-white" /><div className="mt-3 flex gap-2"><Button onClick={listen} variant="outline" className="size-12 rounded-full bg-white p-0"><Mic className="size-5" /></Button><Button onClick={() => askRecovery()} disabled={recover.isPending || !problem.trim()} className="h-12 flex-1 rounded-full bg-ink text-white">{recover.isPending ? <Loader2 className="size-4 animate-spin" /> : "Help me recover"}</Button></div>{recovery && <div className="mt-5 rounded-2xl bg-sage/14 p-5"><p className="font-display text-2xl">Do this now</p><p className="mt-2 text-sm leading-6">{recovery.answer}</p><ol className="mt-3 grid gap-2">{recovery.immediateActions.map((action: string, index: number) => <li key={action} className="flex gap-2 text-sm"><span className="font-mono text-copper-deep">{index + 1}</span>{action}</li>)}</ol><p className="mt-4 border-t soft-rule pt-3 text-xs leading-5 text-muted-ink">{recovery.why}</p></div>}</div></div>}

      {showRating && <div className="fixed inset-0 z-50 grid items-end bg-black/70 p-3 sm:place-items-center"><div className="w-full max-w-xl rounded-[2rem] bg-cream p-6 text-ink sm:p-9"><p className="eyebrow">Meal complete</p><h2 className="mt-2 font-display text-5xl">How was it?</h2><div className="mt-6 grid grid-cols-2 gap-2">{([['loved','Loved it'],['good','Good'],['okay','Okay'],['not_for_me','Not for me']] as const).map(([value,label]) => <button key={value} onClick={() => setRating(value)} className={`rounded-2xl border p-4 text-sm font-bold ${rating === value ? "border-copper bg-copper text-ink" : "border-ink/10 bg-white"}`}>{label}</button>)}</div><p className="mt-7 text-sm font-bold">What would have made it better?</p><div className="mt-3 flex flex-wrap gap-2">{[{id:'crispier',label:'Crispier'},{id:'less_spicy',label:'Less spicy'},{id:'more_spicy',label:'More spicy'},{id:'more_sauce',label:'More sauce'},{id:'less_rich',label:'Less rich'},{id:'more_acid',label:'More acid'},{id:'more_tender',label:'More tender'}].map(item => <button key={item.id} onClick={() => setAdjustments(values => values.includes(item.id) ? values.filter(v => v !== item.id) : [...values, item.id])} className={`rounded-full border px-3 py-2 text-xs font-bold ${adjustments.includes(item.id) ? "border-sage bg-sage/20 text-sage-deep" : "border-ink/10 bg-white"}`}>{item.label}</button>)}</div><Button onClick={() => rate.mutate({ recipeId, sessionId: sessionId || undefined, rating, adjustments: adjustments as any })} disabled={rate.isPending} className="mt-7 h-14 w-full rounded-full bg-ink text-base font-bold text-white">{rate.isPending ? <Loader2 className="size-5 animate-spin" /> : "Save meal & teach my palate"}</Button></div></div>}
    </div>
  );
}

function CookCue({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return <div className="rounded-2xl bg-ink/[0.045] p-4"><Icon className="size-4 text-copper-deep" /><p className="mt-3 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-ink">{label}</p><p className="mt-1 text-xs leading-5">{value}</p></div>;
}
