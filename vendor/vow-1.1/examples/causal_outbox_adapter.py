"""Reference authority adapter with VOW causal-effect receipts.

This is a local SQLite demonstration, not a production provider adapter. The
`send` command deliberately creates a new row on every invocation so the
crash-window test can detect a duplicate physically.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import shlex
import sqlite3
import sys
import time


PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT))

from vow.effect_adapter_sdk import (  # noqa: E402
    AuthorityObservation,
    CausalEffectContract,
    CausalEffectReceipt,
    CausalMode,
    CausalRetryContext,
    EffectContract,
    EvidenceStatus,
    RecoveryEvidence,
)


VOW_EFFECT_ADAPTER_MANIFEST = {
    "name": "jcee.reference_causal_outbox",
    "version": "1.1.0",
    "provider": "JCEE Labs local causal outbox",
    "protocol_version": "1.0",
    "operations": ["shell:shell_exec:causal_outbox_send"],
}


def _connect(path: str) -> sqlite3.Connection:
    connection = sqlite3.connect(path)
    connection.execute(
        "CREATE TABLE IF NOT EXISTS effects ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT, effect_key TEXT NOT NULL, "
        "payload TEXT NOT NULL, created_at REAL NOT NULL)"
    )
    connection.commit()
    return connection


def send(db_path: str, key: str, payload: str) -> dict:
    with _connect(db_path) as connection:
        connection.execute(
            "INSERT INTO effects(effect_key, payload, created_at) VALUES (?, ?, ?)",
            (key, payload, time.time()),
        )
        connection.commit()
    return {"effect_key": key, "delivered": payload}


def _option(tokens: list[str], name: str) -> str:
    try:
        return tokens[tokens.index(name) + 1]
    except (ValueError, IndexError) as exc:
        raise ValueError(f"causal outbox command missing {name}") from exc


def reconcile(*, capability: str, action: str, args: list[str], key: str,
              probes_used: int) -> AuthorityObservation:
    if capability != "shell" or action != "shell_exec" or len(args) != 1:
        raise ValueError("adapter only recognizes its shell_exec envelope")
    tokens = shlex.split(args[0])
    db_path = _option(tokens, "--db")
    command_key = _option(tokens, "--key")
    if command_key != key:
        raise ValueError("VOW key and authority key disagree")
    with _connect(db_path) as connection:
        row = connection.execute(
            "SELECT payload, created_at FROM effects WHERE effect_key = ? "
            "ORDER BY id LIMIT 1",
            (key,),
        ).fetchone()

    territory = f"outbox-delivery:{key}"
    receipts = ()
    if row is None:
        status = EvidenceStatus.ABSENT
        result = None
        age = 0
    else:
        status = EvidenceStatus.DELIVERED
        result = {"effect_key": key, "delivered": row[0]}
        age = max(0, int(time.time() - float(row[1])))
        receipts = (CausalEffectReceipt(
            receipt_id=f"provider-delivery:{key}",
            effect_id=key,
            sequence=1,
            kind="reserve",
            territories=(territory,),
            evidence_ref=f"sqlite:effects:{key}",
        ),)

    causal_context = CausalRetryContext(
        contract=CausalEffectContract(
            modes=(CausalMode("current"),),
            initial_modes=("current",),
        ),
        effect_id=key,
        receipts=receipts,
        proposal=(territory,),
    )
    return AuthorityObservation(
        contract=EffectContract(
            authoritative_lookup=True,
            dedupe_window_seconds=3600,
            same_key_deduplicated=False,
            recipient_retry_supported=False,
            max_status_probes=2,
        ),
        evidence=RecoveryEvidence(
            status=status,
            request_age_seconds=age,
            probes_used=probes_used,
            result=result,
        ),
        causal_context=causal_context,
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    sender = subparsers.add_parser("send")
    sender.add_argument("--db", required=True)
    sender.add_argument("--key", required=True)
    sender.add_argument("--payload", required=True)
    args = parser.parse_args()
    print(json.dumps(send(args.db, args.key, args.payload), sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
