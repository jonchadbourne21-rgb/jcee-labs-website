import fs from "node:fs/promises";
import { eq } from "drizzle-orm";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";
import * as db from "../server/db";
import {
  analyticsEvents,
  cookingSessions,
  ingredientScans,
  mealFeedback,
  palateProfiles,
  palateSignals,
  recipes,
  users,
} from "../drizzle/schema";

const startedAt = Date.now();
const openId = `mise-e2e-${startedAt}`;

await db.upsertUser({
  openId,
  name: "Mise QA Cook",
  email: `mise-e2e-${startedAt}@example.test`,
  loginMethod: "e2e",
  role: "user",
  lastSignedIn: new Date(),
});
const user = await db.getUserByOpenId(openId);
if (!user) throw new Error("Could not create integration-test user");

const ctx: TrpcContext = {
  user,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie() {} } as unknown as TrpcContext["res"],
};
const caller = appRouter.createCaller(ctx);

const report: Record<string, unknown> = {
  startedAt: new Date(startedAt).toISOString(),
  testUserId: user.id,
};

try {
  const calibrated = await caller.palate.calibrate({
    displayName: "Jonathan",
    choiceIds: ["crispy_wings", "tomato_pasta", "spicy_curry", "medium_steak", "bright_vinaigrette", "charred", "crunchy_veg", "sauce_on_side"],
    dislikedIngredients: ["olives"],
    dietaryRestrictions: [],
    equipment: ["oven", "stovetop", "sheet pan", "skillet"],
  });
  report.calibration = {
    complete: calibrated?.calibrationComplete,
    acidity: (calibrated?.dimensions as any).acidity,
    crunch: (calibrated?.dimensions as any).crunch,
    spice: (calibrated?.dimensions as any).spice,
  };

  const scan = await caller.scans.createFromText({
    text: "chicken thighs, broccoli, lemon, garlic, Parmesan",
    source: "description",
  });
  const corrected = scan.ingredients.map((item, index) => index === 4 ? { ...item, name: "finely grated Parmesan" } : item);
  const confirmed = await caller.scans.confirm({ scanId: scan.scanId, ingredients: corrected, corrected: true });
  report.ingredientConfirmation = {
    scanId: scan.scanId,
    status: confirmed?.status,
    count: corrected.length,
  };

  const options = await caller.recipes.options({
    scanId: scan.scanId,
    ingredients: corrected.map(item => item.name),
    timeMinutes: 45,
    difficulty: "moderate",
  });
  if (options.options.length !== 4) throw new Error(`Expected four recipe directions, received ${options.options.length}`);
  report.recipeOptions = {
    count: options.options.length,
    generationMode: options.generationMode,
    titles: options.options.map(option => option.title),
  };

  const chosen = options.options.find(option => /lemon|crispy/i.test(option.title)) ?? options.options[0];
  const generated = await caller.recipes.generate({ scanId: scan.scanId, ingredients: corrected.map(item => item.name), option: chosen });
  const poultrySafety = generated.recipe.safetyRules.find(rule => rule.id === "poultry-165");
  if (!poultrySafety?.requirement.includes("165°F")) throw new Error("Poultry safety rule was not attached");
  report.structuredRecipe = {
    recipeId: generated.recipeId,
    generationMode: generated.recipe.generationMode,
    stepCount: generated.recipe.steps.length,
    hasReasons: generated.recipe.steps.every(step => step.why.length > 0),
    hasCues: generated.recipe.steps.every(step => step.visualCue.length > 0 && step.textureCue.length > 0),
    hasRecovery: generated.recipe.steps.every(step => step.recovery.length > 0),
    poultrySafety: poultrySafety.requirement,
  };

  const session = await caller.cook.start({ recipeId: generated.recipeId });
  if (!session) throw new Error("Cooking session was not created");
  await caller.cook.progress({ sessionId: session.id, currentStep: 1 });
  const recovery = await caller.cook.recover({
    sessionId: session.id,
    recipeId: generated.recipeId,
    currentStep: 1,
    problem: "I don't have heavy cream.",
  });
  report.cookRecovery = {
    answer: recovery.answer,
    actionCount: recovery.immediateActions.length,
    preservedSafety: recovery.safetyNote.includes("165°F"),
  };

  const forecast = await caller.recipes.forecast({
    recipeId: generated.recipeId,
    requestedChange: "What changes if I add more lemon?",
  });
  report.tasteForecast = {
    interpretation: forecast.interpretation,
    confidence: forecast.confidence,
    changes: forecast.changes,
  };

  const before = await caller.palate.get();
  const beforeCrunch = before.profile.dimensions.crunch;
  const feedback = await caller.cook.rate({
    recipeId: generated.recipeId,
    sessionId: session.id,
    rating: "loved",
    adjustments: ["crispier"],
    note: "This was great but I wanted the chicken crispier.",
  });
  const after = await caller.palate.get();
  report.preferenceLearning = {
    beforeCrunch,
    afterCrunch: after.profile.dimensions.crunch,
    changed: after.profile.dimensions.crunch > beforeCrunch,
    signalCount: feedback.changes.length,
  };

  const household = await caller.recipes.matchPalates({
    guestName: "Guest",
    guestPalate: { ...after.profile.dimensions, spice: 15, acidity: 40, crunch: 42 },
  });
  report.multiPalate = {
    tensions: household.tensions,
    hasSpiceResolution: household.tensions.some(item => item.dimension === "spice" && item.strategy.includes("shared base mild")),
  };

  const memory = await caller.recipes.list();
  report.recipeMemory = { count: memory.length, persistedRecipeId: memory[0]?.id };
  report.passed = true;
} finally {
  const database = await db.getDb();
  if (database) {
    await database.delete(analyticsEvents).where(eq(analyticsEvents.userId, user.id));
    await database.delete(mealFeedback).where(eq(mealFeedback.userId, user.id));
    await database.delete(palateSignals).where(eq(palateSignals.userId, user.id));
    await database.delete(cookingSessions).where(eq(cookingSessions.userId, user.id));
    await database.delete(recipes).where(eq(recipes.userId, user.id));
    await database.delete(ingredientScans).where(eq(ingredientScans.userId, user.id));
    await database.delete(palateProfiles).where(eq(palateProfiles.userId, user.id));
    await database.delete(users).where(eq(users.id, user.id));
  }
}

report.completedAt = new Date().toISOString();
report.durationMs = Date.now() - startedAt;
await fs.mkdir("docs/test-evidence", { recursive: true });
await fs.writeFile("docs/test-evidence/e2e-result.json", JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(JSON.stringify(report, null, 2));
process.exit(0);
