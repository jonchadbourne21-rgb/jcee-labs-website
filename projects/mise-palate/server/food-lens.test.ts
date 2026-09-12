import { describe, expect, it } from "vitest";
import { cosineSimilarity, semanticVector } from "./product/memory";
import { nutritionReferenceFor, scaleNutrition, sumNutrition } from "./product/nutrition";

describe("Food Lens nutrition and semantic memory", () => {
  it("scales a reference profile to the user-confirmed portion", () => {
    const chicken = nutritionReferenceFor("chicken thighs");
    expect(chicken).not.toBeNull();
    const portion = scaleNutrition(chicken!, 200);
    expect(portion.calories).toBe(358);
    expect(portion.proteinG).toBe(48);
  });

  it("sums known items while safely ignoring unmatched references", () => {
    expect(sumNutrition([{ calories: 100, proteinG: 10, carbsG: 5, fatG: 2, saturatedFatG: 0.5, fiberG: 1, sugarG: 1, sodiumMg: 20 }, null]).calories).toBe(100);
  });

  it("ranks related food memories above unrelated memories", () => {
    const query = semanticVector("crispy lemon chicken broccoli high protein", { calories: 400, proteinG: 45, carbsG: 15, fatG: 20, saturatedFatG: 4, fiberG: 5, sugarG: 4, sodiumMg: 400 });
    const related = semanticVector("lemon chicken with broccoli and crisp skin", { calories: 420, proteinG: 42, carbsG: 12, fatG: 22, saturatedFatG: 4, fiberG: 4, sugarG: 3, sodiumMg: 420 });
    const unrelated = semanticVector("sweet berry smoothie with yogurt and oats", { calories: 420, proteinG: 12, carbsG: 65, fatG: 8, saturatedFatG: 2, fiberG: 8, sugarG: 38, sodiumMg: 90 });
    expect(cosineSimilarity(query, related)).toBeGreaterThan(cosineSimilarity(query, unrelated));
  });
});
