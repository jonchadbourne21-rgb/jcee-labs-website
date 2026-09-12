# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os
import sys
import json
import asyncio
import importlib.util
import contextvars
import time
from typing import Dict, Any, Optional, List

# Make the VOW ecosystem importable. Preferred layout: the `vow` package in
# this project directory (vow/vow_parser.py, vow/vow_transpiler.py). Legacy
# layout: flat modules (vow_parser.py, vow_transpiler.py) either next to this
# file or inside the old consolidated ecosystem path. Every path tweak is
# best-effort: a missing directory is skipped, never fatal.
try:
    _project_dir = os.path.dirname(os.path.abspath(__file__))
    _candidate_paths = [
        _project_dir,  # local project dir: enables `from vow.vow_parser import ...`
        os.path.abspath(os.path.join(
            _project_dir, '..', '..', 'vow_consolidated',
            'vow_manus_package', 'vow_ecosystem', 'src')),  # legacy flat layout
    ]
    for _candidate in _candidate_paths:
        if os.path.isdir(_candidate) and _candidate not in sys.path:
            sys.path.insert(0, _candidate)
except Exception:
    # sys.path manipulation must never take the engine down; the imports
    # below may still resolve through the ambient Python path.
    pass

try:
    # Package layout (project/vow/*.py).
    from vow.vow_parser import VowAdvancedParser
    from vow.vow_transpiler import (VowTranspiler, SHADOW_RUNTIME_PREAMBLE, VowScarMemory, VowCapability, VowProofFailure, VowSideEffectRecorder, VowSuccessLog, vow_set_dry_run, verify_shadow_signature, VowSecurityError, VowSuspend)
    from vow.self_learning_system import SelfLearningSystem
    from vow.scar_injection_validator import ScarInjectionValidator
    from vow.llm_strategy_optimizer import LLMStrategyOptimizer
    from vow.rate_limiter import RateLimiter
except ImportError:
    # Flat layout fallback (vow_parser.py / vow_transpiler.py on sys.path).
    from vow_parser import VowAdvancedParser
    from vow_transpiler import (VowTranspiler, SHADOW_RUNTIME_PREAMBLE, VowScarMemory, VowCapability, VowProofFailure, VowSideEffectRecorder, VowSuccessLog, vow_set_dry_run, verify_shadow_signature, VowSecurityError, VowSuspend)
    from self_learning_system import SelfLearningSystem
    from scar_injection_validator import ScarInjectionValidator
    from llm_strategy_optimizer import LLMStrategyOptimizer
    from rate_limiter import RateLimiter

# --- Database Simulation (Replace with actual DB connection) ---
# In a real application, this would be a proper ORM/ODM connection
# to PostgreSQL or MongoDB, storing scars, traces, and other app data.
class MockDatabase:
    def __init__(self):
        self.scars = []
        self.traces = {}

    async def save_scar(self, scar_data: Dict[str, Any]):
        print(f"[DB] Saving scar: {scar_data['message']}")
        self.scars.append(scar_data)

    async def get_scars(self, quest_name: str) -> List[Dict[str, Any]]:
        print(f"[DB] Recalling scars for {quest_name}")
        return [s for s in self.scars if s.get('quest_name') == quest_name]

    async def save_trace(self, run_id: str, trace_data: Dict[str, Any]):
        print(f"[DB] Saving trace for run_id: {run_id}")
        self.traces[run_id] = trace_data

    async def get_trace(self, run_id: str) -> Optional[Dict[str, Any]]:
        print(f"[DB] Retrieving trace for run_id: {run_id}")
        return self.traces.get(run_id)

mock_db = MockDatabase()

# --- Concurrency-safe scar routing (contextvars) ----------------------------
# Patch VowScarMemory exactly ONCE at module load; the patched functions read
# the active db client and quest name from contextvars, so concurrent quests
# (asyncio tasks each get their own context copy) never cross-talk — unlike
# the old per-run monkey-patch/restore approach (flagged in the Reconciled
# architecture doc §3). record/recall stay SYNCHRONOUS so a quest recalling
# its own scars mid-run sees them immediately (handoff landmine fix).
_current_db: contextvars.ContextVar = contextvars.ContextVar("vow_current_db", default=None)
_current_quest: contextvars.ContextVar = contextvars.ContextVar("vow_current_quest", default=None)
# durability (Arc 3A): the active JournalRuntime for this quest's context —
# None when the run is unjournaled (in-memory backend or --no-journal).
_current_journal: contextvars.ContextVar = contextvars.ContextVar("vow_current_journal", default=None)

