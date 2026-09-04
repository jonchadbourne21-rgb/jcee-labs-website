# JCEE-ARCH-P0.1 — Architecture B: RESTATE_SUBSTRATE

Status: **ADJUDICATED / OPTIONAL-PLUG CANDIDATE**
Date: 2026-09-03

## Role
Restate is evaluated only as a durable-execution substrate beneath JCEE's consequence/evidence boundary. It does not replace VOW, QCS/DCC, JEC/JA, Evidence Engine, IEJ, or frozen JCEE evidence.

## Strongest-faithful Restate surface
Current official Restate material supports:
- durable execution, journaled progress, retries and recovery;
- durable RPC/message semantics between Restate handlers;
- idempotency keys and deduplication;
- keyed Virtual Objects with serialized updates;
- durable promises/awakeables for external callbacks;
- invocation epochs / conditional journal append to reject subsumed handler executions;
- open-source self-hosting as a single binary;
- fully managed Restate Cloud;
- BYOC in AWS/GCP, with the data plane in the customer's VPC;
- TypeScript, Go, Java/Kotlin, Python and other SDK support;
- current Restate 1.7 flow-control/virtual-queue capabilities.

Official sources accessed 2026-09-03:
- https://restate.dev/
- https://restate.dev/blog/why-we-built-restate
- https://restate.dev/blog/every-system-is-a-log-avoiding-coordination-in-distributed-applications
- https://restate.dev/cloud
- https://restate.dev/pricing
- https://restate.dev/blog/announcing-restate-byoc
- https://restate.dev/blog/announcing-restate-1-7

## Critical boundary
Restate's own technical explanation states that general side effects may execute more than once if failure occurs before the result becomes durable. Restate's payment-style guidance therefore carries a durable idempotency token into the external target. This means Restate's journal cannot itself prove arbitrary external target acceptance.

## Evaluation

| Dimension | Judgment | Rationale |
|---|---|---|
| Comparator-property preservation | STRONG_IF_ADAPTER_BOUNDARY_IS_STRICT | JCEE can retain authority/effect/recovery/evidence semantics while Restate owns generic durability. No implementation proof yet. |
| Commodity durability offloaded | VERY_HIGH | Durable invocation, retry/recovery, timers, promises, keyed state, RPC and flow control can move out of JCEE-owned infrastructure. |
| JCEE-specific semantics retained | YES_IN_ARCHITECTURE | Current authority, exact-effect admission, target observation, ambiguity classification and recovery permission remain JCEE responsibilities. |
| Added external TCB | MEDIUM | Restate server/Cloud, SDK/protocol and journal become execution dependencies when plug is enabled. |
| Security/credential surface | MEDIUM | Restate sits in the invocation path and stores journals/state. Self-host/BYOC can keep data inside controlled infrastructure. |
| Solo-founder operations burden | LOW_WITH_CLOUD / MEDIUM_SELF_HOSTED | Managed Cloud removes stateful runtime operations; self-host remains a single-binary system but still requires production ops. |
| Latency | ADDITIONAL_RUNTIME_HOP | Restate is designed for low-latency durable execution, but JCEE has not benchmarked end-to-end latency for this plug. |
| Infrastructure/storage burden | LOW_WITH_CLOUD | Managed service owns durable state infrastructure. BYOC/self-host reintroduces storage/HA concerns. |
| Provider lock-in | MEDIUM | SDK/runtime semantics are Restate-specific, but open-source self-hosting and multi-cloud/BYOC reduce provider lock-in. |
| Failure-domain additions | MEDIUM | Adds a durable execution control/data plane. This must not be treated as an authority source. |
| Evidence independence | COMPLEMENTARY | Restate journal is strong evidence of what Restate durably recorded, not sufficient proof of external target acceptance. Canonical JCEE receipt remains necessary. |
| External-effect ambiguity | RESIDUAL_REMAINS | Arbitrary external side effect can still sit outside Restate's atomic ownership domain. |
| Reversibility/removability | GOOD_IF_PLUG_CONTRACT_IS_NARROW | Because VOW remains a fallback and JCEE contracts stay substrate-neutral, Restate can be removable in principle. This has not yet been demonstrated in code. |
| Integration complexity | MEDIUM | Requires an adapter/service integration and careful preservation of JCEE operation IDs, authority context, target observations and evidence receipts. |
| Commercial integration posture | STRONG | JCEE could use Restate where a customer already has it or where it cheaply removes commodity durability burden, without selling a runtime replacement. |

## Differentiator subtraction
If Restate is used, JCEE must not market as differentiated:
- durable execution;
- generic retries/recovery;
- durable RPC;
- keyed serialization;
- generic idempotent invocation;
- workflow state durability;
- basic execution journal replay.

## JCEE semantics that remain necessary
1. current/cause-fresh authority decision at consequence admission;
2. exact externally governed effect binding;
3. material dependency/currentness closure;
4. target-side observation of actual external effect;
5. explicit ambiguity state after commit-before-ack or uncertain target state;
6. recovery action authority independent of retry capability;
7. canonical JCEE receipt construction and independent verification.

## Infrastructure recommendation
Restate is the strongest candidate for a future **optional general-purpose execution substrate plug** because it offloads the largest amount of commodity execution machinery while remaining deployable as SaaS, BYOC, or self-hosted open source.

## Architecture verdict
`QUALIFY_RESTATE_AS_OPTIONAL_PLUG_CANDIDATE`

Qualification is architectural/documentary only. No implementation, migration, production adoption, or VOW rewrite is authorized.