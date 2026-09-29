# AEGIS ClaimOS Multi-Client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven development or execute the tasks inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-shaped AEGIS ClaimOS MVP with a multi-role FastAPI domain, an installable Next.js web/PWA operations workspace, and an Expo iOS/Android field application sharing the same API.

**Architecture:** FastAPI remains the authoritative claim lifecycle, deterministic pricing, audit, and VOW settlement boundary. The Next.js client becomes the operations, adjuster, supervisor, finance, and policyholder web surface. A new Expo client provides native field and policyholder workflows with local queue persistence. All consequential financial effects remain mock instructions behind server lifecycle gates.

**Tech Stack:** Python 3.11+, FastAPI, Pydantic v2, VOW 1.1, JSON prototype persistence, Next.js 15, React 19, Tailwind CSS 3, Progressive Web App manifest/service worker, Expo SDK 54, React Native 0.81, Expo Router 6, TypeScript, AsyncStorage.

**Spec:** `docs/AEGIS_PRODUCT_SPEC.md`

## Global Constraints

The supplied deterministic pricing semantics remain unchanged and server authoritative.

The vendored VOW 1.1 core remains byte-for-byte unchanged and its manifest must continue to verify.

The demo defaults remain ZIP `75201`, deductible `$1,000`, material age `4`, and net payout `$895.51`.

A payment endpoint records a mock payment instruction only; it never moves funds.

The web application must be installable as a PWA and usable on desktop, tablet, and phone.

The native application must run through Expo on iOS, Android, and web development targets.

Every page and native screen must display the AEGIS shield-check signature mark.

All new controls require explicit loading, empty, success, and error states.

---

### Task 1: Multi-role claim domain and repository queries

**Files:**
- Modify: `backend/models.py`
- Modify: `backend/storage.py`
- Create: `backend/product.py`
- Test: `backend/tests/test_product_api.py`

**Interfaces:**
- Consumes: Existing claim dossier dictionaries and `ClaimsRepository` atomic persistence.
- Produces: `AssignmentRequest`, `TaskCreateRequest`, `NoteCreateRequest`, `WorkflowStatusRequest`, `PaymentRequest`, `DemoResetRequest`, `ClaimsRepository.list()`, and product enrichment helpers.

- [ ] **Step 1: Write failing repository and domain-model tests**

```python
def test_repository_lists_newest_claims(tmp_path):
    repository = ClaimsRepository(tmp_path / "claims.json")
    repository.create({"claim_id": "CLM_1", "created_at": "2026-09-10T00:00:00Z"})
    repository.create({"claim_id": "CLM_2", "created_at": "2026-09-11T00:00:00Z"})
    assert [row["claim_id"] for row in repository.list()] == ["CLM_2", "CLM_1"]
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `uv run --project backend pytest backend/tests/test_product_api.py -q`

Expected: failure because `ClaimsRepository.list` and the product contracts are not defined.

- [ ] **Step 3: Add strict product request contracts**

```python
class AssignmentRequest(StrictModel):
    field_adjuster_id: str | None = Field(default=None, max_length=64)
    desk_adjuster_id: str | None = Field(default=None, max_length=64)

class TaskCreateRequest(StrictModel):
    title: str = Field(min_length=1, max_length=200)
    owner_id: str = Field(min_length=1, max_length=64)
    priority: TaskPriority = TaskPriority.NORMAL
    due_at: datetime | None = None

class NoteCreateRequest(StrictModel):
    author_id: str = Field(min_length=1, max_length=64)
    body: str = Field(min_length=1, max_length=4000)
    visibility: NoteVisibility = NoteVisibility.INTERNAL

class PaymentRequest(StrictModel):
    action: PaymentAction
    method: PaymentMethod = PaymentMethod.ACH
    actor_id: str = Field(min_length=1, max_length=64)
