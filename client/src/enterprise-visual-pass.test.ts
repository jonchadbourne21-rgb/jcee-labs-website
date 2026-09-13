import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = path.resolve(import.meta.dirname);
const visualCss = readFileSync(path.join(sourceRoot, "enterprise-visual-pass.css"), "utf8");
const reviewCss = readFileSync(path.join(sourceRoot, "homepage-enterprise-review-fixes.css"), "utf8");

describe("enterprise visual pass", () => {
  it("loads the approved visual overrides after the homepage enterprise pass", () => {
    expect(reviewCss).toContain('@import "./enterprise-visual-pass.css"');
  });

  it("uses the optimized high-resolution Operating Cloud panorama without full-height cover stretching", () => {
    expect(visualCss).toContain("8eb43ee0-7cad-47f8-8667-2f7c6df92076.webp");
    expect(visualCss).toContain("top center / 100% auto no-repeat");
  });

  it("uses the approved optimized Assurance hero while keeping claims in native page markup", () => {
    expect(visualCss).toContain(".assurance-program");
    expect(visualCss).toContain("ecc115d0-76eb-4a5c-bf41-bddd5e579065.webp");
  });
});
