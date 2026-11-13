import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(resolve(import.meta.dirname, name), "utf8");
const routes = JSON.parse(read("content/publicRoutes.json")) as string[];
const metadata = JSON.parse(read("content/routeMetadata.json")) as Record<string, {title:string;description:string}>;
const app = read("App.tsx"), home = read("pages/Home.tsx"), footer = read("components/BrandFooter.tsx");
const forge = read("components/magicpath/JCEESignalForge.tsx");
const forgeCss = read("components/magicpath/JCEESignalForge.css");
const worldlabTheme = read("worldlab-cohesion.css");
const engine = read("components/magicpath/JCEEWorldLabEvidenceEngine.tsx");
const forgePage = read("pages/SignalForgePage.tsx"), enginePage = read("pages/EvidenceEnginePage.tsx");
const browser = read("../../scripts/public-surface-check.mjs");
const footerVisual = read("../../scripts/footer-visual-capture.mjs");

describe("MagicPath concepts are isolated, bounded public experiences", () => {
  it("registers lazy routes and metadata without eager-loading the homepage", () => {
    for (const route of ["/experiences/signal-forge","/experiences/evidence-engine"]) {
      expect(routes.filter(x => x === route)).toHaveLength(1);
      expect(metadata[route].title).toContain("JCEE WorldLab");
      expect(home).toContain(`href="${route}"`);
      expect(footer).toContain(`href="${route}"`);
    }
    expect(app).toContain('lazy(() => import("./pages/SignalForgePage"))');
    expect(app).toContain('lazy(() => import("./pages/EvidenceEnginePage"))');
    expect(app).toContain('<Route path="/experiences/signal-forge" component={SignalForgePage} />');
    expect(app).toContain('<Route path="/experiences/evidence-engine" component={EvidenceEnginePage} />');
    expect(home).not.toContain("<JCEESignalForge");
    expect(home).not.toContain("<JCEEWorldLabEvidenceEngine");
  });
  it("preserves correct website chrome and primary H1 within each prototype", () => {
    for (const s of [forgePage,enginePage]) {
      expect(s).toContain("<CoreHeader");
      expect(s).toContain('id="page-content" tabIndex={-1}');
      expect(s).toContain("<BrandFooter");
      expect(s).toContain("usePageSeo");
    }
    expect(forge).toContain('id="sf-title"');
    expect(engine).toContain("Know what happened.");
  });
  it("retains local-only semantics without connected backend or false publication language", () => {
    for (const s of [forge,engine]) {
      expect(s).toContain('data-demo="browser-only"');
      expect(s).not.toContain("JSON.stringify");
      expect(s).not.toContain("createObjectURL");
      expect(s).not.toMatch(/\bfetch\s*\(|\bWebSocket\s*\(/);
      expect(s).not.toContain("JCEE’s live website is unchanged.");
      expect(s).not.toContain("JCEE’s live website has not been changed.");
    }
    expect(read("pages/worldlab-experiences.css")).toContain("#root#root#root .worldlab-experience-page :is(.je-app,.sf-app) :is(h1,h2,h3)");
    expect(forgePage).toContain("No live agent actions");
    expect(enginePage).toContain("No live system access");
    expect(worldlabTheme).toContain("--wl-accent:#6ab8ff");
    expect(forgeCss).toContain("--sf-bg:var(--wl-bg,#080b12)");
    expect(forgeCss).toContain("--sf-accent:var(--wl-accent,#6ab8ff)");
    expect(forgeCss).toContain("background:var(--sf-accent)");
    expect(read("pages/worldlab-experiences.css")).toContain(".sf-app .sf-hero h1 em");
    expect(read("pages/worldlab-experiences.css")).toContain("color:var(--wl-accent,#6ab8ff)!important");
    expect(forge).toContain("rgba(100,166,232,");
    expect(forge).toContain("shifting from orbital blue to amber");
    expect(forge).toContain("color: '#efb869'");
    expect(forgeCss).not.toMatch(/#9bdcd5|#b6d9c4|#080c0d/i);
    expect(browser).toContain("Signal Forge is not using WorldLab orbital-blue brand colors");
    expect(forge).toContain("Fictional data");
    expect(engine).toContain("browser-local");
    expect(browser).toContain("Signal Forge timed-out scene did not appear");
    expect(browser).toContain("Evidence Engine browser-local reconciliation did not update observed status");
    expect(browser).toContain("Evidence Engine workspace navigation is not vertically stacked in the sidebar");
    expect(read("pages/worldlab-experiences.css")).toContain('.je-sidebar nav[aria-label="Workspace navigation"]');
    expect(footerVisual).toContain("assert.equal(v.links.length,21)");
    expect(footerVisual).toContain("href === '/experiences/signal-forge'");
    expect(footerVisual).toContain("href === '/experiences/evidence-engine'");
  });
});
