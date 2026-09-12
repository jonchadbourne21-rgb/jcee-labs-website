import type { FoodLensItem, NutritionValues } from "../../shared/product";

export const NUTRITION_SOURCE = {
  label: "Mise generic reference (USDA-derived)",
  url: "https://fdc.nal.usda.gov/",
};

export const USDA_SOURCE = {
  label: "USDA FoodData Central",
  url: "https://fdc.nal.usda.gov/",
};

export const FOOD_LENS_DISCLOSURE =
  "Photo recognition and portion size are estimates. Nutrition is calculated from a live USDA FoodData Central match when available, otherwise a closest generic reference profile; it is not a package label or laboratory measurement. Confirm the food and grams before relying on it. This feature is not medical nutrition advice.";

const zero = (): NutritionValues => ({
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  saturatedFatG: 0,
  fiberG: 0,
  sugarG: 0,
  sodiumMg: 0,
});

const profiles: Array<{ terms: string[]; values: NutritionValues }> = [
  { terms: ["chicken breast"], values: { calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6, saturatedFatG: 1, fiberG: 0, sugarG: 0, sodiumMg: 74 } },
  { terms: ["chicken thigh", "chicken"], values: { calories: 179, proteinG: 24, carbsG: 0, fatG: 8.6, saturatedFatG: 2.4, fiberG: 0, sugarG: 0, sodiumMg: 82 } },
  { terms: ["salmon"], values: { calories: 208, proteinG: 20, carbsG: 0, fatG: 13, saturatedFatG: 3.1, fiberG: 0, sugarG: 0, sodiumMg: 59 } },
  { terms: ["broccoli"], values: { calories: 34, proteinG: 2.8, carbsG: 6.6, fatG: 0.4, saturatedFatG: 0.1, fiberG: 2.6, sugarG: 1.7, sodiumMg: 33 } },
  { terms: ["rice"], values: { calories: 130, proteinG: 2.4, carbsG: 28.2, fatG: 0.3, saturatedFatG: 0.1, fiberG: 0.4, sugarG: 0.1, sodiumMg: 1 } },
  { terms: ["pasta"], values: { calories: 157, proteinG: 5.8, carbsG: 30.9, fatG: 0.9, saturatedFatG: 0.2, fiberG: 1.8, sugarG: 0.6, sodiumMg: 1 } },
  { terms: ["egg"], values: { calories: 143, proteinG: 12.6, carbsG: 0.7, fatG: 9.5, saturatedFatG: 3.1, fiberG: 0, sugarG: 0.4, sodiumMg: 140 } },
  { terms: ["avocado"], values: { calories: 160, proteinG: 2, carbsG: 8.5, fatG: 14.7, saturatedFatG: 2.1, fiberG: 6.7, sugarG: 0.7, sodiumMg: 7 } },
  { terms: ["lemon"], values: { calories: 29, proteinG: 1.1, carbsG: 9.3, fatG: 0.3, saturatedFatG: 0, fiberG: 2.8, sugarG: 2.5, sodiumMg: 2 } },
  { terms: ["parmesan", "cheese"], values: { calories: 431, proteinG: 38, carbsG: 4.1, fatG: 29, saturatedFatG: 18.6, fiberG: 0, sugarG: 0.9, sodiumMg: 1529 } },
  { terms: ["olive oil", "oil"], values: { calories: 884, proteinG: 0, carbsG: 0, fatG: 100, saturatedFatG: 13.8, fiberG: 0, sugarG: 0, sodiumMg: 2 } },
  { terms: ["pizza"], values: { calories: 266, proteinG: 11, carbsG: 33, fatG: 10, saturatedFatG: 4.5, fiberG: 2.3, sugarG: 3.6, sodiumMg: 598 } },
  { terms: ["burger", "hamburger"], values: { calories: 295, proteinG: 17, carbsG: 30, fatG: 13, saturatedFatG: 5, fiberG: 1.5, sugarG: 5, sodiumMg: 500 } },
  { terms: ["salad"], values: { calories: 70, proteinG: 2, carbsG: 9, fatG: 3, saturatedFatG: 0.5, fiberG: 3, sugarG: 3, sodiumMg: 80 } },
];

const cache = new Map<string, { expiresAt: number; value: USDAReference | null }>();
const CACHE_MS = 1000 * 60 * 60 * 12;

