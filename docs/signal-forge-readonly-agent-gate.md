# Signal Forge — internal read-only agent candidate

Status: **source implementation candidate, mock-tested only**. It is not a live
public agent, not a JCEE-INFRA executor, not G0 admission, not independent review,
not production telemetry, and not a cryptographic receipt.

Source anchor: website main merge PR #84 `ffc4fdd865ed5e7e5f34373c16c8af469e5ac5fe`.
The approved visual design has already been merged. This separately versioned
candidate must not hold up Manus publication of that visual change.

## Reuse and boundaries

The existing website server already exposes tRPC, an admin-only middleware,
and a server-side model adapter. This patch reuses those exact mechanisms:
`signalForgeAgent.analyze` requires an authenticated **admin**, accepts ONLY
one of three server-owned fictional fixture IDs, and is disabled unless the
**server-side** environment variable `SIGNAL_FORGE_READ_ONLY_AGENT_ENABLED`
equals `true`. No browser setting or front-end code can enable it.

Each call has no tools, an explicit `toolChoice: none`, 256 model output tokens,
three requests per actor per 60 seconds, and only one in-flight call per server
process. The model may write a limited explanatory paragraph; the server
chooses a fixed safe verdict. No action endpoint, tool registry, grant/token,
production target, or effect-dispatch path exists.

In-process quotas are **not** distributed rate limiting. Running this through
multiple nodes or making it public requires shared budgets, CSRF/session review,
provider-specific hard spending ceilings and additional security qualification.
No model request was made while qualifying this candidate. No API credentials
were created or modified.

## Frozen fictional cases

- `timeout_unknown`: HOLD_AND_RECONCILE, no blind retry.
- `permission_revoked`: DENY_EFFECT.
- `effect_observed`: DO_NOT_RETRY, state only supplied as fictional input.

Output records explicitly mark `UNVERIFIED_SYNTHETIC`,
`execution_attempted: false`, `tool_calls_allowed: false`,
`production_receipt: false`.

## Qualification gate and future route

Local/CI tests mock the provider, assert zero provider calls if disabled,
enforce authorization at the tRPC source, validate no tool calls, bounded
usage and concurrency, preserve server-owned verdicts, and verify the
max-token override does not change existing unbounded callers.

This patch adds **no public route and no UI control**. The existing Signal
Forge label "Fictional data, browser-only" remains accurate. A later scoped
human approval and qualification should connect a role-restricted internal UI,
exercise a real server-side model with fixed synthetic data and explicit
spend/resource ceiling, and validate independent readback of every result.
Only after that should a public read-only demo be considered. Real sandbox
effect execution and production execution require separate authority gates.

JCEE-INFRA original 20-case G0 remains unadmitted/unrun; G0-v2 remains
an unmerged separate candidate. Preserve P3_PARTIAL, REAL_A4_OPEN,
T01_NOT_DEFENDED and RELEASE_HOLD. Registry R201 is not modified.

## Hosting and Manus

GitHub merge does not mean Manus publication. The founder's Manus handoff
for the **visual update** must pin merge commit
`ffc4fdd865ed5e7e5f34373c16c8af469e5ac5fe`; do not enable this feature,
copy secrets into Vite/public files, or silently connect an agent. Static
hosting does not execute tRPC server methods.

## Pre-provider security-review successor — 2026-11-09

The original 116-test CI result is preserved unchanged at
`b4291620c415c41f858fe2c0b09dbefdeec16dd3`.
This successor performs additional **mock-only** qualification; it is not
a real model inference, authenticated hosted test, or production release.

Added source-level safeguards: fail closed for truncated or tool-finishing
provider responses, wrong response role, absent provider identity and output
over the originally specified 300-character limit; an abortable 12-second
request timeout (per-call option), explicit maximum of 512 tracked active
actors per process and cleanup when the lock is released.

Added actual tRPC caller-based tests for anonymous, non-admin and
disabled-admin requests; strict fixture-ID and forbidden-parameter rejection;
fixed session identity forwarded to the gate; and provider-error redaction.
No paid provider calls are made. A timeout is an HTTP cancellation boundary,
not proof that an upstream model incurred no charges.

The process-local quota, session authentication, result model quality,
provider billing ceiling, public abuse resistance and independently witnessed
runtime effects remain unqualified for a multi-replica hosted/public deployment.
