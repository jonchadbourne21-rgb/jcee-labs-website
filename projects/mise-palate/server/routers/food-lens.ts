import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { DEFAULT_NUTRITION_GOALS, DEFAULT_PALATE, DISH_IMAGES, type FoodLensItem, type NutritionGoals, type NutritionValues, type RecipeOption } from "../../shared/product";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { generateStructuredRecipe } from "../product/ai";
import { analyzeFoodLens } from "../product/food-lens-ai";
import { semanticVector } from "../product/memory";
import { resolveFoodLensItem, totalFoodLensNutrition } from "../product/nutrition";
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
      const items = await Promise.all(input.items.map(resolveFoodLensItem));
      const totalNutrition = totalFoodLensNutrition(items);
      const updated = await db.updateFoodLensScan({ scanId: input.scanId, userId: ctx.user.id, items, totalNutrition, measurementNote: input.measurementNote });
      const existingLog = await db.getFoodLensMealLog(ctx.user.id, input.scanId);
      if (existingLog) {
        await db.logFoodLensMeal({
          userId: ctx.user.id,
          foodLensScanId: input.scanId,
          mealType: existingLog.mealType,
          nutritionSnapshot: totalNutrition,
          eatenAt: existingLog.eatenAt,
        });
      }
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

  createRecipe: protectedProcedure
    .input(
      z.object({
        scanId: z.number().int().positive(),
        confirmed: z.literal(true),
        instructions: z.string().max(500).default("Recreate this dish with the best fit for my palate."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.getRecipeByFoodLensScan(input.scanId, ctx.user.id);
      if (existing) return { recipeId: existing.id, recipe: existing, reused: true as const };

      const [scan, profile, knowledge, goalsRow] = await Promise.all([
        db.getFoodLensScan(input.scanId, ctx.user.id),
        db.getPalateProfile(ctx.user.id),
        db.listChefKnowledge(),
        db.getNutritionGoals(ctx.user.id),
      ]);
      if (!scan) throw new TRPCError({ code: "NOT_FOUND", message: "Food Lens scan not found." });
      const items = scan.items as FoodLensItem[];
      if (!items.length) throw new TRPCError({ code: "BAD_REQUEST", message: "Confirm at least one recognized food before creating a recipe." });

      const palate = (profile?.dimensions as typeof DEFAULT_PALATE) ?? DEFAULT_PALATE;
      const goals: NutritionGoals = goalsRow
        ? {
            mode: goalsRow.mode,
            caloriesTarget: goalsRow.caloriesTarget,
            proteinGTarget: goalsRow.proteinGTarget,
            carbsGTarget: goalsRow.carbsGTarget,
            fatGTarget: goalsRow.fatGTarget,
            fiberGTarget: goalsRow.fiberGTarget,
            sodiumMgLimit: goalsRow.sodiumMgLimit,
          }
        : DEFAULT_NUTRITION_GOALS;
      const sourceIngredients = items.map(item => `${item.name} (${item.estimatedGrams} g visible estimate)`);
      const query = `${scan.dishGuess} ${sourceIngredients.join(" ")} ${input.instructions}`;
      const semanticContext = await db.searchSemanticMemories(ctx.user.id, semanticVector(query, scan.totalNutrition as NutritionValues), 5);
      const option: RecipeOption = {
        id: `food-lens-${scan.id}`,
        title: `Your ${scan.dishGuess}`,
        description: `A personalized, cookable interpretation of the recognized plate using ${items.map(item => item.name).join(", ")}.`,
        whyForYou: `Rebuilt from your Food Lens scan using your Palate Twin and ${semanticContext.length} related culinary memories.`,
        cuisine: "Food Lens recreation",
        activeMinutes: 25,
        totalMinutes: 45,
        difficulty: "moderate",
        sensoryProfile: palate,
        imageUrl: scan.imageUrl ?? DISH_IMAGES.lemon,
      };
      const recipe = await generateStructuredRecipe({
        option,
        ingredients: sourceIngredients,
        palate,
        dietaryRestrictions: (profile?.dietaryRestrictions as string[]) ?? [],
        equipment: (profile?.equipment as string[]) ?? ["oven", "stovetop", "skillet"],
        chefKnowledge: knowledge.map(item => ({ slug: item.slug, title: item.title, summary: item.summary, content: item.content })),
        semanticContext,
        nutritionContext: {
          goals,
          recognizedMealEstimate: scan.totalNutrition,
          rule: "Use these targets only for meal planning tradeoffs. Do not state medical claims or guarantee exact recipe nutrition.",
        },
        sourceContext: `${input.instructions} Food identity and portion values came from a user-confirmed Food Lens estimate.`,
      });
      const recipeId = await db.saveRecipe({
        userId: ctx.user.id,
        foodLensScanId: scan.id,
        optionImageUrl: option.imageUrl,
        sourceIngredients,
        recipe,
      });
      const content = `${recipe.title}. ${recipe.summary} Ingredients: ${recipe.ingredients.map(ingredient => ingredient.name).join(", ")}. Generated from Food Lens scan ${scan.id}.`;
      const vector = semanticVector(content);
      const memory = await db.upsertSemanticMemory({
        userId: ctx.user.id,
        kind: "recipe",
        sourceId: recipeId,
        title: recipe.title,
        content,
        vector,
        metadata: { recipeId, foodLensScanId: scan.id, version: 1 },
      });
      if (memory) await db.refreshSemanticEdges(ctx.user.id, memory.id, vector);
      await db.trackEvent(ctx.user.id, "food_lens_recipe_created", { scanId: scan.id, recipeId, memoryCount: semanticContext.length });
      return { recipeId, recipe, reused: false as const };
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
