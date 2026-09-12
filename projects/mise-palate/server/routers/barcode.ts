import { z } from "zod";
import type { BarcodeLookupResult } from "../../shared/product";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { boundedMilliseconds, medianMilliseconds, successRate } from "../product/device-diagnostics";
import {
  fetchOpenFoodFactsProduct,
  hasValidBarcodeCheckDigit,
  normalizeBarcode,
  PACKAGED_LABEL_DISCLOSURE,
  scaleNutrition,
} from "../product/barcode";

const barcodeInput = z.string().min(8).max(32);
const nutritionValuesSchema = z.object({
  calories: z.number().min(0).max(10000),
  proteinG: z.number().min(0).max(1000),
  carbsG: z.number().min(0).max(2000),
  fatG: z.number().min(0).max(1000),
  saturatedFatG: z.number().min(0).max(1000),
  fiberG: z.number().min(0).max(500),
  sugarG: z.number().min(0).max(2000),
  sodiumMg: z.number().min(0).max(100000),
});
const customLabelInput = z.object({
  id: z.number().int().positive().optional(),
  barcode: z.string().max(32).optional().default(""),
  productName: z.string().trim().min(2).max(320),
  brand: z.string().trim().max(320).optional().default(""),
  servingSize: z.string().trim().min(1).max(120),
  ingredientsText: z.string().trim().max(5000).optional().default(""),
  allergens: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  nutritionPerServing: nutritionValuesSchema,
});

