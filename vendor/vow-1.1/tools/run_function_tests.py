#!/usr/bin/env python3
"""Run VOW's top-level function tests when pytest is unavailable.

The suite uses only one pytest-style fixture, ``tmp_path``. Module-level
setup/teardown hooks are honored so this runner has the same isolation law as
pytest for the supported test surface. Environmental PostgreSQL gaps are
reported as skips, never passes.
"""

from __future__ import annotations

import importlib.util
import inspect
from pathlib import Path
import sys
import tempfile
import traceback
import unittest


ROOT = Path(__file__).resolve().parents[1]
TESTS = ROOT / "tests"
sys.path.insert(0, str(ROOT))


def main() -> int:
    collected = []
    import_failures = []

    for path in sorted(TESTS.glob("test_*.py")):
        module_name = "vow_function_test_" + path.stem
        spec = importlib.util.spec_from_file_location(module_name, path)
        if spec is None or spec.loader is None:
            import_failures.append((str(path), "unable to create module spec"))
            continue
        module = importlib.util.module_from_spec(spec)
        try:
            spec.loader.exec_module(module)
        except BaseException:
            import_failures.append((str(path), traceback.format_exc()))
            continue

        for function_name, function in sorted(vars(module).items()):
            if (
                function_name.startswith("test_")
                and inspect.isfunction(function)
                and function.__module__ == module.__name__
            ):
                collected.append((path, module, function_name, function))

    print(f"COLLECTED FUNCTION TESTS: {len(collected)}")
    print(f"IMPORT FAILURES: {len(import_failures)}")

    passed = 0
    failed = []
    skipped = []

    for path, module, function_name, function in collected:
        parameters = list(inspect.signature(function).parameters)
        setup = getattr(module, "setup_function", None)
        teardown = getattr(module, "teardown_function", None)
        try:
            if setup:
                setup(function)
            if parameters == []:
                function()
            elif parameters == ["tmp_path"]:
                with tempfile.TemporaryDirectory(prefix="vow-test-") as directory:
                    function(Path(directory))
            else:
                raise RuntimeError(f"unsupported fixtures: {parameters!r}")
        except unittest.SkipTest as error:
            skipped.append((str(path), function_name, str(error)))
        except BaseException:
            failed.append((str(path), function_name, traceback.format_exc()))
        else:
            passed += 1
        finally:
            if teardown:
                try:
                    teardown(function)
                except BaseException:
                    failed.append(
                        (
                            str(path),
                            function_name + "::<teardown>",
                            traceback.format_exc(),
                        )
                    )

    print(
        f"FUNCTION TEST RESULT: {passed} passed, "
        f"{len(skipped)} skipped, {len(failed)} failed"
    )
    for path, function_name, reason in skipped:
        print(f"SKIP {path}::{function_name}: {reason}")
    for path, function_name, details in failed:
        print(f"FAIL {path}::{function_name}\n{details}")
    for path, details in import_failures:
        print(f"IMPORT FAIL {path}\n{details}")

    return 1 if failed or import_failures else 0


if __name__ == "__main__":
    raise SystemExit(main())

