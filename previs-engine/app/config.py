from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]


def _csv(value: str) -> tuple[str, ...]:
    return tuple(item.strip() for item in value.split(",") if item.strip())


@dataclass(frozen=True, slots=True)
class Settings:
    app_name: str = "FrameForge Pre-Visualization Engine"
    database_path: Path = ROOT_DIR / "data" / "previs.db"
    planner_mode: str = "auto"
    openai_api_key: str | None = None
    openai_base_url: str | None = None
    openai_model: str = "gpt-5-mini"
    render_provider: str = "simulated"
    simulation_delay_seconds: float = 1.2
    render_concurrency: int = 3
    higgsfield_api_key: str | None = None
    higgsfield_submit_url: str | None = None
    higgsfield_status_url_template: str | None = None
    higgsfield_model: str = "seedance_2_5"
    higgsfield_poll_interval_seconds: float = 4.0
    higgsfield_max_polls: int = 90
    cors_origins: tuple[str, ...] = ()

    @classmethod
    def from_env(cls) -> "Settings":
        database_path = Path(
            os.getenv("PREVIS_DATABASE_PATH", str(ROOT_DIR / "data" / "previs.db"))
        ).expanduser()
        return cls(
            app_name=os.getenv("PREVIS_APP_NAME", "FrameForge Pre-Visualization Engine"),
            database_path=database_path,
            planner_mode=os.getenv("PREVIS_PLANNER_MODE", "auto").strip().lower(),
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            openai_base_url=os.getenv("OPENAI_API_BASE") or os.getenv("OPENAI_BASE_URL"),
            openai_model=os.getenv("PREVIS_OPENAI_MODEL", "gpt-5-mini"),
            render_provider=os.getenv("PREVIS_RENDER_PROVIDER", "simulated").strip().lower(),
            simulation_delay_seconds=float(
                os.getenv("PREVIS_SIMULATION_DELAY_SECONDS", "1.2")
            ),
            render_concurrency=max(1, int(os.getenv("PREVIS_RENDER_CONCURRENCY", "3"))),
            higgsfield_api_key=os.getenv("HIGGSFIELD_API_KEY"),
            higgsfield_submit_url=os.getenv("HIGGSFIELD_SUBMIT_URL"),
            higgsfield_status_url_template=os.getenv("HIGGSFIELD_STATUS_URL_TEMPLATE"),
            higgsfield_model=os.getenv("HIGGSFIELD_MODEL", "seedance_2_5"),
            higgsfield_poll_interval_seconds=float(
                os.getenv("HIGGSFIELD_POLL_INTERVAL_SECONDS", "4")
            ),
            higgsfield_max_polls=max(1, int(os.getenv("HIGGSFIELD_MAX_POLLS", "90"))),
            cors_origins=_csv(os.getenv("PREVIS_CORS_ORIGINS", "")),
        )

    def validate(self) -> None:
        if self.planner_mode not in {"auto", "openai", "deterministic"}:
            raise ValueError("PREVIS_PLANNER_MODE must be auto, openai, or deterministic")
        if self.render_provider not in {"simulated", "higgsfield"}:
            raise ValueError("PREVIS_RENDER_PROVIDER must be simulated or higgsfield")
        if self.render_provider == "higgsfield":
            missing = [
                name
                for name, value in {
                    "HIGGSFIELD_API_KEY": self.higgsfield_api_key,
                    "HIGGSFIELD_SUBMIT_URL": self.higgsfield_submit_url,
                    "HIGGSFIELD_STATUS_URL_TEMPLATE": self.higgsfield_status_url_template,
                }.items()
                if not value
            ]
            if missing:
                raise ValueError(
                    "Higgsfield rendering is enabled but these variables are missing: "
                    + ", ".join(missing)
                )
