import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { publications, publicationHref } from "./publications";
import { bb84PublicRelease as paper } from "./bb84Release";

describe("October publication release", () => {
  const app = readFileSync("client/src/App.tsx", "utf8");
  it.each(["after-an-ai-says-done", "a-research-result-needs-a-boundary"])(
    "registers and routes %s",
    slug => {
      const items = publications.filter(item => item.slug === slug);
      expect(items).toHaveLength(1);
      expect(items[0].date).toBe("2026-10-05");
      expect(items[0].sections.length).toBeGreaterThanOrEqual(4);
      expect(app).toContain(`path="${publicationHref(items[0])}"`);
    }
  );
  it("registers a dedicated paper route and links it from the library", () => {
    expect(app).toContain(
      `path="${paper.landingUrl}" component={BB84PaperPage}`
    );
    expect(
      readFileSync("client/src/pages/ResourcesPage.tsx", "utf8")
    ).toContain("<BB84PublicPreprint />");
  });
  it("keeps manuscript identity and review boundaries visible on the paper page", () => {
    const source = readFileSync("client/src/pages/BB84PaperPage.tsx", "utf8");
    for (const field of [
      "paper.title",
      "paper.reviewNote",
      "paper.scopeNote",
      "paper.correctionNote",
      "paper.sha256",
    ])
      expect(source).toContain(field);
    expect(source).toContain('type="application/pdf"');
    expect(source).toContain("c_min(n) = n");
    expect(source.replace(/\s+/g, " ")).toContain("not settle the general guessing frontier");
  });
});
