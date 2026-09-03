# JCEE-DIFF-P0.1D Step 2A — Durable-Execution Substrate Assault Synthesis

Status: **CLOSED_DOCUMENTARY_SUBGATE / ADVANCE_RESIDUAL_NO_BUILD_YET**
Date: 2026-09-03

## Frozen lineage
- Step 2A freeze blob: `7acb0bb68391d12477843ec8346e1dec5ab28ef7`
- DBOS packet blob: `1a42b76a922b3a44f61364838a20acf0b2b903dc`
- Restate packet blob: `eff083fc66843d0179730ad1eb2e139be01be8f6`
- Cloudflare Durable Objects packet blob: `86d2f0ef0bfb0b96f7f793552f2fe4f2fad86528`
- Azure Durable Task packet blob: `f2264ddc763221653878e483050581e3f64b603e`

## Results
| Target | Verdict | Strongest capability that narrows JCEE | External-boundary result |
|---|---|---|---|
| DBOS | `RESIDUAL_PROPERTY` | Workflow ID idempotency; explicit concurrent/zombie executor outcome ownership; exactly-once database transaction when DBOS durability shares the transaction | General external steps are at-least-once if effect occurs before checkpoint; target idempotency/reconciliation remains necessary |
| Restate | `RESIDUAL_PROPERTY` | Durable invocation/log; keyed state serialization; request dedup; durable RPC; persistent promises/awakeables; strong in-domain execution identity | General side effect may occur before result durability; target idempotency/callback/query needed; current recovery authority still modeled externally |
| Cloudflare Durable Objects | `RESIDUAL_PROPERTY` | Globally unique keyed coordinator; strongly consistent transactional per-object state | External fetch can interleave; stale-instance edge exists; non-idempotent retry safety is application/target dependent |
| Azure Durable Task | `RESIDUAL_PROPERTY` | Durable orchestration identity/history; durable entities/locks; singleton patterns | Activities are at-least-once and may rerun after external completion before result recording; external effects are not rolled back by entity locks |

## What Step 2A falsified
The following must not be treated as JCEE differentiation:
- durable workflow recovery;
- workflow/invocation idempotency keys;
- persistent execution journals;
- persistent promises/durable callbacks;
- keyed single-owner coordination;
- durable entity locks;
- exactly-once logical workflow outcome ownership;
- conflict detection between concurrent/zombie workflow executors;
- exactly-once database effects when runtime durability and application mutation share one atomic database transaction;
- automatic retries, timers, queues, and orchestration history.

DBOS in particular kills any broad interpretation of the R2C→R2D lesson as “only JCEE can prevent two workers from becoming durable execution owners.” DBOS explicitly has a native concurrent-execution ownership rule for workflow outcomes.

Restate kills any broad claim that durable cross-service invocation identity, exactly-once in-domain messaging, or journal-based recovery is a JCEE-specific system property.

Cloudflare kills broad per-key/global-single-owner state claims.

Azure kills broad durable-orchestration/entity-lock claims.

## What survived all four
The surviving technical hypothesis is narrower:

`CURRENT/Causally-Fresh AUTHORITY`
`+ EXACT EXTERNAL EFFECT BINDING`
`+ AUTHORITATIVE EFFECT OWNERSHIP / NON-CONFLICTING ATTRIBUTION`
`+ TARGET-SIDE OBSERVATION`
`+ AUTHORITY-CLOSED AMBIGUITY RECOVERY`
`+ INDEPENDENTLY VERIFIABLE RECEIPT CLOSURE`

when the irreversible consequential effect is **outside the durable substrate's strongest atomic ownership/transaction domain**.

More mechanically:
> Mature durable substrates can own workflow identity, state, retries, and even exact database transitions. The residual appears when authority, durable execution state, and the irreversible external target cannot all participate in one native atomic ownership domain. Then a system still needs to bind current authority to the exact target effect, survive commit-before-ack ambiguity without creating unauthorized or duplicate consequences, determine what the target actually accepted, constrain recovery by current authority, and leave evidence that a verifier can reconstruct without relying solely on the initiating worker.

This is a surviving hypothesis, not a uniqueness or patentability finding.

## Architecture implication for JCEE
### Current conclusion
**RIGHT PROPERTY / POSSIBLY TOO MUCH OWNED COMMODITY EXECUTION INFRASTRUCTURE.**

