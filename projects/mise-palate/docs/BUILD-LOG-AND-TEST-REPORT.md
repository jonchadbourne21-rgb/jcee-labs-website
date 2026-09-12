# Mise — Build Log and Test Report

**Author:** Manus AI  
**Build date:** 12 September 2026  
**Recommendation:** **ITERATE**

## 1. Objective and completion gate

The objective was to build a working end-to-end MVP that tests whether structured chef reasoning, an evolving sensory preference model, and pre-change sensory forecasts create a better cooking experience than a normal recipe app.

The completion gate required executable evidence for authentication-aware onboarding, photo upload, ingredient confidence and correction, personalized options, structured recipe generation, Cook Mode, substitutions, recovery, recipe memory, ratings, preference updates, safety enforcement, editable knowledge, responsive mobile design, and deployment readiness. A report or mockup alone did not satisfy the gate.

## 2. Authoritative inputs and constraints

The build used the supplied product brief as the functional source of truth. Food-safety temperatures and storage handling were checked against FoodSafety.gov and USDA. Allergen boundaries were checked against the U.S. Food and Drug Administration.[1] [2] [3] Competitor status and pricing were researched from current first-party or official app-store sources and preserved separately.

The implementation uses managed authentication, database, object storage, and server-side model credentials. It does not access user MCP connectors. It avoids background workers, scheduled jobs, generated knife imagery, medical nutrition claims, and costly per-recipe video generation.

## 3. Completed work

| Area | Completed implementation | Evidence |
|---|---|---|
| Identity | Manus OAuth session, owner role, protected application APIs | Existing auth test plus type-checked routes |
| Palate Twin | Eight decisions, 12 sensory dimensions, confidence, historical signals, direct edits | Unit tests and live integration result |
| Vision | JPEG/PNG/WebP upload, 8 MB limit, object storage, live recognition, confidence, uncertainty | Live photo-route and vision evidence |
| Confirmation | Editable/removable/addable ingredient rows before generation | Mobile visual capture and integration correction status |
| Options | Four distinct directions using palate, restrictions, equipment, time and difficulty | Live integration returned four different live-AI options |
| Recipe | Structured ingredients, equipment, mise en place, steps, cues, reasons, failures, recoveries, substitutions, safety and plating | Live integration returned eight valid steps |
| Cook Mode | Step progression, timer, look/smell/feel cues, recovery drawer, native voice fallback | Type check, build and responsive screen implementation |
| Recovery | Live in-context repair without restart | Heavy-cream scenario returned five immediate actions |
| Taste Forecast | Bounded sensory deltas, confidence, actions and cautions | Live lemon forecast returned ten explicit dimension changes |
| Learning | Rating and optional adjustment update current profile and write immutable signal | Crunch preference moved from 79 to 86 |
| Recipe memory | Saved records, favorite state, history/search, version fields | Live integration persisted and re-read recipe ID 1 |
| Multi-palate | Shared profile and per-dimension tension strategies | Live integration resolved spice, acidity and crunch conflicts |
| Chef Knowledge | Structured seed library, review status, public inspection, owner editing | Database-backed library and UI |
| Knife boundary | Geometry-only julienne/brunoise targets with safety text | Knowledge UI and reviewed records |
| Privacy | User-triggered deletion of culinary profile, scans, recipes, sessions, feedback, signals and analytics | Protected deletion path, type check and build |
| Analytics | Events for calibration, capture, confirmation, generation, cook start, recovery, completion, rating and forecast | Database calls in routed flows |
| Food Lens | Meal recognition, editable grams, live USDA FoodData Central lookup, labeled fallback references, and source links | Live vision/USDA integration and deterministic candidate tests |
| Nutrition planning | Explicit eaten-meal logs, six user-controlled targets, daily progress, and bounded planning guidance | Database-backed integration and profile UI |
| Semantic memory | User-scoped 64-dimensional vectors, cosine retrieval, and newer-to-older DAG edges | Integration retrieval and graph persistence |
| Plate-to-recipe | Idempotent one-tap personalized structured recipe using Palate Twin, targets, memories, and Chef Knowledge | Live AI integration generated and reused one recipe ID |
| Barcode packaged foods | Continuous native camera decoding with lazy ZXing fallback, check-digit validation, Open Food Facts lookup, cached snapshots, and allergen review | Production bundle, responsive capture, and live database/API integration |
| Private labels | User-scoped editable Nutrition Facts, optional barcode, ingredients/allergens, quarter-serving logs, and deletion | Protected CRUD and integration receipt |
| Nutrition trends | Seven-day daily and four-week weekly views with fresh-versus-packaged source splits for energy, protein, fiber, and sodium | Deterministic aggregation tests and database-backed tRPC integration |

