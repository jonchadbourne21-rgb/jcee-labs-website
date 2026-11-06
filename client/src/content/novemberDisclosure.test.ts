import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { entries } from "./registryEntries";
import { november2026Registry } from "./november2026Registry";
import { november2026Updates } from "./november2026Updates";
import { publicationHref } from "./publications";

describe("November public disclosure boundary", () => {
  it("preserves the historical registry bytes", () => {
    const archived = readFileSync("client/public/JCEE_Labs_Public_Registry_v1.4.md");
    expect(createHash("sha256").update(archived).digest("hex")).toBe("9198aa31f399be01ca951d53e577bae11e3299232abd75c73232f2aa8f9e2161");
    expect(readFileSync("scripts/export-publications.ts", "utf8")).not.toContain('"client/public/JCEE_Labs_Public_Registry_v1.4.md"');
    const previous = readFileSync("client/public/JCEE_WorldLab_Public_Registry_v1.5.md");
    expect(createHash("sha256").update(previous).digest("hex")).toBe("443f99af83e25fbd3ae784e5ef6dd2b5a04e6e6acd8e8577d73ab715b9df0db0");
    expect(readFileSync("scripts/export-publications.ts", "utf8")).not.toContain('"client/public/JCEE_WorldLab_Public_Registry_v1.5.md"');
  });

  it("keeps private locators and executable details out of new public content", () => {
    const text = JSON.stringify([november2026Registry, november2026Updates]);
    for (const pattern of [
      /drive\.google\.com|docs\.google\.com|libfile_|file-inline-/,
      /github\.com\/JCEE-Labs|registry-control\/|qualification\//,
      /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|\bBearer\s+[A-Za-z0-9_-]/,
      /\bCREATE TABLE\b|\bCREATE FUNCTION\b|\.qpy\b|\.whl\b|\.tgz\b/,
    ]) expect(text).not.toMatch(pattern);
  });

  it("keeps full integration and physical simulation claims bounded", () => {
    const gate = november2026Registry.find(e => e.id === "portable-evidence-november")!;
    expect(gate.supports).toContain("not executed");
    expect(gate.boundary).toContain("not admitted and has not run");
    expect(gate.boundary).toContain("release remains on hold");
    const simulated = november2026Registry.find(e => e.id === "quantum-followup-simulation")!;
    expect(simulated.boundary).toContain("not IBM measurements");
    expect(simulated.next).toContain("explicit approval");
    expect(november2026Registry.every(e => e.status === "experimental")).toBe(true);
  });

  it("connects every new publication and registry anchor without duplicate IDs", () => {
    const app = readFileSync("client/src/App.tsx", "utf8");
    const ids = entries.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of november2026Updates) {
      expect(app).toContain(`path="${publicationHref(item)}"`);
      expect(readFileSync(`client/public/publications/${item.slug}.md`, "utf8")).toContain(item.title);
      for (const link of item.related ?? []) {
        if (link.href.startsWith("/registry#")) expect(ids).toContain(link.href.split("#")[1]);
      }
    }
    const download = readFileSync("client/public/JCEE_WorldLab_Public_Registry_v1.6.md", "utf8");
    for (const entry of november2026Registry) {
      expect(download).toContain(entry.summary);
      expect(download).toContain(entry.boundary);
    }
  });
});
