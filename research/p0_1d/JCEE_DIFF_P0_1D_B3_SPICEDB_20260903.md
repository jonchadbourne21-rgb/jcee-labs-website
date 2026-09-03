# JCEE-DIFF-P0.1D — B3 Authzed / SpiceDB Target Packet

Status: **ADJUDICATED / DOCUMENTARY TECHNICAL PASS**
Date: 2026-09-03
Comparator: `JCEE_DIFF_P0_1D_COMPARATOR_CONTRACT_20260903.md`
Benchmark selection: B3 — Authzed / SpiceDB

## Target workflow
A consequential application checks whether principal P may perform action A on resource R, then later performs an external consequential effect. The attack is whether SpiceDB's native consistency/currentness mechanisms can close the authority portion strongly enough that the full comparator collapses into ordinary effect execution/recovery.

## Strongest-faithful native composition
Grant SpiceDB all documented native controls:
- CheckPermission with per-request consistency selection;
- ZedTokens;
- `at_least_as_fresh` checks causally tied to prior writes;
- `at_exact_snapshot` where appropriate;
- `fully_consistent` checks where appropriate;
- expiring relationships;
- caveats/contextual permission evaluation;
- Watch API for relationship changes;
- storing ZedTokens with application resources as explicitly recommended by Authzed.

Do not grant SpiceDB a target-effect executor, idempotency ledger, or recovery engine that it does not natively provide.

## Primary official evidence
1. Authzed Consistency docs: SpiceDB supports `minimize_latency`, `at_least_as_fresh`, `at_exact_snapshot`, and `fully_consistent`; ZedTokens represent datastore points in time and protect against the New Enemy Problem. https://authzed.com/docs/spicedb/concepts/consistency
2. Read-after-write docs: recommended production approach is ZedTokens + `at_least_as_fresh`; tokens can be stored alongside application resources. https://authzed.com/docs/spicedb/concepts/read-after-write
3. Best practices: Authzed recommends ZedTokens + `at_least_as_fresh` for correctness with caching. https://authzed.com/docs/spicedb/best-practices
4. Expiring relationships: native time-bound permissions use datastore time and expiry semantics. https://authzed.com/docs/spicedb/concepts/expiring-relationships
5. Watch API / audit: relationship changes can be streamed, but application developers are responsible for persisting audit history as needed and historical Watch availability is bounded by datastore GC. https://authzed.com/docs/spicedb/concepts/watch and https://authzed.com/docs/spicedb/modeling/access-control-audit

## H01–H14 matrix

| Case | Judgment | Strongest-faithful finding |
|---|---|---|
| H01 authority revoke before action | CLOSED_NATIVE_WITH_COST | With correct consistency selection/ZedToken handling, a permission check can be made causally fresh to revocation. Default `minimize_latency` alone is not sufficient for zero-staleness cases. |
| H02 revoke after exact authority check | RESIDUAL for full consequential workflow | SpiceDB can prove what was authorized at a revision/check point, but it does not atomically bind that authorization result to a later external effect. |
| H03 authority ABA/incarnation | CLOSED_NATIVE_WITH_COST for authorization decision | Revision/ZedToken semantics distinguish datastore history and can prevent treating an older snapshot as causally fresh when the caller uses them correctly. |
| H04 dependency mutation | CLOSED_NATIVE if dependency is represented in SpiceDB authorization data; otherwise RESIDUAL | SpiceDB can re-evaluate represented relationships/caveats at a chosen revision but does not govern arbitrary external material dependencies. |
| H05 dependency ABA | CLOSED_NATIVE if represented/versioned in SpiceDB; otherwise RESIDUAL | Same scope boundary. |
| H06 target-state race | NOT_APPLICABLE_NATIVE_SCOPE to SpiceDB itself / RESIDUAL in proposed consequential workflow | SpiceDB does not serialize the external target. |
| H07 concurrent same-operation workers | RESIDUAL | Authorization checks can independently allow both workers. SpiceDB does not assign unique execution ownership or deduplicate effects. |
| H08 crash after external commit/before response | RESIDUAL | Outside SpiceDB's effect boundary; no target reconciliation guarantee. |
| H09 lost response | RESIDUAL | Same. |
| H10 duplicate retry | RESIDUAL | Authorization system does not deduplicate the external effect. |
| H11 dependency/SpiceDB host unavailable | CLOSED_NATIVE_WITH_COST / workflow-policy dependent | Caller can fail closed rather than infer permission from absence; availability/fallback behavior belongs to the application integration. |
| H12 authority host unavailable | CLOSED_NATIVE_WITH_COST | Correct consequential use is to abstain/fail closed unless a separately valid bounded authorization token/certificate exists; SpiceDB itself does not manufacture allow from missing evidence. |
| H13 partial/batch ambiguity | RESIDUAL | Effect-subset evidence is outside authorization scope. |
| H14 recovery permission ambiguity | RESIDUAL | SpiceDB can answer a fresh permission question for a proposed recovery action if modeled, but it does not determine what external effect previously occurred or which recovery action is semantically appropriate. |

