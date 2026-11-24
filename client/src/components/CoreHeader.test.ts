import { describe, expect, it } from "vitest";
import {
  getMobileMenuLabel,
  getMobileMenuState,
  publicNavigationLinks,
} from "./CoreHeader";

describe("CoreHeader mobile navigation", () => {
  it("labels the closed menu as an action to open navigation", () => {
    expect(getMobileMenuLabel(false)).toBe("Open navigation menu");
  });

  it("labels the open menu as an action to close navigation", () => {
    expect(getMobileMenuLabel(true)).toBe("Close navigation menu");
  });

  it("uses the open and closed classes needed for CSS transitions", () => {
    expect(getMobileMenuState(false)).toBe("is-closed");
    expect(getMobileMenuState(true)).toBe("is-open");
  });
});

describe("CoreHeader public information architecture", () => {
  it("leads with buyer navigation and keeps research one level down", () => {
    expect(publicNavigationLinks.map(link => link.id)).toEqual([
      "solutions",
      "technology",
      "resources",
      "company",
      "research",
    ]);
    expect(publicNavigationLinks.map(link => link.label)).toEqual([
      "Solutions",
      "How it works",
      "Resources",
      "Company",
      "Research",
    ]);
  });

  it("does not present Mirrored as part of the JCEE public site", () => {
    expect(
      publicNavigationLinks.some(link => String(link.label) === "MIRRORED")
    ).toBe(false);
  });
});
