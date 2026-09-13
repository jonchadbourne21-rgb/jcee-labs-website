from __future__ import annotations

import json
import sqlite3
import threading
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .models import ProjectResponse, ProjectState, ShotList, ShotPlan, ShotResponse, ShotState


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


class Database:
    def __init__(self, path: Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._write_lock = threading.RLock()

    def connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path, timeout=10, check_same_thread=False)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("PRAGMA journal_mode = WAL")
        return connection

    def initialize(self) -> None:
        with self._write_lock, self.connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    scene_text TEXT NOT NULL,
                    aspect_ratio TEXT NOT NULL,
                    visual_style TEXT NOT NULL,
                    status TEXT NOT NULL,
                    metadata_json TEXT NOT NULL,
                    planner_source TEXT NOT NULL,
                    planner_warning TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS shots (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                    sequence_order INTEGER NOT NULL,
                    shot_json TEXT NOT NULL,
                    state TEXT NOT NULL,
                    attempt INTEGER NOT NULL DEFAULT 1,
                    video_url TEXT,
                    provider_job_id TEXT,
                    render_error TEXT,
                    updated_at TEXT NOT NULL,
                    UNIQUE(project_id, sequence_order)
                );

                CREATE INDEX IF NOT EXISTS shots_project_order_idx
                    ON shots(project_id, sequence_order);
                CREATE INDEX IF NOT EXISTS shots_state_idx ON shots(state);
                """
            )

    def create_project(
        self,
        *,
        title: str,
        scene_text: str,
        aspect_ratio: str,
        visual_style: str,
        shot_list: ShotList,
        planner_source: str,
        planner_warning: str | None,
    ) -> str:
        project_id = uuid.uuid4().hex[:12]
        timestamp = utc_now()
        with self._write_lock, self.connect() as connection:
            connection.execute(
                """
                INSERT INTO projects (
                    id, title, scene_text, aspect_ratio, visual_style, status,
                    metadata_json, planner_source, planner_warning, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    project_id,
                    title,
                    scene_text,
                    aspect_ratio,
                    visual_style,
                    ProjectState.RENDERING.value,
                    shot_list.scene_metadata.model_dump_json(),
                    planner_source,
                    planner_warning,
                    timestamp,
                    timestamp,
                ),
            )
            for shot in shot_list.shots:
                connection.execute(
                    """
                    INSERT INTO shots (
                        id, project_id, sequence_order, shot_json, state, attempt, updated_at
                    ) VALUES (?, ?, ?, ?, ?, 1, ?)
                    """,
                    (
                        shot.shot_id,
                        project_id,
                        shot.sequence_order,
                        shot.model_dump_json(),
                        ShotState.PENDING.value,
                        timestamp,
                    ),
                )
        return project_id

    def get_project(self, project_id: str) -> ProjectResponse | None:
        with self.connect() as connection:
            project = connection.execute(
                "SELECT * FROM projects WHERE id = ?", (project_id,)
            ).fetchone()
            if project is None:
                return None
            shots = connection.execute(
                "SELECT * FROM shots WHERE project_id = ? ORDER BY sequence_order",
                (project_id,),
            ).fetchall()

        shot_responses: list[ShotResponse] = []
        for row in shots:
            plan = ShotPlan.model_validate_json(row["shot_json"])
            shot_responses.append(
                ShotResponse(
                    **plan.model_dump(),
                    state=row["state"],
                    attempt=row["attempt"],
                    video_url=row["video_url"],
                    provider_job_id=row["provider_job_id"],
                    render_error=row["render_error"],
                    updated_at=row["updated_at"],
                )
            )

        return ProjectResponse(
            project_id=project["id"],
            title=project["title"],
            scene_text=project["scene_text"],
            aspect_ratio=project["aspect_ratio"],
            visual_style=project["visual_style"],
            status=project["status"],
            scene_metadata=json.loads(project["metadata_json"]),
            shots=shot_responses,
            planner_source=project["planner_source"],
            planner_warning=project["planner_warning"],
            created_at=project["created_at"],
            updated_at=project["updated_at"],
            review_path=f"/review/{project_id}",
            export_path=f"/api/projects/{project_id}/export",
            shot_list_path=f"/api/projects/{project_id}/shot-list.json",
        )

    def get_shot(self, project_id: str, shot_id: str) -> tuple[ShotPlan, int] | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT shot_json, attempt FROM shots WHERE project_id = ? AND id = ?",
                (project_id, shot_id),
            ).fetchone()
        if row is None:
            return None
        return ShotPlan.model_validate_json(row["shot_json"]), row["attempt"]

    def update_shot(
        self,
        project_id: str,
        shot_id: str,
        *,
        state: ShotState,
        video_url: str | None = None,
        provider_job_id: str | None = None,
        render_error: str | None = None,
    ) -> None:
        timestamp = utc_now()
        with self._write_lock, self.connect() as connection:
            connection.execute(
                """
                UPDATE shots
                SET state = ?, video_url = ?, provider_job_id = ?, render_error = ?, updated_at = ?
                WHERE project_id = ? AND id = ?
                """,
                (
                    state.value,
                    video_url,
                    provider_job_id,
                    render_error,
                    timestamp,
                    project_id,
                    shot_id,
                ),
            )
            self._recompute_project_status(connection, project_id, timestamp)

    def reroll_shot(self, project_id: str, shot_id: str) -> bool:
        timestamp = utc_now()
        with self._write_lock, self.connect() as connection:
            cursor = connection.execute(
                """
                UPDATE shots
                SET state = ?, attempt = attempt + 1, video_url = NULL,
                    provider_job_id = NULL, render_error = NULL, updated_at = ?
                WHERE project_id = ? AND id = ?
                """,
                (ShotState.PENDING.value, timestamp, project_id, shot_id),
            )
            if cursor.rowcount == 0:
                return False
            connection.execute(
                "UPDATE projects SET status = ?, updated_at = ? WHERE id = ?",
                (ProjectState.RENDERING.value, timestamp, project_id),
            )
        return True

    def recover_incomplete(self) -> list[str]:
        timestamp = utc_now()
        with self._write_lock, self.connect() as connection:
            connection.execute(
                """
                UPDATE shots SET state = ?, render_error = NULL, updated_at = ?
                WHERE state = ?
                """,
                (ShotState.PENDING.value, timestamp, ShotState.RENDERING.value),
            )
            rows = connection.execute(
                "SELECT DISTINCT project_id FROM shots WHERE state = ?",
                (ShotState.PENDING.value,),
            ).fetchall()
            project_ids = [row["project_id"] for row in rows]
            for project_id in project_ids:
                connection.execute(
                    "UPDATE projects SET status = ?, updated_at = ? WHERE id = ?",
                    (ProjectState.RENDERING.value, timestamp, project_id),
                )
        return project_ids

    def list_pending_shot_ids(self, project_id: str) -> list[str]:
        with self.connect() as connection:
            rows = connection.execute(
                """
                SELECT id FROM shots
                WHERE project_id = ? AND state = ?
                ORDER BY sequence_order
                """,
                (project_id, ShotState.PENDING.value),
            ).fetchall()
        return [row["id"] for row in rows]

    def exact_shot_list(self, project_id: str) -> ShotList | None:
        project = self.get_project(project_id)
        if project is None:
            return None
        return ShotList(
            project_id=project.project_id,
            scene_metadata=project.scene_metadata,
            shots=[ShotPlan.model_validate(shot.model_dump(exclude={
                "state", "attempt", "video_url", "provider_job_id", "render_error", "updated_at"
            })) for shot in project.shots],
        )

    @staticmethod
    def _recompute_project_status(
        connection: sqlite3.Connection, project_id: str, timestamp: str
    ) -> None:
        rows = connection.execute(
            "SELECT state, COUNT(*) AS count FROM shots WHERE project_id = ? GROUP BY state",
            (project_id,),
        ).fetchall()
        counts: dict[str, int] = {row["state"]: row["count"] for row in rows}
        total = sum(counts.values())
        if counts.get(ShotState.PENDING.value, 0) or counts.get(ShotState.RENDERING.value, 0):
            status = ProjectState.RENDERING
        elif total and counts.get(ShotState.COMPLETED.value, 0) == total:
            status = ProjectState.COMPLETED
        elif counts.get(ShotState.COMPLETED.value, 0):
            status = ProjectState.PARTIAL
        else:
            status = ProjectState.FAILED
        connection.execute(
            "UPDATE projects SET status = ?, updated_at = ? WHERE id = ?",
            (status.value, timestamp, project_id),
        )