function round(value: number, places = 1) {
  const power = 10 ** places;
  return Math.round(value * power) / power;
}

function finite(value: number | undefined) {
  return Number.isFinite(value) ? Number(value) : 0;
}

export function nutritionReferenceFor(foodName: string) {
  const normalized = foodName.toLowerCase();
  const match = profiles.find(profile => profile.terms.some(term => normalized.includes(term)));
  return match?.values ?? null;
}

export type USDAReference = {
  fdcId: number;
  description: string;
  dataType: string;
  values: NutritionValues;
};

type USDANutrient = {
  nutrientId?: number;
  nutrientName?: string;
  unitName?: string;
  value?: number;
};

export type USDAFood = {
  fdcId: number;
  description: string;
  dataType?: string;
  foodNutrients?: USDANutrient[];
};

const SEARCH_STOP_WORDS = new Set([
  "a", "an", "and", "the", "with", "of", "half", "whole", "large", "medium", "small",
  "piece", "pieces", "slice", "slices", "wedge", "wedges", "head", "heads", "clove", "cloves",
  "floret", "florets", "serving", "portion", "estimated", "visible", "approximate", "approximately", "about",
]);

export function foodSearchTerms(foodName: string) {
  const withoutAmounts = foodName
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d+(?:\.\d+)?\s*(?:g|gram|grams|oz|ounce|ounces|lb|pound|pounds|cup|cups|tbsp|tsp)\b/g, " ");
  return Array.from(
    new Set(
      (withoutAmounts.match(/[a-z]+/g) ?? []).filter(token => token.length > 1 && !SEARCH_STOP_WORDS.has(token))
    )
  );
}

