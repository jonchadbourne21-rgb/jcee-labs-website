"""VOW 1.1 assurance boundary for consequential claim settlement effects.

The frozen VOW runtime is vendored as an immutable dependency under
``vendor/vow-1.1``. This module owns only integration concerns: rendering a
claim-specific quest, invoking the frozen CLI, exporting a signed evidence
pack, and exposing compact receipt metadata to the claims dossier.
"""
from __future__ import annotations

import hashlib
import json
import os
import secrets
import subprocess
import sys
from functools import lru_cache
from pathlib import Path
from typing import Any

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
VOW_CORE = REPOSITORY_ROOT / "vendor" / "vow-1.1"
VOW_CLI = VOW_CORE / "vow_cli.py"
VOW_MANIFEST = VOW_CORE / "CAUSAL-EFFECTS-MANIFEST.sha256"
VOW_VERSION = "1.1.0"
QUEST_NAME = "AuthorizeClaimSettlement"


class VowAssuranceError(RuntimeError):
    """Raised when VOW cannot produce verifiable settlement authorization."""


class VowPolicyDenied(VowAssuranceError):
    """Raised when a claim fails the VOW settlement proof gates."""


def _sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def _canonical_sha256(value: Any) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":"), default=str)
    return _sha256_bytes(payload.encode("utf-8"))


@lru_cache(maxsize=1)
def verify_frozen_core() -> dict[str, Any]:
    """Verify every file declared by the frozen release manifest."""
    if not VOW_MANIFEST.is_file() or not VOW_CLI.is_file():
        raise VowAssuranceError(f"Frozen VOW 1.1 core is missing at {VOW_CORE}")

    checked = 0
    for raw_line in VOW_MANIFEST.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        try:
            expected, relative_path = line.split(maxsplit=1)
        except ValueError as exc:
            raise VowAssuranceError("Frozen VOW manifest is malformed") from exc
        relative_path = relative_path.lstrip("*")
        relative_path = relative_path.removeprefix("./")
        candidate = (VOW_CORE / relative_path).resolve()
        try:
            candidate.relative_to(VOW_CORE.resolve())
        except ValueError as exc:
            raise VowAssuranceError("Frozen VOW manifest contains an unsafe path") from exc
        if not candidate.is_file():
            raise VowAssuranceError(f"Frozen VOW file is missing: {relative_path}")
        actual = _sha256_bytes(candidate.read_bytes())
        if actual != expected:
            raise VowAssuranceError(f"Frozen VOW integrity mismatch: {relative_path}")
        checked += 1

    return {
        "status": "VERIFIED",
        "version": VOW_VERSION,
        "files_verified": checked,
        "manifest_sha256": _sha256_bytes(VOW_MANIFEST.read_bytes()),
        "core_path": str(VOW_CORE),
    }


def default_data_dir() -> Path:
    return Path(os.getenv("VOW_ASSURANCE_DIR", Path(__file__).with_name(".data") / "vow")).expanduser().resolve()


def _prepare_paths(data_dir: Path) -> dict[str, Path]:
    paths = {
        "root": data_dir,
        "quests": data_dir / "quests",
        "effects": data_dir / "effects",
        "evidence": data_dir / "evidence",
        "database": data_dir / "vow-assurance.db",
        "seed": data_dir / "signing.seed",
        "public_key": data_dir / "vow-assurance.pubkey",
    }
    for key in ("root", "quests", "effects", "evidence"):
        paths[key].mkdir(parents=True, exist_ok=True)
    return paths


