import { useAuth } from "@/_core/hooks/useAuth";
import AppShell from "@/components/product/AppShell";
import { SensoryProfileView } from "@/components/product/SensoryProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import {
  DEFAULT_NUTRITION_GOALS,
  DEFAULT_PALATE,
  SENSORY_DIMENSIONS,
  type NutritionGoals,
  type NutritionGoalMode,
  type SensoryDimension,
  type SensoryProfile,
} from "@shared/product";
import { Activity, ArrowRight, ChefHat, Flame, FlaskConical, Gauge, Leaf, Loader2, Save, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const labels: Record<SensoryDimension, string> = {
  sweetness: "Sweetness",
  acidity: "Acidity",
  salt: "Salt",
  spice: "Spice",
  richness: "Richness",
  bitterness: "Bitterness",
  herbaceous: "Herbs",
  crunch: "Crunch",
  tenderness: "Tenderness",
  doneness: "Doneness",
  sauce: "Sauce",
  smokiness: "Smokiness",
};

const presets: Record<Exclude<NutritionGoalMode, "custom">, NutritionGoals> = {
  balanced: { ...DEFAULT_NUTRITION_GOALS, mode: "balanced" },
  high_protein: { ...DEFAULT_NUTRITION_GOALS, mode: "high_protein", proteinGTarget: 140, carbsGTarget: 220 },
  lower_carb: { ...DEFAULT_NUTRITION_GOALS, mode: "lower_carb", proteinGTarget: 120, carbsGTarget: 140, fatGTarget: 95 },
};

function GoalProgress({ label, value, target, unit, percent, limit = false }: { label: string; value: number; target: number; unit: string; percent: number; limit?: boolean }) {
  const warning = limit && percent > 85;
  return (
    <div>
      <div className="flex items-end justify-between gap-3 text-xs">
        <span className="font-bold">{label}</span>
        <span className={`font-mono ${warning ? "text-destructive" : "text-muted-ink"}`}>{value}{unit} / {target}{unit}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/8">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${warning ? "bg-destructive" : "bg-copper"}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}

export default function Me() {
  const { user, logout } = useAuth({ redirectOnUnauthenticated: true });
  const profileQuery = trpc.palate.get.useQuery();
  const signals = trpc.palate.signals.useQuery();
  const goalsQuery = trpc.nutrition.goals.useQuery();
  const [dayRange] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { dayStartMs: start.getTime(), dayEndMs: end.getTime() };
  });
  const dailyQuery = trpc.nutrition.daily.useQuery(dayRange);
  const [name, setName] = useState("");
  const [dimensions, setDimensions] = useState<SensoryProfile>(DEFAULT_PALATE);
  const [dislikes, setDislikes] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>(DEFAULT_NUTRITION_GOALS);
  const [guest, setGuest] = useState<SensoryProfile>({ ...DEFAULT_PALATE, spice: 18, acidity: 40, crunch: 42 });
  const [match, setMatch] = useState<any>(null);
  const utils = trpc.useUtils();
  const update = trpc.palate.update.useMutation({
    onSuccess: async () => {
      await utils.palate.get.invalidate();
      toast.success("Palate Twin updated");
    },
    onError: error => toast.error(error.message),
  });
  const updateGoals = trpc.nutrition.updateGoals.useMutation({
    onSuccess: async goals => {
      setNutritionGoals(goals);
      await Promise.all([utils.nutrition.goals.invalidate(), utils.nutrition.daily.invalidate()]);
      toast.success("Nutrition targets updated");
    },
    onError: error => toast.error(error.message),
  });
  const erase = trpc.palate.eraseData.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.palate.get.invalidate(),
        utils.palate.signals.invalidate(),
        utils.recipes.list.invalidate(),
        utils.nutrition.goals.invalidate(),
        utils.nutrition.daily.invalidate(),
        utils.foodLens.history.invalidate(),
      ]);
      toast.success("Your culinary data was removed");
    },
    onError: error => toast.error(error.message),
  });
  const matchPalates = trpc.recipes.matchPalates.useMutation({ onSuccess: setMatch });

  useEffect(() => {
    if (!profileQuery.data?.profile) return;
    const profile = profileQuery.data.profile;
    setName(profile.displayName);
    setDimensions(profile.dimensions);
    setDislikes(profile.dislikedIngredients.join(", "));
    setRestrictions(profile.dietaryRestrictions.join(", "));
  }, [profileQuery.data]);

  useEffect(() => {
    if (goalsQuery.data) setNutritionGoals(goalsQuery.data);
  }, [goalsQuery.data]);

  if (profileQuery.isLoading) {
    return <AppShell><div className="grid min-h-[60vh] place-items-center"><Loader2 className="size-6 animate-spin text-copper-deep" /></div></AppShell>;
  }
  const profile = profileQuery.data?.profile;
  if (!profile) return null;
  const daily = dailyQuery.data;

  function applyPreset(mode: Exclude<NutritionGoalMode, "custom">) {
    setNutritionGoals(presets[mode]);
  }

  function setGoal<K extends keyof NutritionGoals>(key: K, value: NutritionGoals[K]) {
    setNutritionGoals(current => ({ ...current, mode: "custom", [key]: value }));
  }

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="eyebrow">Palate Twin</p>
          <h1 className="page-title mt-3">A model, not a favorites list.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-ink">Each dimension carries both a value and confidence. Real meals add evidence without erasing your history.</p>
        </div>
        <div className="surface flex items-center gap-4 p-5">
          <span className="grid size-12 place-items-center rounded-full bg-ink font-display text-xl text-copper">{name.slice(0, 1).toUpperCase()}</span>
          <div><p className="font-bold">{name}</p><p className="mt-1 text-xs text-muted-ink">{profile.mealsLearnedFrom} meals learned from</p></div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface p-6 sm:p-8">
          <div className="flex items-center justify-between"><div><p className="eyebrow">Sensory map</p><h2 className="mt-2 font-display text-3xl">What your ideal version tends toward</h2></div><Sparkles className="size-5 text-copper-deep" /></div>
          <div className="mt-7"><SensoryProfileView profile={dimensions} /></div>
        </section>
        <section className="surface p-6 sm:p-8">
          <p className="eyebrow">Edit the prior</p><h2 className="mt-2 font-display text-3xl">Direct controls</h2>
          <div className="mt-6 grid gap-5">{SENSORY_DIMENSIONS.map(dimension => <label key={dimension} className="grid gap-2"><span className="flex justify-between text-xs font-bold"><span>{labels[dimension]}</span><span className="font-mono text-muted-ink">{dimensions[dimension]}</span></span><Slider value={[dimensions[dimension]]} min={0} max={100} step={1} onValueChange={([value]) => setDimensions(current => ({ ...current, [dimension]: value }))} /></label>)}</div>
        </section>
      </div>

      <section className="surface mt-6 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold">Name<Input value={name} onChange={event => setName(event.target.value)} className="h-12 rounded-xl bg-white/65" /></label>
          <label className="grid gap-2 text-sm font-bold">Dietary restrictions<Input value={restrictions} onChange={event => setRestrictions(event.target.value)} className="h-12 rounded-xl bg-white/65" /></label>
          <label className="grid gap-2 text-sm font-bold">Disliked ingredients<Input value={dislikes} onChange={event => setDislikes(event.target.value)} className="h-12 rounded-xl bg-white/65" /></label>
        </div>
        <Button onClick={() => update.mutate({ displayName: name, dimensions, dietaryRestrictions: restrictions.split(",").map(v => v.trim()).filter(Boolean), dislikedIngredients: dislikes.split(",").map(v => v.trim()).filter(Boolean), equipment: profile.equipment })} disabled={update.isPending} className="mt-5 h-12 rounded-full bg-ink px-5 text-white"><Save className="mr-2 size-4" /> Save profile</Button>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-ink p-6 text-white sm:p-8">
          <div className="flex items-start justify-between">
            <div><p className="eyebrow !text-copper">Today’s nutrition</p><h2 className="mt-2 font-display text-4xl">Logged, not guessed.</h2></div>
            <Activity className="size-6 text-copper" />
          </div>
          <p className="mt-3 text-xs leading-5 text-white/55">Food Lens scans count only after you explicitly mark them as eaten. All values remain portion-based estimates.</p>
          <div className="mt-7 grid gap-5">
            <GoalProgress label="Energy" value={daily?.total.calories ?? 0} target={nutritionGoals.caloriesTarget} unit=" kcal" percent={daily?.progress.calories ?? 0} />
            <GoalProgress label="Protein" value={daily?.total.proteinG ?? 0} target={nutritionGoals.proteinGTarget} unit="g" percent={daily?.progress.protein ?? 0} />
            <GoalProgress label="Carbohydrate" value={daily?.total.carbsG ?? 0} target={nutritionGoals.carbsGTarget} unit="g" percent={daily?.progress.carbs ?? 0} />
            <GoalProgress label="Fat" value={daily?.total.fatG ?? 0} target={nutritionGoals.fatGTarget} unit="g" percent={daily?.progress.fat ?? 0} />
            <GoalProgress label="Fiber" value={daily?.total.fiberG ?? 0} target={nutritionGoals.fiberGTarget} unit="g" percent={daily?.progress.fiber ?? 0} />
            <GoalProgress label="Sodium limit" value={daily?.total.sodiumMg ?? 0} target={nutritionGoals.sodiumMgLimit} unit="mg" percent={daily?.progress.sodium ?? 0} limit />
          </div>
          <div className="mt-7 rounded-2xl bg-white/7 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-copper">Planning signal</p>
            {(daily?.guidance ?? ["Log a Food Lens meal to see goal-aware planning signals."]).map(note => <p key={note} className="mt-2 text-xs leading-5 text-white/65">{note}</p>)}
          </div>
          <Link href="/lens" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-copper">Open Food Lens <ArrowRight className="size-3.5" /></Link>
        </div>

        <div className="surface p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div><p className="eyebrow">Nutrition targets</p><h2 className="mt-2 font-display text-3xl">Choose the planning frame.</h2></div>
            <Target className="size-5 text-copper-deep" />
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-ink">These are user-selected recipe-planning preferences, not clinical recommendations. Use targets from a qualified professional when needed.</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {(["balanced", "high_protein", "lower_carb"] as const).map(mode => (
              <button key={mode} onClick={() => applyPreset(mode)} className={`rounded-xl border px-2 py-3 text-[0.68rem] font-bold capitalize ${nutritionGoals.mode === mode ? "border-copper bg-copper/12 text-copper-deep" : "border-ink/10 bg-white/50 text-muted-ink"}`}>
                {mode.replace("_", " ")}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["caloriesTarget", "Daily energy", "kcal"],
              ["proteinGTarget", "Protein", "g"],
              ["carbsGTarget", "Carbohydrate", "g"],
              ["fatGTarget", "Fat", "g"],
              ["fiberGTarget", "Fiber", "g"],
              ["sodiumMgLimit", "Sodium limit", "mg"],
            ].map(([key, label, unit]) => (
              <label key={key} className="grid gap-2 text-xs font-bold">
                <span className="flex justify-between"><span>{label}</span><span className="text-muted-ink">{unit}</span></span>
                <Input type="number" value={nutritionGoals[key as keyof NutritionGoals] as number} onChange={event => setGoal(key as keyof NutritionGoals, Number(event.target.value) as never)} className="h-11 rounded-xl bg-white/65 font-mono" />
              </label>
            ))}
          </div>
          <Button onClick={() => updateGoals.mutate(nutritionGoals)} disabled={updateGoals.isPending} className="mt-6 h-12 rounded-full bg-ink px-5 text-white"><Save className="mr-2 size-4" /> Save nutrition targets</Button>
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] bg-ink p-6 text-white sm:p-9">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div><div className="grid size-11 place-items-center rounded-2xl bg-copper text-ink"><Users className="size-5" /></div><p className="eyebrow mt-6 !text-copper">Future premium · architecture live</p><h2 className="mt-3 font-display text-4xl">Cook for two palates.</h2><p className="mt-3 text-sm leading-6 text-white/55">This demonstration finds tensions and moves them to the plate. For spice, the shared base stays mild while each diner controls the finish.</p><Button onClick={() => matchPalates.mutate({ guestName: "Guest", guestPalate: guest })} disabled={matchPalates.isPending} className="mt-6 h-12 rounded-full bg-copper px-5 text-ink hover:bg-[#ffb779]">Find the shared strategy</Button></div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 sm:p-6"><p className="text-sm font-bold">Guest preferences</p><div className="mt-5 grid gap-5">{(["spice", "acidity", "crunch"] as SensoryDimension[]).map(dimension => <label key={dimension} className="grid gap-2"><span className="flex justify-between text-xs font-semibold text-white/60"><span>{labels[dimension]}</span><span className="font-mono">{guest[dimension]}</span></span><Slider value={[guest[dimension]]} onValueChange={([value]) => setGuest(current => ({ ...current, [dimension]: value }))} /></label>)}</div>{match && <div className="mt-6 border-t border-white/10 pt-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-copper">Resolution</p><div className="mt-3 grid gap-3">{match.tensions.length ? match.tensions.map((item: any) => <div key={item.dimension}><p className="text-sm font-bold capitalize">{item.dimension} · {item.gap}-point gap</p><p className="mt-1 text-xs leading-5 text-white/50">{item.strategy}</p></div>) : <p className="text-sm text-white/55">These palates are close enough for one shared preparation.</p>}</div></div>}</div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Link href="/knowledge" className="surface flex items-center gap-4 p-5"><ChefHat className="size-5 text-copper-deep" /><span><strong className="block text-sm">Chef Knowledge</strong><span className="text-xs text-muted-ink">{user?.role === "admin" ? "Review and edit" : "See the reviewed layer"}</span></span><ArrowRight className="ml-auto size-4" /></Link>
        <div className="surface flex items-center gap-4 p-5"><ShieldCheck className="size-5 text-sage-deep" /><span><strong className="block text-sm">Safety boundaries</strong><span className="text-xs text-muted-ink">Authoritative rules stay fixed</span></span></div>
        <button onClick={() => logout()} className="surface flex items-center gap-4 p-5 text-left"><FlaskConical className="size-5 text-muted-ink" /><span><strong className="block text-sm">Sign out</strong><span className="text-xs text-muted-ink">End this session</span></span></button>
      </section>

      <section className="mt-8 rounded-[1.5rem] border border-destructive/20 bg-destructive/5 p-5">
        <p className="text-sm font-bold text-destructive">Your data remains yours.</p>
        <p className="mt-1 text-xs leading-5 text-muted-ink">Remove your Palate Twin, scans, nutrition goals and logs, recipes, semantic memories, cooking sessions, feedback, and analytics while keeping your sign-in account available.</p>
        <button disabled={erase.isPending} onClick={() => window.confirm("Delete all of your culinary data? This cannot be undone.") && erase.mutate()} className="mt-4 rounded-full border border-destructive/25 px-4 py-2 text-xs font-bold text-destructive">{erase.isPending ? "Removing…" : "Delete my culinary data"}</button>
      </section>

      <section className="mt-10">
        <p className="eyebrow">Recent learning signals</p>
        <div className="mt-4 grid gap-2">{signals.data?.length ? signals.data.slice(0, 12).map(signal => <div key={signal.id} className="flex items-center gap-3 rounded-xl border border-ink/8 bg-white/40 px-4 py-3 text-xs"><span className={`grid size-7 place-items-center rounded-full font-mono ${signal.direction > 0 ? "bg-sage/18 text-sage-deep" : "bg-copper/18 text-copper-deep"}`}>{signal.direction > 0 ? "+" : "−"}</span><strong className="capitalize">{signal.dimension}</strong><span className="text-muted-ink">{signal.valueBefore} → {signal.valueAfter}</span><span className="ml-auto text-muted-ink">{signal.source.replace("_", " ")}</span></div>) : <p className="text-sm text-muted-ink">Your first completed meal will create the first behavior-based signal.</p>}</div>
      </section>
    </AppShell>
  );
}
