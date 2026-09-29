from pathlib import Path

import pytest

from backend.vow_assurance import (
    VowPolicyDenied,
    authorize_settlement,
    run_recovery_cycle,
    verify_evidence,
    verify_frozen_core,
)


def covered_estimate() -> dict:
    return {
        "line_items": [
            {
                "zone_id": "ZN_TEST",
                "room": "KITCHEN",
                "cat_sel": "FNC BASE4",
                "description": "Covered repair",
                "quantity": 10.0,
                "unit": "LF",
                "unit_price": 10.0,
                "rcv": 100.0,
                "depreciation": 10.0,
                "acv": 90.0,
                "is_covered": True,
            }
        ],
        "gross_rcv": 100.0,
        "total_depreciation": 10.0,
        "net_acv": 90.0,
        "deductible": 50.0,
        "net_payout": 40.0,
    }


def test_frozen_vow_core_matches_release_manifest() -> None:
    result = verify_frozen_core()
    assert result["status"] == "VERIFIED"
    assert result["version"] == "1.1.0"
    assert result["files_verified"] >= 100
    assert len(result["manifest_sha256"]) == 64


def test_vow_keyed_effect_replays_without_duplicate_write(tmp_path: Path) -> None:
    first = authorize_settlement(
        claim_id="CLM_IDEMPOTENT",
        estimate=covered_estimate(),
        adjuster_name="A. Adjuster",
        notes="Approved after review.",
        data_dir=tmp_path,
    )
    second = authorize_settlement(
        claim_id="CLM_IDEMPOTENT",
        estimate=covered_estimate(),
        adjuster_name="A. Adjuster",
        notes="Approved after review.",
        data_dir=tmp_path,
    )

    assert first["status"] == "VERIFIED"
    assert first["effect"]["outcome"] == "ok"
    assert first["effect"]["idempotent_replay"] is False
    assert second["status"] == "VERIFIED"
    assert second["effect"]["outcome"] == "idempotent_replay"
    assert second["effect"]["idempotent_replay"] is True
    assert first["authorization_sha256"] == second["authorization_sha256"]
    assert first["run_id"] != second["run_id"]
    assert verify_evidence(first, data_dir=tmp_path)["ok"] is True
    assert verify_evidence(second, data_dir=tmp_path)["ok"] is True

    with pytest.raises(VowPolicyDenied):
        authorize_settlement(
            claim_id="CLM_IDEMPOTENT",
            estimate=covered_estimate(),
            adjuster_name="A. Adjuster",
            notes="Changed after the effect already completed.",
            data_dir=tmp_path,
        )
    assert len(list((tmp_path / "effects").glob("*.json"))) == 1


def test_recovery_cycle_is_idle_before_first_assurance_run(tmp_path: Path) -> None:
    result = run_recovery_cycle(data_dir=tmp_path)
    assert result == {"status": "idle", "reason": "VOW assurance database has not been created"}
