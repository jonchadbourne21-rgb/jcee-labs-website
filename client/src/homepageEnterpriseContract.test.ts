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
    expect(homeSource).toContain("Connect");
    expect(homeSource).toContain("Reconcile");
    expect(homeSource).toContain("Control");
    expect(homeSource).toContain("The platform is in development");
    expect(homeSource).toContain("JCEE Distribution");
  });

  it("renders VOW and QCS imagery as homepage background treatments", () => {
    expect(homeSource).toContain("home-chapter-visual");
    expect(homeCss).toContain("position: absolute !important");
    expect(homeCss).toContain("object-fit: cover !important");
    expect(homeCss).toContain("chapter-visual-vow.home-chapter-visual");
    expect(homeCss).toContain("chapter-visual-qcs.home-chapter-visual");
  });

  it("does not introduce successor program-page source files", () => {
    for (const file of protectedProgramPages) {
      expect(homeSource).not.toContain(file);
    }
  });
});