JCEE should not automatically replace VOW or frozen evidence. However, future product architecture should stop assuming JCEE must own generic durable execution, retries, timers, queues, workflow replay, or keyed state if a customer's substrate already supplies them.

The preferred conceptual boundary becomes:

`Application/Agent`
→ `JCEE consequence admission: current authority + exact effect contract`
→ `Native durable substrate: Restate / DBOS / Temporal / Step Functions / Durable Task / customer runtime`
→ `External consequential target`
→ `JCEE target observation + ambiguity/recovery authority + evidence closure`

JCEE's product value would then concentrate on the **consequence boundary and proof boundary**, not replacement of the customer's runtime.

## Substrate candidate ranking for JCEE
### 1. Restate — `PRIMARY_SUBSTRATE_CANDIDATE_FOR_EVALUATION`
Why:
- provider-neutral deployment model;
- durable communication across service boundaries;
- journal/invocation identity/dedup/recovery could remove substantial commodity runtime burden;
- natural fit for a thin JCEE consequence-assurance layer around existing services;
- awakeables/persistent promises are useful for target observation and callbacks.

What it does not remove:
- current authority semantics;
- arbitrary external target idempotency/result truth;
- authority-closed recovery permission;
- independent consequence receipts across systems.

### 2. DBOS — `DATABASE_CENTRIC_SUBSTRATE_CANDIDATE`
Why:
- exceptionally strong exactly-once semantics when application mutation and DBOS durability can share a SQL transaction;
- explicit workflow outcome ownership under concurrent/zombie executors;
- simple architecture for database-centric JCEE services.

Constraint:
- strongest benefit collapses when consequential target is an external payment/cloud/deployment API rather than a supported database transaction.

### 3. Azure Durable Task — `CUSTOMER_NATIVE_INTEGRATION_TARGET`
Useful when enterprise customer already runs Azure. Not presently justified as JCEE core substrate because it does not remove the external Activity ambiguity boundary and would add provider coupling.

### 4. Cloudflare Durable Objects — `EDGE_SPECIALIST / NOT_CORE_CANDIDATE`
Strong keyed coordination, but provider-specific and does not solve external-effect closure. Potential future edge adapter, not core execution substrate.

## VOW disposition
Do **not** delete, rewrite, or demote frozen VOW evidence.

VOW remains valuable as:
- JCEE reference execution model;
- adversarial/reference harness for consequence semantics;
- fallback runtime where customers lack an adequate durable substrate;
- source of proven effect/recovery/evidence patterns.

But no new claim should require VOW to become a general-purpose competitor to Restate, DBOS, Temporal, AWS Step Functions, or Azure Durable Task.

## Recommended next controlled gate
`JCEE-ARCH-P0.1 — Execution-Substrate Substitution & Commodity-Offload Gate`

This is an architecture/economics gate, not a build.

Compare three frozen deployment profiles against the same JCEE consequence property:
A. `VOW_REFERENCE_NATIVE` — JCEE owns execution/recovery as today.
B. `RESTATE_SUBSTRATE` — Restate owns durable invocation/retry/state; JCEE owns consequence admission, target closure, recovery authority, evidence.
C. `DBOS_SUBSTRATE` — DBOS owns workflow/database durability; JCEE owns external consequence boundary and evidence.

Measure:
- which JCEE properties survive unchanged;
- code/infrastructure that becomes redundant;
- TCB/security surface;
- cloud/provider lock-in;
- latency/availability implications;
- customer integration burden;
- operating cost and solo-founder burden;
- evidence independence;
- migration/reversibility;
- whether substrate-native facilities accidentally collapse the remaining JCEE residual.

No code should be written in P0.1. The gate should end by selecting `KEEP_VOW_REFERENCE`, `EVALUATE_RESTATE_LIVE`, `EVALUATE_DBOS_LIVE`, or `NO_SUBSTRATE_CHANGE`.

## Step 2A terminal disposition
**`ADVANCE_RESIDUAL_NO_BUILD_YET`**

No Restate adoption, DBOS adoption, VOW rewrite, QCS/DCC engineering, or customer-specific adapter is authorized.

Stripe remains `INDETERMINATE` from Step 2 and must continue to be carried as an unresolved strong falsifier.

Payabli/payOS commercial conclusions remain unadjudicated under the frozen comparator.