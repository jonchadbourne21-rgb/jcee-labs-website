import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildConsultationDraft } from "./lib/consultationDraft";

const base = { name: "Avery & Sam", email: "avery@example.com", organization: "Example & Co", service: "AI and software architecture", summary: "A retry needs a current permission check.\nNo private records attached." };

describe("free consultation preview", () => {
  it("uses the existing enterprise recipient and safely encoded email draft", () => {
    const result = buildConsultationDraft(base);
    const url = new URL(result.mailto);
    expect(url.pathname).toBe("support+enterprise@jceelabs.com");
    expect(url.searchParams.get("subject")).toBe(result.subject);
    expect(url.searchParams.get("body")).toBe(result.body);
    expect(result.body).toContain(base.name);
    expect(result.body).toContain(base.summary);
  });
  it("separates the free first call from paid work and execution authority", () => {
    const { body } = buildConsultationDraft(base);
    expect(body).toContain("Free first call: 10–30 minutes.");
    expect(body).toContain("does not book an appointment");
    expect(body).toContain("does not authorize paid work, implementation, or production changes");
  });
  it("accepts an optional company and service interest without manufacturing a booking", () => {
    const result = buildConsultationDraft({ ...base, organization: "", service: "" });
    expect(result.body).toContain("Company: Not provided");
    expect(result.body).toContain("Service interest: Not selected");
    expect(result.subject).not.toContain("confirmed");
  });
  it("keeps the semantic sequence and all proof boundaries on the homepage", () => {
    const home = readFileSync(path.join(import.meta.dirname, "pages/Home.tsx"), "utf8");
    expect(home).toContain("Claim + evidence → authority → consequence → recovery → system of record → receipt.");
    for (const label of ["BUILT / TESTED", "AVAILABLE TO SCOPE", "NOT YET ESTABLISHED", "Customer ROI", "partial and held", "not physically validated", "not a customer deployment"]) expect(home).toContain(label);
    for (const id of ["engage", "fit", "distribution-demo", "technology", "working-example", "operating-cloud", "evidence-frontier", "company", "charter"]) expect(home).toContain(`id="${id}"`);
  });
  it("retains the synthetic Distribution counts and publication dates", () => {
    const home = readFileSync(path.join(import.meta.dirname, "pages/Home.tsx"), "utf8");
    expect(home).toContain("20 / 20");
    expect(home).toContain("Result categories exercised");
    expect(home).toContain("External effects");
    expect(home).toContain('dateTime="2026-09-14"');
    expect(home).toContain("publicationDate(item.date)");
  });
});
