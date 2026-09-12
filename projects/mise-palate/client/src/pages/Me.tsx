import { useAuth } from "@/_core/hooks/useAuth";
import AppShell from "@/components/product/AppShell";
import { SensoryProfileView } from "@/components/product/SensoryProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { DEFAULT_PALATE, SENSORY_DIMENSIONS, type SensoryDimension, type SensoryProfile } from "@shared/product";
import { ArrowRight, ChefHat, FlaskConical, Loader2, Save, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const labels: Record<SensoryDimension, string> = { sweetness: "Sweetness", acidity: "Acidity", salt: "Salt", spice: "Spice", richness: "Richness", bitterness: "Bitterness", herbaceous: "Herbs", crunch: "Crunch", tenderness: "Tenderness", doneness: "Doneness", sauce: "Sauce", smokiness: "Smokiness" };

export default function Me() {
  const { user, logout } = useAuth({ redirectOnUnauthenticated: true });
  const profileQuery = trpc.palate.get.useQuery();
  const signals = trpc.palate.signals.useQuery();
  const [name, setName] = useState("");
  const [dimensions, setDimensions] = useState<SensoryProfile>(DEFAULT_PALATE);
  const [dislikes, setDislikes] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [guest, setGuest] = useState<SensoryProfile>({ ...DEFAULT_PALATE, spice: 18, acidity: 40, crunch: 42 });
  const [match, setMatch] = useState<any>(null);
  const utils = trpc.useUtils();
  const update = trpc.palate.update.useMutation({ onSuccess: async () => { await utils.palate.get.invalidate(); toast.success("Palate Twin updated"); }, onError: error => toast.error(error.message) });
  const erase = trpc.palate.eraseData.useMutation({ onSuccess: async () => { await Promise.all([utils.palate.get.invalidate(), utils.palate.signals.invalidate(), utils.recipes.list.invalidate()]); toast.success("Your culinary data was removed"); }, onError: error => toast.error(error.message) });
  const matchPalates = trpc.recipes.matchPalates.useMutation({ onSuccess: setMatch });

  useEffect(() => {
    if (!profileQuery.data?.profile) return;
    const p = profileQuery.data.profile;
    setName(p.displayName);
    setDimensions(p.dimensions);
    setDislikes(p.dislikedIngredients.join(", "));
    setRestrictions(p.dietaryRestrictions.join(", "));
  }, [profileQuery.data]);

  if (profileQuery.isLoading) return <AppShell><div className="grid min-h-[60vh] place-items-center"><Loader2 className="size-6 animate-spin text-copper-deep" /></div></AppShell>;
  const profile = profileQuery.data?.profile;
  if (!profile) return null;

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_20rem]"><div><p className="eyebrow">Palate Twin</p><h1 className="page-title mt-3">A model, not a favorites list.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-muted-ink">Each dimension carries both a value and confidence. Real meals add evidence without erasing your history.</p></div><div className="surface flex items-center gap-4 p-5"><span className="grid size-12 place-items-center rounded-full bg-ink font-display text-xl text-copper">{name.slice(0,1).toUpperCase()}</span><div><p className="font-bold">{name}</p><p className="mt-1 text-xs text-muted-ink">{profile.mealsLearnedFrom} meals learned from</p></div></div></section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="eyebrow">Sensory map</p><h2 className="mt-2 font-display text-3xl">What your ideal version tends toward</h2></div><Sparkles className="size-5 text-copper-deep" /></div><div className="mt-7"><SensoryProfileView profile={dimensions} /></div></section>
        <section className="surface p-6 sm:p-8"><p className="eyebrow">Edit the prior</p><h2 className="mt-2 font-display text-3xl">Direct controls</h2><div className="mt-6 grid gap-5">{SENSORY_DIMENSIONS.map(dimension => <label key={dimension} className="grid gap-2"><span className="flex justify-between text-xs font-bold"><span>{labels[dimension]}</span><span className="font-mono text-muted-ink">{dimensions[dimension]}</span></span><Slider value={[dimensions[dimension]]} min={0} max={100} step={1} onValueChange={([value]) => setDimensions(current => ({ ...current, [dimension]: value }))} /></label>)}</div></section>
      </div>

      <section className="surface mt-6 p-6 sm:p-8"><div className="grid gap-5 sm:grid-cols-3"><label className="grid gap-2 text-sm font-bold">Name<Input value={name} onChange={event => setName(event.target.value)} className="h-12 rounded-xl bg-white/65" /></label><label className="grid gap-2 text-sm font-bold">Dietary restrictions<Input value={restrictions} onChange={event => setRestrictions(event.target.value)} className="h-12 rounded-xl bg-white/65" /></label><label className="grid gap-2 text-sm font-bold">Disliked ingredients<Input value={dislikes} onChange={event => setDislikes(event.target.value)} className="h-12 rounded-xl bg-white/65" /></label></div><Button onClick={() => update.mutate({ displayName: name, dimensions, dietaryRestrictions: restrictions.split(",").map(v => v.trim()).filter(Boolean), dislikedIngredients: dislikes.split(",").map(v => v.trim()).filter(Boolean), equipment: profile.equipment })} disabled={update.isPending} className="mt-5 h-12 rounded-full bg-ink px-5 text-white"><Save className="mr-2 size-4" /> Save profile</Button></section>

      <section className="mt-10 rounded-[2rem] bg-ink p-6 text-white sm:p-9"><div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]"><div><div className="grid size-11 place-items-center rounded-2xl bg-copper text-ink"><Users className="size-5" /></div><p className="eyebrow mt-6 !text-copper">Future premium · architecture live</p><h2 className="mt-3 font-display text-4xl">Cook for two palates.</h2><p className="mt-3 text-sm leading-6 text-white/55">This demonstration finds tensions and moves them to the plate. For spice, the shared base stays mild while each diner controls the finish.</p><Button onClick={() => matchPalates.mutate({ guestName: "Guest", guestPalate: guest })} disabled={matchPalates.isPending} className="mt-6 h-12 rounded-full bg-copper px-5 text-ink hover:bg-[#ffb779]">Find the shared strategy</Button></div><div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 sm:p-6"><p className="text-sm font-bold">Guest preferences</p><div className="mt-5 grid gap-5">{(["spice", "acidity", "crunch"] as SensoryDimension[]).map(dimension => <label key={dimension} className="grid gap-2"><span className="flex justify-between text-xs font-semibold text-white/60"><span>{labels[dimension]}</span><span className="font-mono">{guest[dimension]}</span></span><Slider value={[guest[dimension]]} onValueChange={([value]) => setGuest(current => ({ ...current, [dimension]: value }))} /></label>)}</div>{match && <div className="mt-6 border-t border-white/10 pt-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-copper">Resolution</p><div className="mt-3 grid gap-3">{match.tensions.length ? match.tensions.map((item: any) => <div key={item.dimension}><p className="text-sm font-bold capitalize">{item.dimension} · {item.gap}-point gap</p><p className="mt-1 text-xs leading-5 text-white/50">{item.strategy}</p></div>) : <p className="text-sm text-white/55">These palates are close enough for one shared preparation.</p>}</div></div>}</div></div></section>

      <section className="mt-10 grid gap-4 md:grid-cols-3"><Link href="/knowledge" className="surface flex items-center gap-4 p-5"><ChefHat className="size-5 text-copper-deep" /><span><strong className="block text-sm">Chef Knowledge</strong><span className="text-xs text-muted-ink">{user?.role === "admin" ? "Review and edit" : "See the reviewed layer"}</span></span><ArrowRight className="ml-auto size-4" /></Link><div className="surface flex items-center gap-4 p-5"><ShieldCheck className="size-5 text-sage-deep" /><span><strong className="block text-sm">Safety boundaries</strong><span className="text-xs text-muted-ink">Authoritative rules stay fixed</span></span></div><button onClick={() => logout()} className="surface flex items-center gap-4 p-5 text-left"><FlaskConical className="size-5 text-muted-ink" /><span><strong className="block text-sm">Sign out</strong><span className="text-xs text-muted-ink">End this session</span></span></button></section>

      <section className="mt-8 rounded-[1.5rem] border border-destructive/20 bg-destructive/5 p-5"><p className="text-sm font-bold text-destructive">Your data remains yours.</p><p className="mt-1 text-xs leading-5 text-muted-ink">Remove your Palate Twin, scans, recipes, cooking sessions, feedback, and analytics while keeping your sign-in account available.</p><button disabled={erase.isPending} onClick={() => window.confirm("Delete all of your culinary data? This cannot be undone.") && erase.mutate()} className="mt-4 rounded-full border border-destructive/25 px-4 py-2 text-xs font-bold text-destructive">{erase.isPending ? "Removing…" : "Delete my culinary data"}</button></section>

      <section className="mt-10"><p className="eyebrow">Recent learning signals</p><div className="mt-4 grid gap-2">{signals.data?.length ? signals.data.slice(0, 12).map(signal => <div key={signal.id} className="flex items-center gap-3 rounded-xl border border-ink/8 bg-white/40 px-4 py-3 text-xs"><span className={`grid size-7 place-items-center rounded-full font-mono ${signal.direction > 0 ? "bg-sage/18 text-sage-deep" : "bg-copper/18 text-copper-deep"}`}>{signal.direction > 0 ? "+" : "−"}</span><strong className="capitalize">{signal.dimension}</strong><span className="text-muted-ink">{signal.valueBefore} → {signal.valueAfter}</span><span className="ml-auto text-muted-ink">{signal.source.replace("_", " ")}</span></div>) : <p className="text-sm text-muted-ink">Your first completed meal will create the first behavior-based signal.</p>}</div></section>
    </AppShell>
  );
}
