import type { NutritionTrendBucket, NutritionValues } from "../../shared/product";
import { sumNutrition } from "./nutrition";

export type TrendDayInput = { key: string; label: string; startMs: number; endMs: number };
export type TrendLogInput = { eatenAt: Date; nutritionSnapshot: NutritionValues };

const ZERO: NutritionValues = {
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  saturatedFatG: 0,
  fiberG: 0,
  sugarG: 0,
  sodiumMg: 0,
};

export function aggregateNutritionTrends(days: TrendDayInput[], freshLogs: TrendLogInput[], packagedLogs: TrendLogInput[]): NutritionTrendBucket[] {
  return days.map(day => {
    const inDay = (log: TrendLogInput) => {
      const timestamp = new Date(log.eatenAt).getTime();
      return timestamp >= day.startMs && timestamp < day.endMs;
    };
    const freshForDay = freshLogs.filter(inDay).map(log => log.nutritionSnapshot);
    const packagedForDay = packagedLogs.filter(inDay).map(log => log.nutritionSnapshot);
    const fresh = freshForDay.length ? sumNutrition(freshForDay) : { ...ZERO };
    const packaged = packagedForDay.length ? sumNutrition(packagedForDay) : { ...ZERO };
    return {
      key: day.key,
      label: day.label,
      fresh,
      packaged,
      total: sumNutrition([fresh, packaged]),
      freshLogCount: freshForDay.length,
      packagedLogCount: packagedForDay.length,
    };
  });
}

export function trendSummary(buckets: NutritionTrendBucket[]) {
  const freshCalories = buckets.reduce((sum, bucket) => sum + bucket.fresh.calories, 0);
  const packagedCalories = buckets.reduce((sum, bucket) => sum + bucket.packaged.calories, 0);
  const loggedDays = buckets.filter(bucket => bucket.freshLogCount + bucket.packagedLogCount > 0).length;
  const totalCalories = freshCalories + packagedCalories;
  return {
    loggedDays,
    freshCalories: Math.round(freshCalories),
    packagedCalories: Math.round(packagedCalories),
    freshSharePercent: totalCalories ? Math.round((freshCalories / totalCalories) * 100) : 0,
    packagedSharePercent: totalCalories ? Math.round((packagedCalories / totalCalories) * 100) : 0,
  };
}
