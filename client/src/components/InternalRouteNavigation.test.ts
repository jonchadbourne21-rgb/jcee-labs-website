import { describe, expect, it } from "vitest";
import { resolveClientDestination } from "./InternalRouteNavigation";

const current = "https://jceelabs.com/solutions";
const routes = new Set(["/", "/solutions", "/capabilities/infrastructure", "/technology", "/research-evidence"]);

describe("internal route navigation", () => {
  it("keeps cross-page links in one document, including the reported journey", () => {
    expect(resolveClientDestination("/capabilities/infrastructure", current, routes)).toBe("/capabilities/infrastructure");
    expect(resolveClientDestination("/technology#current-integration", current, routes)).toBe("/technology#current-integration");
    expect(resolveClientDestination("https://jceelabs.com/", current, routes)).toBe("/");
    expect(resolveClientDestination("/solutions/?mode=review", current, routes)).toBe("/solutions?mode=review");
  });
  it("preserves native external, mailto, asset, unknown and same-page links", () => {
    for (const href of ["#design-partners", "/solutions#design-partners", "/solutions", "mailto:support@jceelabs.com",
      "https://example.org/technology", "//another.example/path", "/assets/example.pdf",
      "/admin", "/research-evidence", "?q=abc", "javascript:alert(1)", ""]) {
      expect(resolveClientDestination(href, current, routes), href).toBeNull();
    }
  });
  it("keeps legitimate query changes navigable", () => {
    expect(resolveClientDestination("/solutions?source=partner", current, routes)).toBe("/solutions?source=partner");
  });
});
