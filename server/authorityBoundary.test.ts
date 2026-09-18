import { describe, expect, it } from "vitest";
import {
  authorityFromDurableRecord,
  requireAuthority,
} from "./authorityBoundary";

describe("authority boundary", () => {
  it("derives a stable non-empty identity from a durable record", () => {
    const a = authorityFromDurableRecord("lead", 42, "loops-sync");
    const b = authorityFromDurableRecord("lead", 42, "loops-sync");
    expect(a).toEqual(b);
    expect(a.generation).toBe(42);
    expect(a.sigma).toMatch(/^[0-9a-f]{64}$/);
  });

  it("separates downstream effects on the same durable record", () => {
    const notify = authorityFromDurableRecord("lead", 42, "notify-owner");
    const loops = authorityFromDurableRecord("lead", 42, "loops-sync");
    expect(notify.authorityKey).not.toBe(loops.authorityKey);
    expect(notify.sigma).not.toBe(loops.sigma);
  });

  it("fails closed when no durable record identity exists", () => {
    expect(() =>
      authorityFromDurableRecord("lead", 0, "loops-sync")
    ).toThrow("AUTHORITY_IDENTITY_UNAVAILABLE");
    expect(() => requireAuthority(undefined)).toThrow(
      "AUTHORITY_IDENTITY_UNAVAILABLE"
    );
  });
});
