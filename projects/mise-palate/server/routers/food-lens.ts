import { nanoid } from "nanoid";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { analyzeFoodLens } from "../product/food-lens-ai";
import { semanticVector } from "../product/memory";
import { hydrateFoodLensItem, totalFoodLensNutrition } from "../product/nutrition";
import { storagePut } from "../storage";

const lensItemInput = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  estimatedGrams: z.number().int().min(0).max(3000),
  confidence: z.number().min(0).max(100),
  portionConfidence: z.number().min(0).max(100),
  needsConfirmation: z.boolean(),
});

function memoryContent(dishGuess: string, items: Array<{ name: string; estimatedGrams: number }>, calories: number) {
  return `${dishGuess}. Visible foods: ${items.map(item => `${item.name} ${item.estimatedGrams}g`).join(", ")}. Estimated total ${calories} kcal.`;
}

export const foodLensRouter = router({
  analyze: protectedProcedure
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
      const key = `mise/food-lens/${ctx.user.id}/${nanoid(12)}.${extension}`;
      const [stored, analysis] = await Promise.all([
        storagePut(key, buffer, match[1]),
        analyzeFoodLens(input.dataUrl, input.context),
      ]);
      const scanId = await db.createFoodLensScan({
        userId: ctx.user.id,
        imageKey: stored.key,
        imageUrl: stored.url,
        analysis,
      });
      const content = memoryContent(analysis.dishGuess, analysis.items, analysis.totalNutrition.calories);
      const vector = semanticVector(content, analysis.totalNutrition);
      const memory = await db.upsertSemanticMemory({
        userId: ctx.user.id,
        kind: "food_lens",
        sourceId: scanId,
        title: analysis.dishGuess,
        content,
        vector,
        metadata: { scanId, overallConfidence: analysis.overallConfidence, portionConfidence: analysis.portionConfidence, imageUrl: stored.url },
      });
      const related = memory ? await db.refreshSemanticEdges(ctx.user.id, memory.id, vector) : [];
      await db.trackEvent(ctx.user.id, "food_lens_analyzed", {
        scanId,
        overallConfidence: analysis.overallConfidence,
        portionConfidence: analysis.portionConfidence,
        referenceItemCount: analysis.items.filter(item => item.referenceStatus !== "needs_reference").length,
      });
      return { ...analysis, scanId, imageUrl: stored.url, relatedMemories: related };
    }),

  update: protectedProcedure
    .input(z.object({ scanId: z.number().int().positive(), items: z.array(lensItemInput).min(1).max(12), measurementNote: z.string().min(2).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const scan = await db.getFoodLensScan(input.scanId, ctx.user.id);
      if (!scan) throw new Error("Food Lens scan not found.");
      const items = input.items.map(item => hydrateFoodLensItem(item));
      const totalNutrition = totalFoodLensNutrition(items);
      const updated = await db.updateFoodLensScan({ scanId: input.scanId, userId: ctx.user.id, items, totalNutrition, measurementNote: input.measurementNote });
      const content = memoryContent(scan.dishGuess, items, totalNutrition.calories);
      const vector = semanticVector(content, totalNutrition);
      const memory = await db.upsertSemanticMemory({
        userId: ctx.user.id,
        kind: "food_lens",
        sourceId: input.scanId,
        title: scan.dishGuess,
        content,
        vector,
        metadata: { scanId: input.scanId, overallConfidence: scan.overallConfidence, portionConfidence: scan.portionConfidence, imageUrl: scan.imageUrl },
      });
      const related = memory ? await db.refreshSemanticEdges(ctx.user.id, memory.id, vector) : [];
      await db.trackEvent(ctx.user.id, "food_lens_portion_confirmed", { scanId: input.scanId, calories: totalNutrition.calories, itemCount: items.length });
      return { scan: updated, relatedMemories: related };
    }),

  history: protectedProcedure.query(({ ctx }) => db.listFoodLensScans(ctx.user.id)),

  related: protectedProcedure
    .input(z.object({ scanId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const scan = await db.getFoodLensScan(input.scanId, ctx.user.id);
      if (!scan) throw new Error("Food Lens scan not found.");
      const items = scan.items as Array<{ name: string; estimatedGrams: number }>;
      const nutrition = scan.totalNutrition as { calories: number; proteinG: number; carbsG: number; fatG: number; saturatedFatG: number; fiberG: number; sugarG: number; sodiumMg: number };
      return db.searchSemanticMemories(ctx.user.id, semanticVector(memoryContent(scan.dishGuess, items, nutrition.calories), nutrition), 4);
    }),
});
