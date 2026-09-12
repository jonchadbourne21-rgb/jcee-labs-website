# VOW Durability Contract (v1) — the journal & resume design

Arc 3A. This document is the **contract**: what durability means for VOW,
what the journal guarantees, and — just as honestly — what v1 refuses to do.
Verifier checks 73/74 enforce the enforceable parts; the rest is discipline.

## 1. The contract

1. **Crash recovery.** If the process dies at any point during a quest,
   `vow run --resume <run_id>` resumes the *same logical run*: completed
   effects are never re-executed, completed tournament strategies are never
   re-scored, memory writes are never duplicated. The run finishes exactly
   as if the crash had not happened.
2. **Exactly-once for journaled outcomes.** Any effect whose `effect_result`
   is in the journal returns its recorded outcome on resume. No exceptions.
3. **At-least-once inside the crash window.** If the process died *after*
   executing an effect but *before* its result commit (the window between
   `effect_intent` and `effect_result`), resume re-executes that one effect.
   This is the same guarantee Temporal makes for activities: idempotent
   effects are the user's friend. The window is one effect wide, never more.
4. **Deterministic replay.** Resume re-executes the quest's pure code from
   the top against the journal. All non-determinism a quest can express —
   capability effects, memory reads, tournament timing — is journaled at
   its exact call point, in order. Replay consumes the journal with a
   **strict single cursor**: any divergence (different code path, different
   effect, different memory access pattern) is a `journal_mismatch` and the
   resume refuses loudly. Replay never guesses.
5. **Version honesty.** A run journals the SHA-256 of its `.vow` source and
   of the engine build (`engine_attestation`) in its genesis event. Resume
   refuses if either changed. A different engine is a different world —
   same discipline as axiom fingerprints.
6. **Tamper evidence.** Journal events are hash-chained
   (`event_hash = sha256(run_id | seq | kind | payload | prev_hash)`).
   `vow journal <run_id>` verifies the chain. The journal is evidence, not
   just machinery — it slots into the same story as the compliance bundle.

## 2. What v1 refuses to do (named so nobody claims it)

- **No suspension / waiting.** `wait`/`await approval` are Arc 3B. v1
  resumes *crashed* runs; it does not park a live one for 30 days.
