import { useAuth } from "@/_core/hooks/useAuth";
import AppShell from "@/components/product/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { DISH_IMAGES } from "@shared/product";
import {
  Clock3,
  Heart,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Tag as TagIcon,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const POPULAR_SUGGESTIONS = [
  "weeknight",
  "crispy",
  "high protein",
  "quick cleanup",
  "guests",
  "date night",
  "sheet pan",
  "comfort",
];

export default function Saved() {
  useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const recipes = trpc.recipes.list.useQuery();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"favorites" | "all">("favorites");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [taggingRecipeId, setTaggingRecipeId] = useState<number | null>(null);
  const [newTagInput, setNewTagInput] = useState("");

  const favoriteMutation = trpc.recipes.favorite.useMutation({
    onSuccess: async () => {
      await utils.recipes.list.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const tagMutation = trpc.recipes.setTags.useMutation({
    onSuccess: async () => {
      await utils.recipes.list.invalidate();
      toast.success("Tags updated");
    },
    onError: error => toast.error(error.message),
  });

  const allRecipes = useMemo(() => recipes.data ?? [], [recipes.data]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const recipe of allRecipes) {
      for (const tag of (recipe.tags as string[] | undefined) ?? []) {
        set.add(tag);
      }
    }
    return Array.from(set).sort();
  }, [allRecipes]);

  const favorites = useMemo(
    () => allRecipes.filter(item => item.favorite),
    [allRecipes]
  );

  const activeCollection = activeTab === "favorites" ? favorites : allRecipes;

  const filtered = useMemo(() => {
    return activeCollection.filter(item => {
      const tags = (item.tags as string[] | undefined) ?? [];
      const matchesTag = selectedTag === "all" || tags.includes(selectedTag);
      const matchesQuery =
        query.trim().length === 0 ||
        `${item.title} ${item.summary} ${tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return matchesTag && matchesQuery;
    });
  }, [activeCollection, selectedTag, query]);

  const recipeBeingTagged = useMemo(
    () => allRecipes.find(item => item.id === taggingRecipeId) ?? null,
    [allRecipes, taggingRecipeId]
  );

  function addTagToRecipe(recipeId: number, tagToAdd: string) {
    const recipe = allRecipes.find(item => item.id === recipeId);
    if (!recipe) return;
    const current = (recipe.tags as string[] | undefined) ?? [];
    const clean = tagToAdd.trim().toLowerCase();
    if (!clean) return;
    if (current.includes(clean)) return;
    if (current.length >= 8) {
      toast.info("Limit is 8 tags per recipe");
      return;
    }
    tagMutation.mutate({ recipeId, tags: [...current, clean] });
    setNewTagInput("");
  }

  function removeTagFromRecipe(recipeId: number, tagToRemove: string) {
    const recipe = allRecipes.find(item => item.id === recipeId);
    if (!recipe) return;
    const current = (recipe.tags as string[] | undefined) ?? [];
    tagMutation.mutate({
      recipeId,
      tags: current.filter(tag => tag !== tagToRemove),
    });
  }

  return (
    <AppShell>
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Living memory</p>
          <h1 className="page-title mt-3">Favorites & Recipe Memory</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-ink">
            Keep your most successful personalized dishes at hand, label them by
            context or meal role, and jump straight into Cook Mode.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 p-1 self-start">
          <button
            onClick={() => {
              setActiveTab("favorites");
              setSelectedTag("all");
            }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${activeTab === "favorites" ? "bg-ink text-white" : "text-muted-ink hover:text-ink"}`}
          >
            <Heart className="size-3.5 fill-current text-copper" />
            Favorites ({favorites.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("all");
              setSelectedTag("all");
            }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${activeTab === "all" ? "bg-ink text-white" : "text-muted-ink hover:text-ink"}`}
          >
            All Saved ({allRecipes.length})
          </button>
        </div>
      </section>

      <div className="mt-7 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
          <Input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search favorites, ingredients, or custom tags…"
            className="h-13 rounded-full bg-white/65 pl-11"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2" aria-label="Tag filter bar">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-ink pl-1">
          <TagIcon className="size-3 text-copper-deep" /> Tags:
        </span>
        <button
          onClick={() => setSelectedTag("all")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${selectedTag === "all" ? "bg-ink text-white" : "border border-ink/10 bg-white/60 text-muted-ink hover:text-ink"}`}
        >
          All {activeTab === "favorites" ? "Favorites" : "Recipes"}
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(current => (current === tag ? "all" : tag))}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${selectedTag === tag ? "bg-copper text-ink" : "border border-ink/10 bg-white/60 text-muted-ink hover:text-ink"}`}
          >
            #{tag}
          </button>
        ))}
        {allTags.length === 0 && (
          <span className="text-xs text-muted-ink">
            No tags yet — click “Add tags” on any recipe below
          </span>
        )}
      </div>

      {recipes.isLoading ? (
        <div className="grid min-h-72 place-items-center">
          <Loader2 className="size-6 animate-spin text-copper-deep" />
        </div>
      ) : filtered.length ? (
        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(item => {
            const tags = (item.tags as string[] | undefined) ?? [];
            return (
              <article
                key={item.id}
                className="surface group flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={item.imageUrl || DISH_IMAGES.lemon}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                    />
                    <button
                      aria-label={item.favorite ? "Remove favorite" : "Mark as favorite"}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        favoriteMutation.mutate({
                          recipeId: item.id,
                          favorite: !item.favorite,
                        });
                      }}
                      className={`absolute right-4 top-4 grid size-10 place-items-center rounded-full backdrop-blur-md transition-transform active:scale-95 ${item.favorite ? "bg-copper text-ink shadow-md" : "bg-black/45 text-white hover:bg-black/60"}`}
                    >
                      <Heart
                        className={`size-4 ${item.favorite ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.11em] text-copper-deep">
                      <span>v{item.version}</span>
                      <span className="text-ink/20">·</span>
                      <span>
                        {item.generationMode === "live_ai"
                          ? "AI + knowledge"
                          : "reviewed fallback"}
                      </span>
                    </div>

                    <Link href={`/recipe/${item.id}`}>
                      <h2 className="mt-2 font-display text-2xl leading-tight text-ink hover:text-copper-deep transition-colors">
                        {item.title}
                      </h2>
                    </Link>

                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-ink">
                      {item.summary}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-sage/16 px-2.5 py-0.5 text-[0.68rem] font-semibold text-sage-deep"
                        >
                          #{tag}
                          <button
                            type="button"
                            aria-label={`Remove tag ${tag}`}
                            onClick={event => {
                              event.preventDefault();
                              event.stopPropagation();
                              removeTagFromRecipe(item.id, tag);
                            }}
                            className="text-sage-deep/60 hover:text-sage-deep"
                          >
                            <X className="size-2.5" />
                          </button>
                        </span>
                      ))}

                      <button
                        type="button"
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          setTaggingRecipeId(item.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink/20 px-2 py-0.5 text-[0.68rem] font-bold text-muted-ink hover:border-copper hover:text-copper-deep"
                      >
                        <Plus className="size-2.5" />
                        {tags.length ? "Tag" : "Add tags"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t soft-rule p-5 pt-3 flex items-center justify-between text-xs font-semibold text-muted-ink">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" /> {item.totalMinutes} min
                  </span>
                  <Link
                    href={`/cook/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-copper-deep hover:underline"
                  >
                    Cook now →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="surface mt-8 grid min-h-80 place-items-center p-8 text-center">
          <div className="max-w-md">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-copper/20 text-copper-deep">
              <Heart className="size-6 fill-current" />
            </span>
            <h2 className="mt-4 font-display text-3xl">
              {activeTab === "favorites"
                ? "No favorite recipes yet."
                : "No saved recipes found."}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-ink">
              {activeTab === "favorites"
                ? "Tap the heart on any recipe you loved to keep it pinned here, then add tags like #weeknight or #crispy for fast access."
                : "Generate or cook your first recipe to start accumulating your personal culinary memory."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {activeTab === "favorites" && allRecipes.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveTab("all");
                    setSelectedTag("all");
                  }}
                  className="rounded-full"
                >
                  Browse all {allRecipes.length} saved recipes
                </Button>
              )}
              <Link
                href="/discover"
                className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-bold text-white hover:bg-ink/90"
              >
                <Sparkles className="mr-2 size-4" /> Start with what you have
              </Link>
            </div>
          </div>
        </div>
      )}

      {recipeBeingTagged && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid items-end bg-black/60 p-3 sm:place-items-center"
        >
          <div className="w-full max-w-lg rounded-[2rem] bg-cream p-6 text-ink shadow-2xl sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">Recipe organization</p>
                <h2 className="mt-1 font-display text-3xl">
                  Tags for {recipeBeingTagged.title}
                </h2>
              </div>
              <button
                onClick={() => setTaggingRecipeId(null)}
                className="grid size-10 place-items-center rounded-full bg-ink/6 hover:bg-ink/10"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-5 text-muted-ink">
              Custom tags help you group dishes by situation (e.g. weeknight,
              company, crispy, kid-approved) so you can quickly decide what to
              cook.
            </p>

            <div className="mt-5 flex gap-2">
              <Input
                value={newTagInput}
                onChange={event => setNewTagInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTagToRecipe(recipeBeingTagged.id, newTagInput);
                  }
                }}
                placeholder="Type a tag and press Enter…"
                className="h-11 rounded-full bg-white px-4 text-sm"
              />
              <Button
                onClick={() => addTagToRecipe(recipeBeingTagged.id, newTagInput)}
                disabled={!newTagInput.trim()}
                className="h-11 rounded-full bg-ink px-4 text-xs font-bold text-white"
              >
                Add
              </Button>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-ink">
                Current tags
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2 min-h-9">
                {((recipeBeingTagged.tags as string[] | undefined) ?? []).map(
                  tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full bg-copper/20 px-3 py-1 text-xs font-semibold text-copper-deep"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() =>
                          removeTagFromRecipe(recipeBeingTagged.id, tag)
                        }
                        className="text-copper-deep/60 hover:text-copper-deep"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  )
                )}
                {((recipeBeingTagged.tags as string[] | undefined) ?? [])
                  .length === 0 && (
                  <span className="text-xs text-muted-ink">No tags yet.</span>
                )}
              </div>
            </div>

            <div className="mt-6 border-t soft-rule pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-ink">
                Quick additions
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {POPULAR_SUGGESTIONS.map(suggestion => {
                  const current =
                    (recipeBeingTagged.tags as string[] | undefined) ?? [];
                  const active = current.includes(suggestion);
                  return (
                    <button
                      key={suggestion}
                      disabled={active}
                      onClick={() =>
                        addTagToRecipe(recipeBeingTagged.id, suggestion)
                      }
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-ink/5 text-muted-ink opacity-40" : "border border-ink/10 bg-white hover:border-copper hover:text-copper-deep"}`}
                    >
                      +{suggestion}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={() => setTaggingRecipeId(null)}
              className="mt-7 h-12 w-full rounded-full bg-ink text-sm font-bold text-white"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
