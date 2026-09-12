# VOW Language & Ecosystem: Worked Examples (corrected)

**This copy supersedes the pre-Reconciled draft.** Corrections applied:

1. **Path A purity** — the old `02_tournament` and `forbidden_action`
   examples called `http_get`/`shell_exec` inside strategy bodies. Under
   the canonical Reconciled architecture (and the Ontology Primer, which
   blesses the rule as a mereological constraint) that is a **compile-time
   error**: strategies are pure computation; effectful calls live at quest
   level behind the deontic gate. The examples below are the corrected
   versions, and they all run against the shipped interpreter.
2. **HPQR references removed** — the bytecode VM was archived by the
   Reconciled document; the transpile-to-Shadow-Python pipeline is the
   canonical execution model.
3. **Import path** — the self-learning demo imports from
   `vow.self_learning_system` (the legacy `src.` layout is gone).
4. **CLI** — both invocation orders work:
   `vow_unified.py run file.vow` and `vow_unified.py file.vow run`.

## Running

```bash
cd project
python3 vow_unified.py run examples/01_hello_quest.vow
python3 vow_unified.py examples/02_tournament.vow run          # same thing
python3 vow_unified.py examples/02_tournament.vow transpile --to-python
python3 examples/learning_demo.py
```

## 01 — hello quest (`examples/01_hello_quest.vow`)

The basic quest / strategy / prove cycle. Runs to success; the trace
carries the tournament metrics for `greet`.

## 02 — tournament with learning (`examples/02_tournament.vow`)

`@learn` quest: effectful fetches happen at quest level (dry-run records
shadows), two strategies compete on pure computation, `on fail` authors a
scar. Run it twice and the learning section of the trace starts ranking
the strategies from measured history.

## 03 — collections & annotations (`examples/03_collections.vow`)

The extended parser surface, all proven in one quest:

- list / dict literals: `[5, 1, 4]`, `{"limit": 500}`
- lambdas with closures: `lambda x: x * factor`
- chaining: `.filter(...)`, `.map(...)`, `.sort_by(...)`, `.group_by(...)`
- type annotations: `let n: int = 7` — enforced contracts (a violation
  fails the strategy with a `type_violation` reason, not a silent pass)

## 04 — beliefs & control flow (`examples/04_beliefs_and_logic.vow`)

`believe ... confidence ... source`, `if/else`, `set`, `repeat N times`.

## 05 — authoring scars (`examples/scar_writer.vow`)

Curated lessons written by the strategy itself, plus a forced failure so
the pattern analyzer sees it. `vow_cli.py scars list --db <path>` shows
all three scars afterwards.

## 06 — deontic enforcement (`examples/failing/forbidden_action.vow`, deliberately fails compile)

`shell_exec` inside a strategy body. The quest is **refused at compile
time** — stronger than the runtime `CapabilityViolation` the old draft
demonstrated, because the effect never reaches the runtime at all.
The undeclared-capability case (effectful call at quest level without the
matching `capability` grant) is likewise a compile-time error.

## 07 — self-learning demo (`examples/learning_demo.py`)

Direct use of the learning components as a Python API:
`ScarPatternAnalyzer` (recurring-failure clustering) and
`AdaptiveStrategySelector` (measured performance ranking).

## The learning loop, end to end

```
scars ──> ScarInjectionValidator  (mandatory injection, source + runtime)
      ──> ScarPatternAnalyzer     (cluster failures by WHY)
      ──> LLMStrategyOptimizer    (suggestions; deterministic by default,
                                   LLM-assisted when a model is configured)
      ──> AdaptiveStrategySelector
      ──> ScarVectorMemory        (durable via SQLite/PostgreSQL/MongoDB)
```

Every engine trace carries the evidence: `scar_injection` (validator
report), `learning` (selector history), `optimization` (suggestions).

## CLI surface

| Command | Purpose |
|---|---|
| `run` | execute a quest, print the JSON trace (dry-run default, `--live`) |
| `transpile` (alias `shadow`) | emit the Shadow Python |
| `reverse` | Python/Shadow Python → VOW |
| `validate-shadow` | exit 0 iff the transpilation is faithfully reversible |
| `roundtrip` | VOW → Shadow → VOW, print the regenerated source |
| `scars list` / `scars stats` | inspect durable scar memory |
| `fmt` / `lint` | canonical formatting / static checks |
| `report` | EU AI Act evidence bundle |
| `repl` | interactive session |
| `serve` | REST API (api_server.py) |
| `exec` (vow_unified) | single-JSON-trace backend mode |

Data layer flags on `run`/`scars`/`report`/`serve`: `--db` (SQLite),
`--postgres` (DSN; needs psycopg/psycopg2/pg8000), `--mongo` (URI; needs
pymongo). The adapters ship conformance-tested against scripted fakes —
only a live deployment can prove them against a real server, and they say
exactly that.
