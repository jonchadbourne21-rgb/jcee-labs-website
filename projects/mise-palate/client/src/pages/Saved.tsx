import { useAuth } from "@/_core/hooks/useAuth";
import AppShell from "@/components/product/AppShell";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { DISH_IMAGES } from "@shared/product";
import { Clock3, Heart, Loader2, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

export default function Saved() {
  useAuth({ redirectOnUnauthenticated: true });
  const recipes = trpc.recipes.list.useQuery();
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const filtered = useMemo(() => (recipes.data ?? []).filter(item => (!favoritesOnly || item.favorite) && `${item.title} ${item.summary}`.toLowerCase().includes(query.toLowerCase())), [recipes.data, query, favoritesOnly]);
  return (
    <AppShell>
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Living recipes</p><h1 className="page-title mt-3">Your cooking memory.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-ink">Recipes keep their versions, your outcomes, and the sensory direction for next time.</p></div><button onClick={() => setFavoritesOnly(!favoritesOnly)} className={`inline-flex h-11 items-center gap-2 self-start rounded-full border px-4 text-sm font-bold ${favoritesOnly ? "border-copper bg-copper/20 text-copper-deep" : "border-ink/10 bg-white/55 text-muted-ink"}`}><Heart className={`size-4 ${favoritesOnly ? "fill-current" : ""}`} /> Favorites</button></section>
      <div className="relative mt-8 max-w-xl"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-ink" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search recipes, ingredients, notes…" className="h-13 rounded-full bg-white/65 pl-11" /></div>
      {recipes.isLoading ? <div className="grid min-h-72 place-items-center"><Loader2 className="size-6 animate-spin text-copper-deep" /></div> : filtered.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(item => <Link key={item.id} href={`/recipe/${item.id}`} className="surface group overflow-hidden"><div className="relative h-52 overflow-hidden"><img src={item.imageUrl || DISH_IMAGES.lemon} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />{item.favorite && <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-cream/92 text-copper-deep"><Heart className="size-4 fill-current" /></span>}</div><div className="p-5"><div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.11em] text-copper-deep"><span>v{item.version}</span><span className="text-ink/20">·</span><span>{item.generationMode === "live_ai" ? "AI + knowledge" : "reviewed fallback"}</span></div><h2 className="mt-3 font-display text-3xl leading-tight">{item.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-ink">{item.summary}</p><div className="mt-5 flex items-center gap-4 text-xs font-semibold text-muted-ink"><span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" /> {item.totalMinutes} min</span><span>{item.difficulty}</span></div></div></Link>)}</div> : <div className="surface mt-7 grid min-h-72 place-items-center p-8 text-center"><div><Sparkles className="mx-auto size-7 text-copper-deep" /><h2 className="mt-4 font-display text-3xl">Nothing here yet.</h2><p className="mt-2 text-sm text-muted-ink">Cook your first dish to begin a memory worth keeping.</p><Link href="/discover" className="mt-5 inline-flex font-bold text-copper-deep">Start with what you have</Link></div></div>}
    </AppShell>
  );
}