## 4. Automated verification

The final static and unit run completed successfully. TypeScript reported no errors. Vitest reported **8 files passed, 24 tests passed**. The production build completed successfully. The output was written to `docs/test-evidence/typecheck.log`, `unit-tests.log`, and `build.log`.

The unit suite verifies calibration direction, confidence changes, crispier feedback, 0–100 bounding, authoritative poultry/cross-contact/allergen attachment, correction of unsafe poultry prose, seafood versus whole-cut rules, multi-palate spice separation, and close-palate no-conflict behavior.

## 5. Live integration verification

The database-backed integration used a temporary authenticated user and cleaned it afterward. It completed calibration, corrected one ingredient, generated four live-AI directions, generated and persisted a live-AI structured recipe, started a cooking session, advanced progress, recovered from a missing ingredient, forecast extra lemon, completed and rated the meal, updated the Palate Twin, resolved a second palate, and read the persisted recipe memory.

| Check | Observed result |
|---|---|
| Calibration | Complete; acidity 73, crunch 79, spice 57 |
| Ingredient confirmation | Five items; scan state changed to `corrected` |
| Options | Four live-AI directions |
| Structured recipe | Eight steps; every step had a reason, cues, and recovery |
| Poultry safety | Fixed 165°F/74°C rule attached |
| Recovery | Missing heavy cream recovered without restart; five immediate actions |
| Taste Forecast | Medium-confidence lemon forecast with ten sensory deltas |
| Preference update | Crunch moved from 79 to 86 after “loved” + “crispier” |
| Household resolution | Shared mild base for a 42-point spice gap; lemon and crisp garnish separated per plate |
| Recipe memory | Persisted recipe was read back successfully |

The full machine-readable receipt is `docs/test-evidence/e2e-result.json`.

### Food Lens and nutrition integration

The Food Lens harness ran the complete authenticated path: multimodal photo analysis, FoodData Central resolution, user gram correction, nutrition target persistence, explicit dinner logging, local-day aggregation, semantic retrieval, live personalized recipe generation, and idempotent retry. The first live run attached five USDA references and exposed an inaccurate candidate where “lemon (half)” matched “cream, half and half.” The matcher was corrected by removing portion descriptors, normalizing plurals, requiring lexical overlap, and penalizing mismatched processed forms. Unit tests now prove that chicken thigh meat outranks skin-only records and raw lemon outranks bottled concentrate.

Subsequent calls temporarily exhausted USDA's public demo quota (`HTTP 429`, limit 10). The journey passed under that condition with labeled generic references. The final release run later attached four live USDA matches plus one labeled fallback, logged 639 estimated calories, reached 50% of the selected protein target, retrieved two related semantic memories, generated a live structured recipe, and proved idempotent recipe reuse. Production should configure `USDA_FDC_API_KEY`; rate-limit and timeout fallback is intentionally non-fatal. The receipt is `docs/test-evidence/food-lens-e2e-result.json`.

### Barcode and packaged-food integration

The barcode harness ran against a fresh temporary test user, rejected an invalid check digit, resolved Nutella (EAN `3017620422003`) through the live-or-cached Open Food Facts path, and verified cache reuse. It logged a half serving, created and edited a private granola label, logged three-quarters of a serving, and persisted a fresh Food Lens meal. Daily aggregation returned 1,049.5 kcal across all three sources. Seven-day trends classified one fresh log and two packaged logs, producing a 57% fresh and 43% packaged energy split. Every temporary log, label, scan, event, and user was removed. The receipt is `docs/test-evidence/barcode-e2e-console.log`.

## 6. Live vision verification