## Four-property matrix

| Property | Judgment |
|---|---|
| Current authority | **STRONGLY CLOSED_NATIVE_WITH_COST** when ZedTokens/appropriate consistency are used correctly |
| Exact effect binding | RESIDUAL beyond authorization request; no native external-effect binding |
| Unique execution ownership | RESIDUAL |
| Independently verifiable receipt closure | RESIDUAL for external effect; Watch is authorization-history evidence, not effect receipt closure |

## Mandatory execution-ownership analysis
1. Two independent workers may both perform valid CheckPermission calls and both receive `HAS_PERMISSION` for the same principal/action/resource at an acceptable revision.
2. That is not a bug: SpiceDB answers authorization questions, not execution-ownership questions.
3. No native SpiceDB mechanism selected here assigns one worker ownership of a consequential external transition.
4. Therefore an external target can still require OCC/CAS/idempotency/ownership coordination even when authority freshness is fully solved.

## Mandatory ambiguity/recovery analysis
SpiceDB can materially strengthen recovery permission: a retry, refund, compensate, or resume operation can be modeled as its own action and checked at a fresh authorization revision. But SpiceDB does not establish whether the original external effect occurred after a crash/lost response. A separate target evidence source is necessary before the application can choose the correct recovery action.

## Technical verdict

**`RESIDUAL_PROPERTY`**

Exact residual:
> SpiceDB can close current authorization freshness extremely strongly within its modeled permission state, including causal revision handling through ZedTokens, but it does not natively bind that authorization decision to one external consequential effect, assign unique execution ownership, or prove the target outcome after ambiguous failure. Those properties remain outside its native authorization boundary.

This is not a defect in SpiceDB and must not be described as one.

## Differentiator impact
This benchmark substantially narrows any JCEE moat claim. **Current authority by itself is not a defensible differentiator.** Zanzibar/SpiceDB-style systems already provide strong, explicit currentness semantics. Any surviving JCEE residual must live in the composition from fresh authority through exact effect, ownership, and receipt/recovery closure.

## Integration-burden observation
A competent system can compose SpiceDB with a transactional/idempotent target and durable workflow engine. The remaining question for later benchmarks is whether that strongest-faithful composition closes the entire comparator without a substantial bespoke closure subsystem.

## Economic status
`NOT_EVALUATED_STEP_2`.

## JCEE-EVALS-P0.1B
- contract ID: `JCEE-DIFF-P0.1D-B3-SPICEDB`
- validity: comparator and target set frozen before adjudication
- native judgment: official Authzed/SpiceDB documentary reconstruction
- cross-program judgment: H01–H14
- independence: official docs, no live SpiceDB harness in Step 2
- claim ceiling: authorization-currentness closure + end-to-end residual only

## Claim ceiling
No claim that JCEE outperforms SpiceDB authorization. The opposite result is preserved: SpiceDB is stronger evidence that the authority-currentness portion is mature prior architecture and should not be commercialized as a standalone JCEE differentiator.