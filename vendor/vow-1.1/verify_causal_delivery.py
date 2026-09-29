from __future__ import annotations

import argparse
import hashlib
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "CAUSAL-EFFECTS-MANIFEST.sha256"
EXCLUDED_PARTS = {
    ".git",
    ".pytest_cache",
    ".venv",
    "__pycache__",
    "vow_lang.egg-info",
}
EXCLUDED_NAMES = {
    MANIFEST.name,
    "DELIVERY.md.pubkey",
}


def tracked_files() -> list[Path]:
    files = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(ROOT)
        if any(part in EXCLUDED_PARTS for part in relative.parts):
            continue
        if path.name in EXCLUDED_NAMES or path.suffix in {".pyc", ".db"}:
            continue
        files.append(relative)
    return sorted(files, key=lambda item: item.as_posix())


def digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            value.update(block)
    return value.hexdigest()


def write_manifest() -> None:
    lines = [
        f"{digest(ROOT / relative)}  {relative.as_posix()}"
        for relative in tracked_files()
    ]
    MANIFEST.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {MANIFEST.name} with {len(lines)} files")


def verify_manifest() -> None:
    if not MANIFEST.is_file():
        raise SystemExit(f"missing {MANIFEST.name}")
    expected = {}
    for line_number, line in enumerate(MANIFEST.read_text().splitlines(), 1):
        try:
            checksum, name = line.split("  ", 1)
        except ValueError as exc:
            raise SystemExit(f"malformed manifest line {line_number}") from exc
        if len(checksum) != 64 or name in expected:
            raise SystemExit(f"invalid manifest entry on line {line_number}")
        expected[name] = checksum
    actual_names = {path.as_posix() for path in tracked_files()}
    if set(expected) != actual_names:
        missing = sorted(set(expected) - actual_names)
        unexpected = sorted(actual_names - set(expected))
        raise SystemExit(
            f"manifest membership mismatch; missing={missing}, unexpected={unexpected}"
        )
    failures = []
    for name, checksum in expected.items():
        actual = digest(ROOT / name)
        if actual != checksum:
            failures.append((name, checksum, actual))
    if failures:
        for name, expected_hash, actual_hash in failures:
            print(f"FAIL {name}: expected {expected_hash}, got {actual_hash}")
        raise SystemExit(1)
    print(f"PASS: {len(expected)} files match {MANIFEST.name}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    if args.write:
        write_manifest()
    else:
        verify_manifest()
    return 0


if __name__ == "__main__":
    sys.exit(main())
