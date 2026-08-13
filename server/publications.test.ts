import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) =>
  readFileSync(path.join(repositoryRoot, relativePath), "utf8");

describe("JRP-000 publication", () => {
  const paper = read("client/public/JRP-000_The_Evidence_Boundary_v1.0.md");
  const paperPage = read("client/src/pages/Jrp000.tsx");
  const app = read("client/src/App.tsx");
  const index = read("client/public/JCEE_Labs_Research_Evidence_Index_v1.1.md");

  it("publishes the adopted Version 1.0 source with its governing boundary", () => {
    expect(paper).toContain("**Version:** 1.0");
    expect(paper).toContain("**Status:** Adopted");
    expect(paper).toContain(
      "**Document class:** JCEE Labs research-governance standard"
    );
    expect(paper).toContain(
      "A claim may be narrower than the evidence hoped for. It may never be broader than the evidence obtained."
    );
  });

  it("keeps the scorecard non-compensatory and non-statistical", () => {
    expect(paper).toContain(
      "No total, including 1.00, overrides a failed gate."
    );
    expect(paper).toContain("They have not been statistically calibrated");
    expect(paper).toContain(
      "must not be interpreted as probabilities of truth"
    );
  });

  it("routes the paper and links the exact adopted source", () => {
    expect(app).toContain(
      '<Route path="/research/jrp-000" component={Jrp000} />'
    );
    expect(paperPage).toContain(
      'const sourcePath = "/JRP-000_The_Evidence_Boundary_v1.0.md"'
    );
    expect(paperPage).toContain("STATUS · ADOPTED");
  });

  it("registers JRP-000 in Research & Evidence Index Version 1.1", () => {
    expect(index).toContain("**Version 1.1 — August 13, 2026**");
    expect(index).toContain("## III. Research Publications");
    expect(index).toContain("### JRP-000 — The Evidence Boundary");
    expect(index).toContain("### Inconclusive");
  });

  it("does not publish private VOW implementation identifiers", () => {
    for (const restrictedToken of [
      "causal_effects.py",
      "effect_recovery.py",
      "VowScarMemory",
      "safe_to_retry",
      "observe_first",
      "territory reservation",
    ]) {
      expect(paper).not.toContain(restrictedToken);
      expect(index).not.toContain(restrictedToken);
    }
  });
});
