import { useAuth } from "@/_core/hooks/useAuth";
import AppShell from "@/components/product/AppShell";
import { ForecastDelta, SensoryProfileView } from "@/components/product/SensoryProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { DISH_IMAGES } from "@shared/product";
import { ArrowLeft, ChefHat, Clock3, Heart, Info, Layers3, Loader2, ShieldCheck, Sparkles, Utensils, WandSparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function Recipe({ params }: { params: { id: string } }) {
  useAuth({ redirectOnUnauthenticated: true });
  const recipeId = Number(params.id);
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const recipeQuery = trpc.recipes.get.useQuery({ recipeId });
  const [change, setChange] = useState("Add one tablespoon more lemon");
  const [missing, setMissing] = useState("heavy cream");
  const [forecast, setForecast] = useState<any>(null);
  const [substitution, setSubstitution] = useState<any>(null);
  const favorite = trpc.recipes.favorite.useMutation({ onSuccess: () => { utils.recipes.get.invalidate({ recipeId }); utils.recipes.list.invalidate(); } });
  const start = trpc.cook.start.useMutation({ onSuccess: session => navigate(`/cook/${recipeId}?session=${session?.id}`), onError: error => toast.error(error.message) });
  const forecastMutation = trpc.recipes.forecast.useMutation({ onSuccess: setForecast, onError: error => toast.error(error.message) });
  const substitute = trpc.recipes.substitute.useMutation({ onSuccess: setSubstitution, onError: error => toast.error(error.message) });

  if (recipeQuery.isLoading) return <AppShell><div className="grid min-h-[60vh] place-items-center"><Loader2 className="size-6 animate-spin text-copper-deep" /></div></AppShell>;
  if (!recipeQuery.data) return <AppShell><div className="surface mx-auto max-w-xl p-10 text-center"><h1 className="font-display text-4xl">Recipe not found.</h1><Link href="/saved" className="mt-5 inline-flex text-sm font-bold text-copper-deep">Return to saved recipes</Link></div></AppShell>;
  const record = recipeQuery.data;
  const recipe = record.structured;

  return (
    <AppShell>
      <div className="mb-5 flex items-center justify-between"><button onClick={() => navigate("/saved")} className="inline-flex items-center gap-2 text-sm font-bold text-muted-ink"><ArrowLeft className="size-4" /> Recipe memory</button><button aria-label={record.favorite ? "Remove favorite" : "Add favorite"} onClick={() => favorite.mutate({ recipeId, favorite: !record.favorite })} className={`grid size-11 place-items-center rounded-full border ${record.favorite ? "border-copper bg-copper/18 text-copper-deep" : "border-ink/10 bg-white/50 text-muted-ink"}`}><Heart className={`size-5 ${record.favorite ? "fill-current" : ""}`} /></button></div>
      <section className="grid overflow-hidden rounded-[2rem] bg-ink text-white shadow-2xl shadow-ink/15 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[23rem] lg:min-h-[34rem]"><img src={record.imageUrl || DISH_IMAGES.lemon} alt={recipe.title} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 lg:hidden"><span className="rounded-full bg-copper px-3 py-1.5 text-xs font-bold text-ink">Made for your palate</span></div></div>
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12"><p className="eyebrow !text-copper">Version {record.version} · {record.generationMode === "live_ai" ? "Live culinary reasoning" : "Reviewed fallback"}</p><h1 className="mt-5 font-display text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl">{recipe.title}</h1><p className="mt-6 text-base leading-7 text-white/68">{recipe.summary}</p><div className="mt-7 flex flex-wrap gap-4 text-xs font-semibold text-white/55"><span className="inline-flex items-center gap-1.5"><Clock3 className="size-4 text-copper" /> {recipe.activeMinutes} active · {recipe.totalMinutes} total</span><span className="inline-flex items-center gap-1.5"><ChefHat className="size-4 text-copper" /> {recipe.difficulty}</span></div><Button onClick={() => start.mutate({ recipeId })} disabled={start.isPending} className="mt-9 h-14 rounded-full bg-copper text-base font-bold text-ink hover:bg-[#ffb779]">{start.isPending ? <Loader2 className="size-5 animate-spin" /> : <><Utensils className="mr-2 size-5" /> Start Cook Mode</>}</Button></div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="surface p-6 sm:p-8"><div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sage/18 text-sage-deep"><ChefHat className="size-5" /></span><div><p className="eyebrow">Chef’s read</p><h2 className="mt-2 font-display text-3xl">Why this works for you</h2><p className="mt-3 text-sm leading-6 text-muted-ink">{recipe.rationale}</p></div></div></section>

          <section className="surface p-6 sm:p-8"><div className="flex items-center gap-3"><Layers3 className="size-5 text-copper-deep" /><div><p className="eyebrow">Before heat</p><h2 className="mt-1 font-display text-3xl">Mise en place</h2></div></div><div className="mt-6 grid gap-4">{recipe.miseEnPlace.map(item => <div key={item.order} className="grid grid-cols-[2rem_1fr] gap-3"><span className="font-mono text-sm text-copper-deep">{String(item.order).padStart(2, "0")}</span><div><p className="font-semibold">{item.task}</p><p className="mt-1 text-xs leading-5 text-muted-ink">{item.reason}{item.canParallelize ? " · Can run in parallel." : ""}</p></div></div>)}</div></section>

          <section className="surface p-6 sm:p-8"><p className="eyebrow">Cook sequence</p><h2 className="mt-2 font-display text-3xl">The cues matter more than the clock.</h2><div className="mt-7 grid gap-7">{recipe.steps.map((step, index) => <article key={step.id} className="border-t soft-rule pt-6 first:border-0 first:pt-0"><div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink font-mono text-xs text-copper">{index + 1}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-2xl">{step.title}</h3>{step.minutes > 0 && <span className="rounded-full bg-ink/6 px-2.5 py-1 text-xs font-bold text-muted-ink">{step.minutes} min guide</span>}</div><p className="mt-3 text-sm leading-6">{step.instruction}</p><div className="mt-4 rounded-2xl bg-copper/10 p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-copper-deep">Why it matters</p><p className="mt-1.5 text-sm leading-5">{step.why}</p></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Cue label="Look" value={step.visualCue} /><Cue label="Smell" value={step.smellCue} /><Cue label="Feel" value={step.textureCue} /></div></div></div></article>)}</div></section>

          <section className="surface overflow-hidden"><div className="bg-ink p-6 text-white sm:p-8"><div className="flex items-center gap-3"><WandSparkles className="size-5 text-copper" /><p className="eyebrow !text-copper">Taste Forecast</p></div><h2 className="mt-3 font-display text-4xl">Ask before you change it.</h2><p className="mt-2 text-sm leading-6 text-white/55">Forecasts are culinary estimates, not safety rules. They explain direction and tradeoffs.</p><div className="mt-6 flex gap-2"><Input value={change} onChange={event => setChange(event.target.value)} onKeyDown={event => event.key === "Enter" && forecastMutation.mutate({ recipeId, requestedChange: change })} className="h-12 rounded-full border-white/15 bg-white/10 px-5 text-white" /><Button onClick={() => forecastMutation.mutate({ recipeId, requestedChange: change })} disabled={forecastMutation.isPending} className="size-12 shrink-0 rounded-full bg-copper p-0 text-ink hover:bg-[#ffb779]"><Sparkles className="size-5" /></Button></div></div>{forecast && <div className="p-6 sm:p-8"><div className="flex items-center justify-between"><h3 className="font-display text-2xl">{forecast.interpretation}</h3><span className="rounded-full bg-sage/18 px-2.5 py-1 text-xs font-bold text-sage-deep">{forecast.confidence} confidence</span></div><div className="mt-5 flex flex-wrap gap-2">{forecast.changes.map((item: any) => <ForecastDelta key={item.dimension} dimension={item.dimension} delta={item.delta} />)}</div><div className="mt-5 grid gap-3">{forecast.changes.map((item: any) => <p key={item.dimension} className="text-sm leading-6"><strong className="capitalize">{item.dimension}:</strong> <span className="text-muted-ink">{item.explanation}</span></p>)}</div><div className="mt-5 border-t soft-rule pt-4 text-xs leading-5 text-muted-ink">{forecast.watchOuts.join(" ")}</div></div>}</section>

          <section className="surface p-6 sm:p-8"><p className="eyebrow">Missing something?</p><h2 className="mt-2 font-display text-3xl">Substitute without losing the plot.</h2><div className="mt-5 flex gap-2"><Input value={missing} onChange={event => setMissing(event.target.value)} className="h-12 rounded-full bg-white/60 px-5" /><Button onClick={() => substitute.mutate({ recipeId, missingIngredient: missing, context: "Preserve the character of the dish" })} disabled={substitute.isPending} className="h-12 rounded-full bg-ink px-5 text-white">Find swap</Button></div>{substitution && <div className="mt-5 rounded-2xl bg-sage/12 p-5"><p className="font-display text-2xl">Use {substitution.substitute}</p><p className="mt-2 text-sm"><strong>Ratio:</strong> {substitution.ratio}</p><p className="mt-2 text-sm leading-6 text-muted-ink">{substitution.sensoryTradeoff} {substitution.methodChange}</p></div>}</section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="surface p-6"><p className="eyebrow">Ingredients</p><div className="mt-5 grid gap-3">{recipe.ingredients.map((ingredient, index) => <div key={`${ingredient.name}-${index}`} className="flex justify-between gap-4 border-b soft-rule pb-3 text-sm last:border-0"><span className="font-semibold">{ingredient.name}<span className="mt-0.5 block text-xs font-normal text-muted-ink">{ingredient.preparation}</span></span><span className="shrink-0 font-mono text-xs text-muted-ink">{ingredient.amount} {ingredient.unit}</span></div>)}</div></section>
          <section className="surface p-6"><p className="eyebrow">Sensory shape</p><div className="mt-5"><SensoryProfileView profile={recipe.sensoryProfile} compact limit={7} /></div></section>
          <section className="rounded-[1.5rem] border border-sage/30 bg-sage/14 p-6"><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-sage-deep" /><p className="text-xs font-bold uppercase tracking-[0.12em] text-sage-deep">Fixed safety layer</p></div><div className="mt-4 grid gap-4">{recipe.safetyRules.map(rule => <div key={rule.id}><p className="text-sm font-bold">{rule.title}</p><p className="mt-1 text-xs leading-5 text-muted-ink">{rule.requirement}</p><a href={rule.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[0.68rem] font-bold text-sage-deep">Source <Info className="size-3" /></a></div>)}</div></section>
        </aside>
      </div>
    </AppShell>
  );
}

function Cue({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-ink/8 bg-white/45 p-3"><p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-copper-deep">{label}</p><p className="mt-1 text-xs leading-5 text-muted-ink">{value}</p></div>;
}
