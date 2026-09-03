# JCEE-DIFF-P0.1D — B1 Temporal Target Packet

Status: **ADJUDICATED / DOCUMENTARY TECHNICAL PASS**
Date: 2026-09-03
Comparator: `JCEE_DIFF_P0_1D_COMPARATOR_CONTRACT_20260903.md`
Benchmark selection: B1 — Temporal

## Target workflow
A Temporal Workflow orchestrates one consequential external effect through an Activity. The hostile boundary is the distributed interval in which the external sink may durably accept the effect but the Activity Worker crashes, times out, or loses connectivity before Temporal durably records Activity completion.

## Strongest-faithful native composition
Grant Temporal all legitimate controls documented for this workflow:
- durable Workflow Execution and Event History;
- Activity retries/timeouts and retry policy control;
- stable Workflow/Activity identity usable to derive an idempotency key;
- Activity result/history replay after Temporal has durably recorded completion;
- explicit compensation/recovery logic in Workflow code;
- a sink-provided idempotency key or result-query API when the sink legitimately offers one.

The last item is recorded as sink capability, not as a Temporal-native guarantee.

## Primary official evidence
1. Temporal documentation repository, Workflow Execution Events / Event History: Temporal durably persists an append-only Event History used for crash recovery; Activity retry is scheduled after retryable failure or timeout. https://github.com/temporalio/documentation/blob/main/docs/encyclopedia/workflow/workflow-execution/event.mdx
2. Temporal Platform Hub AI Engineering Patterns: Activities have at-least-once execution semantics and write-side Activities should use an idempotency key for operations such as trades or record mutation. https://go.temporal.io/platform-hub/ai-engineering/ai-patterns
3. Temporal training material, Activity idempotency: Activities are automatically retried and should be idempotent to prevent duplicate side effects. https://learn.temporal.io/assets/files/temporal-102-with-java-replay2025-468b8109d5a9ce33b36c2910c48433d9.pdf
4. Temporal technical guide on durable execution describes the cross-system boundary where an external API plus a second durable store makes consistency materially harder and uses an idempotency token/check as the recovery mechanism. https://assets.temporal.io/durable-execution.pdf

Community/support material was used only as corroboration, not as the sole basis for terminal judgment.

## H01–H14 matrix

| Case | Judgment | Strongest-faithful finding |
|---|---|---|
| H01 authority revoke before action | RESIDUAL | Temporal is not a native authorization-currentness system; a Workflow can call one, but current authority must be supplied by another system/application. |
| H02 revoke after lease/check | RESIDUAL | Temporal does not make a remote authorization decision atomic with a later external effect. |
| H03 authority ABA | RESIDUAL | Incarnation/version semantics must be provided by an external authority system/application. |
| H04 dependency mutation | RESIDUAL | Workflow state is durable, but arbitrary material external dependencies are not automatically revalidated at the sink boundary. |
| H05 dependency ABA | RESIDUAL | External dependency incarnation/version binding is application/sink logic. |
| H06 target-state race | RESIDUAL | A target CAS/version check can close this if the target provides it; Temporal does not itself serialize the external target. |
| H07 concurrent same operation | RESIDUAL | Activity execution can repeat. Safe effect cardinality requires idempotent target semantics/application logic. Event History does not itself prove which Activity attempt durably caused an external sink effect. |
| H08 crash after commit/before response | RESIDUAL | This is the explicit Activity-idempotency edge: external effect can occur before Temporal records completion, causing retry. Closure requires sink idempotency/result observation. |
| H09 lost response | RESIDUAL | Same distributed boundary as H08; Temporal can retry, but the target must make retry safe or expose result observation. |
| H10 duplicate retry | CLOSED_NATIVE_WITH_COST | Temporal supplies repeatable logical Activity identity and retry machinery, but effect deduplication is closed only when target/application idempotency is supplied. Cost/dependency retained. |
| H11 dependency host unavailable | CLOSED_NATIVE | Temporal durably preserves workflow progress and can retry/timeout rather than manufacture a success when an Activity dependency is unavailable. |
| H12 authority/evidence host unavailable | CLOSED_NATIVE_WITH_COST | Workflow can fail/abstain/retry, but fail-closed authority semantics are application policy rather than intrinsic Temporal authorization semantics. |
| H13 partial/batch ambiguity | RESIDUAL | Temporal can model branches/compensation, but proof of which external subset committed depends on target-side evidence. |
| H14 recovery permission ambiguity | RESIDUAL | Workflow code can encode recovery policy; Temporal does not natively prove that current external authority permits retry/compensate/reconcile. |

## Four-property matrix

| Property | Judgment |
|---|---|
| Current authority | RESIDUAL |
| Exact effect binding | RESIDUAL for external effects unless target supplies native idempotency/version semantics |
| Unique execution ownership | RESIDUAL at the external acceptance boundary |
| Independently verifiable receipt closure | RESIDUAL for commit-before-ack external effects unless target supplies authoritative observation |

## Mandatory execution-ownership analysis
1. More than one Activity attempt can execute: yes, under retries/timeouts.
2. More than one external effect can materialize: possible if target call is non-idempotent.
3. Temporal Event History can identify Activity lifecycle/attempt information after Temporal records terminal state, but that is not equivalent to proving which attempt was accepted by an external sink before an acknowledgment was lost.
4. Unique effect winner must therefore be established at the sink or by a sink-recognized idempotency/ownership mechanism.
5. A verifier can reconstruct Temporal orchestration history, but cannot infer external acceptance from Temporal history alone in the ambiguous commit-before-ack case.

## Mandatory ambiguity/recovery analysis
Temporal is strong at preserving the fact that work remains incomplete and at replaying Workflow state. It does not falsely need to declare an external effect successful. But the exact answer to “did the sink accept the effect?” is outside Temporal unless the sink provides an idempotency or query/reconciliation surface. Retrying a non-idempotent sink is not made safe merely by Temporal durability.

## Technical verdict

**`RESIDUAL_PROPERTY`**

Exact residual:
> Temporal natively closes durable orchestration and workflow recovery, but it does not by itself close the external acceptance boundary when an Activity's consequential effect may commit before Temporal receives/records completion. End-to-end exact-effect cardinality, unique external execution ownership, and receipt closure then depend on sink-provided idempotency/reconciliation or additional application state.

## Integration-burden observation
Closing the residual is often practical but non-zero: the application must carry a stable operation key into the sink, use a target CAS/idempotency facility or maintain an acceptance ledger, and query/reconcile the target after ambiguous failures. For a sink without such capabilities, Temporal alone cannot supply the missing fact.

## Economic status
`NOT_EVALUATED_STEP_2` — benchmark falsification only.

## JCEE-EVALS-P0.1B
- contract ID: `JCEE-DIFF-P0.1D-B1-TEMPORAL`
- validity: comparator and benchmark frozen before adjudication
- native judgment: strongest-faithful Temporal documentary reconstruction
- cross-program judgment: comparator H01–H14
- independence: official Temporal documentation/training; no live Temporal sandbox run in this packet
- claim ceiling: documentary technical residual only

## Claim ceiling
This does not show JCEE is superior to Temporal, nor that Temporal cannot participate in a full closure composition. It shows only that the full comparator is not a Temporal-native end-to-end guarantee at an arbitrary external sink boundary.