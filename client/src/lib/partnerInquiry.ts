export type PartnerInquiryRoute = "enterprise" | "research";

export type PartnerInquiryPayload = {
  name: string;
  email: string;
  organization: string;
  role: string;
  focus: string;
  timeline: string;
  primaryLabel: string;
  primary: string;
  evidenceLabel: string;
  evidence: string;
  outcomeLabel: string;
  outcome: string;
};

const routeConfig = {
  enterprise: {
    recipient: "support+enterprise@jceelabs.com",
    subject: "[ENTERPRISE INQUIRY]",
    heading: "JCEE Labs enterprise partnership inquiry",
  },
  research: {
    recipient: "support+research@jceelabs.com",
    subject: "[RESEARCH INQUIRY]",
    heading: "JCEE Labs research collaboration inquiry",
  },
} satisfies Record<PartnerInquiryRoute, {
  recipient: string;
  subject: string;
  heading: string;
}>;

export function buildPartnerInquiryMailto(
  route: PartnerInquiryRoute,
  fields: PartnerInquiryPayload,
) {
  const config = routeConfig[route];
  const organization = fields.organization.trim() || "Organization";
  const subject = `${config.subject} ${organization}`;
  const body = [
    config.heading,
    `Routing: ${route.toUpperCase()}`,
    "",
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Organization: ${organization}`,
    `Role: ${fields.role || "Not provided"}`,
    `Focus: ${fields.focus || "Not selected"}`,
    `Timeline: ${fields.timeline || "Not provided"}`,
    "",
    `${fields.primaryLabel}:`,
    fields.primary,
    "",
    `${fields.evidenceLabel}:`,
    fields.evidence || "Not provided",
    "",
    `${fields.outcomeLabel}:`,
    fields.outcome,
  ].join("\n");

  return `mailto:${config.recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
