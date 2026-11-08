import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname);
const read = (name: string) => readFileSync(path.join(root, name), "utf8");
const home = read("pages/Home.tsx");
const orbit = read("components/OrbitGraphWebGL.tsx");
const core = read("components/EvidenceCore.tsx");
const deferred = read("components/DeferredEvidenceCore.tsx");
const simulator = read("components/ReceiptSimulator.tsx");
const bento = read("components/TechnicalBento.tsx");
const scroll = read("components/WorkflowScrollytelling.tsx");
const scenario = read("components/ScenarioTerminal.tsx");
const registry = read("pages/PublicRegistry.tsx");
const research = read("components/ResearchSections.tsx");
const drawer = read("components/PublicDataDrawer.tsx");
const scramble = read("components/ScrambleLabel.tsx");
const header = read("components/CoreHeader.tsx");
const css = read("worldlab-interactions.css");
const rust = read("../../visuals/worldlab/src/main.rs");
const graph = JSON.parse(read("generated/worldlab-orbit-graph.json"));

describe("JCEE WorldLab pre-publication interactive visual candidate", () => {
  it("connects the recovered Rust world scene to bounded WebGL2 graph states", () => {
    expect(core).toContain("<OrbitGraphWebGL paused={paused} />");
    expect(home).toContain("<DeferredEvidenceCore />");
    expect(deferred).toContain('lazy(() => import("./EvidenceCore"))');
    expect(deferred).toContain("IntersectionObserver");
    expect(core).toContain("createEvidenceCore");
    expect(orbit).toContain('getContext("webgl2"');
    expect(orbit).toContain('graph from "../generated/worldlab-orbit-graph.json"');
    expect(graph.kind).toBe("orbit-graph");
    expect(graph.generator).toBe("worldlab-visuals/1");
    expect(graph.nodes.map((n: { label: string }) => n.label)).toEqual(["AUTHORITY", "EXECUTION", "EVIDENCE"]);
    expect(graph.nodes.every((n: { x: number; y: number }) => Number.isFinite(n.x) && Number.isFinite(n.y) && Math.abs(n.x) < 1 && Math.abs(n.y) < 1)).toBe(true);
    expect(graph.edges).toEqual([[0,1],[1,2],[2,0]]);
    expect(rust).toContain("fn orbit_graph() -> String");
    expect(rust).toContain('("client/src/generated/worldlab-orbit-graph.json", orbit_graph())');
    expect(orbit).toContain('data-orbit-renderer={renderer}');
    expect(orbit).toContain("onMouseEnter");
  });

  it("adds a deterministic, local SHA-256 demo without real effects", () => {
    expect(home).toContain("<ReceiptSimulator />");
    expect(simulator).toContain('crypto.subtle.digest("SHA-256"');
    expect(simulator).toContain("mock_api_result: \"TIMEOUT_NO_ACK\"");
    expect(simulator).toContain("observed_external_effect: \"UNKNOWN\"");
    expect(simulator).toContain("LOCAL HASH MISMATCH");
    expect(simulator).toContain("LOCAL_DEMO_ONLY_NOT_A_REAL_RECEIPT");
    expect(simulator).toContain("NO SYSTEM ACCESS");
    expect(simulator).not.toMatch(/fetch\s*\(|axios\s*\(/);
  });

  it("renders a constrained asymmetrical bento, spotlight tracking and honest demo status", () => {
    expect(home).toContain("<TechnicalBento />");
    expect(bento).toContain("IT & Business Systems");
    expect(bento).toContain("Software Operations");
    expect(bento).toContain("Business Operations");
    expect(bento).toContain("--spot-x");
    expect(bento).toContain("NOT LIVE SYSTEM STATUS");
    expect(css).toContain(".wl-bento-hero { grid-row:span 2");
    expect(css).toContain("radial-gradient(360px circle");
  });

  it("keeps nav labels accessible and avoids scramble motion under reduced motion", () => {
    expect(header).toContain("<ScrambleLabel");
    expect(core).toContain('text="FIG. 002 / WORLDLAB ORBIT"');
    expect(scramble).toContain("aria-label={text}");
    expect(scramble).toContain("prefers-reduced-motion: reduce");
    expect(scramble).toContain("window.clearInterval");
  });

  it("offers copyable public projection drawers without fabricating source hashes", () => {
    expect(registry).toContain("Inspect public JSON record");
    expect(research).toContain("Inspect research boundary as public JSON");
    expect(registry).toContain("getPublicClaimLabel(selectedRecord.id)");
    expect(drawer).toContain("dialog");
    expect(drawer).toContain("navigator.clipboard.writeText(json)");
    expect(drawer).toContain('crypto.subtle.digest("SHA-256"');
    expect(drawer).toContain("not an original archived evidence hash");
    expect(css).toContain("backdrop-filter:blur(18px)");
  });

  it("uses scroll visibility for a recovery narrative while retaining manual playback", () => {
    expect(scenario).toContain("<WorkflowScrollytelling />");
    expect(scenario).toContain('aria-controls="scenario-terminal"');
    expect(scroll).toContain("IntersectionObserver");
    expect(scroll).toContain("HOLD: outcome unresolved");
  });

  it("is responsive and respects nonproduction and reduced-motion boundaries", () => {
    expect(css).toContain("@media(max-width:720px)");
    expect(css).toContain("@media(prefers-reduced-motion:reduce)");
    expect(scroll).toContain("NO LIVE RECEIPT");
    expect(simulator).toContain("not</strong> establish");
    expect(core).toContain("A titanium J");
  });
});
