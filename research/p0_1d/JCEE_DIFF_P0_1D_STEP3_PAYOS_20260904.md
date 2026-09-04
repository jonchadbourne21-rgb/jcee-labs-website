# JCEE-DIFF-P0.1D Step 3 — payOS Target Packet

Status: **ADJUDICATED / INDETERMINATE_PENDING_NATIVE_RECOVERY_EVIDENCE**
Date: 2026-09-04
Target: payOS (`payos.vn` / payOSHQ Merchant API)
Parent freeze: `JCEE_DIFF_P0_1D_STEP3_PAYABLI_PAYOS_FREEZE_20260904.md`

## Target workflow
Single and batch payout operations submitted through payOS Merchant API, including loss of the synchronous response, concurrent/repeated submissions, partial batch completion, credential change, and recovery/reconciliation after an ambiguous attempt.

## Strongest-faithful native composition
payOS receives all documented controls:
- `x-client-id` + `x-api-key` authentication;
- required `x-idempotency-key` on single and batch payout creation;
- required HMAC `x-signature` on payout creation;
- request `referenceId` at payout and per-batch-item level;
- payout `id`, per-transaction `id`, `referenceId`, external `reference`, per-transaction `state`, and top-level `approvalState`/lifecycle fields;
- GET/list payout APIs for reconciliation;
- payout-account balance query;
- signed payout response/data verification using payout-specific checksum key;
- payment/payout webhook signature verification where documented;
- official SDK retry, timeout, error handling, pagination, request and response signature support.

## Primary official evidence
1. payOS Merchant API: https://payos.vn/docs/api/
   - single payout and batch payout endpoints require `x-idempotency-key` and `x-signature`.
   - request body carries `referenceId`; batch items carry their own `referenceId`.
   - payout results expose per-transaction state plus top-level lifecycle/`approvalState`.
   - GET/list payout endpoints provide post-attempt observation.
2. Signature verification: https://payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature/
   - HMAC-SHA256 payout signatures are distinct from payment-request signatures.
   - documented payout response example exposes signed per-transaction `SUCCEEDED` states and a top-level `approvalState`.
3. Official Go SDK: https://github.com/payOSHQ/payos-lib-golang
   - direct API support for payout header signatures and caller-supplied `x-idempotency-key`.
   - configurable request timeout/retry behavior.
   - response signature verification supported.
4. Official SDK documentation: https://payos.vn/docs/sdks/back-end/node/ and language equivalents.

## Important correction to prior working hypothesis
The public API documents a field named `approvalState`, but this packet found no authoritative public documentation establishing that field as a separate human/organizational authorization object, revocable approval lease, or recovery permission. It is therefore treated as payout lifecycle/status evidence only.

Previous shorthand that credited payOS with separate “approval controls” is not carried forward as a proven fact.

## H01–H14 assessment

| Case | Judgment | Finding |
|---|---|---|
| H01 revoke before new payout | CLOSED_NATIVE_WITH_COST / INDETERMINATE_EDGE | Every payout API call is authenticated, but public docs do not specify credential-revocation propagation semantics strongly enough to claim causally-fresh authority under all races. |
| H02 revoke after request signing/before effect | INDETERMINATE | HMAC binds request content to a valid checksum key but is not documented as a revocable per-effect authority lease. Whether credential/key rotation immediately invalidates an already-signed/in-flight payout is not established. |
| H03 authority ABA | INDETERMINATE | No documented authority incarnation/version binding was found. |
| H04 material dependency mutation | CLOSED_NATIVE_WITH_COST | `referenceId`, signed request content, destination validation option and payout transaction state give strong request/target binding; arbitrary business dependencies remain outside payOS. |
| H05 dependency ABA | INDETERMINATE | No generic dependency incarnation/version mechanism documented. |
| H06 target-state race | CLOSED_NATIVE_WITH_COST | Payout state is server-side and queryable; exact race semantics for concurrent modifications are not fully documented. |
| H07 concurrent same operation | CLOSED_NATIVE_WITH_COST / INDETERMINATE_EDGE | Required idempotency key is a strong native control. Public docs do not state idempotency scope/retention/conflict semantics sufficiently to prove arbitrary-duration logical-operation closure. |
| H08 crash after possible payout acceptance | INDETERMINATE | GET/list APIs and signed state can reconcile after the fact, but public docs do not define the precise commit-before-response recovery contract or guarantee for a payout whose create response is lost. |
| H09 lost response | INDETERMINATE | Required idempotency + queryable payout state are strong. Missing public semantics on idempotency lifetime and lookup-by-idempotency-key prevent full closure judgment. |
| H10 duplicate retry | CLOSED_NATIVE_WITH_COST / INDETERMINATE_EDGE | Required idempotency is native prevention, but retention/scope/replay semantics are not documented in the retrieved public material. |
| H11 dependency host unavailable | CLOSED_NATIVE_WITH_COST | Client errors/timeouts remain explicit; no evidence that unavailability creates permission. |
| H12 authority/evidence host unavailable | CLOSED_NATIVE_WITH_COST | When payOS cannot be queried, strongest-faithful recovery is wait/reconcile; no contrary public behavior found. |
| H13 partial/batch ambiguity | CLOSED_NATIVE_WITH_COST | This is a native strength: batch results expose per-transaction IDs/reference IDs/states rather than only one aggregate success bit, and signed payout data can carry per-item state. |
| H14 recovery permission ambiguity | INDETERMINATE | Public docs provide observation primitives but do not document a native recovery-authority object that says which failed/unknown subset may be retried under current authority after a partial or ambiguous batch. Absence of such documentation is not proof it does not exist. |

