import { useAuth } from "@/_core/hooks/useAuth";
import AppShell from "@/components/product/AppShell";
import { BarcodeCameraScanner } from "@/components/product/BarcodeCameraScanner";
import { ManualNutritionLabels } from "@/components/product/ManualNutritionLabels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import type { FoodLensAnalysis, NutritionValues, PackagedFoodProduct } from "@shared/product";
import {
  AlertTriangle,
  Barcode,
  Camera,
  CheckCircle2,
  ExternalLink,
  Flame,
  Info,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  UtensilsCrossed,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const SAMPLE_PHOTO = "/manus-storage/mise-ingredients_ff9547f3.jpg";
const POPULAR_BARCODES = [
  { name: "Nutella Hazelnut Spread", code: "3017620422003", brand: "Ferrero" },
  { name: "Barilla Penne Rigate", code: "8076809513753", brand: "Barilla" },
  { name: "Heinz Tomato Ketchup", code: "0013000006034", brand: "Kraft Heinz" },
];

export default function FoodLens() {
  useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"plate" | "barcode">(() =>
    new URLSearchParams(window.location.search).get("mode") === "barcode" ? "barcode" : "plate"
  );
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [currentScanId, setCurrentScanId] = useState<number | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<FoodLensAnalysis | null>(null);
  const [relatedMemories, setRelatedMemories] = useState<any[]>([]);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("dinner");

  // Barcode flow state
  const [barcodeInput, setBarcodeInput] = useState("");
  const [servings, setServings] = useState(1);
  const [barcodeMealType, setBarcodeMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("snack");
  const [scannedProduct, setScannedProduct] = useState<PackagedFoodProduct | null>(null);
  const [barcodeDisclosure, setBarcodeDisclosure] = useState<string | null>(null);

  const [dayRange] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { dayStartMs: start.getTime(), dayEndMs: end.getTime() };
  });

  const dailyQuery = trpc.nutrition.daily.useQuery(dayRange);
  const scanStatusQuery = trpc.nutrition.scanStatus.useQuery(
    { scanId: currentScanId ?? 1 },
    { enabled: currentScanId !== null }
  );

  const analyzeMutation = trpc.foodLens.analyze.useMutation({
    onSuccess: (result: any) => {
      setCurrentScanId(result.scanId);
      setCurrentAnalysis({
        dishGuess: result.dishGuess,
        overallConfidence: result.overallConfidence,
        portionConfidence: result.portionConfidence,
        uncertaintySummary: result.uncertaintySummary,
        measurementNote: result.measurementNote,
        estimateDisclosure: result.estimateDisclosure,
        items: result.items,
        totalNutrition: result.totalNutrition,
        generationMode: result.generationMode,
      });
      setRelatedMemories(result.relatedMemories ?? []);
      utils.foodLens.history.invalidate();
      toast.success("Food recognized with portion estimates");
    },
    onError: error => toast.error(error.message),
  });

  const updateMutation = trpc.foodLens.update.useMutation({
    onSuccess: (result: any) => {
      if (result.scan) {
        setCurrentAnalysis(prev => prev ? {
          ...prev,
          items: result.scan.items,
          totalNutrition: result.scan.totalNutrition,
          measurementNote: result.scan.measurementNote,
        } : null);
      }
      setRelatedMemories(result.relatedMemories ?? []);
      utils.foodLens.history.invalidate();
      utils.nutrition.daily.invalidate();
      toast.success("Portions and nutrition recalculated");
    },
    onError: error => toast.error(error.message),
  });

  const createRecipeMutation = trpc.foodLens.createRecipe.useMutation({
    onSuccess: result => {
      toast.success(result.reused ? "Opening your existing Food Lens recipe" : "Personalized recipe created");
      navigate(`/recipe/${result.recipeId}`);
    },
    onError: error => toast.error(error.message),
  });

  const logMealMutation = trpc.nutrition.logScan.useMutation({
    onSuccess: async () => {
      await Promise.all([scanStatusQuery.refetch(), utils.nutrition.daily.invalidate(), utils.nutrition.trends.invalidate()]);
      toast.success("Meal logged toward your daily targets");
    },
    onError: error => toast.error(error.message),
  });

  const removeMealMutation = trpc.nutrition.removeLog.useMutation({
    onSuccess: async () => {
      await Promise.all([scanStatusQuery.refetch(), utils.nutrition.daily.invalidate(), utils.nutrition.trends.invalidate()]);
      toast.success("Meal removed from today’s nutrition totals");
    },
    onError: error => toast.error(error.message),
  });

  const barcodeLookupMutation = trpc.barcode.lookup.useMutation({
    onSuccess: result => {
      if (result.status === "found") {
        setScannedProduct(result.product);
        setBarcodeDisclosure(result.labelDisclosure);
        setServings(1);
        toast.success(`Found ${result.product.productName}`);
      } else {
        setScannedProduct(null);
        toast.error(result.message);
      }
    },
    onError: error => toast.error(error.message),
  });

  const logBarcodeMealMutation = trpc.barcode.logMeal.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.nutrition.daily.invalidate(), utils.nutrition.trends.invalidate()]);
      toast.success("Packaged food logged to daily totals");
    },
    onError: error => toast.error(error.message),
  });

  const removeBarcodeLogMutation = trpc.barcode.removeLog.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.nutrition.daily.invalidate(), utils.nutrition.trends.invalidate()]);
      toast.success("Packaged food removed from daily totals");
    },
    onError: error => toast.error(error.message),
  });

  const removeCustomMealMutation = trpc.barcode.removeCustomLog.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.nutrition.daily.invalidate(), utils.nutrition.trends.invalidate()]);
      toast.success("Private-label food removed from daily totals");
    },
    onError: error => toast.error(error.message),
  });

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      setDataUrl(result);
      analyzeMutation.mutate({ dataUrl: result, filename: file.name, context });
    };
    reader.readAsDataURL(file);
  }

  function handleDetectedBarcode(barcode: string) {
    setBarcodeInput(barcode);
    barcodeLookupMutation.mutate({ barcode });
    toast.success(`Barcode detected: ${barcode}`);
  }

  function handleUseSample() {
    fetch(SAMPLE_PHOTO)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = String(reader.result);
          setDataUrl(base64);
          analyzeMutation.mutate({
            dataUrl: base64,
            filename: "mise-ingredients.jpg",
            context: "dinner prep: chicken thighs, broccoli, lemon, garlic, parmesan",
          });
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => toast.error("Could not load sample image"));
  }

  function updateItemGrams(itemId: string, newGrams: number) {
    if (!currentAnalysis || !currentScanId) return;
    const updatedItems = currentAnalysis.items.map(item =>
      item.id === itemId
        ? { ...item, estimatedGrams: Math.max(0, newGrams), needsConfirmation: false }
        : item
    );
    updateMutation.mutate({
      scanId: currentScanId,
      items: updatedItems.map(item => ({
        id: item.id,
        name: item.name,
        estimatedGrams: item.estimatedGrams,
        confidence: item.confidence,
        portionConfidence: 90,
        needsConfirmation: item.needsConfirmation,
      })),
      measurementNote: "Portion adjusted and confirmed by user",
    });
  }

  const items = currentAnalysis?.items ?? [];
  const nutrition: NutritionValues = currentAnalysis?.totalNutrition ?? {
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    saturatedFatG: 0,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 0,
  };

  const packagedNutrition = useMemo(() => {
    if (!scannedProduct) return null;
    const base = scannedProduct.nutritionPerServing;
    const factor = Math.max(0.25, servings);
    return {
      calories: Math.round(base.calories * factor * 10) / 10,
      proteinG: Math.round(base.proteinG * factor * 10) / 10,
      carbsG: Math.round(base.carbsG * factor * 10) / 10,
      fatG: Math.round(base.fatG * factor * 10) / 10,
      saturatedFatG: Math.round(base.saturatedFatG * factor * 10) / 10,
      fiberG: Math.round(base.fiberG * factor * 10) / 10,
      sugarG: Math.round(base.sugarG * factor * 10) / 10,
      sodiumMg: Math.round(base.sodiumMg * factor * 10) / 10,
    };
  }, [scannedProduct, servings]);

  return (
    <AppShell>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-copper/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-copper-deep">
            <Camera className="size-3.5" /> Food Lens · Live Recognition
          </div>
          <h1 className="page-title mt-3">Smart Food & Nutrition Recognition</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-ink">
            Analyze fresh meals with multimodal vision and live USDA data, or scan packaged-food barcodes for manufacturer Nutrition Facts.
          </p>
        </div>
      </section>

      {/* Mode Switcher */}
      <div className="mt-6 flex gap-2 rounded-2xl bg-black/5 p-1.5 max-w-md">
        <button
          onClick={() => setActiveTab("plate")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            activeTab === "plate" ? "bg-white text-ink shadow-sm" : "text-muted-ink hover:text-ink"
          }`}
        >
          <Camera className="size-3.5" /> Plate & Ingredients
        </button>
        <button
          onClick={() => setActiveTab("barcode")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            activeTab === "barcode" ? "bg-white text-ink shadow-sm" : "text-muted-ink hover:text-ink"
          }`}
        >
          <Barcode className="size-3.5" /> Barcode & Packaged Foods
        </button>
      </div>

      {activeTab === "plate" ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="surface overflow-hidden p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Visual Capture</p>
                  <h2 className="mt-1 font-display text-3xl">Take or upload a photo</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseSample}
                  disabled={analyzeMutation.isPending}
                  className="rounded-full text-xs"
                >
                  Use sample meal
                </Button>
              </div>

              <p className="mt-2 text-xs leading-5 text-muted-ink">
                Clear overhead or 45-degree angle photos give the highest portion and food accuracy.
              </p>

              <div className="mt-5">
                <Input
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="Optional context: e.g. dinner with olive oil and side of rice…"
                  className="h-11 rounded-full bg-white/70 px-4 text-xs"
                />
              </div>

              <div className="mt-5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {dataUrl ? (
                  <div className="relative overflow-hidden rounded-2xl bg-black/5">
                    <img src={dataUrl} alt="Analyzed meal" className="h-72 w-full object-cover" />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={analyzeMutation.isPending}
                      size="sm"
                      className="absolute bottom-3 right-3 rounded-full bg-black/70 text-xs text-white backdrop-blur-md hover:bg-black"
                    >
                      <Upload className="mr-1.5 size-3.5" /> Retake
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={analyzeMutation.isPending}
                    className="grid h-64 w-full place-items-center rounded-2xl border-2 border-dashed border-ink/15 bg-white/40 p-6 text-center transition-colors hover:border-copper hover:bg-copper/5"
                  >
                    <div>
                      <Camera className="mx-auto size-10 text-copper-deep" />
                      <p className="mt-3 font-display text-2xl">Capture or choose photo</p>
                      <p className="mt-1 text-xs text-muted-ink">JPEG, PNG, WebP up to 8 MB</p>
                    </div>
                  </button>
                )}
              </div>

              {analyzeMutation.isPending && (
                <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-copper/10 p-5 text-sm font-semibold text-copper-deep">
                  <Loader2 className="size-5 animate-spin" />
                  Analyzing food items, visual scale, and reference nutrition…
                </div>
              )}
            </div>

            {currentAnalysis && (
              <section className="surface p-6 sm:p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="eyebrow">Recognized Foods</p>
                    <h2 className="mt-1 font-display text-3xl">{currentAnalysis.dishGuess}</h2>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-bold text-sage-deep">
                      {currentAnalysis.overallConfidence}% visual confidence
                    </span>
                    <p className="mt-1 text-[0.68rem] text-muted-ink">
                      Portion confidence: {currentAnalysis.portionConfidence}%
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-muted-ink">
                  {currentAnalysis.uncertaintySummary}
                </p>

                <div className="mt-6 space-y-3">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm capitalize">{item.name}</span>
                          {item.needsConfirmation ? (
                            <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="size-2.5" /> verify
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-sage-deep bg-sage/18 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="size-2.5" /> confirmed
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[0.68rem] text-muted-ink flex items-center gap-1.5">
                          <span>{item.sourceLabel}</span>
                          {item.sourceUrl && (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-copper-deep hover:underline"
                            >
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            defaultValue={item.estimatedGrams}
                            onBlur={e => {
                              const val = Number(e.target.value);
                              if (val !== item.estimatedGrams) {
                                updateItemGrams(item.id, val);
                              }
                            }}
                            className="h-9 w-20 rounded-xl bg-white text-center text-xs font-mono font-bold"
                          />
                          <span className="text-xs text-muted-ink font-semibold">g</span>
                        </div>
                        {item.nutritionForPortion && (
                          <span className="min-w-16 text-right font-mono text-xs font-bold text-copper-deep">
                            {item.nutritionForPortion.calories} kcal
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-black/4 p-4 text-[0.68rem] leading-5 text-muted-ink flex items-start gap-2">
                  <Info className="size-4 shrink-0 text-muted-ink mt-0.5" />
                  <span>{currentAnalysis.estimateDisclosure}</span>
                </div>

                <div className="mt-5 grid gap-3 rounded-2xl bg-ink p-4 text-white sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-bold">Turn this plate into your recipe</p>
                    <p className="mt-1 text-[0.68rem] leading-5 text-white/55">
                      Combines identified ingredients, your Palate Twin, and your nutrition targets into an actionable recipe.
                    </p>
                  </div>
                  <Button
                    disabled={!currentScanId || createRecipeMutation.isPending || updateMutation.isPending}
                    onClick={() =>
                      currentScanId &&
                      createRecipeMutation.mutate({
                        scanId: currentScanId,
                        confirmed: true,
                        instructions: "Recreate this recognized dish with the best fit for my palate and selected nutrition targets.",
                      })
                    }
                    className="h-12 rounded-full bg-copper px-5 text-ink hover:bg-[#ffb779]"
                  >
                    {createRecipeMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UtensilsCrossed className="mr-2 size-4" />}
                    Cook this dish
                  </Button>
                </div>
              </section>
            )}
          </div>

          {/* Right column: Nutrition Facts & Plate Logging */}
          <div className="space-y-6">
            <section className="rounded-[2rem] border-2 border-ink bg-white p-6 shadow-xl text-ink">
              <div className="border-b-8 border-ink pb-2">
                <h2 className="font-display text-4xl leading-none">Nutrition Facts</h2>
                <p className="text-xs text-muted-ink mt-1">
                  Estimated from identified portions (not a laboratory label)
                </p>
              </div>

              <div className="border-b-4 border-ink py-2 flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-ink">
                    Total Energy
                  </p>
                  <p className="font-display text-4xl font-black">{nutrition.calories}</p>
                </div>
                <Flame className="size-7 text-copper" />
              </div>

              <div className="divide-y divide-ink/15 text-xs font-medium">
                <div className="py-2 flex justify-between font-bold">
                  <span>Total Fat</span>
                  <span>{nutrition.fatG}g</span>
                </div>
                <div className="py-1 pl-4 flex justify-between text-muted-ink">
                  <span>Saturated Fat</span>
                  <span>{nutrition.saturatedFatG}g</span>
                </div>
                <div className="py-2 flex justify-between font-bold">
                  <span>Sodium</span>
                  <span>{nutrition.sodiumMg}mg</span>
                </div>
                <div className="py-2 flex justify-between font-bold">
                  <span>Total Carbohydrate</span>
                  <span>{nutrition.carbsG}g</span>
                </div>
                <div className="py-1 pl-4 flex justify-between text-muted-ink">
                  <span>Dietary Fiber</span>
                  <span>{nutrition.fiberG}g</span>
                </div>
                <div className="py-1 pl-4 flex justify-between text-muted-ink">
                  <span>Total Sugars</span>
                  <span>{nutrition.sugarG}g</span>
                </div>
                <div className="py-2 flex justify-between font-bold text-sm">
                  <span>Protein</span>
                  <span>{nutrition.proteinG}g</span>
                </div>
              </div>

              {currentScanId && (
                <div className="mt-5 border-t-4 border-ink pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider">Count this meal only if eaten</p>
                  <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl bg-ink/5 p-1">
                    {(["breakfast", "lunch", "dinner", "snack"] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setMealType(type)}
                        className={`rounded-lg px-1 py-2 text-[0.62rem] font-bold capitalize transition-colors ${
                          mealType === type ? "bg-ink text-white" : "text-muted-ink hover:bg-white"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant={scanStatusQuery.data?.logged ? "outline" : "default"}
                    disabled={logMealMutation.isPending || removeMealMutation.isPending}
                    onClick={() => {
                      if (scanStatusQuery.data?.logged) removeMealMutation.mutate({ scanId: currentScanId });
                      else logMealMutation.mutate({ scanId: currentScanId, mealType });
                    }}
                    className="mt-3 h-11 w-full rounded-full"
                  >
                    {(logMealMutation.isPending || removeMealMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {scanStatusQuery.data?.logged ? "Remove from today" : `Log as ${mealType}`}
                  </Button>
                </div>
              )}
            </section>
          </div>
        </div>
      ) : (
        /* Barcode Tab */
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section className="surface p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Packaged Foods</p>
                  <h2 className="mt-1 font-display text-3xl">Scan or enter barcode</h2>
                </div>
                <Barcode className="size-6 text-copper-deep" />
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-ink">
                Point your rear camera at a UPC, EAN, or GTIN. Mise decodes continuously and starts lookup automatically.
              </p>

              <div className="mt-5">
                <BarcodeCameraScanner disabled={barcodeLookupMutation.isPending} onDetected={handleDetectedBarcode} />
              </div>

              <div className="mt-6 flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={barcodeInput}
                    onChange={e => setBarcodeInput(e.target.value)}
                    placeholder="Enter 8, 12, 13, or 14-digit barcode…"
                    className="h-12 rounded-full bg-white/70 pl-4 pr-10 text-sm font-mono"
                    onKeyDown={e => {
                      if (e.key === "Enter" && barcodeInput.trim()) {
                        barcodeLookupMutation.mutate({ barcode: barcodeInput.trim() });
                      }
                    }}
                  />
                  {barcodeInput && (
                    <button
                      onClick={() => setBarcodeInput("")}
                      className="absolute right-3.5 top-3.5 text-muted-ink hover:text-ink"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => barcodeLookupMutation.mutate({ barcode: barcodeInput.trim() })}
                  disabled={barcodeLookupMutation.isPending || !barcodeInput.trim()}
                  className="h-12 rounded-full bg-ink px-5 text-white"
                >
                  {barcodeLookupMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-ink">
                  <span>Popular:</span>
                  {POPULAR_BARCODES.map(sample => (
                    <button
                      key={sample.code}
                      onClick={() => {
                        setBarcodeInput(sample.code);
                        barcodeLookupMutation.mutate({ barcode: sample.code });
                      }}
                      className="rounded-full border border-ink/10 bg-white/60 px-2.5 py-1 text-[0.65rem] font-medium hover:border-copper hover:text-copper-deep"
                    >
                      {sample.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Scanned product review */}
            {scannedProduct && (
              <section className="surface p-6 sm:p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-ink">
                      {scannedProduct.brands || "Packaged Product"}
                    </span>
                    <h2 className="mt-1 font-display text-3xl">{scannedProduct.productName}</h2>
                    <p className="mt-1 text-xs font-mono text-muted-ink">UPC/EAN: {scannedProduct.barcode}</p>
                  </div>
                  {scannedProduct.sourceCompleteness !== null && (
                    <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-bold text-sage-deep">
                      {scannedProduct.sourceCompleteness}% complete
                    </span>
                  )}
                </div>

                {scannedProduct.servingSize && (
                  <div className="mt-4 rounded-xl bg-copper/10 p-3 text-xs text-copper-deep font-semibold">
                    Serving size: {scannedProduct.servingSize}
                  </div>
                )}

                {scannedProduct.allergens.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-ink">Allergens listed</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {scannedProduct.allergens.map(allergen => (
                        <span key={allergen} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 capitalize">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {scannedProduct.ingredientsText && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-ink">Ingredients</p>
                    <p className="mt-1 text-xs leading-5 text-muted-ink">{scannedProduct.ingredientsText}</p>
                  </div>
                )}

                {/* Serving counter & logger */}
                <div className="mt-6 border-t soft-rule pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Servings eaten</p>
                      <p className="text-xs text-muted-ink">Adjust to match how much you consumed</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setServings(s => Math.max(0.25, s - 0.25))}
                        className="size-8 rounded-full p-0"
                      >
                        -
                      </Button>
                      <span className="w-10 text-center font-mono font-bold text-sm">{servings}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setServings(s => Math.min(20, s + 0.25))}
                        className="size-8 rounded-full p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-ink">Meal type</p>
                    <div className="mt-2 grid grid-cols-4 gap-1 rounded-xl bg-ink/5 p-1">
                      {(["breakfast", "lunch", "dinner", "snack"] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setBarcodeMealType(type)}
                          className={`rounded-lg px-1 py-2 text-[0.65rem] font-bold capitalize transition-colors ${
                            barcodeMealType === type ? "bg-ink text-white" : "text-muted-ink hover:bg-white"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      logBarcodeMealMutation.mutate({
                        productId: scannedProduct.id,
                        servings,
                        mealType: barcodeMealType,
                      })
                    }
                    disabled={logBarcodeMealMutation.isPending}
                    className="mt-5 h-12 w-full rounded-full bg-ink text-white font-bold"
                  >
                    {logBarcodeMealMutation.isPending ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 size-4" />
                    )}
                    Log {servings} serving{servings > 1 ? "s" : ""} as {barcodeMealType}
                  </Button>
                </div>

                {barcodeDisclosure && (
                  <div className="mt-4 rounded-xl bg-black/4 p-3 text-[0.65rem] leading-4 text-muted-ink flex items-start gap-2">
                    <Info className="size-3.5 shrink-0 mt-0.5" />
                    <span>{barcodeDisclosure}</span>
                  </div>
                )}
              </section>
            )}

            <ManualNutritionLabels defaultBarcode={barcodeInput.trim()} />
          </div>

          {/* Right column: Packaged Nutrition Facts & Today's Packaged Logs */}
          <div className="space-y-6">
            <section className="rounded-[2rem] border-2 border-ink bg-white p-6 shadow-xl text-ink">
              <div className="border-b-8 border-ink pb-2">
                <h2 className="font-display text-4xl leading-none">Nutrition Facts</h2>
                <p className="text-xs text-muted-ink mt-1">
                  {scannedProduct ? `Manufacturer label (${servings} serving${servings > 1 ? "s" : ""})` : "Scan a barcode to display label"}
                </p>
              </div>

              {packagedNutrition ? (
                <>
                  <div className="border-b-4 border-ink py-2 flex items-baseline justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-ink">Calories</p>
                      <p className="font-display text-4xl font-black">{packagedNutrition.calories}</p>
                    </div>
                    <Flame className="size-7 text-copper" />
                  </div>

                  <div className="divide-y divide-ink/15 text-xs font-medium">
                    <div className="py-2 flex justify-between font-bold">
                      <span>Total Fat</span>
                      <span>{packagedNutrition.fatG}g</span>
                    </div>
                    <div className="py-1 pl-4 flex justify-between text-muted-ink">
                      <span>Saturated Fat</span>
                      <span>{packagedNutrition.saturatedFatG}g</span>
                    </div>
                    <div className="py-2 flex justify-between font-bold">
                      <span>Sodium</span>
                      <span>{packagedNutrition.sodiumMg}mg</span>
                    </div>
                    <div className="py-2 flex justify-between font-bold">
                      <span>Total Carbohydrate</span>
                      <span>{packagedNutrition.carbsG}g</span>
                    </div>
                    <div className="py-1 pl-4 flex justify-between text-muted-ink">
                      <span>Dietary Fiber</span>
                      <span>{packagedNutrition.fiberG}g</span>
                    </div>
                    <div className="py-1 pl-4 flex justify-between text-muted-ink">
                      <span>Total Sugars</span>
                      <span>{packagedNutrition.sugarG}g</span>
                    </div>
                    <div className="py-2 flex justify-between font-bold text-sm">
                      <span>Protein</span>
                      <span>{packagedNutrition.proteinG}g</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-muted-ink">
                  Enter a barcode on the left to review its complete Nutrition Facts label.
                </div>
              )}
            </section>

            {/* Today's Logged Packaged Foods */}
            {(((dailyQuery.data as any)?.packagedLogs ?? []).length > 0 || ((dailyQuery.data as any)?.customFoodLogs ?? []).length > 0) && (
              <section className="surface p-6">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">Logged Packaged Foods</p>
                  <span className="text-xs font-semibold text-muted-ink">
                    {((dailyQuery.data as any).packagedLogs.length + (dailyQuery.data as any).customFoodLogs.length)} today
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {(dailyQuery.data as any).packagedLogs.map((log: any) => (
                    <div
                      key={`database-${log.id}`}
                      className="rounded-xl border border-ink/8 bg-white/60 p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-ink">{log.productName}</p>
                        <p className="text-[0.65rem] text-muted-ink">
                          {log.servings} serving · {log.nutritionSnapshot?.calories ?? 0} kcal · {log.mealType}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBarcodeLogMutation.mutate({ logId: log.id })}
                        disabled={removeBarcodeLogMutation.isPending}
                        className="text-xs text-destructive hover:bg-destructive/10"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {(dailyQuery.data as any).customFoodLogs.map((log: any) => (
                    <div key={`private-${log.id}`} className="rounded-xl border border-ink/8 bg-white/60 p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-ink">{log.productName}</p>
                        <p className="text-[0.65rem] text-muted-ink">{Number(log.servings)} serving · {log.nutritionSnapshot?.calories ?? 0} kcal · {log.mealType} · private label</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeCustomMealMutation.mutate({ logId: log.id })} disabled={removeCustomMealMutation.isPending} className="text-xs text-destructive hover:bg-destructive/10">Remove</Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
