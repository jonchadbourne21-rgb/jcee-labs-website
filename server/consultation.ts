import express, { type Express, type Request, type Response } from "express";

/**
 * Free-consultation request intake.
 *
 * The only public write endpoint on the marketing site. It is registered before
 * the legacy API boundary, accepts one small JSON body, and forwards a plain-text
 * email to the sales inbox through Resend's HTTP API. When the sending service is
 * not configured it answers 503 so the page can fall back to an email draft.
 *
 * Environment:
 *   RESEND_API_KEY        Resend API key (required to send)
 *   CONSULTATION_FROM     Verified sender, e.g. "JCEE WorldLab <website@jceelabs.com>" (required to send)
 *   CONSULTATION_TO       Recipient inbox (default sales@jceelabs.com)
 */
export const CONSULTATION_PATH = "/api/consultation";
export const DEFAULT_CONSULTATION_INBOX = "sales@jceelabs.com";

const LIMITS = { name: 100, email: 254, organization: 150, service: 120, summary: 2000 } as const;
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export type ConsultationRequest = {
  name: string;
  email: string;
  organization: string;
  service: string;
  summary: string;
};

type Validation = { ok: true; value: ConsultationRequest } | { ok: false; field: string };

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim().slice(0, max + 1) : "";
const oneLine = (value: string) => value.replace(/[\r\n\t]+/g, " ").trim();

export function validateConsultation(body: unknown): Validation {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const value: ConsultationRequest = {
    name: oneLine(clean(input.name, LIMITS.name)),
    email: oneLine(clean(input.email, LIMITS.email)),
    organization: oneLine(clean(input.organization, LIMITS.organization)),
    service: oneLine(clean(input.service, LIMITS.service)),
    summary: clean(input.summary, LIMITS.summary),
  };
  if (value.name.length < 1 || value.name.length > LIMITS.name) return { ok: false, field: "name" };
  if (!EMAIL.test(value.email) || value.email.length > LIMITS.email) return { ok: false, field: "email" };
  if (value.organization.length > LIMITS.organization) return { ok: false, field: "organization" };
  if (value.service.length > LIMITS.service) return { ok: false, field: "service" };
  if (value.summary.length < 10 || value.summary.length > LIMITS.summary) return { ok: false, field: "summary" };
  return { ok: true, value };
}

export function formatConsultationEmail(request: ConsultationRequest) {
  const company = request.organization || "Not provided";
  const subject = `Consultation request: ${request.organization || request.name}`.slice(0, 160);
  const text = [
    "New free-consultation request from jceelabs.com",
    "",
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    `Company: ${company}`,
    `Service interest: ${request.service || "Not selected"}`,
    "",
    "What they are trying to build or resolve:",
    request.summary,
    "",
    "Reply to this email to answer the sender directly.",
  ].join("\n");
  return { subject, text };
}

function clientKey(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim();
  return first || req.socket.remoteAddress || "unknown";
}

export function createConsultationHandler(options: {
  fetchImpl?: typeof fetch;
  now?: () => number;
  env?: NodeJS.ProcessEnv;
} = {}) {
  const hits = new Map<string, number[]>();
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const env = () => options.env ?? process.env;

  return async (req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    const body = (req.body ?? {}) as Record<string, unknown>;
    // Honeypot: real visitors never see or fill this field.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      res.status(200).json({ ok: true });
      return;
    }
    const checked = validateConsultation(body);
    if (!checked.ok) {
      res.status(400).json({ ok: false, error: "invalid", field: checked.field });
      return;
    }
    const key = clientKey(req);
    const recent = (hits.get(key) ?? []).filter(t => now() - t < WINDOW_MS);
    if (recent.length >= MAX_PER_WINDOW) {
      res.status(429).json({ ok: false, error: "rate_limited" });
      return;
    }
    const { RESEND_API_KEY, CONSULTATION_FROM, CONSULTATION_TO } = env();
    if (!RESEND_API_KEY || !CONSULTATION_FROM) {
      res.status(503).json({ ok: false, error: "unavailable", fallback: "email" });
      return;
    }
    recent.push(now());
    hits.set(key, recent);
    const { subject, text } = formatConsultationEmail(checked.value);
    try {
      const response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: CONSULTATION_FROM,
          to: [CONSULTATION_TO || DEFAULT_CONSULTATION_INBOX],
          reply_to: checked.value.email,
          subject,
          text,
        }),
      });
      if (!response.ok) {
        console.warn(`[Consultation] Email service responded ${response.status}`);
        res.status(502).json({ ok: false, error: "send_failed", fallback: "email" });
        return;
      }
      res.status(200).json({ ok: true });
    } catch (error) {
      console.warn("[Consultation] Email service unreachable", error instanceof Error ? error.message : error);
      res.status(502).json({ ok: false, error: "send_failed", fallback: "email" });
    }
  };
}

/** Registers only POST /api/consultation; every other /api path stays behind the boundary. */
export function registerConsultationRoute(app: Express) {
  app.post(CONSULTATION_PATH, express.json({ limit: "16kb" }), createConsultationHandler());
}
