import { describe, expect, it } from "vitest";
import { cosineSimilarity, semanticVector } from "./product/memory";
import { extractUSDAReference, foodSearchTerms, nutritionReferenceFor, scaleNutrition, selectUSDAFood, sumNutrition } from "./product/nutrition";
import { goalsForMode, nutritionGuidance, nutritionProgress } from "./product/nutrition-goals";

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

  it("extracts USDA nutrients by stable nutrient id", () => {
    const reference = extractUSDAReference({
      fdcId: 123,
      description: "Chicken breast, roasted",
      dataType: "Foundation",
      foodNutrients: [
        { nutrientId: 1008, nutrientName: "Energy", unitName: "KCAL", value: 165 },
        { nutrientId: 1003, nutrientName: "Protein", unitName: "G", value: 31.02 },
        { nutrientId: 1004, nutrientName: "Total lipid (fat)", unitName: "G", value: 3.57 },
        { nutrientId: 1093, nutrientName: "Sodium, Na", unitName: "MG", value: 74 },
      ],
    });
    expect(reference.values).toMatchObject({ calories: 165, proteinG: 31, fatG: 3.6, sodiumMg: 74 });
  });

  it("removes portion descriptors before USDA search", () => {
    expect(foodSearchTerms("lemon (half), visible portion")).toEqual(["lemon"]);
    expect(foodSearchTerms("Parmesan wedge, approximately 45 g")).toEqual(["parmesan"]);
  });

  it("prefers edible food identity over misleading USDA form matches", () => {
    const energy = [{ nutrientId: 1008, nutrientName: "Energy", unitName: "KCAL", value: 165 }];
    const chicken = selectUSDAFood(
      [
        { fdcId: 1, description: "Chicken, skin (drumsticks and thighs), raw", dataType: "SR Legacy", foodNutrients: energy },
        { fdcId: 2, description: "Chicken thigh, meat only, raw", dataType: "Foundation", foodNutrients: energy },
      ],
      foodSearchTerms("chicken thighs")
    );
    const lemon = selectUSDAFood(
      [
        { fdcId: 3, description: "Lemon juice from concentrate, bottled", dataType: "SR Legacy", foodNutrients: energy },
        { fdcId: 4, description: "Lemons, raw, without peel", dataType: "Foundation", foodNutrients: energy },
      ],
      foodSearchTerms("lemon (half)")
    );
    expect(chicken?.fdcId).toBe(2);
    expect(lemon?.fdcId).toBe(4);
  });

  it("calculates goal progress and gives bounded planning guidance", () => {
    const goals = goalsForMode("high_protein");
    const total = { calories: 1200, proteinG: 55, carbsG: 120, fatG: 45, saturatedFatG: 10, fiberG: 10, sugarG: 25, sodiumMg: 2100 };
    const progress = nutritionProgress(total, goals);
    expect(progress.protein).toBe(39);
    expect(progress.sodium).toBe(91);
    expect(nutritionGuidance(total, goals).join(" ")).toContain("Sodium");
  });
});
