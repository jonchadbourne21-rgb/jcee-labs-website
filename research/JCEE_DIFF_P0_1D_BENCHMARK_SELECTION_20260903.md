# JCEE-DIFF-P0.1D — Step 2 Benchmark Selection

Status: **FROZEN / PRE-ADJUDICATION**
Date: 2026-09-03
Parent contract: `research/JCEE_DIFF_P0_1D_COMPARATOR_CONTRACT_20260903.md`

## Purpose
Select the strongest practical benchmark systems before outcome analysis, then attempt to falsify the JCEE residual property using each target's strongest-faithful native controls.

No benchmark may be removed or replaced because it closes more of the comparator than expected. Additional benchmarks require a dated addendum and do not erase these four.

## Frozen benchmark set

### B1 — Temporal
Category: durable workflow / crash recovery / event-history execution system.
Reason for selection: strongest direct challenge to ambiguity recovery, retries, durable state, execution history, and worker-failure handling.
Primary attack question: can Temporal's native workflow/event-history model plus its documented idempotency/retry patterns close exact external-effect binding, unique execution ownership, and independently verifiable closure after crash/lost response without bespoke semantics outside Temporal?

### B2 — Stripe
Category: mature consequential payment API / idempotency / authoritative object-state and event system.
Reason for selection: strongest practical challenge from a widely deployed system whose native API directly performs consequential financial effects and exposes idempotency, request/object state, webhooks/events, and reconciliation semantics.
Primary attack question: do Stripe's native controls close not only duplicate payment effects, but current authority, same-operation execution ownership, and post-ambiguity evidence closure?

### B3 — Authzed / SpiceDB
Category: authorization-currentness / Zanzibar-derived relationship-based access control / consistency tokens.
Reason for selection: strongest direct challenge to the `CURRENT_AUTHORITY` portion of the comparator, including consistency/freshness, revision tokens, relationship changes, and permission checks.
Primary attack question: when paired only with legitimate documented usage patterns, does SpiceDB close authority currentness strongly enough that the remaining JCEE property collapses to ordinary execution/idempotency concerns, or do effect/ownership/receipt gaps remain outside its native boundary?

### B4 — AWS-native consequential composition
Components, only where legitimately applicable to the tested workflow:
- AWS Step Functions
- Amazon DynamoDB transactional/conditional write and idempotency mechanisms
- Amazon Verified Permissions
- AWS CloudTrail and/or EventBridge evidence/event facilities
- native AWS retry/correlation primitives documented for these services
Category: integrated cloud-native composition.
Reason for selection: strongest attempt to kill the differentiator through a realistic multi-service native composition rather than a single product. It tests whether a major cloud provider can close authority + effect binding + workflow durability + target serialization + evidence without introducing a substantial bespoke subsystem.
Primary attack question: after granting the composition every legitimate AWS-native control, does one full consequential-operation property remain unclosed, or is the only remaining difference integration ergonomics?

## Selection rule
These four are chosen to maximize falsification pressure across the comparator's distinct dimensions, not to represent a market sample.

The benchmark set intentionally includes:
1. one durable workflow system;
2. one direct consequential payment system;
3. one authorization-currentness system;
4. one integrated cloud-native composition.

## Adjudication order
1. Temporal
2. Stripe
3. Authzed / SpiceDB
4. AWS-native composition

The first three isolate major neighboring capability classes. The AWS composition then receives the strongest-faithful union available within one cloud ecosystem.

## Outcome discipline
Each benchmark receives an H01–H14 packet and only one terminal technical verdict:
- `NATIVE_CLOSURE`
- `RESIDUAL_PROPERTY`
- `INDETERMINATE`

No Payabli or payOS commercialization conclusion may be updated from Step 2 until all four benchmark packets have been adjudicated or explicitly marked `INDETERMINATE` with the missing evidence identified.

No new QCS/DCC engineering is authorized by benchmark selection or by a benchmark residual.