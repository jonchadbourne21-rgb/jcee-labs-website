import { z } from "zod";
import { DEFAULT_NUTRITION_GOALS, type NutritionGoals, type NutritionValues } from "../../shared/product";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { aggregateNutritionLogs, nutritionGuidance, nutritionProgress } from "../product/nutrition-goals";

const goalsSchema = z.object({
  mode: z.enum(["balanced", "high_protein", "lower_carb", "custom"]),
  caloriesTarget: z.number().int().min(800).max(6000),
  proteinGTarget: z.number().int().min(20).max(400),
  carbsGTarget: z.number().int().min(30).max(800),
  fatGTarget: z.number().int().min(20).max(300),
  fiberGTarget: z.number().int().min(10).max(100),
  sodiumMgLimit: z.number().int().min(500).max(10000),
});

function nutritionGoalsFromRow(row: Awaited<ReturnType<typeof db.getNutritionGoals>>): NutritionGoals {
  if (!row) return DEFAULT_NUTRITION_GOALS;
  return {
    mode: row.mode,
    caloriesTarget: row.caloriesTarget,
    proteinGTarget: row.proteinGTarget,
    carbsGTarget: row.carbsGTarget,
    fatGTarget: row.fatGTarget,
    fiberGTarget: row.fiberGTarget,
    sodiumMgLimit: row.sodiumMgLimit,
  };
}

export const nutritionRouter = router({
  goals: protectedProcedure.query(async ({ ctx }) => nutritionGoalsFromRow(await db.getNutritionGoals(ctx.user.id))),

  updateGoals: protectedProcedure.input(goalsSchema).mutation(async ({ ctx, input }) => {
    const result = await db.saveNutritionGoals(ctx.user.id, input);
    await db.trackEvent(ctx.user.id, "nutrition_goals_updated", { mode: input.mode });
    return nutritionGoalsFromRow(result);
  }),

  daily: protectedProcedure
    .input(z.object({ dayStartMs: z.number().int().nonnegative(), dayEndMs: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      if (input.dayEndMs <= input.dayStartMs || input.dayEndMs - input.dayStartMs > 172_800_000) {
        throw new Error("Daily nutrition range must cover one local day.");
      }
      const [goalsRow, logs] = await Promise.all([
        db.getNutritionGoals(ctx.user.id),
        db.listNutritionLogs(ctx.user.id, new Date(input.dayStartMs), new Date(input.dayEndMs)),
      ]);
      const packagedLogs = await db.listPackagedFoodLogs(ctx.user.id, new Date(input.dayStartMs), new Date(input.dayEndMs));
      const goals = nutritionGoalsFromRow(goalsRow);
      const total = aggregateNutritionLogs([
        ...logs.map(log => log.nutritionSnapshot as NutritionValues),
        ...packagedLogs.map(log => log.nutritionSnapshot as NutritionValues),
      ]);
      return {
        goals,
        total,
        progress: nutritionProgress(total, goals),
        guidance: nutritionGuidance(total, goals),
        logs,
        packagedLogs,
      };
    }),

  scanStatus: protectedProcedure
    .input(z.object({ scanId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const log = await db.getFoodLensMealLog(ctx.user.id, input.scanId);
      return { logged: Boolean(log), log: log ?? null };
    }),

  logScan: protectedProcedure
    .input(z.object({ scanId: z.number().int().positive(), mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]) }))
    .mutation(async ({ ctx, input }) => {
      const scan = await db.getFoodLensScan(input.scanId, ctx.user.id);
      if (!scan) throw new Error("Food Lens scan not found.");
      const log = await db.logFoodLensMeal({
        userId: ctx.user.id,
        foodLensScanId: input.scanId,
        mealType: input.mealType,
        nutritionSnapshot: scan.totalNutrition as NutritionValues,
      });
      await db.trackEvent(ctx.user.id, "food_lens_meal_logged", { scanId: input.scanId, mealType: input.mealType });
      return log;
    }),

  removeLog: protectedProcedure
    .input(z.object({ scanId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.removeFoodLensMealLog(ctx.user.id, input.scanId);
      await db.trackEvent(ctx.user.id, "food_lens_meal_unlogged", { scanId: input.scanId });
      return result;
    }),
});
