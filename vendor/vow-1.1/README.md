# VOW — a quest-oriented programming language

VOW programs are **quests**: goal-directed computations that say what they
are trying to achieve, what they believe (and how confidently), what must be
proven before proceeding, which strategies competed to get there — and that
remember every failure as a **scar** instead of hiding it.

VOW transpiles to **Shadow Python**: ordinary Python plus the VOW runtime
preamble, executed by the orchestration layer in `main.py`
(`VowEngineManager`). Version **1.1.0**. See `SPEC.md` (repository root,
one level up from this README) for the single source of truth.

Version 1.1 adds an optional **causal-effect retry gate**. During ambiguous
crash recovery, VOW can reconstruct reservations, multi-object relations,
identity rewrites, dynamic modes, and unresolved causal branches from typed
adapter receipts. It emits `safe_to_retry`, `do_not_retry`, or
`observe_first`, then hash-chains the causal decision into the existing
`effect_recovery_decision` event. The gate is non-broadening: it may veto or
delay a retry, but it can never turn an existing wait/refusal into permission.
See `docs/CAUSAL_EFFECTS.md`.

## One entry point for everything — vow_unified.py

For humans it IS the CLI (`run` / `reverse` / `report` / `repl` pass
straight through). For backends — a Node.js service, any other language —
`exec` runs a quest and prints exactly one JSON trace to stdout:

```bash
python vow_unified.py exec --file quest.vow --db memory.db
cat quest.vow | python vow_unified.py exec --quest BatchA --db memory.db
```

Call it as a subprocess, `JSON.parse` the whole output, check
`trace.status`. Point it at the same `--db` file and every call shares the
same scar/success memory — your backend gets the learning loop for free.
Exit codes: 0 executed (check the trace), 2 usage error, 3 execution
error. From Python directly: `from vow_unified import execute_quest`.

## Full CLI surface

`vow <command>` (or `python vow_unified.py <command>`; the file-first form
`vow_unified.py file.vow run` works too):