def _journal_mem_payload(store, data):
    """Canonical mem_write payload (single source: vow.database)."""
    try:
        from vow.database import mem_write_payload
    except ImportError:
        from database import mem_write_payload
    return mem_write_payload(store, data)

_original_scar_record = VowScarMemory.record  # bound classmethod
_original_scar_recall = VowScarMemory.recall  # bound classmethod

def _contextual_scar_record(message, context=None):
    db = _current_db.get()
    if db is None:
        return _original_scar_record(message, context)
    scar = {'quest_name': _current_quest.get(), 'message': message,
            'context': context, 'timestamp': time.time()}
    _j = _current_journal.get()
    if _j is not None and hasattr(db, 'record_scar_sync'):
        # durability replay: the original row is already in the DB —
        # suppress; the cursor consumes the matching mem_write event.
        if _j.mem_write_decision(_journal_mem_payload('scar', scar)):
            return scar
    if hasattr(db, 'record_scar_sync'):
        # durable backend (SqliteDatabase): synchronous, immediately visible
        return db.record_scar_sync(scar)
    print(f"[DB] Saving scar: {scar['message']}")
    db.scars.append(scar)
    return scar

def _contextual_scar_recall(target=None):
    db = _current_db.get()
    if db is None:
        return _original_scar_recall(target)
    _j = _current_journal.get()
    if hasattr(db, 'recall_scars_sync'):
        if _j is not None:
            # durability: journaled read — replay returns the recorded rows
            # verbatim, so the resume is insulated from any DB change.
            mine = _j.mem_recall(
                {'store': 'scar', 'scope': 'quest',
                 'quest': _current_quest.get()},
                lambda: db.recall_scars_sync(_current_quest.get()))
        else:
            mine = db.recall_scars_sync(_current_quest.get())
    else:
        mine = [s for s in db.scars if s.get('quest_name') == _current_quest.get()]
    if target is None:
        return list(mine)
    return [x for x in mine
            if target in str(x.get('message', '')) or target in str(x.get('context', ''))]

def _contextual_scar_recall_all():
    """Every scar across ALL quests. Tournament avoidance uses this:
    exact-match skipping stays quest-scoped via the scar context, but
    similar-path caution must see scars left by other quests."""
    db = _current_db.get()
    if db is None:
        return _original_scar_recall()
    _j = _current_journal.get()
    if hasattr(db, 'recall_all_scars_sync'):
        if _j is not None:
            return _j.mem_recall({'store': 'scar', 'scope': 'all'},
                                 lambda: db.recall_all_scars_sync())
        return db.recall_all_scars_sync()
    return list(db.scars)

VowScarMemory.record = staticmethod(_contextual_scar_record)
VowScarMemory.recall = staticmethod(_contextual_scar_recall)
VowScarMemory.recall_all = staticmethod(_contextual_scar_recall_all)

# --- Success snapshots (same contextvars pattern as scars) -----------------
# Successful strategy runs are persisted so diff_vs_success counterfactuals
# ("last time it worked, batch_size was 450") survive process restarts.
_original_success_record = VowSuccessLog.record  # bound classmethod
_original_success_recall = VowSuccessLog.recall  # bound classmethod

def _contextual_success_record(entry):
    db = _current_db.get()
    if db is None or not hasattr(db, 'record_success_sync'):
        return _original_success_record(entry)
    _j = _current_journal.get()
    if _j is not None:
        if _j.mem_write_decision(_journal_mem_payload('success', entry)):
            return entry  # replayed: suppressed (original row persists)
    return db.record_success_sync(entry)

