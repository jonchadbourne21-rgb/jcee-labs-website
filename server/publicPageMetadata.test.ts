import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyPublicPageMetadata } from "./publicPageMetadata";

const template = readFileSync(
  new URL("../client/index.html", import.meta.url),
  "utf8"
);
const article = "/blog/a-confident-model-still-needs-permission";

describe("metadata in the HTML received by sharing crawlers", () => {
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