- **No scope snapshots.** Resume replays from the top (Temporal's model),
  so item-boundary snapshots are unnecessary in v1. They arrive with 3B.
- **SQLite only.** The journal lives in the `SqliteDatabase` backend.
  On PostgreSQL/MongoDB backends the journal is **disabled** and the CLI
  says so on stderr — an honest degradation, never silent.
- **Single node.** No clustering, no leader election, no multi-writer.
- **Result fidelity.** Replayed effect results are JSON-round-tripped:
  JSON-native values come back exactly; exotic values come back as their
  string form (journaled via `repr`). VOW effects return strings, booleans
  and JSON shapes in practice.
- **Resume is for crashed runs only** (registry status `running` with no
  `run_end`). A completed run — success *or* honest failure — is history,
  not a resumable thing.

## 3. Event schema v1

Table `runs`: run registry.
`run_id TEXT PK · quest TEXT · source_sha256 TEXT · engine_sha256 TEXT ·
status TEXT (running|success|failed_proof|error) · created_at · ended_at ·
head_hash TEXT · event_count INTEGER`

Table `journal_events`:
`run_id TEXT · seq INTEGER · kind TEXT · payload TEXT(JSON, sort_keys) ·
ts TEXT · prev_hash TEXT · event_hash TEXT · PRIMARY KEY(run_id, seq)`

Genesis `prev_hash` = 64 zeros. Kinds:

| kind | payload | written when | replay behavior |
|---|---|---|---|
| `run_begin` | quest, source_sha256, engine_sha256 | run opens (genesis) | hashes must match current source+engine or resume refuses |
| `resume_begin` | source_sha256, engine_sha256, at_seq | a resume starts | informational (evidence of the resumption itself) |
| `effect_intent` | capability, action, args[] | before an effect executes | consumed with its result; intent-without-result at journal end = the crash window → re-execute live |
| `effect_result` | capability, action, outcome (`ok`/`blocked`/`error`/`shadow`), result, shadow, whisper | after the effect completes | return recorded outcome: re-fire recorded whisper; `ok`→value, `blocked`→blocked capability object, `shadow`→shadow, `error`→raise |
| `mem_recall` | store (`scar`/`success`), scope, quest, strategy, rows[] | a memory read happens | return journaled rows verbatim — the DB is never consulted on replay, so replay is insulated from any DB change after the crash |
| `mem_write` | store, quest, summary (message/context or quest/strategy/seed) | a scar/success row commits — **same SQLite transaction as the row** (row ⟺ event: atomic) | suppress the write entirely: the original row is already in the DB |
| `tournament_result` | seed, results[], winner | after the strategy loop, before success persistence | replace computed metrics wholesale; winner must be among live proof-passers (else `journal_mismatch`); the winner's live-computed env is restored |
| `replay_end` | at_seq | the moment the cursor exhausts | marks live takeover in the chain |
| `run_end` | status | quest finishes (any terminal status) | a run with `run_end` is complete and cannot be resumed |

## 4. Why each mechanism exists (design notes)

- **Memory reads are journaled** because the DB is not point-in-time: the
  original run's own pre-crash writes are already in the tables, and other
  deployments may write between crash and resume. Journaled recall rows
  make replay a closed system.
- **Memory writes are suppressed, not overlaid**, because the original
  pre-crash rows are already persisted; suppression reproduces the exact
  DB state the original run saw at every point.
- **Both halves need each other:** journaled recalls give determinism;
  suppressed writes prevent pollution. Either one alone is wrong.
- **Tournament metrics are journaled** because strategy timing is wall-clock
  — the one true non-determinism inside the engine. Strategies still
  *execute* on replay (their inner effects resolve from the journal, keeping
  the cursor aligned), but scores and the winner come from the chain.
- **The strict single cursor** is the determinism tripwire: effects, memory
  ops and tournament results must be consumed in exactly the order they were
  written. A quest that can't do that is non-deterministic — and v1 says so
  to its face instead of resuming wrongly.


## 5. Suspension (Arc 3B): `wait` and `await approval`

A journaled run can now **park** — exit its process cleanly and wake later,
days or weeks on, as if no time had passed. No scope snapshots: 3A's replay
machinery carries the run back to the exact suspension point.

### Semantics

- `wait until <expr>` (quest item; expr → ISO-8601 UTC string or epoch
  seconds). First encounter, live: journal `wait_enter`, unwind with
  `VowSuspend`; the CLI marks the run `suspended` with its `wake_at` and
  exits 0. `vow run --resume` before `wake_at` refuses ("not due"); at or
  after it, replay consumes the `wait_enter`, journals `wait_done`, and
  the quest continues live.
- `await approval "<reason>"` (quest item). Live: journal
  `approval_request`, unwind, run marked `awaiting_approval`. A plain
  resume refuses. `vow approve <run_id> <file.vow> [--approver N]
  [--note M]` appends `approval_granted` to the chain and resumes; the
  preamble re-fires the grant as a whisper — **the human decision is
  tamper-evident evidence inside the run's own chain** (EU AI Act
  Art. 14 human-oversight, mechanized). `vow deny <run_id>` appends
  `approval_denied` and ends the run `denied` — refusal is evidence too.
- **Dry-run never parks.** In shadow mode both constructs journal a
  `shadow: true` event and continue — a rehearsal shows where the run
  *would* pause, without pausing.
- **No silent skips.** `wait`/`await` in --live mode *without* a journal
  (in-memory backend or `--no-journal`) raise an honest error: a wait that
  cannot be honored must never be silently dropped.

### New/changed journal kinds

| kind | payload | notes |
|---|---|---|
| `wait_enter` | wake_at, shadow? | first encounter (live) or dry-run shadow |
| `wait_done` | wake_at, resumed_at | replay consumed the wait at/after its time |
| `approval_request` | reason, shadow? | live suspend point / dry-run shadow |
| `approval_granted` | approver, note, at | appended by `vow approve` — inside the chain |
| `approval_denied` | approver, note, at | appended by `vow deny`; run ends `denied` |

### Run registry statuses

