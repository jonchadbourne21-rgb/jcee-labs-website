import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { DEFAULT_PALATE, EMPTY_CONFIDENCE } from "../../shared/product";
import { recoverCook } from "../product/ai";
import { learnFromMeal } from "../product/palate";
import { structuredRecipeFromRow } from "../product/records";

export const cookRouter = router({
  start: protectedProcedure
    .input(z.object({ recipeId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const recipe = await db.getRecipe(input.recipeId, ctx.user.id);
      if (!recipe) throw new TRPCError({ code: "NOT_FOUND", message: "Recipe not found" });
      const session = await db.startCookingSession(input.recipeId, ctx.user.id);
      await db.trackEvent(ctx.user.id, "cooking_session_started", { recipeId: input.recipeId, sessionId: session?.id });
      return session;
    }),

  progress: protectedProcedure
    .input(z.object({ sessionId: z.number().int().positive(), currentStep: z.number().int().min(0), status: z.enum(["active", "completed", "abandoned"]).optional() }))
    .mutation(async ({ ctx, input }) => {
      const session = await db.updateCookingSession({ ...input, userId: ctx.user.id });
      if (input.status === "completed") await db.trackEvent(ctx.user.id, "meal_completed", { recipeId: session?.recipeId, sessionId: input.sessionId });
      return session;
    }),

  recover: protectedProcedure
    .input(z.object({ sessionId: z.number().int().positive(), recipeId: z.number().int().positive(), currentStep: z.number().int().min(0), problem: z.string().min(2).max(1000) }))
    .mutation(async ({ ctx, input }) => {
      const [recipeRow, session] = await Promise.all([db.getRecipe(input.recipeId, ctx.user.id), db.getCookingSession(input.sessionId, ctx.user.id)]);
      if (!recipeRow || !session) throw new TRPCError({ code: "NOT_FOUND", message: "Cooking session not found" });
      const recovery = await recoverCook(structuredRecipeFromRow(recipeRow), input.problem, input.currentStep);
      const recoveryLog = [
        ...((session.recoveryLog as unknown[]) ?? []),
        { at: Date.now(), step: input.currentStep, problem: input.problem, response: recovery },
      ];
      await db.updateCookingSession({ sessionId: input.sessionId, userId: ctx.user.id, recoveryLog });
      await db.trackEvent(ctx.user.id, "cook_recovery_used", { recipeId: input.recipeId, sessionId: input.sessionId, step: input.currentStep });
      return recovery;
    }),

  rate: protectedProcedure
    .input(
      z.object({
        recipeId: z.number().int().positive(),
        sessionId: z.number().int().positive().optional(),
        rating: z.enum(["loved", "good", "okay", "not_for_me"]),
        adjustments: z.array(z.enum(["crispier", "less_spicy", "more_spicy", "more_sauce", "less_rich", "more_acid", "more_tender"])).max(4),
        note: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getPalateProfile(ctx.user.id);
      const dimensions = (profile?.dimensions as typeof DEFAULT_PALATE) ?? DEFAULT_PALATE;
      const confidence = (profile?.confidence as typeof EMPTY_CONFIDENCE) ?? EMPTY_CONFIDENCE;
      const learned = learnFromMeal(dimensions, confidence, input.rating, input.adjustments);
      const feedbackId = await db.addMealFeedback({ userId: ctx.user.id, ...input });
      await db.addPalateSignals(ctx.user.id, learned.signals, "meal_feedback", input.recipeId, feedbackId);
      const updated = await db.savePalateProfile({
        userId: ctx.user.id,
        displayName: profile?.displayName ?? ctx.user.name ?? "Cook",
        dimensions: learned.dimensions,
        confidence: learned.confidence,
        dislikedIngredients: (profile?.dislikedIngredients as string[]) ?? [],
        dietaryRestrictions: (profile?.dietaryRestrictions as string[]) ?? [],
        equipment: (profile?.equipment as string[]) ?? ["oven", "stovetop", "skillet"],
        calibrationComplete: profile?.calibrationComplete ?? true,
        mealsLearnedFrom: (profile?.mealsLearnedFrom ?? 0) + 1,
      });
      if (input.sessionId) await db.updateCookingSession({ sessionId: input.sessionId, userId: ctx.user.id, status: "completed" });
      await db.trackEvent(ctx.user.id, "meal_rated", { recipeId: input.recipeId, rating: input.rating, adjustments: input.adjustments });
      return { feedbackId, profile: updated, changes: learned.signals };
    }),
});
