import { useAuth } from "@/_core/hooks/useAuth";
import { Wordmark } from "@/components/product/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const questions = [
  { prompt: "Which wing wins?", note: "Texture versus lacquer", options: [{ id: "crispy_wings", label: "Crackly, crisp skin", detail: "Dry heat · audible crunch" }, { id: "glazed_wings", label: "Sticky glazed wings", detail: "Glossy · sweet-savory" }] },
  { prompt: "Your ideal pasta?", note: "Brightness versus richness", options: [{ id: "tomato_pasta", label: "Tomato-forward", detail: "Bright · lively · clean" }, { id: "creamy_pasta", label: "Silky and creamy", detail: "Round · rich · coating" }] },
  { prompt: "How much heat?", note: "We will refine this after real meals", options: [{ id: "mild_curry", label: "Fragrant, not fiery", detail: "Aromatic warmth" }, { id: "spicy_curry", label: "Bring the heat", detail: "A deliberate chile kick" }] },
  { prompt: "Steak doneness?", note: "A proxy for your preferred texture", options: [{ id: "rare_steak", label: "Rare", detail: "Soft · deep red center" }, { id: "medium_steak", label: "Medium", detail: "Springy · rosy center" }, { id: "well_steak", label: "Well done", detail: "Firm · fully cooked" }] },
  { prompt: "Dress the greens.", note: "Acid contrast or creamy comfort", options: [{ id: "bright_vinaigrette", label: "Sharp vinaigrette", detail: "Lemon · vinegar · lift" }, { id: "creamy_dressing", label: "Creamy dressing", detail: "Cool · round · lush" }] },
  { prompt: "Which edge do you chase?", note: "Browning changes aroma and bitterness", options: [{ id: "charred", label: "Dark, charred edges", detail: "Smoky · bittersweet" }, { id: "delicate", label: "Gently cooked", detail: "Fresh · subtle · clean" }] },
  { prompt: "Your vegetables?", note: "A useful texture signal", options: [{ id: "crunchy_veg", label: "Snappy and crisp", detail: "Bite still intact" }, { id: "soft_veg", label: "Tender and yielding", detail: "Soft all the way through" }] },
  { prompt: "How much sauce?", note: "More consequential than it sounds", options: [{ id: "sauce_on_side", label: "Just enough", detail: "Keep textures distinct" }, { id: "extra_sauce", label: "Extra, always", detail: "Generous · spoonable" }] },
];

export default function Onboarding() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [name, setName] = useState(user?.name?.split(" ")[0] ?? "Jonathan");
  const [dislikes, setDislikes] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const utils = trpc.useUtils();
  const save = trpc.palate.calibrate.useMutation({
    onSuccess: async () => {
      await utils.palate.get.invalidate();
      toast.success("Your Palate Twin is ready");
      navigate("/");
    },
    onError: error => toast.error(error.message),
  });
  const progress = Math.round((step / (questions.length + 1)) * 100);
  const question = questions[step];
  const currentChoice = choices[step];
  const isProfileStep = step >= questions.length;
  const canContinue = isProfileStep ? name.trim().length > 0 : Boolean(currentChoice);
  const summary = useMemo(() => choices.length, [choices]);

  function select(id: string) {
    setChoices(previous => {
      const next = [...previous];
      next[step] = id;
      return next;
    });
  }

  function next() {
    if (step < questions.length) setStep(step + 1);
    else save.mutate({
      displayName: name.trim(),
      choiceIds: choices,
      dislikedIngredients: dislikes.split(",").map(v => v.trim()).filter(Boolean),
      dietaryRestrictions: restrictions.split(",").map(v => v.trim()).filter(Boolean),
      equipment: ["oven", "stovetop", "sheet pan", "skillet"],
    });
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5 lg:px-8">
        <Wordmark compact />
        <div className="flex items-center gap-3 text-xs text-white/55"><span className="hidden sm:inline">Your palate gets smarter every time you cook.</span><span className="font-mono">{Math.min(step + 1, 9)}/9</span></div>
      </header>
      <div className="h-1 bg-white/10"><div className="h-full bg-copper transition-[width] duration-500" style={{ width: `${Math.max(progress, 8)}%` }} /></div>
      <main className="mx-auto flex min-h-[calc(100vh-5.25rem)] max-w-3xl flex-col px-5 py-10 sm:justify-center lg:px-8">
        {!isProfileStep && question ? (
          <section key={step} className="reveal">
            <p className="eyebrow !text-copper">Palate signal {step + 1}</p>
            <h1 className="page-title mt-4 text-cream">{question.prompt}</h1>
            <p className="mt-3 text-sm text-white/48">{question.note}</p>
            <div className={`mt-10 grid gap-3 ${question.options.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {question.options.map(option => {
                const active = currentChoice === option.id;
                return (
                  <button key={option.id} onClick={() => select(option.id)} className={`relative min-h-40 rounded-[1.6rem] border p-6 text-left ${active ? "border-copper bg-copper text-ink" : "border-white/12 bg-white/[0.045] text-cream hover:border-white/30 hover:bg-white/[0.075]"}`}>
                    {active && <span className="absolute right-4 top-4 grid size-7 place-items-center rounded-full bg-ink text-copper"><Check className="size-4" /></span>}
                    <span className="font-display text-2xl leading-tight">{option.label}</span>
                    <span className={`mt-7 block text-xs font-semibold ${active ? "text-ink/60" : "text-white/42"}`}>{option.detail}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="reveal">
            <div className="grid size-12 place-items-center rounded-2xl bg-copper text-ink"><Sparkles className="size-5" /></div>
            <p className="eyebrow mt-6 !text-copper">{summary} signals captured</p>
            <h1 className="page-title mt-4 text-cream">Give your twin a starting point.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/52">These details prevent bad recommendations. They are editable, and your actual cooking feedback will matter more over time.</p>
            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold"><span>Name</span><Input value={name} onChange={e => setName(e.target.value)} className="h-13 rounded-2xl border-white/15 bg-white/8 text-white" /></label>
              <label className="grid gap-2 text-sm font-semibold"><span>Dietary restrictions</span><Input value={restrictions} onChange={e => setRestrictions(e.target.value)} placeholder="e.g. gluten-free, vegetarian" className="h-13 rounded-2xl border-white/15 bg-white/8 text-white placeholder:text-white/30" /></label>
              <label className="grid gap-2 text-sm font-semibold sm:col-span-2"><span>Ingredients you do not enjoy</span><Input value={dislikes} onChange={e => setDislikes(e.target.value)} placeholder="e.g. olives, cilantro" className="h-13 rounded-2xl border-white/15 bg-white/8 text-white placeholder:text-white/30" /></label>
            </div>
          </section>
        )}
        <div className="mt-10 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => step === 0 ? navigate("/") : setStep(step - 1)} className="rounded-full text-white/70 hover:bg-white/10 hover:text-white"><ArrowLeft className="mr-2 size-4" /> Back</Button>
          <Button disabled={!canContinue || save.isPending} onClick={next} className="h-13 rounded-full bg-copper px-6 font-bold text-ink hover:bg-[#ffb779] disabled:opacity-35">{isProfileStep ? (save.isPending ? "Building your twin…" : "Create my Palate Twin") : "Continue"}<ArrowRight className="ml-2 size-4" /></Button>
        </div>
      </main>
    </div>
  );
}
