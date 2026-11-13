import { describe, expect, it, vi } from "vitest";
vi.mock("./_core/env", () => ({ ENV: { cookieSecret: "x".repeat(40), appId: "website-fixture", oAuthServerUrl: "" } }));
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
describe("session configuration boundary", () => {
  it("accepts the configured application and refuses a different signed app", async () => {
    const own = await sdk.signSession({ openId: "fixture", appId: ENV.appId, name: "Fixture" });
    expect(await sdk.verifySession(own)).toMatchObject({ appId: ENV.appId });
    const other = await sdk.signSession({ openId: "fixture", appId: "another-app", name: "Fixture" });
    expect(await sdk.verifySession(other)).toBeNull();
  });
  it("refuses signing and verification without a strong configured secret", async () => {
    const old = ENV.cookieSecret;
    try {
      ENV.cookieSecret = "";
      await expect(sdk.createSessionToken("fixture")).rejects.toThrow("not configured");
      expect(await sdk.verifySession("invalid")).toBeNull();
    } finally { ENV.cookieSecret = old; }
  });
});
