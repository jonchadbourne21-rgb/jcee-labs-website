# JCEE-DIFF-P0.1D Step 2A — Durable-Execution Substrate Assault

Status: **FROZEN / PRE-ADJUDICATION**
Date: 2026-09-03
Parent comparator: `research/JCEE_DIFF_P0_1D_COMPARATOR_CONTRACT_20260903.md`
Parent Step 2 synthesis: `research/p0_1d/JCEE_DIFF_P0_1D_STEP2_SYNTHESIS_20260903.md`

## Purpose
Attack the surviving JCEE residual hypothesis against durable-execution substrates that may close more of concurrency ownership, retry semantics, checkpointing, transactionality, and recovery than the first benchmark set.

No new JCEE engineering is authorized by this gate.

## Frozen target order
1. DBOS
2. Restate
3. Cloudflare Durable Objects
4. Azure Durable Task

Targets may not be removed or replaced because they close more of the comparator than expected. Later additions require a dated addendum.

## Frozen attack boundary
For each target, grant every legitimate native capability and realistic supported composition. Then place one irreversible or externally durable consequential effect immediately beyond the target's strongest atomic/durable ownership boundary.

The system is tested against the frozen JCEE-DIFF-P0.1D comparator:
`CURRENT_AUTHORITY + EXACT_EFFECT_BINDING + UNIQUE_EXECUTION_OWNERSHIP + INDEPENDENTLY_VERIFIABLE_RECEIPT_CLOSURE`
through ambiguity and recovery.

The decisive question is:
> Can the substrate still close current authority, exact effect, unique execution ownership/non-conflicting attribution, and independently verifiable recovery closure when the consequential external effect is outside the substrate's own strongest atomic transaction boundary, without requiring application-specific glue that independently implements the missing comparator property?

## Strongest-faithful rule
Each target receives all documented native controls, including where applicable:
- durable workflow/function execution;
- workflow/invocation IDs;
- checkpoint/event/journal history;
- exactly-once transaction semantics within supported transactional boundaries;
- at-least-once step/activity semantics where documented;
- concurrency serialization/ownership controls;
- durable object/keyed state;
- retries and deduplication;
- target/service invocation IDs;
- transaction coordinators or prepared-transaction support;
- native cloud audit/observability that is part of the product guarantee.

Do not grant the substrate an external target's idempotency, CAS, transaction, or reconciliation API as if it were native to the substrate. Such target capabilities may be included in a strongest-faithful composition, but the dependency and integration burden must remain explicit.

## Required outcomes
Each target receives only:
- `NATIVE_CLOSURE`
- `RESIDUAL_PROPERTY`
- `INDETERMINATE`

Any residual must be narrower than the product's documented native guarantee. Uncertainty is not a JCEE advantage.

## Special falsification rules
1. A system that uniquely owns a workflow execution but not an external effect does not automatically close `UNIQUE_EXECUTION_OWNERSHIP` for that effect.
2. Multiple workers receiving the result of one completed logical operation is not a failure if native semantics clearly mean reconciliation/completion rather than independent execution ownership.
3. Exactly-once execution inside a database transaction does not automatically extend to arbitrary external HTTP/payment/infrastructure effects.
4. A durable journal proves what the substrate recorded; it does not alone prove what an external sink accepted before an acknowledgment was lost.
5. If a target can atomically include the consequential effect inside its own transaction boundary, score that workflow honestly as closed within scope; then separately test the required external-effect boundary.

## Gate disposition
Step 2A may only:
- kill or narrow the residual hypothesis;
- identify a stronger substrate worth adopting as JCEE infrastructure;
- preserve a narrower cross-boundary residual for commercial testing;
- return `INDETERMINATE` where authoritative evidence is insufficient.

No adapter, migration, platform adoption, or QCS/DCC/VOW rewrite is authorized by documentary success alone.