import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) =>
  readFileSync(path.resolve(import.meta.dirname, "pages", name), "utf8");
const home = read("Home.tsx");
const assurance = read("AssurancePage.tsx");
const inquiry = read("EnterprisePartnersPage.tsx");
const technology = read("TechnologyPage.tsx");
const whoThisIsFor = readFileSync(
  path.resolve(import.meta.dirname, "components", "WhoThisIsFor.tsx"),
  "utf8"
);
const editorialCss = readFileSync(
  path.resolve(import.meta.dirname, "editorial-update.css"),
  "utf8"
);
const plain = (source: string) => source.replace(/\s+/g, " ");

describe("buyer-readable public positioning with Assurance Playbook control", () => {
  it("leads with a plain-language accountable-operation promise", () => {
    expect(home).toContain("Keep AI-assisted operations");
    expect(plain(home)).toContain(
      "JCEE Labs helps teams improve consequential AI-assisted workflows with clear ownership, current permission, practical checks, and a record of what actually happened."
    );
    expect(home).toContain('href="#distribution-demo"');
    expect(home).toContain('href="/partners/enterprise"');
    expect(home).toContain("JCEE ASSURANCE");
    expect(home).toContain("PUBLIC REGISTRY");
  });

  it("shows Distribution as a bounded concrete demonstration rather than the company identity", () => {
    expect(home).toContain('id="distribution-demo"');
    expect(home).toContain("DISTRIBUTION REFERENCE IMPLEMENTATION");
    expect(home).toContain("Use customer freight account");
    expect(home).toContain("Freight account not recorded");
    expect(home).toContain("Needs review");
    expect(plain(home)).toContain(
      "A person investigates. The discrepancy does not authorize a change."
    );
    expect(home).toContain("20 / 20");
    expect(home).toContain("Expected synthetic classifications matched");
    expect(home).toContain("0");
    expect(home).toContain("External effects");
    expect(plain(home)).toContain(
      "The point is not the order screen. The point is the control pattern"
    );
    expect(plain(home)).toContain(
      "shadow evaluation is the next commercial gate"
    );
  });

  it("preserves implemented reference software without promoting it to customer evidence", () => {
    expect(home).toContain("VowDurabilityDemo");
    expect(plain(home)).toContain(
      "interactive VOW reference demonstrates one implemented JCEE behavior"
    );
    expect(plain(home)).toContain(
      "not a customer case study, production deployment, or proof of customer ROI"
    );
    expect(plain(home)).toContain(
      "Customer savings and production performance have not yet been established"
    );
  });

  it("makes the first commercial step tangible without overstating maturity", () => {
    for (const phrase of [
      "WORKFLOW ASSURANCE ASSESSMENT",
      "Workflow boundary map",
      "Evidence and authority map",
      "Failure and recovery gaps",
      "Next justified step",
      "Commercial model",
      "DISCUSS ONE WORKFLOW",
    ]) {
      expect(home).toContain(phrase);
    }
    expect(plain(home)).toContain(
      "An assessment is not a certification, deployment, production-readiness promise, or grant of execution authority."
    );
    expect(home).toContain("No SaaS tier is implied.");
  });

  it("puts the buyer journey ahead of internal architecture", () => {
    const hero = home.indexOf('className="hero hybrid-hero"');
    const demo = home.indexOf('id="distribution-demo"');
    const buyer = home.indexOf("<WhoThisIsFor />");
    const assessment = home.indexOf('id="engage"');
    const proof = home.indexOf('id="technology"');
    const reference = home.indexOf('id="working-example"');
    const method = home.indexOf('id="company"');
    const platform = home.indexOf('id="operating-cloud"');
    const progress = home.indexOf("recent-progress");

    for (const index of [
      hero,
      demo,
      buyer,
      assessment,
      proof,
      reference,
      method,
      platform,
      progress,
    ]) {
      expect(index).toBeGreaterThan(-1);
    }

    expect(hero).toBeLessThan(assessment);
    expect(assessment).toBeLessThan(buyer);
    expect(buyer).toBeLessThan(demo);
    expect(demo).toBeLessThan(proof);
    expect(proof).toBeLessThan(reference);
    expect(reference).toBeLessThan(method);
    expect(method).toBeLessThan(platform);
    expect(platform).toBeLessThan(progress);
    expect(home).not.toContain("Make the evidence boundary visible.");
    expect(home).not.toContain('aria-labelledby="workflow-cta"');
  });

  it("makes maturity and the public integration contract explicit", () => {
    for (const phrase of [
      "BUILT / TESTED",
      "AVAILABLE TO SCOPE",
      "NOT YET ESTABLISHED",
      "Workflow Assurance Assessment",
      "generic public SDK or API",
    ]) {
      expect(home).toContain(phrase);
    }
    for (const phrase of [
      "A proposal is not authority",
      "Entitlement is not execution",
      "Missing evidence stays unknown",
      "public semantic contract",
      "system of record",
      "Each arrow is a binding",
    ]) {
      expect(home).toContain(phrase);
      expect(technology).toContain(phrase);
    }
    expect(inquiry).toContain("WORKFLOW ASSURANCE ASSESSMENT");
  });

  it("keeps the Who This Is For surface readable without changing its background or type system", () => {
    expect(whoThisIsFor).toContain("who-this-is-for");
    expect(editorialCss).toContain(".who-this-is-for > h2");
    expect(editorialCss).toContain(".who-this-is-for > p");
    expect(editorialCss).toContain(".who-this-is-for .resource-card h3");
  });

  it("preserves the playbook method and twelve-step assurance loop", () => {
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

  it("keeps the method above implementation mechanisms and preserves the commercial ladder", () => {
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
  });

  it("keeps inquiry human-reviewed, non-confidential, and separate from execution authority", () => {
    expect(inquiry).toContain('buildPartnerInquiryMailto("enterprise"');
    expect(inquiry).toContain("form.reportValidity()");
    expect(inquiry).toContain("This form opens an email draft");
    expect(inquiry).toContain("Do not include credentials");
    expect(plain(inquiry)).toContain(
      "Production changes, software implementation, and deployment remain separately scoped and authorized"
    );
    expect(inquiry).toContain("Make consequential software");
    expect(inquiry).not.toMatch(/fetch\s*\(/);
  });
});