const deviceDiagnosticInput = z.object({
  deviceLabel: z.string().trim().min(2).max(180),
  platform: z.string().trim().min(1).max(160),
  browser: z.string().trim().min(1).max(160),
  engine: z.enum(["native", "zxing", "unavailable"]),
  cameraStartMs: z.number().nullable().optional(),
  firstDetectionMs: z.number().nullable().optional(),
  trialCount: z.number().int().min(0).max(100).default(0),
  successfulTrials: z.number().int().min(0).max(100).default(0),
  trialDetectionMs: z.array(z.number().min(0).max(120000)).max(100).optional().default([]),
  focusSupported: z.boolean().default(false),
  continuousFocusSupported: z.boolean().default(false),
  torchSupported: z.boolean().default(false),
  rearCameraSelected: z.boolean().default(false),
  videoWidth: z.number().int().positive().nullable().optional(),
  videoHeight: z.number().int().positive().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

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
        return { status: "not_found", barcode, message: "Product was not found in Open Food Facts. Save the package label manually instead." };
      }
      if (remote.status === "unavailable") {
        if (cached) return { status: "found", product: cached, cacheStatus: "cached", labelDisclosure: PACKAGED_LABEL_DISCLOSURE };
        await db.trackEvent(ctx.user.id, "barcode_provider_unavailable", { barcode });
        return { status: "unavailable", barcode, message: "Open Food Facts is temporarily unavailable. Try again or save the label manually." };
      }

      const stored = await db.upsertPackagedFoodProduct(remote.product);
      await db.trackEvent(ctx.user.id, "barcode_lookup_success", { barcode, brand: stored.brands, completeness: stored.sourceCompleteness });
      return { status: "found", product: stored, cacheStatus: "fresh", labelDisclosure: PACKAGED_LABEL_DISCLOSURE };
    }),

  logMeal: protectedProcedure
    .input(z.object({
      productId: z.number().int().positive(),
      servings: z.number().min(0.25).max(20).default(1),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).default("snack"),
    }))
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
      await db.trackEvent(ctx.user.id, "packaged_food_meal_logged", { productId: product.id, servings: input.servings, mealType: input.mealType, calories: scaled.calories });
      return { log, nutrition: scaled, product };
    }),

  removeLog: protectedProcedure
    .input(z.object({ logId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.removePackagedFoodMealLog(ctx.user.id, input.logId);
      await db.trackEvent(ctx.user.id, "packaged_food_meal_unlogged", { logId: input.logId });
      return result;
    }),

  customLabels: protectedProcedure.query(({ ctx }) => db.listCustomFoodLabels(ctx.user.id)),

  saveCustomLabel: protectedProcedure.input(customLabelInput).mutation(async ({ ctx, input }) => {
    let barcode: string | null = null;
    if (input.barcode.trim()) {
      barcode = normalizeBarcode(input.barcode);
      if (!hasValidBarcodeCheckDigit(barcode)) throw new Error("The optional barcode has an invalid check digit.");
    }
    const label = await db.saveCustomFoodLabel({
      id: input.id,
      userId: ctx.user.id,
      barcode,
      productName: input.productName,
      brand: input.brand || null,
      servingSize: input.servingSize,
      ingredientsText: input.ingredientsText || null,
      allergens: Array.from(new Set(input.allergens.map(item => item.toLowerCase()))),
      nutritionPerServing: input.nutritionPerServing,
    });
    await db.trackEvent(ctx.user.id, input.id ? "custom_food_label_updated" : "custom_food_label_created", { labelId: label.id, barcode: label.barcode });
    return label;
  }),

  deleteCustomLabel: protectedProcedure
    .input(z.object({ labelId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.deleteCustomFoodLabel(ctx.user.id, input.labelId);
      await db.trackEvent(ctx.user.id, "custom_food_label_deleted", { labelId: input.labelId });
      return result;
    }),

  logCustomMeal: protectedProcedure
    .input(z.object({
      labelId: z.number().int().positive(),
      servings: z.number().min(0.25).max(20).default(1),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).default("snack"),
    }))
    .mutation(async ({ ctx, input }) => {
      const label = await db.getCustomFoodLabel(ctx.user.id, input.labelId);
      if (!label) throw new Error("Custom food label not found.");
      const scaled = scaleNutrition(label.nutritionPerServing, input.servings);
      const log = await db.logCustomFoodMeal({
        userId: ctx.user.id,
        customFoodLabelId: label.id,
        mealType: input.mealType,
        servings: Math.round(input.servings * 100) / 100,
        nutritionSnapshot: scaled,
      });
      await db.trackEvent(ctx.user.id, "custom_food_meal_logged", { labelId: label.id, servings: input.servings, mealType: input.mealType, calories: scaled.calories });
      return { log, nutrition: scaled, label };
    }),

  removeCustomLog: protectedProcedure
    .input(z.object({ logId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => db.removeCustomFoodMealLog(ctx.user.id, input.logId)),

  recordDeviceDiagnostic: protectedProcedure
    .input(deviceDiagnosticInput)
    .mutation(async ({ ctx, input }) => {
      const median = medianMilliseconds(input.trialDetectionMs);
      const record = await db.recordBarcodeDeviceDiagnostic({
        userId: ctx.user.id,
        deviceLabel: input.deviceLabel,
        platform: input.platform,
        browser: input.browser,
        engine: input.engine,
        cameraStartMs: boundedMilliseconds(input.cameraStartMs),
        firstDetectionMs: boundedMilliseconds(input.firstDetectionMs),
        trialCount: input.trialCount,
        successfulTrials: input.successfulTrials,
        medianDetectionMs: median,
        focusSupported: input.focusSupported,
        continuousFocusSupported: input.continuousFocusSupported,
        torchSupported: input.torchSupported,
        rearCameraSelected: input.rearCameraSelected,
        videoWidth: input.videoWidth ?? null,
        videoHeight: input.videoHeight ?? null,
        notes: input.notes ?? null,
      });
      await db.trackEvent(ctx.user.id, "barcode_device_diagnostic_recorded", {
        deviceLabel: record.deviceLabel,
        engine: record.engine,
        focusSupported: record.focusSupported,
        medianDetectionMs: record.medianDetectionMs,
        successRate: successRate(record.successfulTrials, record.trialCount),
      });
      return record;
    }),

  deviceDiagnostics: protectedProcedure.query(({ ctx }) => db.listBarcodeDeviceDiagnostics(ctx.user.id)),
});
