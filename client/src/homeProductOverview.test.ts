import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname);
const home = readFileSync(path.join(root, "pages/Home.tsx"), "utf8");
const section = readFileSync(path.join(root, "components/ProductOverview.tsx"), "utf8");
const css = readFileSync(path.join(root, "components/worldlab-product-overview.css"), "utf8");
const waves = readFileSync(path.join(root, "components/HexWaveField.tsx"), "utf8");
const rustSource = readFileSync(path.join(root, "../../visuals/worldlab/src/main.rs"), "utf8");
const rustPacket = JSON.parse(readFileSync(path.join(root, "generated/worldlab-hex-wave.json"), "utf8"));

describe("homepage product second act", () => {
  it("preserves the approved orbital hero and places the commercial section before the demo", () => {
    expect(home).toContain("<EvidenceCore />");
    expect(home).toContain("wl-receipt-word");
    expect(home).toContain('<ProductOverview />');
    expect(home.indexOf("<ProductOverview />")).toBeGreaterThan(home.indexOf('id="page-content"'));
    expect(home.indexOf("<ProductOverview />")).toBeLessThan(home.indexOf("<ScenarioTerminal />"));
  });

  it("restores the customer-led wording with real conversion paths", () => {
    expect(section).toContain("Put AI to work.");
    expect(section).toContain("Stay in control.");
    expect(section).toContain("Bring AI into the workflows your business depends on.");
    expect(section).toContain('href="/consultation"');
    expect(section).toContain('href="/capabilities/infrastructure"');
    expect(section).toContain('href="/capabilities/infrastructure#deliverables"');
    expect(section).toContain('href="/technology#current-integration"');
  });

  it("differentiates a currently scoped service from unqualified developing software", () => {
    expect(section).toContain("Workflow Assurance assessment");
    expect(section).toContain("SCOPED SERVICE ENGAGEMENT");
    expect(section).toContain("JCEE Infrastructure");
    expect(section).toContain("SOFTWARE IN DEVELOPMENT");
    expect(section).toContain("do not establish general production");
    expect(section).not.toMatch(/production[- ]ready|bank[- ]grade|guaranteed|zero[- ]risk/i);
  });

  it("matches the orbital-blue palette rather than adding an ivory second site", () => {
    expect(css).toContain("background-color: #080B12 !important");
    expect(css).toContain("color: #F0F5FB !important");
    expect(css).toContain("background: #6AB8FF !important");
    expect(css).toContain("background: #0D1724 !important");
    expect(css).not.toContain("background: #f7f7f3");
  });

  it("restores the original full-section animated hexadecimal field from Rust assets", () => {
    expect(section).toContain("One engagement you can scope today. One platform for controlled AI execution.");
    expect(section).not.toContain("One platform we're building.");
    expect(section).toContain('import HexWaveField from "./HexWaveField"');
    expect(section).toContain('<HexWaveField variant="worldlab" className="wl-full-hex-field" />');
    expect(section).not.toContain("wl-binary-wave");
    expect(section).not.toContain("textPath");
    expect(section).not.toContain("wl-product-orbit");
    expect(section).not.toContain("wl-product-node");
    expect(css).toContain(".wl-full-hex-field");
    expect(css).toContain("position: absolute");
    expect(css).toContain("inset: 0");
    expect(css).not.toContain(".wl-binary-strings");
    expect(css).not.toContain(".wl-product-orbit");
    expect(css).toContain("rotateY(-4.5deg) rotateX(1deg) rotateZ(.75deg)");
    expect(css).toContain("rotateY(-3deg) rotateX(.75deg) rotateZ(.6deg)");
    expect(css).toContain("prefers-reduced-motion");
  });

  it("uses the recovered August 18 renderer with a checked-in Rust-owned wave model", () => {
    expect(waves).toContain('import rustWave from "../generated/worldlab-hex-wave.json"');
    expect(waves).toContain('variant?: "classic" | "worldlab"');
    expect(waves).toContain("rustSin(");
    expect(waves).toContain("rustWave.glyphs");
    expect(waves).toContain("rustWave.desktopWaves");
    expect(waves).toContain('document.addEventListener("visibilitychange", refresh)');
    expect(waves).toContain("ResizeObserver");
    expect(rustSource).toContain("fn hex_wave() -> String");
    expect(rustSource).toContain('("client/src/generated/worldlab-hex-wave.json", hex_wave())');
    expect(rustPacket.generator).toBe("worldlab-visuals/1");
    expect(rustPacket.kind).toBe("hex-wave");
    expect(rustPacket.glyphs).toBe("01ACEF2479");
    expect(rustPacket.desktopWaves).toBe(9);
    expect(rustPacket.mobileWaves).toBe(6);
    expect(rustPacket.colors).toEqual(["106,184,255", "163,207,245"]);
    expect(rustPacket.sinLut).toHaveLength(256);
    expect(rustPacket.sinLut.every((n: number) => Number.isFinite(n) && Math.abs(n) <= 1)).toBe(true);
  });

  it("shows an explicitly fictional AI action receipt, not a fabricated evidence claim", () => {
    expect(section).toContain('data-demo="illustrative"');
    expect(section).toContain("AI action receipt");
    expect(section).toContain("HELD FOR REVIEW");
    expect(section).toContain("NO CHANGE EXECUTED");
    expect(section).toContain("NOT A LIVE RECEIPT");
    expect(section).toContain("not an executed customer workflow");
    expect(section).not.toContain("jcee-authority-hero-v3.webp");
    expect(css).toContain("@media (max-width: 780px)");
    expect(css).toContain("prefers-reduced-motion");
  });
});
