import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = path.resolve(import.meta.dirname);
const indexCss = readFileSync(path.join(sourceRoot, "index.css"), "utf8");
const homeHexCss = readFileSync(path.join(sourceRoot, "home-hex.css"), "utf8");
const siteVnextCss = readFileSync(path.join(sourceRoot, "site-vnext.css"), "utf8");

describe("mobile overflow regression safeguards", () => {
  it("keeps the mobile hex inspector data track shrinkable", () => {
    expect(homeHexCss).toContain("grid-template-columns: 58px minmax(0, 1fr);");
    expect(homeHexCss).not.toContain("grid-template-columns: 58px minmax(420px, 1fr);");
    expect(homeHexCss).toContain(".hex-table-head span:nth-child(2)");
  });

  it("allows the JCEE VOW terminal command to shrink within its mobile flex row", () => {
    expect(indexCss).toMatch(/\.terminal-line\s*{[\s\S]*?min-width:\s*0;/);
    expect(indexCss).toMatch(/\.terminal-line code\s*{[\s\S]*?overflow-wrap:\s*anywhere;/);
    expect(indexCss).toMatch(/\.cursor\s*{[\s\S]*?flex:\s*0 0 7px;/);
  });

  it("collapses the successor registry and assurance layouts to one shrinkable column", () => {
    expect(siteVnextCss).toMatch(
      /@media \(max-width: 720px\)[\s\S]*?\.registry-entry\s*{[\s\S]*?grid-template-columns:\s*46px minmax\(0, 1fr\);/
    );
    expect(siteVnextCss).toMatch(
      /@media \(max-width: 520px\)[\s\S]*?\.registry-entry\s*{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/
    );
    expect(siteVnextCss).toContain(".assurance-section");
    expect(siteVnextCss).toContain(".registry-section");
  });
});
