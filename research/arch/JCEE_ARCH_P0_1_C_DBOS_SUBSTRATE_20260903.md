# JCEE-ARCH-P0.1 — Architecture C: DBOS_SUBSTRATE

Status: **ADJUDICATED / OPTIONAL-PLUG CANDIDATE**
Date: 2026-09-03

## Role
DBOS is evaluated as an optional durable workflow/database substrate for Postgres-centric deployments. It does not replace VOW or the JCEE consequence/evidence stack.

## Strongest-faithful DBOS surface
Current official DBOS material supports:
- open-source durable workflow library built on Postgres;
- workflow/step checkpointing to Postgres;
- exactly-once application database transactions when application writes and DBOS durability record commit atomically;
- workflow IDs and exactly-once persisted workflow outcomes;
- conflict detection/parking for concurrent or zombie executions;
- distributed recovery with executor IDs and DBOS Conductor;
- DBOS Cloud managed hosting/recovery;
- Conductor workflow management/observability;
- application deployment portability because DBOS Transact can run anywhere with Postgres.

Official sources accessed 2026-09-03:
- https://docs.dbos.dev/architecture
- https://docs.dbos.dev/production/workflow-recovery
- https://docs.dbos.dev/explanations/concurrent-executions
- https://docs.dbos.dev/golang/tutorials/step-tutorial
- https://docs.dbos.dev/golang/tutorials/transaction-tutorial
- https://docs.dbos.dev/production/dbos-cloud/deploying-to-cloud
- https://www.dbos.dev/dbos-pricing

## Critical boundary
DBOS documents that ordinary external-service steps execute at least once: if the process crashes after the side effect but before checkpointing, the step executes again on recovery. DBOS's strongest exactly-once guarantee applies when the application write and DBOS durability record share the same supported database transaction. Therefore arbitrary payment/API/control-plane effects remain outside its strongest atomic boundary unless the external target supplies its own idempotency/reconciliation semantics.

## Evaluation

| Dimension | Judgment | Rationale |
|---|---|---|
| Comparator-property preservation | STRONG_FOR_DB-CENTRIC_WORKFLOWS_IF_ADAPTER_IS_STRICT | JCEE can retain consequence/evidence semantics while DBOS handles workflow/database durability. No implementation proof yet. |
| Commodity durability offloaded | HIGH_IN_POSTGRES_SCOPE | Workflow checkpoints, recovery, DB transactions, queues and ownership conflict handling can be offloaded. |
| JCEE-specific semantics retained | YES_IN_ARCHITECTURE | Current authority, external-effect binding/observation and recovery authority remain JCEE responsibilities. |
| Added external TCB | MEDIUM | DBOS library/schema plus Postgres and optionally Conductor/Cloud. |
| Security/credential surface | MEDIUM | DBOS application database becomes a critical durability substrate; Conductor/Cloud adds management plane if used. |
| Solo-founder operations burden | LOW_TO_MEDIUM | Core DBOS requires no orchestration server beyond Postgres, but distributed recovery/production operations are stronger with Conductor/Cloud. |
| Latency | DATABASE_CHECKPOINT_OVERHEAD | DBOS documents database writes per workflow/step; no JCEE-specific latency benchmark has been run. |
| Infrastructure/storage burden | LOW_IF_POSTGRES_ALREADY_PRESENT | Strong fit when a JCEE/customer deployment already operates Postgres. |
| Provider lock-in | LOW_TO_MEDIUM | Open-source library and own Postgres reduce cloud lock-in, but application code becomes coupled to DBOS workflow/checkpoint semantics. |
| Failure-domain additions | LOW_TO_MEDIUM | Core deployment adds DBOS schema/library to existing Postgres; Conductor/Cloud adds another control plane. |
| Evidence independence | COMPLEMENTARY | DBOS checkpoint/outcome history proves its durable workflow state, not arbitrary external sink acceptance. |
| External-effect ambiguity | RESIDUAL_REMAINS | At-least-once external steps preserve commit-before-checkpoint ambiguity unless target handles it. |
| Reversibility/removability | MODERATE | Library annotations/workflow semantics can couple more directly to application code than a remote substrate; strict adapter isolation is required to keep replacement feasible. |
| Integration complexity | MEDIUM_TO_HIGH_IF_RETROFITTED_INTO_VOW_CORE | Better as a bounded adapter for Postgres-centric workloads than as a rewrite of VOW internals. |
| Commercial integration posture | STRONG_FOR_POSTGRES_CENTRIC_CUSTOMERS | Particularly attractive where customer/JCEE state already lives in Postgres and atomic application DB effects matter. |

## Differentiator subtraction
If DBOS is used, JCEE must not claim as differentiated:
- generic durable workflows on Postgres;
- exactly-once DB mutations within one DBOS/Postgres transaction;
- zombie/concurrent workflow outcome ownership;
- distributed workflow recovery;
- workflow checkpoint/replay mechanics.

## JCEE semantics that remain necessary
1. current/cause-fresh consequence authority;
2. exact binding to externally governed effect;
3. target-side observation outside the DB transaction;
4. ambiguity classification after external commit-before-checkpoint/ack;
5. non-broadening recovery authority;
6. canonical JCEE receipt/evidence and independent verification.

## Infrastructure recommendation
DBOS is the strongest candidate for a future **optional Postgres-centric plug**, not the preferred universal substrate. Its key advantage over Restate is the ability to atomically combine application database writes and durability records when they share Postgres. Its limitation is greater application/database coupling and narrower benefit for arbitrary external effects.

## Architecture verdict
`QUALIFY_DBOS_AS_OPTIONAL_PLUG_CANDIDATE`

Qualification is architectural/documentary only. No implementation, migration, production adoption, or VOW rewrite is authorized.