| Command | Purpose |
|---|---|
| `run` | execute a quest, print the JSON trace (dry-run default, `--live`) |
| `transpile` (alias `shadow`) | emit the Shadow Python |
| `reverse` | Python / Shadow Python → VOW |
| `validate-shadow` | exit 0 iff transpilation is faithfully reversible |
| `roundtrip` | VOW → Shadow → VOW, print the regenerated source |
| `scars list` / `scars stats` | inspect durable scar memory |
| `scars export` / `scars inherit` | share redacted, signed `.vowscars` lesson packs between deployments — imported lessons caution, never exact-skip |
| `why <quest>` | causal explanation of a quest's memory: what hurt, what works, what happens next time (read-only) |
| `domain "sop"` | stable-environment domains: success memory steers execution — a strategy with 3 wins in the same situation becomes the golden path (runs alone), the field re-opens every 5th golden win and the moment the golden path breaks; scars always outrank golden |
| Quantum Dict | every strategy's state access is logged (read/write footprints in each run trace); mutable values shared across strategies raise a `shared_reference` whisper, and failures in their presence carry `entangled_refs` — entanglement can't hide |
| `digest` | daily behavioral intelligence report: scars by kind, golden paths, success/latency stats, whisper + skip census, fleet lessons — one JSON digest per deployment per date (read-only) |
| `axiom` / `deduce` | compile-time truths: constants and decision tables resolved at transpile time, immutable at runtime, hashed into the situation fingerprint (a policy change is a new situation), stamped into run evidence |
| `collapse by <expr>` | output-aware tournament selection: rank strategies on what they PRODUCE (margin, quality), not just engine metrics — a higher-margin route can beat a safer one; disqualified strategies score 0.0 |
| `route <name> from <source>` | deterministic zero-token intent routing: `recognize "..." -> "label"` rows, first match wins, `fallback` catches the rest — contextual syntax, no new reserved words |
| `route` (CLI) | classify a text against a file's route block without executing it: `vow route file.vow "can I get a refund?"` → intent, matched pattern, source |
| `intent "<name>" denies <action>, ...` | quest-level intent policy: a denied effect is NEVER executed — `intent_violation` whisper + blocked shadow, quest continues; scoped, not a blanket lockdown |
| `ontology { define_keyword "kw" -> "host_fn" }` | language growth without grammar changes: new keywords compile to host-function registry calls; unbound keywords whisper `ontology_unbound` and pass the value through — never a silent rewrite |
| `engine-hash` | print the engine build hash (sha256 over engine sources) that every evidence bundle carries inside its signed envelope — verify a bundle against a known build |
| durability journal | every SQLite-backed run is hash-chained: effects, memory reads/writes, tournament outcomes — the journal is tamper-evident evidence, not just machinery (`docs/DURABILITY.md`) |
| `--resume RUN_ID` | crash durability: kill -9 mid-quest and resume the SAME logical run — journaled effects never re-execute (exactly-once), the crash window re-executes at most one effect; changed source/engine refuses loudly |
| causal-effect retry gate | optional branching hypergraph replay at an ambiguous keyed-effect boundary: causal receipts yield `safe_to_retry`, `do_not_retry`, or `observe_first`; unsafe/invalid evidence fails closed and every verdict is hash-chained (`docs/CAUSAL_EFFECTS.md`) |
| `runs` / `journal` | the run registry (`running` = crashed and resumable) and the verifiable per-run event chain |
| `wait until <time>` | suspension: the run parks, exits its process, and resumes exactly where it stopped when due — replay, not snapshots; dry-run shadows the pause, never parks |
| `await approval "…"` + `approve` / `deny` / `due` | human-in-the-loop as a language construct: the run parks for a decision; the grant or denial is journaled **inside the run's own hash chain** — tamper-evident human oversight (EU AI Act Art. 14, mechanized) |
| `sweep [--crashed]` | the sweeper: resume every due suspended run in one call (cron one-liner) — approvals are never auto-granted; crashed runs need `--crashed`; a run whose journal completed before the registry updated is repaired from the chain, never re-executed |
| `explain` / `verify` / `replay` / `doctor` | the operator quartet (read-only): why a run is parked/held/ended in plain language; batch chain verification (exit 1 on any break); the journal narrated as lives; a store physical — chains, due queue, orphaned claims, scar memory (`HEALTHY` / `NEEDS CARE`) |
| crash-boundary soak | every crash boundary is proven: `VOW_KILL_AFTER=K` dies at exactly committed-event boundary K, and the suite kills at *every* boundary 1..N — each corpse resumes with exactly-once intact (`tests/test_crash_soak.py`) |
| `--postgres` durability | the journal is not SQLite-only: PostgreSQL carries the same run registry + hash-chained event log with full parity (journaled runs, resume, suspension, approvals, sweep) — live-server-proven in `tests/test_postgres_journal.py` |
| atomic claim | multi-run hardening: one atomic UPDATE claims a run for resume/decision — a concurrent sweep or second approver loses loudly instead of double-executing; stale claims (`VOW_CLAIM_STALE_MINUTES`, default 60) are reclaimed so a crashed resumer never wedges a run |
| `fmt` / `lint` | canonical formatting / static checks |
| `report` | EU AI Act evidence bundle |
| `repl` | interactive session |
| `serve` | REST API (`api_server.py`: `/run`, `/transpile`, `/scars`, `/successes`, `/traces/<id>`, `/health`) |
| `exec` (vow_unified) | single-JSON-trace backend mode |

Data-layer flags on `run` / `scars` / `report` / `serve`: `--db` (SQLite),
`--postgres` (PostgreSQL DSN; needs psycopg/psycopg2/pg8000), `--mongo`
(MongoDB URI; needs pymongo).

