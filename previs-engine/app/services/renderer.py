from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any

import httpx

from ..config import Settings
from ..models import ShotPlan


@dataclass(slots=True)
class RenderResult:
    video_url: str
    provider_job_id: str


class RenderProvider:
    async def generate(
        self, shot: ShotPlan, aspect_ratio: str, attempt: int
    ) -> RenderResult:
        raise NotImplementedError


class SimulatedRenderProvider(RenderProvider):
    def __init__(self, delay_seconds: float):
        self.delay_seconds = max(0, delay_seconds)

    async def generate(
        self, shot: ShotPlan, aspect_ratio: str, attempt: int
    ) -> RenderResult:
        jitter = (shot.sequence_order % 3) * 0.16
        await asyncio.sleep(self.delay_seconds + jitter)
        clip = ((shot.sequence_order + attempt - 2) % 4) + 1
        return RenderResult(
            video_url=f"/static/demo/demo-{clip}.mp4?take={attempt}",
            provider_job_id=f"sim-{shot.shot_id.lower()}-{attempt}",
        )


class HiggsfieldRenderProvider(RenderProvider):
    """Generic adapter for Higgsfield's documented asynchronous request lifecycle.

    Higgsfield model payloads can vary. The submit and status endpoints are therefore
    configured as full URLs while this adapter sends a stable cinematic payload and
    tolerates common response envelopes.
    """

    TERMINAL_FAILURES = {"failed", "error", "cancelled", "canceled", "rejected"}
    TERMINAL_SUCCESSES = {"completed", "succeeded", "success", "ready"}

    def __init__(self, settings: Settings):
        self.settings = settings

    async def generate(
        self, shot: ShotPlan, aspect_ratio: str, attempt: int
    ) -> RenderResult:
        headers = {
            "Authorization": f"Bearer {self.settings.higgsfield_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.settings.higgsfield_model,
            "prompt": shot.prompt,
            "negative_prompt": shot.negative_prompt,
            "aspect_ratio": aspect_ratio,
            "duration_seconds": shot.duration_seconds,
            "seed": attempt,
            "camera": shot.camera.model_dump(mode="json"),
            "generation_flags": shot.generation_flags.model_dump(mode="json"),
        }
        timeout = httpx.Timeout(60, connect=15)
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            response = await client.post(
                str(self.settings.higgsfield_submit_url), headers=headers, json=payload
            )
            response.raise_for_status()
            submitted = response.json()
            job_id = self._first(
                submitted,
                ("id",),
                ("job_id",),
                ("data", "id"),
                ("data", "job_id"),
                ("request_id",),
            )
            if not job_id:
                raise RuntimeError("Higgsfield submit response did not include a job id")

            for _ in range(self.settings.higgsfield_max_polls):
                await asyncio.sleep(self.settings.higgsfield_poll_interval_seconds)
                status_url = str(self.settings.higgsfield_status_url_template).format(
                    job_id=job_id
                )
                status_response = await client.get(status_url, headers=headers)
                status_response.raise_for_status()
                body = status_response.json()
                status = str(
                    self._first(body, ("status",), ("data", "status")) or ""
                ).lower()
                if status in self.TERMINAL_FAILURES:
                    reason = self._first(
                        body,
                        ("error",),
                        ("message",),
                        ("data", "error"),
                        ("data", "message"),
                    )
                    raise RuntimeError(f"Higgsfield generation failed: {reason or status}")
                if status in self.TERMINAL_SUCCESSES:
                    video_url = self._first(
                        body,
                        ("video_url",),
                        ("output_url",),
                        ("result", "url"),
                        ("output", "url"),
                        ("data", "video_url"),
                        ("data", "output", "url"),
                        ("data", "result", "url"),
                    )
                    if not video_url:
                        raise RuntimeError(
                            "Higgsfield job completed without a video URL in the response"
                        )
                    return RenderResult(str(video_url), str(job_id))

        raise TimeoutError(
            f"Higgsfield job {job_id} did not finish after "
            f"{self.settings.higgsfield_max_polls} polls"
        )

    @staticmethod
    def _first(payload: Any, *paths: tuple[str, ...]) -> Any:
        for path in paths:
            current = payload
            for key in path:
                if not isinstance(current, dict) or key not in current:
                    current = None
                    break
                current = current[key]
            if current not in (None, ""):
                return current
        return None


def build_render_provider(settings: Settings) -> RenderProvider:
    if settings.render_provider == "higgsfield":
        return HiggsfieldRenderProvider(settings)
    return SimulatedRenderProvider(settings.simulation_delay_seconds)
