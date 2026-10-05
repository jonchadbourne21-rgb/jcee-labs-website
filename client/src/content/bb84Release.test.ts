import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BB84PublicPreprint from "../components/BB84PublicPreprint";
import { bb84PublicRelease as paper } from "./bb84Release";

const publicDir = resolve(
  process.cwd(),
  "client/public/research/bb84-communication"
);
const standaloneHtml = readFileSync(resolve(publicDir, "index.html"), "utf8");
const render = () => renderToStaticMarkup(createElement(BB84PublicPreprint));

describe("BB84 public preprint — R146 release boundary", () => {
  it("pins the exact authorized release, external URLs, and checksum", () => {
    expect(paper.record).toBe("R146");
    expect(paper.kind).toBe("Public preprint");
    expect(paper.version).toBe("v0.4-P2");
    expect(paper.releaseStatus).toBe(
      "PUBLIC_PREPRINT_V0.4-P2_RELEASED / ACCEPTED_CLAIMS_FROZEN / PUBLIC_ACCESS_AND_BUTTONS_VERIFIED / NO_AUTOMATIC_NARROWING / GENERAL_FRONTIER_OPEN"
    );
    expect(paper.landingUrl).toBe("/research/bb84-communication");
    expect(paper.pdfUrl).toBe(
      "/research/bb84-communication/BB84_Public_Release_v0.4-P2.pdf"
    );
    expect(paper.sha256).toBe(
      "63e3a02f11cce223d4ff803f136baace51ee5839b04d0b04abec737910b4da20"
    );
  });

  it("renders both public links with safe new-tab attributes", () => {
    const html = render();
    expect(html).toContain(`href="${paper.landingUrl}"`);
    expect(html).toContain(`href="${paper.pdfUrl}"`);
    expect(html).toContain("Read public preprint");
    expect(html).toContain("Download PDF");
    const links = html.match(/<a\b[^>]*>/g) ?? [];
    expect(links).toHaveLength(3);
    for (const link of links) {
      expect(link).toContain('target="_blank"');
      expect(link).toContain('rel="noopener noreferrer"');
    }
  });

  it("keeps the review status and unresolved cases visible outside details", () => {
    const visible = render().split("<details")[0];
    expect(visible).toContain(
      "No independent human expert review was obtained."
    );
    expect(visible).toContain("not a peer-reviewed publication");
    expect(visible).toContain("general one-message interior frontier");
    expect(visible).toContain("interactive near-full recovery for n ≥ 3");
    expect(visible).toContain(
      "exact physical one-message (3,1) case remain open"
    );
    expect(visible).toContain("P0.45 R1 remains on hold");
  });

  it("exposes the release identity and full digest without fixed-width overflow", () => {
    const html = render();
    expect(html).toContain(paper.version);
    expect(html).toContain(paper.sha256);
    expect(html).toContain("overflow-wrap:anywhere");
    expect(html).toContain(paper.correctionNote);
    expect(html).not.toMatch(/first-ever|new theorem|novel result/i);
  });

  it("verifies the already committed PDF bytes against the authorized hash", () => {
    const bytes = readFileSync(
      resolve(publicDir, "BB84_Public_Release_v0.4-P2.pdf")
    );
    expect(bytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(paper.sha256);
  });

  it("keeps the existing standalone reader on the same release", () => {
    expect(standaloneHtml).toContain("Public preprint v0.4-P2");
    expect(standaloneHtml).not.toContain("v0.4-P1.1");
    expect(standaloneHtml).not.toContain("BB84_Public_Release_v0.4-P1.pdf");
    expect(standaloneHtml).toContain(
      `href="https://jceelabs.com${paper.landingUrl}"`
    );
    expect(standaloneHtml).toContain(paper.sha256);
    expect(standaloneHtml).toContain(
      "No independent human expert review was obtained."
    );
  });

  it("mounts the card on the existing Research publications surface", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/ResearchPage.tsx"),
      "utf8"
    );
    expect(source).toContain(
      'import BB84PublicPreprint from "@/components/BB84PublicPreprint"'
    );
    expect(source.match(/<BB84PublicPreprint\s*\/>/g)).toHaveLength(1);
    expect(source.indexOf("<BB84PublicPreprint />")).toBeGreaterThan(
      source.indexOf('id="papers-title"')
    );
  });
});
