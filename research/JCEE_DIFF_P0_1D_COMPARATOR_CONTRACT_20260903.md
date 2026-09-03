# JCEE-DIFF-P0.1D — Native-System Residual & Integration-Burden Comparator Contract

Status: **FROZEN / PRE-COMPARISON**
Date: 2026-09-03
Branch: `jcee-diff-p0.1d-20260903`

## 1. Purpose

Determine whether real systems already close the consequential-execution property now supported by the bounded QCS+DCC R2E evidence, and if not, whether any surviving residual is economically important enough and sufficiently low-burden to justify commercial discovery or a bounded integration probe.

This gate is comparative falsification, not a novelty claim, product pitch, or engineering authorization.

No new QCS/DCC code is authorized by this contract.

## 2. Governing comparator property

A target system earns full native closure only if its strongest legitimate native composition closes all four linked properties:

`CURRENT_AUTHORITY + EXACT_EFFECT_BINDING + UNIQUE_EXECUTION_OWNERSHIP + INDEPENDENTLY_VERIFIABLE_RECEIPT_CLOSURE`

and preserves that closure through the frozen ambiguity/recovery corpus below.

The four properties are conjunctive. Failure or unresolved evidence on one element prevents `NATIVE_CLOSURE` for the whole comparator.

### 2.1 CURRENT_AUTHORITY

At the consequential boundary, the system must establish that the authority relevant to the exact action is valid under the system's own declared model. The comparison must honor legitimate lease, delegation, transaction, policy-cache, token, snapshot, or authorization semantics.

Closure requires all of the following within the system's claimed scope:
- authority is bound to the action or authorization scope the system actually promises;
- revocation/version/incarnation semantics are respected;
- stale authority is not silently promoted into broader successor permission;
- where the system intentionally permits an already-issued exact lease/capability after later revocation, that behavior is not scored as a failure if it is the documented native semantic;
- absence, ambiguity, expiry, or invalidity of required authority cannot itself create permission.

### 2.2 EXACT_EFFECT_BINDING

The consequential action being authorized and the effect ultimately materialized must be sufficiently bound under the target's native guarantees that replay, retry, substitution, partial/batch ambiguity, target-state drift, or duplicate delivery cannot legitimately broaden one authorization into a materially different effect.

Closure requires, as applicable to the target's own architecture:
- stable logical operation/effect identity;
- parameters/material effect identity bound strongly enough for the native guarantee claimed;
- target/object/account/resource identity bound strongly enough for that guarantee;
- duplicate/retry semantics do not permit a second consequential effect for the same logical operation where exactly-once/idempotent closure is claimed;
- stale or changed target state is rejected, revalidated, reconciled, or otherwise handled according to an explicit sound native rule.

### 2.3 UNIQUE_EXECUTION_OWNERSHIP

Exactly-one materialization is not sufficient by itself.

Where multiple actors/workers can race the same logical consequential operation, the system must prevent more than one actor from producing evidence that is reasonably interpretable, under the system's own evidence semantics, as an authoritative claim that that actor uniquely performed or owned the authoritative transition.

Closure requires one of the following or an equivalent native mechanism:
- unique execution ownership is acquired before effect materialization and is independently checkable; or
- the authoritative target transition itself identifies a unique winner; or
- concurrent non-winners are unambiguously classified as reconciled, duplicate, loser, observer, or equivalent rather than as independent successful executors.

A system fails this element if two concurrent actors can both generate apparently authoritative success/execution evidence for one materialization and the native evidence model cannot distinguish the actual authoritative performer/owner.

### 2.4 INDEPENDENTLY VERIFIABLE RECEIPT CLOSURE

After success, refusal, ambiguity, crash, timeout, lost response, retry, or reconciliation, a verifier that is not relying solely on the initiating actor's self-report must be able to determine the consequential outcome to the level the target system claims.

Closure requires sufficient native evidence to answer, where applicable:
- what logical operation was attempted;
- what exact effect was authorized/materialized;
- what authority basis controlled it;
- whether the effect happened, did not happen, or remains genuinely unresolved;
- which actor/attempt owned or performed the authoritative transition when ownership is claimed;
- whether a retry was a new execution or reconciliation of an existing effect;
- whether any remaining ambiguity is explicitly represented rather than falsely collapsed into success or failure.

