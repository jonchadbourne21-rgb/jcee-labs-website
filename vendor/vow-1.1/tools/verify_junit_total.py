#!/usr/bin/env python3
"""Fail CI unless a JUnit report contains the expected clean test total."""

from __future__ import annotations

import argparse
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def _as_int(node: ET.Element, name: str) -> int:
    return int(node.attrib.get(name, "0"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("report", type=Path)
    parser.add_argument("--expected", type=int, required=True)
    args = parser.parse_args()

    root = ET.parse(args.report).getroot()
    suites = [root] if root.tag == "testsuite" else list(root.findall("testsuite"))
    totals = {
        key: sum(_as_int(suite, key) for suite in suites)
        for key in ("tests", "failures", "errors", "skipped")
    }
    passed = totals["tests"] - totals["failures"] - totals["errors"] - totals["skipped"]

    clean = (
        totals["tests"] == args.expected
        and totals["failures"] == 0
        and totals["errors"] == 0
        and totals["skipped"] == 0
    )
    print(
        f"JUnit gate: {totals['tests']} collected, {passed} passed, "
        f"{totals['skipped']} skipped, "
        f"{totals['failures'] + totals['errors']} failed"
    )
    if not clean:
        print(
            f"ERROR: expected exactly {args.expected} passing tests with no skips or failures",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
