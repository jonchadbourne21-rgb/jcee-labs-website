import { afterEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { signalForgeAgentRouter } from "./signalForgeAgentRouter";
import {
  SignalForgeGateError,
  fixtures,
  signalForgeReadOnlyGate,
} from "./signalForgeReadOnlyAgent";

const context = (role?: "admin" | "user"): TrpcContext => ({
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
  user: role ? ({ openId: "session-owned-actor", role } as TrpcContext["user"]) : null,
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Signal Forge actual tRPC authorization boundary — no provider calls", () => {
  it("denies unauthenticated users and non-admins before invoking the gate", async () => {
    vi.stubEnv("SIGNAL_FORGE_READ_ONLY_AGENT_ENABLED", "true");
    const spy = vi.spyOn(signalForgeReadOnlyGate, "analyze");
    await expect(signalForgeAgentRouter.createCaller(context()).analyze({ fixture_id: "timeout_unknown" }))
      .rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(signalForgeAgentRouter.createCaller(context("user")).analyze({ fixture_id: "timeout_unknown" }))
      .rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(spy).not.toHaveBeenCalled();
  });
  it("denies authenticated admin by default with zero provider traffic", async () => {
    vi.stubEnv("SIGNAL_FORGE_READ_ONLY_AGENT_ENABLED", "false");
    const caller = signalForgeAgentRouter.createCaller(context("admin"));
    const spy = vi.spyOn(signalForgeReadOnlyGate, "analyze");
    await expect(caller.analyze({ fixture_id: "timeout_unknown" }))
      .rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(spy).toHaveBeenCalledWith({
      actor_id: "session-owned-actor", fixture_id: "timeout_unknown", enabled: false,
    });
  });
  it("rejects invented fixture ids, extra client parameters and forged actor identity", async () => {
    vi.stubEnv("SIGNAL_FORGE_READ_ONLY_AGENT_ENABLED", "true");
    const caller = signalForgeAgentRouter.createCaller(context("admin"));
    const spy = vi.spyOn(signalForgeReadOnlyGate, "analyze");
    for (const payload of [
      { fixture_id: "invented" },
      { fixture_id: "timeout_unknown", actor_id: "forged-actor" },
      { fixture_id: "timeout_unknown", execute: true },
    ]) {
      await expect(caller.analyze(payload as never)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    }
    expect(spy).not.toHaveBeenCalled();
  });
  it("passes only session identity and fixed fixture to enabled gate", async () => {
    vi.stubEnv("SIGNAL_FORGE_READ_ONLY_AGENT_ENABLED", "true");
    const verdict = fixtures.timeout_unknown.verdict;
    const spy = vi.spyOn(signalForgeReadOnlyGate, "analyze").mockResolvedValue({
      fixture_id: "timeout_unknown",
      fixture_title: fixtures.timeout_unknown.title,
      observations: fixtures.timeout_unknown.observations,
      required_checks: fixtures.timeout_unknown.required_checks,
      policy_verdict: verdict,
      model_explanation: "No acknowledgement proves the request failed; check current state and authority.",
      model_name: "MOCK_NO_PROVIDER",
      source_type: "SERVER_FIXED_FICTIONAL_FIXTURE",
      evidence_status: "UNVERIFIED_SYNTHETIC",
      execution_attempted: false,
      tool_calls_allowed: false,
      production_receipt: false,
    });
    const output = await signalForgeAgentRouter.createCaller(context("admin"))
      .analyze({ fixture_id: "timeout_unknown" });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      actor_id: "session-owned-actor", fixture_id: "timeout_unknown", enabled: true,
    });
    expect(output.policy_verdict).toBe("HOLD_AND_RECONCILE");
    expect(output.execution_attempted).toBe(false);
  });
  it("redacts provider failures and maps guard rejections to generic tRPC errors", async () => {
    vi.stubEnv("SIGNAL_FORGE_READ_ONLY_AGENT_ENABLED", "true");
    const caller = signalForgeAgentRouter.createCaller(context("admin"));
    const spy = vi.spyOn(signalForgeReadOnlyGate, "analyze");
    spy.mockRejectedValueOnce(new SignalForgeGateError("RATE_LIMIT"));
    await expect(caller.analyze({ fixture_id: "timeout_unknown" }))
      .rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    spy.mockRejectedValueOnce(new Error("test-only-secret-DO-NOT-LEAK"));
    await expect(caller.analyze({ fixture_id: "timeout_unknown" }))
      .rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR", message: "Agent analysis unavailable.",
      });
  });
});
