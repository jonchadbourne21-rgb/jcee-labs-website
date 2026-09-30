from __future__ import annotations

from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class MovementType(StrEnum):
    DOLLY_IN = "dolly_in"
    DOLLY_OUT = "dolly_out"
    ORBIT_LEFT = "orbit_left"
    ORBIT_RIGHT = "orbit_right"
    PAN_LEFT = "pan_left"
    PAN_RIGHT = "pan_right"
    CRANE_UP = "crane_up"
    STATIC = "static"


class ShotState(StrEnum):
    PENDING = "pending"
    RENDERING = "rendering"
    COMPLETED = "completed"
    FAILED = "failed"


class ProjectState(StrEnum):
    PLANNING = "planning"
    RENDERING = "rendering"
    COMPLETED = "completed"
    PARTIAL = "partial"
    FAILED = "failed"


class Camera(StrictModel):
    movement_type: MovementType
    angle: str = Field(min_length=2, max_length=120)
    lens_focal_length_mm: int = Field(ge=18, le=135)
    speed: Literal["slow", "moderate", "fast"]
    motion_strength: float = Field(ge=0.4, le=0.7)
    stabilization: str = Field(min_length=2, max_length=120)
    target_focal_point: str = Field(min_length=2, max_length=180)


class Lighting(StrictModel):
    key_light: str = Field(min_length=2, max_length=240)
    fill_light: str = Field(min_length=2, max_length=240)
    atmosphere: str = Field(min_length=2, max_length=240)


class GenerationFlags(StrictModel):
    render_engine: Literal["higgsfield_cinematic_v2"] = "higgsfield_cinematic_v2"
    looping: bool = False
    upscale: bool = True


class SceneMetadata(StrictModel):
    scene_number: int = Field(ge=1)
    title: str = Field(min_length=1, max_length=160)
    aspect_ratio: Literal["16:9", "9:16"]
    global_aesthetic: str = Field(min_length=8, max_length=500)
    fps: Literal[24] = 24
    seed_lock: int = Field(ge=1, le=2_147_483_647)


class ShotPlan(StrictModel):
    shot_id: str = Field(pattern=r"^S\d{3}$")
    sequence_order: int = Field(ge=1)
    shot_type: str = Field(min_length=2, max_length=80)
    duration_seconds: int = Field(ge=2, le=15)
    script_context: str = Field(min_length=2, max_length=800)
    prompt: str = Field(min_length=20, max_length=4000)
    negative_prompt: str = Field(min_length=5, max_length=1200)
    camera: Camera
    lighting: Lighting
    generation_flags: GenerationFlags


class ShotList(StrictModel):
    project_id: str
    scene_metadata: SceneMetadata
    shots: list[ShotPlan] = Field(min_length=1, max_length=12)

    @field_validator("shots")
    @classmethod
    def sequence_is_contiguous(cls, shots: list[ShotPlan]) -> list[ShotPlan]:
        orders = [shot.sequence_order for shot in shots]
        if orders != list(range(1, len(shots) + 1)):
            raise ValueError("shot sequence_order values must be contiguous and ordered")
        if len({shot.shot_id for shot in shots}) != len(shots):
            raise ValueError("shot_id values must be unique")
        return shots


class CreateProjectRequest(StrictModel):
    title: str = Field(default="Untitled sequence", min_length=1, max_length=120)
    scene_text: str = Field(min_length=20, max_length=20_000)
    aspect_ratio: Literal["16:9", "9:16"] = "16:9"
    visual_style: Literal[
        "Neo-Noir", "35mm Film", "Modern Commercial", "Sci-Fi"
    ] = "35mm Film"


class ShotResponse(ShotPlan):
    state: ShotState
    attempt: int = Field(ge=1)
    video_url: str | None = None
    provider_job_id: str | None = None
    render_error: str | None = None
    updated_at: str


class ProjectResponse(StrictModel):
    project_id: str
    title: str
    scene_text: str
    aspect_ratio: Literal["16:9", "9:16"]
    visual_style: str
    status: ProjectState
    scene_metadata: SceneMetadata
    shots: list[ShotResponse]
    planner_source: str
    planner_warning: str | None = None
    created_at: str
    updated_at: str
    review_path: str
    export_path: str
    shot_list_path: str


class ApiMessage(StrictModel):
    message: str


class HealthResponse(StrictModel):
    status: Literal["ok"]
    planner_mode: str
    render_provider: str
