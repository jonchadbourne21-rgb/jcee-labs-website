# JCEE-DIFF-P0.1D Step 2A — B2 Restate Target Packet

Status: **ADJUDICATED / DOCUMENTARY TECHNICAL PASS**
Date: 2026-09-03
Parent: `JCEE_DIFF_P0_1D_STEP2A_DURABLE_SUBSTRATE_ASSAULT_FREEZE_20260903.md`

## Target workflow
A Restate-backed handler/workflow performs a consequential operation. First evaluate a Restate-to-Restate durable invocation, where Restate owns both communication endpoints. Then move the irreversible effect to an arbitrary external payment/API target outside Restate and inject a failure after the external target may accept the effect but before Restate has durably captured the result.

## Strongest-faithful native composition
Grant Restate:
- durable invocation journal/log as ground truth;
- durable RPC and exactly-once semantics between Restate workflow-as-code handlers as documented;
- keyed-handler serialization and durable state;
- request idempotency keys and persisted response replay;
- durable invocation IDs/handles;
- retries/recovery/fencing behavior;
- awakeables/persistent promises for external callbacks;
- side-effect result journaling;
- realistic target idempotency token when the external target actually supports one, but record this as a target dependency.

## Primary official evidence
1. Restate Key Concepts: Restate persists execution state, retries API run actions, deduplicates requests with idempotency keys, and stops/retries handlers when server communication is lost. https://docs.restate.dev/foundations/key-concepts
2. Restate HTTP invocation docs: an `Idempotency-Key` causes duplicate requests to return the persisted original response rather than re-execute within retention. https://docs.restate.dev/services/invocation/http
3. Restate Microservice Orchestration: request idempotency and awakeables provide durable externally-resolved promises. https://docs.restate.dev/tour/microservice-orchestration
4. Restate official architecture explanation: durable messages between Restate handlers are journaled/logged; side effects can execute more than once if failure occurs before completion/result durability; the payment example uses a deterministic/idempotency token passed into Stripe. https://restate.dev/blog/why-we-built-restate
5. Restate 1.0 announcement: workflow-as-code handlers support idempotency/deduplication and exactly-once semantics between two Restate workflow-as-code handlers. https://restate.dev/blog/announcing-restate-1.0-restate-cloud-and-our-seed-funding-round

## H01–H14 matrix
| Case | Judgment | Finding |
|---|---|---|
| H01 authority revoke before action | RESIDUAL | Restate is not a native external authorization-currentness system. Authorization can be another Restate service, but revocation semantics must be modeled and checked. |
| H02 revoke after exact authorization | RESIDUAL | A prior authorization result is not generically atomic with an arbitrary later external target effect. |
| H03 authority ABA | RESIDUAL | Version/incarnation binding must be part of the authority model/application message. |
| H04 dependency mutation | CLOSED_NATIVE for Restate-owned keyed state; RESIDUAL for arbitrary external dependency | Keyed state/serialization closes owned state races, not unowned target state. |
| H05 dependency ABA | RESIDUAL outside Restate-owned/versioned state | External incarnation identity must be modeled. |
| H06 target-state race | CLOSED_NATIVE for Restate-owned keyed state; RESIDUAL for arbitrary external target | Durable ordering applies where Restate owns the target/service semantics. |
| H07 concurrent same-op workers | CLOSED_NATIVE for idempotent Restate invocation/logical operation; RESIDUAL for arbitrary pre-journal external side-effect attribution | Restate can deduplicate one logical invocation and make the log ground truth, but external side effects can precede durable result capture. |
| H08 crash after external commit/before Restate result durability | RESIDUAL | Official side-effect semantics acknowledge possible re-execution before result durability. |
| H09 lost response | CLOSED_NATIVE for Restate-to-Restate durable communication; RESIDUAL for arbitrary external target without idempotent/queryable semantics | Persistent promise/journal closes owned communication. |
| H10 duplicate retry | CLOSED_NATIVE for idempotency-keyed invocation; RESIDUAL if repeated external side effect lacks target idempotency | Restate returns the original persisted result for duplicate invocation keys. |
| H11 dependency host unavailable | CLOSED_NATIVE_WITH_COST | Durable journal/retry preserves progress and can stop/retry rather than fabricate success. |
| H12 authority/evidence host unavailable | CLOSED_NATIVE_WITH_COST | If authority is a Restate service, durable communication helps; fail-closed policy remains application-defined. |
| H13 partial/batch ambiguity | RESIDUAL for arbitrary external effects | Restate can coordinate durable calls, but external subset truth still depends on targets/callbacks. |
| H14 recovery-permission ambiguity | RESIDUAL | Recovery mechanics are native; proof of present authority for retry/compensate/reconcile is not a built-in universal semantic. |

