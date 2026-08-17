import { describe, expect, it } from "vitest";
import { getMobileMenuLabel, getMobileMenuState } from "./CoreHeader";

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