A vendor's own durable authoritative ledger may count as an independent target-side source relative to an initiating worker if it is the system's native source of truth. “Independent” does not require a different company/provider unless the vendor claims provider-independent verification.

## 3. R2C→R2D→R2E comparator lesson

The following distinction is mandatory in every target analysis:

> It is not enough for a platform to prevent a duplicate consequential effect. It must also prevent multiple actors from producing conflicting authoritative evidence about who executed that effect, and it must remain able to prove the correct outcome after ambiguous failure and recovery.

Therefore `one durable effect` does not by itself establish closure of execution ownership or evidence closure.

## 4. Frozen hostile corpus

Every target is evaluated only against scenarios meaningful to its declared capability surface. A scenario may be marked `NOT_APPLICABLE_NATIVE_SCOPE` only with a written rationale explaining why the underlying condition cannot arise or is explicitly outside the vendor's claimed boundary. It may not be omitted merely because the vendor lacks a control for it.

### H01 — Authority revocation before action authorization
Can revoked/withdrawn authority still authorize a new consequential operation?

### H02 — Authority revocation after exact lease/capability issuance
Does the system preserve its documented exact-operation lease/capability semantics without silently broadening permission?

### H03 — Authority ABA/incarnation change
Can authority return to the same semantic value under a new incarnation/version while stale evidence is treated as current or as permission for a successor operation?

### H04 — Material dependency mutation
Can a material dependency change between decision and materialization without revalidation, exact binding, a valid invariant/certificate, or an equivalent sound native mechanism?

### H05 — Material dependency ABA/incarnation change
Can a dependency return to the same semantic value while an older incarnation/version is incorrectly treated as current?

### H06 — Target-state/head race
Can another actor mutate the target between read/decision and write so that a stale consequential transition is accepted rather than rejected/revalidated/reconciled according to the system's native rule?

### H07 — Concurrent same-operation workers
Two independent workers race the same logical operation. Evaluate separately:
1. target effect cardinality;
2. worker/attempt success claims;
3. unique execution ownership evidence;
4. reconciliation of non-winners.

PASS for full comparator closure requires no duplicate consequential effect and no conflicting authoritative execution-ownership claims.

### H08 — Crash after authoritative commit / before response
The authoritative effect commits and the acting process dies before delivering its normal success evidence. Can recovery determine that the effect occurred without creating another effect?

### H09 — Lost response / ambiguous acknowledgment
The target commits or may have committed, but the initiator loses the response. Does the native system distinguish retry from new execution and preserve honest ambiguity until closure is established?

### H10 — Duplicate retry / reconciliation
A completed logical operation is submitted again. Does the system reconcile/deduplicate without creating a second effect or falsely reporting an independent new execution?

### H11 — Material-state/dependency host unavailability
A required material-state/dependency source is unavailable during consequential evaluation/materialization. Does the system fail closed, rely on a soundly valid native lease/certificate, or otherwise preserve the exact guarantee it claims?

### H12 — Authority/evidence host unavailability
A required authority or evidence source is unavailable. Does the system avoid manufacturing permission or false closure from missing evidence?

### H13 — Partial/batch ambiguity, when native scope permits batches or multi-effect operations
Can some effects commit while others remain unresolved, and can the system prove exactly which subset occurred and what recovery is permitted?

### H14 — Recovery-permission ambiguity
After an ambiguous prior attempt, what native evidence authorizes retry, compensate, resume, reconcile, or abstain? Recovery action must not obtain broader authority merely from the existence of ambiguity.

## 5. Strongest-faithful native composition rule

Every target receives every native capability it legitimately possesses and can reasonably compose for the workflow under examination.

Permitted composition includes, where actually available:
- database transactions and isolation;
- OCC/version checks/CAS;
- idempotency keys and deduplication stores;
- signed requests and authenticated actor identity;
- authorization/policy engines;
- leases, capabilities, delegation tokens, approval objects, and revocation/version controls;
- durable workflow engines;
- transactional outbox/inbox patterns when provided or explicitly prescribed by the product;
- native retry/reconciliation APIs;
- target-side ledgers/event logs/audit trails;
- webhook/event delivery semantics;
- provenance/receipt/evidence facilities;
- consistency/session tokens and causal-read mechanisms;
- native recovery, compensation, or dispute/reconciliation state machines.