## Four-property matrix
| Property | Judgment |
|---|---|
| Current authority | RESIDUAL unless explicitly modeled in a Restate-owned authority service and revalidated at effect boundary |
| Exact effect binding | STRONG/CLOSED for Restate-owned durable invocations; RESIDUAL for arbitrary external sink without target idempotency/version semantics |
| Unique execution ownership / non-conflicting attribution | STRONG for Restate logical invocation/journal; RESIDUAL for external side effect before result durability |
| Independently verifiable receipt closure | STRONG for Restate journaled operations; RESIDUAL for external sink acceptance not yet represented by a durable target callback/query/result |

## Mandatory execution-ownership analysis
Restate substantially narrows JCEE's execution-ownership claim. For Restate-owned calls, the journal/log is authoritative and duplicate logical requests can be deduplicated. Multiple service processes are transient executors of a journaled logical invocation rather than independent durable owners.

The decisive cross-boundary distinction remains: Restate cannot make an arbitrary external system participate in its log. A side-effecting callback can happen before Restate durably records the result. If the process fails in that window, the side effect may be retried. The external target must recognize a stable idempotency/effect key, expose authoritative result observation, or complete an awakeable/callback with enough identity to close the effect.

## Ambiguity/recovery analysis
Restate is especially strong when the external system can cooperate:
- pass an idempotency key into the target;
- use an awakeable/persistent promise for an external completion callback;
- use Restate durable invocation IDs/handles;
- reconcile through a queryable target.

That composition may close much of the JCEE property in real workflows. But the target cooperation is not intrinsic Restate closure, and current authority for retry/recovery still has to be modeled and revalidated.

## Technical verdict
**`RESIDUAL_PROPERTY`**

Exact residual:
> Restate natively closes durable invocation identity, retries, stateful concurrency, deduplication, and receipt-like journal closure for operations inside its durable communication domain. For an arbitrary external consequential effect that can commit before its result is durably represented in Restate, end-to-end exact-effect ownership and receipt closure still require target-recognized idempotency/reconciliation/callback semantics, while current authority and recovery permission remain application/authority-system properties.

## What Restate kills as JCEE differentiators
- generic durable async/await;
- durable invocation IDs and result handles;
- request-level idempotency/deduplication;
- reliable service-to-service communication inside one Restate domain;
- keyed state serialization;
- durable callbacks/persistent promises;
- journal-as-ground-truth recovery.

## Infrastructure significance for JCEE
**Restate is the strongest substrate-adoption candidate examined so far.** It could plausibly replace a meaningful amount of commodity VOW-style orchestration/retry infrastructure while leaving JCEE focused on consequence admission, target-side evidence, authority-closed ambiguity recovery, and independent verification.

That is a hypothesis only. No migration/adoption authority is granted by this documentary packet.

## JCEE-EVALS-P0.1B
- contract ID: `JCEE-DIFF-P0.1D-STEP2A-B2-RESTATE`
- validity: target/order/attack frozen before adjudication
- native judgment: official Restate documentary reconstruction
- independence: official documentation/blog material; no live Restate Cloud/BYOC harness
- claim ceiling: documentary residual and infrastructure-candidate finding only

## Next authority
Continue to B3 Cloudflare Durable Objects. No JCEE build or Restate adoption authorized.