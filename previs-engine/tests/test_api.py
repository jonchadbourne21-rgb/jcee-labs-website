from __future__ import annotations

import time
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import main
from app.config import Settings
from app.database import Database
from app.services.jobs import RenderCoordinator
from app.services.planner import ShotPlanner
from app.services.renderer import SimulatedRenderProvider


BRIEF = """A pilot waits alone inside a silent orbital tram.
The station lights shut down in sequence as a red distress signal appears.
She turns toward the observation glass and sees a ship where the moon should be."""


@pytest.fixture()
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    settings = Settings(
        database_path=tmp_path / "test.db",
        planner_mode="deterministic",
        render_provider="simulated",
        simulation_delay_seconds=0.01,
        render_concurrency=4,
    )
    database = Database(settings.database_path)
    planner = ShotPlanner(settings)
    coordinator = RenderCoordinator(
        database, SimulatedRenderProvider(0.01), settings.render_concurrency
    )
    monkeypatch.setattr(main, "settings", settings)
    monkeypatch.setattr(main, "database", database)
    monkeypatch.setattr(main, "planner", planner)
    monkeypatch.setattr(main, "coordinator", coordinator)
    with TestClient(main.app) as test_client:
        yield test_client


def wait_until_finished(client: TestClient, project_id: str) -> dict:
    for _ in range(60):
        response = client.get(f"/api/projects/{project_id}")
        assert response.status_code == 200
        project = response.json()
        if project["status"] not in {"planning", "rendering"}:
            return project
        time.sleep(0.02)
    raise AssertionError("Render jobs did not reach a terminal state")


def test_project_render_reroll_and_exports(client: TestClient) -> None:
    created = client.post(
        "/api/projects",
        json={
            "title": "Signal at Perigee",
            "scene_text": BRIEF,
            "aspect_ratio": "9:16",
            "visual_style": "Sci-Fi",
        },
    )
    assert created.status_code == 202
    project_id = created.json()["project_id"]

    finished = wait_until_finished(client, project_id)
    assert finished["status"] == "completed"
    assert all(shot["state"] == "completed" for shot in finished["shots"])
    assert all(shot["video_url"].startswith("/static/demo/") for shot in finished["shots"])

    first = finished["shots"][0]
    rerolled = client.post(
        f"/api/projects/{project_id}/shots/{first['shot_id']}/reroll", json={}
    )
    assert rerolled.status_code == 202
    second_finish = wait_until_finished(client, project_id)
    assert second_finish["shots"][0]["attempt"] == 2

    shot_list = client.get(f"/api/projects/{project_id}/shot-list.json")
    assert shot_list.status_code == 200
    assert "attachment" in shot_list.headers["content-disposition"]
    assert shot_list.json()["scene_metadata"]["aspect_ratio"] == "9:16"

    exported = client.get(f"/api/projects/{project_id}/export")
    assert exported.status_code == 200
    assert "Signal at Perigee" in exported.text
    assert "Pitch Deck" in exported.text


def test_invalid_brief_is_rejected(client: TestClient) -> None:
    response = client.post(
        "/api/projects",
        json={
            "title": "Too short",
            "scene_text": "One beat.",
            "aspect_ratio": "16:9",
            "visual_style": "35mm Film",
        },
    )
    assert response.status_code == 422
