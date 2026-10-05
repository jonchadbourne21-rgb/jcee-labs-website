import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyPublicPageMetadata } from "./publicPageMetadata";
import pageSeo from "../client/src/content/pageSeo.json";

const template = readFileSync(
  new URL("../client/index.html", import.meta.url),
  "utf8"
);
const article = "/blog/a-confident-model-still-needs-permission";

describe("metadata in the HTML received by sharing crawlers", () => {
  it("keeps the seven page titles and descriptions within the requested editorial lengths", () => {
    for (const [route, meta] of Object.entries(pageSeo)) {
      expect(meta.title.length, route).toBeGreaterThanOrEqual(50);
      expect(meta.title.length, route).toBeLessThanOrEqual(60);
      expect(meta.description.length, route).toBeGreaterThanOrEqual(145);
      expect(meta.description.length, route).toBeLessThanOrEqual(160);
    }
  });

  it("emits one article schema and publication date when metadata is applied twice", () => {
    const once = applyPublicPageMetadata(
      template,
      "/blog/what-is-an-evidence-boundary"
    );
    const twice = applyPublicPageMetadata(
      once,
      "/blog/what-is-an-evidence-boundary"
    );
    expect(twice.match(/id="public-schema"/g)).toHaveLength(1);
    expect(twice.match(/property="article:published_time"/g)).toHaveLength(1);
    const schema = JSON.parse(
      twice.match(
        /<script id="public-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/
      )![1]
    );
    expect(schema["@type"]).toBe("Article");
    expect(schema.author.name).toBe("JCEE Labs");
    expect(schema.datePublished).toBe("2026-10-05");
    expect(schema.dateModified).toBeUndefined();
  });

  it("serves the article identity before JavaScript, with a canonical URL free of query parameters", () => {
    const html = applyPublicPageMetadata(
      template,
      `${article}/?utm_source=share`
    );
    expect(html).toContain(
      "<title>A Confident Model Still Needs Permission — JCEE Labs</title>"
    );
    expect(html).toContain(
      `<meta property="og:url" content="https://jceelabs.com${article}"`
    );
    expect(html).toContain(
      `<link rel="canonical" href="https://jceelabs.com${article}"`
    );
    expect(html).toContain('property="og:type" content="article"');
    expect(html).toContain(
      'property="article:published_time" content="2026-09-29T00:00:00Z"'
    );
    expect(html).not.toContain("utm_source");
  });

  it("keeps the original dates of older articles and preserves research-field metadata", () => {
    expect(
      applyPublicPageMetadata(template, "/blog/the-work-nobody-sees")
    ).toContain(
      'property="article:published_time" content="2026-09-14T00:00:00Z"'
    );
    expect(applyPublicPageMetadata(template, "/research/fields")).toContain(
      "<title>Research Fields — JCEE Labs</title>"
    );
  });

  it("does not promote unknown paths or use them as metadata", () => {
    expect(
      applyPublicPageMetadata(template, "/unknown/<script>alert(1)</script>")
    ).toBe(template);
    const home = applyPublicPageMetadata(template, "/");
    expect(home).toContain('property="og:type" content="website"');
    expect(home).not.toContain('property="article:published_time"');
  });
});
