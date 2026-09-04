# JCEE-ARCH-P0.1 — Architecture A: VOW_REFERENCE_NATIVE

Status: **ADJUDICATED / REFERENCE BASELINE**
Date: 2026-09-03
Frozen VOW reference: `release/vow-1.1-verified-20260812` in `jonchadbourne21-rgb/vow-wow`

## Role
VOW remains the JCEE-native reference execution runtime. This architecture keeps all durability/retry/recovery machinery that VOW currently owns inside JCEE.

## Grounded native surface
The frozen VOW 1.1 release documents:
- optional causal-effect retry gate for ambiguous crash recovery;
- typed adapter receipts and outcomes `safe_to_retry`, `do_not_retry`, `observe_first`;
- non-broadening recovery gate: it may veto/delay a retry but cannot convert wait/refusal into permission;
- hash-chained `effect_recovery_decision` evidence;
- durability journal and same-logical-run resume;
- PostgreSQL durability parity for journaled runs/resume/suspension/approvals/sweep;
- atomic claim for concurrent resume/decision;
- signed traces / engine hash / verification tooling;
- REST and subprocess integration surfaces.

Primary repository evidence:
- `README.md` blob `5a8db8d69fc939f55f86417ea0d1fd0a86336422`
- `ARCHITECTURE.md` blob `600507bb82f08fb82bceeb2d8dcf23146b4bd699`

## Evaluation

| Dimension | Judgment | Rationale |
|---|---|---|
| Comparator-property preservation | STRONGEST_REFERENCE | VOW/JCEE directly expresses the consequence/recovery/evidence semantics under test. |
| Commodity durability offloaded | NONE | JCEE owns run journal, resume, claims, retries, suspension and related machinery. |
| JCEE-specific semantics retained | FULL | No translation boundary. |
| Added external TCB | LOW | No additional durable-execution vendor/runtime required beyond chosen data stores/targets. |
| JCEE-owned TCB/maintenance | HIGHER | JCEE must maintain and harden its own durability/runtime implementation. |
| Security/credential surface | CONTROLLED_BUT_OWNED | Fewer substrate credentials, but JCEE owns the execution runtime and its hardening. |
| Solo-founder operations burden | MEDIUM_TO_HIGH_FOR_PRODUCTION_SCALE | Current evidence proves bounded runtime behavior, not a managed HA production service. |
| Provider lock-in | LOW | VOW is JCEE-owned and supports multiple data backends/integration surfaces. |
| External-effect ambiguity behavior | STRONG_JCEE_SEMANTICS | `observe_first`/non-broadening recovery is directly modeled, but actual target observation still depends on adapters/target evidence. |
| Evidence independence | STRONG_CANONICAL_JCEE_LAYER | Canonical JCEE evidence is native; target truth still must be separately observed for externally governed effects. |
| Reversibility | MAXIMUM | No third-party execution substrate to remove. |
| Commercial integration posture | HEAVIER | A customer may need to adopt more JCEE runtime machinery even when they already possess durable execution. |

## What must remain even if substrate plugs are later qualified
The following are not candidates for commodity offload merely because a substrate has retries or a journal:
1. authority/effect admission contract;
2. QCS/DCC currentness decision semantics;
3. non-broadening recovery authority;
4. target observation semantics;
5. ambiguity classification;
6. canonical JCEE receipt/evidence format and independent verification;
7. VOW reference implementation and adversarial/scientific reproduction role.

## What may be commodity rather than differentiated
The following VOW functions are valuable but cannot be assumed to be a moat after Step 2A:
- generic workflow durability;
- retry scheduling;
- checkpoint/replay mechanics;
- generic run ownership/claiming;
- durable waits/timers;
- generic workflow progress storage.

VOW may continue to implement these for reference/fallback purposes. Their presence should not be used as a uniqueness claim.

## Architecture verdict
`KEEP_AS_REFERENCE_AND_FALLBACK_BASELINE`

This is not a production-readiness finding and does not authorize new VOW engineering.