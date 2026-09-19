# VOW 1.1 Causal-Effect Runtime Delivery

Date: 2026-08-05  
Owner: JCEE Labs / Jonathan Chadbourne

## Outcome

The research result is now implemented in VOW as an optional,
production-shaped causal-effect retry gate.

At an unresolved keyed-effect crash boundary, a pinned authority adapter may
provide a reviewed causal contract and evidence-derived receipts. VOW replays
those receipts through one branching graph-rewriting automaton interpreter and
produces one of three verdicts:

- `safe_to_retry`
- `do_not_retry`
- `observe_first`

The causal gate is **non-broadening**. It can veto or delay a retry proposed by
the existing typed recovery table, but it can never convert `noop`, `wait`, or
`escalate` into permission.

## Shipped components

1. `vow/causal_effects.py`
   - public causal contract, mode, transition, receipt, context, decision, and
     verdict types;
   - hypergraph conflict evaluation;
   - identity alias canonicalization;
   - event-conditioned topology transitions;
   - unresolved branch handling and observation budget;
   - deterministic contract/trace hashes;
   - fail-closed validation.
2. `vow/effect_recovery.py`
   - optional `AuthorityObservation.causal_context`;
   - typed-policy-preserving causal veto/observation gate;
   - causal evidence embedded in `effect_recovery_decision` journal receipts.
3. `vow/effect_adapter_sdk.py` and `vow/__init__.py`
   - public exports for adapter and host integrations.
4. `vow_cli.py`
   - manual resume retains the existing pinned adapter behavior;
   - `sweep --effect-adapter` and `approve --effect-adapter` now forward the
     same recovery law into delegated resume.
5. `examples/causal_outbox_adapter.py`
   - runnable local reference adapter with a physically countable outside
     effect and causal reservation receipt.
6. `docs/CAUSAL_EFFECTS.md`
   - integration contract, decision law, example, and safety boundary.

## Verification performed

| Gate | Result |
|---|---:|
| New causal unit/integration/end-to-end tests | **19 passed** |
| Prior frozen authority-recovery tests | **14 passed** |
| Prior Effect Adapter SDK tests | **8 passed** |
| Complete inherited VOW suite after implementation | **366 passed, 5 skipped** |
| Manual process-crash causal recovery | **PASS; one outside effect, no duplicate** |
| Automated sweep causal recovery | **PASS; one outside effect, no duplicate** |
| Final causal decision journal chain | **intact** |

The skipped tests are environment-dependent integration tests inherited from
the base project; no new causal test was skipped.

## Covered causal cases

- delayed but not yet visible effects;
- expiry/release;
- partial fulfillment with retry of only the released remainder;
- exact higher-order conflicts where strict subsets remain safe;
- identity alias rewriting;
- event-driven topology changes;
- unresolved causal branches;
- one diagnostic observation resolving a branch;
- malformed, contradictory, or over-budget evidence failing closed;
- causal retry veto recorded before any intervention;
- manual resume and automated sweep preserving the pinned adapter.

## Honest boundary

This implementation proves that VOW can execute a supplied causal model. It
does not yet prove that VOW can infer the correct model from 30 raw black-box
probes. Adapter truthfulness, topology correctness, receipt completeness, and
provider authority remain explicit assumptions.

Generic `retry_missing` execution remains intentionally unimplemented. A
partial effect still parks rather than silently widening a targeted remainder
into a duplicate-prone full retry.

The QG-001 result did not establish a new mathematical primitive. VOW 1.1 uses
known hypergraph, automata, and graph-rewriting machinery in an evidence-backed
runtime composition.

## Verify the source delivery

```bash
python verify_causal_delivery.py
```

The verifier checks every entry in `CAUSAL-EFFECTS-MANIFEST.sha256` and refuses
missing, changed, malformed, or unexpected manifest entries.
