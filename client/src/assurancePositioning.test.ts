import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) =>
  readFileSync(path.resolve(import.meta.dirname, "pages", name), "utf8");
const home = read("Home.tsx");
const product = readFileSync(
  path.resolve(import.meta.dirname, "components", "ProductOverview.tsx"),
  "utf8"
);
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
    expect(plain(product)).toContain("Intelligence that leaves receipts.");
    expect(home).not.toContain('id="orbital-study"');
    expect(home.indexOf("<ProductOverview />")).toBeLessThan(home.indexOf('id="story"'));
    expect(home).toContain('href="/consultation"');
    expect(product).toContain('href="/solutions"');
    expect(home).not.toContain("JCEE Distribution");
  });
  it("labels the illustrative receipt and keeps one evidence note on the page", () => {
    expect(product).toContain('data-demo="illustrative"');
    expect(product).toContain("NOT A LIVE RECEIPT");
    expect(plain(home)).toContain("Integrations are tested for your workflow before production use.");
    expect(plain(home)).toContain("Our published tests cover specific configurations.");
  });
  it("keeps implementation scoped and public evidence reachable", () => {
    expect(plain(home)).toContain("paid work follows an agreed scope");
    expect(home).toContain('href="/registry"');
    expect(plain(product)).toContain("written findings, acceptance criteria, and a practical next-step plan");
  });
  it("presents the offer, capabilities, problem, customer uses and inquiry in order", () => {
    const tokens = ["<ProductOverview />", "<CapabilityCatalog />", 'id="story"', 'id="fit"', 'id="consultation"', 'id="evidence"'];
    const positions = tokens.map(token => home.indexOf(token));
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

  it("sends enterprise inquiries through the one consultation path, separate from execution authority", () => {
    expect(inquiry).toContain('href="/consultation"');
    expect(inquiry).not.toContain('buildPartnerInquiryMailto("enterprise"');
    expect(plain(inquiry)).toContain(
      "Production changes, software implementation, and deployment remain separately scoped and authorized"
    );
    expect(inquiry).toContain("Make high-impact software");
    expect(inquiry).not.toMatch(/fetch\s*\(/);
  });
});
