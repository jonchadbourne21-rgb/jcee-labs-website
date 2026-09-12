import { useAuth } from "@/_core/hooks/useAuth";
import AppShell from "@/components/product/AppShell";
import { SensoryProfileView } from "@/components/product/SensoryProfile";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { DISH_IMAGES } from "@shared/product";
import { ArrowRight, Camera, ChefHat, Clock3, ScanLine, Sparkles, Utensils } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const palate = trpc.palate.get.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const recipes = trpc.recipes.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });

  if (loading) return <div className="grid min-h-screen place-items-center bg-canvas text-sm font-semibold text-muted-ink">Setting the kitchen…</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ink text-cream">
        <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 lg:px-8">
          <div className="font-display text-3xl">Mise</div>
          <Button onClick={startLogin} variant="outline" className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10">Sign in</Button>
        </header>
        <main className="mx-auto grid max-w-6xl gap-8 px-5 pb-16 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:pt-14">
          <section className="reveal max-w-xl">
            <p className="eyebrow !text-copper">Personal culinary intelligence</p>
            <h1 className="display-title mt-5 text-cream">A chef who learns your taste.</h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-white/66">Show Mise what you have or what you crave. It turns that into the version of the dish you will enjoy most, explains the judgment, and gets smarter after every cook.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button onClick={startLogin} size="lg" className="h-13 rounded-full bg-copper px-6 text-ink hover:bg-[#ffb779]">Build my Palate Twin <ArrowRight className="ml-2 size-4" /></Button>
              <a href="#why" className="inline-flex h-13 items-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white/78">See how it works</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-white/50">
              <span className="inline-flex items-center gap-2"><ScanLine className="size-4 text-copper" /> Confirmed vision</span>
              <span className="inline-flex items-center gap-2"><ChefHat className="size-4 text-copper" /> Chef reasoning</span>
              <span className="inline-flex items-center gap-2"><Sparkles className="size-4 text-copper" /> Taste Forecast</span>
            </div>
          </section>
          <section className="photo-vignette reveal-delay relative min-h-[31rem] overflow-hidden rounded-[2rem] border border-white/10">
            <img src={DISH_IMAGES.lemon} alt="Crispy lemon Parmesan chicken with roasted broccoli" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 z-10 p-7 sm:p-9">
              <div className="mb-3 inline-flex rounded-full bg-cream/92 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink">Forecast: brighter + crispier</div>
              <p className="font-display text-3xl leading-tight">“Add lemon late, and keep the sauce away from the skin.”</p>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/64">Not just a recipe. A reasoned decision for your palate.</p>
            </div>
          </section>
        </main>
        <section id="why" className="border-t border-white/10 bg-[#1d281e]">
          <div className="mx-auto grid max-w-6xl gap-px bg-white/10 lg:grid-cols-3">
            {[
              ["01", "Chef DNA", "Structured technique, timing, cues, failure modes and recoveries—not invented on demand."],
              ["02", "Palate Twin", "An evolving sensory model built from decisions and real cooking outcomes."],
              ["03", "Taste Forecast", "See what a change will do to brightness, crunch, richness and texture before you commit."],
            ].map(([n, title, body]) => (
              <div key={n} className="bg-[#1d281e] p-8 lg:p-10"><span className="font-mono text-xs text-copper">{n}</span><h2 className="mt-8 font-display text-3xl">{title}</h2><p className="mt-3 text-sm leading-6 text-white/56">{body}</p></div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const profile = palate.data?.profile;
  const recent = recipes.data?.[0];
  const firstName = profile?.displayName || user?.name?.split(" ")[0] || "Cook";

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="relative min-h-[31rem] overflow-hidden rounded-[2rem] bg-ink text-white shadow-2xl shadow-ink/15">
          <img src={DISH_IMAGES.ingredients} alt="Chicken, broccoli, lemon, garlic and Parmesan arranged for cooking" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-transparent to-black/85" />
          <div className="relative flex min-h-[31rem] flex-col justify-between p-6 sm:p-9">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">Good to see you, {firstName}</span>
              <span className="rounded-full bg-sage/85 px-3 py-1.5 text-xs font-bold text-ink">Palate online</span>
            </div>
            <div className="max-w-xl">
              <p className="eyebrow !text-[#ffc18e]">Tonight starts here</p>
              <h1 className="mt-3 font-display text-5xl leading-[0.96] tracking-[-0.025em] sm:text-6xl">Show me what you’ve got.</h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/68">Photograph your counter or fridge. You confirm what Mise sees before any recipe is made.</p>
              <Button onClick={() => navigate(profile?.calibrationComplete ? "/discover" : "/onboarding")} className="mt-6 h-14 rounded-full bg-copper px-6 text-base font-bold text-ink hover:bg-[#ffb779]">
                <Camera className="mr-2 size-5" /> {profile?.calibrationComplete ? "Open the camera" : "Calibrate my palate"}
              </Button>
            </div>
          </div>
        </section>

        <aside className="surface p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><p className="eyebrow">Your Palate Twin</p><h2 className="mt-2 font-display text-3xl">Learning the edges.</h2></div>
            <span className="font-mono text-xs text-muted-ink">{profile?.mealsLearnedFrom ?? 0} meals</span>
          </div>
          {profile && <div className="mt-7"><SensoryProfileView profile={profile.dimensions} compact limit={6} /></div>}
          <Link href={profile?.calibrationComplete ? "/me" : "/onboarding"} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-copper-deep">{profile?.calibrationComplete ? "See the full twin" : "Finish calibration"} <ArrowRight className="size-4" /></Link>
          <div className="mt-7 border-t soft-rule pt-5">
            <p className="text-xs leading-5 text-muted-ink">Your model preserves historical signals. One rating nudges it; it does not overwrite who you are.</p>
          </div>
        </aside>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          [Utensils, "Describe ingredients", "No photo needed", "/discover?mode=text"],
          [Sparkles, "Tell me a craving", "Start from the outcome", "/discover?mode=craving"],
          [ChefHat, "Let the chef choose", "Use your strongest signals", "/discover?mode=chef"],
        ].map(([Icon, title, sub, href]) => {
          const I = Icon as typeof Utensils;
          return <Link key={title as string} href={href as string} className="surface group flex items-center gap-4 p-5 hover:-translate-y-0.5"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-copper"><I className="size-5" /></span><span><strong className="block text-sm">{title as string}</strong><span className="mt-0.5 block text-xs text-muted-ink">{sub as string}</span></span><ArrowRight className="ml-auto size-4 text-muted-ink transition-transform group-hover:translate-x-1" /></Link>;
        })}
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">Recipe memory</p><h2 className="mt-2 font-display text-4xl">Pick up where you left off.</h2></div><Link href="/saved" className="hidden text-sm font-bold text-copper-deep sm:block">View all</Link></div>
        {recent ? (
          <Link href={`/recipe/${recent.id}`} className="surface grid overflow-hidden md:grid-cols-[15rem_1fr]">
            <img src={recent.imageUrl || DISH_IMAGES.lemon} alt="" className="h-52 w-full object-cover md:h-full" />
            <div className="p-6 sm:p-8"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-sage/18 px-2.5 py-1 text-xs font-bold text-sage-deep">v{recent.version}</span><span className="rounded-full bg-ink/6 px-2.5 py-1 text-xs font-semibold text-muted-ink">{recent.generationMode === "live_ai" ? "AI + Chef Knowledge" : "Reviewed fallback"}</span></div><h3 className="mt-4 font-display text-3xl">{recent.title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-ink">{recent.rationale}</p><div className="mt-5 flex gap-5 text-xs font-semibold text-muted-ink"><span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" /> {recent.totalMinutes} min</span><span>{recent.difficulty}</span></div></div>
          </Link>
        ) : (
          <div className="surface px-6 py-12 text-center"><p className="font-display text-3xl">Your first living recipe starts with one photo.</p><p className="mx-auto mt-2 max-w-md text-sm text-muted-ink">After you cook and rate it, Mise will carry what worked into the next version.</p></div>
        )}
      </section>
    </AppShell>
  );
}
