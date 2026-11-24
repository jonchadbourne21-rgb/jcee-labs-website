import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname);
const surfaceCheck = readFileSync(path.join(root, "../../scripts/worldlab-surface-check.mjs"), "utf8");
const home = readFileSync(path.join(root, "pages/Home.tsx"), "utf8");
const deferredOrbit = readFileSync(path.join(root, "components/DeferredEvidenceCore.tsx"), "utf8");
const section = readFileSync(path.join(root, "components/ProductOverview.tsx"), "utf8");
const css = readFileSync(path.join(root, "components/worldlab-product-overview.css"), "utf8");
const waves = readFileSync(path.join(root, "components/HexWaveField.tsx"), "utf8");
const rustSource = readFileSync(path.join(root, "../../visuals/worldlab/src/main.rs"), "utf8");
const rustPacket = JSON.parse(readFileSync(path.join(root, "generated/worldlab-hex-wave.json"), "utf8"));

describe("homepage binary-first landing", () => {
  it("leads with one hero, then capabilities, how it works, who it is for, and one call to action", () => {
    expect(home).toContain("<ProductOverview />");
    expect(home).not.toContain('id="orbital-study"');
    expect(home).not.toContain("<DeferredEvidenceCore />");
    const order = ["<ProductOverview />", "<CapabilityCatalog />", 'id="story"', 'id="fit"', 'id="consultation"'].map(token => home.indexOf(token));
    for (const position of order) expect(position).toBeGreaterThan(-1);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(section).toContain('<h1 id="product-overview-title">');
    expect(section).toContain('id="page-content" tabIndex={-1}');
    expect(section).toContain("Intelligence that leaves receipts.");
    expect(section).toContain('id="services"');
    expect(deferredOrbit).toContain('loading="lazy"');
    expect(surfaceCheck).toContain("#product-overview .wl-product-primary");
  });

  it("restores the customer-led wording with real conversion paths", () => {
    expect(section).toContain("Put AI to work.");
    expect(section).toContain("Stay in control.");
    expect(section).toContain("We build custom software and connect the systems your business");
    expect(section).toContain('href="/consultation"');
    expect(section).toContain('href="/solutions"');
    expect(section).toContain('href="/solutions#assessment"');
    expect(section).toContain('href="/solutions#build"');
  });

  it("offers assessment, implementation and partnership with workflow-specific qualification", () => {
    expect(section).toContain("Workflow Assurance assessment");
    expect(section).toContain("SCOPED SERVICE ENGAGEMENT");
    expect(section).toContain("Build around your business");
    expect(section).toContain("DESIGN PARTNERSHIPS");
    expect(home).toContain("Integrations are tested for your workflow before production use.");
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
    expect(section).toContain("Assess a workflow. Build a solution. Partner on what comes next.");
    expect(section).not.toContain("One platform we're building.");
    expect(section).toContain('import HexWaveField from "./HexWaveField"');
    expect(section).toContain('<HexWaveField variant="worldlab" className="wl-full-hex-field" />');
    expect(section).toContain('className="wl-hex-background"');
    expect(css).toContain(".wl-hex-background");
    expect(waves).toContain("(canvas.parentElement ?? canvas).getBoundingClientRect()");
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
    // The receipt carries its own label; the page keeps one evidence note.
    expect(section).not.toContain("wl-product-limit");
    expect(section).not.toContain("jcee-authority-hero-v3.webp");
    expect(css).toContain("@media (max-width: 780px)");
    expect(css).toContain("prefers-reduced-motion");
  });
});
