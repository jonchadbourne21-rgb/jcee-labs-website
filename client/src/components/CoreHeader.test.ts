import { describe, expect, it } from "vitest";
import {
  getMobileMenuLabel,
  getMobileMenuState,
  publicNavigationLinks,
} from "./CoreHeader";

describe("CoreHeader configuration", () => {
  it("defines the expected primary navigation links", () => {
    expect(publicNavigationLinks.map((link) => link.id)).toEqual([
      "jcee",
      "vow",
      "qcs",
      "assurance",
      "registry",
      "charter",
      "partners",
    ]);
  });

  it("produces correct accessible labels and states for the mobile menu", () => {
    expect(getMobileMenuLabel(false)).toBe("Open navigation menu");
    expect(getMobileMenuLabel(true)).toBe("Close navigation menu");
    expect(getMobileMenuState(false)).toBe("is-closed");
    expect(getMobileMenuState(true)).toBe("is-open");
  });
});
