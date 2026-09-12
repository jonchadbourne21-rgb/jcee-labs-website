import { describe, expect, it } from "vitest";
import { DEFAULT_PALATE } from "../shared/product";
import { mergePalates } from "./product/ai";

// The public live-model paths are integration-tested through the application.
// This suite covers the deterministic behavior that remains available when a model provider is degraded.
describe("culinary intelligence boundaries", () => {
  it("resolves a large spice gap at the plate instead of averaging blindly", () => {
    const primary = { ...DEFAULT_PALATE, spice: 85, acidity: 78, crunch: 84 };
    const guest = { ...DEFAULT_PALATE, spice: 15, acidity: 40, crunch: 42 };
    const result = mergePalates(primary, guest);
    const spice = result.tensions.find(item => item.dimension === "spice");
    expect(spice?.strategy).toContain("shared base mild");
    expect(result.shared.spice).toBe(50);
  });

  it("returns no tension when two palates are close", () => {
    const guest = { ...DEFAULT_PALATE, spice: DEFAULT_PALATE.spice + 5 };
    expect(mergePalates(DEFAULT_PALATE, guest).tensions).toHaveLength(0);
  });
});
