# JCEE-DIFF-P0.1D — Step 2 Benchmark Falsification Synthesis

Status: **CLOSED_DOCUMENTARY_BENCHMARK_SET / STRIPE_LIVE_TEST_UNRESOLVED**
Date: 2026-09-03

## Frozen controls
- Comparator contract blob: `346f0ece4e755457f725f936f0bb3a9800889708`
- Benchmark-selection blob: `c486d7c57d50e7f7e36d6cffbb5ab106b88922f6`
- Temporal packet blob: `a95b967d76c5b3236c37afaddfb6562cd8347633`
- Stripe packet blob: `604e3f21a1fc855def5f4b2b132b4b5606404b05`
- SpiceDB packet blob: `aee97e5c7ef002e278c3497b1a98bdab2904f648`
- AWS-native packet blob: `b8216fbb93402b1d70302fe989115f43c00cf334`

## Benchmark results

| Benchmark | Technical verdict | What it kills / preserves |
|---|---|---|
| Temporal | `RESIDUAL_PROPERTY` | Kills any claim that durable orchestration/recovery is unique. External commit-before-ack still depends on target idempotency/reconciliation for end-to-end closure. |
| Stripe | `INDETERMINATE` | Strongest direct effect/idempotency falsifier. Public docs strongly close duplicate-effect/lost-response recovery, but current-authority and unique execution-attribution semantics require live adversarial observation. No JCEE advantage may be inferred. |
| Authzed / SpiceDB | `RESIDUAL_PROPERTY` | Kills current-authority/currentness as a standalone JCEE moat. ZedToken/consistency semantics provide strong native authorization freshness. Effect binding/ownership/receipt closure remain outside authorization scope. |
| AWS-native composition | `RESIDUAL_PROPERTY` | Kills broad uniqueness claims around exactly-once workflow identity + OCC/transactions + idempotency + audit composition. Residual remains across immediate authority and external service boundaries that do not share one native transaction. |

## Falsification result

The benchmark set does **not** support a broad JCEE differentiator claim.

The following candidate moat components are independently mature or strongly composable in neighboring systems and must not be sold as unique:
- current/fresh authorization by itself;
- durable workflow recovery by itself;
- exactly-once workflow execution by itself;
- target OCC/CAS by itself;
- idempotency/deduplication by itself;
- target authoritative state by itself;
- audit/event history by itself;
- generic composition of workflow + OCC + idempotency + authorization + audit.

The broad architecture-level moat is therefore narrowed.

## Surviving narrow candidate property

After giving the benchmarks their strongest-faithful native controls, the property that still survives documentary falsification is:

`CURRENT/CAUSALLY-FRESH AUTHORITY`
`+ EXACT CONSEQUENTIAL EFFECT BINDING`
`+ UNIQUE EXECUTION OWNERSHIP / NON-CONFLICTING AUTHORITATIVE ATTRIBUTION`
`+ INDEPENDENTLY VERIFIABLE RECEIPT CLOSURE`
`+ AUTHORITY-CLOSED RECOVERY AFTER AMBIGUOUS FAILURE`

specifically **across a consequential boundary where authorization, orchestration, and target effect do not share one native transactional/ownership domain**.

This is a candidate residual, not an earned uniqueness or commercial-moat claim.

## R2C→R2D→R2E lesson after benchmark attack

The execution-ownership distinction survived the documentary benchmark attack, but with an important qualification:
- some systems, especially Stripe, define success at the logical-operation/result level rather than claiming that each client attempt uniquely executed the effect;
- therefore multiple clients receiving the same idempotent success result is not automatically conflicting ownership evidence;
- a JCEE residual exists only if the proposed workflow actually requires unique performer/attempt attribution or an unambiguous winner/reconciler distinction for safety, recovery, audit, liability, or control.

This prevents overclaiming the R2C lesson as a universal requirement.

## Strongest unresolved falsifier — Stripe

Stripe remains `INDETERMINATE`, not `RESIDUAL_PROPERTY`.

The required live test is frozen in `JCEE_DIFF_P0_1D_B2_STRIPE_20260903.md`:
- two independent workers, same idempotency key/parameters;
- capture both responses and Request-Ids;
- inspect request logs, target object state, generated events;
- lost-response retry;
- same key with changed parameters;
- post-completion duplicate retry;
- safe test-mode credential rotation/expiration around dispatch if possible;
- determine whether Stripe exposes one authoritative transition owner or only one logical operation result.

No production credential, live payment, or customer data is authorized.

## Current Step 2 disposition

**`ADVANCE_RESIDUAL_NO_BUILD_YET`**

Rationale:
1. Three benchmark classes leave a mechanically defined cross-boundary residual.
2. The strongest direct consequential target, Stripe, remains unresolved and materially capable of killing or further narrowing that residual.
3. Economic importance has not yet been tested.
4. Integration burden has not yet been compared against concrete customer workflows.
5. Therefore no engineering authority is earned.

## Commercialization constraint

Do not update Payabli/payOS commercialization claims to “JCEE closes a proven gap” from these benchmark results.

When those targets are analyzed, they must receive the same comparator and strongest-faithful treatment. The surviving benchmark result only tells us **what narrow property is still worth testing**, not that either company lacks it.

## Next authorized actions

Priority order:
1. Resolve Stripe B2 with a safe test-mode adversarial run if a legitimate sandbox credential/route becomes available.
2. Apply the frozen P0.1D comparator to Payabli and payOS independently, carrying Stripe `INDETERMINATE` as an explicit uncertainty.
3. For any surviving target-specific `RESIDUAL_PROPERTY`, measure economic importance and integration burden.
4. Only `RESIDUAL_PROPERTY + ECONOMIC_IMPORTANCE + ACCEPTABLE_INTEGRATION_BURDEN` can authorize a bounded integration probe.

No QCS/DCC engineering successor is authorized.

## Claim ceiling
Earned:
- a documentary strongest-faithful benchmark comparison against four deliberately strong capability classes;
- elimination of several broad differentiator formulations;
- nomination of a narrower cross-boundary residual property for further falsification.

Not earned:
- uniqueness;
- novelty/patentability/FTO;
- provider or market superiority;
- production readiness;
- proof that Stripe, Payabli, payOS, or any commercial target lacks the surviving property;
- economic value of the residual.