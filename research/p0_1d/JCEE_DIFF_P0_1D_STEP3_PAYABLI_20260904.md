# JCEE-DIFF-P0.1D Step 3 — Payabli Target Packet

Status: **ADJUDICATED / DOCUMENTARY RESIDUAL**
Date: 2026-09-04
Parent freeze: `JCEE_DIFF_P0_1D_STEP3_PAYABLI_PAYOS_FREEZE_20260904.md`

## Target workflow
Money-moving Payabli API operations where an initiating worker can lose the synchronous response after Payabli or an underlying processor may have accepted the operation. Applicable operations include Pay In sale/authorize/capture/refund/void and Pay Out authorize/capture/cancel/reissue paths.

## Strongest-faithful native composition
Payabli receives all documented controls:
- OAuth2 client-credentials authentication with short-lived access tokens and assigned endpoint/action permissions;
- credential rotation/revocation semantics exactly as documented;
- legacy long-lived API tokens where still supported;
- caller-supplied `idempotencyKey` headers where endpoints support them;
- transaction/reference identifiers and transaction detail/search APIs;
- Pay In authorize/capture/void/refund state semantics;
- Pay Out authorize/capture/cancel lifecycle and detailed payout statuses;
- bill approval workflows and user role/permission controls where the workflow uses them;
- webhook notifications, retry behavior and notification logs/manual resend;
- polling/query APIs for reconciliation;
- payout duplicate-detection anomaly notifications;
- payout/batch lifecycle and reconciliation evidence.

## Primary official evidence
1. API overview: https://docs.payabli.com/developers/api-reference/api-overview
   - Payabli explicitly recommends webhooks to avoid duplicate transactions after a timeout where the caller does not know whether the original request was received, processed, or approved.
   - `idempotencyKey` is caller generated and optional/best-practice.
   - Payabli retains idempotency keys for 2 minutes; after 2 minutes the same key may be reused.
   - duplicate use before expiry returns HTTP 409.
   - the key is not echoed in resulting webhooks; transaction identifiers are used for correlation.
2. OAuth authentication: https://docs.payabli.com/developers/oauth-authentication
   - OAuth credentials are environment scoped and carry assigned permissions.
   - access tokens are short lived; exact lifetime comes from `expires_in` (example: one hour in sandbox).
   - rotating or revoking the underlying credential does **not** invalidate already-issued bearer tokens; issued tokens remain valid until they expire.
3. Payout authorization API: https://docs.payabli.com/developers/api-reference/moneyout/authorize-a-transaction-for-payout
   - idempotency key is optional/recommended and follows the documented short retention behavior.
   - `autoCapture` is asynchronous; authorization response does not prove capture.
4. Manage payouts: https://docs.payabli.com/guides/pay-out-developer-payouts-manage
   - failed capture is reported by webhook; documented recovery is to correct the request/vendor and submit a new authorization.
   - Pay Out has no refunds; a failed payout does not move funds.
5. Pay Out status reference: https://docs.payabli.com/guides/pay-out-status-reference
   - detailed payout, batch and bill lifecycle states.
6. Bill approval lifecycle: https://docs.payabli.com/guides/pay-out-bills-lifecycle
   - approval can be required by a configured bill workflow, but approval is optional; Active bills are already payout-eligible, and API payout requests can bypass the bill engine.
7. User roles: https://docs.payabli.com/guides/pay-ops-roles-permissions-overview
   - user permissions and scopes govern Portal actions; API credentials have their own permission model.
8. Notifications/webhook delivery: https://docs.payabli.com/guides/pay-ops-notifications-webhooks-overview
   - webhook queue/delivery/retry/manual retry semantics.
9. Duplicate payout event: https://docs.payabli.com/developers/api-reference/webhooks-overview/payout-transaction-duplicated
   - native duplicate anomaly can identify multiple affected payout transaction IDs and a duplicate count.

## H01–H14 assessment

| Case | Judgment | Finding |
|---|---|---|
| H01 revoke before new consequential call | **RESIDUAL** | Payabli explicitly states bearer tokens already issued remain valid until expiry after the underlying credential is rotated/revoked. Because those tokens carry endpoint/action permissions rather than being exact-operation leases, revocation does not immediately remove authority to initiate a new covered API action. |
| H02 revoke after prior payment authorization/before recovery | **RESIDUAL** | A still-live bearer may remain authorized after credential revocation. Public docs do not bind that bearer to only the pre-revocation exact payment operation; it can continue to authorize permitted endpoint actions until expiry. |
| H03 authority ABA/incarnation | RESIDUAL / PARTIAL | Credential rotation creates a new secret while already-issued tokens survive to expiry; no exact-operation authority incarnation binding was found that forces recovery to prove it belongs to the current credential generation. |
| H04 material dependency mutation | CLOSED_NATIVE_WITH_COST | Transaction/payout state is queryable and operation-specific rules constrain capture/void/refund/cancel; arbitrary external business dependencies remain application-owned. |
| H05 dependency ABA | INDETERMINATE | No generic dependency incarnation mechanism documented. |
| H06 target-state race | CLOSED_NATIVE_WITH_COST | Payabli state machines reject invalid operations based on transaction state; integrator must query/reconcile current state for ambiguous transitions. |
| H07 concurrent same operation | **RESIDUAL** | Idempotency can prevent duplicate processing only when the same caller-generated key is supplied inside the 2-minute retention window. Different keys or reuse after expiry are not a durable logical-operation identity guarantee. Native duplicate payout detection can flag multiple affected transaction IDs after the fact. |
| H08 crash after commit/before response | **RESIDUAL** | Payabli explicitly documents timeout uncertainty where the caller cannot know whether a payment was received/processed/approved and recommends webhook-based reconciliation. |
| H09 lost response | **RESIDUAL** | Same explicit timeout ambiguity. Webhooks/polling can close many cases, but idempotency correlation is time-bounded and the key is not present in webhook payloads. |
| H10 duplicate retry | **RESIDUAL** | Same-key protection is bounded by a 2-minute native retention interval; afterwards the key can be reused. Durable cross-time logical-operation identity is not established by the idempotency layer alone. |
| H11 dependency host unavailable | CLOSED_NATIVE_WITH_COST | API failures/timeouts can be held and reconciled; no permission is documented as created by unavailability. |
| H12 authority/evidence host unavailable | CLOSED_NATIVE_WITH_COST | Unavailable Payabli observation leaves the integrator unable to close the effect; strongest-faithful behavior is to wait/query rather than infer. |
| H13 partial/batch ambiguity | CLOSED_NATIVE_WITH_COST / RESIDUAL_EDGE | Payabli exposes per-payout/batch statuses and detailed events, which substantially close partial-state observation. Durable exact logical-operation binding across retries remains the residual. |
| H14 recovery permission ambiguity | **RESIDUAL** | Payabli documents technical recovery procedures (query, webhook, re-authorize after a proven failure), but no native durable recovery object was found that binds a prior ambiguous logical operation, current authority generation, target observation, and the exact permitted recovery action. |

