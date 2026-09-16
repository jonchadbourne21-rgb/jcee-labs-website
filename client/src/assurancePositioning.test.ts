import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Source-level copy and disclosure regression checks, not browser or delivery evidence.
const read = (name: string) =>
  readFileSync(path.resolve(import.meta.dirname, "pages", name), "utf8");
const home = read("Home.tsx");
const assurance = read("AssurancePage.tsx");
const inquiry = read("EnterprisePartnersPage.tsx");
const plain = (source: string) => source.replace(/\s+/g, " ");

describe("assurance-first public positioning", () => {
  it("leads with an assessment and an existing method route", () => {
    expect(home).toContain("AI WORKFLOW ASSURANCE");
    expect(home).toContain("Discuss an assessment");
    expect(home).toContain('href="/partners/enterprise"');
    expect(home).toContain('href="/assurance"');
  });

  it("preserves the Distribution result and its next gate", () => {
    expect(home).toContain('href="/solutions/distribution"');
    expect(plain(home)).toContain("20 of 20 expected order classifications, with zero external effects");
    expect(plain(home)).toContain("shadow evaluation is the next commercial gate");
    expect(plain(home)).toContain("Customer savings and production integration remain to be demonstrated");
  });

  it("does not turn copy edits into new technical verification dates", () => {
    expect(home).toContain("PUBLIC REGISTRY · REVIEWED SEPTEMBER 14, 2026");
    expect(assurance).toContain("REVIEWED SEPTEMBER 14, 2026");
    expect(assurance).toContain("Independent third-party certification");
    expect(assurance).toContain("NOT CLAIMED");
  });

  it("describes the offer without releasing private artifacts or licensing code", () => {
    expect(assurance).toContain("Consequential Workflow Assessment");
    expect(plain(assurance)).toContain("does not release the full playbook or private code");
    expect(plain(assurance)).toContain("grant a software license");
    expect(assurance).not.toMatch(/href=["'][^"']*playbook[^"']*\.(pdf|docx|zip)/i);
  });

  it("names assessment deliverables without promising production changes", () => {
    for (const title of ["Assurance Boundary Report", "Failure Map", "Evidence Architecture", "Prioritized Control Plan"]) {
      expect(inquiry).toContain(title);
    }
    expect(plain(inquiry)).toContain("Production changes and implementation are separately scoped and authorized");
    expect(inquiry).toContain("where existing native controls are sufficient");
  });

  it("keeps inquiry submission human-reviewed and non-confidential", () => {
    expect(inquiry).toContain('buildPartnerInquiryMailto("enterprise"');
    expect(inquiry).toContain("form.reportValidity()");
    expect(inquiry).toContain("This form opens an email draft");
    expect(inquiry).toContain("Do not include credentials");
    expect(inquiry).not.toMatch(/fetch\s*\(/);
  });
});
