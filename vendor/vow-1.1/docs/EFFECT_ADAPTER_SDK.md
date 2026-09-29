# VOW Effect Adapter SDK v1

The SDK closes VOW's ambiguous external-effect crash window against evidence
from the authority that owns the effect.

## Adapter contract

An official adapter is a Python file containing:

1. `VOW_EFFECT_ADAPTER_MANIFEST` with `name`, `version`, `provider`,
   `protocol_version`, and supported `operations`.
2. A resolver function accepting keyword arguments `capability`, `action`,
   `args`, `key`, and `probes_used`.
3. An `AuthorityObservation` containing an `EffectContract` and
   `RecoveryEvidence`.

An adapter may also attach a `CausalRetryContext` to the observation. This
optional v1.1 extension describes the causal territories proposed for retry,
the evidence receipts seen so far, and a branching hypergraph contract. The
runtime—not the adapter—replays that structure and produces the retry verdict.
Existing v1.0 adapters remain valid without it.

Adapters import public types from `vow.effect_adapter_sdk`. They observe and
translate provider evidence. They do not choose recovery policy.

## Runtime use

```text
vow run quest.vow --db vow.db --live \
  --effect-adapter /absolute/adapter.py:reconcile

vow run quest.vow --db vow.db --live --resume RUN_ID \
  --effect-adapter /absolute/adapter.py:reconcile

vow sweep --db vow.db \
  --effect-adapter /absolute/adapter.py:reconcile
```

`run_begin` pins the manifest and adapter SHA-256. Resume refuses a missing,
different, or modified adapter because that would change the recovery law
after execution began. Adapter-backed runs cannot use `--no-journal`.

## Frozen recovery policy

| Authority evidence | Runtime decision |
|---|---|
| Delivered | Do not execute again |
| Queued | Wait and re-observe later |
| Authoritative absence inside same-key dedupe window | Retry same key |
| Partial with targeted retry support | Retry only missing targets |
| Unknown with probe budget | Probe again |
| Unsafe, expired, unsupported, or unresolved | Escalate |

When a causal context is present, this typed decision is passed through a
**non-broadening causal gate**:

| Causal verdict | Effect on typed policy |
|---|---|
| `safe_to_retry` | Preserve the typed action; never creates permission by itself |
| `do_not_retry` | Veto a proposed retry and escalate |
| `observe_first` | Probe once when budget remains; otherwise escalate |

The resulting `effect_recovery_decision` receipt includes the verdict,
possible modes, blockers, reservations, contract hash, and trace hash.

The generic v1 runtime does not yet execute missing-target retries. It parks
them for human approval rather than broadening them into a duplicate-prone
full retry.

## Stripe v1 adapter

`stripe_payment_intent_adapter.py` supports confirming an already-created
PaymentIntent whose ID is known before the effect. It retrieves that same
PaymentIntent during recovery and maps its state:

- `succeeded` or `requires_capture` -> delivered confirmation;
- `processing` -> wait;
- `requires_confirmation` -> absent confirmation;
- `requires_action` or `requires_payment_method` -> partial/intervention;
- `canceled` or transport failure -> unknown.

The command reads `STRIPE_SECRET_KEY` from the process environment, never from
VOW source or journal arguments. It refuses live keys by default and removes
`client_secret` from evidence. The adapter uses the VOW effect key as Stripe's
`Idempotency-Key` for the confirm POST.

Stripe sources used to define this adapter:

- https://docs.stripe.com/payments/paymentintents/lifecycle
- https://docs.stripe.com/payments/payment-intents
- https://docs.stripe.com/api-v2-overview
- https://docs.stripe.com/api/errors
- https://docs.stripe.com/testing/overview

## Safety boundary

An adapter receipt proves which code, contract, evidence, and decision VOW
used. It does not prove that a provider or adapter told the truth. Production
certification requires provider sandbox traces, credential isolation,
webhook reconciliation where applicable, adapter review/signing, and chaos
tests for every mapped state.