def _signing_seed(paths: dict[str, Path]) -> str:
    configured = os.getenv("VOW_ED25519_KEY")
    if configured:
        seed = configured.strip()
        try:
            decoded = bytes.fromhex(seed)
        except ValueError as exc:
            raise VowAssuranceError("VOW_ED25519_KEY must be hexadecimal") from exc
        if len(decoded) != 32:
            raise VowAssuranceError("VOW_ED25519_KEY must contain a 32-byte seed")
        return seed

    seed_path = paths["seed"]
    if seed_path.exists():
        seed = seed_path.read_text(encoding="utf-8").strip()
        try:
            decoded = bytes.fromhex(seed)
        except ValueError as exc:
            raise VowAssuranceError("Stored VOW signing seed is invalid") from exc
        if len(decoded) != 32:
            raise VowAssuranceError("Stored VOW signing seed is not 32 bytes")
        return seed

    seed = secrets.token_hex(32)
    descriptor = os.open(seed_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
        handle.write(seed + "\n")
    os.chmod(seed_path, 0o600)
    return seed


def _run_cli(arguments: list[str], *, signing_seed: str | None = None, timeout: int = 60) -> tuple[int, dict[str, Any], str]:
    environment = os.environ.copy()
    if signing_seed:
        environment["VOW_ED25519_KEY"] = signing_seed
    completed = subprocess.run(
        [sys.executable, str(VOW_CLI), *arguments],
        cwd=VOW_CORE,
        env=environment,
        text=True,
        capture_output=True,
        timeout=timeout,
        check=False,
    )
    try:
        payload = json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        diagnostic = (completed.stderr or completed.stdout or "no output")[-1200:]
        raise VowAssuranceError(f"VOW returned a non-JSON response: {diagnostic}") from exc
    return completed.returncode, payload, completed.stderr


def _vow_string(value: Any) -> str:
    return json.dumps(str(value), ensure_ascii=False)


def _quest_source(*, claim_id: str, estimate: dict[str, Any], adjuster_name: str, notes: str | None, effect_path: Path, effect_key: str, effect_payload: str) -> str:
    covered_items = sum(1 for item in estimate["line_items"] if item["is_covered"] and float(item["rcv"]) > 0)
    coverage_confirmed = covered_items > 0
    return f'''# Generated integration wrapper. The frozen VOW 1.1 runtime is not modified.
quest {QUEST_NAME} {{
  goal "authorize a reviewed property claim settlement through a controlled effect boundary"
  capability file_write
  believe analysis_complete = true confidence 1.0 source "claim dossier"
  believe coverage_confirmed = {str(coverage_confirmed).lower()} confidence 1.0 source "pricing engine coverage classification"
  believe covered_items = {covered_items} confidence 1.0 source "pricing engine"
  believe gross_rcv = {float(estimate["gross_rcv"])} confidence 1.0 source "pricing engine"
  believe net_acv = {float(estimate["net_acv"])} confidence 1.0 source "pricing engine"
  believe net_payout = {float(estimate["net_payout"])} confidence 1.0 source "pricing engine"
  believe deductible = {float(estimate["deductible"])} confidence 1.0 source "policy intake"
  believe human_approval = true confidence 1.0 source {_vow_string(adjuster_name)}
  prove analysis_complete == true
  prove coverage_confirmed == true
  prove covered_items > 0
  prove gross_rcv > 0
  prove net_payout >= 0
  prove net_payout <= net_acv
  prove deductible >= 0
  prove human_approval == true
  let effect_result = file_write({_vow_string(effect_path)}, {_vow_string(effect_payload)}, key={_vow_string(effect_key)})
  success when analysis_complete == true && coverage_confirmed == true && human_approval == true
}}
'''


def authorize_settlement(*, claim_id: str, estimate: dict[str, Any], adjuster_name: str, notes: str | None, data_dir: str | Path | None = None) -> dict[str, Any]:
    """Run a live VOW proof gate and return a compact, verifiable receipt."""
    integrity = verify_frozen_core()
    paths = _prepare_paths(Path(data_dir).expanduser().resolve() if data_dir else default_data_dir())
    estimate_sha256 = _canonical_sha256(estimate)
    authorization_body = {
        "claim_id": claim_id,
        "decision": "APPROVE",
        "estimate_sha256": estimate_sha256,
        "net_payout": float(estimate["net_payout"]),
        "adjuster": adjuster_name,
        "review_notes_sha256": _sha256_bytes((notes or "").encode("utf-8")),
    }
    authorization_sha256 = _canonical_sha256(authorization_body)
    # A claim has one v1 settlement-authorization slot. Reusing this key with
    # changed arguments is a VOW idempotency conflict, not a second effect.
    effect_key = f"claim-settlement:{claim_id}:v1"
    effect_payload = json.dumps(
        {**authorization_body, "authorization_sha256": authorization_sha256, "status": "AUTHORIZED"},
        sort_keys=True,
        separators=(",", ":"),
    )
    effect_path = paths["effects"] / f"{authorization_sha256}.json"
    quest_path = paths["quests"] / f"{authorization_sha256}.vow"
    quest_path.write_text(
        _quest_source(
            claim_id=claim_id,
            estimate=estimate,
            adjuster_name=adjuster_name,
            notes=notes,
            effect_path=effect_path,
            effect_key=effect_key,
            effect_payload=effect_payload,
        ),
        encoding="utf-8",
    )

    return_code, trace, stderr = _run_cli(
        ["run", str(quest_path), "--quest", QUEST_NAME, "--db", str(paths["database"]), "--live"]
    )
    run_id = trace.get("run_id")
    if return_code != 0 or trace.get("status") != "success" or not run_id:
        message = trace.get("error") or trace.get("status") or stderr[-500:] or "VOW policy gate denied settlement"
        raise VowPolicyDenied(f"VOW settlement authorization failed: {message}")
    if not effect_path.is_file():
        raise VowAssuranceError("VOW reported success without producing the settlement effect receipt")
    observed_effect = json.loads(effect_path.read_text(encoding="utf-8"))
    if observed_effect.get("authorization_sha256") != authorization_sha256:
        raise VowAssuranceError("VOW settlement effect receipt does not match the authorized claim state")

    journal_code, journal, _ = _run_cli(["journal", str(run_id), "--db", str(paths["database"])])
    if journal_code != 0 or not journal.get("chain_intact"):
        raise VowAssuranceError("VOW journal verification failed after settlement authorization")
    effect_results = [event for event in journal.get("events", []) if event.get("kind") == "effect_result"]
    if not effect_results:
        raise VowAssuranceError("VOW journal contains no effect result for settlement authorization")

    evidence_path = paths["evidence"] / f"{run_id}.vow-evidence.json"
    signing_seed = _signing_seed(paths)
    export_code, export, _ = _run_cli(
        ["export-evidence", "--out", str(evidence_path), "--run-id", str(run_id), "--db", str(paths["database"])],
        signing_seed=signing_seed,
    )
    if export_code != 0:
        raise VowAssuranceError("VOW could not export the signed settlement evidence pack")
    public_key = str(export.get("public_key", ""))
    if not public_key:
        raise VowAssuranceError("VOW evidence export did not return a public key")
    if paths["public_key"].exists():
        if paths["public_key"].read_text(encoding="utf-8").strip() != public_key:
            raise VowAssuranceError("VOW evidence signing key changed unexpectedly")
    else:
        paths["public_key"].write_text(public_key + "\n", encoding="utf-8")

    verify_code, verification, _ = _run_cli(
        ["verify-evidence", str(evidence_path), "--pubkey", str(paths["public_key"])]
    )
    if verify_code != 0 or not verification.get("ok"):
        raise VowAssuranceError("VOW signed evidence verification failed")

    effect_event = effect_results[-1]
    effect_event_payload = effect_event.get("payload", {})
    return {
        "status": "VERIFIED",
        "runtime": "VOW",
        "version": VOW_VERSION,
        "quest": QUEST_NAME,
        "run_id": run_id,
        "authorization_sha256": authorization_sha256,
        "estimate_sha256": estimate_sha256,
        "core_manifest_sha256": integrity["manifest_sha256"],
        "files_verified": integrity["files_verified"],
        "journal": {
            "chain_intact": True,
            "event_count": len(journal.get("events", [])),
            "head_hash": journal.get("run", {}).get("head_hash"),
        },
        "effect": {
            "key": effect_key,
            "outcome": effect_event_payload.get("outcome"),
            "idempotent_replay": effect_event_payload.get("outcome") == "idempotent_replay",
        },
        "evidence": {
            "format": "vow-evidence-pack/1",
            "fingerprint": f"sha256:{export['fingerprint']}",
            "key_id": export["key_id"],
            "signature_verified": True,
            "download_url": f"/api/claims/{claim_id}/assurance/evidence",
            "verify_url": f"/api/claims/{claim_id}/assurance/verify",
        },
    }


def evidence_pack_path(assurance: dict[str, Any], *, data_dir: str | Path | None = None) -> Path:
    run_id = str(assurance.get("run_id", ""))
    if not run_id or not all(character in "0123456789abcdef" for character in run_id.lower()):
        raise VowAssuranceError("Claim does not contain a valid VOW run identifier")
    paths = _prepare_paths(Path(data_dir).expanduser().resolve() if data_dir else default_data_dir())
    return paths["evidence"] / f"{run_id}.vow-evidence.json"


def verify_evidence(assurance: dict[str, Any], *, data_dir: str | Path | None = None) -> dict[str, Any]:
    paths = _prepare_paths(Path(data_dir).expanduser().resolve() if data_dir else default_data_dir())
    pack_path = evidence_pack_path(assurance, data_dir=paths["root"])
    if not pack_path.is_file() or not paths["public_key"].is_file():
        raise VowAssuranceError("VOW evidence pack or pinned public key is missing")
    return_code, result, _ = _run_cli(
        ["verify-evidence", str(pack_path), "--pubkey", str(paths["public_key"])]
    )
    if return_code != 0:
        raise VowAssuranceError("VOW evidence verification failed")
    return result


def run_recovery_cycle(*, data_dir: str | Path | None = None, stale_after_seconds: float | None = None) -> dict[str, Any]:
    paths = _prepare_paths(Path(data_dir).expanduser().resolve() if data_dir else default_data_dir())
    if not paths["database"].exists():
        return {"status": "idle", "reason": "VOW assurance database has not been created"}
    arguments = ["sweep", "--crashed", "--db", str(paths["database"])]
    if stale_after_seconds is not None:
        arguments[2:2] = ["--stale-after", str(stale_after_seconds)]
    return_code, result, stderr = _run_cli(arguments, timeout=120)
    if return_code not in (0, 1):
        raise VowAssuranceError(f"VOW recovery cycle failed: {(stderr or str(result))[-500:]}")
    return {"status": "completed" if return_code == 0 else "attention", "result": result}


__all__ = [
    "VowAssuranceError",
    "VowPolicyDenied",
    "authorize_settlement",
    "default_data_dir",
    "evidence_pack_path",
    "run_recovery_cycle",
    "verify_evidence",
    "verify_frozen_core",
]
