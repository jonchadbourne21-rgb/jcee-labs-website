import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  insertLead: vi.fn(),
  getAllLeads: vi.fn(),
}));

// ─── Mock LLM ─────────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// ─── Mock notification ────────────────────────────────────────────────────────
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { insertLead, getAllLeads } from "./db";
import { invokeLLM } from "./_core/llm";

// ─── Shared context builder ───────────────────────────────────────────────────
function buildCtx(user?: TrpcContext["user"]): TrpcContext {
  return {
    user: user ?? null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── leads.subscribe ─────────────────────────────────────────────────────────
describe("leads.subscribe", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns success: true for a new email", async () => {
    vi.mocked(insertLead).mockResolvedValue({ success: true, duplicate: false });

    const caller = appRouter.createCaller(buildCtx());
    const result = await caller.leads.subscribe({ email: "test@jceelabs.com", source: "homepage" });

    expect(result.success).toBe(true);
    expect(insertLead).toHaveBeenCalledWith("test@jceelabs.com", "homepage");
  });

  it("returns success: false for a duplicate email", async () => {
    vi.mocked(insertLead).mockResolvedValue({ success: false, duplicate: true });

    const caller = appRouter.createCaller(buildCtx());
    const result = await caller.leads.subscribe({ email: "existing@jceelabs.com", source: "homepage" });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already on the list/i);
  });

  it("throws INTERNAL_SERVER_ERROR when DB fails", async () => {
    vi.mocked(insertLead).mockResolvedValue({ success: false, duplicate: false });

    const caller = appRouter.createCaller(buildCtx());
    await expect(
      caller.leads.subscribe({ email: "fail@jceelabs.com", source: "homepage" })
    ).rejects.toThrow();
  });

  it("rejects invalid email format", async () => {
    const caller = appRouter.createCaller(buildCtx());
    await expect(
      caller.leads.subscribe({ email: "not-an-email", source: "homepage" })
    ).rejects.toThrow();
  });
});

// ─── leads.list (admin-only) ──────────────────────────────────────────────────
describe("leads.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns leads for admin user", async () => {
    const mockLeads = [{ id: 1, email: "a@b.com", source: "homepage", createdAt: new Date() }];
    vi.mocked(getAllLeads).mockResolvedValue(mockLeads as any);

    const adminUser = { id: 1, openId: "admin-open-id", role: "admin" as const, name: "Admin", email: "admin@jceelabs.com", loginMethod: "manus", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    const caller = appRouter.createCaller(buildCtx(adminUser));
    const result = await caller.leads.list();

    expect(result).toEqual(mockLeads);
  });

  it("throws FORBIDDEN for non-admin user", async () => {
    const regularUser = { id: 2, openId: "user-open-id", role: "user" as const, name: "User", email: "user@jceelabs.com", loginMethod: "manus", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    const caller = appRouter.createCaller(buildCtx(regularUser));

    await expect(caller.leads.list()).rejects.toThrow(/Admin access required/i);
  });
});

// ─── mirrored.reflect ─────────────────────────────────────────────────────────
describe("mirrored.reflect", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a string reply from the LLM", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: "That sounds really meaningful. What does that feeling tell you?" } }],
    } as any);

    const caller = appRouter.createCaller(buildCtx());
    const result = await caller.mirrored.reflect({ message: "I feel stuck in my career." });

    expect(typeof result.reply).toBe("string");
    expect(result.reply.length).toBeGreaterThan(0);
  });

  it("falls back gracefully when LLM returns non-string content", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: [{ type: "text", text: "some content" }] } }],
    } as any);

    const caller = appRouter.createCaller(buildCtx());
    const result = await caller.mirrored.reflect({ message: "I feel lost." });

    expect(result.reply).toBe("I'm here with you. Tell me more.");
  });

  it("rejects empty messages", async () => {
    const caller = appRouter.createCaller(buildCtx());
    await expect(caller.mirrored.reflect({ message: "" })).rejects.toThrow();
  });

  it("rejects messages over 1000 characters", async () => {
    const caller = appRouter.createCaller(buildCtx());
    await expect(caller.mirrored.reflect({ message: "a".repeat(1001) })).rejects.toThrow();
  });

  it("passes conversation history to the LLM", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: "I see a pattern here." } }],
    } as any);

    const caller = appRouter.createCaller(buildCtx());
    await caller.mirrored.reflect({
      message: "Still feeling the same way.",
      history: [
        { role: "user", content: "I feel stuck." },
        { role: "assistant", content: "What does stuck feel like for you?" },
      ],
    });

    const callArgs = vi.mocked(invokeLLM).mock.calls[0][0];
    expect(callArgs.messages.length).toBeGreaterThan(3); // system + 2 history + 1 user
  });
});
