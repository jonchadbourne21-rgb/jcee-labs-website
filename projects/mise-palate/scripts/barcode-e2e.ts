import { eq } from "drizzle-orm";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";
import * as db from "../server/db";
import {
  analyticsEvents,
  nutritionGoals,
  packagedFoodLogs,
  packagedFoodProducts,
  users,
} from "../drizzle/schema";

const startedAt = Date.now();
const openId = `mise-barcode-${startedAt}`;

await db.upsertUser({
  openId,
  name: "Barcode QA Cook",
  email: `mise-barcode-${startedAt}@example.test`,
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

let loggedId: number | null = null;
const report: Record<string, unknown> = {
  startedAt: new Date(startedAt).toISOString(),
  testUserId: user.id,
};

try {
  // 1. Invalid check digit should return structured not_found rather than throwing
  const invalid = await caller.barcode.lookup({ barcode: "3017620422004" });
  if (invalid.status !== "not_found") throw new Error("Invalid check digit did not return not_found status");

  // 2. Real barcode lookup (Nutella EAN 3017620422003)
  const lookup = await caller.barcode.lookup({ barcode: "3017620422003" });
  if (lookup.status !== "found") throw new Error(`Live barcode lookup failed: status was ${lookup.status}`);
  if (!lookup.product.productName) throw new Error("Found product has no product name");
  if (!lookup.product.nutritionPerServing.calories) throw new Error("Found product has no serving calories");

  // 3. Second lookup should hit local cache
  const cached = await caller.barcode.lookup({ barcode: "3017620422003" });
  if (cached.status !== "found" || cached.cacheStatus !== "cached") throw new Error("Second barcode lookup did not use cached product snapshot");

  // 4. Log 2 servings as a snack
  const logged = await caller.barcode.logMeal({
    productId: lookup.product.id,
    servings: 2,
    mealType: "snack",
  });
  loggedId = logged.log.id;
  if (logged.nutrition.calories !== Math.round(lookup.product.nutritionPerServing.calories * 2 * 10) / 10) {
    throw new Error("Logged nutrition did not scale accurately by servings");
  }

  // 5. Verify daily nutrition includes the packaged food log
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const daily = await caller.nutrition.daily({ dayStartMs: start.getTime(), dayEndMs: end.getTime() });
  if ((daily as any).packagedLogs?.length !== 1) throw new Error("Daily nutrition did not include packaged food log");
  if (daily.total.calories < logged.nutrition.calories) throw new Error("Packaged food log was not summed into daily totals");

  // 6. Remove log and confirm daily recalculates
  await caller.barcode.removeLog({ logId: loggedId });
  const afterRemove = await caller.nutrition.daily({ dayStartMs: start.getTime(), dayEndMs: end.getTime() });
  if ((afterRemove as any).packagedLogs?.length !== 0) throw new Error("Packaged food log was not removed from daily totals");

  Object.assign(report, {
    barcode: "3017620422003",
    productName: lookup.product.productName,
    brands: lookup.product.brands,
    servingSize: lookup.product.servingSize,
    servingCalories: lookup.product.nutritionPerServing.calories,
    twoServingsCalories: logged.nutrition.calories,
    allergens: lookup.product.allergens,
    sourceUrl: lookup.product.sourceUrl,
    cacheReused: cached.cacheStatus === "cached",
    passed: true,
  });
  console.log(JSON.stringify(report, null, 2));
} finally {
  const database = await db.getDb();
  if (database) {
    await database.delete(analyticsEvents).where(eq(analyticsEvents.userId, user.id));
    if (loggedId) await database.delete(packagedFoodLogs).where(eq(packagedFoodLogs.id, loggedId));
    await database.delete(packagedFoodLogs).where(eq(packagedFoodLogs.userId, user.id));
    await database.delete(nutritionGoals).where(eq(nutritionGoals.userId, user.id));
    await database.delete(users).where(eq(users.id, user.id));
  }
}

process.exit(0);
