# JCEE-DIFF-P0.1D Step 2A — B1 DBOS Target Packet

Status: **ADJUDICATED / DOCUMENTARY TECHNICAL PASS**
Date: 2026-09-03
Parent: `JCEE_DIFF_P0_1D_STEP2A_DURABLE_SUBSTRATE_ASSAULT_FREEZE_20260903.md`

## Target workflow
A DBOS workflow invokes one consequential external API effect as a step. The attack boundary is the failure window after the external sink may have accepted the effect but before the step checkpoint is durable. Separately, evaluate a supported DBOS datasource transaction where the consequential effect is a database write inside the same transaction.

## Strongest-faithful native composition
Grant DBOS:
- globally unique workflow IDs used as workflow idempotency keys;
- workflow recovery from the last completed step;
- DBOS concurrent-execution conflict detection and outcome ownership semantics;
- workflow outcome persistence exactly once;
- datasource transactions that atomically commit application database writes and DBOS durability records;
- documented step retries and checkpointing;
- official workflow retrieval/status facilities.

Do not extend datasource-transaction atomicity to arbitrary external HTTP/payment/cloud effects.

## Primary official evidence
1. DBOS Concurrent Executions: simultaneous/zombie executions can exist; DBOS detects conflicting step/outcome checkpoints, parks the execution that no longer owns the outcome, and delivers the recorded outcome. https://docs.dbos.dev/explanations/concurrent-executions
2. DBOS Workflows: workflow IDs are idempotency keys; workflows recover; steps are at-least-once; transactions commit exactly once. https://docs.dbos.dev/typescript/tutorials/workflow-tutorial
3. DBOS Steps: if a process crashes after a step's side effects but before checkpointing, the step re-executes. https://docs.dbos.dev/golang/tutorials/step-tutorial
4. DBOS Transactions & Datasources: application writes and DBOS durability record can commit atomically in one database transaction, giving exactly-once execution across recovery. https://docs.dbos.dev/golang/tutorials/transaction-tutorial

## H01–H14 matrix
| Case | Judgment | Finding |
|---|---|---|
| H01 authority revoke before action | RESIDUAL | DBOS does not provide a native authorization-currentness service; application/authority system must supply it. |
| H02 revoke after authorization/lease | RESIDUAL | No native rule atomically binds an external authorization decision to a later arbitrary external effect. |
| H03 authority ABA | RESIDUAL | Authority version/incarnation semantics are external/application concerns. |
| H04 material dependency mutation | RESIDUAL | DBOS can durably sequence application logic, but arbitrary external dependencies require explicit checks/version binding. |
| H05 dependency ABA | RESIDUAL | No generic native incarnation binding for arbitrary external dependency state. |
| H06 target-state race | CLOSED_NATIVE within supported datasource transaction; RESIDUAL for arbitrary external target | DB transaction isolation/CAS can close in-database races; external sink race remains sink/application dependent. |
| H07 concurrent same-op workers | CLOSED_NATIVE for workflow outcome ownership; RESIDUAL for arbitrary external side-effect ownership before step checkpoint | DBOS directly addresses zombie executors and prevents two executions from durably owning the workflow outcome. An external step can still have side effects before the losing/concurrent execution is fenced at checkpoint. |
| H08 crash after external commit/before checkpoint | RESIDUAL | Official step semantics explicitly allow re-execution after side effect but before checkpoint. |
| H09 lost response | RESIDUAL | Safe closure requires external idempotency/reconciliation or target observation. |
| H10 duplicate retry | CLOSED_NATIVE at workflow-ID level; RESIDUAL at non-idempotent external step | Same workflow ID executes once logically, but an interrupted uncheckpointed external step can repeat. |
| H11 dependency host unavailable | CLOSED_NATIVE | Workflow can persist/retry rather than fabricate completion. |
| H12 authority/evidence host unavailable | CLOSED_NATIVE_WITH_COST | DBOS can keep workflow incomplete/failing, but authority-specific fail-closed semantics are application policy. |
| H13 partial/batch ambiguity | RESIDUAL | DBOS can durably sequence steps but external subset-commit truth still comes from targets. |
| H14 recovery-permission ambiguity | RESIDUAL | DBOS provides recovery mechanics, not native proof that current authority permits a consequential retry/compensation. |

## Four-property matrix
| Property | Judgment |
|---|---|
| Current authority | RESIDUAL |
| Exact effect binding | CLOSED within supported atomic DB transaction; RESIDUAL for arbitrary external effect |
| Unique execution ownership | STRONGLY CLOSED for DBOS workflow outcome; RESIDUAL for pre-checkpoint external effect attribution |
| Independently verifiable receipt closure | CLOSED for DBOS-recorded workflow/checkpoints; RESIDUAL for external commit-before-checkpoint without target evidence |

## Mandatory execution-ownership analysis
DBOS is a direct falsifier of the simplistic R2C claim. It can allow multiple concurrent/zombie executors while still ensuring that only one execution owns the durable workflow outcome; the loser is parked or receives a conflict rather than becoming a second durable owner. Therefore JCEE must not claim that unique workflow execution/outcome ownership is itself novel or differentiating.

However, if both executions reach an arbitrary external side-effecting step, the external side effect can precede the DBOS checkpoint. DBOS's conflict at checkpoint protects DBOS durable state, not necessarily the already-accepted external effect. The target must supply idempotency/CAS/reconciliation or the application must add equivalent closure logic.

## Ambiguity/recovery analysis
For datasource transactions, DBOS is extremely strong: application mutation and durability evidence can be committed in one atomic database transaction, and recovery replays the recorded outcome. This closes the comparator for that narrow in-transaction effect class except current authorization unless authority is also represented inside the same transaction.

For arbitrary external API effects, the documented step boundary remains at-least-once. Crash after sink acceptance but before checkpoint can cause re-execution. DBOS therefore preserves durable workflow recovery but cannot infer external sink truth from its own checkpoint state alone.

## Technical verdict
**`RESIDUAL_PROPERTY`**

Exact residual:
> DBOS strongly closes workflow-level idempotency, concurrent execution outcome ownership, and exactly-once database effects when the application effect shares a supported atomic database transaction with DBOS durability. Its native guarantee does not extend exactly-once ownership or receipt closure across an arbitrary external effect that may commit before a DBOS step checkpoint, and it does not natively bind current external authority to that effect or to later recovery.

## What DBOS kills as JCEE differentiators
- unique workflow ID / workflow idempotency;
- durable workflow recovery;
- single durable workflow outcome ownership under zombie executors;
- exactly-once database mutation when runtime durability participates in the same transaction.

## Infrastructure significance for JCEE
DBOS is a credible substrate candidate if JCEE wants to stop owning commodity workflow durability. It is particularly attractive when the consequential target is a supported SQL database. It does not remove the need for a cross-boundary consequence-assurance layer for arbitrary payments, deployments, infrastructure APIs, or other external effects.

## JCEE-EVALS-P0.1B
- contract ID: `JCEE-DIFF-P0.1D-STEP2A-B1-DBOS`
- validity: target/order/attack frozen before adjudication
- native judgment: official DBOS documentary reconstruction
- independence: official documentation, no live DBOS harness
- claim ceiling: documentary residual; no superiority/novelty/production claim

## Next authority
No build or DBOS adoption authorized. Continue to B2 Restate.