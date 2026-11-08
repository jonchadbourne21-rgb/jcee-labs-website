import { readFileSync } from "node:fs";
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

  it("restores the customer-led wording with real conversion paths", () => {
    expect(section).toContain("Put AI to work.");
    expect(section).toContain("Stay in control.");
    expect(section).toContain("Bring AI into the workflows your business depends on.");
    expect(section).toContain('href="/consultation"');
    expect(section).toContain('href="/capabilities/infrastructure"');
    expect(section).toContain('href="/capabilities/infrastructure#deliverables"');
    expect(section).toContain('href="/technology#current-integration"');
  });

  it("differentiates a currently scoped service from unqualified developing software", () => {
    expect(section).toContain("Workflow Assurance assessment");
    expect(section).toContain("SCOPED SERVICE ENGAGEMENT");
    expect(section).toContain("JCEE Infrastructure");
    expect(section).toContain("SOFTWARE IN DEVELOPMENT");
    expect(section).toContain("do not establish general production");
    expect(section).not.toMatch(/production[- ]ready|bank[- ]grade|guaranteed|zero[- ]risk/i);
  });

  it("matches the orbital-blue palette rather than adding an ivory second site", () => {
    expect(css).toContain("background-color: #080B12 !important");
    expect(css).toContain("color: #F0F5FB !important");
    expect(css).toContain("background: #6AB8FF !important");
    expect(css).toContain("background: #0D1724 !important");
    expect(css).not.toContain("background: #f7f7f3");
  });

  it("shows an explicitly fictional AI action receipt, not a fabricated evidence claim", () => {
    expect(section).toContain('data-demo="illustrative"');
    expect(section).toContain("AI action receipt");
    expect(section).toContain("HELD FOR REVIEW");
    expect(section).toContain("NO CHANGE EXECUTED");
    expect(section).toContain("NOT A LIVE RECEIPT");
    expect(section).toContain("not an executed customer workflow");
    expect(section).not.toContain("jcee-authority-hero-v3.webp");
    expect(css).toContain("@media (max-width: 780px)");
    expect(css).toContain("prefers-reduced-motion");
  });
});
