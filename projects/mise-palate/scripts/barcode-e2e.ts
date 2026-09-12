import { eq } from "drizzle-orm";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";
import * as db from "../server/db";
import {
  analyticsEvents,
  customFoodLabels,
  customFoodLogs,
  foodLensScans,
  nutritionGoals,
  nutritionLogs,
  packagedFoodLogs,
  users,
} from "../drizzle/schema";
import type { FoodLensAnalysis } from "../shared/product";

const startedAt = Date.now();
const openId = `mise-barcode-${startedAt}`;
await db.upsertUser({ openId, name: "Barcode QA Cook", email: `mise-barcode-${startedAt}@example.test`, loginMethod: "e2e", role: "user", lastSignedIn: new Date() });
const user = await db.getUserByOpenId(openId);
if (!user) throw new Error("Could not create test user");

const ctx: TrpcContext = {
  user,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie() {} } as unknown as TrpcContext["res"],
};
const caller = appRouter.createCaller(ctx);
let packagedLogId: number | null = null;
let customLogId: number | null = null;
let customLabelId: number | null = null;
let freshScanId: number | null = null;
const report: Record<string, unknown> = { startedAt: new Date(startedAt).toISOString(), testUserId: user.id };

try {
  const invalid = await caller.barcode.lookup({ barcode: "3017620422004" });
  if (invalid.status !== "not_found") throw new Error("Invalid check digit did not return not_found status");

  const lookup = await caller.barcode.lookup({ barcode: "3017620422003" });
  if (lookup.status !== "found") throw new Error(`Live barcode lookup failed: ${lookup.status}`);
  const cached = await caller.barcode.lookup({ barcode: "3017620422003" });
  if (cached.status !== "found" || cached.cacheStatus !== "cached") throw new Error("Second barcode lookup did not use cached product snapshot");

  const packaged = await caller.barcode.logMeal({ productId: lookup.product.id, servings: 0.5, mealType: "snack" });
  packagedLogId = packaged.log.id;
  if (packaged.nutrition.calories !== Math.round(lookup.product.nutritionPerServing.calories * 0.5 * 10) / 10) throw new Error("Fractional packaged serving did not scale accurately");

  const createdLabel = await caller.barcode.saveCustomLabel({
    barcode: "012345678905",
    productName: "Neighborhood Granola",
    brand: "Local Market",
    servingSize: "1/2 cup (55 g)",
    ingredientsText: "Oats, almonds, maple syrup, olive oil, cinnamon",
    allergens: ["tree nuts"],
    nutritionPerServing: { calories: 220, proteinG: 6, carbsG: 34, fatG: 8, saturatedFatG: 1, fiberG: 5, sugarG: 9, sodiumMg: 75 },
  });
  customLabelId = createdLabel.id;
  const editedLabel = await caller.barcode.saveCustomLabel({
    id: createdLabel.id,
    barcode: createdLabel.barcode ?? "",
    productName: createdLabel.productName,
    brand: createdLabel.brand ?? "",
    servingSize: createdLabel.servingSize,
    ingredientsText: createdLabel.ingredientsText ?? "",
    allergens: createdLabel.allergens,
    nutritionPerServing: { ...createdLabel.nutritionPerServing, calories: 240, proteinG: 7 },
  });
  if (editedLabel.nutritionPerServing.calories !== 240) throw new Error("Custom label edit did not persist");
  const custom = await caller.barcode.logCustomMeal({ labelId: editedLabel.id, servings: 0.75, mealType: "breakfast" });
  customLogId = custom.log.id;
  if (custom.nutrition.calories !== 180) throw new Error("Custom label fractional serving did not scale to 180 calories");

  const freshAnalysis: FoodLensAnalysis = {
    dishGuess: "QA fresh bowl",
    overallConfidence: 100,
    portionConfidence: 100,
    uncertaintySummary: "Deterministic integration fixture",
    measurementNote: "Verified test portions",
    estimateDisclosure: "Integration fixture only",
    items: [],
    totalNutrition: { calories: 600, proteinG: 42, carbsG: 55, fatG: 22, saturatedFatG: 5, fiberG: 11, sugarG: 8, sodiumMg: 640 },
    generationMode: "safe_fallback",
  };
  freshScanId = await db.createFoodLensScan({ userId: user.id, analysis: freshAnalysis });
  await caller.nutrition.logScan({ scanId: freshScanId, mealType: "dinner" });

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const daily = await caller.nutrition.daily({ dayStartMs: start.getTime(), dayEndMs: end.getTime() });
  if (daily.packagedLogs.length !== 1 || daily.customFoodLogs.length !== 1 || daily.logs.length !== 1) throw new Error("Daily aggregation did not include all three log sources");
  const expectedCalories = packaged.nutrition.calories + custom.nutrition.calories + 600;
  if (daily.total.calories !== Math.round(expectedCalories * 10) / 10) throw new Error("Daily total did not combine fresh, database, and private-label nutrition");

  const days = Array.from({ length: 7 }, (_, index) => {
    const dayStart = new Date(start);
    dayStart.setDate(start.getDate() - (6 - index));
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    return { key: dayStart.toISOString().slice(0, 10), label: dayStart.toLocaleDateString("en-US", { weekday: "short" }), startMs: dayStart.getTime(), endMs: dayEnd.getTime() };
  });
  const trends = await caller.nutrition.trends({ days });
  const today = trends.buckets.at(-1);
  if (!today || today.freshLogCount !== 1 || today.packagedLogCount !== 2) throw new Error("Trend source split did not classify fresh and packaged logs");
  if (trends.summary.loggedDays !== 1 || trends.summary.freshSharePercent <= 0 || trends.summary.packagedSharePercent <= 0) throw new Error("Trend summary was not calculated");

  await caller.barcode.removeLog({ logId: packagedLogId });
  packagedLogId = null;
  await caller.barcode.removeCustomLog({ logId: customLogId });
  customLogId = null;
  await caller.nutrition.removeLog({ scanId: freshScanId });
  await caller.barcode.deleteCustomLabel({ labelId: customLabelId });
  customLabelId = null;

  Object.assign(report, {
    barcode: lookup.product.barcode,
    productName: lookup.product.productName,
    liveLookupOrCache: lookup.cacheStatus,
    cacheReused: cached.cacheStatus === "cached",
    halfServingCalories: packaged.nutrition.calories,
    customLabelEditedCalories: editedLabel.nutritionPerServing.calories,
    customThreeQuarterServingCalories: custom.nutrition.calories,
    dailyCombinedCalories: daily.total.calories,
    trendFreshLogCount: today.freshLogCount,
    trendPackagedLogCount: today.packagedLogCount,
    trendFreshSharePercent: trends.summary.freshSharePercent,
    trendPackagedSharePercent: trends.summary.packagedSharePercent,
    passed: true,
  });
  console.log(JSON.stringify(report, null, 2));
} finally {
  const database = await db.getDb();
  if (database) {
    await database.delete(analyticsEvents).where(eq(analyticsEvents.userId, user.id));
    await database.delete(customFoodLogs).where(eq(customFoodLogs.userId, user.id));
    await database.delete(customFoodLabels).where(eq(customFoodLabels.userId, user.id));
    await database.delete(packagedFoodLogs).where(eq(packagedFoodLogs.userId, user.id));
    await database.delete(nutritionLogs).where(eq(nutritionLogs.userId, user.id));
    if (freshScanId) await database.delete(foodLensScans).where(eq(foodLensScans.id, freshScanId));
    await database.delete(nutritionGoals).where(eq(nutritionGoals.userId, user.id));
    await database.delete(users).where(eq(users.id, user.id));
  }
}

process.exit(0);
