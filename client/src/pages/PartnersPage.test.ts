import { describe, expect, it } from "vitest";
import { buildPartnerInquiryMailto } from "./PartnersPage";

describe("partner inquiry mailto", () => {
  it("builds a complete encoded inquiry for JCEE Labs", () => {
    const url = buildPartnerInquiryMailto({
      name: "Ada Lovelace",
      email: "ada@example.com",
      company: "Analytical Engines",
      role: "CTO",
      engagement: "Technical evaluation",
      timeline: "Q4",
      problem: "A consequential workflow needs durable execution evidence.",
      evidence: "Signed logs exist, but recovery lineage is incomplete.",
    });

    expect(url).toMatch(/^mailto:support@jceelabs\.com\?/);
    const query = new URLSearchParams(url.split("?")[1]);
    expect(query.get("subject")).toBe("Partnership inquiry — Analytical Engines");
    expect(query.get("body")).toContain("Work email: ada@example.com");
    expect(query.get("body")).toContain("Engagement: Technical evaluation");
    expect(query.get("body")).toContain("Signed logs exist, but recovery lineage is incomplete.");
  });

  it("supplies explicit fallback labels for optional fields", () => {
    const url = buildPartnerInquiryMailto({
      name: "Grace Hopper",
      email: "grace@example.com",
      company: "Compiler Systems",
      role: "",
      engagement: "",
      timeline: "",
      problem: "We need to verify a transition boundary.",
      evidence: "",
    });

    const body = new URLSearchParams(url.split("?")[1]).get("body");
    expect(body).toContain("Role: Not provided");
    expect(body).toContain("Engagement: Not selected");
    expect(body).toContain("Current evidence or control boundary:\nNot provided");
  });
});
