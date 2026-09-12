import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { DEFAULT_PALATE, SENSORY_DIMENSIONS } from "../../shared/product";
import { forecastTaste, generateRecipeOptions, generateStructuredRecipe, getSubstitution, mergePalates } from "../product/ai";
import { recipeRecord, structuredRecipeFromRow } from "../product/records";
import { normalizeRecipeTags } from "../product/tags";
import { semanticVector } from "../product/memory";

const sensorySchema = z.object(Object.fromEntries(SENSORY_DIMENSIONS.map(key => [key, z.number().min(0).max(100)])) as Record<(typeof SENSORY_DIMENSIONS)[number], z.ZodNumber>);
const optionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  whyForYou: z.string(),
  cuisine: z.string(),
  activeMinutes: z.number().int(),
  totalMinutes: z.number().int(),
  difficulty: z.enum(["easy", "moderate", "ambitious"]),
  sensoryProfile: sensorySchema,
  imageUrl: z.string(),
});

export const recipesRouter = router({
  options: protectedProcedure
    .input(
      z.object({
        scanId: z.number().int().positive(),
        ingredients: z.array(z.string()).min(1).max(30),
        timeMinutes: z.number().int().min(15).max(240).default(45),
        difficulty: z.enum(["easy", "moderate", "ambitious"]).default("moderate"),
        craving: z.string().max(300).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getPalateProfile(ctx.user.id);
      const semanticContext = await db.searchSemanticMemories(
        ctx.user.id,
        semanticVector(`${input.ingredients.join(" ")} ${input.craving ?? ""}`)
      );
      const result = await generateRecipeOptions({
        ingredients: input.ingredients,
        palate: (profile?.dimensions as typeof DEFAULT_PALATE) ?? DEFAULT_PALATE,
        equipment: (profile?.equipment as string[]) ?? ["oven", "stovetop", "skillet"],
        timeMinutes: input.timeMinutes,
        difficulty: input.difficulty,
        dietaryRestrictions: (profile?.dietaryRestrictions as string[]) ?? [],
        craving: input.craving,
        semanticContext,
      });
      await db.trackEvent(ctx.user.id, "recipe_options_generated", { scanId: input.scanId, mode: result.generationMode });
      return { ...result, semanticContext };
    }),

  generate: protectedProcedure
    .input(z.object({ scanId: z.number().int().positive(), ingredients: z.array(z.string()).min(1), option: optionSchema }))
    .mutation(async ({ ctx, input }) => {
      const [profile, knowledge] = await Promise.all([db.getPalateProfile(ctx.user.id), db.listChefKnowledge()]);
      const recipe = await generateStructuredRecipe({
        option: input.option,
        ingredients: input.ingredients,
        palate: (profile?.dimensions as typeof DEFAULT_PALATE) ?? DEFAULT_PALATE,
        dietaryRestrictions: (profile?.dietaryRestrictions as string[]) ?? [],
        equipment: (profile?.equipment as string[]) ?? ["oven", "stovetop", "skillet"],
        chefKnowledge: knowledge.map(item => ({ slug: item.slug, title: item.title, summary: item.summary, content: item.content })),
      });
      const recipeId = await db.saveRecipe({ userId: ctx.user.id, scanId: input.scanId, optionImageUrl: input.option.imageUrl, sourceIngredients: input.ingredients, recipe });
      const content = `${recipe.title}. ${recipe.summary} Ingredients: ${recipe.ingredients.map(ingredient => ingredient.name).join(", ")}. Sensory profile: crunchy ${recipe.sensoryProfile.crunch}, bright ${recipe.sensoryProfile.acidity}, rich ${recipe.sensoryProfile.richness}.`;
      const vector = semanticVector(content);
      const memory = await db.upsertSemanticMemory({
        userId: ctx.user.id,
        kind: "recipe",
        sourceId: recipeId,
        title: recipe.title,
        content,
        vector,
        metadata: { recipeId, scanId: input.scanId, version: 1 },
      });
      if (memory) await db.refreshSemanticEdges(ctx.user.id, memory.id, vector);
      await db.trackEvent(ctx.user.id, "recipe_generated", { recipeId, scanId: input.scanId, mode: recipe.generationMode });
      return { recipeId, recipe, imageUrl: input.option.imageUrl };
    }),

  list: protectedProcedure.query(async ({ ctx }) => (await db.listRecipes(ctx.user.id)).map(recipeRecord)),

  get: protectedProcedure.input(z.object({ recipeId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const recipe = await db.getRecipe(input.recipeId, ctx.user.id);
    if (!recipe) throw new TRPCError({ code: "NOT_FOUND", message: "Recipe not found" });
    return recipeRecord(recipe);
  }),

  favorite: protectedProcedure
    .input(z.object({ recipeId: z.number().int().positive(), favorite: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.setFavorite(input.recipeId, ctx.user.id, input.favorite);
      await db.trackEvent(ctx.user.id, input.favorite ? "recipe_favorited" : "recipe_unfavorited", { recipeId: input.recipeId });
      return result;
    }),

  setTags: protectedProcedure
    .input(z.object({ recipeId: z.number().int().positive(), tags: z.array(z.string().trim().min(1).max(32)).max(8) }))
    .mutation(async ({ ctx, input }) => {
      const recipe = await db.getRecipe(input.recipeId, ctx.user.id);
      if (!recipe) throw new TRPCError({ code: "NOT_FOUND", message: "Recipe not found" });
      const tags = normalizeRecipeTags(input.tags);
      const result = await db.setRecipeTags(input.recipeId, ctx.user.id, tags);
      await db.trackEvent(ctx.user.id, "recipe_tags_updated", { recipeId: input.recipeId, tagCount: tags.length });
      return result;
    }),

  substitute: protectedProcedure
    .input(z.object({ recipeId: z.number().int().positive(), missingIngredient: z.string().min(1).max(120), context: z.string().max(500).default("") }))
    .mutation(async ({ ctx, input }) => {
      const row = await db.getRecipe(input.recipeId, ctx.user.id);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Recipe not found" });
      return getSubstitution(structuredRecipeFromRow(row), input.missingIngredient, input.context);
    }),

  forecast: protectedProcedure
    .input(z.object({ recipeId: z.number().int().positive(), requestedChange: z.string().min(2).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const row = await db.getRecipe(input.recipeId, ctx.user.id);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Recipe not found" });
      const forecast = await forecastTaste(structuredRecipeFromRow(row), input.requestedChange);
      await db.trackEvent(ctx.user.id, "taste_forecast_used", { recipeId: input.recipeId, requestedChange: input.requestedChange });
      return forecast;
    }),

  matchPalates: protectedProcedure
    .input(z.object({ guestName: z.string().min(1).max(80), guestPalate: sensorySchema }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getPalateProfile(ctx.user.id);
      return { guestName: input.guestName, ...mergePalates((profile?.dimensions as typeof DEFAULT_PALATE) ?? DEFAULT_PALATE, input.guestPalate) };
    }),
});
