export type ConsultationFields = {
  name: string;
  email: string;
  organization: string;
  service: string;
  summary: string;
};

export const consultationServices = [
  "AI and software architecture",
  "Custom applications and iOS/mobile",
  "Software testing and verification",
  "Technical research and systems analysis",
  "Workflow Assurance Assessment",
] as const;

export function buildConsultationDraft(fields: ConsultationFields) {
  const company = fields.organization.trim();
  const subject = `[FREE CONSULTATION REQUEST] ${company || fields.name.trim()}`;
  const body = [
    "JCEE Labs — first consultation request",
    "Free first call: 10–30 minutes.",
    "",
    `Name: ${fields.name.trim()}`,
    `Email: ${fields.email.trim()}`,
    `Company: ${company || "Not provided"}`,
    `Service interest: ${fields.service || "Not selected"}`,
    "",
    "Non-confidential project summary:",
    fields.summary.trim(),
    "",
    "This request does not book an appointment and does not authorize paid work, implementation, or production changes.",
    "Any assessment or delivery engagement requires a separately agreed written scope and commercial terms.",
  ].join("\n");
  return {
    subject,
    body,
    mailto: `mailto:support+enterprise@jceelabs.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}
