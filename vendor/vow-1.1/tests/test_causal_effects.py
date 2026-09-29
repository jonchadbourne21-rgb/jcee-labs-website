from __future__ import annotations

from vow.causal_effects import (
    CausalEffectContract,
    CausalEffectReceipt,
    CausalMode,
    CausalModelError,
    CausalReceiptKind,
    CausalRetryContext,
    CausalTransition,
    RetryVerdict,
    decide_causal_retry,
)


def receipt(sequence, kind, *, territories=(), event=None, observed_mode=None):
    return CausalEffectReceipt(
        receipt_id=f"r-{sequence}",
        effect_id="effect-1",
        sequence=sequence,
        kind=kind,
        territories=tuple(territories),
        event=event,
        observed_mode=observed_mode,
        evidence_ref=f"journal:{sequence}",
    )


def context(contract, receipts, proposal):
    return CausalRetryContext(
        contract=contract,
        effect_id="effect-1",
        receipts=tuple(receipts),
        proposal=tuple(proposal),
    )


def steady_contract(*, relations=(), aliases=None):
    return CausalEffectContract(
        modes=(CausalMode("steady", tuple(relations), aliases or {}),),
        initial_modes=("steady",),
    )


def test_delayed_reservation_refuses_invisible_retry():
    decision = decide_causal_retry(context(
        steady_contract(),
        [receipt(1, CausalReceiptKind.RESERVE, territories=("invoice:7",))],
        ("invoice:7",),
    ))
    assert decision.verdict == RetryVerdict.DO_NOT_RETRY
    assert decision.blocking_relations["steady"] == (("invoice:7", "invoice:7"),)


def test_expiry_release_makes_retry_safe():
    decision = decide_causal_retry(context(
        steady_contract(),
        [
            receipt(1, "reserve", territories=("lease:4",)),
            receipt(2, "release", territories=("lease:4",)),
        ],
        ("lease:4",),
    ))
    assert decision.verdict == RetryVerdict.SAFE_TO_RETRY
    assert decision.reservations["steady"] == ()


def test_partial_fulfillment_authorizes_only_released_remainder():
    receipts = [
        receipt(1, "reserve", territories=("unit:1", "unit:2", "unit:3")),
        receipt(2, "release", territories=("unit:3",)),
    ]
    missing = decide_causal_retry(context(steady_contract(), receipts, ("unit:3",)))
    fulfilled = decide_causal_retry(context(steady_contract(), receipts, ("unit:2",)))
    assert missing.verdict == RetryVerdict.SAFE_TO_RETRY
    assert fulfilled.verdict == RetryVerdict.DO_NOT_RETRY


def test_hyperedge_preserves_safe_pair_and_harmful_triple():
    contract = steady_contract(relations=(("a", "b", "c"),))
    receipts = [receipt(1, "reserve", territories=("a",))]
    safe_pair = decide_causal_retry(context(contract, receipts, ("b",)))
    completed_triple = decide_causal_retry(context(contract, receipts, ("b", "c")))
    assert safe_pair.verdict == RetryVerdict.SAFE_TO_RETRY
    assert completed_triple.verdict == RetryVerdict.DO_NOT_RETRY
    assert completed_triple.blocking_relations["steady"] == (("a", "b", "c"),)


def test_identity_alias_rewrite_prevents_duplicate():
    contract = steady_contract(aliases={"customer:new": "customer:canonical"})
    decision = decide_causal_retry(context(
        contract,
        [receipt(1, "reserve", territories=("customer:canonical",))],
        ("customer:new",),
    ))
    assert decision.verdict == RetryVerdict.DO_NOT_RETRY


def test_event_transition_changes_active_hypergraph():
    contract = CausalEffectContract(
        modes=(
            CausalMode("before", (("a", "b", "c"),)),
            CausalMode("after", (("d", "e", "f"),)),
        ),
        initial_modes=("before",),
        transitions=(CausalTransition("before", "shift", "after"),),
    )
    decision = decide_causal_retry(context(
        contract,
        [
            receipt(1, "transition", event="shift"),
            receipt(2, "reserve", territories=("d",)),
        ],
        ("e", "f"),
    ))
    assert decision.verdict == RetryVerdict.DO_NOT_RETRY
    assert decision.possible_modes == ("after",)


def branching_context(observed_mode=None):
    contract = CausalEffectContract(
        modes=(
            CausalMode("red", (("a", "b"),)),
            CausalMode("blue", (("c", "d"),)),
        ),
        initial_modes=("red", "blue"),
        max_diagnostic_observations=1,
    )
    receipts = [receipt(1, "reserve", territories=("a",))]
    if observed_mode is not None:
        receipts.append(receipt(2, "observe", observed_mode=observed_mode))
    return context(contract, receipts, ("b",))


def test_branch_disagreement_requests_observation():
    decision = decide_causal_retry(branching_context())
    assert decision.verdict == RetryVerdict.OBSERVE_FIRST
    assert decision.safe_modes == ("blue",)
    assert decision.unsafe_modes == ("red",)


def test_one_observation_resolves_safe_branch():
    decision = decide_causal_retry(branching_context("blue"))
    assert decision.verdict == RetryVerdict.SAFE_TO_RETRY
    assert decision.observations_used == 1


def test_one_observation_resolves_unsafe_branch():
    decision = decide_causal_retry(branching_context("red"))
    assert decision.verdict == RetryVerdict.DO_NOT_RETRY
    assert decision.observations_used == 1


def test_unknown_transition_fails_closed():
    contract = steady_contract()
    try:
        decide_causal_retry(context(
            contract,
            [receipt(1, "transition", event="unmodeled")],
            ("x",),
        ))
        raise AssertionError("unknown transition was accepted")
    except CausalModelError as exc:
        assert "no transition" in str(exc)


def test_decision_receipt_hashes_are_deterministic():
    candidate = context(
        steady_contract(relations=(("a", "b"),)),
        [receipt(1, "reserve", territories=("a",))],
        ("b",),
    )
    first = decide_causal_retry(candidate).to_dict()
    second = decide_causal_retry(candidate).to_dict()
    assert first == second
    assert len(first["contract_sha256"]) == 64
    assert len(first["trace_sha256"]) == 64


if __name__ == "__main__":
    tests = [
        value for name, value in sorted(globals().items())
        if name.startswith("test_") and callable(value)
    ]
    for test in tests:
        test()
    print(f"{len(tests)} causal-effect tests passed")
