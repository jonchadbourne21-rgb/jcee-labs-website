# Mise — MVP Product Specification

**Author:** Manus AI  
**Version:** 1.0  
**Date:** 12 September 2026  
**Status:** Implemented and verified MVP

## 1. Product decision

**Mise is a personal culinary-intelligence product, not a recipe generator.** Its first release tests one causal loop:

> A person presents ingredients or a craving, confirms what the system understood, chooses a direction shaped by a sensory preference model, cooks with chef-level cues and recovery, and leaves one lightweight outcome signal that changes the next recommendation.

The MVP is intentionally narrower than the full vision. It implements camera-first discovery, Palate Twin calibration and learning, structured recipe generation, guided Cook Mode, substitutions, Taste Forecast, recipe memory, authoritative safety rules, editable Chef Knowledge, and a functional multi-palate demonstration. It does not implement a social network, grocery delivery, nutrition coaching, smart-appliance control, public recipe marketplace, or generated technique video.

## 2. Target customer and job

The initial customer is an **ambitious home cook** who cooks several times per week, values restaurant-quality outcomes, and lacks professional-chef intuition. This user can follow instructions but struggles with judgment: how hard to brown, when a texture is ready, how to recover a sauce, what a substitution changes, and how to adapt a recipe for their own preferences.

The primary job is:

> “Given what I have, how I like to eat, and what is happening in my kitchen right now, help me choose and execute the version of this food I will enjoy most.”

## 3. Scope and priorities

| Priority | Capability | MVP status | Why it belongs |
|---|---|---:|---|
| P0 | Authentication and user identity | Complete | Makes personalization and history durable. |
| P0 | Eight-decision Palate Twin calibration | Complete | Establishes a useful prior without a long survey. |
| P0 | Photo upload and live ingredient recognition | Complete | Tests the camera-first entry hypothesis. |
| P0 | Confidence and ingredient correction | Complete | Prevents silent vision assumptions. |
| P0 | Four meaningfully different recipe directions | Complete | Replaces generic result lists with a decision. |
| P0 | Structured personalized recipe | Complete | Creates a reliable object for cooking, memory, safety, and future versioning. |
| P0 | Guided Cook Mode | Complete | Tests whether chef cues improve execution. |
| P0 | In-progress recovery and substitutions | Complete | Preserves a cook when reality changes. |
| P0 | Meal completion, rating, and preference update | Complete | Closes the product’s learning loop. |
| P0 | Recipe memory and history | Complete | Makes personalization cumulative. |
| P0 | Fixed safety rule enforcement | Complete | Prevents generated culinary judgment from overriding authoritative facts. |
| P1 | Taste Forecast | Complete | Tests the key differentiation claim. |
| P1 | Editable Chef Knowledge library | Complete | Creates a real chef-review workflow outside application code. |
| P1 | Geometry-only knife-cut guides | Complete | Demonstrates the safe technique boundary. |
| P1 | Multi-palate conflict resolution | Demonstrated | Validates the data model without delaying the core loop. |
| P1 | Voice recovery input | Browser-dependent | Uses native speech recognition when supported and falls back to typing. |
| P2 | Recipe forks and rich version comparison | Deferred | The schema supports parent recipe and version fields; the full editor is not required to test retention. |
| P2 | Pantry memory, meal planning, grocery delivery, nutrition, social, appliances | Deferred | These increase scope without testing the core hypothesis. |

## 4. Core user journeys

### 4.1 First use

A user signs in, completes eight visual food comparisons, optionally records restrictions and disliked ingredients, and receives an initial Palate Twin. Each choice creates dimension-level values, confidence, and an immutable signal record. The onboarding message sets the correct expectation: the model is provisional and becomes more reliable through actual cooking outcomes.

### 4.2 Camera or text discovery

The user takes or selects a photo, lists ingredients, or states a craving. A photo is uploaded to managed object storage and sent to the vision adapter. Every detected item includes a confidence score, quantity hint, and `needsConfirmation` flag. The interface always presents a review screen before recipe generation. The user can edit, remove, or add ingredients. An unclear image must produce explicit uncertainty instead of fabricated ingredients.