def _contextual_success_recall(quest=None, strategy=None):
    db = _current_db.get()
    if db is None or not hasattr(db, 'recall_success_sync'):
        return _original_success_recall(quest, strategy)
    _j = _current_journal.get()
    if _j is not None:
        return _j.mem_recall(
            {'store': 'success', 'quest': quest or _current_quest.get(),
             'strategy': strategy},
            lambda: db.recall_success_sync(quest or _current_quest.get(),
                                           strategy))
    return db.recall_success_sync(quest or _current_quest.get(), strategy)

VowSuccessLog.record = staticmethod(_contextual_success_record)
VowSuccessLog.recall = staticmethod(_contextual_success_recall)

# --- Defense-in-depth exec sandbox ----------------------------------------
# The HMAC signature is the real trust boundary; this restricted builtins
# set limits what even signed Shadow Python can accidentally do. Gated
# file/shell/network actions stay available through _vow_gated (they need
# open()/subprocess/urllib internally).
import builtins as _py_builtins

_VOW_ALLOWED_IMPORTS = {'time', 'json', 'hashlib', 'math', 'urllib.request',
                        'subprocess', 'datetime', 're', 'ast'}  # ast: scar autopsies

def _vow_sandbox_builtins():
    def _guarded_import(name, *args, **kwargs):
        top = name
        if top not in _VOW_ALLOWED_IMPORTS:
            raise ImportError(f'import of {name!r} not allowed in VOW sandbox')
        return _py_builtins.__import__(name, *args, **kwargs)
    denied = {'eval', 'exec', 'compile', 'input', 'breakpoint',
              'exit', 'quit'}
    safe = {k: v for k, v in vars(_py_builtins).items()
            if not k.startswith('_') and k not in denied}
    safe['__import__'] = _guarded_import
    safe['__build_class__'] = _py_builtins.__build_class__
    safe['__name__'] = 'vow_sandbox'
    return safe

