import fs from "node:fs/promises";
import { eq } from "drizzle-orm";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";
import * as db from "../server/db";
import { analyticsEvents, ingredientScans, users } from "../drizzle/schema";

const startedAt = Date.now();
const openId = `mise-photo-${startedAt}`;
await db.upsertUser({ openId, name: "Photo QA", loginMethod: "e2e", lastSignedIn: new Date() });
const user = await db.getUserByOpenId(openId);
if (!user) throw new Error("Could not create photo test user");
const ctx: TrpcContext = {
  user,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie() {} } as unknown as TrpcContext["res"],
};
const caller = appRouter.createCaller(ctx);
const image = await fs.readFile("/home/ubuntu/webdev-static-assets/mise-ingredients.jpg");
let invalidRejected = false;
let result: Awaited<ReturnType<typeof caller.scans.analyzePhoto>> | null = null;
try {
  result = await caller.scans.analyzePhoto({
    dataUrl: `data:image/jpeg;base64,${image.toString("base64")}`,
    filename: "mise-ingredients.jpg",
    context: "Counter ingredients",
  });
  try {
    await caller.scans.analyzePhoto({ dataUrl: "not-an-image".repeat(20), filename: "bad.txt", context: "" });
  } catch {
    invalidRejected = true;
  }
  if (!result.imageUrl.startsWith("/manus-storage/")) throw new Error("Photo was not persisted through managed storage");
  if (!result.ingredients.some(item => /chicken/i.test(item.name))) throw new Error("Live photo route did not detect chicken");
  if (!invalidRejected) throw new Error("Invalid photo input was not rejected");
  const output = {
    testedAt: new Date().toISOString(),
    scanId: result.scanId,
    imageUrl: result.imageUrl,
    generationMode: result.generationMode,
    overallConfidence: result.overallConfidence,
    detectedCount: result.ingredients.length,
    uncertainCount: result.ingredients.filter(item => item.needsConfirmation).length,
    invalidInputRejected: invalidRejected,
    passed: true,
  };
  await fs.writeFile("docs/test-evidence/photo-route-result.json", JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(JSON.stringify(output, null, 2));
} finally {
  const database = await db.getDb();
  if (database) {
    await database.delete(analyticsEvents).where(eq(analyticsEvents.userId, user.id));
    await database.delete(ingredientScans).where(eq(ingredientScans.userId, user.id));
    await database.delete(users).where(eq(users.id, user.id));
  }
}
process.exit(0);