```

- [ ] **Step 4: Add repository listing and product helpers**

`ClaimsRepository.list()` returns defensive copies sorted by `updated_at` descending. `backend/product.py` defines the immutable demo team, status transition table, task/note ID generation, portfolio aggregation, and the Kitchen Water Damage enriched seed state.

- [ ] **Step 5: Run focused tests**

Run: `uv run --project backend pytest backend/tests/test_product_api.py -q`

Expected: all Task 1 tests pass.

### Task 2: Product API and end-to-end claim lifecycle

**Files:**
- Modify: `backend/app.py`
- Modify: `backend/tests/test_claims_api.py`
- Modify: `backend/tests/test_product_api.py`

**Interfaces:**
- Consumes: Task 1 contracts and product helpers.
- Produces: dashboard, queue, team, assignment, task, note, controlled status, demo reset, and payment endpoints.

- [ ] **Step 1: Write failing API lifecycle tests**

```python
def test_demo_reset_dashboard_assignment_task_note_payment(client):
    demo = client.post("/api/demo/reset", json={}).json()
    claim_id = demo["claim_id"]
    assert client.get("/api/dashboard").json()["metrics"]["open_claims"] >= 1
    assert client.post(f"/api/claims/{claim_id}/assign", json={
        "field_adjuster_id": "USR_FIELD_01", "desk_adjuster_id": "USR_DESK_01"
    }).status_code == 200
    task = client.post(f"/api/claims/{claim_id}/tasks", json={
        "title": "Confirm dry standard", "owner_id": "USR_FIELD_01", "priority": "HIGH"
    }).json()["tasks"][-1]
    assert client.post(f"/api/claims/{claim_id}/tasks/{task['task_id']}/complete", json={
        "actor_id": "USR_FIELD_01"
    }).status_code == 200