# --- VOW Engine Manager (Orchestration Layer) ---
class VowEngineManager:
    def __init__(self, database: MockDatabase, scar_ttl: float = None,
                 llm=None, rate_limits=None, run_id=None, journal=None):
        # scar_ttl: seconds after which an exact scar decays from
        # 'skip' to 'cautionary retry' (None = never decays)
        # llm: optional callable(prompt: str) -> str — powers model_ask in
        # live mode and the LLM Strategy Optimizer's refinement path.
        # rate_limits: {capability: {'rate': per_sec, 'burst': n}} — the
        # capability-layer Rate Limiter (Reconciled §2); None = unlimited.
        # run_id/journal: durability (Arc 3A) — a pre-assigned run id and
        # the JournalRuntime for this run; None = unjournaled (old behavior).
        self._scar_ttl = scar_ttl
        self._llm = llm
        self._rate_limiter = RateLimiter(rate_limits) if rate_limits else None
        self._run_id = run_id
        self._journal = journal
        self.database = database
        # Self-learning loop: pattern analysis + adaptive strategy selection
        # over every quest this engine runs (Reconciled Architecture §5).
        self.learning = SelfLearningSystem()
        # Exec trust boundary: ephemeral per-engine HMAC key. The transpiler
        # signs every generated Shadow Python; exec refuses unsigned/tampered
        # source (VowSecurityError).
        self._signing_key = os.urandom(32)

    async def execute_vow_quest(self, vow_source_code: str, quest_name: str, dry_run: bool = True) -> Dict[str, Any]:
        print(f"[VowEngineManager] Executing quest \033[33m{quest_name}\033[0m (dry_run={dry_run})")

        # 1. Parse VOW source code
        parser = VowAdvancedParser(vow_source_code)
        ast = parser.parse_program()

        # 1b. Scar Injection Validator (Reconciled §5): @learn quests must
        # author scar statements. Reported as trace evidence; the runtime
        # auto-record guarantees the raw failure record either way.
        injection_report = ScarInjectionValidator().validate_program(ast)

        # 2. Transpile AST to Shadow Python (signed with this engine's key)
        transpiler = VowTranspiler(include_preamble=True,
                                   signing_key=self._signing_key)
        shadow_python_code = transpiler.transpile(ast)

        # 2b. Enforce the exec trust boundary: only transpiler-signed code
        # may reach exec(). Tampered or hand-written source is refused.
        verify_shadow_signature(shadow_python_code, self._signing_key)

        # 3. Prepare execution environment
        # Create a unique module name to avoid conflicts if multiple quests are run
        module_name = f"vow_quest_runtime_{quest_name}_{os.urandom(4).hex()}"
        spec = importlib.util.spec_from_loader(module_name, loader=None)
        vow_module = importlib.util.module_from_spec(spec)

        # Inject necessary VOW runtime components into the module's global scope
        # This includes the preamble, VowScarMemory, VowCapability, etc.
        # Also inject the database for scar persistence
        exec_globals = vow_module.__dict__
        exec_globals['VowScarMemory'] = VowScarMemory
        exec_globals['VowSuccessLog'] = VowSuccessLog
        if self._scar_ttl is not None:
            exec_globals['_VOW_SCAR_TTL'] = self._scar_ttl
        # NOTE: VowCapability is deliberately NOT injected. The preamble's
        # fallback defines it inside the per-run namespace, where VOW_DRY_RUN
        # is set for THIS run — the module-level class reads the module
        # global (always True), which made live mode silently dry. (Bug found
        # by the rate-limiter live test, Phase 3.)
        exec_globals['VowProofFailure'] = VowProofFailure
        exec_globals['VowSuspend'] = VowSuspend
        exec_globals['VowSideEffectRecorder'] = VowSideEffectRecorder
        exec_globals['vow_set_dry_run'] = vow_set_dry_run
        exec_globals['VOW_DRY_RUN'] = dry_run # Set initial dry-run state
        exec_globals['asyncio'] = asyncio # For async capabilities
        exec_globals['db_client'] = self.database # Inject database client
        if self._llm is not None:
            exec_globals['_vow_model_handler'] = self._llm
        if self._rate_limiter is not None:
            exec_globals['_VOW_RATE_LIMITER'] = self._rate_limiter
        if self._journal is not None:
            exec_globals['_vow_journal'] = self._journal
        exec_globals['__builtins__'] = _vow_sandbox_builtins()

        # Route scars for THIS quest through the contextvars-patched memory
        _tok_db = _current_db.set(self.database)
        _tok_quest = _current_quest.set(quest_name)
        _tok_jr = _current_journal.set(self._journal)

        # 4. Execute the Shadow Python code
        try:
            # Execute the transpiled code within the isolated module
            exec(shadow_python_code, exec_globals)

            # Find and call the main quest function
            quest_func = exec_globals.get(f'quest_{quest_name}')
            if not quest_func:
                raise ValueError(f"Quest function 'quest_{quest_name}' not found in transpiled code.")

            # Run the quest function
            result = quest_func()

            # Flush pending async scar/trace writes scheduled during execution
            # (record/recall are monkeypatched to fire-and-forget create_task;
            # yield to the event loop so they land before we read them back).
            await asyncio.sleep(0)

            # Capture trace and scars (VowScarMemory and VowSideEffectRecorder are class-level)
            trace_data = {
                "quest_name": quest_name,
                # F-D6 cure (v18 differential, 2026-07-23): was "success"
                # unconditionally ("Simplified status") — a quest that
                # failed its own success-when still reported success, the
                # same euphemism species as HPQR's H3. The trace now says
                # what the QUEST says: final_result['success'] is the truth.
                "status": "success" if (isinstance(result, dict) and result.get("success")) else "failed",
                "final_result": str(result), # Capture the final result if any
                "scars_recorded": [s for s in VowScarMemory.all()],
                "side_effects_recorded": [e for e in VowSideEffectRecorder.all()]
            }
            VowSideEffectRecorder.clear() # Clear for next run
            # Integrity tripwire: a failed strategy in an @learn quest MUST
            # have left a scar in the DURABLE record. Read the database
            # directly — trace_data['scars_recorded'] only reflects the
            # in-process list, which engine routing intentionally bypasses.
            if hasattr(self.database, 'recall_scars_sync'):
                _durable_scars = self.database.recall_scars_sync(quest_name)
            else:
                _durable_scars = [x for x in getattr(self.database, 'scars', [])
                                  if x.get('quest_name') == quest_name]
            ScarInjectionValidator().validate_trace(
                {'final_result': result,
                 'scars_recorded': _durable_scars})

        except VowProofFailure as e:
            trace_data = {
                "quest_name": quest_name,
                "status": "failed_proof",
                "error": str(e),
                "scars_recorded": [s for s in VowScarMemory.all()],
                "side_effects_recorded": [e for e in VowSideEffectRecorder.all()]
            }
            VowSideEffectRecorder.clear() # Clear for next run
        except VowSuspend:
            raise  # a parked run is not an error — the CLI owns suspension
        except Exception as e:
            trace_data = {
                "quest_name": quest_name,
                "status": "error",
                "error": str(e),
                "scars_recorded": [s for s in VowScarMemory.all()],
                "side_effects_recorded": [e for e in VowSideEffectRecorder.all()]
            }
            VowSideEffectRecorder.clear() # Clear for next run
        finally:
            _current_db.reset(_tok_db)
            _current_quest.reset(_tok_quest)
            _current_journal.reset(_tok_jr)

        # Feed the learning loop: tournament metrics -> adaptive selector;
        # the engine's strategy ranking improves with every run.
        tournament_results = exec_globals.get('_vow_tournament_results') or []
        if tournament_results:
            favorite = self.learning.on_tournament_results(quest_name, tournament_results)
            trace_data["learning"] = {
                "tournament_runs_recorded": len(tournament_results),
                "historical_favorite": favorite,
                "performance_report": self.learning.selector.get_performance_report(),
            }

        # Scar injection validation report (source-level, evidence)
        trace_data["scar_injection"] = injection_report

        # Learning-loop closure (Reconciled §5): optimization suggestions
        # derived from measured performance + recurring failure patterns.
        # Deterministic unless an llm callable was configured.
        suggestions = LLMStrategyOptimizer(
            self.learning, llm=self._llm).suggest(quest_name)
        if suggestions:
            trace_data["optimization"] = suggestions

        # Attach the Shadow Python source for human-oversight auditability
        # (EU AI Act Art. 14: an overseer can read exactly what the quest did)
        trace_data["shadow_python"] = shadow_python_code
        trace_data["dry_run"] = dry_run

        # 5. Persist trace to database
        run_id = (trace_data.get("run_id") or self._run_id
                  or os.urandom(8).hex())
        await self.database.save_trace(run_id, trace_data)
        trace_data["run_id"] = run_id # Ensure run_id is in the returned trace

        return trace_data

