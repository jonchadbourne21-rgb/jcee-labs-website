from __future__ import annotations

import asyncio
import json
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles

from .config import ROOT_DIR, Settings
from .database import Database
from .models import ApiMessage, CreateProjectRequest, HealthResponse, ProjectResponse
from .services.exporter import export_pitch_html
from .services.jobs import RenderCoordinator
from .services.planner import ShotPlanner
from .services.renderer import build_render_provider


load_dotenv(ROOT_DIR / ".env")
settings = Settings.from_env()
settings.validate()
database = Database(settings.database_path)
planner = ShotPlanner(settings)
renderer = build_render_provider(settings)
coordinator = RenderCoordinator(database, renderer, settings.render_concurrency)
STATIC_DIR = ROOT_DIR / "app" / "static"


@asynccontextmanager
async def lifespan(_: FastAPI):
    database.initialize()
    await coordinator.recover()
    yield
    await coordinator.shutdown()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="A lightweight cinematic pre-visualization and client pitch engine.",
    lifespan=lifespan,
)

if settings.cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        planner_mode=settings.planner_mode,
        render_provider=settings.render_provider,
    )


@app.post(
    "/api/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def create_project(payload: CreateProjectRequest) -> ProjectResponse:
    try:
        result = await asyncio.to_thread(planner.plan, payload)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unable to create the shot plan: {exc}",
        ) from exc

    project_id = database.create_project(
        title=payload.title,
        scene_text=payload.scene_text,
        aspect_ratio=payload.aspect_ratio,
        visual_style=payload.visual_style,
        shot_list=result.shot_list,
        planner_source=result.source,
        planner_warning=result.warning,
    )
    await coordinator.start_project(project_id)
    project = database.get_project(project_id)
    if project is None:
        raise HTTPException(status_code=500, detail="Project creation did not persist")
    return project


@app.get("/api/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str) -> ProjectResponse:
    project = database.get_project(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.post(
    "/api/projects/{project_id}/shots/{shot_id}/reroll",
    response_model=ApiMessage,
    status_code=status.HTTP_202_ACCEPTED,
)
async def reroll_shot(project_id: str, shot_id: str) -> ApiMessage:
    if database.get_project(project_id) is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await coordinator.reroll(project_id, shot_id):
        raise HTTPException(status_code=404, detail="Shot not found")
    return ApiMessage(message=f"{shot_id} queued for a new render")


@app.get("/api/projects/{project_id}/shot-list.json")
async def download_shot_list(project_id: str) -> JSONResponse:
    shot_list = database.exact_shot_list(project_id)
    if shot_list is None:
        raise HTTPException(status_code=404, detail="Project not found")
    filename = f"{project_id}-shot-list.json"
    return JSONResponse(
        content=shot_list.model_dump(mode="json"),
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/projects/{project_id}/export")
async def export_project(project_id: str, request: Request) -> HTMLResponse:
    project = database.get_project(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    base_url = str(request.base_url)
    package = export_pitch_html(project, base_url)
    filename = f"{project_id}-pitch-deck.html"
    return HTMLResponse(
        content=package,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/review/{project_id}", include_in_schema=False)
async def review_page(project_id: str) -> FileResponse:
    if database.get_project(project_id) is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/", include_in_schema=False)
async def dashboard() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/favicon.ico", include_in_schema=False)
async def favicon() -> Response:
    return Response(status_code=204)
