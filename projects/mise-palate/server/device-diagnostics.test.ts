import { describe, expect, it } from "vitest";
import { boundedMilliseconds, medianMilliseconds, successRate } from "./product/device-diagnostics";

describe("barcode device diagnostics", () => {
  it("bounds invalid latency values without inventing measurements", () => {
    expect(boundedMilliseconds(undefined)).toBeNull();
    expect(boundedMilliseconds(-50)).toBe(0);
    expect(boundedMilliseconds(1234.6)).toBe(1235);
    expect(boundedMilliseconds(500_000)).toBe(120_000);
  });

  it("calculates medians from actual successful trial timings", () => {
    expect(medianMilliseconds([])).toBeNull();
    expect(medianMilliseconds([600, 240, 480])).toBe(480);
    expect(medianMilliseconds([300, 900, 500, 700])).toBe(600);
  });

  it("reports a bounded scan success rate", () => {
    expect(successRate(2, 3)).toBe(67);
    expect(successRate(6, 3)).toBe(100);
    expect(successRate(0, 0)).toBe(0);
  });
});
