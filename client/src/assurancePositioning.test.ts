import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Source-level positioning and disclosure checks. These are not browser or delivery evidence.
const read = (name: string) =>
  readFileSync(path.resolve(import.meta.dirname, "pages", name), "utf8");
const home = read("Home.tsx");
const assurance = read("AssurancePage.tsx");
const inquiry = read("EnterprisePartnersPage.tsx");
const plain = (source: string) => source.replace(/\s+/g, " ");

describe("playbook-baselined public positioning", () => {
  it("leads with a plain-language accountable-operation promise", () => {
    expect(home).toContain("JCEE ASSURANCE METHOD");
    expect(home).toContain("Keep AI-assisted work");
    expect(plain(home)).toContain(
      "JCEE is developing methods and software that connect operational actions to clear permissions, reviewable evidence, and human control."
    );
    expect(home).toContain('href="#distribution-demo"');
    expect(home).toContain('href="/partners/enterprise"');
  });

  it("puts a bounded Distribution demonstration directly on the homepage", () => {
    expect(home).toContain('id="distribution-demo"');
    expect(home).toContain("SYNTHETIC WORKFLOW DEMONSTRATION");
    expect(home).toContain("Use customer freight account");
    expect(home).toContain("Freight account not recorded");
    expect(home).toContain("Needs review");
    expect(plain(home)).toContain(
      "No external change. A person investigates the discrepancy."
    );
    expect(plain(home)).toContain(
      "Distribution demonstrates JCEE; it does not define JCEE's limits."
    );
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

  it("preserves the baseline doctrine and twelve-step operating loop", () => {
    expect(plain(assurance)).toContain(
      "Hypotheses may be broad. Authority must remain bounded. Evidence decides what can be claimed; policy decides what can be done."
    );
    expect(assurance).toContain("THE 12-STEP ASSURANCE LOOP");
    for (const step of [
      "State the consequential question",
      "Write the disproof recipe",
      "Separate observations",
      "Set the boundary",
      "Emit the receipt",
    ]) {
      expect(assurance).toContain(step);
    }
  });

  it("keeps the playbook above implementation mechanisms", () => {
    for (const layer of [
      "JCEE Assurance Method",
      "Assurance Playbook",
      "Evidence & Judgment",
      "Authority & Contract",
      "VOW Runtime",
      "Adapters & Integrations",
    ]) {
      expect(assurance).toContain(layer);
    }
    expect(plain(home)).toContain("The method sits above the mechanisms");
  });

  it("uses the baseline commercial ladder without publishing the working playbook", () => {
    for (const offer of [
      "Public playbook",
      "Assurance assessment",
      "Implementation sprint",
      "Reference tooling",
      "VOW / assurance software",
      "Enterprise assurance program",
    ]) {
      expect(assurance).toContain(offer);
    }
    expect(plain(assurance)).toContain(
      "This page does not publish or release the internal working playbook"
    );
    expect(assurance).not.toMatch(/href=["'][^"']*playbook[^"']*\.(pdf|docx|zip)/i);
  });

  it("preserves bounded technical status and Distribution's next gate", () => {
    expect(home).toContain('href="/solutions/distribution"');
    expect(plain(home)).toContain(
      "20 of 20 expected order classifications, with zero external effects"
    );
    expect(plain(home)).toContain("shadow evaluation is the next commercial gate");
    expect(home).toContain("PUBLIC REGISTRY · REVIEWED SEPTEMBER 14, 2026");
    expect(assurance).toContain("REVIEWED SEPTEMBER 14, 2026");
  });

  it("uses enterprise material as translation rather than a new governing strategy", () => {
    expect(assurance).toContain("The receipt is the product of the decision");
    expect(inquiry).toContain("Start where uncertainty already has an operational cost");
    expect(inquiry).toContain("A time-bounded review of one AI workflow");
    expect(inquiry).toContain("Make consequential software");
    expect(inquiry).not.toContain("$5,000");
  });

  it("keeps inquiry submission human-reviewed, bounded, and non-confidential", () => {
    expect(inquiry).toContain('buildPartnerInquiryMailto("enterprise"');
    expect(inquiry).toContain("form.reportValidity()");
    expect(inquiry).toContain("This form opens an email draft");
    expect(inquiry).toContain("Do not include credentials");
    expect(plain(inquiry)).toContain(
      "Production changes, software implementation, and deployment remain separately scoped and authorized"
    );
    expect(inquiry).not.toMatch(/fetch\s*\(/);
  });
});
