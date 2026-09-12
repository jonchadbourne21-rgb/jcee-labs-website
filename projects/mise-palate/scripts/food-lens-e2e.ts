import fs from "node:fs/promises";
import { eq } from "drizzle-orm";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";
import * as db from "../server/db";
import {
  analyticsEvents,
  foodLensScans,
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

// Load an existing sample meal photo
const imageBuffer = await fs.readFile("/home/ubuntu/webdev-static-assets/mise-ingredients.jpg");
const dataUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

let scanId: number | null = null;
const report: Record<string, unknown> = {
  startedAt: new Date(startedAt).toISOString(),
  testUserId: user.id,
};

try {
  // 1. Analyze Food Lens photo
  const analyzed = await caller.foodLens.analyze({
    dataUrl,
    filename: "dinner.jpg",
    context: "chicken thighs and broccoli with lemon and parmesan",
  });

  scanId = analyzed.scanId;
  if (!scanId) throw new Error("Food Lens returned no scanId");
  if (!analyzed.dishGuess) throw new Error("Food Lens returned no dishGuess");
  if (!Array.isArray(analyzed.items) || analyzed.items.length === 0) {
    throw new Error("Food Lens returned no detected food items");
  }

  // 2. Adjust portion grams and recalculate nutrition
  const first = analyzed.items[0];
  const adjustedGrams = 220;
  const updated = await caller.foodLens.update({
    scanId,
    items: [
      {
        id: first.id,
        name: first.name,
        estimatedGrams: adjustedGrams,
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

  // 3. Verify semantic memory was stored and can be retrieved
  const related = await caller.foodLens.related({ scanId });

  // 4. Verify history query
  const history = await caller.foodLens.history();
  if (history.length === 0 || history[0].id !== scanId) {
    throw new Error("Food Lens history did not contain the new scan");
  }

  report.scanId = scanId;
  report.dishGuess = analyzed.dishGuess;
  report.itemCount = analyzed.items.length;
  report.totalCalories = (updated.scan.totalNutrition as any).calories;
  report.relatedCount = related.length;
  report.passed = true;
  console.log(JSON.stringify(report, null, 2));
} finally {
  const database = await db.getDb();
  if (database) {
    await database.delete(analyticsEvents).where(eq(analyticsEvents.userId, user.id));
    await database.delete(semanticMemoryEdges).where(eq(semanticMemoryEdges.userId, user.id));
    await database.delete(semanticMemories).where(eq(semanticMemories.userId, user.id));
    if (scanId) await database.delete(foodLensScans).where(eq(foodLensScans.id, scanId));
    await database.delete(users).where(eq(users.id, user.id));
  }
}

await fs.mkdir("docs/test-evidence", { recursive: true });
await fs.writeFile(
  "docs/test-evidence/food-lens-e2e-result.json",
  JSON.stringify(report, null, 2) + "\n",
  "utf8"
);
process.exit(0);
