import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(path.resolve(import.meta.dirname, "pages", name), "utf8");
const home = read("Home.tsx");
const assurance = read("AssurancePage.tsx");
const inquiry = read("EnterprisePartnersPage.tsx");
const plain = (source: string) => source.replace(/\s+/g, " ");

describe("buyer-readable public positioning with Assurance Playbook control", () => {
  it("leads with a plain-language accountable-operation promise", () => {
    expect(home).toContain("Keep AI-assisted work");
    expect(plain(home)).toContain(
      "JCEE is developing methods and software that connect operational actions to clear permissions, reviewable evidence, and human control."
    );
    expect(home).toContain('href="#distribution-demo"');
    expect(home).toContain('href="/partners/enterprise"');
    expect(home).toContain("JCEE ASSURANCE");
    expect(home).toContain("PUBLIC REGISTRY");
  });

  it("shows Distribution as a bounded concrete demonstration rather than the company identity", () => {
    expect(home).toContain('id="distribution-demo"');
    expect(home).toContain("SYNTHETIC WORKFLOW DEMONSTRATION");
    expect(home).toContain("Use customer freight account");
    expect(home).toContain("Freight account not recorded");
    expect(home).toContain("Needs review");
    expect(plain(home)).toContain(
      "A person investigates. The discrepancy does not authorize a change."
    );
    expect(plain(home)).toContain(
      "20 / 20 expected synthetic classifications · 0 external effects"
    );
    expect(plain(home)).toContain(
      "Distribution demonstrates JCEE; it does not define JCEE"
    );
    expect(plain(home)).toContain("shadow evaluation is the next commercial gate");
  });

  it("preserves implemented reference software without promoting it to customer evidence", () => {
    expect(home).toContain("VowDurabilityDemo");
    expect(plain(home)).toContain("interactive VOW reference demonstrates one implemented JCEE behavior");
    expect(plain(home)).toContain("not a customer case study, production deployment, or proof of customer ROI");
    expect(plain(home)).toContain("Customer savings and production performance have not yet been established");
  });

  it("makes the first commercial step explicit without overstating maturity", () => {
    for (const phrase of [
      "Who it is for",
      "What happens",
      "What you receive",
      "DISCUSS AN ASSURANCE ASSESSMENT",
    ]) {
      expect(home).toContain(phrase);
    }
    expect(plain(home)).toContain(
      "An assurance assessment is not a certification, deployment, or promise of production readiness."
    );
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
