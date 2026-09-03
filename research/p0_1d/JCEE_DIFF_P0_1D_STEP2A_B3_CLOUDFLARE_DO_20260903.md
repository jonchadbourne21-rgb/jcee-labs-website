# JCEE-DIFF-P0.1D Step 2A — B3 Cloudflare Durable Objects Target Packet

Status: **ADJUDICATED / DOCUMENTARY TECHNICAL PASS**
Date: 2026-09-03
Parent: `JCEE_DIFF_P0_1D_STEP2A_DURABLE_SUBSTRATE_ASSAULT_FREEZE_20260903.md`

## Target workflow
A Durable Object with one logical resource/effect identity coordinates concurrent clients and performs an irreversible external API call. Evaluate internal storage mutation separately from the outbound external effect.

## Strongest-faithful native composition
Grant Cloudflare Durable Objects:
- globally unique object identity;
- single-instance/single-threaded coordination semantics within documented limits;
- strongly consistent per-object durable storage;
- storage transactions and input/output gates;
- RPC ordering semantics;
- alarms and retry metadata;
- `blockConcurrencyWhile()` where legitimate, while respecting Cloudflare's warning against holding it across external I/O;
- optimistic version/check-and-set patterns recommended by Cloudflare for external `fetch()` races.

Do not treat external HTTP/API effects as part of Durable Object storage transactions.

## Primary official evidence
1. Durable Objects concepts: each object has globally unique identity and strongly consistent transactional storage. https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/
2. Rules of Durable Objects: `fetch()` can permit interleaving and target/storage races; Cloudflare recommends optimistic locking; holding `blockConcurrencyWhile()` across external I/O is an anti-pattern. https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/
3. Known issues: global uniqueness is enforced when starting events and accessing storage; a long-running event that no longer accesses storage can become non-current without realizing it. https://developers.cloudflare.com/durable-objects/platform/known-issues/
4. Error handling: retryable errors should be retried when requests are idempotent; for non-idempotent requests the application must decide what is safe. https://developers.cloudflare.com/durable-objects/best-practices/error-handling/
5. Alarms: alarms have at-least-once execution and retry on failure. https://developers.cloudflare.com/durable-objects/api/alarms/
6. SQLite storage transactions: transactions cover Durable Object storage operations, not arbitrary asynchronous external effects. https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/

## H01–H14 matrix
| Case | Judgment | Finding |
|---|---|---|
| H01 authority revoke before action | RESIDUAL | Durable Objects do not supply a universal current-authorization system. |
| H02 revoke after authorization | RESIDUAL | No atomic binding between an external authorization check and arbitrary outbound effect. |
| H03 authority ABA | RESIDUAL | External authority incarnation/version must be represented by application state. |
| H04 material dependency mutation | CLOSED_NATIVE for object-owned storage; RESIDUAL for external dependency | Strong local storage/serialization protects object state, not arbitrary remote dependencies. |
| H05 dependency ABA | RESIDUAL outside explicitly versioned object state | External incarnation binding is application-defined. |
| H06 target-state race | RESIDUAL for external target | Official docs show outbound `fetch()` allows interleaving and recommend optimistic locking/revalidation. |
| H07 concurrent same-op workers | STRONG/CLOSED for object-local coordination; RESIDUAL for an outbound effect once execution crosses external I/O | One Durable Object can coordinate callers, but external call acceptance is not atomically part of the object's storage transaction. |
| H08 crash after external commit/before local receipt | RESIDUAL | The object may know only that an outbound request was attempted; safe retry of non-idempotent requests is application-specific. |
| H09 lost response | RESIDUAL | External target idempotency/query semantics are needed to know whether the effect happened. |
| H10 duplicate retry | CLOSED_NATIVE if application stores/deduplicates operation identity locally and target call is safely reconciled; otherwise RESIDUAL | Local coordination is strong; external duplicate effect remains target-dependent. |
| H11 dependency host unavailable | CLOSED_NATIVE_WITH_COST | Local state stays durable; external call can fail and be retried/handled, but no fabricated target success. |
| H12 authority/evidence host unavailable | CLOSED_NATIVE_WITH_COST | Fail-closed authorization remains application policy. |
| H13 partial/batch ambiguity | RESIDUAL for multi-target external effects | Object storage cannot prove an arbitrary external committed subset without target evidence. |
| H14 recovery-permission ambiguity | RESIDUAL | Retry/compensate permission is not a built-in current-authority semantic. |

## Four-property matrix
| Property | Judgment |
|---|---|
| Current authority | RESIDUAL |
| Exact effect binding | STRONG for object-local state; RESIDUAL for arbitrary external effect |
| Unique execution ownership | STRONG for current object-local mutation; RESIDUAL across stale-instance/external-call edge without revalidation |
| Independently verifiable receipt closure | STRONG for durable local state; RESIDUAL for external commit-before-observation |

## Mandatory execution-ownership analysis
Cloudflare kills any broad claim that globally unique keyed coordination is special to JCEE. A Durable Object is an excellent owner for one logical resource and can serialize durable local state changes.

However, the outbound effect boundary matters. Cloudflare explicitly documents that asynchronous external `fetch()` allows other requests to execute and change storage unless the application rechecks state/version. Further, the known stale-instance edge means a long-running event that stops touching durable storage may no longer be current. Thus an object must use durable-state revalidation/fencing around consequential external operations if current ownership matters.

## Ambiguity/recovery analysis
Durable Object storage can reliably record intent, versions, and reconciliation state. It cannot by itself know whether a remote target accepted a request whose response was lost. Cloudflare's retry guidance explicitly distinguishes idempotent from non-idempotent requests and leaves the latter to application policy. Alarms are themselves at-least-once, so replay-safe external actions still require effect identity/reconciliation.

## Technical verdict
**`RESIDUAL_PROPERTY`**

Exact residual:
> Cloudflare Durable Objects strongly close per-key coordination and durable local state, but an arbitrary outbound consequential effect is outside the object's storage transaction and can occur across documented interleaving, stale-instance, timeout, and retry boundaries. End-to-end exact effect ownership and receipt closure require explicit version/fencing plus target idempotency or reconciliation, while current authorization and recovery permission remain application/authority-system concerns.

## What Cloudflare kills as JCEE differentiators
- globally unique per-resource coordination;
- strong per-key durable state;
- local transactional mutation;
- basic single-owner/actor patterns;
- durable scheduling by itself.

## Infrastructure significance for JCEE
Durable Objects are useful for edge-local/keyed coordinators, but adopting them as JCEE's primary execution substrate would couple JCEE to Cloudflare while not removing the external-effect closure problem. They are less attractive than Restate as a general substrate candidate for current JCEE scope, though potentially valuable for a future edge adapter.

## JCEE-EVALS-P0.1B
- contract ID: `JCEE-DIFF-P0.1D-STEP2A-B3-CLOUDFLARE-DO`
- validity: frozen before adjudication
- native judgment: official Cloudflare documentary reconstruction
- independence: official docs; no live Workers harness
- claim ceiling: documentary residual only

## Next authority
Continue to B4 Azure Durable Task. No platform adoption/build authority.