import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname);
const home = readFileSync(path.join(root, "pages/Home.tsx"), "utf8");
const section = readFileSync(path.join(root, "components/ProductOverview.tsx"), "utf8");
const css = readFileSync(path.join(root, "components/worldlab-product-overview.css"), "utf8");

describe("homepage product second act", () => {
  it("preserves the approved orbital hero and places the commercial section before the demo", () => {
    expect(home).toContain("<EvidenceCore />");
    expect(home).toContain("wl-receipt-word");
    expect(home).toContain('<ProductOverview />');
    expect(home.indexOf("<ProductOverview />")).toBeGreaterThan(home.indexOf('id="page-content"'));
    expect(home.indexOf("<ProductOverview />")).toBeLessThan(home.indexOf("<ScenarioTerminal />"));
  });

  it("brings back the old customer-led wording with real conversion paths", () => {
    expect(section).toContain("Put AI to work.");
    expect(section).toContain("Stay in control.");
    expect(section).toContain("Bring AI into the workflows your business depends on.");
    expect(section).toContain('href="/consultation"');
    expect(section).toContain('href="/capabilities/infrastructure"');
    expect(section).toContain('href="/capabilities/infrastructure#deliverables"');
    expect(section).toContain('href="/technology#current-integration"');
  });

  it("states exactly what is available and preserves the product boundary", () => {
    expect(section).toContain("Workflow Assurance assessment");
    expect(section).toContain("SCOPED SERVICE ENGAGEMENT");
    expect(section).toContain("JCEE Infrastructure");
    expect(section).toContain("SOFTWARE IN DEVELOPMENT");
    expect(section).toContain("do not establish general production");
    expect(section).not.toMatch(/production[- ]ready|bank[- ]grade|guaranteed|zero[- ]risk/i);
  });

  it("reuses the approved titanium-and-glass illustration and a contrasting editorial surface", () => {
    expect(existsSync(path.join(root, "../public/visuals/jcee-authority-hero-v3.webp"))).toBe(true);
    expect(section).toContain("jcee-authority-hero-v3.webp");
    expect(css).toContain("background: #f7f7f3 !important");
    expect(css).toContain("color: #0b1018 !important");
    expect(css).toContain("@media (max-width: 780px)");
    expect(css).toContain("prefers-reduced-motion");
  });
});