Extended syntax: list/dict literals, lambdas, collection chaining
(`.filter/.map/.sort_by/.group_by`), and enforced type annotations
(`let n: int = 7` — a violation fails the strategy with a
`type_violation` reason). See `docs/WORKED_EXAMPLES.md`.

The learning loop's named components (Reconciled §5) all ship:
`ScarInjectionValidator` (mandatory scar injection, checked at source and
asserted at runtime), `ScarPatternAnalyzer`, `LLMStrategyOptimizer`
(deterministic by default, pluggable LLM via `VowEngineManager(llm=...)`,
honest fallback), `AdaptiveStrategySelector`, `ScarVectorMemory`. The
capability layer includes the `RateLimiter`
(`VowEngineManager(rate_limits={'network': {'rate': 5, 'burst': 10}})`;
dry-run rehearses throttling, live enforces it).

## The REPL — watch it learn, interactively

```bash
vow repl --db vow.db
```

Define quests (multiline, brace-balanced), `:run` them, and the whole
learning loop is visible live: failures explained by their autopsy
(`why shortcut failed: distance > 10 — actual 5, off by 5`), scarred
paths `SKIPPED(scar_memory)` on the next run, similar paths retried with
caution. Inspect memory with `:scars` / `:successes`, control decay with
`:ttl`, toggle `:live` / `:dry`. Syntax errors never kill the session;
with `--db`, memory persists across sessions.

## Verify everything in one command

```bash
make verify
```

One gate, four stages: purge stale bytecode, the full test suite, the
latest versioned verifier (consumer-style, cross-process), and a delivery
integrity check that re-validates every checksum in `DELIVERY.md` against
the files on disk — the guard against silent filesystem-sync losses. Exit
0 means everything you were delivered is exactly what was verified.

## The vision: quest-oriented programming

Most languages encode *how* to compute. VOW also encodes *why*, *how sure we
are*, and *what went wrong last time*:

- **Goals** — every quest declares a `goal`: the intent the computation
  serves, carried in the program itself.
- **Beliefs with confidence** — `believe` binds knowledge together with a
  confidence score and a provenance `source`, so uncertain inputs are
  explicit instead of assumed.
- **Scar memory** — failures are first-class. `scar` statements and failed
  proofs are recorded in `VowScarMemory`, persisted by the host
  application, and **recalled** by future runs so the same mistake is not
  made twice.
- **Proofs** — `prove` is an assertion whose failure is recorded (as a
  scar, with context) and then raised as `VowProofFailure`. Nothing fails
  silently.
- **Tournaments** — a `tournament` runs several `strategy` bodies, times
  them, scores them by a weighted expression over `proof_success`, `speed`,
  `safety`, `cost`, and `risk`, enforces `constraint`s and attempt budgets,
  and lets only the winner's bindings escape into the quest.
- **Dry-run shadowing** — side effects are guarded by `VowCapability`. In
  dry-run mode (the default) an effect is *recorded* in
  `VowSideEffectRecorder` and a shadow placeholder is returned; in `--live`
  mode it executes for real. You can rehearse a quest before letting it
  touch the world.

## Syntax guide

Keywords: `quest goal constraint believe confidence source scar tournament
score by strategy cost risk prove success when let`.

Strings are double-quoted, numbers are int/float, `#` starts a line comment,
and newlines are insignificant — statements end at keyword boundaries or
`}`. Expressions are Python-compatible (identifiers, literals, arithmetic,
comparison, `&&`/`||`/`!`, calls to the whitelisted pure functions
`abs min max round len`), plus the tournament metric names
`proof_success speed safety cost risk`.

### quest — the unit of a program

```vow
quest TournamentMixed {
  goal "find the answer to life, the universe, and everything"
  ...
  success when result == 42
}
```

A file holds one or more quests. `goal` records intent; `success when`
decides, at quest end, whether the quest succeeded.

### believe — knowledge with confidence and provenance

