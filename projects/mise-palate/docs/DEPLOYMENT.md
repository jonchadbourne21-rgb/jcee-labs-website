# Mise — Deployment and Operations

**Author:** Manus AI  
**Release target:** Managed autoscaling web application

## 1. Prerequisites

The application requires Node.js 22, pnpm 10, a MySQL-compatible database, private object storage, an OAuth application, and an OpenAI-compatible multimodal model gateway. In the managed project, `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`, and `VITE_FRONTEND_FORGE_API_KEY` are injected automatically. Configure `USDA_FDC_API_KEY` for production FoodData Central traffic. When absent, the app attempts USDA's public `DEMO_KEY`, then safely falls back to labeled generic references if the demo quota is exhausted or the service is unavailable.

Credentials must remain server-side. Do not commit `.env` files or call the model gateway from the browser.

## 2. Local installation

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

A local environment must provide equivalents for the managed database, OAuth, storage, and model variables. The client and server run together during development:

```bash
pnpm dev
```

The development server listens on port 3000. Authentication uses secure cookie state and should be tested through localhost or HTTPS.

## 3. Database migration

The authoritative Drizzle schema is `drizzle/schema.ts`. Migration `0003_fresh_wendell_vaughn.sql` adds Food Lens scans and semantic memory. Migration `0004_omniscient_firestar.sql` adds nutrition goals, explicit meal logs, and Food Lens recipe provenance. Migration `0005_tan_whizzer.sql` adds packaged food product snapshots and user packaged-food meal logs. Migration `0006_confused_killer_shrike.sql` adds private custom labels and custom food logs while converting packaged serving counts from integer to data-preserving `decimal(6,2)` values.

```bash
pnpm drizzle-kit generate
```

Review generated SQL before applying it. Production migrations should be additive by default. The current migration chain creates eighteen tables and associated indexes; it does not drop existing data.

## 4. Validation gate

A release candidate must pass:

```bash
pnpm check
pnpm test
pnpm build
```

The live integration harness requires configured database and built-in model credentials:

```bash
pnpm tsx scripts/e2e-flow.ts
pnpm tsx scripts/vision-smoke.ts
pnpm tsx scripts/photo-route-smoke.ts
pnpm tsx scripts/food-lens-e2e.ts
pnpm tsx scripts/barcode-e2e.ts
```

The scripts write receipts under `docs/test-evidence/` and delete temporary relational test data. The barcode test covers check digits, live/cached lookup, fractional packaged servings, private label creation and editing, explicit custom logging, three-source daily aggregation, fresh-versus-packaged trends, deletion, and cleanup. Camera streaming requires HTTPS or localhost and user permission. Native `BarcodeDetector` is preferred; ZXing is lazy-loaded only when native decoding is unavailable.

## 5. Managed publication

The verified project lives at `/home/ubuntu/mise-palate`. Publication uses the managed WebDev release flow. A checkpoint is required before publishing. The release checkpoint should reference the passing type check, 24-test run, production build, live integration receipts, and responsive captures.

The application uses the default autoscaling mode. It does not need an always-on process, cron schedule, WebSocket server, or reserved host. Database and object storage hold all durable state. USDA results are cached in-process for twelve hours as a latency and quota optimization; correctness does not depend on cache persistence.

## 6. Rollback and recovery

Use the final release checkpoint as the rollback boundary. Database migrations in this release only add tables. If the application must be rolled back, restore the previous code checkpoint and leave the new tables in place; they are isolated by name and do not affect the existing JCEE Labs site.

If a model provider is unavailable, the server returns labeled conservative fallbacks. If the database is unavailable, persistence mutations fail rather than reporting false success. If OAuth fails because of blocked cookies, users should use a standard browser context with cookies enabled.

## 7. Post-release monitoring

Monitor recipe-generation latency, provider errors, image rejection rate, ingredient correction rate, Cook Mode starts, meal completions, ratings, second cooks, and safety escalations. Model failures should be segmented by operation. The first operational threshold for asynchronous generation is sustained p95 structured-recipe latency above 45 seconds or a user-abandonment increase attributable to waiting.

## References

[1]: https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures "Safe Minimum Internal Temperatures"
