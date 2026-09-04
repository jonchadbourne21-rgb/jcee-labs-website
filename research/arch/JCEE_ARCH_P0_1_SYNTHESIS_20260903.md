# JCEE-ARCH-P0.1 — Execution-Substrate Substitution & Commodity-Offload Synthesis

Status: **CLOSED_DOCUMENTARY_GATE / QUALIFY_BOTH_DIFFERENT_SCOPES**
Date: 2026-09-03

## Terminal verdict

`QUALIFY_BOTH_DIFFERENT_SCOPES`

- VOW remains the JCEE-native reference/fallback runtime and may continue to evolve under separately authorized evidence gates.
- Restate qualifies as the preferred future **general-purpose optional durable-execution plug candidate**.
- DBOS qualifies as the preferred future **Postgres-centric / shared-transaction optional plug candidate**.
- Neither qualification authorizes implementation, migration, production adoption, VOW deprecation, or VOW rewrite.

## Architectural answer

JCEE does not need to abandon VOW in order to use stronger commodity infrastructure. The preferred model is additive and substitutable:

`JCEE canonical consequence/evidence contract`
  -> `execution-substrate adapter`
    -> `VOW native | Restate | DBOS | future qualified substrate`
  -> `external consequential target`
  -> `JCEE target observation / ambiguity / recovery / receipt closure`

VOW is both a usable runtime and the reference implementation against which plug semantics remain reproducible. A customer that already uses Restate/DBOS should not be forced to adopt VOW's commodity workflow machinery if JCEE can preserve its consequence/evidence semantics through an adapter.

## Comparison summary

| Dimension | VOW_REFERENCE_NATIVE | RESTATE_SUBSTRATE | DBOS_SUBSTRATE |
|---|---|---|---|
| JCEE semantics | Native/full | Retained if adapter is strict | Retained if adapter is strict |
| Generic durability offload | None | Very high | High, especially Postgres |
| Durable RPC/service coordination | JCEE-owned / narrower | Strong native capability | Not primary strength |
| Atomic application DB write + durability | JCEE-specific implementation | Not arbitrary external DB atomicity | Strong when shared Postgres transaction is supported |
| External arbitrary effect exactly-once | Requires target observation/recovery | Not natively guaranteed across arbitrary sink | Not natively guaranteed for ordinary external steps |
| Concurrency ownership | JCEE atomic claim/reference semantics | Strong invocation epochs/journal ownership | Strong conflict/zombie outcome handling |
| Solo-founder managed option | JCEE must operate | Restate Cloud available | DBOS Cloud/Conductor available |
| Self-host portability | High | High; open-source single binary | High; open-source library + Postgres |
| Coupling | Lowest external coupling | Medium SDK/runtime coupling | Medium/high application/Postgres coupling |
| Best use | reference/fallback / JCEE-native deployments | general durable execution plug | Postgres-centric atomic DB workloads |

## Decisive finding: automatic retry containment law

A durable-execution substrate's ability to retry is a capability, not JCEE recovery authority.

Restate and DBOS both legitimately retry/recover work. Their technical documentation also preserves a failure window for arbitrary external side effects when the target can accept the effect before the substrate durably records completion. A naive adapter could therefore violate JCEE's non-broadening recovery law by allowing a substrate retry to become a second consequential attempt without a fresh JCEE recovery decision.

Therefore every future substrate plug MUST satisfy:

> **SUBSTRATE RETRY NON-AUTHORITY:** A substrate retry/replay/recovery signal may schedule observation, reconciliation, or a JCEE recovery decision, but may not itself authorize a new consequential target attempt after an ambiguous boundary.

Consequential re-execution is allowed only when at least one of the following is established under the frozen JCEE contract:
1. the target operation is exact-bound and natively idempotency/deduplication closed for the same logical effect; or
2. target observation proves the prior effect did not occur and current authority separately permits a new attempt; or
3. an explicit JCEE recovery decision authorizes the exact recovery action under current authority/dependency state.

If none is established, the plug must park/abstain/observe rather than let substrate automatic retry touch the consequential target.

## Minimum canonical substrate-plug contract

A future plug must preserve at least these fields/semantics independent of substrate:

### Admission input
- canonical JCEE `operation_id`;
- exact-effect digest/contract;
- target identity;
- authority evidence/version/incarnation or reference;
- material dependency/currentness bindings;
- consequence class;
- recovery policy ceiling;
- JCEE contract/version identifier.

### Substrate execution evidence
- substrate type/version;
- invocation/workflow ID;
- attempt/epoch/executor identity where exposed;
- durable checkpoint/journal references;
- substrate outcome semantics (`completed`, `retrying`, `failed`, `conflict`, etc.) without semantic inflation.