# --- Example Usage (Simulated Backend Service) ---
async def main():
    vow_manager = VowEngineManager(mock_db)

    # Example VOW Quest (from tournament_mixed.vow)
    example_vow_code = """
quest TournamentMixed {
  goal "find the answer to life, the universe, and everything"

  constraint attempts <= 6

  believe answer = 42 confidence 1.0 source "deep thought"

  tournament {
    score by proof_success * 0.6 + speed * 0.2 + safety * 0.2

    strategy wrong_answer {
      cost 1
      risk 0.0
      let result = 41
      prove result == answer
    }

    strategy risky_but_correct {
      cost 2
      risk 0.8
      let result = 42
      prove result == answer
    }

    strategy safe_and_correct {
      cost 1
      risk 0.1
      let result = answer
      prove result == 42
    }
  }

  success when result == 42
}
"""

    print("\n--- Running VOW Quest in Dry-Run Mode ---")
    dry_run_trace = await vow_manager.execute_vow_quest(example_vow_code, "TournamentMixed", dry_run=True)
    print(json.dumps(dry_run_trace, indent=2))

    print("\n--- Running VOW Quest in Live Mode ---")
    live_run_trace = await vow_manager.execute_vow_quest(example_vow_code, "TournamentMixed", dry_run=False)
    print(json.dumps(live_run_trace, indent=2))

    print("\n--- All Scars in DB ---")
    all_scars = await mock_db.get_scars("TournamentMixed")
    print(json.dumps(all_scars, indent=2))

    print("\n--- Retrieved Trace from DB (Dry Run) ---")
    retrieved_dry_trace = await mock_db.get_trace(dry_run_trace["run_id"])
    print(json.dumps(retrieved_dry_trace, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
