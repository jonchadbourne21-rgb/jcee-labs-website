import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONSULTATION_PATH,
  createConsultationHandler,
  formatConsultationEmail,
  registerConsultationRoute,
  validateConsultation,
} from "./consultation";
import { websiteApiBoundary } from "./_core/apiBoundary";

const servers: ReturnType<ReturnType<typeof express>["listen"]>[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve()))));
});
async function serve(app: ReturnType<typeof express>) {
  const server = app.listen(0, "127.0.0.1"); servers.push(server);
  await new Promise<void>(resolve => server.on("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing address");
  return `http://127.0.0.1:${address.port}`;
}
const valid = {
  name: "Avery Lee",
  email: "avery@example.com",
  organization: "Example Supply",
  service: "Workflow Assurance Assessment",
  summary: "Order changes cross our ERP and CRM and timeouts leave us checking by hand.",
};
const configured = { RESEND_API_KEY: "re_test", CONSULTATION_FROM: "JCEE WorldLab <website@jceelabs.com>" } as NodeJS.ProcessEnv;
async function appWith(handler: ReturnType<typeof createConsultationHandler>) {
  const app = express();
  app.post(CONSULTATION_PATH, express.json({ limit: "16kb" }), handler);
  return serve(app);
}
const post = (base: string, body: unknown, headers: Record<string, string> = {}) =>
  fetch(`${base}${CONSULTATION_PATH}`, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });

describe("consultation request intake", () => {
  it("validates required fields and rejects malformed email", () => {
    expect(validateConsultation(valid).ok).toBe(true);
    expect(validateConsultation({ ...valid, name: "" })).toEqual({ ok: false, field: "name" });
    expect(validateConsultation({ ...valid, email: "not-an-email" })).toEqual({ ok: false, field: "email" });
    expect(validateConsultation({ ...valid, summary: "short" })).toEqual({ ok: false, field: "summary" });
    expect(validateConsultation({ ...valid, summary: "x".repeat(2001) })).toEqual({ ok: false, field: "summary" });
  });

  it("keeps the subject on one line", () => {
    const { subject } = formatConsultationEmail({ ...valid, organization: "Acme\nBcc: x@y.z" } as never);
    expect(subject).not.toMatch(/[\r\n]/);
    const checked = validateConsultation({ ...valid, organization: "Acme\nBcc: x@y.z" });
    expect(checked.ok && checked.value.organization).toBe("Acme Bcc: x@y.z");
  });

  it("sends to sales@jceelabs.com with the visitor as reply-to", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const base = await appWith(createConsultationHandler({ fetchImpl: fetchImpl as unknown as typeof fetch, env: configured }));
    const response = await post(base, valid);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    const sent = JSON.parse(String(init.body));
    expect(sent.to).toEqual(["sales@jceelabs.com"]);
    expect(sent.reply_to).toBe("avery@example.com");
    expect(sent.from).toBe(configured.CONSULTATION_FROM);
    expect(sent.text).toContain(valid.summary);
  });

  it("answers 503 with an email fallback when sending is not configured", async () => {
    const fetchImpl = vi.fn();
    const base = await appWith(createConsultationHandler({ fetchImpl: fetchImpl as unknown as typeof fetch, env: {} as NodeJS.ProcessEnv }));
    const response = await post(base, valid);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ fallback: "email" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("reports a provider failure so the page can offer the email fallback", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 500 }));
    const base = await appWith(createConsultationHandler({ fetchImpl: fetchImpl as unknown as typeof fetch, env: configured }));
    const response = await post(base, valid);
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ fallback: "email" });
  });

  it("silently accepts honeypot submissions without sending", async () => {
    const fetchImpl = vi.fn();
    const base = await appWith(createConsultationHandler({ fetchImpl: fetchImpl as unknown as typeof fetch, env: configured }));
    const response = await post(base, { ...valid, website: "https://spam.example" });
    expect(response.status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("limits repeated sends from one address", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const base = await appWith(createConsultationHandler({ fetchImpl: fetchImpl as unknown as typeof fetch, env: configured }));
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await post(base, valid, { "X-Forwarded-For": "203.0.113.7" })).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
    expect(fetchImpl).toHaveBeenCalledTimes(5);
  });

  it("opens only POST /api/consultation; the rest of /api stays behind the boundary", async () => {
    vi.stubEnv("ENABLE_WEBSITE_LEGACY_API", "");
    vi.stubEnv("RESEND_API_KEY", "");
    const app = express();
    registerConsultationRoute(app);
    app.use("/api", websiteApiBoundary);
    app.all("/api/*", (_req, res) => { res.json({ secret: "fixture" }); });
    const base = await serve(app);
    expect((await post(base, valid)).status).toBe(503);
    expect((await fetch(`${base}${CONSULTATION_PATH}`)).status).toBe(404);
    expect((await fetch(`${base}/api/trpc/business.submitInquiry`, { method: "POST" })).status).toBe(404);
  });
});
