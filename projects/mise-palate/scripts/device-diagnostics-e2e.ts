import { eq } from "drizzle-orm";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";
import * as db from "../server/db";
import { barcodeDeviceDiagnostics, users } from "../drizzle/schema";

const startedAt = Date.now();
const openId = `mise-diagnostics-${startedAt}`;
await db.upsertUser({
  openId,
  name: "Hardware QA Cook",
  email: `mise-diag-${startedAt}@example.test`,
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

try {
  // Record simulated iPhone 15 Pro result
  const record = await caller.barcode.recordDeviceDiagnostic({
    deviceLabel: "iPhone 15 Pro Max (Simulated QA)",
    platform: "Apple iOS",
    browser: "Mobile Safari",
    engine: "native",
    cameraStartMs: 240,
    firstDetectionMs: 310,
    trialCount: 3,
    successfulTrials: 3,
    trialDetectionMs: [310, 280, 260],
    focusSupported: true,
    continuousFocusSupported: true,
    torchSupported: true,
    rearCameraSelected: true,
    videoWidth: 1280,
    videoHeight: 720,
    notes: "Continuous auto-focus locked quickly in test fixture",
  });

  if (record.medianDetectionMs !== 280) throw new Error("Median calculation mismatch: expected 280ms");
  if (!record.continuousFocusSupported) throw new Error("Focus flag not persisted");

  // Query diagnostics history
  const history = await caller.barcode.deviceDiagnostics();
  if (!history.length || history[0].deviceLabel !== "iPhone 15 Pro Max (Simulated QA)") {
    throw new Error("Diagnostics history query did not return expected record");
  }

  console.log("Device diagnostics integration test PASSED:", JSON.stringify(record, null, 2));
} finally {
  const database = await db.getDb();
  if (database) {
    await database.delete(barcodeDeviceDiagnostics).where(eq(barcodeDeviceDiagnostics.userId, user.id));
    await database.delete(users).where(eq(users.id, user.id));
  }
}

process.exit(0);
