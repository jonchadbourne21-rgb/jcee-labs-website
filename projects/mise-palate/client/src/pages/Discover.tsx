import { useAuth } from "@/_core/hooks/useAuth";
import AppShell from "@/components/product/AppShell";
import { SensoryProfileView } from "@/components/product/SensoryProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import type { IngredientDetection, RecipeOption } from "@shared/product";
import { ArrowLeft, ArrowRight, Camera, Check, ChefHat, Clock3, ImagePlus, Loader2, Pencil, Plus, Sparkles, Trash2, TriangleAlert } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type Stage = "capture" | "review" | "options";

export default function Discover() {
  useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const queryMode = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("mode") : null;
  const [mode, setMode] = useState<"photo" | "text" | "craving">(queryMode === "craving" ? "craving" : queryMode === "text" ? "text" : "photo");
  const [stage, setStage] = useState<Stage>("capture");
  const [text, setText] = useState(queryMode === "chef" ? "chicken thighs, broccoli, lemon, garlic, Parmesan" : "");
  const [preview, setPreview] = useState<string | null>(null);
  const [scanId, setScanId] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<IngredientDetection[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [uncertainty, setUncertainty] = useState("");
  const [options, setOptions] = useState<RecipeOption[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const palate = trpc.palate.get.useQuery();

  const analyze = trpc.scans.analyzePhoto.useMutation({
    onSuccess: data => {
      setScanId(data.scanId);
      setIngredients(data.ingredients);
      setUncertainty(data.uncertaintySummary);
      setStage("review");
    },
    onError: error => toast.error(error.message),
  });
  const createText = trpc.scans.createFromText.useMutation({
    onSuccess: data => {
      setScanId(data.scanId);
      setIngredients(data.ingredients);
      setUncertainty(data.uncertaintySummary);
      setStage("review");
    },
    onError: error => toast.error(error.message),
  });
  const confirm = trpc.scans.confirm.useMutation();
  const getOptions = trpc.recipes.options.useMutation({
    onSuccess: data => {
      setOptions(data.options);
      setStage("options");
    },
    onError: error => toast.error(error.message),
  });
  const generate = trpc.recipes.generate.useMutation({
    onSuccess: data => navigate(`/recipe/${data.recipeId}`),
    onError: error => toast.error(error.message),
  });

  async function fileSelected(file?: File) {
    if (!file) return;
    if (file.size > 8_000_000) return toast.error("Choose an image smaller than 8 MB");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setPreview(dataUrl);
      analyze.mutate({ dataUrl, filename: file.name, context: text });
    };
    reader.readAsDataURL(file);
  }

  function analyzeText() {
    if (text.trim().length < 2) return;
    createText.mutate({ text, source: mode === "craving" ? "craving" : "description" });
  }

  async function approveIngredients() {
    if (!scanId) return;
    const corrected = ingredients.some(item => item.confidence < 100 || item.needsConfirmation);
    await confirm.mutateAsync({ scanId, ingredients: ingredients.map(item => ({ ...item, confidence: 100, needsConfirmation: false })), corrected });
    getOptions.mutate({ scanId, ingredients: ingredients.map(item => item.name), timeMinutes: 45, difficulty: "moderate", craving: mode === "craving" ? text : undefined });
  }

  function addIngredient() {
    if (!newIngredient.trim()) return;
    setIngredients(items => [...items, { name: newIngredient.trim(), confidence: 100, quantityHint: "added by you", needsConfirmation: false }]);
    setNewIngredient("");
  }

  return (
    <AppShell>
      <button onClick={() => stage === "capture" ? navigate("/") : setStage(stage === "options" ? "review" : "capture")} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-ink"><ArrowLeft className="size-4" /> Back</button>

      {stage === "capture" && (
        <div className="mx-auto max-w-4xl reveal">
          <div className="text-center"><p className="eyebrow">Start with reality</p><h1 className="page-title mt-3">What are we working with?</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-ink">A photo is fastest. Nothing uncertain is treated as fact until you confirm it.</p></div>
          <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 rounded-full bg-ink/6 p-1">
            {[{ id: "photo", label: "Photo" }, { id: "text", label: "Ingredients" }, { id: "craving", label: "Craving" }].map(item => <button key={item.id} onClick={() => setMode(item.id as typeof mode)} className={`rounded-full px-3 py-2.5 text-xs font-bold ${mode === item.id ? "bg-ink text-white" : "text-muted-ink"}`}>{item.label}</button>)}
          </div>
          {mode === "photo" ? (
            <div className="mt-8">
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={event => fileSelected(event.target.files?.[0])} />
              <button onClick={() => fileRef.current?.click()} disabled={analyze.isPending} className="surface relative grid min-h-[25rem] w-full place-items-center overflow-hidden border-dashed border-ink/20 p-8 text-center hover:border-copper">
                {preview ? <img src={preview} alt="Upload preview" className="absolute inset-0 h-full w-full object-cover opacity-35" /> : null}
                <span className="relative grid justify-items-center"><span className="grid size-16 place-items-center rounded-full bg-ink text-copper"><Camera className="size-7" /></span><strong className="mt-5 font-display text-3xl">{analyze.isPending ? "Reading the counter…" : "Take or choose a photo"}</strong><span className="mt-2 max-w-sm text-sm leading-6 text-muted-ink">Fridge shelves, pantry items, ingredients on the counter, or a dish you want to recreate.</span>{analyze.isPending && <Loader2 className="mt-5 size-5 animate-spin" />}</span>
              </button>
              <button onClick={() => { setText("chicken thighs, broccoli, lemon, garlic, Parmesan"); setMode("text"); }} className="mx-auto mt-4 block text-xs font-bold text-copper-deep">Use the required demo ingredients instead</button>
            </div>
          ) : (
            <div className="surface mx-auto mt-8 max-w-2xl p-6 sm:p-8">
              <label className="text-sm font-bold">{mode === "craving" ? "What do you want to eat?" : "List what you have"}</label>
              <Textarea value={text} onChange={event => setText(event.target.value)} placeholder={mode === "craving" ? "Something bright, crispy and satisfying…" : "Chicken thighs, broccoli, lemon, garlic, Parmesan…"} className="mt-3 min-h-40 rounded-2xl bg-white/65 text-base" />
              <Button onClick={analyzeText} disabled={createText.isPending || text.trim().length < 2} className="mt-5 h-13 w-full rounded-full bg-ink text-white hover:bg-ink/90">{createText.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />} Find directions</Button>
            </div>
          )}
        </div>
      )}

      {stage === "review" && (
        <div className="mx-auto max-w-3xl reveal">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="eyebrow">Confirm before generation</p><h1 className="page-title mt-3">Is this what you have?</h1></div>{preview && <img src={preview} alt="Ingredients being reviewed" className="h-24 w-32 rounded-2xl object-cover" />}</div>
          <div className="mt-6 flex gap-3 rounded-2xl border border-copper/35 bg-copper/12 p-4 text-sm leading-6"><TriangleAlert className="mt-0.5 size-5 shrink-0 text-copper-deep" /><p>{uncertainty}</p></div>
          <div className="mt-6 grid gap-3">
            {ingredients.map((ingredient, index) => (
              <div key={`${ingredient.name}-${index}`} className="surface flex items-center gap-3 p-4">
                <span className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold ${ingredient.confidence >= 82 ? "bg-sage/20 text-sage-deep" : "bg-copper/20 text-copper-deep"}`}>{ingredient.confidence}%</span>
                <Input aria-label={`Ingredient ${index + 1}`} value={ingredient.name} onChange={event => setIngredients(items => items.map((item, i) => i === index ? { ...item, name: event.target.value, confidence: 100, needsConfirmation: false } : item))} className="border-0 bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0" />
                <Pencil className="size-4 text-muted-ink" />
                <button aria-label={`Remove ${ingredient.name}`} onClick={() => setIngredients(items => items.filter((_, i) => i !== index))} className="grid size-9 place-items-center rounded-full hover:bg-ink/6"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2"><Input value={newIngredient} onChange={event => setNewIngredient(event.target.value)} onKeyDown={event => event.key === "Enter" && addIngredient()} placeholder="Add a missing ingredient" className="h-12 rounded-full bg-white/60 px-5" /><Button onClick={addIngredient} variant="outline" className="size-12 shrink-0 rounded-full bg-white/60 p-0"><Plus className="size-5" /></Button></div>
          <Button onClick={approveIngredients} disabled={confirm.isPending || getOptions.isPending || ingredients.length === 0} className="mt-7 h-14 w-full rounded-full bg-ink text-base font-bold text-white hover:bg-ink/90">{getOptions.isPending ? <Loader2 className="mr-2 size-5 animate-spin" /> : <Check className="mr-2 size-5" />} Yes, build my directions</Button>
        </div>
      )}

      {stage === "options" && (
        <div className="reveal">
          <div className="max-w-3xl"><p className="eyebrow">Choose the outcome</p><h1 className="page-title mt-3">What should this become?</h1><p className="mt-4 text-sm leading-6 text-muted-ink">Four different culinary directions—not minor variations. Each is scored against your Palate Twin.</p></div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {options.map((option, index) => (
              <article key={option.id} className="surface group overflow-hidden">
                <div className="relative h-56 overflow-hidden"><img src={option.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" /><span className="absolute left-4 top-4 rounded-full bg-cream/92 px-3 py-1.5 text-xs font-bold text-ink">{index === 0 ? "Best match" : option.cuisine}</span></div>
                <div className="p-5 sm:p-6"><h2 className="font-display text-3xl leading-tight">{option.title}</h2><p className="mt-2 text-sm leading-6 text-muted-ink">{option.description}</p><div className="my-5 rounded-2xl bg-sage/12 p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-sage-deep">Why for you</p><p className="mt-1.5 text-sm leading-5">{option.whyForYou}</p></div><SensoryProfileView profile={option.sensoryProfile} compact limit={3} /><div className="mt-5 flex items-center justify-between"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-ink"><Clock3 className="size-4" /> {option.totalMinutes} min · {option.difficulty}</span><Button disabled={generate.isPending} onClick={() => scanId && generate.mutate({ scanId, ingredients: ingredients.map(item => item.name), option })} className="rounded-full bg-ink text-white hover:bg-ink/90">{generate.isPending ? <Loader2 className="size-4 animate-spin" /> : <>Choose <ArrowRight className="ml-2 size-4" /></>}</Button></div></div>
              </article>
            ))}
          </div>
          {palate.data?.profile && <div className="mt-7 flex items-center gap-3 rounded-2xl border border-ink/8 bg-white/40 p-4 text-xs text-muted-ink"><ChefHat className="size-5 text-copper-deep" /><span>These directions used {palate.data.profile.displayName}’s palate, available equipment and dietary boundaries.</span></div>}
        </div>
      )}
    </AppShell>
  );
}
