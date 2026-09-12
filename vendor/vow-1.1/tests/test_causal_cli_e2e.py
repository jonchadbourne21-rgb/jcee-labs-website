from __future__ import annotations

import json
import os
from pathlib import Path
import shlex
import sqlite3
import subprocess
import sys


PROJECT = Path(__file__).resolve().parents[1]
ADAPTER = PROJECT / "examples" / "causal_outbox_adapter.py"


def run_cli(*args: str, env=None):
    merged = dict(os.environ)
    merged.pop("VOW_KILL_AFTER", None)
    if env:
        merged.update(env)
    return subprocess.run(
        [sys.executable, "vow_cli.py", *args],
        cwd=PROJECT,
        env=merged,
        capture_output=True,
        text=True,
    )


def write_quest(path: Path, provider_db: Path, key: str):
    command = shlex.join([
        sys.executable,
        str(ADAPTER),
        "send",
        "--db",
        str(provider_db),
        "--key",
        key,
        "--payload",
        "one-message",
    ])
    escaped = command.replace("\\", "\\\\").replace('"', '\\"')
    path.write_text(
        "quest CausalOutbox {\n"
        "  goal \"deliver one causally guarded effect\"\n"
        "  capability shell\n"
        f"  let result = shell_exec(\"{escaped}\", key=\"{key}\")\n"
        "  prove true\n"
        "  success when true\n"
        "}\n",
        encoding="utf-8",
    )


def provider_count(path: Path, key: str) -> int:
    with sqlite3.connect(path) as connection:
        return connection.execute(
            "SELECT COUNT(*) FROM effects WHERE effect_key = ?", (key,)
        ).fetchone()[0]


def run_crash_case(base: Path, name: str):
    key = f"causal-{name}"
    quest = base / f"{name}.vow"
    provider = base / f"{name}-provider.db"
    journal = base / f"{name}-vow.db"
    write_quest(quest, provider, key)
    adapter = f"{ADAPTER}:reconcile"
    killed = run_cli(
        "run", str(quest), "--db", str(journal), "--live",
        "--effect-adapter", adapter,
        env={"VOW_KILL_AFTER": "2"},
    )
    assert killed.returncode == 9
    assert provider_count(provider, key) == 1
    with sqlite3.connect(journal) as connection:
        run_id = connection.execute("SELECT run_id FROM runs").fetchone()[0]
    return quest, provider, journal, key, run_id, adapter


def assert_causal_close(journal: Path, run_id: str):
    output = json.loads(
        run_cli("journal", run_id, "--db", str(journal)).stdout
    )
    assert output["chain_intact"] is True
    decisions = [
        event["payload"] for event in output["events"]
        if event["kind"] == "effect_recovery_decision"
    ]
    assert len(decisions) == 1
    assert decisions[0]["decision"] == "noop"
    assert decisions[0]["causal_gate"]["verdict"] == "do_not_retry"
    assert len(decisions[0]["causal_gate"]["receipt"]["contract_sha256"]) == 64


def test_manual_resume_closes_causal_crash_window(tmp_path: Path):
    quest, provider, journal, key, run_id, adapter = run_crash_case(
        tmp_path, "manual"
    )
    resumed = run_cli(
        "run", str(quest), "--db", str(journal), "--live", "--resume", run_id,
        "--effect-adapter", adapter,
    )
    assert resumed.returncode == 0, resumed.stdout + resumed.stderr
    assert provider_count(provider, key) == 1
    assert json.loads(resumed.stdout)["status"] == "success"
    assert_causal_close(journal, run_id)


def test_sweep_forwards_adapter_and_closes_causal_crash_window(tmp_path: Path):
    _quest, provider, journal, key, run_id, adapter = run_crash_case(
        tmp_path, "sweep"
    )
    with sqlite3.connect(journal) as connection:
        connection.execute(
            "UPDATE runs SET status = 'crashed', claimed_by = NULL, claimed_at = NULL "
            "WHERE run_id = ?",
            (run_id,),
        )
        connection.commit()
    swept = run_cli(
        "sweep", "--db", str(journal), "--effect-adapter", adapter,
    )
    assert swept.returncode == 0, swept.stdout + swept.stderr
    summary = json.loads(swept.stdout)
    assert summary["counts"]["resumed"] == 1
    assert provider_count(provider, key) == 1
    assert_causal_close(journal, run_id)
