import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = path.resolve(import.meta.dirname);
const appSource = readFileSync(path.join(sourceRoot, "App.tsx"), "utf8");
const footerSource = readFileSync(path.join(sourceRoot, "components", "BrandFooter.tsx"), "utf8");
const charterSource = readFileSync(path.join(sourceRoot, "pages", "Charter.tsx"), "utf8");
const retiredRoutes = ["/products", "/services", "/team", "/faq", "/truerpm", "/nicheflo", "/flocraft", "/rooh", "/revel", "/sopforge", "/babodie"];

describe("public surface contract", () => {
  it("keeps unmatched routes on the canonical JCEE 404", () => {
    expect(appSource).toContain("<Route component={NotFound} />");
    for (const route of retiredRoutes) {
      expect(appSource).not.toContain(`path=\"${route}\"`);
    }
  });

  it("keeps required footer links and Charter download markup", () => {
    expect(footerSource).toContain('href="/privacy"');
    expect(footerSource).toContain('href="/terms"');
    expect(charterSource).toContain('href="/JCEE_Labs_Charter_v1.0.md"');
    expect(charterSource).toContain("download");
  });
});
