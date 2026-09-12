import { describe, expect, it } from "vitest";
import { buildPartnerInquiryMailto } from "@/lib/partnerInquiry";

const baseFields = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  organization: "Analytical Engines",
  role: "CTO",
  focus: "Technical evaluation",
  timeline: "Q4",
  primaryLabel: "System and consequential action",
  primary: "An automated workflow changes production state.",
  evidenceLabel: "Current controls and evidence",
  evidence: "Signed logs exist.",
  outcomeLabel: "Decision or outcome required",
  outcome: "Decide whether to proceed with integration.",
};

describe("partner inquiry routing", () => {
  it("routes enterprise inquiries with an enterprise tag and operational brief", () => {
    const url = buildPartnerInquiryMailto("enterprise", baseFields);

    expect(url).toMatch(/^mailto:support\+enterprise@jceelabs\.com\?/);
    const query = new URLSearchParams(url.split("?")[1]);
    expect(query.get("subject")).toBe("[ENTERPRISE INQUIRY] Analytical Engines");
    expect(query.get("body")).toContain("Routing: ENTERPRISE");
    expect(query.get("body")).toContain("System and consequential action:");
    expect(query.get("body")).toContain("Signed logs exist.");
  });

  it("routes research inquiries with a research tag and claim brief", () => {
    const url = buildPartnerInquiryMailto("research", {
      ...baseFields,
      focus: "Independent replication",
      primaryLabel: "Research question or claim",
      primary: "The protocol preserves causal order under retries.",
      evidenceLabel: "Available artifacts and evidence",
      evidence: "Protocol, traces, and reference implementation.",
      outcomeLabel: "Reproduction or publication outcome",
      outcome: "Independent reproduction and technical report.",
    });

    expect(url).toMatch(/^mailto:support\+research@jceelabs\.com\?/);
    const query = new URLSearchParams(url.split("?")[1]);
    expect(query.get("subject")).toBe("[RESEARCH INQUIRY] Analytical Engines");
    expect(query.get("body")).toContain("Routing: RESEARCH");
    expect(query.get("body")).toContain("Research question or claim:");
    expect(query.get("body")).toContain("Independent reproduction and technical report.");
  });

  it("keeps optional omissions explicit", () => {
    const url = buildPartnerInquiryMailto("enterprise", {
      ...baseFields,
      role: "",
      focus: "",
      timeline: "",
      evidence: "",
    });

    const body = new URLSearchParams(url.split("?")[1]).get("body");
    expect(body).toContain("Role: Not provided");
    expect(body).toContain("Focus: Not selected");
    expect(body).toContain("Current controls and evidence:\nNot provided");
  });
});
