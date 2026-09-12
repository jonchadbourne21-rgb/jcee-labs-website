import { describe, expect, it } from "vitest";
import { DEFAULT_PALATE, EMPTY_CONFIDENCE } from "../shared/product";
import { calibratePalate, learnFromMeal } from "./product/palate";

describe("Palate Twin learning", () => {
  it("builds a meaningful prior from eight fast decisions", () => {
    const result = calibratePalate([
      "crispy_wings",
      "tomato_pasta",
      "spicy_curry",
      "medium_steak",
      "bright_vinaigrette",
      "charred",
      "crunchy_veg",
      "sauce_on_side",
    ]);
    expect(result.dimensions.crunch).toBeGreaterThan(DEFAULT_PALATE.crunch);
    expect(result.dimensions.acidity).toBeGreaterThan(DEFAULT_PALATE.acidity);
    expect(result.dimensions.spice).toBeGreaterThan(DEFAULT_PALATE.spice);
    expect(result.confidence.crunch).toBeGreaterThan(EMPTY_CONFIDENCE.crunch);
    expect(result.signals.length).toBeGreaterThanOrEqual(8);
  });

  it("turns crispier feedback into a bounded future preference signal", () => {
    const learned = learnFromMeal(DEFAULT_PALATE, EMPTY_CONFIDENCE, "loved", ["crispier"]);
    expect(learned.dimensions.crunch).toBeGreaterThan(DEFAULT_PALATE.crunch);
    expect(learned.confidence.crunch).toBeGreaterThan(EMPTY_CONFIDENCE.crunch);
    expect(learned.signals).toEqual(
      expect.arrayContaining([expect.objectContaining({ dimension: "crunch", direction: 1 })])
    );
  });

  it("never lets repeated feedback leave the 0-100 sensory range", () => {
    const high = { ...DEFAULT_PALATE, spice: 99 };
    const result = learnFromMeal(high, EMPTY_CONFIDENCE, "loved", ["more_spicy"]);
    expect(result.dimensions.spice).toBeLessThanOrEqual(100);
  });
});
