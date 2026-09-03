# JCEE-DIFF-P0.1D — B2 Stripe Target Packet

Status: **ADJUDICATED / INDETERMINATE_PENDING_LIVE_ADVERSARIAL_TEST**
Date: 2026-09-03
Comparator: `JCEE_DIFF_P0_1D_COMPARATOR_CONTRACT_20260903.md`
Benchmark selection: B2 — Stripe

## Target workflow
A consequential Stripe POST operation such as PaymentIntent creation/confirmation is submitted by one or more independent application workers. The test boundary includes connection loss, concurrent same-operation submission, key/authority change, webhook duplication/reordering, and post-result reconciliation.

## Strongest-faithful native composition
Grant Stripe all legitimate documented controls:
- secret/restricted API keys with least-privilege permissions, IP restrictions, rotation/revocation;
- POST idempotency keys;
- parameter comparison for reused idempotency keys;
- Stripe authoritative resource/object state (including PaymentIntent/Charge state as applicable);
- Request-Id and Dashboard request logs;
- immutable Event objects and webhook retry/resend behavior;
- object re-query for missing/out-of-order webhook information;
- application-side persistence of Stripe object/event IDs only where Stripe documentation explicitly requires consumers to deduplicate webhook deliveries.

No JCEE-like custom ownership ledger or authority-currentness layer is granted.

## Primary official evidence
1. Stripe API Reference — Idempotent requests: same idempotency key stores first endpoint result; subsequent requests return the same result; parameter changes are rejected; a connection error can be safely retried; results are saved only after endpoint execution begins; conflicting concurrently executing requests do not save an idempotent result. https://docs.stripe.com/api/idempotent_requests
2. Stripe API Reference — Request IDs: each API request has a Request-Id and request logs are available in Dashboard. https://docs.stripe.com/api/request_ids
3. Stripe Webhooks — retries, ordering and duplicates: automatic retries; event ordering not guaranteed; API can retrieve missing objects; webhook endpoints can receive duplicate events and consumers should log processed event IDs. https://docs.stripe.com/webhooks
4. Stripe API keys / key best practices: restricted keys limit resource privileges; IP restrictions are supported; managed-key expiration can immediately revoke platform access. https://docs.stripe.com/keys and https://docs.stripe.com/keys-best-practices

## H01–H14 matrix

| Case | Judgment | Strongest-faithful finding |
|---|---|---|
| H01 authority revoke before action | INDETERMINATE | Key revocation/expiration is supported, but documentary evidence reviewed does not specify the exact linearization semantics for a key revoked concurrently with an already-arrived consequential request. |
| H02 revoke after exact request acceptance | INDETERMINATE | Stripe authenticates the API request and performs the effect server-side, but docs reviewed do not define whether a later key revocation can or should invalidate an already accepted operation; this may be legitimate request-acceptance semantics rather than a gap. |
| H03 authority ABA/incarnation | INDETERMINATE | Key rotation/replacement exists, but a formal incarnation/version binding between an application authorization decision and the exact Stripe effect is not documented in the reviewed public API semantics. |
| H04 material dependency mutation | INDETERMINATE | Depends on which external/application dependency is claimed material. Stripe strongly binds request parameters through idempotency but does not document arbitrary application dependency closure. |
| H05 dependency ABA | INDETERMINATE | Same reason; must be tested against a concrete payment workflow and dependency definition. |
| H06 target-state race | CLOSED_NATIVE_WITH_COST | Stripe object lifecycle/state APIs and endpoint concurrency semantics provide target-side serialization/rejection for many payment operations, but exact closure is operation-specific and must be mapped per API. |
| H07 concurrent same operation | CLOSED_NATIVE for duplicate effect under same idempotency key; INDETERMINATE for execution ownership | Same-key concurrent/retry semantics are strong enough to make duplicate-effect closure plausible/documented. Public docs do not establish a native durable meaning for “which initiating worker uniquely executed the authoritative transition.” |
| H08 crash after Stripe commits / client loses response | CLOSED_NATIVE within idempotency window/retention assumptions | Stripe explicitly documents safe retry after connection error using the same idempotency key; same result is returned rather than performing the operation twice. |
| H09 lost response | CLOSED_NATIVE within idempotency semantics | Same as H08. |
| H10 duplicate retry | CLOSED_NATIVE within idempotency-key lifetime | Same key and same parameters return the saved result; parameter changes are rejected. Key pruning after at least 24h creates a bounded retention assumption that must be preserved. |
| H11 application dependency host unavailable | NOT_APPLICABLE_NATIVE_SCOPE / workflow-specific | Stripe is the target, not the application's dependency host. If the application cannot determine required material state, safe behavior is an application responsibility. |
| H12 authority/evidence host unavailable | INDETERMINATE | Stripe API outage prevents new calls; whether cached application authority may still permit an operation is outside Stripe. Stripe-side evidence can be re-queried when available. |
| H13 partial/batch ambiguity | INDETERMINATE | Must be evaluated on a specific multi-effect Stripe product/workflow; single-object idempotency does not automatically prove arbitrary batch subset closure. |
| H14 recovery permission ambiguity | INDETERMINATE | Stripe can tell the application the target operation state; public docs reviewed do not bind that state to the application's current permission to retry/refund/cancel/compensate. |

