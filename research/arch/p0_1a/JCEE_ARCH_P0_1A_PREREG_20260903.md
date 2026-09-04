# JCEE-ARCH-P0.1A — Substrate-Neutral Plug Contract & Reversibility Gate

Status: **FROZEN / PRE-EXECUTION**
Date: 2026-09-03
Parent: `JCEE-ARCH-P0.1`

## Purpose
Test whether a real Restate execution substrate can sit beneath a substrate-neutral JCEE consequence/evidence contract without changing JCEE authority, ambiguity, recovery, or receipt semantics, and whether the Restate plug can be removed in favor of the VOW-reference contract without semantic changes.

This is a shadow/non-consequential experiment. No real payment, deployment, infrastructure mutation, production credential, or external consequential target is permitted.

## Execution qualification
- Restate arm: **REAL_LOCAL_RESTATE_TESTCONTAINER** using official Restate TypeScript SDK/Testcontainers tooling.
- VOW arm: **FROZEN_VOW_REFERENCE_SEMANTIC_FIXTURE**, derived from the verified VOW 1.1 recovery/evidence semantics already captured in JCEE evidence. This gate does not modify, vendor, copy, or execute the separately frozen private VOW repository.
- Maximum claim if all tests pass: Restate plug-contract feasibility + semantic equivalence to the frozen VOW reference fixture inside this synthetic corpus. No claim of full executable VOW↔Restate parity until a later cross-repo run executes both actual runtimes.

## Frozen canonical contract
Every substrate receives the same admission envelope:
- `contract_version`
- `operation_id`
- `effect_digest`
- `target_id`
- `authority_current`
- `authority_version`
- `dependency_current`
- `target_observation`
- `substrate_signal`
- `recovery_authorized`

Every substrate must produce a canonical JCEE receipt containing separate sections for:
1. `admission`
2. `substrate_evidence`
3. `target_evidence`
4. `recovery`
5. `closure`

The semantic projection used for cross-substrate equivalence excludes substrate-specific IDs but includes all authority/effect/target/recovery/closure meanings.

## Frozen laws
1. **SUBSTRATE RETRY NON-AUTHORITY** — `substrate_signal=RETRY` cannot authorize a new consequential attempt after an ambiguous target result.
2. **TARGET TRUTH OUTRANKS RUNTIME SELF-REPORT** — substrate completion cannot convert `AMBIGUOUS` target observation into `EFFECT_OCCURRED`.
3. **AUTHORITY FAIL-CLOSED** — non-current authority yields `ABSTAIN` for any consequential recovery action.
4. **DEPENDENCY FAIL-CLOSED** — non-current material dependency yields `ABSTAIN` absent a separately frozen valid certificate; this experiment provides no such certificate.
5. **OBSERVE BEFORE RETRY** — ambiguity yields `OBSERVE_FIRST` unless target evidence later proves `EFFECT_NOT_OCCURRED` and recovery is separately authorized.
6. **SHADOW EFFECT PROHIBITION** — even when the semantic result is `RETRY_AUTHORIZED`, the experiment records authorization only; it does not perform an external target effect.
7. **RECEIPT NON-INFLATION** — Restate journal/workflow completion is evidence of Restate execution only, not evidence of external target acceptance.
8. **REVERSIBILITY** — replacing Restate output with the VOW-reference adapter must preserve the canonical semantic projection for every frozen scenario.

## Frozen scenarios

### C01 — clean known effect
Authority/current dependencies true; target observation `EFFECT_OCCURRED`; no retry signal.
Expected: closure `CLOSED_EFFECT_OCCURRED`; no recovery attempt.

### C02 — ambiguous boundary + substrate retry
Authority/current dependencies true; target observation `AMBIGUOUS`; substrate requests retry.
Expected: `OBSERVE_FIRST`, `reexecution_authorized=false`, no target attempt.

### C03 — ambiguous boundary + no retry signal
Same ambiguity without retry signal.
Expected: `OBSERVE_FIRST`, no target attempt.

### C04 — authority stale during recovery
Target observation `EFFECT_NOT_OCCURRED`, substrate retry signal present, but authority is not current.
Expected: `ABSTAIN_AUTHORITY`, no target attempt.

### C05 — dependency stale during recovery
Target observation `EFFECT_NOT_OCCURRED`, authority current, dependency not current.
Expected: `ABSTAIN_DEPENDENCY`, no target attempt.

### C06 — observed not occurred + explicit recovery authority
Target observation `EFFECT_NOT_OCCURRED`; authority and dependency current; `recovery_authorized=true`.
Expected: `RETRY_AUTHORIZED_SHADOW_ONLY`; no real target attempt.

### C07 — substrate reports completed while target remains ambiguous
Restate/substrate signal `COMPLETED`; target observation `AMBIGUOUS`.
Expected: target remains ambiguous; `OBSERVE_FIRST`; runtime completion does not inflate target truth.

### C08 — deterministic reversibility corpus
All C01-C07 receipts generated through both the real Restate plug and frozen VOW-reference fixture.
Expected: canonical semantic projections equal scenario-by-scenario after removing substrate-specific metadata.

### C09 — Restate workflow identity replay
Submit/attach the same Restate workflow identity more than once for one frozen scenario.
Expected: one durable workflow outcome identity; canonical semantic result remains unchanged. This tests Restate plumbing only and is not promoted into external-effect exactly-once proof.

## Acceptance
`PASS_BOUNDED_SHADOW` requires:
- actual Restate Testcontainer execution succeeds;
- C01-C09 satisfy frozen outcomes;
- zero calls to any real external consequential target;
- C02 and C07 prove retry/completion cannot broaden JCEE authority or target truth;
- C08 shows semantic equality between Restate output and VOW-reference fixture across C01-C07;
- Restate-specific metadata can be removed without changing canonical JCEE semantics;
- no source or test modifies VOW or requires Restate for the VOW-reference fixture.

Any semantic mismatch is `FAIL`. Infrastructure inability to run Restate is `INDETERMINATE_INFRA`, not PASS.

## Build/claim ceiling
A PASS authorizes no production integration. It establishes only a bounded shadow plug-contract feasibility result. The next gate, if any, must be separately authorized.