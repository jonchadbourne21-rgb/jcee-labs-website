import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { DEFAULT_PALATE, EMPTY_CONFIDENCE, SENSORY_DIMENSIONS } from "../../shared/product";
import { calibratePalate, topPreferences } from "../product/palate";

const sensorySchema = z.object(Object.fromEntries(SENSORY_DIMENSIONS.map(key => [key, z.number().min(0).max(100)])) as Record<(typeof SENSORY_DIMENSIONS)[number], z.ZodNumber>);

export const palateRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.getPalateProfile(ctx.user.id);
    if (!profile) {
      return {
        exists: false as const,
        profile: {
          displayName: ctx.user.name ?? "Cook",
          dimensions: DEFAULT_PALATE,
          confidence: EMPTY_CONFIDENCE,
          dislikedIngredients: [],
          dietaryRestrictions: [],
          equipment: ["oven", "stovetop", "sheet pan", "skillet"],
          calibrationComplete: false,
          mealsLearnedFrom: 0,
        },
        topPreferences: topPreferences(DEFAULT_PALATE),
      };
    }
    return {
      exists: true as const,
      profile: {
        ...profile,
        dimensions: profile.dimensions as typeof DEFAULT_PALATE,
        confidence: profile.confidence as typeof EMPTY_CONFIDENCE,
        dislikedIngredients: profile.dislikedIngredients as string[],
        dietaryRestrictions: profile.dietaryRestrictions as string[],
        equipment: profile.equipment as string[],
      },
      topPreferences: topPreferences(profile.dimensions as typeof DEFAULT_PALATE),
    };
  }),

  calibrate: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1).max(120),
        choiceIds: z.array(z.string()).min(6).max(12),
        dislikedIngredients: z.array(z.string().min(1)).max(30).default([]),
        dietaryRestrictions: z.array(z.string().min(1)).max(20).default([]),
        equipment: z.array(z.string().min(1)).max(30).default(["oven", "stovetop", "sheet pan", "skillet"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = calibratePalate(input.choiceIds);
      const profile = await db.savePalateProfile({
        userId: ctx.user.id,
        displayName: input.displayName,
        dimensions: result.dimensions,
        confidence: result.confidence,
        dislikedIngredients: input.dislikedIngredients,
        dietaryRestrictions: input.dietaryRestrictions,
        equipment: input.equipment,
        calibrationComplete: true,
      });
      await db.addPalateSignals(ctx.user.id, result.signals, "calibration");
      await db.trackEvent(ctx.user.id, "palate_calibrated", { decisions: input.choiceIds.length });
      return profile;
    }),

  update: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1).max(120),
        dimensions: sensorySchema,
        dislikedIngredients: z.array(z.string()).max(30),
        dietaryRestrictions: z.array(z.string()).max(20),
        equipment: z.array(z.string()).max(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const current = await db.getPalateProfile(ctx.user.id);
      return db.savePalateProfile({
        userId: ctx.user.id,
        displayName: input.displayName,
        dimensions: input.dimensions,
        confidence: (current?.confidence as typeof EMPTY_CONFIDENCE) ?? EMPTY_CONFIDENCE,
        dislikedIngredients: input.dislikedIngredients,
        dietaryRestrictions: input.dietaryRestrictions,
        equipment: input.equipment,
        calibrationComplete: true,
        mealsLearnedFrom: current?.mealsLearnedFrom ?? 0,
      });
    }),

  signals: protectedProcedure.query(({ ctx }) => db.listPalateSignals(ctx.user.id)),

  eraseData: protectedProcedure.mutation(({ ctx }) => db.deleteCulinaryData(ctx.user.id)),
});
