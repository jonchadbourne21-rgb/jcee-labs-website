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

  it("uses the high-resolution Operating Cloud panorama without full-height cover stretching", () => {
    expect(visualCss).toContain("hf_20260913_121011_cde0c27f-604a-4cab-a462-f13e11da1288.png");
    expect(visualCss).toContain("top center / 100% auto no-repeat");
  });

  it("uses the approved Assurance hero while keeping claims in native page markup", () => {
    expect(visualCss).toContain(".assurance-program");
    expect(visualCss).toContain("hf_20260913_121026_ac53d071-079c-47eb-96c9-665ae97c35de.png");
  });
});
