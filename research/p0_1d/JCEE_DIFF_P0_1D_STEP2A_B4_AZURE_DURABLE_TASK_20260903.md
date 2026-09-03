# JCEE-DIFF-P0.1D Step 2A — B4 Azure Durable Task Target Packet

Status: **ADJUDICATED / DOCUMENTARY TECHNICAL PASS**
Date: 2026-09-03
Parent: `JCEE_DIFF_P0_1D_STEP2A_DURABLE_SUBSTRATE_ASSAULT_FREEZE_20260903.md`

## Target workflow
A Durable Task orchestration coordinates one consequential external effect through an Activity, optionally using Durable Entities/locks for state and ownership coordination. The attack boundary is the failure interval after the external target may have committed but before Activity completion is recorded in durable orchestration state.

## Strongest-faithful native composition
Grant Azure Durable Task:
- durable orchestration instance identity/history/checkpointing;
- automatic recovery and retries;
- durable entities with unique IDs and serialized operation processing;
- durable entity locks/critical sections where supported;
- singleton orchestration patterns using fixed instance IDs;
- external events and unique event IDs for deduplication;
- strongest supported storage backend semantics, including transactional MSSQL event ingestion where applicable;
- Azure status/instance query and Event Grid observability.

Do not treat Durable Entity locks or orchestration history as an atomic transaction with arbitrary external services.

## Primary official evidence
1. Durable Task programming model: Activities are guaranteed at-least-once; if failure occurs after an Activity completes but before the result is recorded, the runtime may rerun it; Microsoft recommends idempotent Activity logic. https://learn.microsoft.com/en-us/azure/durable-task/common/programming-model-overview
2. Durable Entities: entity operations are serialized; locks are durable; critical sections do not automatically roll back effects and Microsoft explicitly notes that external service calls may be impossible to roll back. https://learn.microsoft.com/en-us/azure/durable-task/common/durable-task-entities
3. External events: events have at-least-once delivery under some backends/failure conditions and Microsoft recommends unique IDs/manual deduplication; MSSQL can consume event+state transactionally within that backend. https://learn.microsoft.com/en-us/azure/durable-task/common/durable-task-external-events
4. Singleton orchestrators: fixed instance IDs plus status checks can prevent duplicate concurrent orchestration instances. https://learn.microsoft.com/en-us/azure/durable-task/common/durable-task-singletons
5. Durable orchestration overview: orchestration state is checkpointed and event sourced for recovery. https://learn.microsoft.com/en-us/azure/durable-task/common/durable-task-orchestrations

## H01–H14 matrix
| Case | Judgment | Finding |
|---|---|---|
| H01 authority revoke before action | RESIDUAL | Durable Task is not a native general authorization-currentness system. |
| H02 revoke after authorization | RESIDUAL | External authorization check and later external Activity effect are not one atomic native transition. |
| H03 authority ABA | RESIDUAL | Version/incarnation semantics must be modeled explicitly. |
| H04 material dependency mutation | CLOSED_NATIVE for entity-owned state; RESIDUAL for arbitrary external dependency | Entity serialization/locks can protect owned state. |
| H05 dependency ABA | RESIDUAL outside explicitly versioned entity state | No generic native external incarnation binding. |
| H06 target-state race | RESIDUAL for external target | Durable locks coordinate entities, not arbitrary external target state. |
| H07 concurrent same-op workers | CLOSED_NATIVE for singleton/entity ownership patterns; RESIDUAL at external Activity effect boundary | Orchestration/entity identity can prevent duplicate logical owners, but Activity execution is at-least-once. |
| H08 crash after external commit/before result record | RESIDUAL | This is explicitly within Microsoft's at-least-once Activity failure model. |
| H09 lost response | RESIDUAL | Safe retry requires idempotent target logic or authoritative reconciliation/query. |
| H10 duplicate retry | CLOSED_NATIVE_WITH_COST for orchestration identity/event dedup; RESIDUAL for non-idempotent external Activity | Logical orchestration/event duplicates can be controlled; external effect remains separate. |
| H11 dependency host unavailable | CLOSED_NATIVE | Durable orchestration persists and can retry/wait rather than fabricate success. |
| H12 authority/evidence host unavailable | CLOSED_NATIVE_WITH_COST | Orchestration can wait/fail; authority-specific fail-closed policy is application-defined. |
| H13 partial/batch ambiguity | RESIDUAL | Orchestration can model compensation, but target-side committed subset must be externally observed. |
| H14 recovery-permission ambiguity | RESIDUAL | Durable Task supplies mechanics, not native current-authority proof for retry/compensate/reconcile. |

## Four-property matrix
| Property | Judgment |
|---|---|
| Current authority | RESIDUAL |
| Exact effect binding | STRONG for orchestration/entity state; RESIDUAL for arbitrary Activity external side effect |
| Unique execution ownership | STRONG at orchestration/entity level; RESIDUAL for external Activity attempt/effect boundary |
| Independently verifiable receipt closure | STRONG for recorded orchestration history; RESIDUAL for external target commit before Activity result is recorded |

## Mandatory execution-ownership analysis
Azure Durable Task strongly falsifies broad claims around durable workflow identity and keyed ownership. Durable Entities serialize operations, locks persist across process recycling, and singleton orchestration IDs can prevent duplicate concurrent orchestration instances.

But the Activity is the external-effect boundary. Microsoft explicitly documents that an Activity may rerun after it already completed if the completion result was not durably recorded. Thus logical orchestration ownership does not by itself prove unique ownership/cardinality of a non-idempotent external effect.

## Ambiguity/recovery analysis
The framework durably knows the orchestration's recorded state. In a commit-before-recording failure, that state may correctly lack proof of the external effect. Recovery therefore needs target idempotency, target-side query/reconciliation, or application-specific effect records. Durable Entity locks do not solve this because they are not cross-system transactions and cannot automatically roll back remote effects.

## Technical verdict
**`RESIDUAL_PROPERTY`**

Exact residual:
> Azure Durable Task natively closes durable orchestration state, logical instance identity, retries, and strong entity-local coordination, but external Activities are explicitly at-least-once. An arbitrary consequential effect that commits before Activity completion is recorded can therefore remain ambiguous or repeat unless the target/application supplies idempotency/reconciliation; current authority and recovery permission also remain external/application semantics.

## What Azure Durable Task kills as JCEE differentiators
- durable orchestration and replay;
- singleton orchestration identity;
- durable entity/keyed coordination;
- durable cross-process locks for entity state;
- automatic retries and external-event waiting;
- orchestration status/history observability alone.

## Infrastructure significance for JCEE
Azure Durable Task is a credible enterprise/customer-native integration target, especially where a buyer is already committed to Azure. It does not appear to justify moving JCEE's core onto Azure simply to gain durable workflow primitives. Restate remains the stronger substrate-adoption candidate for a provider-neutral JCEE execution layer.

## JCEE-EVALS-P0.1B
- contract ID: `JCEE-DIFF-P0.1D-STEP2A-B4-AZURE-DURABLE-TASK`
- validity: frozen before adjudication
- native judgment: official Microsoft documentary reconstruction
- independence: official Microsoft docs; no live Azure harness
- claim ceiling: documentary residual only

## Next authority
Proceed to Step 2A synthesis. No platform adoption/build authority.