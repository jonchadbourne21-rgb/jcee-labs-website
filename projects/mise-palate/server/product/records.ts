import type { StructuredRecipe } from "../../shared/product";
import type { recipes } from "../../drizzle/schema";

type RecipeRow = typeof recipes.$inferSelect;

export function structuredRecipeFromRow(row: RecipeRow): StructuredRecipe {
  return {
    title: row.title,
    summary: row.summary,
    rationale: row.rationale,
    ingredients: row.ingredients as StructuredRecipe["ingredients"],
    equipment: row.equipment as StructuredRecipe["equipment"],
    miseEnPlace: row.miseEnPlace as StructuredRecipe["miseEnPlace"],
    steps: row.steps as StructuredRecipe["steps"],
    sensoryProfile: row.sensoryProfile as StructuredRecipe["sensoryProfile"],
    substitutions: row.substitutions as StructuredRecipe["substitutions"],
    safetyRules: row.safetyRules as StructuredRecipe["safetyRules"],
    platingNotes: row.platingNotes,
    activeMinutes: row.activeMinutes,
    totalMinutes: row.totalMinutes,
    difficulty: row.difficulty,
    generationMode: row.generationMode,
  };
}

export function recipeRecord(row: RecipeRow) {
  return {
    ...row,
    structured: structuredRecipeFromRow(row),
  };
}
