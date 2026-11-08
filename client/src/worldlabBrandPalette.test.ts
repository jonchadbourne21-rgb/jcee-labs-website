import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");
const rust = source("visuals/worldlab/src/main.rs");
const template = source("visuals/worldlab/src/theme.css.in");
const generated = source("client/src/worldlab-cohesion.css");
const homepage = source("client/src/pages/worldlab-home.css");
const service = source("client/src/pages/InfrastructurePage.tsx");

describe("WorldLab production orbital-blue identity", () => {
  it("keeps Rust-owned theme inputs and generated CSS byte-identical", () => {
    const tokens = Object.fromEntries(
      [...rust.matchAll(/\\("([A-Z]+)", "(#[a-f0-9]+)"\\)/g)].map(match => [match[1], match[2]])
    ) as Record<string, string>;
    const resolved = template.replace(/\\{\\{([A-Z]+)\\}\\}/g, (_, key: string) => {
      expect(tokens[key], `missing theme token ${key}`).toBeDefined();
      return tokens[key];
    });
    expect(generated).toBe(resolved);
  });

  it("uses the approved blue, not the previous lime, as the default site accent", () => {
    expect(rust).toContain('("ACCENT", "#6ab8ff")');
    expect(rust).toContain('("SURFACE", "#0d1724")');
    expect(generated).toContain("--wl-accent:#6ab8ff");
    expect(generated).toContain("--wl-green:var(--wl-accent)");
    expect(generated).not.toMatch(/#b5f896|#ccffb7|#182311/);
    expect(homepage).toContain("--wl-accent:#6ab8ff");
    expect(homepage).toContain("background:#080b12");
    expect(homepage).not.toMatch(/#b5f896|#ccffb7|#182311|#101610/);
  });

  it("makes the Infrastructure blue treatment the default without a query switch", () => {
    expect(service).toContain('className="customer-home customer-service"');
    expect(service).not.toContain("bluePreview");
    expect(service).not.toContain("worldlab-blue-preview");
    expect(service).not.toContain("palette=blue");
  });

  it("keeps readable dark text on the primary blue action", () => {
    const channel = (hex: string) => {
      const v = parseInt(hex, 16) / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const luminance = (hex: string) => {
      const rgb = hex.replace("#", "").match(/../g)!;
      return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
    };
    const a = luminance("#6ab8ff"), b = luminance("#071827");
    expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toBeGreaterThan(7);
    expect(homepage).toContain("color:#071827");
  });
});
