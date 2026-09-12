# FrameForge Pre-Visualization & Pitch Engine

FrameForge is a lightweight full-stack pre-visualization application. A director, creative producer, or agency team can paste a scene pitch, screenplay segment, or beat sheet and receive a sequence-ordered, continuity-safe shot plan while preview renders run asynchronously. The same project can be shared as a live review link, downloaded as strict Higgsfield camera JSON, or exported as a self-contained client-facing HTML pitch deck.

## Architecture

| Layer | Implementation | Responsibility |
| --- | --- | --- |
| Client | HTML5, modern CSS, vanilla JavaScript | Brief intake, horizontal shot timeline, preview playback, job polling, shot rerolls, review sharing, and exports |
| API | FastAPI and strict Pydantic models | Request validation, shot-list orchestration, project endpoints, downloads, and static delivery |
| Planning | OpenAI-compatible structured output or deterministic fallback | Decomposes the scene into a validated Higgsfield camera schema while locking style, character language, and lighting temperature |
| Jobs | Bounded in-process `asyncio` coordinator | Moves each shot through `pending`, `rendering`, `completed`, or `failed`; recovers interrupted work at startup |
| Rendering | Simulated provider or configurable Higgsfield REST adapter | Produces immediate local demo clips or submits and polls real asynchronous generation jobs |
| Storage | SQLite in WAL mode | Persists projects, shot JSON, attempts, render states, provider job IDs, errors, and cached video URLs |

The in-process runner is intentionally small and works well for single-instance deployments. For multi-instance production traffic, replace `RenderCoordinator` with a durable queue such as Redis/RQ, Celery, or a managed task service while retaining the same database state model.

## Project layout

```text
previs-engine/
├── app/
│   ├── main.py                 # FastAPI application and routes
│   ├── config.py               # Environment-driven configuration
│   ├── database.py             # SQLite persistence and state aggregation
│   ├── models.py               # Strict Pydantic/Higgsfield schemas
│   ├── services/
│   │   ├── planner.py          # AI + deterministic shot decomposition
│   │   ├── renderer.py         # Simulated + Higgsfield adapters
│   │   ├── jobs.py             # Async bounded job runner
│   │   └── exporter.py         # Standalone client pitch package
│   └── static/
│       ├── index.html
│       ├── styles.css
│       ├── app.js
│       └── demo/               # Lightweight simulated video previews
├── data/                       # Runtime database (ignored except .gitkeep)
├── tests/
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## Local launch

Python 3.11 or newer is recommended.

```bash
cd previs-engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open [http://localhost:8000](http://localhost:8000). The default configuration requires no external credentials: it uses the deterministic planner and bundled simulated previews whenever an OpenAI key is unavailable.

### Docker

```bash
cd previs-engine
cp .env.example .env
docker compose up --build
```

The named Docker volume preserves the SQLite database across container restarts.

## Configuration

Copy `.env.example` to `.env`. Secrets should never be committed.

### Planning modes

| Mode | Behavior |
| --- | --- |
| `auto` | Uses the configured OpenAI-compatible structured-output model and falls back safely to the deterministic planner if unavailable |
| `openai` | Requires an API key and fails the request if AI planning is unavailable |
| `deterministic` | Uses the local continuity-safe scene decomposition with no external call |

The default AI model is `gpt-5-mini`, selected as a cost-conscious structured-generation workhorse. Every result is revalidated by Pydantic. The planner permits only `dolly_in`, `dolly_out`, `orbit_left`, `orbit_right`, `pan_left`, `pan_right`, `crane_up`, or `static`; motion strength is constrained to `0.4–0.7`, and focal lengths are normalized to `24mm`, `50mm`, or `85mm` by shot size.

### Higgsfield rendering

The official Higgsfield API uses asynchronous submission and status checks, while request bodies can differ by selected model. Set the following variables from the current [Higgsfield API documentation](https://docs.higgsfield.ai/docs):

```dotenv
PREVIS_RENDER_PROVIDER=higgsfield
HIGGSFIELD_API_KEY=...
HIGGSFIELD_SUBMIT_URL=https://...
HIGGSFIELD_STATUS_URL_TEMPLATE=https://.../{job_id}
HIGGSFIELD_MODEL=seedance_2_5
```

`HIGGSFIELD_STATUS_URL_TEMPLATE` must contain `{job_id}`. The adapter sends prompt, negative prompt, aspect ratio, duration, camera controls, and generation flags; it tolerates common asynchronous response envelopes and caches the returned output URL in SQLite. Download completed vendor outputs to durable object storage in a production deployment because provider-hosted output retention may be limited.

## API summary

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Report configured planner and render provider |
| `POST` | `/api/projects` | Create a shot plan and queue all previews |
| `GET` | `/api/projects/{project_id}` | Read project metadata and live shot states |
| `POST` | `/api/projects/{project_id}/shots/{shot_id}/reroll` | Increment the take and queue one shot again |
| `GET` | `/api/projects/{project_id}/shot-list.json` | Download strict generation-ready JSON |
| `GET` | `/api/projects/{project_id}/export` | Download a standalone HTML pitch deck |
| `GET` | `/review/{project_id}` | Open the client review deck |

Interactive API documentation is available at `/docs`.

## Tests

```bash
cd previs-engine
source .venv/bin/activate
pytest -q
```

The suite validates strict camera constraints, focal-length normalization, continuity locks, project creation, asynchronous state completion, rerolls, JSON download, HTML export, and request validation.

With the application running, the dependency-free Chromium smoke test can also verify iPhone and Android layouts. Pass an existing project ID to validate the review deck as well as the intake screen:

```bash
node tests/responsive_check.mjs http://127.0.0.1:8000 YOUR_PROJECT_ID
```

## Production notes

Use a process manager or container platform, mount persistent storage at `/app/data`, and terminate TLS at the platform load balancer. This package is a portable Python deployment rather than a platform-specific project. The lightweight alternative is the default simulation mode, which is ideal for demos and interface review; the fully integrated mode uses the same application and state pipeline but requires active OpenAI-compatible and Higgsfield endpoint credentials.