A clear editorial ingredient photograph produced an overall confidence of 88 and detected chicken thighs, broccoli, garlic, lemon, salt, and a likely hard aged cheese. Parmesan remained explicitly uncertain at 72 confidence. An intentionally blurred version produced overall confidence 5, no fabricated ingredient list, and a direct request for a clearer image. The exact upload route then verified object storage, live vision, database scan persistence, one uncertain item, and rejection of invalid image input. Receipts are in `vision-result.json` and `photo-route-result.json`.

## 7. Required scenario results

| Required scenario | Result | Evidence |
|---|---|---|
| Chicken thighs, broccoli, lemon, garlic, Parmesan with high acidity/crunch and moderate heat | Passed | Live vision plus live options and recipe generation |
| Unclear items must trigger confirmation | Passed | Blurred image: confidence 5, no fabricated items, explicit uncertainty |
| “I don’t have heavy cream” | Passed | Recovery preserved progress and recommended optional alternatives only after roasting |
| “Great, but chicken should be crispier” | Passed | Stored crunch moved from 79 to 86 and signal history was written |
| “What changes if I add more lemon?” | Passed | Acidity +18, richness −8, crunch −7 and seven additional explained deltas |
| Two people with different spice preferences | Passed | Shared mild base with table-side heat strategy |

## 8. Visual verification

Managed preview captures at 390 × 844 verified the authenticated home, first onboarding decision, and text discovery flow. The home rendered the camera-first hero, Palate Twin state and four-tab navigation without horizontal clipping. Onboarding rendered two large choices, progress, back, and continue controls. Discovery rendered the three-mode switcher, large text input, and bottom navigation. Detailed notes are in `docs/test-evidence/visual-qa-notes.md`.

A My Browser navigation to the sandbox preview timed out because the user browser connector and managed preview are isolated. This was recorded as a tooling limitation and not counted as a product failure.

## 9. Assumptions

The cost model assumes four completed cooks per monthly active user and one premium structured-recipe call per cook. The target user cooks often enough for memory to compound. The U.S. safety and allergen references are appropriate for this initial prototype. Editorial food images represent three fixed option families and are not dynamically generated per recipe.

## 10. Failures and corrections

The first competitor-research workflow contained an invalid JavaScript string and was rejected before any subagent ran. The corrected workflow completed all eight products without failures. The first My Browser preview navigation timed out, so responsive visual verification moved to managed preview captures. The first integration harness completed successfully but remained open because the database pool kept the process alive; an explicit process exit was added. The first lazy-route patch failed because its context did not match the formatted file; the route file was then rewritten cleanly.

## 11. Unresolved risks

The current recipe build took more than two minutes in the complete integration scenario, across multiple sequential model calls. Product p95 latency must be measured in realistic use; queued generation may be needed. The app does not yet have full recipe editing, rich forking, URL import, household invitations, offline Cook Mode, or a formal export file. The seed Chef Knowledge library is representative, not comprehensive, and must be reviewed by the available culinary professional before a public safety-sensitive beta.

The live model produced ten deltas for a lemon forecast. This is explainable but may be too dense during cooking. User testing should determine whether the interface should summarize the top three and place the rest behind disclosure. The generated recipe options were meaningfully different in method but clustered around one cuisine; diversity quality requires evaluation across more ingredient sets.

## 12. Recommendation

**ITERATE.** The build demonstrates technical coherence and real model behavior. It does not establish retention, willingness to pay, or causal superiority to a high-quality recipe. The next gate is not more code. It is evidence from repeated cooking.

## 13. Three decisive experiments

The first experiment is a blinded generic-versus-personalized meal comparison that repeats after one feedback signal. The second is a four-week second- and third-cook retention cohort with one-tap feedback. The third is a matched Chef DNA test comparing normal instructions with cues, reasons, failure modes and recovery. Product expansion should stop if these experiments do not show meaningful outcome or repeat-use gains.

## References

[1]: https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures "Safe Minimum Internal Temperatures"
[2]: https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/steps-keep-food-safe "USDA FSIS Keep Food Safe"
[3]: https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies "U.S. Food and Drug Administration Food Allergies"
