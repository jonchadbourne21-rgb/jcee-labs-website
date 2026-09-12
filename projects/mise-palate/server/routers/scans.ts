import { nanoid } from "nanoid";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { storagePut } from "../storage";
import { analyzeFoodImage } from "../product/ai";

const ingredientSchema = z.object({
  name: z.string().min(1).max(120),
  confidence: z.number().min(0).max(100),
  quantityHint: z.string().max(120),
  needsConfirmation: z.boolean(),
});

export const scansRouter = router({
  analyzePhoto: protectedProcedure
    .input(
      z.object({
        dataUrl: z.string().min(100).max(15_000_000),
        filename: z.string().min(1).max(180),
        context: z.string().max(500).default(""),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
      if (!match) throw new Error("Upload a JPEG, PNG, or WebP image.");
      const buffer = Buffer.from(match[2], "base64");
      if (buffer.length > 8_000_000) throw new Error("Image must be smaller than 8 MB.");
      const extension = match[1].split("/")[1].replace("jpeg", "jpg");
      const key = `mise/scans/${ctx.user.id}/${nanoid(12)}.${extension}`;
      const [stored, analysis] = await Promise.all([
        storagePut(key, buffer, match[1]),
        analyzeFoodImage(input.dataUrl, input.context),
      ]);
      const scanId = await db.createIngredientScan({
        userId: ctx.user.id,
        source: "photo",
        imageKey: stored.key,
        imageUrl: stored.url,
        originalInput: input.context,
        ingredients: analysis.ingredients,
      });
      await db.trackEvent(ctx.user.id, "ingredient_photo_analyzed", {
        scanId,
        overallConfidence: analysis.overallConfidence,
        uncertainCount: analysis.ingredients.filter((item: { needsConfirmation: boolean }) => item.needsConfirmation).length,
      });
      return { ...analysis, scanId, imageUrl: stored.url };
    }),

  createFromText: protectedProcedure
    .input(z.object({ text: z.string().min(2).max(1000), source: z.enum(["description", "craving"]) }))
    .mutation(async ({ ctx, input }) => {
      const names = input.text
        .split(/,|\band\b|\n/i)
        .map(value => value.trim())
        .filter(Boolean)
        .slice(0, 20);
      const ingredients = names.map(name => ({ name, confidence: 100, quantityHint: "user provided", needsConfirmation: false }));
      const scanId = await db.createIngredientScan({
        userId: ctx.user.id,
        source: input.source,
        originalInput: input.text,
        ingredients,
      });
      await db.trackEvent(ctx.user.id, "ingredient_text_entered", { scanId, source: input.source, count: names.length });
      return { scanId, ingredients, overallConfidence: 100, uncertaintySummary: "These items came directly from your description.", dishGuess: input.source === "craving" ? input.text : "Your ingredients", generationMode: "user_input" as const };
    }),

  confirm: protectedProcedure
    .input(z.object({ scanId: z.number().int().positive(), ingredients: z.array(ingredientSchema).min(1).max(30), corrected: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const scan = await db.confirmIngredientScan(input.scanId, ctx.user.id, input.ingredients, input.corrected);
      await db.trackEvent(ctx.user.id, "ingredients_confirmed", { scanId: input.scanId, corrected: input.corrected, count: input.ingredients.length });
      return scan;
    }),
});