```

- [ ] **Step 2: Run focused tests and confirm route failures**

Run: `uv run --project backend pytest backend/tests/test_product_api.py -q`

Expected: `404` responses for the new routes.

- [ ] **Step 3: Implement dashboard and queue routes**

`GET /api/dashboard` returns `metrics`, `status_distribution`, `recent_activity`, and `team_workload`. `GET /api/claims` applies exact status/assignee filters, case-insensitive insured/address/policy/claim search, bounded `limit <= 100`, and stable offset pagination.

- [ ] **Step 4: Implement collaboration and workflow routes**

Assignment, task, note, and status mutations append audit events and update `updated_at`. The transition table allows `SUBMITTED -> IN_REVIEW`, `IN_REVIEW -> APPROVED`, `APPROVED -> PAYMENT_SCHEDULED`, `PAYMENT_SCHEDULED -> PAID`, and `PAID -> CLOSED`. Settlement approval continues to occur only through `/approve` and VOW.

- [ ] **Step 5: Implement payment preconditions**

`POST /payment` rejects non-approved claims with `409`. `SCHEDULE` stores a deterministic mock instruction and changes the status to `PAYMENT_SCHEDULED`. `MARK_SENT` requires an existing scheduled instruction and changes the status to `PAID`. No provider request is made.

- [ ] **Step 6: Implement demo reset**

`POST /api/demo/reset` upserts a single `CLM_DEMO_KITCHEN` claim with field and desk assignments, default tasks, notes, and the familiar intake values. The frontend can analyze, review, authorize, schedule, and close it.

- [ ] **Step 7: Run backend tests and lint**

Run: `uvx ruff check backend && uv run --project backend pytest backend/tests -q`

Expected: all backend and assurance tests pass.

### Task 3: Multi-role Next.js operations workspace

**Files:**
- Create: `frontend/lib/api.ts`
- Create: `frontend/lib/types.ts`
- Create: `frontend/components/brand-mark.tsx`
- Create: `frontend/components/app-shell.tsx`
- Create: `frontend/components/dashboard-view.tsx`
- Create: `frontend/components/claims-view.tsx`
- Create: `frontend/components/claim-workspace.tsx`
- Create: `frontend/components/policyholder-view.tsx`
- Modify: `frontend/app/page.tsx`
- Modify: `frontend/app/globals.css`

**Interfaces:**
- Consumes: Task 2 REST contracts.
- Produces: one responsive, role-aware web application with command center, claims queue, claim workspace, policyholder timeline, team workload, and finance controls.

- [ ] **Step 1: Extract shared API and types**

`api.ts` exports a typed `apiRequest<T>(path, init)` function and endpoint methods. It parses FastAPI `detail`, reports the configured base URL, and throws one `ApiError` shape. `types.ts` mirrors claim, dashboard, user, task, note, payment, estimate, and assurance payloads.

- [ ] **Step 2: Build the persistent app shell**

The shell includes the signature mark, desktop sidebar, mobile navigation, role switcher, API health indicator, command-center summary, and install action. The navigation exposes Overview, Claims, My Work, Policyholder, Finance, and Assurance.

- [ ] **Step 3: Build the operations dashboard and claim queue**

The dashboard reads `/api/dashboard`. It renders open-claim, approval, evidence-readiness, and authorized-exposure cards; a status distribution; recent activity; workload; and an exception queue. The claims view reads `/api/claims`, supports status/search filters, and opens the selected dossier.

- [ ] **Step 4: Preserve and extend the claim workspace**

Move the existing intake, evidence overlay, deterministic estimate, review, and VOW authorization UI into `claim-workspace.tsx`. Add assignments, tasks, notes, audit timeline, lifecycle badge, and finance actions. Every displayed metric comes from the API or an explicitly labeled demo state.

- [ ] **Step 5: Build the policyholder view**

Render plain-language claim status, assigned contact, loss details, requested tasks, evidence count, estimate milestone, authorization milestone, and payment milestone. Do not show internal notes or internal-only audit details.

- [ ] **Step 6: Build states and responsive behavior**

All views render loading skeletons, empty states, recoverable errors, mobile layouts, keyboard focus indicators, and reduced-motion behavior.

- [ ] **Step 7: Validate the web application**

Run: `pnpm --dir frontend typecheck && pnpm --dir frontend build`

Expected: TypeScript and production build pass without errors.

### Task 4: Installable Progressive Web App

**Files:**
- Create: `frontend/app/manifest.ts`
- Create: `frontend/components/pwa-register.tsx`
- Create: `frontend/public/sw.js`
- Create: `frontend/public/favicon.svg`
- Create: `frontend/public/favicon.ico`
- Create: `frontend/public/apple-touch-icon.png`
- Create: `frontend/public/icon-192.png`
- Create: `frontend/public/icon-512.png`
- Modify: `frontend/app/layout.tsx`
- Modify: `frontend/next.config.ts`

**Interfaces:**
- Consumes: Task 3 web shell.
- Produces: installable standalone web application with branded icons and a conservative offline shell.

- [ ] **Step 1: Create the shield-check source icon and raster variants**

Use navy `#10233d`, cyan `#18c3cc`, warm paper `#f7f5ef`, and a simplified shield/check that remains recognizable at 16 pixels. The Apple icon uses an opaque background.

- [ ] **Step 2: Define manifest metadata**

`manifest.ts` returns `name: "AEGIS ClaimOS"`, `short_name: "AEGIS"`, `display: "standalone"`, `start_url: "/"`, brand colors, and 192/512 icons including a maskable purpose.

- [ ] **Step 3: Register the service worker**

The service worker caches only the app shell and static assets. API requests use network-first behavior and are never cached as authoritative claim responses. A safe offline page explains that claim actions require reconnection.

- [ ] **Step 4: Add metadata and validation**

`layout.tsx` declares the manifest, icons, Apple web-app settings, and theme color. Build the frontend and verify the manifest, service worker, and icon files exist.

### Task 5: Expo native field and policyholder app

**Files:**
- Create: `mobile/package.json`
- Create: `mobile/app.config.ts`
- Create: `mobile/tsconfig.json`
- Create: `mobile/babel.config.js`
- Create: `mobile/metro.config.js`
- Create: `mobile/app/_layout.tsx`
- Create: `mobile/app/(tabs)/_layout.tsx`
- Create: `mobile/app/(tabs)/index.tsx`
- Create: `mobile/app/(tabs)/claims.tsx`
- Create: `mobile/app/(tabs)/inbox.tsx`
- Create: `mobile/app/claim/[id].tsx`
- Create: `mobile/components/screen-container.tsx`
- Create: `mobile/components/brand-mark.tsx`
- Create: `mobile/components/claim-card.tsx`
- Create: `mobile/lib/api.ts`
- Create: `mobile/lib/offline-queue.ts`
- Create: `mobile/lib/types.ts`
- Create: `mobile/theme.config.js`
- Create: `mobile/global.css`
- Create: `mobile/tailwind.config.js`
- Create: `mobile/assets/images/*`