`running` (crashed — resumable) · `suspended` (waiting on time — resumable
when due; `wake_at` column) · `awaiting_approval` (resumable via
`vow approve`) · `success` / `failed_proof` / `error` / `denied` (terminal
— history). `vow due --db` lists suspended runs whose `wake_at` has passed
plus all approval-waiting runs — the scheduler's worklist (cron-resumable).

### Still refused (named)

- Suspension is single-quest, single-node; no clustering, no durable
  timers daemon (the CLI + `vow due` are the sweeper; cron drives them).
- `await` is a statement in v1 (no boolean return to branch on; denial
  ends the run). Branching on verdicts is later work.
- Scope snapshots remain unnecessary: replay reaches the suspension point
  by construction. They stay an optimization we may never need.

---

## 6. Arc 3C — Bulletproof: exhaustive crash boundaries + the sweeper

### What 3C is NOT (the rescope, recorded)

The original Arc 3C was *tournament compute-checkpoints*: journal partial
tournament progress so a resumed run skips re-running strategies that
already finished. It is **deferred — permanently, unless profiling says
otherwise** — for three reasons:

1. **3A's replay already covers tournaments completely.** Tournament
   metrics are journaled (`tournament_result`) and replay restores the
   winner's live-computed strategy environment. A crashed tournament run
   resumes correctly today; checkpoints would only save CPU.
2. **They conflict with the strict single cursor.** Mid-computation
   checkpoints mean the replay cursor must resynchronize into the middle
   of a strategy loop — the exact complexity the strict cursor exists to
   refuse. Buying CPU with replay correctness is a bad trade.
3. **CPU is the cheapest thing in the system.** The expensive properties
   are exactly-once side effects and evidence integrity, and those are
   already guaranteed.

The value that actually remained was **proving the crash boundaries are
all safe** — that is what this arc builds instead.

### Deterministic crash injection: kill-by-journal-count

Killing by wall-clock is flaky; killing by journal position is exact.
`JournalRuntime._kill_after` (armed by the CLI from the `VOW_KILL_AFTER`
environment variable) turns the journal itself into the trigger: the
moment event #K is durably committed, the *next* journal write kills the
process with `os._exit(9)` — no cleanup, no flush, no atexit. A real
kill -9 / power-loss at exactly that boundary.

A run whose journal reaches N events has exactly N boundaries worth
testing: after each event 1..N-1 (the `_insert` hook), and after
`run_end` — the gap between "journal complete" and "registry updated",
covered by an explicit `kill_if_boundary()` check the CLI makes between
the two writes. The soak test (`tests/test_crash_soak.py`) kills at
**every** boundary, then resumes each corpse and asserts:

- the kill left exactly events 1..K committed (no half-written event);
- resume exits 0 with the quest's success status, same `run_id`;
- the final chain verifies intact;
- **exactly-once holds**: every `effect_intent` in the final chain has
  exactly one `effect_result` — except the single boundary effect, which
  may be re-executed once under the crash-window rule (§2) and is
  honestly marked in the `replay_end` note;
- the registry ends `success`.

`VOW_KILL_AFTER` is a test hook, not a user feature: it is ignored when
unset, applies only while armed, and a resumed run never inherits it
(the soak arms only the crashing invocation).

### Registry repair (found by the soak, by design)

Boundary N exposed a real gap: kill between `run_end` and `finish_run`
and the chain says *success* while the registry still says *running*.
A naive resume would replay into the terminal `run_end` and mismatch.
The resume path now detects a chain whose last non-marker event is
`run_end`: the work is done and the evidence proves it, so resume
**repairs the registry from the chain** (`finish_run` with the recorded
status) and reports `repaired: true` instead of re-executing. Refusing
would strand a finished run in `running` forever; silent success without
the repair flag would hide that anything was wrong.

### `vow sweep` — the sweeper, one call

`vow due` lists; `vow sweep` acts. For every suspended run whose wake
time has passed, sweep resumes it through the normal `--resume` path
(same source/engine/chain validation, same replay) and reports each
outcome. Rules:

- **Approvals are never auto-granted.** `awaiting_approval` runs are
  listed with their `vow approve` hint and left alone — a human decision
  is the point of the feature.
