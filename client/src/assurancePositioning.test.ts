import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(path.resolve(import.meta.dirname, "pages", name), "utf8");
const home = read("Home.tsx");
const assurance = read("AssurancePage.tsx");
const inquiry = read("EnterprisePartnersPage.tsx");
const plain = (source: string) => source.replace(/\s+/g, " ");

describe("buyer-readable public positioning with Assurance Playbook control", () => {
  it("leads with buyer questions while retaining JCEE method and technical routes", () => {
    expect(home).toContain("Know what happened.");
    expect(home).toContain("Know what can happen next.");
    expect(home).toContain('href="/assurance"');
    expect(home).toContain('href="/partners/enterprise"');
    expect(home).toContain("JCEE ASSURANCE");
    expect(home).toContain("PUBLIC REGISTRY");
  });

  it("shows implemented reference software without promoting it to customer evidence", () => {
    expect(home).toContain("VowDurabilityDemo");
    expect(plain(home)).toContain("reference below demonstrates one implemented JCEE behavior");
    expect(plain(home)).toContain("not a customer case study, production deployment, or proof of customer ROI");
    expect(plain(home)).toContain("Customer savings and production performance have not yet been established");
  });

  it("preserves the playbook method and twelve-step assurance loop", () => {
    expect(plain(assurance)).toContain("Hypotheses may be broad. Authority must remain bounded. Evidence decides what can be claimed; policy decides what can be done.");
    expect(assurance).toContain("THE 12-STEP ASSURANCE LOOP");
    for (const step of ["State the consequential question", "Write the disproof recipe", "Separate observations", "Set the boundary", "Emit the receipt"]) {
      expect(assurance).toContain(step);
    }
  });

  it("keeps the method above implementation mechanisms and preserves the commercial ladder", () => {
    for (const layer of ["JCEE Assurance Method", "Assurance Playbook", "Evidence & Judgment", "Authority & Contract", "VOW Runtime", "Adapters & Integrations"]) {
      expect(assurance).toContain(layer);
    }
    for (const offer of ["Public playbook", "Assurance assessment", "Implementation sprint", "Reference tooling", "VOW / assurance software", "Enterprise assurance program"]) {
      expect(assurance).toContain(offer);
    }
    expect(plain(assurance)).toContain("This page does not publish or release the internal working playbook");
  });

  it("keeps Distribution bounded rather than making it the company identity", () => {
    expect(home).toContain('href="/solutions/distribution"');
    expect(plain(home)).toContain("20 of 20 expected order classifications, with zero external effects");
    expect(plain(home)).toContain("shadow evaluation is the next commercial gate");
  });

  it("keeps inquiry human-reviewed, non-confidential, and separate from execution authority", () => {
    expect(inquiry).toContain('buildPartnerInquiryMailto("enterprise"');
    expect(inquiry).toContain("form.reportValidity()");
    expect(inquiry).toContain("This form opens an email draft");
    expect(inquiry).toContain("Do not include credentials");
    expect(plain(inquiry)).toContain("Production changes, software implementation, and deployment remain separately scoped and authorized");
    expect(inquiry).toContain("Make consequential software");
    expect(inquiry).not.toMatch(/fetch\s*\(/);
  });
});
