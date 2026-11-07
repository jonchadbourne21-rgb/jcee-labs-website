import { describe, expect, it } from "vitest";
import { entries } from "./registryEntries";
import { getPublicClaimLabel, publicClaimLabel, publicClaimTierById } from "./publicClaimLevels";

describe("WorldLab four-level public claim vocabulary", () => {
  it("classifies every current public registry entry exactly once", () => {
    const recordedIds = entries.map(entry => entry.id).sort();
    const mappedIds = Object.keys(publicClaimTierById).sort();
    expect(new Set(recordedIds).size).toBe(recordedIds.length);
    expect(mappedIds).toEqual(recordedIds);
  });

  it("exposes exactly four consistent public evidence labels", () => {
    expect(new Set(Object.values(publicClaimLabel))).toEqual(new Set([
      "DEFINED", "TESTED — BOUNDED", "REPRODUCED — BOUNDED", "HOLD / NOT QUALIFIED",
    ]));
    for (const entry of entries) {
      expect(Object.values(publicClaimLabel)).toContain(getPublicClaimLabel(entry.id));
      expect(entry.boundary.trim().length).toBeGreaterThan(0);
      expect(entry.supports.trim().length).toBeGreaterThan(0);
    }
  });

  it("never promotes an unreviewed entry or open gate by inference", () => {
    expect(getPublicClaimLabel("some-future-unreviewed-entry")).toBe("HOLD / NOT QUALIFIED");
    for (const id of ["portable-evidence-november", "physical-commitment", "vow-i1", "vela"]) {
      expect(getPublicClaimLabel(id)).toBe("HOLD / NOT QUALIFIED");
    }
  });

  it("does not mistake governance adoption for a scientific test", () => {
    expect(getPublicClaimLabel("jrp-000")).toBe("DEFINED");
    expect(getPublicClaimLabel("first-principle")).toBe("DEFINED");
  });

  it("keeps the exact technical support and boundary text with original entries", () => {
    const g0 = entries.find(entry => entry.id === "portable-evidence-november");
    expect(g0?.supports).toContain("not executed");
    expect(g0?.boundary).toContain("not admitted and has not run");
    const native = entries.find(entry => entry.id === "native-comparisons-november");
    expect(native?.boundary).toContain("do not establish JCEE superiority");
  });
});
