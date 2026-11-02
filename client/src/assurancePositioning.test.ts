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
  it("leads with the customer workflow and a concrete inquiry", () => {
    expect(plain(home)).toContain("Put AI to work.");
    expect(plain(home)).toContain("Stay in control.");
    expect(home).toContain('href="/consultation"');
    expect(home).toContain('href="/capabilities/infrastructure#deliverables"');
    expect(home).not.toContain("JCEE Distribution");
  });
  it("distinguishes the illustration from qualified customer results", () => {
    expect(home).toContain("<EvidenceTrace />");
    expect(plain(home)).toContain(
      "performs no external action, runs no VOW engine"
    );
    expect(plain(home)).toContain("creates no qualification receipt");
    expect(plain(home)).toContain(
      "not a customer result or a claim of a deployed identity-system integration"
    );
    expect(plain(home)).toContain(
      "Production readiness, customer savings, and payment safety have not been established"
    );
  });
  it("keeps implementation scoped and public evidence reachable", () => {
    expect(plain(home)).toContain(
      "require their own written scope and authorization"
    );
    expect(home).toContain('href="/technology#current-integration"');
    expect(home).toContain('href="/registry"');
    expect(home).toContain("Written boundary map");
  });
  it("presents the problem, customer uses, offer, evidence and inquiry in order", () => {
    const ids = ["story", "fit", "services", "evidence", "consultation"];
    const positions = ids.map(id => home.indexOf(`id="${id}"`));
    for (const position of positions) expect(position).toBeGreaterThan(-1);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
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