Rules:
1. Do not remove a native control merely to make JCEE look better.
2. Do not grant a vendor a hypothetical feature it does not document, expose, or legitimately rely on.
3. Configuration required for the vendor's documented guarantee is allowed and must be stated.
4. Ordinary glue code needed to invoke documented native controls is allowed, but custom logic that independently implements the comparator property is not counted as native closure.
5. If closure requires a substantial bespoke subsystem whose essential semantics are not provided by the vendor, classify that requirement as integration burden or residual—not native closure.
6. Cross-product composition is allowed only when it reflects a realistic supported deployment that a competent customer could actually operate; all added products and burden must be named.
7. A target is judged against what its strongest-faithful composition actually guarantees, not marketing language.

## 6. Evidence hierarchy

Evidence strength, highest first:
1. executable/live adversarial test against the real product or official sandbox;
2. authoritative product/API/protocol documentation with precise semantics;
3. official SDK/source behavior that materially defines the guarantee;
4. vendor architecture/security/reliability documentation;
5. credible incident/postmortem evidence showing actual behavior;
6. reproducible third-party technical analysis;
7. secondary commentary.

Marketing claims without technical semantics cannot independently establish closure.

Absence of documentation is not proof of absence. When evidence cannot determine behavior, use `INDETERMINATE`.

## 7. Per-scenario judgment vocabulary

Each hostile case receives one of:
- `CLOSED_NATIVE` — strongest-faithful native composition closes the case with sufficient evidence.
- `CLOSED_NATIVE_WITH_COST` — closes the case, but only with material native configuration/operational burden that must enter integration scoring.
- `RESIDUAL` — an economically/technically material aspect of the comparator remains unclosed after strongest-faithful native composition.
- `INDETERMINATE` — evidence is insufficient or contradictory.
- `NOT_APPLICABLE_NATIVE_SCOPE` — underlying condition genuinely cannot arise or is explicitly outside the target's claimed workflow boundary; rationale required.

`NOT_APPLICABLE_NATIVE_SCOPE` may not be used to erase a condition that arises in the proposed commercial workflow.

## 8. Whole-target technical verdict

Only three terminal technical verdicts are permitted:

### `NATIVE_CLOSURE`
All four comparator properties are closed across every applicable hostile case, with no unresolved case material to the proposed workflow. Cases marked `CLOSED_NATIVE_WITH_COST` are allowed, but the burden must be retained for the integration/economic phase.

### `RESIDUAL_PROPERTY`
At least one applicable hostile case exposes a specific unclosed element of current authority, exact effect binding, unique execution ownership, or independently verifiable receipt closure after strongest-faithful native composition.

The residual must be stated narrowly and mechanically. “JCEE is more complete,” “better assurance,” or architectural difference alone is not a residual property.

### `INDETERMINATE`
The available evidence cannot establish either full native closure or a defensible residual. Uncertainty may not be converted into a JCEE advantage.

## 9. Mandatory execution-ownership test

For every system where independent concurrent actors can target the same logical consequential operation, answer all of the following separately:
1. Can more than one consequential effect materialize?
2. Can more than one actor receive a native success result?
3. If multiple success results are possible, do they mean “operation exists/completed” or “this actor uniquely executed it”?
4. What authoritative state identifies the actual transition owner/winner, if ownership is claimed?
5. Can an independent verifier distinguish winner, reconciler, duplicate, retry, and observer after the fact?

A system cannot earn `NATIVE_CLOSURE` merely from `effect_count = 1` if its native evidence semantics leave conflicting authoritative execution-ownership claims unresolved.

## 10. Mandatory ambiguity/recovery test

For H08, H09, H10, H13, and H14, record:
- pre-attempt authority state;
- logical operation/effect identity;
- point at which external effect may have become durable;
- evidence visible after ambiguity;
- allowed recovery actions;
- authority required for recovery;
- final independently verifiable outcome;
- whether recovery created a new effect, reconciled an old effect, compensated it, or remained unresolved.

