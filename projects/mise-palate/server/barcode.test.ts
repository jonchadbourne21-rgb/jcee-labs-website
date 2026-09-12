import { describe, expect, it } from "vitest";
import { hasValidBarcodeCheckDigit, normalizeBarcode, parseOpenFoodFactsProduct, scaleNutrition } from "./product/barcode";

describe("barcode package-label handling", () => {
  it("normalizes accepted UPC, EAN, and GTIN formatting and rejects unsupported lengths", () => {
    expect(normalizeBarcode("3017 6204 2200 3")).toBe("3017620422003");
    expect(normalizeBarcode("0-12345-67890-5")).toBe("012345678905");
    expect(() => normalizeBarcode("1234567")).toThrow("8-, 12-, 13-, or 14-digit");
  });

  it("validates GS1 modulo-10 check digits", () => {
    expect(hasValidBarcodeCheckDigit("3017620422003")).toBe(true);
    expect(hasValidBarcodeCheckDigit("3017620422004")).toBe(false);
  });

  it("uses recorded serving values and preserves source label data", () => {
    const parsed = parseOpenFoodFactsProduct("3017620422003", {
      product_name: "Nutella",
      brands: "Ferrero",
      serving_size: "15 g",
      serving_quantity: 15,
      ingredients_text: "Sugar, palm oil, hazelnuts, cocoa, milk, soy lecithin",
      allergens_tags: ["en:milk", "en:nuts", "en:soybeans"],
      completeness: 0.9,
      last_modified_t: 1_700_000_000,
      nutriments: {
        "energy-kcal_100g": 539,
        proteins_100g: 6.3,
        carbohydrates_100g: 57.5,
        fat_100g: 30.9,
        "saturated-fat_100g": 10.6,
        fiber_100g: 0,
        sugars_100g: 56.3,
        sodium_100g: 0.0428,
      },
    });
    expect(parsed.nutritionPerServing).toMatchObject({ calories: 80.9, proteinG: 0.9, carbsG: 8.6, sodiumMg: 6.4 });
    expect(parsed.allergens).toEqual(["milk", "nuts", "soybeans"]);
    expect(parsed.sourceCompleteness).toBe(90);
    expect(parsed.sourceUrl).toContain("3017620422003");
  });

  it("scales a stored label snapshot only after an explicit serving count", () => {
    expect(scaleNutrition({ calories: 100, proteinG: 4, carbsG: 12, fatG: 3, saturatedFatG: 1, fiberG: 2, sugarG: 5, sodiumMg: 180 }, 2.5)).toMatchObject({ calories: 250, proteinG: 10, sodiumMg: 450 });
  });
});
