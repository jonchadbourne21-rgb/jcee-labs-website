import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import type { CustomFoodLabel, NutritionValues } from "@shared/product";
import { BookOpen, Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const EMPTY_NUTRITION: NutritionValues = {
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  saturatedFatG: 0,
  fiberG: 0,
  sugarG: 0,
  sodiumMg: 0,
};

type LabelDraft = {
  id?: number;
  barcode: string;
  productName: string;
  brand: string;
  servingSize: string;
  ingredientsText: string;
  allergens: string;
  nutritionPerServing: NutritionValues;
};

const emptyDraft = (barcode = ""): LabelDraft => ({
  barcode,
  productName: "",
  brand: "",
  servingSize: "",
  ingredientsText: "",
  allergens: "",
  nutritionPerServing: { ...EMPTY_NUTRITION },
});

function draftFromLabel(label: CustomFoodLabel): LabelDraft {
  return {
    id: label.id,
    barcode: label.barcode ?? "",
    productName: label.productName,
    brand: label.brand ?? "",
    servingSize: label.servingSize,
    ingredientsText: label.ingredientsText ?? "",
    allergens: label.allergens.join(", "),
    nutritionPerServing: label.nutritionPerServing,
  };
}

const nutritionFields: Array<{ key: keyof NutritionValues; label: string; unit: string }> = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "fatG", label: "Total fat", unit: "g" },
  { key: "saturatedFatG", label: "Saturated fat", unit: "g" },
  { key: "carbsG", label: "Carbohydrate", unit: "g" },
  { key: "fiberG", label: "Fiber", unit: "g" },
  { key: "sugarG", label: "Total sugars", unit: "g" },
  { key: "proteinG", label: "Protein", unit: "g" },
  { key: "sodiumMg", label: "Sodium", unit: "mg" },
];

