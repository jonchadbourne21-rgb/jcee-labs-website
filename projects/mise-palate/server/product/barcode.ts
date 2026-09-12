import type { NutritionValues } from "../../shared/product";

export const OPEN_FOOD_FACTS_SOURCE = "Open Food Facts";
export const OPEN_FOOD_FACTS_PRODUCT_URL = (barcode: string) => `https://world.openfoodfacts.org/product/${barcode}`;

export type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number;
  ingredients_text?: string;
  allergens_tags?: string[];
  image_front_url?: string;
  completeness?: number;
  last_modified_t?: number;
  nutriments?: Record<string, unknown>;
};

type OpenFoodFactsResponse = {
  status?: number;
  status_verbose?: string;
  product?: OpenFoodFactsProduct;
};

const ZERO_NUTRITION: NutritionValues = {
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  saturatedFatG: 0,
  fiberG: 0,
  sugarG: 0,
  sodiumMg: 0,
};

function finiteNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number, places = 1) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function gramsFromServingSize(servingSize: string | undefined, servingQuantity: unknown) {
  const explicit = finiteNumber(servingQuantity);
  if (explicit > 0) return explicit;
  const match = servingSize?.match(/(\d+(?:\.\d+)?)\s*g\b/i);
  return match ? Number(match[1]) : null;
}

function sodiumMg(nutriments: Record<string, unknown>, suffix: string) {
  const sodiumG = finiteNumber(nutriments[`sodium${suffix}`]);
  if (sodiumG > 0) return round(sodiumG * 1000);
  const saltG = finiteNumber(nutriments[`salt${suffix}`]);
  return round(saltG * 400);
}

function valuesFromNutriments(nutriments: Record<string, unknown>, suffix: string): NutritionValues {
  return {
    calories: round(finiteNumber(nutriments[`energy-kcal${suffix}`]) || finiteNumber(nutriments[`energy${suffix}`]) / 4.184),
    proteinG: round(finiteNumber(nutriments[`proteins${suffix}`])),
    carbsG: round(finiteNumber(nutriments[`carbohydrates${suffix}`])),
    fatG: round(finiteNumber(nutriments[`fat${suffix}`])),
    saturatedFatG: round(finiteNumber(nutriments[`saturated-fat${suffix}`])),
    fiberG: round(finiteNumber(nutriments[`fiber${suffix}`])),
    sugarG: round(finiteNumber(nutriments[`sugars${suffix}`])),
    sodiumMg: sodiumMg(nutriments, suffix),
  };
}

function nonZeroNutrition(values: NutritionValues) {
  return Object.values(values).some(value => value > 0);
}

export function normalizeBarcode(raw: string) {
  const barcode = raw.replace(/[^0-9]/g, "");
  if (![8, 12, 13, 14].includes(barcode.length)) {
    throw new Error("Use an 8-, 12-, 13-, or 14-digit UPC, EAN, or GTIN barcode.");
  }
  return barcode;
}

export function hasValidBarcodeCheckDigit(barcode: string) {
  const normalized = normalizeBarcode(barcode);
  const supplied = Number(normalized.at(-1));
  const digits = normalized.slice(0, -1).split("").map(Number).reverse();
  const total = digits.reduce((sum, digit, index) => sum + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (total % 10)) % 10 === supplied;
}

export function parseOpenFoodFactsProduct(barcode: string, product: OpenFoodFactsProduct) {
  const normalizedBarcode = normalizeBarcode(barcode);
  const nutriments = product.nutriments ?? {};
  const servingGrams = gramsFromServingSize(product.serving_size, product.serving_quantity);
  const per100g = valuesFromNutriments(nutriments, "_100g");
  const directServing = valuesFromNutriments(nutriments, "_serving");
  const perServing = nonZeroNutrition(directServing)
    ? directServing
    : servingGrams
      ? scaleNutrition(per100g, servingGrams / 100)
      : per100g;
  if (!nonZeroNutrition(perServing)) {
    throw new Error("This product record has no usable Nutrition Facts values to log.");
  }
  return {
    barcode: normalizedBarcode,
    productName: (product.product_name ?? product.product_name_en ?? "Unnamed packaged product").slice(0, 320),
    brands: product.brands?.slice(0, 320) || null,
    servingSize: product.serving_size?.slice(0, 120) || (servingGrams ? `${servingGrams} g` : null),
    ingredientsText: product.ingredients_text || null,
    allergens: (product.allergens_tags ?? []).map(tag => tag.replace(/^[a-z]{2}:/, "").replace(/-/g, " ")),
    nutritionPerServing: perServing,
    nutritionPer100g: nonZeroNutrition(per100g) ? per100g : null,
    nutrimentsRaw: nutriments,
    sourceUrl: OPEN_FOOD_FACTS_PRODUCT_URL(normalizedBarcode),
    sourceCompleteness: typeof product.completeness === "number" ? Math.round(product.completeness * 100) : null,
    imageUrl: product.image_front_url || null,
    sourceUpdatedAt: product.last_modified_t ? new Date(product.last_modified_t * 1000) : null,
  };
}

export function scaleNutrition(values: NutritionValues, multiplier: number): NutritionValues {
  return {
    calories: round(values.calories * multiplier),
    proteinG: round(values.proteinG * multiplier),
    carbsG: round(values.carbsG * multiplier),
    fatG: round(values.fatG * multiplier),
    saturatedFatG: round(values.saturatedFatG * multiplier),
    fiberG: round(values.fiberG * multiplier),
    sugarG: round(values.sugarG * multiplier),
    sodiumMg: round(values.sodiumMg * multiplier),
  };
}

export async function fetchOpenFoodFactsProduct(rawBarcode: string): Promise<
  { status: "found"; product: ReturnType<typeof parseOpenFoodFactsProduct> } | { status: "not_found" } | { status: "unavailable" }
> {
  const barcode = normalizeBarcode(rawBarcode);
  if (!hasValidBarcodeCheckDigit(barcode)) throw new Error("That barcode’s check digit is invalid. Check the digits and try again.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=code,product_name,product_name_en,brands,serving_size,serving_quantity,nutriments,ingredients_text,allergens_tags,image_front_url,completeness,last_modified_t`,
      { headers: { "User-Agent": "Mise-Personal-Culinary-Intelligence/1.0 (packaged-food-label lookup)" }, signal: controller.signal }
    );
    if (!response.ok) return { status: "unavailable" };
    const data = (await response.json()) as OpenFoodFactsResponse;
    if (data.status !== 1 || !data.product) return { status: "not_found" };
    return { status: "found", product: parseOpenFoodFactsProduct(barcode, data.product) };
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}

export const PACKAGED_LABEL_DISCLOSURE = "Nutrition is the packaged-product label data as listed in Open Food Facts at lookup time. Review the package in hand for current serving size, ingredients, allergens, and label changes.";
export const EMPTY_PACKAGED_NUTRITION = ZERO_NUTRITION;
