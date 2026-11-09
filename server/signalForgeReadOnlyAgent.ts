import { invokeLLM, type InvokeParams, type InvokeResult } from "./_core/llm";

/**
 * This is a server-owned, fixed-fixture, read-only model explanation lane.
 * No action dispatch, target credentials, network-tool selection or production
 * receipt can be supplied by this component.
 */
export const signalForgeFixtureIds = [
  "timeout_unknown",
  "permission_revoked",
  "effect_observed",
] as const;
export type SignalForgeFixtureId = (typeof signalForgeFixtureIds)[number];

export const fixtures: Record<
  SignalForgeFixtureId,
  Readonly<{
    title: string;
    observations: readonly string[];
    required_checks: readonly string[];
    verdict: "HOLD_AND_RECONCILE" | "DENY_EFFECT" | "DO_NOT_RETRY";
  }>
> = {
  timeout_unknown: {
    title: "Illustrative acknowledgement timeout",
    observations: [
      "A fictional membership-add request was sent.",
      "The client did not receive a final acknowledgement.",
      "The actual target state has not been independently inspected.",
    ],
    required_checks: [
      "Inspect the target membership in its source system.",
      "Check the exact action identity against the target action history.",
      "Re-evaluate current authority before considering any new action.",
    ],
    verdict: "HOLD_AND_RECONCILE",
  },
  permission_revoked: {
    title: "Illustrative current permission revoked",
    observations: [
      "An earlier fictional authorization was granted.",
      "The authorization was revoked before the hypothetical effect.",
      "No actual service credentials or effect targets are connected.",
    ],
    required_checks: [
      "Confirm revocation at the effective authority boundary.",
      "Keep execution stopped until a new independently valid grant exists.",
    ],
    verdict: "DENY_EFFECT",
  },
  effect_observed: {
    title: "Illustrative effect already present",
    observations: [
      "A fictional request lacked acknowledgement.",
      "The fictional target snapshot already contains the intended membership.",
      "This supplied snapshot is not an independent production readback.",
    ],
    required_checks: [
      "Verify the live source-of-truth state in a future qualified environment.",
      "Do not repeat a completed action on the basis of a timeout.",
    ],
    verdict: "DO_NOT_RETRY",
  },
};

export type SignalForgeModel = (params: InvokeParams) => Promise<InvokeResult>;
export type SignalForgeModelResult = {
  fixture_id: SignalForgeFixtureId;
  fixture_title: string;
  observations: readonly string[];
  required_checks: readonly string[];
  policy_verdict: (typeof fixtures)[SignalForgeFixtureId]["verdict"];
  model_explanation: string;
  model_name: string;
  source_type: "SERVER_FIXED_FICTIONAL_FIXTURE";
  evidence_status: "UNVERIFIED_SYNTHETIC";
  execution_attempted: false;
  tool_calls_allowed: false;
  production_receipt: false;
};

export class SignalForgeGateError extends Error {
  constructor(
    public readonly reason: "DISABLED" | "BUSY" | "RATE_LIMIT" | "MODEL_INVALID",
  ) {
    super("Signal Forge read-only gate: " + reason);
  }
}

type Bucket = { window_start: number; count: number };

/** In-process limit only. Multi-replica qualification needs shared quota control. */
export class SignalForgeReadOnlyGate {
  private readonly rate = new Map<string, Bucket>();
  private active = false;

  constructor(private readonly clock: () => number = Date.now) {}

  async analyze(
    input: {
      actor_id: string;
      fixture_id: SignalForgeFixtureId;
      enabled: boolean;
    },
    model: SignalForgeModel = invokeLLM,
  ): Promise<SignalForgeModelResult> {
    // Denial comes before both accounting and any model/provider access.
    if (!input.enabled) throw new SignalForgeGateError("DISABLED");
    if (!input.actor_id.trim()) throw new SignalForgeGateError("DISABLED");
    if (this.active) throw new SignalForgeGateError("BUSY");
    const now = this.clock();
    const old = this.rate.get(input.actor_id);
    const next: Bucket =
      !old || now - old.window_start >= 60_000 || now < old.window_start
        ? { window_start: now, count: 1 }
        : { window_start: old.window_start, count: old.count + 1 };
    if (next.count > 3) throw new SignalForgeGateError("RATE_LIMIT");
    // Prune old actor entries instead of permitting unlimited resident keys.
    if (this.rate.size > 512) {
      for (const [actor, bucket] of Array.from(this.rate.entries()))
        if (now - bucket.window_start >= 60_000) this.rate.delete(actor);
    }
    this.rate.set(input.actor_id, next);
    this.active = true;
    try {
      const fixture = fixtures[input.fixture_id];
      if (!fixture) throw new SignalForgeGateError("MODEL_INVALID");
      const messages: InvokeParams["messages"] = [
        {
          role: "system",
          content: [
            "You are a read-only explanation assistant for JCEE WorldLab.",
            "The input is a fixed fictional incident, not observed production reality.",
            "Do not infer a real effect, approval, permission, or verified receipt.",
            "Do not request tools, execute actions, or recommend bypassing a hold.",
            "Explain in two short sentences why the supplied server-side verdict is safe.",
            "Never claim that you independently inspected the target or ran a check.",
            "Limit the explanation to 300 characters.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            fixture_id: input.fixture_id,
            observations: fixture.observations,
            required_checks: fixture.required_checks,
            predetermined_server_verdict: fixture.verdict,
          }),
        },
      ];
      const result = await model({
        messages,
        tools: [],
        toolChoice: "none",
        maxTokens: 256,
      });
      const message = result.choices?.[0]?.message;
      if (message?.tool_calls?.length || typeof message?.content !== "string")
        throw new SignalForgeGateError("MODEL_INVALID");
      const explanation = message.content.replace(/\s+/g, " ").trim();
      if (explanation.length < 5 || explanation.length > 600)
        throw new SignalForgeGateError("MODEL_INVALID");
      return {
        fixture_id: input.fixture_id,
        fixture_title: fixture.title,
        observations: fixture.observations,
        required_checks: fixture.required_checks,
        // The model cannot alter this server-owned policy determination.
        policy_verdict: fixture.verdict,
        model_explanation: explanation,
        model_name: result.model,
        source_type: "SERVER_FIXED_FICTIONAL_FIXTURE",
        evidence_status: "UNVERIFIED_SYNTHETIC",
        execution_attempted: false,
        tool_calls_allowed: false,
        production_receipt: false,
      };
    } finally {
      this.active = false;
    }
  }
}

export const signalForgeReadOnlyGate = new SignalForgeReadOnlyGate();