export function ManualNutritionLabels({ defaultBarcode = "" }: { defaultBarcode?: string }) {
  const utils = trpc.useUtils();
  const labelsQuery = trpc.barcode.customLabels.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<LabelDraft>(() => emptyDraft(defaultBarcode));
  const [selected, setSelected] = useState<CustomFoodLabel | null>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("snack");

  useEffect(() => {
    if (!draft.id && defaultBarcode && draft.barcode !== defaultBarcode) {
      setDraft(current => ({ ...current, barcode: defaultBarcode }));
    }
  }, [defaultBarcode, draft.id, draft.barcode]);

  const saveMutation = trpc.barcode.saveCustomLabel.useMutation({
    onSuccess: async label => {
      await utils.barcode.customLabels.invalidate();
      setSelected(label);
      setDialogOpen(false);
      toast.success(draft.id ? "Private label updated" : "Private label saved");
    },
    onError: error => toast.error(error.message),
  });
  const deleteMutation = trpc.barcode.deleteCustomLabel.useMutation({
    onSuccess: async () => {
      setSelected(null);
      await Promise.all([utils.barcode.customLabels.invalidate(), utils.nutrition.daily.invalidate(), utils.nutrition.trends.invalidate()]);
      toast.success("Private label and its logs removed");
    },
    onError: error => toast.error(error.message),
  });
  const logMutation = trpc.barcode.logCustomMeal.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.nutrition.daily.invalidate(), utils.nutrition.trends.invalidate()]);
      toast.success("Custom packaged food logged");
    },
    onError: error => toast.error(error.message),
  });

  function openNew() {
    setDraft(emptyDraft(defaultBarcode));
    setDialogOpen(true);
  }

  function openEdit(label: CustomFoodLabel) {
    setDraft(draftFromLabel(label));
    setDialogOpen(true);
  }

  function save() {
    saveMutation.mutate({
      id: draft.id,
      barcode: draft.barcode,
      productName: draft.productName,
      brand: draft.brand,
      servingSize: draft.servingSize,
      ingredientsText: draft.ingredientsText,
      allergens: draft.allergens.split(",").map(item => item.trim()).filter(Boolean),
      nutritionPerServing: draft.nutritionPerServing,
    });
  }

  return (
    <section className="surface p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Private Label Library</p>
          <h2 className="mt-1 font-display text-3xl">Not in the database?</h2>
          <p className="mt-2 max-w-xl text-xs leading-5 text-muted-ink">
            Transcribe the package in hand once. Your saved label is private, editable, and reusable for future logs.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" onClick={openNew} className="h-11 rounded-full bg-ink px-4 text-white">
              <Plus className="mr-2 size-4" /> Add label
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto rounded-[1.5rem] bg-[#f7f1e7] p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">{draft.id ? "Edit Nutrition Facts" : "Save Nutrition Facts"}</DialogTitle>
            </DialogHeader>
            <p className="text-xs leading-5 text-muted-ink">Copy values for one serving exactly as printed. This record is user-entered and is never presented as independently verified.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-bold">Product name<Input value={draft.productName} onChange={event => setDraft(current => ({ ...current, productName: event.target.value }))} className="h-11 rounded-xl bg-white" /></label>
              <label className="grid gap-1.5 text-xs font-bold">Brand<Input value={draft.brand} onChange={event => setDraft(current => ({ ...current, brand: event.target.value }))} className="h-11 rounded-xl bg-white" /></label>
              <label className="grid gap-1.5 text-xs font-bold">Serving size<Input value={draft.servingSize} onChange={event => setDraft(current => ({ ...current, servingSize: event.target.value }))} placeholder="e.g. 2/3 cup (55 g)" className="h-11 rounded-xl bg-white" /></label>
              <label className="grid gap-1.5 text-xs font-bold">Barcode (optional)<Input value={draft.barcode} onChange={event => setDraft(current => ({ ...current, barcode: event.target.value }))} className="h-11 rounded-xl bg-white font-mono" /></label>
            </div>
            <div className="mt-5 border-y-4 border-ink py-4">
              <p className="font-display text-2xl">Per serving</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {nutritionFields.map(field => (
                  <label key={field.key} className="grid gap-1.5 text-xs font-bold">
                    <span className="flex justify-between"><span>{field.label}</span><span className="text-muted-ink">{field.unit}</span></span>
                    <Input
                      type="number"
                      min="0"
                      step={field.key === "calories" || field.key === "sodiumMg" ? "1" : "0.1"}
                      value={draft.nutritionPerServing[field.key]}
                      onChange={event => setDraft(current => ({
                        ...current,
                        nutritionPerServing: { ...current.nutritionPerServing, [field.key]: Math.max(0, Number(event.target.value)) },
                      }))}
                      className="h-10 rounded-xl bg-white font-mono"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-xs font-bold">Allergens (comma separated)<Input value={draft.allergens} onChange={event => setDraft(current => ({ ...current, allergens: event.target.value }))} placeholder="milk, peanuts, soy" className="h-11 rounded-xl bg-white" /></label>
              <label className="grid gap-1.5 text-xs font-bold">Ingredients<Textarea value={draft.ingredientsText} onChange={event => setDraft(current => ({ ...current, ingredientsText: event.target.value }))} className="min-h-24 rounded-xl bg-white" /></label>
            </div>
            <Button type="button" onClick={save} disabled={saveMutation.isPending || !draft.productName.trim() || !draft.servingSize.trim()} className="mt-5 h-12 w-full rounded-full bg-ink text-white">
              {saveMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />} Save private label
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-5 grid gap-3">
        {labelsQuery.isLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-ink"><Loader2 className="size-3.5 animate-spin" /> Loading private labels…</div>
        ) : labelsQuery.data?.length ? labelsQuery.data.map(label => (
          <div key={label.id} className={`flex items-center gap-2 rounded-2xl border p-2 transition-colors ${selected?.id === label.id ? "border-copper bg-copper/10" : "border-ink/8 bg-white/55 hover:border-copper/50"}`}>
            <button type="button" onClick={() => setSelected(label)} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 text-left">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-copper"><BookOpen className="size-4" /></span>
              <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{label.productName}</strong><span className="text-xs text-muted-ink">{label.brand || "Custom label"} · {label.servingSize} · {label.nutritionPerServing.calories} kcal</span></span>
            </button>
            <button type="button" onClick={() => openEdit(label)} className="grid size-9 place-items-center rounded-full text-muted-ink hover:bg-white hover:text-ink" aria-label={`Edit ${label.productName}`}><Pencil className="size-3.5" /></button>
          </div>
        )) : (
          <p className="rounded-2xl border border-dashed border-ink/15 p-5 text-xs leading-5 text-muted-ink">No private labels yet. Add one for a store-brand or unlisted product.</p>
        )}
      </div>

      {selected && (
        <div className="mt-5 rounded-2xl bg-ink p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-sm font-bold">Log {selected.productName}</p><p className="mt-1 text-xs text-white/55">{selected.nutritionPerServing.calories} kcal per {selected.servingSize}</p></div>
            <button type="button" onClick={() => window.confirm("Delete this private label and its logs?") && deleteMutation.mutate({ labelId: selected.id })} className="text-white/45 hover:text-red-300" aria-label={`Delete ${selected.productName}`}><Trash2 className="size-4" /></button>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs font-bold">Servings</span>
            <div className="flex items-center gap-2"><Button type="button" size="sm" onClick={() => setServings(value => Math.max(0.25, value - 0.25))} className="size-8 rounded-full bg-white/10 p-0 text-white">−</Button><span className="w-10 text-center font-mono text-sm font-bold">{servings}</span><Button type="button" size="sm" onClick={() => setServings(value => Math.min(20, value + 0.25))} className="size-8 rounded-full bg-white/10 p-0 text-white">+</Button></div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-white/7 p-1">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map(type => <button type="button" key={type} onClick={() => setMealType(type)} className={`rounded-lg px-1 py-2 text-[0.62rem] font-bold capitalize ${mealType === type ? "bg-copper text-ink" : "text-white/55"}`}>{type}</button>)}
          </div>
          <Button type="button" onClick={() => logMutation.mutate({ labelId: selected.id, servings, mealType })} disabled={logMutation.isPending} className="mt-4 h-11 w-full rounded-full bg-copper text-ink hover:bg-[#ffb779]">
            {logMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />} Log {servings} serving{servings === 1 ? "" : "s"}
          </Button>
        </div>
      )}
    </section>
  );
}
