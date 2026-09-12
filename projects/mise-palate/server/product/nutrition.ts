import type { FoodLensItem, NutritionValues } from "../../shared/product";

export const NUTRITION_SOURCE = {
  label: "Generic nutrition reference profile",
  url: "https://fdc.nal.usda.gov/",
};

export const USDA_SOURCE = {
  label: "USDA FoodData Central",
  url: "https://fdc.nal.usda.gov/",
};

export const FOOD_LENS_DISCLOSURE =
  "Photo recognition and portion size are estimates. Nutrition is calculated from an optional USDA FoodData Central match or a closest generic reference profile; it is not a package label or laboratory measurement. Confirm the food and grams before relying on it. This feature is not medical nutrition advice.";

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
  { terms: ["chicken thigh", "chicken"], values: { calories: 179, proteinG: 24, carbsG: 0, fatG: 8.6, saturatedFatG: 2.4, fiberG: 0, sugarG: 0, sodiumMg: 82 } },
  { terms: ["chicken breast"], values: { calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6, saturatedFatG: 1, fiberG: 0, sugarG: 0, sodiumMg: 74 } },
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

function round(value: number, places = 1) {
  const power = 10 ** places;
  return Math.round(value * power) / power;
}

export function nutritionReferenceFor(foodName: string) {
  const normalized = foodName.toLowerCase();
  const match = profiles.find(profile => profile.terms.some(term => normalized.includes(term)));
  return match?.values ?? null;
}

type USDAReference = { fdcId: number; description: string; values: NutritionValues };

type USDAFood = {
  fdcId: number;
  description: string;
  foodNutrients?: Array<{ nutrientName?: string; value?: number }>;
};

export async function lookupUSDAReference(foodName: string): Promise<USDAReference | null> {
  const apiKey = process.env.USDA_FDC_API_KEY;
  if (!apiKey) return null;
  try {
    const searchUrl = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
    searchUrl.searchParams.set("api_key", apiKey);
    const response = await fetch(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: foodName,
        pageSize: 1,
        dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)"],
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { foods?: USDAFood[] };
    const food = data.foods?.[0];
    if (!food) return null;
    const nutrients = food.foodNutrients ?? [];
    const amount = (name: string) => nutrients.find(item => item.nutrientName?.toLowerCase() === name.toLowerCase())?.value ?? 0;
    return {
      fdcId: food.fdcId,
      description: food.description,
      values: {
        calories: Math.round(amount("Energy")),
        proteinG: amount("Protein"),
        carbsG: amount("Carbohydrate, by difference"),
        fatG: amount("Total lipid (fat)"),
        saturatedFatG: amount("Fatty acids, total saturated"),
        fiberG: amount("Fiber, total dietary"),
        sugarG: amount("Sugars, Total"),
        sodiumMg: amount("Sodium, Na"),
      },
    };
  } catch {
    return null;
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

export function hydrateFoodLensItem(input: {
  id: string;
  name: string;
  confidence: number;
  estimatedGrams: number;
  portionConfidence: number;
  needsConfirmation: boolean;
}): FoodLensItem {
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

export function totalFoodLensNutrition(items: FoodLensItem[]) {
  return sumNutrition(items.map(item => item.nutritionForPortion));
}