```vow
believe answer = 42 confidence 1.0 source "deep thought"
```

Binds `answer` in quest scope and stores
`{name, value, confidence, source}` in the quest's belief table. Confidence
defaults to `1.0`; `source` is optional.

### constraint — the attempt budget

```vow
constraint attempts <= 6
```

Evaluated each tournament iteration; `attempts` is the running attempt
count. A violated constraint stops the tournament cleanly (recorded in the
trace), never with an exception.

### tournament — competing strategies, scored

```vow
tournament {
  score by proof_success * 0.6 + speed * 0.2 + safety * 0.2

  strategy wrong_answer {
    cost 1
    risk 0.0
    let result = 41
    prove result == answer
  }

  strategy safe_and_correct {
    cost 1
    risk 0.1
    let result = answer
    prove result == 42
  }
}
```

Each strategy runs in a sub-scope and is measured:

| metric          | meaning                                        |
| --------------- | ---------------------------------------------- |
| `proof_success` | 1.0 if all its proves passed, else 0.0         |
| `speed`         | `1 / (1 + elapsed_seconds)`                    |
| `safety`        | `1.0 - risk`                                    |
| `cost`, `risk`  | declared metadata (defaults `1.0`, `0.0`)      |

The `score by` expression ranks strategies; the winner's `let` bindings
propagate to quest scope and its proofs are enforced for real. Full
per-strategy results are kept in `_vow_tournament_results`.

### prove — assertions that remember

```vow
prove observed == expected
```

If the expression is falsy, a scar (with context) is recorded and
`VowProofFailure` is raised. Inside a strategy the tournament catches it
(that strategy scores `proof_success = 0`); outside, it ends the quest with
status `failed_proof`.

### scar — deliberate lessons

```vow
scar "2024 incident: deployed without green tests; rollback took 3 hours"
```

Records a message in `VowScarMemory` immediately, so later runs — and the
JSON trace — can recall it.

### let — plain binding

```vow
let delta = expected - observed
```

## Install

```bash
pip install -e .
vow run examples/tournament_mixed.vow            # console script
vow run examples/learning_loop.vow --db vow.db   # durable scar memory (SQLite)
```

## Quickstart

### CLI

```bash
# Dry-run (shadow) mode: effects recorded, not executed. Exit code 0 on
# success status, 1 otherwise. Prints the JSON trace to stdout.
python vow_cli.py run examples/tournament_mixed.vow

# Pick a specific quest (default: the first quest in the file)
python vow_cli.py run examples/scar_memory.vow --quest LearnTheHardWay

# Live mode: guarded side effects execute for real
python vow_cli.py run examples/capabilities.vow --live
```

A trace looks like:

```json
{
  "quest_name": "TournamentMixed",
  "status": "success",
  "final_result": "{'success': True, 'result': ...}",
  "scars_recorded": [],
  "side_effects_recorded": [],
  "run_id": "..."
}
```

### Python API

Parse, transpile, and execute directly:

```python
from vow import VowAdvancedParser, VowTranspiler

source = open("examples/tournament_mixed.vow", encoding="utf-8").read()
program = VowAdvancedParser(source).parse_program()
shadow_python = VowTranspiler(include_preamble=True).transpile(program)

namespace = {}
exec(shadow_python, namespace)            # defines quest_<Name>() + QUESTS
result = namespace["quest_TournamentMixed"]()
assert result["success"] is True
```

Or through the orchestration layer (tracing, scar persistence, dry-run):

```python
import asyncio
from main import MockDatabase, VowEngineManager

manager = VowEngineManager(MockDatabase())
trace = asyncio.run(
    manager.execute_vow_quest(source, "TournamentMixed", dry_run=True)
)
print(trace["status"])   # "success"
```

## Architecture

