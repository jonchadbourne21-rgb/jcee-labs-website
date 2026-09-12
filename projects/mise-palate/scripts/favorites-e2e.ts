import fs from "node:fs/promises";
import { eq } from "drizzle-orm";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";
import * as db from "../server/db";
import { analyticsEvents, recipes, users } from "../drizzle/schema";

const startedAt = Date.now();
const openId = `mise-fav-${startedAt}`;

await db.upsertUser({
  openId,
  name: "Favorites QA Cook",
  email: `mise-fav-${startedAt}@example.test`,
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

const sampleRecipe: any = {
  title: "Crispy Lemon-Parmesan Chicken",
  summary: "High-heat skillet sear with bright finishing sauce.",
  rationale: "Optimized for high crunch and bright acidity.",
  ingredients: [
    { name: "chicken thighs", amount: 4, unit: "pieces", preparation: "bone-in, skin-on" },
    { name: "lemon", amount: 1, unit: "whole", preparation: "juiced and zested" },
  ],
  equipment: ["skillet", "tongs", "probe thermometer"],
  miseEnPlace: [{ order: 1, task: "Pat chicken dry", reason: "Surface moisture slows browning", canParallelize: false }],
  steps: [{
    id: "step-1",
    title: "Sear chicken skin down",
    instruction: "Sear until deep golden and crisp.",
    why: "Renders fat and builds crackly skin.",
    minutes: 8,
    temperatureF: 375,
    visualCue: "Deep amber crust",
    smellCue: "Rich roasted aroma",
    textureCue: "Rigid skin to tongs",
    commonMistake: "Moving the meat early",
    recovery: "Let it release naturally",
    techniqueSlug: "sear",
    safetyRuleIds: ["poultry-165"],
  }],
  sensoryProfile: {
    sweetness: 10,
    acidity: 75,
    salt: 60,
    spice: 20,
    richness: 50,
    bitterness: 10,
    herbaceous: 40,
    crunch: 85,
    tenderness: 70,
    doneness: 80,
    sauce: 45,
    smokiness: 15,
  },
  substitutions: [],
  safetyRules: [{
    id: "poultry-165",
    title: "Poultry Internal Temperature",
    category: "temperature",
    targetF: 165,
    targetC: 74,
    restMinutes: 0,
    requirement: "Cook to 165°F measured at thickest point.",
    sourceLabel: "USDA FSIS",
    sourceUrl: "https://www.foodsafety.gov",
  }],
  platingNotes: "Serve immediately while skin is at peak crunch.",
  activeMinutes: 20,
  totalMinutes: 30,
  difficulty: "moderate",
  generationMode: "live_ai",
};

let recipeId: number | null = null;
const report: Record<string, unknown> = {
  startedAt: new Date(startedAt).toISOString(),
  testUserId: user.id,
};

try {
  recipeId = await db.saveRecipe({
    userId: user.id,
    sourceIngredients: ["chicken thighs", "lemon"],
    recipe: sampleRecipe,
  });

  // Verify initial state
  const initial = await caller.recipes.get({ recipeId });
  if (initial.favorite !== false) throw new Error("Expected initial favorite to be false");
  if (!Array.isArray((initial as any).tags) || (initial as any).tags.length !== 0) {
    throw new Error("Expected initial tags to be an empty array");
  }

  // Favorite mutation
  await caller.recipes.favorite({ recipeId, favorite: true });
  const afterFav = await caller.recipes.get({ recipeId });
  if (afterFav.favorite !== true) throw new Error("Recipe did not record favorite state");

  // Tag mutation with normalization and deduplication
  const taggedResult = await caller.recipes.setTags({
    recipeId,
    tags: ["Weeknight", "weeknight ", "Crispy!", "  High Protein  "],
  });
  if (taggedResult.tags.length !== 3) throw new Error(`Expected 3 normalized tags, got ${taggedResult.tags.length}`);
  if (!taggedResult.tags.includes("crispy") || !taggedResult.tags.includes("weeknight") || !taggedResult.tags.includes("high protein")) {
    throw new Error("Normalized tags did not match expected set");
  }

  // List verification
  const list = await caller.recipes.list();
  const listed = list.find(r => r.id === recipeId);
  if (!listed || listed.favorite !== true || !(listed as any).tags.includes("crispy")) {
    throw new Error("Recipe list did not return updated favorite or tag fields");
  }

  report.favorite = true;
  report.persistedTags = (listed as any).tags;
  report.passed = true;
  console.log(JSON.stringify(report, null, 2));
} finally {
  const database = await db.getDb();
  if (database) {
    await database.delete(analyticsEvents).where(eq(analyticsEvents.userId, user.id));
    if (recipeId) await database.delete(recipes).where(eq(recipes.id, recipeId));
    await database.delete(users).where(eq(users.id, user.id));
  }
}

await fs.mkdir("docs/test-evidence", { recursive: true });
await fs.writeFile("docs/test-evidence/favorites-e2e-result.json", JSON.stringify(report, null, 2) + "\n", "utf8");
process.exit(0);
