# VOW Architecture — Full Analysis

Generated 2026-07-18. Verifier v7: 26/26 PASS. Tests: 68/68. Total: ~3,460 LOC
(2,468 source / 778 tests / 218 examples; verifier suites separate).

## 1. The big picture

VOW is a transpiled domain language with a quest-oriented runtime. The
"Brain" (VOW source + semantics) compiles to auditable "Shadow Python";
the "Body" (engine, DB, CLI) executes and records it.

```
                        ┌──────────────────────────────────────────┐
                        │              AUTHOR LAYER                 │
                        │   *.vow quests (goals, tournaments,       │
                        │    proofs, scars, capabilities, @learn)   │
                        └──────────────┬───────────────────────────┘
                                       │ source text
                                       ▼
        ┌─────────────────────── FRONT END ───────────────────────┐
        │  vow_lexer.py (109 LOC)   tokenize(): text → [Token]     │
        │        │ tokens                                          │
        │        ▼                                                 │
        │  vow_parser.py (315 LOC)  VowAdvancedParser:             │
        │        │            recursive descent → AST              │
        │        ▼                                                 │
        │  vow_ast.py (105 LOC)     23 dataclasses                 │
        └────────┬───────────────────────────────┬─────────────────┘
                 │ AST                           │ AST
                 ▼                               ▼
   ┌─────── COMPILE ────────┐      ┌─────── REVERSE ──────────────┐
   │ vow_transpiler.py      │      │ vow_reverse.py (325 LOC)      │
   │ (502 LOC)              │      │  Shadow Python → VOW source   │
   │ AST → Shadow Python    │◄─────│  (round-trip verified)        │
   │ + SHADOW_RUNTIME_      │      └───────────────────────────────┘
   │   PREAMBLE (runtime)   │
   └────────┬───────────────┘
            │ Shadow Python source (readable, hash-pinnable)
            ▼
   ┌──────────────── RUNTIME / BODY ───────────────────────────────┐
   │ main.py (276 LOC)  VowEngineManager                            │
   │   compile → exec() → quest_fn() → trace                        │
   │   contextvars scar routing → MockDatabase (scars, traces)      │
   │   feeds every tournament → SelfLearningSystem                  │
   │                                                                │
   │ self_learning_system.py (276 LOC)                              │
   │   ScarPatternAnalyzer ← scars                                  │
   │   AdaptiveStrategySelector ← tournament metrics                │
   │   ScarVectorMemory → scars.json (similarity recall)            │
   │                                                                │
   │ compliance.py (205 LOC)                                        │
   │   trace → evidence.json + report.md (EU AI Act support)        │
   └────────┬───────────────────────────────┬──────────────────────┘
            │ programmatic API              │ subprocess
            ▼                               ▼
        host apps                    vow_cli.py (240 LOC)
                                     run / reverse / report
```

## 2. Module dependency graph (real, extracted from imports)

```
vow_lexer ──► (nothing — leaf)
vow_ast   ──► (nothing — leaf)
vow_parser ──► vow_lexer, vow_ast
vow_transpiler ──► vow_ast          (self-contained: carries its own runtime)
vow_reverse ──► (stdlib ast only — leaf-ish)
self_learning_system ──► (stdlib only — leaf-ish)
compliance ──► (stdlib only — leaf-ish)
vow/__init__ ──► all six modules    (facade, 40 exported names)
main.py ──► vow_parser, vow_transpiler, self_learning_system
vow_cli.py ──► main, vow_reverse, compliance
tests/* ──► vow.* + main            (68 tests, consumer-style imports)
```

Design property worth noting: **the graph is a DAG with four leaf modules** —
no cycles anywhere. The transpiler deliberately depends only on the AST, so
generated Shadow Python is self-contained (the preamble embeds the runtime
classes; a consumer never needs VOW installed to *run* compiled output).

## 3. Execution pipeline — what physically happens on `vow run x.vow`

```
1. vow_cli run  ──reads file──►  VowEngineManager.execute_vow_quest
2.   VowAdvancedParser(source).parse_program()        ──► AST (Program)
3.   VowTranspiler(include_preamble=True).transpile() ──► Shadow Python str
4.   compile()                                        ──► code object
5.   exec(code, exec_globals)  where exec_globals injects:
        VowScarMemory, VowSideEffectRecorder, VowCapability,
        VowProofFailure, vow_set_dry_run, VOW_DRY_RUN
6.   quest_<Name>() executes:
        _vow_quest_begin → grants → items → _vow_tournament
          (strategies timed, proofs enforced, metrics scored)
        → _vow_finish(success_fn, on_fail)
7.   trace assembled {status, run_id, final_result, scars,
        side_effects, learning, shadow_python, dry_run}
8.   scars/traces persisted; learning loop fed; CLI prints JSON trace
```

Round trip (the uniqueness proof): `reverse` walks the Shadow Python's own
`ast` module tree, recognizes the transpiler's emission patterns
(`_vow_goal`, `_vow_believe`, `_vow_grant`, `_vow_gated`, `_strategy_*`,
`_vow_tournament`, `_vow_finish(on_fail=...)`) and rebuilds VOW source that
re-parses and re-executes with identical results.

## 4. The learning loop — physical connections

```
prove fails in strategy ─► _vow_prove ─► VowScarMemory.record
                                            │ (contextvars-routed)
                                            ▼
                                     MockDatabase.scars   (per-quest)
                                            │
engine after each quest: on_tournament_results ─► AdaptiveStrategySelector
                             (success, time, cost per strategy)
on_proof_failure ─► ScarPatternAnalyzer ─► pattern groups
                                            │
                                     next run: historical_favorite
                                     appears in trace["learning"]
```

