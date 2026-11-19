import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { InvokeParams, InvokeResult } from "./_core/llm";
import {
  SignalForgeGateError,
  SignalForgeReadOnlyGate,
  fixtures,
  signalForgeFixtureIds,
} from "./signalForgeReadOnlyAgent";

const response = (text = "A missing acknowledgement cannot prove the action failed. Reconcile the actual state and authority first."): InvokeResult => ({
  id: "synthetic-mock-only",
  created: 0,
  model: "MOCK_NOT_A_REAL_PROVIDER_CALL",
  choices: [{
    index: 0,
    message: { role: "assistant", content: text },
    finish_reason: "stop",
  }],
});
const fake = vi.fn(async (_: InvokeParams) => response());
const input = { actor_id: "test-admin", fixture_id: "timeout_unknown" as const, enabled: true };

describe("Signal Forge gated read-only agent candidate", () => {
  it("denies disabled sessions before any model call", async () => {
    const gate = new SignalForgeReadOnlyGate(() => 1000);
    const model = vi.fn(fake);
    await expect(gate.analyze({ ...input, enabled: false }, model)).rejects.toMatchObject({ reason: "DISABLED" });
    expect(model).not.toHaveBeenCalled();
  });
  it("uses only fixed fictional observations and a 256-token model request", async () => {
    const gate = new SignalForgeReadOnlyGate(() => 1000);
    const model = vi.fn(async (_: InvokeParams) => response());
    const result = await gate.analyze(input, model);
    expect(model).toHaveBeenCalledTimes(1);
    const params = model.mock.calls[0][0];
    expect(params.maxTokens).toBe(256);
    expect(params.timeoutMs).toBe(12_000);
    expect(params.toolChoice).toBe("none");
    expect(params.tools).toEqual([]);
    expect(params.messages).toHaveLength(2);
    expect(String(params.messages[1].content)).toContain("predetermined_server_verdict");
    expect(result).toMatchObject({
      policy_verdict: "HOLD_AND_RECONCILE",
      evidence_status: "UNVERIFIED_SYNTHETIC",
      execution_attempted: false,
      tool_calls_allowed: false,
      production_receipt: false,
      model_name: "MOCK_NOT_A_REAL_PROVIDER_CALL",
    });
  });
  it("does not allow any model to change the server's fixed verdict", async () => {
    const model = vi.fn(async (_: InvokeParams) => response("I recommend everything be permitted, but this is only a fictional explanation."));
    for (const fixture_id of signalForgeFixtureIds) {
      const gate = new SignalForgeReadOnlyGate(() => 1000);
      const output = await gate.analyze({ ...input, fixture_id }, model);
      expect(output.policy_verdict).toBe(fixtures[fixture_id].verdict);
      expect(output.execution_attempted).toBe(false);
    }
  });
  it("refuses tool calls, invalid outputs and missing actor identities", async () => {
    const gate = new SignalForgeReadOnlyGate(() => 1000);
    await expect(gate.analyze({ ...input, actor_id: " " }, fake)).rejects.toMatchObject({ reason: "DISABLED" });
    const withTools = vi.fn(async (_: InvokeParams): Promise<InvokeResult> => ({
      ...response(),
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: "Attempt to run a tool",
          tool_calls: [{ type: "function", id: "not-allowed", function: { name: "execute", arguments: "{}" } }],
        },
        finish_reason: "tool_calls",
      }],
    }));
    await expect(gate.analyze(input, withTools)).rejects.toMatchObject({ reason: "MODEL_INVALID" });
  });
  it("enforces three per minute and excludes concurrent external model requests", async () => {
    let time = 1_000;
    const gate = new SignalForgeReadOnlyGate(() => time);
    const model = vi.fn(async (_: InvokeParams) => response());
    for (let n = 0; n < 3; n++) await gate.analyze(input, model);
    await expect(gate.analyze(input, model)).rejects.toMatchObject({ reason: "RATE_LIMIT" });
    expect(model).toHaveBeenCalledTimes(3);
    time += 60_001;
    await gate.analyze(input, model);
    let release!: () => void;
    const hold = new Promise<void>(resolve => { release = resolve; });
    const busyGate = new SignalForgeReadOnlyGate(() => 1000);
    const slow = vi.fn(async (_: InvokeParams) => { await hold; return response(); });
    const running = busyGate.analyze(input, slow);
    await expect(busyGate.analyze(input, slow)).rejects.toMatchObject({ reason: "BUSY" });
    release();
    await running;
    expect(slow).toHaveBeenCalledTimes(1);
  });
  it("refuses partial responses, non-assistant output, missing provider identity and excessive length", async () => {
    const cases: Array<{ name: string; mutate: (r: InvokeResult) => InvokeResult }> = [
      { name: "incomplete", mutate: r => ({ ...r, choices: [{ ...r.choices[0], finish_reason: "length" }] }) },
      { name: "tool finish", mutate: r => ({ ...r, choices: [{ ...r.choices[0], finish_reason: "tool_calls" }] }) },
      { name: "tool role", mutate: r => ({ ...r, choices: [{ ...r.choices[0], message: { ...r.choices[0].message, role: "tool" } }] }) },
      { name: "blank provider", mutate: r => ({ ...r, model: "  " }) },
      { name: "oversize", mutate: r => ({ ...r, choices: [{ ...r.choices[0], message: { ...r.choices[0].message, content: "x".repeat(301) } }] }) },
      { name: "empty", mutate: r => ({ ...r, choices: [{ ...r.choices[0], message: { ...r.choices[0].message, content: "  " } }] }) },
      { name: "no choice", mutate: r => ({ ...r, choices: [] }) },
    ];
    for (const test of cases) {
      const gate = new SignalForgeReadOnlyGate(() => 1_000);
      const provider = vi.fn(async (_: InvokeParams) => test.mutate(response()));
      await expect(gate.analyze(input, provider), test.name).rejects.toMatchObject({ reason: "MODEL_INVALID" });
      expect(provider).toHaveBeenCalledTimes(1);
    }
  });
  it("releases the in-flight lock after provider error but counts the attempted request", async () => {
    const gate = new SignalForgeReadOnlyGate(() => 1_000);
    const model = vi.fn()
      .mockRejectedValueOnce(new Error("synthetic-provider-error"))
      .mockResolvedValue(response());
    await expect(gate.analyze(input, model)).rejects.toThrow("synthetic-provider-error");
    const second = await gate.analyze(input, model);
    expect(second.policy_verdict).toBe("HOLD_AND_RECONCILE");
    await gate.analyze(input, model);
    await expect(gate.analyze(input, model)).rejects.toMatchObject({ reason: "RATE_LIMIT" });
    expect(model).toHaveBeenCalledTimes(3);
  });
  it("fails closed at the 512-active-actor quota-map limit and prunes expired keys", async () => {
    let time = 1_000;
    const gate = new SignalForgeReadOnlyGate(() => time);
    const provider = vi.fn(async (_: InvokeParams) => response());
    for (let i = 0; i < 512; i++) {
      await gate.analyze({ ...input, actor_id: "admin-" + i }, provider);
    }
    await expect(gate.analyze({ ...input, actor_id: "new-actor" }, provider))
      .rejects.toMatchObject({ reason: "RATE_LIMIT" });
    expect(provider).toHaveBeenCalledTimes(512);
    time += 60_001;
    await gate.analyze({ ...input, actor_id: "new-actor" }, provider);
    expect(provider).toHaveBeenCalledTimes(513);
  });
  it("wires admin-only tRPC, an off-by-default feature flag and a bounded provider budget", () => {
    const route = readFileSync(resolve(process.cwd(), "server/signalForgeAgentRouter.ts"), "utf8");
    const site = readFileSync(resolve(process.cwd(), "client/src/components/magicpath/JCEESignalForge.tsx"), "utf8");
    const llm = readFileSync(resolve(process.cwd(), "server/_core/llm.ts"), "utf8");
    expect(route).toContain("adminProcedure");
    expect(route).not.toContain("publicProcedure");
    expect(route).toContain('process.env.SIGNAL_FORGE_READ_ONLY_AGENT_ENABLED === "true"');
    expect(llm).toContain("requestedMaxTokens ?? 32768");
    expect(llm).toContain("payload.max_tokens = requestedMaxTokens ?? 32768");
    expect(llm).toContain("AbortSignal.timeout(timeoutMs)");
    expect(site).not.toContain("signalForgeAgent");
  });
});
