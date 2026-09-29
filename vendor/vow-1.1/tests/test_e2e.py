# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""End-to-end tests for the VOW language.

Runs the canonical examples/tournament_mixed.vow quest through the full
pipeline -- parse -> transpile -> exec -> quest invocation -- and through the
fixed orchestration layer in main.py (VowEngineManager), asserting a success
status in both dry-run and live modes.

Runnable with plain `python -m pytest` or `python -m unittest`.
"""

import asyncio
import os
import sys
import unittest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    # Package layout: project/vow/*.py
    from vow.vow_parser import VowAdvancedParser
    from vow.vow_transpiler import VowTranspiler
except ImportError:
    # Flat layout fallback (same shim policy as main.py).
    from vow_parser import VowAdvancedParser
    from vow_transpiler import VowTranspiler

import main as vow_main  # fixed orchestration layer (VowEngineManager)

EXAMPLE_PATH = os.path.join(PROJECT_ROOT, "examples", "tournament_mixed.vow")


def load_example_source():
    with open(EXAMPLE_PATH, "r", encoding="utf-8") as handle:
        return handle.read()


class TestDirectPipeline(unittest.TestCase):
    """parse -> transpile -> compile -> exec -> call quest_TournamentMixed."""

    def test_tournament_mixed_parse_transpile_exec_success(self):
        source = load_example_source()

        # 1. Parse
        program = VowAdvancedParser(source).parse_program()
        quest_names = [quest.name for quest in program.quests]
        self.assertIn("TournamentMixed", quest_names)

        # 2. Transpile to Shadow Python (with runtime preamble)
        shadow_python = VowTranspiler(include_preamble=True).transpile(program)
        self.assertIsInstance(shadow_python, str)
        compile(shadow_python, "<tournament_mixed>", "exec")  # valid Python

        # 3. Execute the transpiled module code
        namespace = {}
        exec(shadow_python, namespace)
        self.assertIn("TournamentMixed", namespace.get("QUESTS", []))
        quest_fn = namespace.get("quest_TournamentMixed")
        self.assertTrue(callable(quest_fn), "quest_TournamentMixed missing")

        # 4. Run the quest: safe_and_correct wins, success condition holds
        result = quest_fn()
        self.assertIsInstance(result, dict)
        self.assertTrue(result.get("success"))


class TestOrchestrationEndToEnd(unittest.TestCase):
    """Full stack through main.py's VowEngineManager (the consumer contract)."""

    def run_quest(self, dry_run):
        database = vow_main.MockDatabase()
        manager = vow_main.VowEngineManager(database)
        trace = asyncio.run(
            manager.execute_vow_quest(
                load_example_source(), "TournamentMixed", dry_run=dry_run
            )
        )
        return trace, database

    def test_dry_run_status_success(self):
        trace, _database = self.run_quest(dry_run=True)
        self.assertEqual(trace.get("status"), "success")
        self.assertIn("run_id", trace)
        self.assertEqual(trace.get("quest_name"), "TournamentMixed")

    def test_live_status_success(self):
        trace, _database = self.run_quest(dry_run=False)
        self.assertEqual(trace.get("status"), "success")
        self.assertIn("run_id", trace)

    def test_trace_is_json_serializable(self):
        trace, _database = self.run_quest(dry_run=True)
        import json

        encoded = json.dumps(trace)
        self.assertIn('"status": "success"', encoded)


if __name__ == "__main__":
    unittest.main()
