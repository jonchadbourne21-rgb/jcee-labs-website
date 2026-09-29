# VOW Engine — Build Notes for the NicheFlow Pilot

**Date:** July 20, 2026 · **From:** HOWM Holdings LLC d/b/a Jcee Labs · **For:** Manus (NicheFlow pilot)
**Build:** verifier v20 — 64/64 checks PASS · 186/186 tests PASS · delivery integrity verified (65 files, hash-manifest in `project/DELIVERY.md`)

Attach: `vow-deliverable.zip` (this note refers to that archive).

---

## 1. What changed since the build you piloted

Your analysis rounds produced four fixes. All are shipped, regression-tested, and gate-verified.

| # | Finding (yours) | Fix (shipped) |
|---|---|---|
| 1 | `recall scars` shifted the situation fingerprint → exact-skip degraded to cautionary retry (your Priority 2) | `recalled_scars` is excluded from the fingerprint hash. Quests using `recall scars` now hard-skip on exact recurrence. Verifier check 64 + two unit tests pin it. |
| 2 | Bare `prove failed` collapsed every analyzer pattern into one (your Priority 1) | Prove-failure scars now record as `prove failed: <expression> [<kind>]` natively — e.g. `prove failed: systems_covered == in_scope_systems [equality_mismatch]`. Your script-side enrichment is no longer needed; `ScarPatternAnalyzer` discriminates out of the box. New regression test pins analyzer discrimination. |
| 3 | (Found during replay of your pilot) `vow report … --db <file>` crashed — `cmd_report` read a MockDatabase-only attribute | `cmd_report` duck-types across backends; evidence bundles now embed durable scar memory (`scar_memory` section) from SQLite/Postgres/Mongo as well. Regression test added. |
| 4 | (Found during replay) compliance test flaked on overlay filesystems | Test writes to per-test tmp dirs now. |

Avoidance logic keys on scar *context* (strategy + quest + seed), never the message text, so the message enrichment does not affect skip/caution behavior.

## 2. Please re-verify against this build

1. Unzip, then run the full gate yourself: `make verify` (runs tests + verifier v20 + delivery-integrity check against the hash manifest). Expected: `VERIFY GATE: PASS`.
2. Re-run your pilot arc (CSV and API adapters) against your existing `pilot_memory.db`. Expected, with no adapter changes:
   - the skip/caution arc behaves exactly as before (Q2 skip on rerun; Q3 caution retry → distinct scar → skip on rerun);
   - **new** failures record enriched messages natively (existing scars in the db keep their old-format messages — that's historical data, not a regression).
3. Re-run your `engine_self_analysis.py` against the corpus **without** the enrichment workaround (feed the raw message field) on any newly generated scars — patterns should discriminate natively.
4. `vow report … --db pilot_memory.db` now works; the bundle's `scar_memory` section should contain the durable scars.

## 3. Your Priority 3 — answer (and it is an answer)

We're not adding native `believe … from GET` syntax. The reason is the product: quest execution stays deterministic and replayable, secrets stay out of quest files and traces, and the evidence bundle stays independently auditable. Extraction belongs at the edge; the engine belongs behind proof.

The deployment-speed problem you're actually pointing at gets solved differently: a **standardized adapter toolkit** — config in, provenance-tagged beliefs out, new client = config not code. That is being built as a supported recipe. Your CSV/API adapter pattern is the reference implementation for it.

## 4. Margin-severity — yes, build that

Auto-remediate small `off_by`, escalate large, as a dashboard/policy layer with **no engine change** — that's correctly scoped and immediately demo-able. The engine already records everything it needs (`reason.margin.off_by` per scar). Credit for the idea is yours; it's the right next task on the domain layer.

## 5. Division of labor going forward

- **Engine (canonical, this repo):** language, transpiler, memory, verifier — changes land here, gate-verified, so there's exactly one engine.
- **Pilot/domain layer (yours):** adapters, quest templates per SOP, dashboards, deployment recipes. Your analysis rounds have produced four shipped fixes so far — keep them coming; that's the most valuable thing the pilot does for the engine.