- **Crashed runs are reconciled BY EVIDENCE (Owed 4).** Every journaled
  run heartbeats into the registry (`runs.heartbeat_at`) every
  `VOW_HEARTBEAT_SECONDS` (default 5) while it executes. A crash stops
  the beat; sweep declares any `running` row whose beat is older than
  `--stale-after` / `VOW_RUN_STALE_SECONDS` (default 30s) `crashed` —
  the registry no longer says `running` forever — and resumes it
  automatically. Rows with NO heartbeat (pre-heartbeat stores) carry no
  evidence: they remain the operator's explicit `--crashed` call. A row
  whose heartbeat is FRESH is refused even under `--crashed` — evidence
  outranks the operator (a live resume would fork the journal). A
  crashed run whose chain already ends in `run_end` is repaired, not
  re-executed (above). `vow doctor` names stale beats and reconciled
  crashes awaiting resume.
- Sweep finds each run's quest file from the registry (`source_path`,
  recorded at `create_run`). Runs predating that column, or whose file
  moved, are reported `skipped` with the manual resume command — never
  silently dropped.
- Exit 0 when everything due reached a terminal state; 1 if any resume
  failed or was skipped. Cron line: `* * * * * vow sweep --db /data/vow.db`.

### New/changed journal kinds

None. 3C adds no event kinds — it proves the existing schema holds at
every boundary. (Registry-only additions: `runs.source_path` column;
Owed 4 adds `runs.heartbeat_at` + `runs.reconciled_at` — mutable
registry fields, deliberately outside the identity hash: staging or
beating them never breaks a signature.)

### Still refused (named)

- Crash injection covers the CLI process, not the SQLite file itself
  (media failure, filesystem corruption) — backups remain the operator's.
- Sweep is single-node; two sweepers on one database can double-resume.
  The strict cursor keeps the *journal* correct under that race, but the
  side effects would run twice. One sweeper per database.

---

## 7. Arc 3D — PostgreSQL journal + multi-run hardening

### What changes

The durability journal is no longer SQLite-only. `PostgresDatabase`
carries the same run registry and hash-chained event log (same schema,
same event kinds, same `JournalRuntime` — the runtime now speaks to a
backend journal primitive, `journal_append` / `journal_append_tx`,
instead of touching a raw sqlite connection, so the chain semantics are
identical on both stores). A `--postgres` run is journaled, resumable,
suspendable, approvable, and sweepable exactly like a `--db` one. Mongo
and in-memory backends remain honestly unjournaled, and still say so.

Guarantees carry over unchanged: exactly-once journaled effects, the
bounded crash window, deterministic replay, version honesty, tamper
evidence, and the boundary-N registry repair. The mem_write row⟺event
atomicity holds on Postgres too (same transaction, same rule).

### The double-resume race, closed: the atomic claim

3C's sweeper introduced a real hazard: two executors (a cron sweep and a
manual resume, or two sweeps) can pick the same due run. The journal
stays correct under that race — the strict cursor sees to it — but side
effects would run twice. 3D closes it with an **atomic claim**:

- `runs` gains `claimed_by` / `claimed_at`. A resumer claims with one
  atomic `UPDATE ... WHERE run_id=? AND status IN (...) AND
  (claimed_by IS NULL OR claim is stale)`. One winner; everyone else
  gets a loud "claimed by another process" refusal.
- `vow approve` / `vow deny` claim the `awaiting_approval` state the
  same way before journaling the decision — two approvers cannot both
  grant.
- `vow sweep` treats claim-loss as its own outcome (`claimed`), not a
  failure: the winner is resuming that run; exit code stays 0.
- Claims release on `finish_run` / `suspend_run`. A claim from a
  resumer that itself died goes stale after `VOW_CLAIM_STALE_MINUTES`
  (default 60) and can be reclaimed — a crashed resumer never wedges a
  run forever. Honest limit: a *legitimate* resume still running past
  the stale window can be reclaimed underneath it; long quests should
  park as `suspended` runs, which are exempt while parked... they are
  not — see the refusal below. Choose a stale window longer than your
  longest resume.