### 4.3 Choosing the outcome

After confirmation, Mise returns four directions that differ in cuisine, method, sensory shape, or effort. Each option explains why it fits the current Palate Twin. The system does not present ten near-duplicate recipes. The selected option becomes input to the higher-capability structured-recipe reasoning call.

### 4.4 Recipe review and forecast

The recipe view separates the chef rationale, mise en place, ingredients, sequence, sensory profile, substitutions, and fixed safety records. The user can ask what a proposed change will do. Taste Forecast returns bounded directional changes, confidence, a reason for each sensory delta, recommended actions, and cautions.

### 4.5 Cook Mode and recovery

Cook Mode presents one step at a time with large controls, optional timer, temperature, visual cue, smell cue, texture cue, the reason for the step, a common mistake, and a recovery. If reality diverges, the user can type or speak a problem. The recovery service uses the current step, recipe structure, Chef Knowledge, and fixed safety records. It does not force a restart unless safety requires stopping.

### 4.6 Completion and learning

At completion, the user chooses Loved it, Good, Okay, or Not for me, then selects at most four useful adjustments. The preference-learning function makes a bounded update weighted by rating and existing confidence. The previous value, new value, confidence change, direction, weight, recipe, and feedback record remain in history.

## 5. Screen inventory

| Route | Purpose | Primary states |
|---|---|---|
| `/` | Public positioning or signed-in camera-first home | Loading, signed out, uncalibrated, calibrated, recent recipe, empty history |
| `/onboarding` | Palate Twin calibration | Eight decisions, profile details, saving, validation error |
| `/discover` | Capture and ingredient confirmation | Photo, text, craving, analyzing, review, correction, options, generating, error |
| `/recipe/:id` | Structured recipe and pre-cook reasoning | Loading, full recipe, favorite, forecast, substitution, not found |
| `/cook/:id` | Active guided cooking session | Step, timer, recovery drawer, voice fallback, safety gate, completion rating |
| `/cook` | Queue or empty Cook Mode | Recent recipes, no recipe available |
| `/saved` | Searchable recipe memory | Loading, populated, favorite filter, empty, no search results |
| `/me` | Palate Twin, controls, signals, privacy, household demo | Loading, profile, editing, match result, erasure |
| `/knowledge` | Transparent reviewed knowledge library | Filtered library, cut guide, owner editor, loading |

## 6. Structured data model

| Entity | Durable role | Important fields |
|---|---|---|
| `users` | Authenticated identity | OAuth ID, role, display metadata |
| `palate_profiles` | Current preference estimate | 12 sensory dimensions, per-dimension confidence, restrictions, dislikes, equipment, meals learned from |
| `palate_signals` | Historical learning ledger | Dimension, direction, weight, before/after values, confidence, source, recipe and feedback references |
| `ingredient_scans` | Confirmed vision or text input | Source, storage key, image URL, original input, ingredient objects, confirmation status |
| `recipes` | Living structured recipe object | Parent/version, ingredients, equipment, mise en place, steps, safety, sensory profile, substitutions, plating, generation mode |
| `cooking_sessions` | Active or completed execution | Recipe, step, status, recovery log, timestamps |
| `meal_feedback` | Lightweight outcome evidence | Rating, adjustments, note, recipe and session |
| `chef_knowledge` | Chef-editable reviewed facts and principles | Type, slug, structured content, source, review status, editability |
| `analytics_events` | Behavioral success measurement | Event name, properties, optional user, timestamp |

All generated recipes are stored as distinct typed fields. The application does not rely on a single markdown blob. Time is stored as database timestamps and returned as structured dates by the API.

## 7. AI behavior contract

