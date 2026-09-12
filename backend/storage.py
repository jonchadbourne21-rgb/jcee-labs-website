"""Small, process-safe JSON persistence layer for claim dossiers."""
from __future__ import annotations

import copy
import json
import os
import threading
import uuid
from collections.abc import Callable
from pathlib import Path
from typing import Any, TypeVar

T = TypeVar("T")


class ClaimsRepository:
    """Persist claims in one JSON document using a lock and atomic replacement.

    The lock protects all read-modify-write operations in this process.  A
    temporary file is flushed and fsynced before ``os.replace``, so readers see
    either the prior complete JSON document or the next complete document.
    This repository is intentionally not a multi-process database.
    """

    def __init__(self, data_file: str | Path) -> None:
        self.path = Path(data_file).expanduser().resolve()
        self._lock = threading.RLock()
        self._claims: dict[str, dict[str, Any]] = {}
        with self._lock:
            self._load_unlocked()

    def _load_unlocked(self) -> None:
        if not self.path.exists():
            self._claims = {}
            return
        try:
            with self.path.open("r", encoding="utf-8") as handle:
                document = json.load(handle)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"Claims data file is not valid JSON: {self.path}") from exc
        except OSError as exc:
            raise RuntimeError(f"Unable to read claims data file: {self.path}") from exc

        if not isinstance(document, dict) or not isinstance(document.get("claims", {}), dict):
            raise RuntimeError(f"Claims data file has an invalid document shape: {self.path}")
        self._claims = document.get("claims", {})

    def _write_unlocked(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary_path = self.path.with_name(f".{self.path.name}.{uuid.uuid4().hex}.tmp")
        document = {"version": 1, "claims": self._claims}
        try:
            with temporary_path.open("x", encoding="utf-8") as handle:
                json.dump(document, handle, indent=2, sort_keys=True, ensure_ascii=False)
                handle.write("\n")
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary_path, self.path)
            # Best-effort directory fsync makes the rename durable on POSIX.
            try:
                directory_fd = os.open(self.path.parent, os.O_RDONLY)
                try:
                    os.fsync(directory_fd)
                finally:
                    os.close(directory_fd)
            except OSError:
                pass
        finally:
            if temporary_path.exists():
                temporary_path.unlink(missing_ok=True)

    def create(self, claim: dict[str, Any]) -> dict[str, Any]:
        claim_id = claim["claim_id"]
        with self._lock:
            if claim_id in self._claims:
                raise KeyError(claim_id)
            self._claims[claim_id] = copy.deepcopy(claim)
            self._write_unlocked()
            return copy.deepcopy(self._claims[claim_id])

    def get(self, claim_id: str) -> dict[str, Any] | None:
        with self._lock:
            claim = self._claims.get(claim_id)
            return copy.deepcopy(claim) if claim is not None else None

    def mutate(self, claim_id: str, mutator: Callable[[dict[str, Any]], T]) -> T | None:
        """Run a mutation atomically; return ``None`` only when the claim is absent."""
        with self._lock:
            current = self._claims.get(claim_id)
            if current is None:
                return None
            working = copy.deepcopy(current)
            result = mutator(working)
            self._claims[claim_id] = working
            self._write_unlocked()
            return copy.deepcopy(result)

    def replace(self, claim: dict[str, Any]) -> dict[str, Any]:
        """Upsert a complete claim document, primarily for deterministic demos."""
        claim_id = claim["claim_id"]
        with self._lock:
            self._claims[claim_id] = copy.deepcopy(claim)
            self._write_unlocked()
            return copy.deepcopy(self._claims[claim_id])

    def count(self) -> int:
        with self._lock:
            return len(self._claims)