False certainty is a failure of receipt closure. An explicit durable `UNKNOWN/PENDING/AMBIGUOUS` state can be correct if the system does not yet possess enough evidence to close the outcome.

## 11. Integration-burden capture

No technical residual automatically earns build authority. For each `RESIDUAL_PROPERTY`, separately record:
- implementation surface: SDK/API/proxy/sidecar/runtime/DB schema/workflow replacement/other;
- privileged credentials required;
- inline latency added to consequential path;
- customer architecture changes;
- durable state/storage required;
- operational on-call burden;
- failure-domain additions;
- migration/reconciliation burden;
- compliance/security review burden;
- dependency on proprietary internals;
- reversibility/removability of the integration.

Integration burden does not alter the technical closure verdict; it determines whether a surviving residual is commercially usable.

## 12. Economic-importance capture

A surviving technical residual must later be tested for:
- credible loss/compliance/operational consequence;
- frequency or tail-risk significance;
- identifiable buyer/owner of the problem;
- evidence of current workaround cost or unresolved incident burden;
- willingness to evaluate, pilot, or pay;
- ability to integrate without replacing the customer's core system.

No assumed pain may authorize engineering.

## 13. Build-authority law

A new JCEE build, adapter, integration probe, or QCS/DCC engineering branch may be authorized only after this conjunction is supported:

`RESIDUAL_PROPERTY + ECONOMIC_IMPORTANCE + ACCEPTABLE_INTEGRATION_BURDEN`

Until then:
- no R2F;
- no generalized QCS/DCC hardening branch;
- no vendor-specific adapter merely to demonstrate technical capability;
- no production-readiness claim;
- no novelty/patentability/FTO claim derived from this comparator.

## 14. Comparator anti-bias rules

- Agreement with the JCEE hypothesis is not a PASS condition.
- Proving a target already closes the property is a successful falsification result.
- A target may close some scenarios more strongly or efficiently than JCEE; record that explicitly.
- JCEE R2E evidence is not used as proof that a vendor lacks an equivalent property.
- Do not compare architecture diagrams; compare guarantees under hostile scenarios.
- Do not infer commercial value from technical difference.
- Preserve adverse findings and superseded hypotheses in lineage.
- No post-result weakening of closure definitions or hostile cases.

## 15. Required target packet

Each system evaluated under P0.1D must produce a packet containing:
1. target/system/version/date;
2. proposed consequential workflow;
3. native capability inventory;
4. strongest-faithful composition;
5. claim boundaries/explicit non-guarantees;
6. H01–H14 matrix with evidence citations;
7. four-property closure matrix;
8. mandatory execution-ownership analysis;
9. mandatory ambiguity/recovery analysis;
10. technical verdict: `NATIVE_CLOSURE`, `RESIDUAL_PROPERTY`, or `INDETERMINATE`;
11. if residual: exact residual statement;
12. integration-burden record;
13. economic-evidence status;
14. JCEE-EVALS-P0.1B binding;
15. claim ceiling and next authorized action.

## 16. JCEE-EVALS-P0.1B binding

- contract ID: `JCEE-DIFF-P0.1D`
- validity: comparator frozen before first vendor adjudication
- native judgment: strongest-faithful target-native guarantee analysis under H01–H14
- cross-program judgment: independent adversarial comparison against the four-property closure law
- independence level: determined per target packet and evidence source
- claim ceiling: comparative residual/closure finding only; no novelty, FTO, production, or universal-superiority claim
- evidence receipt: this frozen contract + target packets + source/evidence manifests

## 17. Gate terminal outcomes

After target adjudication and, where applicable, economic/integration assessment, P0.1D may terminate only as one of:
- `STOP_DIFFERENTIATOR_ALREADY_NATIVE`
- `ADVANCE_RESIDUAL_NO_BUILD_YET`
- `ADVANCE_COMMERCIAL_DISCOVERY`
- `AUTHORIZE_BOUNDED_INTEGRATION_PROBE`

No other outcome silently grants engineering authority.

## 18. Freeze declaration

This document fixes the P0.1D comparator before vendor scoring. Later factual corrections may be appended with dated provenance, but the closure law, strongest-faithful rule, hostile corpus, terminal technical verdict vocabulary, and build-authority conjunction may not be weakened because of observed results.