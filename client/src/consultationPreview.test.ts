import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildConsultationDraft } from "./lib/consultationDraft";

const base = {
  name: "Avery & Sam",
  email: "avery@example.com",
  organization: "Example & Co",
  service: "AI and software architecture",
  summary:
    "A retry needs a current permission check.\nNo private records attached.",
};

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
    expect(body).toContain(
      "does not authorize paid work, implementation, or production changes"
    );
  });
  it("accepts an optional company and service interest without manufacturing a booking", () => {
    const result = buildConsultationDraft({
      ...base,
      organization: "",
      service: "",
    });
    expect(result.body).toContain("Company: Not provided");
    expect(result.body).toContain("Service interest: Not selected");
    expect(result.subject).not.toContain("confirmed");
  });
  it("keeps the customer story linked to an accurately described email inquiry", () => {
    const home = readFileSync(
      path.join(import.meta.dirname, "pages/Home.tsx"),
      "utf8"
    );
    const inquiry = readFileSync(
      path.join(import.meta.dirname, "pages/ConsultationPreview.tsx"),
      "utf8"
    );
    expect(home).toContain('href="/consultation"');
    expect(inquiry).toContain("Prepare email draft");
    expect(inquiry).toContain("Nothing is submitted");
    expect(inquiry).toContain("does not confirm an appointment");
  });
});
