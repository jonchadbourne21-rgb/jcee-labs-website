import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { websiteApiBoundary } from "./_core/apiBoundary";
import { registerStorageProxy } from "./_core/storageProxy";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const servers: ReturnType<ReturnType<typeof express>["listen"]>[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve()))));
});
async function serve(app: ReturnType<typeof express>) {
  const server = app.listen(0, "127.0.0.1"); servers.push(server);
  await new Promise<void>(resolve => server.on("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing address");
  return `http://127.0.0.1:${address.port}`;
}
describe("public website boundaries", () => {
  it("denies legacy API reads and writes before route handlers by default", async () => {
    vi.stubEnv("ENABLE_WEBSITE_LEGACY_API", "");
    const app = express(), called = vi.fn();
    app.use("/api", websiteApiBoundary);
    app.all("/api/*", (_req, res) => { called(); res.json({ secret: "fixture" }); });
    const base = await serve(app);
    for (const method of ["GET", "POST"]) {
      const response = await fetch(`${base}/api/trpc/mirrored.reflect`, { method });
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Not found" });
    }
    expect(called).not.toHaveBeenCalled();
  });
  it("requires exact opt-in and preserves downstream authorization", async () => {
    const app = express(); app.use("/api", websiteApiBoundary);
    app.get("/api/example", (_req, res) => res.status(403).end());
    const base = await serve(app);
    vi.stubEnv("ENABLE_WEBSITE_LEGACY_API", "1");
    expect((await fetch(`${base}/api/example`)).status).toBe(404);
    vi.stubEnv("ENABLE_WEBSITE_LEGACY_API", "true");
    expect((await fetch(`${base}/api/example`)).status).toBe(403);
  });
  it("redirects only known public image aliases and denies unknown keys", async () => {
    const app = express(); registerStorageProxy(app);
    const base = await serve(app);
    const response = await fetch(`${base}/manus-storage/02-vow-receipt_372bf105.webp`, { redirect: "manual" });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/visuals/02-vow-receipt.webp");
    for (const key of ["private/record.json", "constructor", "__proto__", "unknown.webp", "%2e%2e%2fprivate"]) {
      expect((await fetch(`${base}/manus-storage/${key}`, { redirect: "manual" })).status).toBe(404);
    }
  });
  it("denies anonymous and ordinary users pricing and paid model access", async () => {
    for (const user of [null, { id: 2, openId: "ordinary", role: "user" }]) {
      const caller = appRouter.createCaller({ user, req: {}, res: {} } as TrpcContext);
      await expect(caller.bidIndustrial.getPricing({ trade: "electrical" })).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(caller.bidIndustrial.getTrades()).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(caller.mirrored.reflect({ message: "fixture" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    }
  });
});