```
 +-------------------+   tokens   +--------------------+    AST    +---------------------+
 |  quest.vow        | ---------> |  vow_lexer.py      | --------> |  vow_parser.py      |
 |  (VOW source)     |            |  tokenize()        |           |  VowAdvancedParser  |
 +-------------------+            +--------------------+           +----------+----------+
                                                                             |
                                                                             v
 +-------------------+            +--------------------+           +---------------------+
 |  JSON trace       | <--------- |  engine (main.py)  | <-------- |  vow_transpiler.py  |
 |  status / result  |   exec     |  VowEngineManager  |  Shadow   |  VowTranspiler      |
 |  scars / effects  |            |  + MockDatabase    |  Python   |  + runtime preamble |
 +---------+---------+            +---------+----------+           +---------------------+
           |                                |
           v                                v
   +---------------+                +-----------------------+
   | scar memory   |                | side-effect shadowing |
   | VowScarMemory |                | VowCapability         |
   | record/recall |                | VowSideEffectRecorder |
   | -> persisted  |                | dry-run: recorded     |
   |    to DB,     |                | --live:  executed     |
   |    recalled   |                +-----------------------+
   |    next run   |
   +---------------+
```

Pipeline: `tokenize` → `VowAdvancedParser.parse_program` →
`VowTranspiler.transpile` (emits one `quest_<Name>()` function per quest
plus `QUESTS`, prepended by `SHADOW_RUNTIME_PREAMBLE`) → `VowEngineManager`
executes the Shadow Python in an isolated module namespace with the runtime
(`VowScarMemory`, `VowCapability`, `VowProofFailure`,
`VowSideEffectRecorder`, `vow_set_dry_run`) injected → JSON trace with
status, scars, and recorded effects.

## Repository layout

```
project/
  vow/
    __init__.py          # re-exports public API (from vow import ...)
    vow_lexer.py         # tokenize(source) -> list[Token]
    vow_ast.py           # AST dataclasses
    vow_parser.py        # VowAdvancedParser, VowSyntaxError
    vow_transpiler.py    # VowTranspiler + runtime classes
  main.py                # fixed orchestration layer (VowEngineManager)
  vow_cli.py             # CLI: vow run file.vow [--quest NAME] [--live]
  examples/
    tournament_mixed.vow # canonical tournament quest
    scar_memory.vow      # scars recorded on prove failure + recall
    capabilities.vow     # dry-run vs live side-effect shadowing
  tests/
    test_lexer.py test_parser.py test_transpiler.py test_runtime.py test_e2e.py
  README.md
```

## Examples

| file                    | shows                                                             |
| ----------------------- | ----------------------------------------------------------------- |
| `tournament_mixed.vow`  | goal, constraint, believe, tournament, prove, success             |
| `scar_memory.vow`       | explicit scars, prove failure -> scar, recall-informed beliefs    |
| `capabilities.vow`      | shadow vs live effects modeled with tournaments and proof gates   |

## Testing

```bash
cd project
python -m pytest tests/          # or: python -m unittest discover tests
```

Coverage: lexer tokens, parser AST shapes, syntax errors, transpiler output,
dry-run vs live capability behavior, prove failure → scar, tournament winner
correctness, and end-to-end runs in both modes.

## Scar-informed avoidance & lone strategies

```vow
quest path_chooser {
  goal "get there safely"
  tournament { ... strategy shortcut { ... prove distance > 10 } ... }
}
# run 1: shortcut fails -> scar attributed to that path + situation seed
# run 2 (even a new process, with --db): the EXACT same situation is
# SKIPPED entirely — "that path hurt, don't go down it again"
# (skipped: scar_memory in trace)
```

- Prove-failure scars carry `{strategy, quest, seed}` — the seed is a
  fingerprint of the visible inputs, so avoidance is **exact-match only**:
  the same strategy in a *different* situation is not avoided but gets a
  **cautionary retry** (`caution: similar_scar`, score × 0.9). A success
  proves the situations differ; a failure leaves a second, distinct scar —
  the map of what hurt gets finer with every attempt. If *every* path is
  an exact scar, the quest proceeds anyway (scars visible in the trace).
  See `examples/discrimination.vow`.

