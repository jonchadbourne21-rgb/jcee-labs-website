import { describe, expect, it } from "vitest";
import type { NutritionValues } from "../shared/product";
import { aggregateNutritionTrends, trendSummary } from "./product/nutrition-trends";

const nutrition = (calories: number, proteinG: number): NutritionValues => ({
  calories,
  proteinG,
  carbsG: 20,
  fatG: 10,
  saturatedFatG: 2,
  fiberG: 3,
  sugarG: 5,
  sodiumMg: 200,
});

describe("nutrition trend aggregation", () => {
  it("separates fresh and packaged logs into user-local day buckets", () => {
    const days = [
      { key: "day-1", label: "Mon", startMs: 1000, endMs: 2000 },
      { key: "day-2", label: "Tue", startMs: 2000, endMs: 3000 },
    ];
    const buckets = aggregateNutritionTrends(
      days,
      [{ eatenAt: new Date(1500), nutritionSnapshot: nutrition(500, 35) }],
      [
        { eatenAt: new Date(1600), nutritionSnapshot: nutrition(200, 8) },
        { eatenAt: new Date(2600), nutritionSnapshot: nutrition(300, 12) },
      ]
    );
    expect(buckets[0]).toMatchObject({ freshLogCount: 1, packagedLogCount: 1 });
    expect(buckets[0].total.calories).toBe(700);
    expect(buckets[1].packaged.calories).toBe(300);
  });

  it("summarizes calorie source share without dividing by zero", () => {
    const empty = aggregateNutritionTrends([{ key: "x", label: "X", startMs: 0, endMs: 1000 }], [], []);
    expect(trendSummary(empty)).toMatchObject({ loggedDays: 0, freshSharePercent: 0, packagedSharePercent: 0 });

    const filled = aggregateNutritionTrends(
      [{ key: "x", label: "X", startMs: 0, endMs: 1000 }],
      [{ eatenAt: new Date(500), nutritionSnapshot: nutrition(600, 30) }],
      [{ eatenAt: new Date(500), nutritionSnapshot: nutrition(400, 10) }]
    );
    expect(trendSummary(filled)).toMatchObject({ freshSharePercent: 60, packagedSharePercent: 40 });
  });
});
