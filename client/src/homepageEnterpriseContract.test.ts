import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = path.resolve(import.meta.dirname);
const homeSource = readFileSync(
  path.join(sourceRoot, "pages", "Home.tsx"),
  "utf8"
);
const productSource = readFileSync(path.join(sourceRoot, "components", "ProductOverview.tsx"), "utf8");
const homeCss = readFileSync(
  path.join(sourceRoot, "homepage-enterprise.css"),
  "utf8"
);

const protectedProgramPages = [
  "VowPage.tsx",
  "QcsPage.tsx",
  "AssurancePage.tsx",
];

describe("homepage enterprise contract", () => {
  it("leads with controlled AI work and keeps Infrastructure availability bounded", () => {
    expect(homeSource).toContain("<ProductOverview />");
    expect(homeSource.indexOf("<ProductOverview />")).toBeLessThan(homeSource.indexOf('id="orbital-study"'));
    expect(productSource).toContain("Put AI to work.");
    expect(productSource).toContain("JCEE Infrastructure");
    expect(productSource).toContain("SOFTWARE IN DEVELOPMENT");
    expect(homeSource).toContain("JCEE Infrastructure is in development");
    expect(homeSource).not.toContain("JCEE Distribution");
    expect(homeSource).toContain("Workflow Assurance");
  });

  it("keeps interactive explanations available on the program pages", () => {
    expect(homeSource).toContain('href="/vow"');
    expect(homeSource).toContain('href="/qcs"');
    expect(
      readFileSync(path.join(sourceRoot, "pages", "VowPage.tsx"), "utf8")
    ).toContain("<VowDurabilityDemo />");
    expect(
      readFileSync(path.join(sourceRoot, "pages", "QcsPage.tsx"), "utf8")
    ).toContain("<QcsTransitionGate />");
  });

  it("does not introduce successor program-page source files", () => {
    for (const file of protectedProgramPages) {
      expect(homeSource).not.toContain(file);
    }
  });
});