### Target evidence
- target observation source;
- target operation/object ID;
- observed target state/incarnation/version where applicable;
- evidence for `EFFECT_OCCURRED`, `EFFECT_NOT_OCCURRED`, or `AMBIGUOUS/UNKNOWN`;
- deduplication/idempotency/reconciliation evidence if relied upon.

### Recovery evidence
- JCEE recovery decision;
- authority basis current at recovery decision;
- exact action permitted (`observe`, `retry`, `resume`, `compensate`, `abstain`);
- whether substrate retry was suppressed/converted to observation;
- final closure state.

### Canonical receipt
The final JCEE receipt must distinguish:
- substrate execution history;
- external target truth;
- JCEE authority/admission decision;
- JCEE recovery decision;
- final independently verifiable closure.

The receipt may reference a Restate journal or DBOS checkpoint, but neither is promoted into proof of external target acceptance without target evidence.

## VOW preservation rule

VOW should not be abandoned, deleted, or rewritten merely to mirror Restate/DBOS. It should continue to serve:
- reference implementation of JCEE consequence/recovery semantics;
- fallback substrate;
- adversarial/scientific harness;
- native runtime for deployments that do not want an external substrate;
- verification anchor for plug-conformance tests.

VOW may continue to improve, but new engineering should preferentially strengthen JCEE-specific semantics, reference fidelity, plug conformance, target observation, authority closure, evidence closure, and bounded production hardening rather than duplicating commodity durable-execution features solely because competitors have them.

Preservation does not require commercializing every duplicated subsystem. A VOW capability may remain frozen/reference-only if a qualified substrate performs that commodity function more efficiently in production.

## Restate disposition

`QUALIFIED_OPTIONAL_GENERAL_SUBSTRATE_CANDIDATE`

Restate is preferred for the first future plug experiment because:
- it offloads the broadest commodity runtime surface;
- can be self-hosted, SaaS, or BYOC;
- supports multiple service languages/deployment environments;
- strong durable RPC, keyed state, idempotency, journal ownership, promises and flow control;
- arbitrary external-effect ambiguity still leaves JCEE consequence/recovery semantics meaningful.

Important current operational evidence: Restate Cloud is managed; self-hosting is open source; BYOC is available in AWS/GCP with the data plane inside the customer's VPC. This reduces—but does not eliminate—lock-in and trust-surface concerns.

## DBOS disposition

`QUALIFIED_OPTIONAL_POSTGRES_SUBSTRATE_CANDIDATE`

DBOS is preferred when:
- application state already lives in Postgres;
- exactly-once application DB writes can share the DBOS transaction;
- workflow/database coupling is acceptable;
- DBOS's conflict/zombie ownership semantics remove useful commodity machinery.

It is not preferred as the universal first plug because its strongest uniqueness is tied more closely to Postgres/shared transactions and its application-library integration can be more invasive.

## Differentiator subtraction

After this gate JCEE must not rely on any of the following alone as differentiation:
- generic durable execution;
- retry/recovery;
- checkpoint replay;
- durable RPC;
- keyed serialization;
- workflow outcome ownership;
- exactly-once database writes inside one supported transaction;
- generic idempotency/deduplication;
- durable waits/promises.

The surviving candidate remains the cross-boundary property:

`CURRENT/CAUSALLY-FRESH AUTHORITY`
+ `EXACT EXTERNAL-EFFECT BINDING`
+ `AUTHORITATIVE EFFECT OWNERSHIP / NON-CONFLICTING ATTRIBUTION`
+ `TARGET-SIDE OBSERVATION`
+ `AUTHORITY-CLOSED AMBIGUITY RECOVERY`
+ `INDEPENDENTLY VERIFIABLE RECEIPT CLOSURE`

when the consequential target lies outside the execution substrate's strongest atomic ownership domain.

## Build authority

None.

This gate authorizes no:
- Restate integration;
- DBOS integration;
- VOW rewrite/deprecation;
- new QCS/DCC branch;
- production migration;
- customer-specific adapter.

A successor experiment requires explicit authorization and must be bounded to plug-contract conformance and reversibility, not replacement of VOW.

## Recommended successor

`JCEE-ARCH-P0.1A — Substrate-Neutral Plug Contract & Reversibility Gate`

This should freeze a substrate-neutral adapter/evidence contract first, then—only if separately authorized—implement one minimal Restate shadow plug that cannot perform a real consequential effect. Its purpose would be to prove that VOW and Restate can produce equivalent canonical JCEE execution/evidence transitions and that removing Restate restores VOW without changing the contract.