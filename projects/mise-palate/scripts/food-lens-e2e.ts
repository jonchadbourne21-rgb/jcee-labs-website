import fs from "node:fs/promises";
import { eq } from "drizzle-orm";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";
import * as db from "../server/db";
import {
  analyticsEvents,
  foodLensScans,
  nutritionGoals,
  nutritionLogs,
  recipes,
  semanticMemories,
  semanticMemoryEdges,
  users,
} from "../drizzle/schema";

const startedAt = Date.now();
const openId = `mise-lens-${startedAt}`;

await db.upsertUser({
  openId,
  name: "Lens QA Cook",
  email: `mise-lens-${startedAt}@example.test`,
  loginMethod: "e2e",
  role: "user",
  lastSignedIn: new Date(),
});

const user = await db.getUserByOpenId(openId);
if (!user) throw new Error("Could not create test user");

const ctx: TrpcContext = {
  user,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie() {} } as unknown as TrpcContext["res"],
};
const caller = appRouter.createCaller(ctx);
const imageBuffer = await fs.readFile("/home/ubuntu/webdev-static-assets/mise-ingredients.jpg");
const dataUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

let scanId: number | null = null;
let recipeId: number | null = null;
const report: Record<string, unknown> = {
  startedAt: new Date(startedAt).toISOString(),
  testUserId: user.id,
};

try {
  const analyzed = await caller.foodLens.analyze({
    dataUrl,
    filename: "dinner.jpg",
    context: "chicken thighs and broccoli with lemon and parmesan",
  });
  scanId = analyzed.scanId;
  if (!scanId) throw new Error("Food Lens returned no scanId");
  if (!analyzed.dishGuess) throw new Error("Food Lens returned no dishGuess");
  if (!Array.isArray(analyzed.items) || analyzed.items.length === 0) throw new Error("Food Lens returned no detected food items");

  const liveUsdaMatches = analyzed.items.filter(item => item.referenceStatus === "matched_reference").length;
  const referenceMatches = analyzed.items.filter(item => item.referenceStatus !== "needs_reference").length;
  if (referenceMatches === 0) throw new Error("No nutrition references or safe fallbacks were attached");

  const first = analyzed.items[0];
  const updated = await caller.foodLens.update({
    scanId,
    items: [
      {
        id: first.id,
        name: first.name,
        estimatedGrams: 220,
        confidence: first.confidence,
        portionConfidence: 95,
        needsConfirmation: false,
      },
      ...analyzed.items.slice(1).map(item => ({
        id: item.id,
        name: item.name,
        estimatedGrams: item.estimatedGrams,
        confidence: item.confidence,
        portionConfidence: item.portionConfidence,
        needsConfirmation: item.needsConfirmation,
      })),
    ],
    measurementNote: "User verified scale with kitchen scale",
  });
  if (!updated.scan) throw new Error("Food Lens update returned no scan");

  const goals = await caller.nutrition.updateGoals({
    mode: "high_protein",
    caloriesTarget: 2200,
    proteinGTarget: 150,
    carbsGTarget: 230,
    fatGTarget: 75,
    fiberGTarget: 32,
    sodiumMgLimit: 2300,
  });
  if (goals.proteinGTarget !== 150) throw new Error("Nutrition goals did not persist");

  await caller.nutrition.logScan({ scanId, mealType: "dinner" });
  const scanStatus = await caller.nutrition.scanStatus({ scanId });
  if (!scanStatus.logged) throw new Error("Explicit meal log was not persisted");

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const daily = await caller.nutrition.daily({ dayStartMs: start.getTime(), dayEndMs: end.getTime() });
  if (daily.logs.length !== 1 || daily.total.calories <= 0) throw new Error("Daily nutrition aggregation failed");

  const generated = await caller.foodLens.createRecipe({
    scanId,
    confirmed: true,
    instructions: "Recreate this recognized plate as a high-protein dinner aligned with my palate.",
  });
  recipeId = generated.recipeId;
  if (!recipeId || !generated.recipe.title) throw new Error("Food Lens recipe generation failed");
  const repeated = await caller.foodLens.createRecipe({ scanId, confirmed: true, instructions: "retry" });
  if (repeated.recipeId !== recipeId || !repeated.reused) throw new Error("Food Lens recipe generation was not idempotent");

  const related = await caller.foodLens.related({ scanId });
  const history = await caller.foodLens.history();
  if (history.length === 0 || history[0].id !== scanId) throw new Error("Food Lens history did not contain the new scan");

  Object.assign(report, {
    scanId,
    dishGuess: analyzed.dishGuess,
    itemCount: analyzed.items.length,
    liveUsdaMatches,
    liveUsdaAvailable: liveUsdaMatches > 0,
    referenceMatches,
    nutritionSourceExamples: analyzed.items.slice(0, 3).map(item => item.sourceLabel),
    totalCalories: (updated.scan.totalNutrition as any).calories,
    dailyLoggedCalories: daily.total.calories,
    dailyProteinProgressPercent: daily.progress.protein,
    relatedCount: related.length,
    recipeId,
    recipeTitle: generated.recipe.title,
    idempotentRecipeReuse: repeated.reused,
    passed: true,
  });
  console.log(JSON.stringify(report, null, 2));
} finally {
  const database = await db.getDb();
  if (database) {
    await database.delete(analyticsEvents).where(eq(analyticsEvents.userId, user.id));
    await database.delete(nutritionLogs).where(eq(nutritionLogs.userId, user.id));
    await database.delete(nutritionGoals).where(eq(nutritionGoals.userId, user.id));
    await database.delete(semanticMemoryEdges).where(eq(semanticMemoryEdges.userId, user.id));
    await database.delete(semanticMemories).where(eq(semanticMemories.userId, user.id));
    await database.delete(recipes).where(eq(recipes.userId, user.id));
    if (scanId) await database.delete(foodLensScans).where(eq(foodLensScans.id, scanId));
    await database.delete(users).where(eq(users.id, user.id));
  }
}

await fs.mkdir("docs/test-evidence", { recursive: true });
await fs.writeFile("docs/test-evidence/food-lens-e2e-result.json", JSON.stringify(report, null, 2) + "\n", "utf8");
process.exit(0);
