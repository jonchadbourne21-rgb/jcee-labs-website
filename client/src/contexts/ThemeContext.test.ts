import { describe, expect, it } from "vitest";
import { resolveStoredTheme } from "./ThemeContext";

describe("resolveStoredTheme", () => {
  it("restores a valid light preference", () => {
    expect(resolveStoredTheme("light", "dark")).toBe("light");
  });

  it("restores a valid dark preference", () => {
    expect(resolveStoredTheme("dark", "light")).toBe("dark");
  });

  it("falls back safely for missing or invalid preferences", () => {
    expect(resolveStoredTheme(null, "dark")).toBe("dark");
    expect(resolveStoredTheme("sepia", "dark")).toBe("dark");
  });
});
