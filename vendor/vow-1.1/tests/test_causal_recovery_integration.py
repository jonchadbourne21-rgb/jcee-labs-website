from __future__ import annotations

from pathlib import Path
import tempfile

from vow.causal_effects import (
    CausalEffectContract,
    CausalEffectReceipt,
    CausalMode,
    CausalRetryContext,
    RetryVerdict,
)
from vow.database import SqliteDatabase
from vow.effect_recovery import (
    AuthorityObservation,
    EffectContract,
    EvidenceStatus,
    RecoveryAction,
    RecoveryEvidence,
    decide_recovery,
)
from vow.vow_transpiler import JournalRuntime, VowSuspend
from vow_cli import build_arg_parser


def authority_contract(**changes):
    values = dict(
        authoritative_lookup=True,
        dedupe_window_seconds=3600,
        same_key_deduplicated=True,
        recipient_retry_supported=True,
        max_status_probes=2,
    )
    values.update(changes)
    return EffectContract(**values)


def causal_context(*, reserved=True, branch=False, observed=None):
    modes = (
        CausalMode("unsafe", (("invoice:7", "retry:7"),)),
        CausalMode("safe", (("other", "relation"),)),
    )
    initial = ("unsafe", "safe") if branch else ("unsafe",)
    receipts = []
    if reserved:
        receipts.append(CausalEffectReceipt(
            receipt_id="reservation",
            effect_id="send-7",
            sequence=1,
            kind="reserve",
            territories=("invoice:7",),
            evidence_ref="provider:event:1",
        ))
    if observed:
        receipts.append(CausalEffectReceipt(
            receipt_id="observation",
            effect_id="send-7",
            sequence=2,
            kind="observe",
            observed_mode=observed,
            evidence_ref="provider:probe:2",
        ))
    return CausalRetryContext(
        contract=CausalEffectContract(
            modes=modes,
            initial_modes=initial,
            max_diagnostic_observations=1,
        ),
        effect_id="send-7",
        receipts=tuple(receipts),
        proposal=("retry:7",),
    )


def absent(probes=1):
    return RecoveryEvidence(
        EvidenceStatus.ABSENT,
        request_age_seconds=60,
        probes_used=probes,
    )


def test_causal_gate_vetoes_typed_retry():
    decision = decide_recovery(
        authority_contract(), absent(), causal_context(reserved=True)
    )
    assert decision.action == RecoveryAction.ESCALATE
    assert decision.causal_verdict == RetryVerdict.DO_NOT_RETRY


def test_causal_gate_allows_but_never_broadens_typed_policy():
    safe = causal_context(reserved=False)
    retry = decide_recovery(authority_contract(), absent(), safe)
    queued = decide_recovery(
        authority_contract(),
        RecoveryEvidence(EvidenceStatus.QUEUED, 60, 1),
        safe,
    )
    assert retry.action == RecoveryAction.RETRY_SAME_KEY
    assert retry.causal_verdict == RetryVerdict.SAFE_TO_RETRY
    assert queued.action == RecoveryAction.WAIT


def test_branch_disagreement_spends_probe_before_retry():
    first = decide_recovery(
        authority_contract(), absent(probes=1), causal_context(branch=True)
    )
    second = decide_recovery(
        authority_contract(),
        absent(probes=2),
        causal_context(branch=True, observed="safe"),
    )
    assert first.action == RecoveryAction.PROBE
    assert first.causal_verdict == RetryVerdict.OBSERVE_FIRST
    assert second.action == RecoveryAction.RETRY_SAME_KEY
    assert second.causal_verdict == RetryVerdict.SAFE_TO_RETRY


def test_invalid_causal_trace_refuses_retry():
    value = causal_context(reserved=False)
    malformed = {
        "contract": value.contract.to_dict(),
        "effect_id": "send-7",
        "receipts": [{
            "receipt_id": "bad",
            "effect_id": "send-7",
            "sequence": 1,
            "kind": "transition",
            "event": "unknown",
        }],
        "proposal": ["retry:7"],
    }
    decision = decide_recovery(authority_contract(), absent(), malformed)
    assert decision.action == RecoveryAction.ESCALATE
    assert decision.causal_verdict == RetryVerdict.DO_NOT_RETRY
    assert "invalid" in decision.reason


def test_runtime_journals_causal_veto_and_never_refires():
    with tempfile.TemporaryDirectory(prefix="vow-causal-runtime-") as td:
        db = SqliteDatabase(str(Path(td) / "journal.db"))
        live = JournalRuntime(db, "run", mode="live")
        live.append("effect_intent", {
            "capability": "shell",
            "action": "shell_exec",
            "args": ["provider-send"],
            "key": "key-1",
        })
        calls = []

        def resolver(**kwargs):
            calls.append(kwargs)
            return AuthorityObservation(
                contract=authority_contract(),
                evidence=absent(kwargs["probes_used"]),
                causal_context=causal_context(reserved=True),
            )

        replay = JournalRuntime(
            db,
            "run",
            mode="replay",
            events=db.load_journal("run"),
            recovery_resolver=resolver,
        )
        try:
            replay.effect_replay(
                "shell", "shell_exec", ["provider-send"], key="key-1"
            )
            raise AssertionError("causal veto did not suspend recovery")
        except VowSuspend as suspended:
            assert suspended.kind == "approval"
        assert len(calls) == 1
        event = db.load_journal("run")[-1]
        assert event["kind"] == "effect_recovery_decision"
        assert event["payload"]["decision"] == "escalate"
        assert event["payload"]["causal_gate"]["verdict"] == "do_not_retry"
        assert len(event["payload"]["causal_gate"]["receipt"]["trace_sha256"]) == 64


def test_sweep_and_approve_accept_the_pinned_adapter():
    parser = build_arg_parser()
    adapter = "/absolute/causal_adapter.py:reconcile"
    sweep = parser.parse_args([
        "sweep", "--db", "vow.db", "--effect-adapter", adapter,
    ])
    approve = parser.parse_args([
        "approve", "run-1", "quest.vow", "--db", "vow.db",
        "--effect-adapter", adapter,
    ])
    assert sweep.effect_adapter == adapter
    assert approve.effect_adapter == adapter


if __name__ == "__main__":
    tests = [
        value for name, value in sorted(globals().items())
        if name.startswith("test_") and callable(value)
    ]
    for test in tests:
        test()
    print(f"{len(tests)} causal recovery integration tests passed")
