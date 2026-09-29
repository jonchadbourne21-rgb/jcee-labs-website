# VOW Causal-Effect Retry Gate

## Status

Experimental production-shaped implementation in VOW 1.1. The representation
is based on the least expressive model that passed the preregistered QG-001
oracle-representation test: a branching graph-rewriting automaton with
hypergraph relations.

This implementation does not claim that VOW can learn an unknown causal model
from raw traces. An effect adapter must supply a reviewed causal contract and
evidence-derived receipts.

## Why it exists

An unresolved local `effect_intent` does not reveal whether the outside world:

- applied an effect that later expired;
- fulfilled only part of an effect;
- accepted an effect that will activate later;
- renamed the affected identity;
- activated a conflict involving several otherwise-safe objects; or
- remains consistent with more than one causal topology.

Binary fields such as `present` or `delivered` cannot safely compress every
case. VOW therefore asks which causal territories remain reserved and whether
the proposed retry conflicts in every still-possible mode.

## Public model

Adapters construct four public types from `vow.effect_adapter_sdk`:

1. `CausalEffectContract`: modes, hypergraph relations, aliases, transitions,
   and diagnostic observation budget.
2. `CausalEffectReceipt`: ordered evidence events that reserve/release
   territories, transition the topology, or observe a branch.
3. `CausalRetryContext`: the contract, effect identity, receipts, and exact
   proposed territories.
4. `CausalRetryDecision`: the runtime verdict and its auditable proof data.

Receipt meanings:

| Kind | Meaning |
|---|---|
| `reserve` | A previous attempt has produced or may still produce this territory; overlapping retry is unsafe |
| `release` | Authoritative evidence removes the territory from the prior attempt's causal claim |
| `transition` | An observed event rewrites the active causal mode/topology |
| `observe` | A diagnostic observation selects one previously possible mode |

## Decision law

For each possible mode, VOW canonicalizes aliases and evaluates the exact
proposal against current reservations and active hyperedges.

- `SAFE_TO_RETRY`: every possible mode is safe.
- `DO_NOT_RETRY`: every possible mode has direct overlap or completes a
  conflicting relation.
- `OBSERVE_FIRST`: possible modes disagree.

Malformed contracts, contradictory observations, unknown transitions, excess
diagnostic observations, and duplicate/out-of-order receipts fail closed.

## Adapter example

```python
from vow.effect_adapter_sdk import (
    AuthorityObservation, CausalEffectContract, CausalEffectReceipt,
    CausalMode, CausalRetryContext, EffectContract, EvidenceStatus,
    RecoveryEvidence,
)

def reconcile(*, capability, action, args, key, probes_used):
    # Provider lookup omitted: all fields below must come from authoritative
    # traces, not guesses or VOW mechanism labels.
    causal = CausalRetryContext(
        contract=CausalEffectContract(
            modes=(CausalMode(
                "current",
                relations=(("account:7", "invoice:7", "charge:7"),),
                aliases={"customer:new": "account:7"},
            ),),
            initial_modes=("current",),
        ),
        effect_id=key,
        receipts=(CausalEffectReceipt(
            receipt_id="provider-event-91",
            effect_id=key,
            sequence=1,
            kind="reserve",
            territories=("account:7",),
            evidence_ref="provider:event:91",
        ),),
        proposal=("invoice:7", "charge:7"),
    )
    return AuthorityObservation(
        contract=EffectContract(
            authoritative_lookup=True,
            dedupe_window_seconds=3600,
            same_key_deduplicated=True,
            recipient_retry_supported=False,
        ),
        evidence=RecoveryEvidence(
            status=EvidenceStatus.ABSENT,
            request_age_seconds=30,
            probes_used=probes_used,
        ),
        causal_context=causal,
    )
```

The typed table would normally permit a same-key retry in this example. The
causal gate refuses it because the reservation plus proposed territories
complete an active three-object conflict. VOW parks the run for approval and
records the full decision receipt.

## Runtime integration

The extension sits inside the existing unresolved keyed-effect recovery path:

1. Replay reaches an `effect_intent` without `effect_result`.
2. Local completed-effect lookup finds no closure.
3. The pinned effect adapter observes the authority.
4. Existing typed recovery proposes an action.
5. The causal gate may preserve, veto, or request another observation.
6. VOW appends `effect_recovery_decision` before retrying, waiting, suppressing,
   or escalating.

No causal adapter means byte-for-byte policy compatibility with v1.0 recovery.
Manual `--resume`, `sweep --effect-adapter`, and
`approve --effect-adapter` all forward the same pinned adapter identity. The
environment fallback `VOW_EFFECT_RECOVERY_ADAPTER` remains available for
schedulers that do not place adapter paths on their command line.

## Safety and claim boundary

- The gate never broadens permission.
- A model or adapter can still be wrong or dishonest.
- Hashes prove which contract and trace were evaluated; they do not prove the
  external authority told the truth.
- Production use requires provider-specific schema review, receipt coverage,
  adapter signing/review, adversarial tests, and fail-closed handling for stale
  or contradictory evidence.
- `RETRY_MISSING` remains parked until an adapter-specific targeted executor is
  implemented; VOW never silently widens it to a full retry.
