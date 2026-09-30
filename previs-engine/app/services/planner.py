from __future__ import annotations

import hashlib
import json
import re
from copy import deepcopy
from dataclasses import dataclass
from typing import Any

from openai import OpenAI

from ..config import Settings
from ..models import (
    Camera,
    CreateProjectRequest,
    GenerationFlags,
    Lighting,
    MovementType,
    SceneMetadata,
    ShotList,
    ShotPlan,
)


STYLE_PROFILES = {
    "Neo-Noir": {
        "aesthetic": "Neo-noir cinematic realism, deep blacks, wet reflective surfaces, restrained cyan and sodium-amber palette, precise silhouettes, subtle 35mm grain",
        "temperature": "4300K mixed cyan-and-amber balance",
    },
    "35mm Film": {
        "aesthetic": "Tactile 35mm motion-picture photography, fine organic grain, gentle halation, natural skin texture, nuanced contrast, period-neutral production design",
        "temperature": "4700K warm-neutral film balance",
    },
    "Modern Commercial": {
        "aesthetic": "Premium modern commercial cinematography, immaculate art direction, crisp natural detail, controlled highlights, elegant color separation, confident composition",
        "temperature": "5000K clean daylight balance",
    },
    "Sci-Fi": {
        "aesthetic": "Grounded cinematic science fiction, monumental scale, cool metallic surfaces, volumetric practical light, precise production design, restrained futuristic detail",
        "temperature": "4400K cool-neutral practical-light balance",
    },
}

SHOT_BLUEPRINTS = [
    ("Wide Establishing", MovementType.DOLLY_IN, "eye-level wide", "slow", 0.52),
    ("Medium Character", MovementType.PAN_RIGHT, "eye-level medium", "slow", 0.46),
    ("Insert Detail", MovementType.STATIC, "slightly high detail angle", "slow", 0.40),
    ("Tight Close-Up", MovementType.DOLLY_IN, "eye-level intimate close-up", "slow", 0.48),
    ("Over-the-Shoulder", MovementType.ORBIT_LEFT, "shoulder-height three-quarter angle", "moderate", 0.55),
    ("Wide Resolution", MovementType.CRANE_UP, "low-to-high wide angle", "slow", 0.58),
    ("Reaction Close-Up", MovementType.STATIC, "eye-level portrait angle", "slow", 0.40),
    ("Final Tableau", MovementType.DOLLY_OUT, "eye-level composed wide", "slow", 0.50),
]


@dataclass(slots=True)
class PlanningResult:
    shot_list: ShotList
    source: str
    warning: str | None = None