## Scar autopsies — failures that explain why (zero tokens)

`prove` is declared intent, so a failure is mechanically diagnosable. Every
prove-failure scar carries a `reason`: the failed expectation
(`batch_size < 500`), a classification (`threshold_violated`,
`equality_mismatch`, `falsy_value`, ...), the bindings at failure, the
margin (`actual 600, expected 500, off by 100`), and `diff_vs_success` —
what changed since the same strategy last worked (`batch_size: 450 ->
600`). No model, no tokens: the runtime reads its own declared intent.
Cautionary retries show `prior_reason` (why the similar path hurt last
time), and the learning loop clusters recurring failures by the failed
expectation itself. Success snapshots persist to the database (capped at
10 per quest+strategy), so the counterfactual — "last time it worked,
batch_size was 450" — survives process restarts. See
`examples/scar_autopsy.vow`.

## Scar decay — old lessons get retested

Exact-match avoidance skips forever by default, but the world changes. Set
a TTL (`vow run --scar-ttl 86400`, or `VowEngineManager(db, scar_ttl=...)`)
and any exact scar older than the TTL demotes from a blind skip to a
cautionary retry (`caution: aged_scar`): the path gets retested, and the
outcome either clears it or re-scars it fresh. Unknown scar ages are
treated as fresh (safe), and a recent failure always outranks an old one.
- **`strategy` at quest level** (no tournament): the atomic fallible action —
  timed, proof-enforced, feeding the learning loop, wired to `on fail`.

## Control flow

```vow
let compounded = 100
repeat 3 times {
  set compounded = compounded * 1.1    # set = reassign a let-bound name
}
if compounded >= 130 {
  set tier = 1
} else {
  set tier = 2
}
```

`set` on an unbound name is a compile-time error — bind with `let` first.
Works inside tournament strategies too.

## Exec trust boundary

The engine only ever executes code the transpiler itself produced:

- Every generated Shadow Python is HMAC-SHA256 **signed** with the engine's
  ephemeral key (`# VOW-SIGNATURE:` header).
- Before `exec()`, the signature is verified — unsigned or tampered source
  raises `VowSecurityError`. Hand-written "Shadow Python" cannot be forged
  into the engine.
- Defense-in-depth: a sandboxed builtins set (no `eval`/`exec`/`compile`,
  whitelisted imports) backs the signature.

## Durable scar memory

By default scars live in the in-memory mock DB. Pass `--db PATH` (or use
`SqliteDatabase` programmatically) and every scar + trace persists to
SQLite — the learning loop's memory survives restarts:

```python
from vow.database import SqliteDatabase
from main import VowEngineManager
mgr = VowEngineManager(SqliteDatabase("vow_memory.db"))
```

## Compliance evidence export (EU AI Act support)

```bash
python vow_cli.py report examples/tournament_mixed.vow --out bundle/
# -> bundle/evidence.json + bundle/report.md
```

Turns a real quest run into an evidence bundle: Art. 12-style structured
event log, permissions manifest (declared capabilities + observed gated
calls), Art. 14 oversight material (the Shadow Python itself, hash-pinned),
Art. 15 robustness evidence (proofs, tournament metrics, scars), and a
SHA-256 bundle hash. Every field derives from the actual trace — missing
data renders as explicit "not recorded", never invented. This is evidence
*support*; conformity assessment and legal review remain organizational
obligations.

## Capability gating (deontic layer)

```vow
quest fetcher {
  goal "fetch through the permission layer"
  capability network      # grant
  let page = http_get("https://example.com/")   # gated call
  success when true
}
```

- Gated builtins: `http_get`/`http_post` (network), `file_read`,
  `file_write`, `shell_exec` (shell), `model_ask` (model).
