import { z } from "zod";
import type { BarcodeLookupResult, PackagedFoodProduct } from "../../shared/product";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import {
  fetchOpenFoodFactsProduct,
  hasValidBarcodeCheckDigit,
  normalizeBarcode,
  PACKAGED_LABEL_DISCLOSURE,
  scaleNutrition,
} from "../product/barcode";

const barcodeInput = z.string().min(8).max(32);

export const barcodeRouter = router({
  lookup: protectedProcedure
    .input(z.object({ barcode: barcodeInput }))
    .mutation(async ({ ctx, input }): Promise<BarcodeLookupResult> => {
      let barcode = "";
      try {
        barcode = normalizeBarcode(input.barcode);
      } catch (error) {
        return { status: "not_found", barcode: input.barcode, message: error instanceof Error ? error.message : "Invalid barcode format." };
      }
      if (!hasValidBarcodeCheckDigit(barcode)) {
        return { status: "not_found", barcode, message: "The barcode check digit is invalid. Re-check the numbers on the package." };
      }

      const cached = await db.getPackagedFoodProductByBarcode(barcode);
      if (cached) {
        const isFresh = Date.now() - new Date(cached.fetchedAt).getTime() < 1000 * 60 * 60 * 24 * 7;
        if (isFresh) {
          await db.trackEvent(ctx.user.id, "barcode_lookup_hit_cache", { barcode });
          return { status: "found", product: cached, cacheStatus: "cached", labelDisclosure: PACKAGED_LABEL_DISCLOSURE };
        }
      }

      const remote = await fetchOpenFoodFactsProduct(barcode);
      if (remote.status === "not_found") {
        await db.trackEvent(ctx.user.id, "barcode_not_found", { barcode });
        return { status: "not_found", barcode, message: "Product was not found in Open Food Facts. You can check the code or enter its Nutrition Facts manually." };
      }
      if (remote.status === "unavailable") {
        if (cached) {
          return { status: "found", product: cached, cacheStatus: "cached", labelDisclosure: PACKAGED_LABEL_DISCLOSURE };
        }
        await db.trackEvent(ctx.user.id, "barcode_provider_unavailable", { barcode });
        return { status: "unavailable", barcode, message: "Open Food Facts lookup timed out or is temporarily unavailable. Try again shortly." };
      }

      const stored = await db.upsertPackagedFoodProduct(remote.product);
      await db.trackEvent(ctx.user.id, "barcode_lookup_success", { barcode, brand: stored.brands, completeness: stored.sourceCompleteness });
      return { status: "found", product: stored, cacheStatus: "fresh", labelDisclosure: PACKAGED_LABEL_DISCLOSURE };
    }),

  logMeal: protectedProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        servings: z.number().min(0.25).max(20).default(1),
        mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).default("snack"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await db.getPackagedFoodProductById(input.productId);
      if (!product) throw new Error("Packaged food product record not found.");
      const scaled = scaleNutrition(product.nutritionPerServing, input.servings);
      const log = await db.logPackagedFoodMeal({
        userId: ctx.user.id,
        packagedFoodProductId: product.id,
        mealType: input.mealType,
        servings: Math.round(input.servings * 100) / 100,
        nutritionSnapshot: scaled,
      });
      await db.trackEvent(ctx.user.id, "packaged_food_meal_logged", {
        productId: product.id,
        servings: input.servings,
        mealType: input.mealType,
        calories: scaled.calories,
      });
      return { log, nutrition: scaled, product };
    }),

  removeLog: protectedProcedure
    .input(z.object({ logId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.removePackagedFoodMealLog(ctx.user.id, input.logId);
      await db.trackEvent(ctx.user.id, "packaged_food_meal_unlogged", { logId: input.logId });
      return result;
    }),
});
