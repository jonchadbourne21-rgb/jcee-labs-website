# When a Timeout Is Not a Failure: Authority, Evidence, and Recovery in Consequential AI Execution

Engineering blog · Jonathan Chadbourne · 2026-10-10 · Version 1.0

A timeout leaves an outcome uncertain. Recovery must establish the authorized occurrence before deciding whether another action is permitted.

## A timeout describes the connection, not the consequence

An AI-assisted workflow may receive permission to perform a specific action, record its intent, send a request to an external system, and lose the response. The timeout establishes that the caller did not receive a conclusive reply. The target may still have committed the effect.

Treating the timeout as failure and immediately retrying can create a duplicate consequence. Treating it as success can hide an unfinished operation. The accountable result is an unresolved outcome until competent evidence establishes what occurred.

## Keep the transitions separate

The control path is AUTHORIZED → INTENT_DURABLE → DISPATCHED → TARGET_COMMITTED → OBSERVED → EVIDENCE_COMMITTED. Each transition has its own evidence requirement. A dispatch record does not prove target commitment; a target acknowledgement does not by itself prove the final independently reviewable record was committed.

The evidence of occurrence must be evidence of the authorized occurrence: the exact effect identity, relevant scope, and current business authority must still match. A record of some external change does not validate a change outside the permission that was granted.

## Idempotency and permission answer different questions

An idempotency key can help a target recognize a repeated request for the same effect. It does not grant authority to issue that request, extend an expired approval, or resolve a changed business state. Likewise, evidence that an earlier effect did not occur is not automatic permission to retry.

Before another consequential attempt, the workflow must reconcile the target's competent record, preserve uncertainty where the result cannot be established, and check whether current authority still covers the exact action. A revoked or stale ancestor approval cannot be repaired by a confident model answer.

## What the public example establishes

JCEE's VOW reference and infrastructure work investigate durable intent, recovery, current authority, external effects, and inspectable receipts in bounded settings. This note explains the architectural obligation; it does not claim that every provider or production workflow has qualified.

JCEE-INFRA P0 has a frozen contract, P1 and P2 have bounded test passes, and P3 remains partial under a governance hold. The payment consequence lane has not qualified. Customer production performance, a general safety guarantee, and independent certification remain unestablished.

## Continue reading

- [Infrastructure gates and holds](https://jceelabs.com/technology#infrastructure-build)
- [What Happens After an AI Says ‘Done’?](https://jceelabs.com/blog/after-an-ai-says-done)
- [Public Registry](https://jceelabs.com/registry)
