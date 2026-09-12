import {
  DEFAULT_NUTRITION_GOALS,
  type NutritionGoals,
  type NutritionGoalMode,
  type NutritionValues,
} from "../../shared/product";
import { sumNutrition } from "./nutrition";

export function goalsForMode(mode: NutritionGoalMode): NutritionGoals {
  if (mode === "high_protein") {
    return { ...DEFAULT_NUTRITION_GOALS, mode, proteinGTarget: 140, carbsGTarget: 220, fatGTarget: 70 };
  }
  if (mode === "lower_carb") {
    return { ...DEFAULT_NUTRITION_GOALS, mode, carbsGTarget: 140, proteinGTarget: 120, fatGTarget: 95 };
  }
  return { ...DEFAULT_NUTRITION_GOALS, mode };
}

export function nutritionProgress(total: NutritionValues, goals: NutritionGoals) {
  const percent = (value: number, target: number) => Math.round((value / Math.max(1, target)) * 100);
  return {
    calories: percent(total.calories, goals.caloriesTarget),
    protein: percent(total.proteinG, goals.proteinGTarget),
    carbs: percent(total.carbsG, goals.carbsGTarget),
    fat: percent(total.fatG, goals.fatGTarget),
    fiber: percent(total.fiberG, goals.fiberGTarget),
    sodium: percent(total.sodiumMg, goals.sodiumMgLimit),
  };
}

export function aggregateNutritionLogs(values: NutritionValues[]) {
  return sumNutrition(values);
}

export function nutritionGuidance(total: NutritionValues, goals: NutritionGoals) {
  const progress = nutritionProgress(total, goals);
  const suggestions: string[] = [];
  if (progress.protein < 55) suggestions.push("A protein-forward next meal would move you closer to your daily target.");
  if (progress.fiber < 55) suggestions.push("Beans, whole grains, vegetables, or fruit can help close the fiber gap.");
  if (progress.sodium > 85) suggestions.push("Sodium is nearing your selected limit; favor unsalted ingredients and acid or herbs for impact.");
  if (progress.calories > 110) suggestions.push("Logged energy is above your selected target; review portions if that was not intentional.");
  if (!suggestions.length) suggestions.push("Your logged meals are tracking steadily against the targets you selected.");
  return suggestions;
}
