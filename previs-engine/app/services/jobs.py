from __future__ import annotations

import asyncio
import logging

from ..database import Database
from ..models import ShotState
from .renderer import RenderProvider


logger = logging.getLogger(__name__)


class RenderCoordinator:
    def __init__(
        self, database: Database, provider: RenderProvider, concurrency: int = 3
    ) -> None:
        self.database = database
        self.provider = provider
        self._semaphore = asyncio.Semaphore(max(1, concurrency))
        self._tasks: dict[tuple[str, str], asyncio.Task[None]] = {}
        self._task_lock = asyncio.Lock()

    async def recover(self) -> None:
        for project_id in self.database.recover_incomplete():
            await self.start_project(project_id)

    async def start_project(self, project_id: str) -> None:
        for shot_id in self.database.list_pending_shot_ids(project_id):
            await self.start_shot(project_id, shot_id)

    async def start_shot(self, project_id: str, shot_id: str) -> None:
        key = (project_id, shot_id)
        async with self._task_lock:
            existing = self._tasks.get(key)
            if existing and not existing.done():
                return
            task = asyncio.create_task(
                self._run_shot(project_id, shot_id),
                name=f"render:{project_id}:{shot_id}",
            )
            self._tasks[key] = task
            task.add_done_callback(lambda _: self._tasks.pop(key, None))

    async def reroll(self, project_id: str, shot_id: str) -> bool:
        if not self.database.reroll_shot(project_id, shot_id):
            return False
        await self.start_shot(project_id, shot_id)
        return True

    async def shutdown(self) -> None:
        tasks = [task for task in self._tasks.values() if not task.done()]
        for task in tasks:
            task.cancel()
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        self._tasks.clear()

    async def _run_shot(self, project_id: str, shot_id: str) -> None:
        async with self._semaphore:
            found = self.database.get_shot(project_id, shot_id)
            if found is None:
                return
            shot, attempt = found
            project = self.database.get_project(project_id)
            if project is None:
                return
            self.database.update_shot(
                project_id,
                shot_id,
                state=ShotState.RENDERING,
                provider_job_id=f"queued-{shot_id.lower()}-{attempt}",
            )
            try:
                result = await self.provider.generate(shot, project.aspect_ratio, attempt)
                self.database.update_shot(
                    project_id,
                    shot_id,
                    state=ShotState.COMPLETED,
                    video_url=result.video_url,
                    provider_job_id=result.provider_job_id,
                )
            except asyncio.CancelledError:
                self.database.update_shot(
                    project_id,
                    shot_id,
                    state=ShotState.PENDING,
                    render_error="Render paused because the server stopped.",
                )
                raise
            except Exception as exc:
                logger.exception("Shot render failed for %s/%s", project_id, shot_id)
                self.database.update_shot(
                    project_id,
                    shot_id,
                    state=ShotState.FAILED,
                    render_error=str(exc)[:500],
                )
