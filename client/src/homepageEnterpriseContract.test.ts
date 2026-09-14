import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = path.resolve(import.meta.dirname);
const homeSource = readFileSync(path.join(sourceRoot, "pages", "Home.tsx"), "utf8");
const homeCss = readFileSync(path.join(sourceRoot, "homepage-enterprise.css"), "utf8");

const protectedProgramPages = ["VowPage.tsx", "QcsPage.tsx", "AssurancePage.tsx"];

describe("homepage enterprise contract", () => {
  it("keeps Operating Cloud customer-facing and bounded", () => {
    expect(homeSource).toContain('id="operating-cloud"');
    expect(homeSource).toContain("JCEE OPERATING CLOUD");
    expect(homeSource).toContain("Reconcile");
    expect(homeSource).toContain("PLATFORM DIRECTION · IN DEVELOPMENT");
    expect(homeSource).toContain("JCEE Distribution");
  });

  it("keeps interactive explanations available on the program pages", () => {
    expect(homeSource).toContain('href="/vow"');
    expect(homeSource).toContain('href="/qcs"');
    expect(readFileSync(path.join(sourceRoot, "pages", "VowPage.tsx"), "utf8")).toContain("<VowDurabilityDemo />");
    expect(readFileSync(path.join(sourceRoot, "pages", "QcsPage.tsx"), "utf8")).toContain("<QcsTransitionGate />");
  });

  it("does not introduce successor program-page source files", () => {
    for (const file of protectedProgramPages) {
      expect(homeSource).not.toContain(file);
    }
  });
});