Concurrency safety: scar routing is a module-load patch that reads the
active DB/quest from `contextvars` — each asyncio task gets its own context
copy, so two quests running via `asyncio.gather` cannot cross-write scars
(verified by verifier check 13).

## 5. Security & enforcement layers

## Component map (post-audit, complete)

| Reconciled layer | Components shipped |
|---|---|
| Entry Points | `vow_unified.py` (Primary CLI + `exec` backend mode), `api_server.py` (REST), `vow_repl.py` (REPL) |
| Orchestration | `VowEngineManager` (contextvars routing, per-engine signing key) |
| Language Core | lexer → parser → transpiler → Shadow Python → `exec()` |
| Capability | `VowCapability` modal gate, capability whitelist, **`RateLimiter`** |
| Self-Learning | **`ScarInjectionValidator`**, `ScarPatternAnalyzer`, **`LLMStrategyOptimizer`**, `AdaptiveStrategySelector`, `ScarVectorMemory` |
| Data | SQLite (reference, stdlib), **PostgreSQL + MongoDB adapters** (`vow/database_backends.py`, conformance-tested against scripted fakes) |
| Observability | evidence bundles (`vow/compliance.py`), signed traces |

| Layer | Mechanism | When enforced |
|---|---|---|
| Deontic gating | `capability` grants; gated builtins table | **transpile time** (compile error) |
| Strategy purity | gated call in strategy → error | **transpile time** |
| Sandbox | exec with curated globals; call whitelist (abs/min/max/round/len + gated) | transpile + exec |
| Dry-run default | effects shadowed + recorded unless `--live` | runtime |
| Proof gating | failed prove → scar + ineligible to win | runtime |
| Integrity | DELIVERY.md sha256 manifest; bundle hashes | delivery |

## 5a. Field findings — documented provenance

Findings attributed to pilots are documented history, not lore. Each names
its source, date, and the notes file that records the exchange:

| Finding | Shipped fix | Source |
|---|---|---|
| Bare `prove failed` collapsed every ScarPatternAnalyzer cluster into one | scar messages carry the failing expression + failure kind (`prove failed: <expr> [<kind>]`); avoidance still keys on context, never the message | NicheFlow pilot via Manus, 2026-07-20 — `docs/VOW-Build-Notes-2026-07-20.md`, fix #2 (their Priority 1) |
| `recall scars` shifted the situation fingerprint, degrading exact-skip to cautionary retry | `recalled_scars` excluded from the fingerprint hash; verifier check 64 + two unit tests | NicheFlow pilot via Manus, 2026-07-20 — same notes, fix #1 (their Priority 2) |
| `vow report --db <file>` crashed on non-Mock backends | `cmd_report` duck-types across backends; bundles embed durable scar memory | found replaying the pilot, 2026-07-20 — same notes, fix #3 |
| Test counts quoted differently by different runners (190 vs 186) | DELIVERY.md names the runner beside every count | NicheFlow pilot reconciliation note, 2026-07-20 — same notes, §2 |

## 6. Honest engineering assessment

**Strengths**
- Zero-stub, fully verified: 68 tests + 26 consumer-style verifier checks,
  green with and without pytest; round trip proven by execution.
- Clean DAG, small modules (largest 502 LOC), single-responsibility split.
- The transpiler's single dependency on `vow_ast` makes compiled output
  self-contained — a genuine distribution advantage.
- Concurrency, dry-run, and the recall-landmine classes of bugs each have a
  dedicated verifier check — regressions are mechanically caught.

**Known limitations (the honest list)**
1. `exec()` of generated code: safe by construction for VOW-generated code
   (whitelist + gating), but the engine must never exec hand-written Shadow
   Python from untrusted sources. A `_vow_gated` shell capability in live
   mode is, by design, powerful — treat `shell` grants as root-equivalent.
2. `_vow_finish` swallows non-proof exceptions in success evaluation
   (`except Exception: ok = False`) — deliberate (a quest that can't
   evaluate success didn't succeed), but it can mask bugs in success exprs.
3. ScarVectorMemory similarity is bag-of-words cosine — honest and
   dependency-free, but semantically shallow; an embedding backend is the
   documented upgrade path.
4. No control flow (if/else, loops) in the language yet; quest-level
   strategies without tournaments not yet supported (spec'd in Worked
   Examples, not implemented).
5. `main.py`'s MockDatabase is in-memory; a real DB backend needs an
   awaitable write path (documented at the override site).
6. Package install story: importable from project root, but not yet a
   pip-installable distribution (`pyproject.toml` absent).

## 7. File-by-file

| File | LOC | Role |
|---|---|---|
| vow/vow_lexer.py | 109 | tokenizer, keywords/ops/strings/comments, line-col errors |
| vow/vow_ast.py | 105 | 23 dataclasses: exprs + quest items |
| vow/vow_parser.py | 315 | recursive descent, @learn, on fail, recall, capability |
| vow/vow_transpiler.py | 502 | codegen + Shadow runtime + deontic gate + VowCapability |
| vow/vow_reverse.py | 325 | Shadow→VOW round trip, general Python→VOW |
| vow/self_learning_system.py | 276 | analyzer, selector, vector memory |
| vow/compliance.py | 205 | EU AI Act evidence bundles |
| vow/__init__.py | 115 | facade, 40 exports |
| main.py | 276 | engine, contextvars scar routing, learning feed |
| vow_cli.py | 240 | run / reverse / report |
| tests/ (10 files) | 778 | 68 tests |
| examples/ (5 files) | 218 | all executed by verifier |
