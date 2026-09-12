export const SENSORY_DIMENSIONS = [
  "sweetness",
  "acidity",
  "salt",
  "spice",
  "richness",
  "bitterness",
  "herbaceous",
  "crunch",
  "tenderness",
  "doneness",
  "sauce",
  "smokiness",
] as const;

export type SensoryDimension = (typeof SENSORY_DIMENSIONS)[number];
export type SensoryProfile = Record<SensoryDimension, number>;

export type IngredientDetection = {
  name: string;
  confidence: number;
  quantityHint: string;
  needsConfirmation: boolean;
};

export type NutritionValues = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  saturatedFatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
};

export type NutritionGoalMode = "balanced" | "high_protein" | "lower_carb" | "custom";

export type NutritionGoals = {
  mode: NutritionGoalMode;
  caloriesTarget: number;
  proteinGTarget: number;
  carbsGTarget: number;
  fatGTarget: number;
  fiberGTarget: number;
  sodiumMgLimit: number;
};

export const DEFAULT_NUTRITION_GOALS: NutritionGoals = {
  mode: "balanced",
  caloriesTarget: 2000,
  proteinGTarget: 100,
  carbsGTarget: 250,
  fatGTarget: 70,
  fiberGTarget: 28,
  sodiumMgLimit: 2300,
};

export type FoodLensItem = {
  id: string;
  name: string;
  confidence: number;
  estimatedGrams: number;
  portionConfidence: number;
  needsConfirmation: boolean;
  referenceStatus: "matched_reference" | "estimated" | "needs_reference";
  sourceLabel: string;
  sourceUrl: string;
  nutritionPer100g: NutritionValues | null;
  nutritionForPortion: NutritionValues | null;
};

export type FoodLensAnalysis = {
  dishGuess: string;
  overallConfidence: number;
  portionConfidence: number;
  uncertaintySummary: string;
  measurementNote: string;
  estimateDisclosure: string;
  items: FoodLensItem[];
  totalNutrition: NutritionValues;
  generationMode: "live_ai" | "safe_fallback";
};

export type PackagedFoodProduct = {
  id: number;
  barcode: string;
  productName: string;
  brands: string | null;
  servingSize: string | null;
  ingredientsText: string | null;
  allergens: string[];
  nutritionPerServing: NutritionValues;
  nutritionPer100g: NutritionValues | null;
  sourceUrl: string;
  sourceCompleteness: number | null;
  imageUrl: string | null;
  sourceUpdatedAt: Date | null;
  fetchedAt: Date;
};

export type BarcodeLookupResult =
  | { status: "found"; product: PackagedFoodProduct; cacheStatus: "fresh" | "cached"; labelDisclosure: string }
  | { status: "not_found"; barcode: string; message: string }
  | { status: "unavailable"; barcode: string; message: string };

export type CustomFoodLabel = {
  id: number;
  userId: number;
  barcode: string | null;
  productName: string;
  brand: string | null;
  servingSize: string;
  ingredientsText: string | null;
  allergens: string[];
  nutritionPerServing: NutritionValues;
  createdAt: Date;
  updatedAt: Date;
};

export type NutritionTrendBucket = {
  key: string;
  label: string;
  fresh: NutritionValues;
  packaged: NutritionValues;
  total: NutritionValues;
  freshLogCount: number;
  packagedLogCount: number;
};

export type BarcodeDeviceDiagnostic = {
  id: number;
  userId: number;
  deviceLabel: string;
  platform: string;
  browser: string;
  engine: "native" | "zxing" | "unavailable";
  cameraStartMs: number | null;
  firstDetectionMs: number | null;
  trialCount: number;
  successfulTrials: number;
  medianDetectionMs: number | null;
  focusSupported: boolean;
  continuousFocusSupported: boolean;
  torchSupported: boolean;
  rearCameraSelected: boolean;
  videoWidth: number | null;
  videoHeight: number | null;
  notes: string | null;
  createdAt: Date;
};

export type BarcodeScannerTelemetry = Omit<BarcodeDeviceDiagnostic, "id" | "userId" | "deviceLabel" | "platform" | "browser" | "notes" | "createdAt">;

export type SemanticMemoryResult = {
  id: number;
  kind: "food_lens" | "recipe" | "meal_feedback" | "preference";
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
};

export type RecipeOption = {
  id: string;
  title: string;
  description: string;
  whyForYou: string;
  cuisine: string;
  activeMinutes: number;
  totalMinutes: number;
  difficulty: "easy" | "moderate" | "ambitious";
  sensoryProfile: SensoryProfile;
  imageUrl: string;
};

export type RecipeIngredient = {
  name: string;
  amount: number;
  unit: string;
  preparation: string;
  optional: boolean;
  allergens: string[];
};

export type MiseItem = {
  order: number;
  task: string;
  reason: string;
  canParallelize: boolean;
};

export type RecipeStep = {
  id: string;
  title: string;
  instruction: string;
  why: string;
  minutes: number;
  temperatureF: number;
  visualCue: string;
  smellCue: string;
  textureCue: string;
  commonMistake: string;
  recovery: string;
  techniqueSlug: string;
  parallelGroup: string;
  safetyRuleIds: string[];
};

export type Substitution = {
  ingredient: string;
  substitute: string;
  ratio: string;
  sensoryTradeoff: string;
  methodChange: string;
};

export type SafetyRule = {
  id: string;
  title: string;
  requirement: string;
  sourceLabel: string;
  sourceUrl: string;
  authority: "authoritative";
};

export type StructuredRecipe = {
  title: string;
  summary: string;
  rationale: string;
  ingredients: RecipeIngredient[];
  equipment: string[];
  miseEnPlace: MiseItem[];
  steps: RecipeStep[];
  sensoryProfile: SensoryProfile;
  substitutions: Substitution[];
  safetyRules: SafetyRule[];
  platingNotes: string;
  activeMinutes: number;
  totalMinutes: number;
  difficulty: "easy" | "moderate" | "ambitious";
  generationMode: "live_ai" | "safe_fallback";
};

export type TasteForecast = {
  interpretation: string;
  confidence: "high" | "medium" | "low";
  changes: Array<{
    dimension: SensoryDimension;
    delta: number;
    explanation: string;
  }>;
  culinaryActions: string[];
  watchOuts: string[];
};

export const DEFAULT_PALATE: SensoryProfile = {
  sweetness: 50,
  acidity: 55,
  salt: 50,
  spice: 45,
  richness: 50,
  bitterness: 35,
  herbaceous: 55,
  crunch: 60,
  tenderness: 60,
  doneness: 55,
  sauce: 55,
  smokiness: 45,
};

export const EMPTY_CONFIDENCE: SensoryProfile = Object.fromEntries(
  SENSORY_DIMENSIONS.map(dimension => [dimension, 15])
) as SensoryProfile;

export const DISH_IMAGES = {
  ingredients: "/manus-storage/mise-ingredients_ff9547f3.jpg",
  lemon: "/manus-storage/mise-lemon-chicken_1f590d72.jpg",
  korean: "/manus-storage/mise-korean-bowl_470247c9.jpg",
  tuscan: "/manus-storage/mise-tuscan-chicken_727cc6eb.jpg",
} as const;