| Operation | Current model | Required behavior | Deterministic boundary |
|---|---|---|---|
| Image recognition | GPT-5 mini | Identify visible food, score confidence, expose uncertainty | User confirmation is mandatory; fallback marks every item uncertain. |
| Recipe directions | GPT-5 mini | Return four distinct outcomes shaped by palate, time, equipment, and restrictions | Strict schema and reviewed fallback options. |
| Structured recipe | GPT-5 with low reasoning | Produce technique-aware sequence, cues, reasons, failure modes, and recovery | Strict schema; fixed safety rules are attached after generation. |
| Substitution | GPT-5 mini | Preserve ingredient function and explain sensory/method tradeoff | Cannot weaken safety or claim allergy safety. |
| Taste Forecast | GPT-5 mini | Return bounded sensory deltas with confidence and rationale | Deltas constrained to −30…30; cannot change safety rules. |
| Cook recovery | GPT-5 mini | Preserve progress and provide immediate actions | Current authoritative rules are supplied and enforced after generation. |

A model-provider outage produces a visible `safe_fallback` generation mode rather than silently failing or inventing a capability. Model selection is isolated in the server adapter and uses the live catalog, making migration to another compatible provider practical.

## 8. Safety behavior

The product separates **culinary preference**, **chef-reviewed technique**, **generated situational judgment**, and **authoritative food-safety requirements**. Safety records are not produced by the model. They are selected deterministically from ingredient and recipe context, then attached to the recipe and relevant Cook Mode steps.

The implemented safety library covers poultry, ground meat, whole cuts with rest time, seafood, leftovers and refrigeration timing, cross-contamination, and the nine major U.S. allergens. Temperature language is sourced from FoodSafety.gov and USDA guidance; allergen boundaries are sourced from the U.S. Food and Drug Administration.[1] [2] [3]

Knife knowledge is stored as chef-reviewed cut geometry and safety text. The interface uses abstract target shapes and dimensions. It does not generate arbitrary images of blades contacting hands.

## 9. Error and uncertainty states

| Failure | Product response |
|---|---|
| Unsupported or oversized image | Reject before inference and explain accepted formats and 8 MB limit. |
| Unclear image | Show low confidence and an explicit request for a clearer image or manual correction. |
| Vision provider failure | Return a conservative fallback with every item requiring confirmation. |
| Structured generation failure | Produce the reviewed fallback recipe and label its generation mode. |
| Missing database | Return a server error; do not pretend changes persisted. |
| Missing recipe or session | Return typed `NOT_FOUND` and a clear route back. |
| Voice recognition unavailable | Explain that the browser cannot listen and keep text input available. |
| Safety conflict | Preserve the authoritative rule and append a safety correction. |
| Empty recipe history | Explain the first useful action rather than presenting a blank grid. |
| Unauthorized Chef Knowledge edit | Return `FORBIDDEN`; public reading remains available. |

## 10. Metrics

The north-star metric is **completed cooking sessions per active user**. The event model records `palate_calibrated`, `ingredient_photo_analyzed`, `ingredient_text_entered`, `ingredients_confirmed`, `recipe_options_generated`, `recipe_generated`, `cooking_session_started`, `cook_recovery_used`, `taste_forecast_used`, `meal_completed`, and `meal_rated`.

The executive funnel is first recipe generated → first cooking session started → first meal completed → meal rated → second cook → third cook. Supporting metrics include recipe save/favorite behavior, seven-day return, thirty-day return, correction rate for image results, recovery completion, forecast use, and the share of recommendations tied to prior signals.

## 11. Acceptance gates

The MVP is technically complete when authentication, calibration, photo storage, vision confidence, correction, four options, structured generation, Cook Mode, recovery, substitution, saving, rating, preference update, history, safety enforcement, and data deletion all pass automated or integration verification. It is **not** commercially validated until users cook repeatedly and can distinguish the personalized result from a generic recipe app.

## References

[1]: https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures "Safe Minimum Internal Temperatures"
[2]: https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/steps-keep-food-safe "USDA FSIS Keep Food Safe"
[3]: https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies "U.S. Food and Drug Administration Food Allergies"