## Four-property judgment
- Current/causally-fresh authority: **INDETERMINATE**
- Exact external-effect binding: **STRONG NATIVE / residual not established**
- Authoritative effect ownership/non-conflicting attribution: **STRONGER THAN EXPECTED; INDETERMINATE at retry-horizon edge**
- Target-side observation: **STRONG NATIVE**, including per-transaction batch states
- Authority-closed ambiguity recovery: **INDETERMINATE**
- Independently verifiable receipt closure: **STRONG PARTIAL NATIVE**, because signed payout data can carry reference and per-transaction result state; full authority+recovery binding not established.

## Mandatory execution-ownership analysis
1. Required payout idempotency materially reduces duplicate same-operation execution risk.
2. Request signatures bind payout content and protect integrity/authenticity under the checksum key.
3. Per-payout and per-transaction IDs/states give target-side attribution stronger than a generic workflow success result.
4. Public evidence does not establish idempotency-key retention/scope or whether two application actors using distinct idempotency keys but the same business `referenceId` can both create effects.
5. Therefore no residual is claimed from that uncertainty; it remains an empirical/documentation question.

## Mandatory partial/batch analysis
payOS materially weakens the original JCEE hypothesis here. Batch payout responses and query APIs expose individual transaction records, each with its own state/reference. The signed payout example also demonstrates a structure capable of authenticating per-item outcomes. The generic claim “payOS cannot prove which subset of a batch succeeded” is therefore not supported by the public evidence and is killed.

The narrower unresolved question is whether, after a subset is failed/unknown, the platform binds a subsequent retry/reissue of only that subset to a fresh authority decision and durable prior-attempt identity.

## Technical verdict
**`INDETERMINATE`**

We do not currently have enough authoritative evidence to establish either full native closure or a defensible JCEE residual for payOS.

## Residual hypothesis retained for testing, not claimed
> When an original payout/batch attempt is ambiguous or partially complete, payOS may require application-level logic to decide exactly which subset may be retried under current authority; however, current public documentation is insufficient to prove that this is unclosed natively.

## Integration-burden observation
If a residual is later verified, likely integration burden appears **LOW_TO_MEDIUM** because payOS already supplies strong request binding, idempotency, signed responses and per-item state. JCEE would only be useful if it adds missing authority-currentness/recovery-permission closure rather than duplicating those controls.

## Economic status
`NOT_ESTABLISHED`.

No customer pain or willingness-to-pay should be inferred merely from an undocumented recovery edge.

## Commercial disposition
`HOLD_NATIVE_RESIDUAL_INDETERMINATE`

Next evidence required before advancing this lane:
- authoritative idempotency key lifetime/scope/conflict semantics;
- behavior when payout create response is lost after server acceptance;
- whether `referenceId` is unique/enforced independently of idempotency key;
- exact batch partial-failure/retry semantics;
- credential/checksum-key revocation behavior for in-flight or recovery operations;
- whether any private/portal approval workflow exists and how it binds to payout execution/recovery.

A vendor response or safe sandbox can resolve these questions. No build is authorized.

## Claim ceiling
Documentary reconstruction only. No payOS defect, JCEE superiority, missing-control, production, novelty, or commercialization claim.