On SQLite the same guard applies (same UPDATE, same semantics) — cheap
there, load-bearing on Postgres where executors are genuinely separate
processes.

### Still refused (named)

- **Still single-leader per run.** The claim makes exactly one executor
  active per run; there is no multi-node *execution* (a run cannot
  migrate mid-flight between two live executors). Temporal-style
  clustering remains ahead of us.
- **The stale window is a heuristic**, not a lease with fencing tokens.
  A pathological pause (>stale) followed by a reclaim can still
  double-execute side effects; the journal will show both lives
  honestly. Fencing tokens are later work.
- **Media failure of the Postgres cluster itself** is the operator's
  (replication, backups) — the journal detects tampering; it does not
  survive deletion.
- Mongo/in-memory backends: still no journal (say it, don't hide it).

### Errata — the wait_done duplication bug (found by the Mock Trial)

The first rehearsal docket of the hourly Mock Trial (2026-07-21) found a
real replay bug the 3B/3C suites missed: a run that suspends TWICE
(e.g. `wait until`, then `await approval`) is resumed three times, and
the third life's replay re-journaled `wait_done` instead of consuming
the one an earlier life had appended — the stale event tripped the next
cursor expect (`journal_mismatch: expected approval_request, found
wait_done`). Fixed in `JournalRuntime.wait_enter` (replay consumes a
matching journaled `wait_done`); regression pinned in
`tests/test_suspension.py::test_wait_then_approval_third_life_replays_clean`.
This is exactly what the trial is for.

### Errata — Arc 3E: the operator quartet (additive, read-only)

Arc 3E (2026-07-22) added four read-only operator commands to
`vow_cli.py` — no engine, journal, or resume semantics changed:

- `vow explain <run_id>` — why a run is parked/held/ended, in plain
  language (complements the quest-memory `why`, which explains a quest's
  durable memory across runs; `explain` narrates one run's current state).
- `vow verify` — batch hash-chain verification over every run in the
  store; exit 1 and a `broken` list if any chain fails.
- `vow replay <run_id>` — narrate the journal as lives
  ("life 2 begins — replaying the journal of lives past").
- `vow doctor` — store physical: chains, due queue, orphaned claims,
  scar memory; `HEALTHY` / `NEEDS CARE` with exit code to match.

The quartet only reads: regression pinned in
`tests/test_cli_quartet.py` (7 tests covering success, suspension,
approval, sweep, and a tampered chain that both `verify` and `doctor`
must catch). The delivery manifest was re-cut on landing
(`verifier/gen_delivery_manifest.py`) — the integrity seal caught the
CLI change before the re-cut, exactly as designed.

### Errata — the pytest-less truthfulness regression (external review, 2026-07-22)

An independent review (separate sandbox, no pytest, no network) indicted the
gate itself: `tests/test_journal.py`, `tests/test_suspension.py`, and
`tests/test_postgres_journal.py` hard-imported pytest at module top. On a
pytest-less machine that broke `unittest discover` AND the v18
function-runner with import errors, so `make verify` exited FAILED — a
violation of the v18 truthfulness contract (pytest-less fallback + honest
SKIP). The failure mode was an **unstated environmental assumption**: the
suite silently assumed pytest, the very class of dishonesty this engine
exists to forbid.

Fix, landed the same day:

- The three files use a guarded import with a minimal local shim
  (`pytest.raises(..., match=...)`, `pytest.skip(...)` — the only pytest
  features they used).
- `verifier/v18/run_all_function_tests.py` now reports SKIP honestly from
  BOTH skip signals: `unittest.SkipTest` (the shim) and pytest's own
  `Skipped` — a `BaseException` that had been crashing the runner silently
  on pytest machines too (the fallback test count had been quietly missing
  from DELIVERY.md for the same reason). Environmental gaps are SKIP:
  never PASS, never FAIL.

Gate, re-proven on both interpreters: 304 passed + 1 skipped (pytest);
301 run / 0 failed / 1 SKIP (v18 runner, with and without pytest);
v20 overall PASS (80 checks, 1 environmental skip); delivery integrity
PASS; `make verify` exit 0 on the pytest-less path. DELIVERY.md's header
now states it: *gate verified WITH and WITHOUT pytest.*
