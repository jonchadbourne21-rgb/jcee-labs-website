import { describe, expect, it } from "vitest";
import { normalizeRecipeTags } from "./product/tags";

describe("recipe favorites tags", () => {
  it("normalizes tags for dependable filtering and eliminates duplicates", () => {
    expect(normalizeRecipeTags(["Weeknight", "weeknight ", "  High Protein  ", "#Crispy!", ""])).toEqual([
      "weeknight",
      "high protein",
      "crispy",
    ]);
  });

  it("limits each recipe to eight focused tags", () => {
    expect(normalizeRecipeTags(["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"])).toHaveLength(8);
  });
});
