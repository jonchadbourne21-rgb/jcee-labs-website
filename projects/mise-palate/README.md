# Mise — Personal Culinary Intelligence

Mise is a working full-stack MVP that turns confirmed ingredients or a craving into a personalized, structured recipe; guides the cook with chef reasoning and recovery; forecasts sensory changes; and updates an evolving Palate Twin from the completed meal.

## What works

The current build includes managed authentication, eight-decision onboarding, photo upload, live multimodal ingredient recognition, confidence and correction, **Food Lens nutrition estimates with live USDA FoodData Central matching**, **continuous mobile barcode scanning through native BarcodeDetector with a lazy ZXing fallback**, Open Food Facts label lookup, editable private Nutrition Facts for unlisted products, quarter-serving meal logs, daily and four-week fresh-versus-packaged nutrition trends, user-controlled nutrition targets, semantic vector memory with user-scoped DAG links, one-tap plate-to-personalized-recipe generation, structured recipes, Cook Mode, recovery, Taste Forecast, favorites, preference learning, editable Chef Knowledge, fixed safety records, multi-palate resolution, analytics, and user data deletion.

## Architecture

The application uses React 19, TypeScript, Tailwind CSS, Express, tRPC, Drizzle ORM, MySQL/TiDB, private object storage, Manus OAuth, Recharts, and a browser-only ZXing fallback. AI is isolated behind server domain functions. GPT-5 mini handles vision and lightweight reasoning; GPT-5 handles structured recipe construction. Safety facts and nutrition trend aggregation are deterministic.

## Run and verify

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm dev
```

Live integration scripts require configured managed credentials:

```bash
pnpm tsx scripts/e2e-flow.ts
pnpm tsx scripts/vision-smoke.ts
pnpm tsx scripts/photo-route-smoke.ts
pnpm tsx scripts/food-lens-e2e.ts
pnpm tsx scripts/barcode-e2e.ts
```

FoodData Central uses `USDA_FDC_API_KEY` when configured. Without it, the server attempts the official public `DEMO_KEY` and degrades to clearly labeled local reference profiles when the demo quota is exhausted. A dedicated USDA key is strongly recommended for production.

## Documentation

| Document | Purpose |
|---|---|
| `docs/PRODUCT-SPEC.md` | MVP PRD, journeys, screens, data, AI behavior, safety, errors and metrics |
| `docs/ARCHITECTURE-AND-SAFETY.md` | System design, layer boundaries, privacy and cost model |
| `docs/DESIGN-SYSTEM.md` | Mobile-first visual and interaction system |
| `docs/MARKET-BUSINESS-BRIEF.md` | Skeptical market case, pricing, risks, acquisition and experiments |
| `docs/COMPETITOR-ANALYSIS.md` | Eight-product current evidence matrix with full sources |
| `docs/BUILD-LOG-AND-TEST-REPORT.md` | Completed work, receipts, failures and unresolved risks |
| `docs/DEPLOYMENT.md` | Setup, migration, publication and rollback instructions |
| `docs/cost-model.json` | Reproducible inference-cost assumptions and scale outputs |

## Current recommendation

**ITERATE.** The prototype proves technical feasibility. The next gate is a repeated-cooking experiment that compares personalized outcomes with a generic high-quality recipe and measures second and third cooks.
