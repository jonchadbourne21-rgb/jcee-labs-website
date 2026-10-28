import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = path.resolve(import.meta.dirname);
const gateSource = readFileSync(path.join(sourceRoot, "components", "QcsTransitionGate.tsx"), "utf8");
const gateStyles = readFileSync(path.join(sourceRoot, "qcs-gate.css"), "utf8");

describe("QCS public transition-gate contract", () => {
  it("keeps the public-model disclosure and simplified-execution boundary visible", () => {
    expect(gateSource).toContain("PUBLIC CLIENT-SIDE MODEL · NOT THE QCS ENGINE");
    expect(gateSource).toContain("Simplified public visualization of QCS-2.0 concepts");
    expect(gateSource).toContain("execution of the frozen QCS implementation");
  });

  it("keeps transition controls at the established 40px minimum touch target", () => {
    expect(gateStyles).toMatch(/\.qcs-gate__controls button\s*\{[^}]*min-height:\s*40px;/s);
  });
});
