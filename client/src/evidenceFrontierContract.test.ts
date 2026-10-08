import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname);
const read = (relative: string) => readFileSync(path.join(root, relative), "utf8");

const home = read("pages/Home.tsx");
const research = read("pages/ResearchPage.tsx");
const technology = read("pages/TechnologyPage.tsx");
const ladder = read("components/EvidenceLadder.tsx");
const css = read("editorial-update.css");

describe("October evidence and infrastructure claim boundaries", () => {
  it("surfaces one bounded evidence ladder without treating classes as universal proof", () => {
    for (const label of [
      "FORMAL OR MODEL-BASED",
      "SYNTHETIC OR REPLAY",
      "PHYSICAL VALIDATION PENDING",
      "FIELD EVIDENCE NOT ESTABLISHED",
    ]) {
      expect(ladder).toContain(label);
    }
    expect(ladder).toContain("different kinds of evidence, not a single score");
    expect(research).toContain("<EvidenceLadder />");
    expect(home).toContain('id="evidence-frontier"');
    expect(home).toContain('href="/research#evidence-ladder"');
  });

  it("names both physical proposals and makes unrun status explicit", () => {
    expect(research).toContain('id="physical-validation"');
    expect(research).toContain("JCEE-MMC-P0.1");
    expect(research).toContain("JCEE-QBIO-P0.1");
    expect(research.match(/PHYSICAL_NOT_RUN/g)?.length).toBe(2);
    expect(research).toContain("PRE-EXECUTION QUALIFIED");
    expect(research).toContain("PRE-BIOLOGY QUALIFICATION");
    expect(research).toContain("not physical findings");
    expect(research).toContain("WHAT IT WOULD NOT PROVE");
    expect(research).toContain("a rescheduled feasibility discussion is not");
    expect(research).not.toContain("UT Southwestern");
    expect(home).toContain('href="/research#physical-validation"');
  });

  it("publishes frozen P0, bounded P1/P2, and held P3 without a blanket mandate claim", () => {
    expect(technology).toContain('id="infrastructure-build"');
    for (const stage of ["P0 / UNIFIED CONTRACT", "P1 / GOLDEN EXECUTION PATH", "P2 / HOSTILE CONFORMANCE", "P3 / HETEROGENEOUS ADAPTERS"]) {
      expect(technology).toContain(stage);
    }
    expect(technology).toContain("CONTRACT FROZEN");
    expect(technology.match(/BOUNDED PASS/g)?.length).toBe(2);
    expect(technology).toContain("PARTIAL / GOVERNANCE HOLD");
    expect(technology).toContain("No provider");
    expect(technology).toContain("blanket mandate compliance");
    expect(technology).toContain("assessed separately for each deployment");
    expect(home).toContain('href="/technology#infrastructure-build"');
  });

  it("preserves the commercial buyer journey and responsive mobile evidence panels", () => {
    const offer = home.indexOf('id="engage"');
    const proof = home.indexOf('id="distribution-demo"');
    const integration = home.indexOf('id="technology"');
    const platform = home.indexOf('id="operating-cloud"');
    const evidence = home.indexOf('id="evidence-frontier"');
    expect(offer).toBeLessThan(proof);
    expect(proof).toBeLessThan(integration);
    expect(platform).toBeLessThan(evidence);
    expect(home).toContain("NOT YET ESTABLISHED");
    expect(css).toContain("@media (max-width: 700px)");
    expect(css).toContain(".physical-program-grid");
    expect(css).toContain(".infra-stage-grid");
    expect(css).toContain("scroll-margin-top: 100px");
  });

  // Fragment behavior is exercised in scripts/fragment-navigation-check.mjs.
});
