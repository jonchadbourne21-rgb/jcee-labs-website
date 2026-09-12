import { describe, expect, it } from "vitest";
import { enforceSafetyText, relevantSafetyRules } from "./product/safety";

describe("fixed safety layer", () => {
  it("attaches authoritative poultry, cross-contamination, and allergen rules", () => {
    const rules = relevantSafetyRules(["chicken thighs", "broccoli", "Parmesan"], "crispy chicken");
    expect(rules.map(rule => rule.id)).toEqual(expect.arrayContaining(["poultry-165", "cross-contamination", "big-nine-allergens"]));
    expect(rules.find(rule => rule.id === "poultry-165")?.sourceUrl).toContain("food-safety-charts");
  });

  it("corrects generated poultry language that suggests a lower Fahrenheit target", () => {
    const rules = relevantSafetyRules(["chicken breast"]);
    const output = enforceSafetyText("Pull the chicken at 150 F.", rules);
    expect(output).toContain("165°F");
  });

  it("keeps seafood and whole-cut rules distinct", () => {
    const seafood = relevantSafetyRules(["salmon"]);
    const steak = relevantSafetyRules(["beef steak"]);
    expect(seafood.map(rule => rule.id)).toContain("seafood-145");
    expect(steak.map(rule => rule.id)).toContain("whole-cut-145-rest");
  });
});