function canonicalToken(token: string) {
  if (token.endsWith("ies") && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith("s") && token.length > 3 && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

function candidateScore(food: USDAFood, terms: string[]) {
  if (!terms.length) return 0;
  const queryTokens = terms.map(canonicalToken);
  const descriptionTokens = new Set((food.description.toLowerCase().match(/[a-z]+/g) ?? []).map(canonicalToken));
  const overlap = queryTokens.filter(term => descriptionTokens.has(term)).length;
  if (!overlap) return 0;
  const coverage = overlap / queryTokens.length;
  const typeBonus = food.dataType === "Foundation" ? 0.12 : food.dataType === "SR Legacy" ? 0.08 : 0.04;
  const undesirable = ["skin", "peel", "juice", "concentrate", "bottled", "luncheon", "roll", "baby", "gravy"];
  const mismatchPenalty = undesirable.filter(term => descriptionTokens.has(term) && !queryTokens.includes(term)).length * 0.16;
  return coverage + typeBonus - mismatchPenalty;
}

export function selectUSDAFood(foods: USDAFood[], terms: string[]) {
  return foods
    .filter(candidate => nutrient(candidate, [1008], ["Energy"]) > 0)
    .map(candidate => ({ candidate, score: candidateScore(candidate, terms) }))
    .filter(match => match.score >= 0.5)
    .sort((left, right) => right.score - left.score)[0]?.candidate;
}

function nutrient(food: USDAFood, ids: number[], names: string[]) {
  const nutrients = food.foodNutrients ?? [];
  const byId = nutrients.find(item => item.nutrientId !== undefined && ids.includes(item.nutrientId));
  if (byId) return finite(byId.value);
  const normalizedNames = names.map(name => name.toLowerCase());
  const byName = nutrients.find(item => item.nutrientName && normalizedNames.includes(item.nutrientName.toLowerCase()));
  return finite(byName?.value);
}

export function extractUSDAReference(food: USDAFood): USDAReference {
  return {
    fdcId: food.fdcId,
    description: food.description,
    dataType: food.dataType ?? "USDA",
    values: {
      calories: Math.round(nutrient(food, [1008], ["Energy"])),
      proteinG: round(nutrient(food, [1003], ["Protein"])),
      carbsG: round(nutrient(food, [1005], ["Carbohydrate, by difference"])),
      fatG: round(nutrient(food, [1004], ["Total lipid (fat)"])),
      saturatedFatG: round(nutrient(food, [1258], ["Fatty acids, total saturated"])),
      fiberG: round(nutrient(food, [1079], ["Fiber, total dietary"])),
      sugarG: round(nutrient(food, [2000, 1063], ["Sugars, Total", "Sugars, total including NLEA"])),
      sodiumMg: Math.round(nutrient(food, [1093], ["Sodium, Na"])),
    },
  };
}

export async function lookupUSDAReference(foodName: string): Promise<USDAReference | null> {
  const terms = foodSearchTerms(foodName);
  const query = terms.join(" ");
  if (!query) return null;
  const cached = cache.get(query);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const apiKey = process.env.USDA_FDC_API_KEY?.trim() || "DEMO_KEY";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const searchUrl = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
    searchUrl.searchParams.set("api_key", apiKey);
    const response = await fetch(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Mise-Food-Lens/1.0" },
      body: JSON.stringify({
        query,
        pageSize: 10,
        requireAllWords: false,
        dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)"],
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      cache.set(query, { expiresAt: Date.now() + 60_000, value: null });
      return null;
    }
    const data = (await response.json()) as { foods?: USDAFood[] };
    const food = selectUSDAFood(data.foods ?? [], terms);
    const result = food ? extractUSDAReference(food) : null;
    cache.set(query, { expiresAt: Date.now() + CACHE_MS, value: result });
    return result;
  } catch (error) {
    if (!(error instanceof Error && error.name === "AbortError")) {
      console.warn("[USDA] FoodData Central lookup failed", { foodName, error });
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function scaleNutrition(per100g: NutritionValues, grams: number): NutritionValues {
  const multiplier = Math.max(0, grams) / 100;
  return {
    calories: Math.round(per100g.calories * multiplier),
    proteinG: round(per100g.proteinG * multiplier),
    carbsG: round(per100g.carbsG * multiplier),
    fatG: round(per100g.fatG * multiplier),
    saturatedFatG: round(per100g.saturatedFatG * multiplier),
    fiberG: round(per100g.fiberG * multiplier),
    sugarG: round(per100g.sugarG * multiplier),
    sodiumMg: Math.round(per100g.sodiumMg * multiplier),
  };
}

export function sumNutrition(values: Array<NutritionValues | null>): NutritionValues {
  return values.reduce<NutritionValues>((total, item) => {
    if (!item) return total;
    return {
      calories: total.calories + item.calories,
      proteinG: round(total.proteinG + item.proteinG),
      carbsG: round(total.carbsG + item.carbsG),
      fatG: round(total.fatG + item.fatG),
      saturatedFatG: round(total.saturatedFatG + item.saturatedFatG),
      fiberG: round(total.fiberG + item.fiberG),
      sugarG: round(total.sugarG + item.sugarG),
      sodiumMg: total.sodiumMg + item.sodiumMg,
    };
  }, zero());
}

type FoodLensCandidate = {
  id: string;
  name: string;
  confidence: number;
  estimatedGrams: number;
  portionConfidence: number;
  needsConfirmation: boolean;
};

export function hydrateFoodLensItem(input: FoodLensCandidate): FoodLensItem {
  const nutritionPer100g = nutritionReferenceFor(input.name);
  const nutritionForPortion = nutritionPer100g ? scaleNutrition(nutritionPer100g, input.estimatedGrams) : null;
  return {
    ...input,
    referenceStatus: nutritionPer100g ? "estimated" : "needs_reference",
    sourceLabel: nutritionPer100g ? NUTRITION_SOURCE.label : "No close reference profile matched",
    sourceUrl: NUTRITION_SOURCE.url,
    nutritionPer100g,
    nutritionForPortion,
  };
}

export async function resolveFoodLensItem(input: FoodLensCandidate): Promise<FoodLensItem> {
  const local = hydrateFoodLensItem(input);
  const usda = await lookupUSDAReference(input.name);
  if (!usda) return local;
  return {
    ...local,
    referenceStatus: "matched_reference",
    sourceLabel: `${USDA_SOURCE.label}: ${usda.description} · ${usda.dataType}`,
    sourceUrl: `${USDA_SOURCE.url}food-details.html?fdcId=${usda.fdcId}`,
    nutritionPer100g: usda.values,
    nutritionForPortion: scaleNutrition(usda.values, input.estimatedGrams),
  };
}

export function totalFoodLensNutrition(items: FoodLensItem[]) {
  return sumNutrition(items.map(item => item.nutritionForPortion));
}