## Four-property judgment
- Current/causally-fresh authority: **RESIDUAL** — documented bearer-token stale-authority window after credential revocation.
- Exact external-effect binding: **RESIDUAL** across ambiguity windows exceeding or bypassing the 2-minute idempotency retention.
- Authoritative effect ownership/non-conflicting attribution: **RESIDUAL** for duplicate logical attempts not sharing a currently retained key.
- Target-side observation: **STRONG NATIVE**, via transaction/payout state, webhooks and polling.
- Authority-closed ambiguity recovery: **RESIDUAL**.
- Independently verifiable receipt closure: **PARTIAL NATIVE**; Payabli target state is strong, but no single durable native artifact binds original authority generation + exact logical operation + recovery permission end-to-end.

## Exact residual statement

**`RESIDUAL_PROPERTY`**

> Payabli provides strong transaction state, webhooks/polling, role/credential controls, and short-window idempotency, but its documented native composition leaves two concrete cross-boundary gaps relevant to the frozen comparator: (1) already-issued OAuth bearer tokens remain valid after credential revocation until token expiry and are not exact-operation leases; and (2) caller-generated idempotency is retained for only 2 minutes, while Payabli explicitly documents timeout uncertainty and duplicate-payout anomaly detection. A durable recovery layer must therefore preserve the exact operation identity, observe Payabli target truth, re-establish current recovery authority, and decide whether retry/re-authorize/abstain is permitted without treating a still-live stale bearer or an expired idempotency identity as sufficient recovery authority.

This residual is narrower than “Payabli lacks authorization,” “Payabli lacks idempotency,” or “Payabli cannot reconcile payments.” Those would be false.

## Approval-control boundary
Payabli has real bill approval workflows and custom approval capabilities, but they do not erase this residual universally:
- bill approval is optional;
- Active bills are payout-eligible without approval;
- API payouts can bypass the bill engine entirely;
- approval evidence is not documented as an exact recovery lease for an ambiguous payment attempt.

Where a customer configures a stricter approval workflow, that control must be credited in a future live workflow reconstruction.

## R2C ownership lesson application
Multiple workers receiving the same completed logical result is not itself a failure. The relevant Payabli risk is multiple logical attempts created under different/expired idempotency identities or ambiguous recovery paths. Native target transaction IDs prove Payabli records; they do not automatically prove that two caller attempts represented one authorized logical effect.

## Integration-burden estimate
Documentary estimate: **LOW_TO_MEDIUM**, not yet validated in sandbox.

A plausible JCEE layer would not replace Payabli. It would sit around selected consequential endpoints and persist:
- long-lived JCEE operation ID/effect digest;
- Payabli idempotency key and returned transaction/reference IDs;
- authority generation/evidence at admission and recovery;
- webhook/polling observations;
- explicit `OBSERVE_FIRST / RETRY / REAUTHORIZE / ABSTAIN` recovery decision;
- canonical receipt.

Existing Payabli APIs/webhooks supply most target observation. The main added burden is durable cross-time operation/recovery state and authority/evidence binding.

## Economic-importance signal
**SUPPORTED_RISK / BUYER_WILLINGNESS_UNPROVEN**.

Payabli's own documentation identifies timeout-driven double-charge risk as a reason to use webhooks. Payabli also exposes a dedicated duplicate-payout anomaly event. Its platform is explicitly sold to software platforms embedding Pay In/Pay Out/Pay Ops, so the relevant operational burden can sit with platform payment engineering/operations as well as Payabli itself. This supports problem reality, not willingness to pay.

## Technical verdict
`RESIDUAL_PROPERTY`

## Commercial disposition
`ADVANCE_COMMERCIAL_DISCOVERY`

Meaning: the technical residual is strong enough to ask Payabli/platform operators whether stale bearer authority + ambiguity/recovery burden is economically meaningful and whether they would evaluate a thin assurance layer. It does **not** authorize an adapter or sandbox build.

## Claim ceiling
Documentary Payabli residual under currently public documentation only. No production-readiness, vendor defect, universal duplicate-prevention, novelty, patentability, or willingness-to-pay claim.