## Four-property matrix

| Property | Judgment |
|---|---|
| Current authority | INDETERMINATE at concurrent revocation/request boundary; strong credential controls exist |
| Exact effect binding | STRONGLY CLOSED for same-key same-parameter Stripe POST semantics, bounded by key retention and operation-specific APIs |
| Unique execution ownership | INDETERMINATE — native success semantics appear operation-centric, not a documented unique client-worker ownership assertion |
| Independently verifiable receipt closure | STRONGLY CLOSED for many Stripe-target outcomes via saved idempotent result + authoritative object state + request/event records; exact ownership linkage remains unresolved |

## Mandatory execution-ownership analysis
1. Same-key retries/concurrent submissions are not evidence of multiple Stripe effects.
2. More than one client attempt can legitimately receive a result representing the same logical Stripe operation.
3. Public docs reviewed characterize this as idempotent operation-result reuse, not as a claim that each client worker uniquely executed the underlying payment transition.
4. Request IDs identify API requests, but the reviewed documentation does not specify a durable native field that marks exactly one client attempt as the unique effect owner when multiple attempts converge on one idempotent result.
5. Therefore we must not label Stripe deficient from documentation alone: the remaining question is semantic and needs live adversarial observation of request logs, idempotency behavior, object state, and concurrent attempts.

## Mandatory ambiguity/recovery analysis
Stripe is a strong falsifier here. With an idempotency key, a lost connection after endpoint execution can be retried and the stored first result returned. The target object can also be retrieved independently, and webhook consumers are explicitly told not to assume ordering and to handle duplicates. This closes much of the ambiguity/recovery property at the Stripe target boundary.

What remains unproven is the whole JCEE comparator conjunction: whether the exact authority basis at the consequential boundary and unique execution-attribution semantics are themselves durably bound to that target result.

## Technical verdict

**`INDETERMINATE`**

Reason:
> Public Stripe documentation establishes unusually strong native exact-effect/idempotency and target-side recovery closure. It does not provide enough evidence to either prove or falsify the comparator's current-authority and unique-execution-ownership elements under concurrent revocation and same-operation races. Absence of those semantics from the reviewed docs is not proof of absence.

## Required live falsification to resolve
Run an official Stripe sandbox/test-mode packet with one frozen PaymentIntent-style operation and:
1. two independent workers using the same idempotency key and identical parameters;
2. capture both HTTP responses, Request-Ids, request-log entries, object state, and generated events;
3. repeat with a lost-response simulation and retry;
4. test same key / changed parameters;
5. test duplicate retry after completion;
6. where safe/possible in test mode, rotate or expire the credential around request dispatch and capture acceptance/refusal timing;
7. determine whether Stripe exposes one authoritative request/attempt as the transition owner or only one authoritative operation result.

No production credential or live-money action is authorized by this packet.

## Integration-burden observation
Stripe already supplies most target-effect closure primitives. Any surviving JCEE residual here is likely to be narrower than “payment idempotency” and may concern application authority-currentness/recovery permission/evidence composition rather than Stripe's core payment execution.

## Economic status
`NOT_EVALUATED_STEP_2`.

## JCEE-EVALS-P0.1B
- contract ID: `JCEE-DIFF-P0.1D-B2-STRIPE`
- validity: comparator and benchmark frozen before adjudication
- native judgment: official Stripe documentary reconstruction
- cross-program judgment: H01–H14 comparator
- independence: official docs only; live Stripe test not yet run
- claim ceiling: `INDETERMINATE`; no Stripe residual or JCEE advantage claimed

## Claim ceiling
Do not claim that Stripe lacks the full property. This packet specifically withholds that conclusion pending live adversarial evidence.