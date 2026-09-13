from __future__ import annotations

import json

import pytest
from pydantic import ValidationError

from app.config import Settings
from app.models import Camera, CreateProjectRequest, ShotList
from app.services.planner import ShotPlanner


BRIEF = """A courier enters a rain-soaked terminal at midnight.
She notices a silver case under the last bench.
Every departure board flickers as a figure appears in the glass.
She opens the case and warm light floods the empty station."""


def test_deterministic_plan_is_higgsfield_safe() -> None:
    planner = ShotPlanner(Settings(planner_mode="deterministic"))
    request = CreateProjectRequest(
        title="Midnight Exchange",
        scene_text=BRIEF,
        aspect_ratio="16:9",
        visual_style="Neo-Noir",
    )

    result = planner.plan(request)

    assert result.source == "deterministic"
    assert 5 <= len(result.shot_list.shots) <= 8
    assert [shot.sequence_order for shot in result.shot_list.shots] == list(
        range(1, len(result.shot_list.shots) + 1)
    )
    temperatures = {
        shot.lighting.key_light.split("locked at ")[-1]
        for shot in result.shot_list.shots
    }
    assert temperatures == {"4300K mixed cyan-and-amber balance"}
    assert all(0.4 <= shot.camera.motion_strength <= 0.7 for shot in result.shot_list.shots)
    assert all(
        "Continuity lock:" in shot.prompt for shot in result.shot_list.shots
    )


def test_focal_lengths_follow_shot_size() -> None:
    assert ShotPlanner._lens_for("Wide Establishing") == 24
    assert ShotPlanner._lens_for("Medium Character") == 50
    assert ShotPlanner._lens_for("Tight Close-Up") == 85
    assert ShotPlanner._lens_for("Insert Detail") == 85


def test_camera_rejects_invalid_motion_strength() -> None:
    with pytest.raises(ValidationError):
        Camera(
            movement_type="dolly_in",
            angle="eye level",
            lens_focal_length_mm=50,
            speed="slow",
            motion_strength=0.9,
            stabilization="locked",
            target_focal_point="subject eyes",
        )


def test_openai_schema_inlines_nested_references() -> None:
    schema = ShotPlanner._strict_response_schema(ShotList.model_json_schema())
    encoded = json.dumps(schema)

    assert "$defs" not in schema
    assert "$ref" not in encoded
    assert schema["properties"]["scene_metadata"]["type"] == "object"
    assert schema["additionalProperties"] is False