class ShotPlanner:
    def __init__(self, settings: Settings):
        self.settings = settings

    def plan(self, request: CreateProjectRequest) -> PlanningResult:
        if self.settings.planner_mode == "deterministic":
            return PlanningResult(self._deterministic(request), "deterministic")

        if not self.settings.openai_api_key:
            if self.settings.planner_mode == "openai":
                raise RuntimeError("OPENAI_API_KEY is required when PREVIS_PLANNER_MODE=openai")
            return PlanningResult(
                self._deterministic(request),
                "deterministic",
                "AI planner credentials were not configured; used the local continuity-safe planner.",
            )

        try:
            planned = self._openai(request)
            return PlanningResult(self._normalize(planned, request), "openai")
        except Exception as exc:
            if self.settings.planner_mode == "openai":
                raise
            warning = f"AI planning was unavailable ({type(exc).__name__}); used the deterministic fallback."
            return PlanningResult(self._deterministic(request), "deterministic", warning)

    def _openai(self, request: CreateProjectRequest) -> ShotList:
        client = OpenAI(
            api_key=self.settings.openai_api_key,
            base_url=self.settings.openai_base_url,
            timeout=60,
        )
        profile = STYLE_PROFILES[request.visual_style]
        schema = self._strict_response_schema(ShotList.model_json_schema())
        response = client.chat.completions.create(
            model=self.settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a senior cinematographer and technical pre-visualization engineer. "
                        "Return only a sequence-ordered JSON shot list matching the supplied schema. "
                        "Use only these camera movements: dolly_in, dolly_out, orbit_left, orbit_right, "
                        "pan_left, pan_right, crane_up, static. Motion strength must remain 0.4-0.7. "
                        "Use 24-28mm for wide shots, 50mm for medium shots, and 85mm for close-ups. "
                        "Repeat the same global aesthetic, exact lighting temperature, and exact character "
                        "identity descriptors in every relevant prompt. Create 4-8 editorially useful shots."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Project title: {request.title}\n"
                        f"Aspect ratio: {request.aspect_ratio}\n"
                        f"Visual style: {request.visual_style}\n"
                        f"Required global aesthetic: {profile['aesthetic']}\n"
                        f"Required lighting temperature in every shot: {profile['temperature']}\n\n"
                        f"Scene brief:\n{request.scene_text}"
                    ),
                },
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "higgsfield_shot_list",
                    "strict": True,
                    "schema": schema,
                },
            },
            max_completion_tokens=7000,
            extra_body={"reasoning": {"effort": "minimal"}},
        )
        content = response.choices[0].message.content
        if not content:
            raise RuntimeError("The planning model returned no content")
        payload = json.loads(content)
        profile = STYLE_PROFILES[request.visual_style]
        payload["project_id"] = "pending"
        payload["scene_metadata"].update(
            {
                "title": request.title,
                "aspect_ratio": request.aspect_ratio,
                "global_aesthetic": profile["aesthetic"],
                "fps": 24,
            }
        )
        for index, shot in enumerate(payload["shots"], start=1):
            shot["shot_id"] = f"S{index:03d}"
            shot["sequence_order"] = index
            shot["generation_flags"] = {
                "render_engine": "higgsfield_cinematic_v2",
                "looping": False,
                "upscale": True,
            }
        return ShotList.model_validate(payload)

    def _deterministic(self, request: CreateProjectRequest) -> ShotList:
        profile = STYLE_PROFILES[request.visual_style]
        seed = self._seed(request.scene_text, request.visual_style, request.aspect_ratio)
        contexts = self._contexts(request.scene_text)
        shot_count = min(8, max(5, len(contexts)))
        while len(contexts) < shot_count:
            contexts.append(contexts[-1])

        continuity = (
            "Continuity lock: preserve every named character's face, age, hair, wardrobe, "
            "body proportions, and carried props exactly as described in the source brief."
        )
        shots: list[ShotPlan] = []
        for index in range(shot_count):
            shot_type, movement, angle, speed, strength = SHOT_BLUEPRINTS[index]
            context = contexts[index]
            lens = self._lens_for(shot_type)
            shots.append(
                ShotPlan(
                    shot_id=f"S{index + 1:03d}",
                    sequence_order=index + 1,
                    shot_type=shot_type,
                    duration_seconds=5 if index not in {2, 6} else 4,
                    script_context=context,
                    prompt=(
                        f"{profile['aesthetic']}. {continuity} Shot {index + 1}: {context}. "
                        f"Compose a {shot_type.lower()} at {angle}, emphasizing physical action and "
                        f"story intention. Lighting remains locked to {profile['temperature']}. "
                        "Natural cinematic motion, realistic anatomy, coherent geography, production-ready frame."
                    ),
                    negative_prompt=(
                        "warped anatomy, duplicate people, identity drift, wardrobe change, prop drift, "
                        "flicker, temporal artifacts, rubber motion, rolling-shutter distortion, text, logos, "
                        "watermarks, over-sharpening, crushed facial detail"
                    ),
                    camera=Camera(
                        movement_type=movement,
                        angle=angle,
                        lens_focal_length_mm=lens,
                        speed=speed,
                        motion_strength=strength,
                        stabilization="cinematic stabilized head with natural micro-movement",
                        target_focal_point=self._focal_point(shot_type),
                    ),
                    lighting=Lighting(
                        key_light=f"Motivated directional key, locked at {profile['temperature']}",
                        fill_light=f"Controlled negative fill with subtle eye detail, locked at {profile['temperature']}",
                        atmosphere=f"Light volumetric texture and practical depth, locked at {profile['temperature']}",
                    ),
                    generation_flags=GenerationFlags(),
                )
            )

        return ShotList(
            project_id="pending",
            scene_metadata=SceneMetadata(
                scene_number=1,
                title=request.title,
                aspect_ratio=request.aspect_ratio,
                global_aesthetic=profile["aesthetic"],
                fps=24,
                seed_lock=seed,
            ),
            shots=shots,
        )

    def _normalize(self, shot_list: ShotList, request: CreateProjectRequest) -> ShotList:
        profile = STYLE_PROFILES[request.visual_style]
        continuity = (
            "Continuity lock: preserve every named character's face, age, hair, wardrobe, "
            "body proportions, and carried props exactly as described in the source brief."
        )
        normalized: list[ShotPlan] = []
        for index, source in enumerate(shot_list.shots[:12], start=1):
            shot = source.model_copy(deep=True)
            shot.shot_id = f"S{index:03d}"
            shot.sequence_order = index
            shot.camera.lens_focal_length_mm = self._lens_for(shot.shot_type)
            shot.camera.motion_strength = min(0.7, max(0.4, shot.camera.motion_strength))
            shot.prompt = (
                f"{profile['aesthetic']}. {continuity} {shot.prompt} "
                f"Lighting temperature lock: {profile['temperature']}."
            )[:4000]
            shot.lighting = Lighting(
                key_light=f"{shot.lighting.key_light}; locked at {profile['temperature']}",
                fill_light=f"{shot.lighting.fill_light}; locked at {profile['temperature']}",
                atmosphere=f"{shot.lighting.atmosphere}; locked at {profile['temperature']}",
            )
            normalized.append(shot)
        return ShotList(
            project_id="pending",
            scene_metadata=SceneMetadata(
                scene_number=shot_list.scene_metadata.scene_number,
                title=request.title,
                aspect_ratio=request.aspect_ratio,
                global_aesthetic=profile["aesthetic"],
                fps=24,
                seed_lock=shot_list.scene_metadata.seed_lock,
            ),
            shots=normalized,
        )

    @staticmethod
    def _contexts(text: str) -> list[str]:
        cleaned = re.sub(r"\r\n?", "\n", text).strip()
        blocks = [
            re.sub(r"^[\s\-*•\d.)]+", "", item).strip()
            for item in re.split(r"\n+|(?<=[.!?])\s+", cleaned)
        ]
        contexts = [item for item in blocks if len(item) >= 8]
        if not contexts:
            return [cleaned]
        return contexts[:8]

    @staticmethod
    def _lens_for(shot_type: str) -> int:
        lowered = shot_type.lower()
        if any(word in lowered for word in ("close", "portrait", "detail", "insert")):
            return 85
        if any(word in lowered for word in ("wide", "establish", "tableau", "master")):
            return 24
        return 50

    @staticmethod
    def _focal_point(shot_type: str) -> str:
        lowered = shot_type.lower()
        if "detail" in lowered or "insert" in lowered:
            return "the story-critical object and the hand interacting with it"
        if "wide" in lowered or "establish" in lowered or "tableau" in lowered:
            return "the principal subject within the environment's strongest leading line"
        return "the principal character's nearest eye and emotional action"

    @staticmethod
    def _seed(*parts: str) -> int:
        digest = hashlib.sha256("|".join(parts).encode("utf-8")).hexdigest()
        return int(digest[:8], 16) % 2_147_483_646 + 1

    @staticmethod
    def _strict_response_schema(source: dict[str, Any]) -> dict[str, Any]:
        """Convert Pydantic's reusable schema into the proxy's strict JSON dialect."""
        schema = deepcopy(source)
        definitions = schema.pop("$defs", {})

        def visit(node: Any) -> Any:
            if isinstance(node, list):
                return [visit(item) for item in node]
            if not isinstance(node, dict):
                return node
            if "$ref" in node:
                name = node["$ref"].rsplit("/", 1)[-1]
                resolved = deepcopy(definitions[name])
                resolved.update({key: value for key, value in node.items() if key != "$ref"})
                return visit(resolved)

            normalized = {
                key: visit(value)
                for key, value in node.items()
                if key not in {"default", "$defs"}
            }
            if normalized.get("type") == "object":
                properties = normalized.get("properties", {})
                normalized["required"] = list(properties)
                normalized["additionalProperties"] = False
            return normalized

        return visit(schema)