- **Undeclared use is a compile-time error** — permission is a property of
  the action type, checked before anything runs, even in dry-run.
- **Tournament strategies are pure computation** (Path A): gated calls
  inside a strategy body are a compile-time error.
- Dry-run returns recorded shadows; `--live` executes real implementations.
  `model_ask` in live mode requires an injected `_vow_model_handler`.

## Language-side learning

```vow
@learn
quest checkout_batcher {
  goal "Process batches safely"
  recall scars                 # load past lessons into scope
  tournament { ... }
  on fail { scar "planning failed despite recalled lessons" }
  success when batch_size < 500
}
```

- **`@learn`** — marks the quest learning-enabled; the engine feeds its
  tournament results and scars into the self-learning loop.
- **`recall scars`** — binds `recalled_scars` in quest scope from scar memory.
- **`on fail { ... }`** — retry-queue semantics: runs when the quest fails
  (success false, or quest-level proof failure) — never on success.

## Reverse transpiler (Python → VOW)

VOW round-trips. `vow/vow_reverse.py` maps Python back to VOW:

```bash
python vow_cli.py reverse my_script.py            # general Python -> VOW
python vow_cli.py reverse shadow_out.py --shadow  # Shadow Python -> VOW (faithful)
```

- **General mode**: `def name():` → `quest name {}`, docstrings → `goal`,
  assignments → `let`, `assert` → `prove`, `return <comparison>` →
  `success when`, `raise` → `scar`. Anything VOW cannot express becomes a
  `# unsupported:` comment — the mapping is total and never crashes.
- **Shadow mode**: recognizes the transpiler's emission patterns
  (`_vow_goal`, `_vow_believe`, `_vow_tournament`, `_strategy_*`,
  `_vow_finish`, ...) for a faithful round trip:
  `vow → shadow → vow` re-parses, re-transpiles, and executes with
  identical results (verified in `tests/test_reverse.py`).

**Which mode do I use?**
- `vow reverse file.py` — best-effort mapping for reading/migration. Output
  may contain `__expr__(...)` markers and is **not** guaranteed to execute
  via `vow run` (the CLI warns on stderr when this happens).
- `vow reverse file.py --shadow` — faithful round trip of transpiler output;
  guaranteed to re-parse and re-execute with identical semantics (semantic
  identity: same results and scores, not byte-for-byte formatting).

## Self-learning loop

VOW learns from failure. `vow/self_learning_system.py` implements the full
loop (Reconciled Architecture §5):

- **ScarVectorMemory** — persistent scar store (`scars.json`) with
  similarity recall.
- **ScarPatternAnalyzer** — finds recurring failure patterns (normalizes
  volatile detail so "timeout after 30s" and "timeout after 45s" group).
- **AdaptiveStrategySelector** — ranks strategies from recorded performance
  (success rate, speed, frugality).
- Every tournament the engine runs is fed into the loop automatically; each
  trace carries a `"learning"` section with the historical favorite.
  Scar routing is concurrency-safe (`contextvars`).

## Roadmap

- **Persistent scar backends** — PostgreSQL/MongoDB adapters for
  `VowScarMemory` (the host already injects its own via `db_client`).
- **Capability library** — predeclared `VowCapability` effects (HTTP, FS,
  queues, deploys) exposed to quests as shadow-first primitives.
- **Async quests and parallel tournaments** — strategies raced concurrently
  with per-strategy timeouts and cancellation on constraint stop.
- **Cross-run learning** — recalled scars automatically adjusting belief
  confidence and tournament score weights.
- **Tooling** — REPL (`vow shell`), `--trace` pretty-printer, LSP server
  with inline proof status, editor highlighting.
- **Language growth** — quest parameters and composition (`quest A` calling
  `quest B`), modules/imports, richer expression whitelist, typed beliefs.
- **Verification** — proof-carrying traces: signed transcripts of which
  proofs held, which scars fired, and which effects were shadowed vs live.