**Interfaces:**
- Consumes: Task 2 REST contracts and `EXPO_PUBLIC_API_URL`.
- Produces: native iOS/Android app source and a web-development target with assignment, claim detail, checklist, note, and demo-claim actions.

- [ ] **Step 1: Scaffold Expo SDK 54 with typed routes**

Use Expo Router, NativeWind, React Query, AsyncStorage, haptics, image picker, and safe-area support. Configure package identifiers `com.jceelabs.aegisclaimos` and the `aegisclaimos` deep-link scheme.

- [ ] **Step 2: Build the role-aware home and claims tabs**

The home screen displays the signature mark, current demo role, workload counts, next inspection, and API health. The claims tab uses `FlatList`, loads `/api/claims`, supports pull-to-refresh, and opens `/claim/[id]`.

- [ ] **Step 3: Build claim detail and field actions**

The claim screen displays policyholder-safe or adjuster detail according to role, assignment, estimate summary, tasks, timeline, and evidence count. Field users can add a note, complete a task, trigger analysis, and capture a photo selection for local queued upload metadata.

- [ ] **Step 4: Add an offline action queue**

Persist note/task actions with AsyncStorage when the API is unreachable. Show pending count and retry actions. The MVP does not pretend that local photo bytes reached the server; queued photo metadata remains visibly pending until a future object-storage upload service is configured.

- [ ] **Step 5: Validate mobile source**

Run: `pnpm --dir mobile check && pnpm --dir mobile lint && pnpm --dir mobile build:web`

Expected: TypeScript, Expo lint, and static web export pass.

### Task 6: Integrated launch, documentation, and end-to-end verification

**Files:**
- Modify: `start.sh`
- Create: `start-all.sh`
- Modify: `.gitignore`
- Modify: `README.md`
- Create: `mobile/README.md`
- Modify: `frontend/README.md`
- Modify: `backend/README.md`
- Modify: `docs/AEGIS_PRODUCT_SPEC.md`

**Interfaces:**
- Consumes: All prior tasks.
- Produces: reproducible startup commands, a complete demo, documentation, and verified source control delivery.

- [ ] **Step 1: Preserve the existing web launcher**

`start.sh` continues to start FastAPI, the VOW worker, and Next.js. `start-all.sh` adds the Expo web/native development server on `MOBILE_PORT=8081` and coordinates process cleanup.

- [ ] **Step 2: Document exact setup and device networking**

Document web/PWA startup, Expo Go startup, emulator commands, `EXPO_PUBLIC_API_URL`, physical-device LAN requirements, demo reset, API routes, product roles, and the difference between a mock payment instruction and real disbursement.

- [ ] **Step 3: Run all automated checks**

```bash
uv run --project backend pytest backend/tests
pnpm --dir frontend typecheck
pnpm --dir frontend build
pnpm --dir mobile check
pnpm --dir mobile lint
pnpm --dir mobile build:web
pnpm check
pnpm test
pnpm build
bash -n start.sh start-all.sh
cd vendor/vow-1.1 && sha256sum -c CAUSAL-EFFECTS-MANIFEST.sha256
```

- [ ] **Step 4: Run live end-to-end verification**

Start the full stack on alternate ports. Reset the demo, load dashboard/queue/team, analyze the kitchen claim, add and complete a task, add a note, authorize the exact `$895.51` settlement through VOW, schedule and mark the mock payment sent, close the claim, download the evidence pack, and verify its signature and journal chain.

- [ ] **Step 5: Review and deliver**

Scan staged content for secrets, verify generated data and signing keys are ignored, create focused commits, push `feat/ai-claims-platform`, update PR #17, and report any external release blockers such as Apple/Google signing credentials or production identity and database configuration.
