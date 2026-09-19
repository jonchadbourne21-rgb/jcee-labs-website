from __future__ import annotations

import html
from urllib.parse import urljoin

from ..models import ProjectResponse


def _escape(value: object) -> str:
    return html.escape(str(value), quote=True)


def export_pitch_html(project: ProjectResponse, base_url: str) -> str:
    cards: list[str] = []
    for shot in project.shots:
        movement = shot.camera.movement_type.value.replace("_", " ").title()
        media = (
            f'<video controls muted loop playsinline preload="metadata" src="{_escape(urljoin(base_url, shot.video_url))}"></video>'
            if shot.video_url
            else f'<div class="media-empty">{_escape(shot.state.value)} · preview unavailable</div>'
        )
        cards.append(
            f"""
            <article class="shot">
              <div class="media">{media}<span class="number">{shot.sequence_order:02d}</span></div>
              <div class="body">
                <div class="eyebrow"><span>{_escape(shot.shot_type)}</span><span>{shot.duration_seconds}s</span></div>
                <h2>{_escape(movement)} · {shot.camera.lens_focal_length_mm}mm</h2>
                <p class="context">{_escape(shot.script_context)}</p>
                <dl>
                  <div><dt>Frame</dt><dd>{_escape(shot.camera.angle)}</dd></div>
                  <div><dt>Focus</dt><dd>{_escape(shot.camera.target_focal_point)}</dd></div>
                  <div><dt>Light</dt><dd>{_escape(shot.lighting.key_light)}</dd></div>
                </dl>
                <details><summary>Generation prompt</summary><p>{_escape(shot.prompt)}</p></details>
              </div>
            </article>
            """
        )

    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{_escape(project.title)} — Pitch Deck</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&display=swap');
:root{{--ink:#101214;--paper:#f1efe9;--signal:#ff5a36;--muted:#77746d}}*{{box-sizing:border-box}}body{{margin:0;background:var(--paper);color:var(--ink);font-family:Manrope,Arial,sans-serif}}header{{padding:7vw 6vw 4vw;border-bottom:1px solid #c9c5bc}}.kicker,.eyebrow,dt{{font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.12em;font-size:11px}}h1{{font-size:clamp(42px,7vw,96px);letter-spacing:-.06em;line-height:.9;max-width:1000px;margin:22px 0}}.meta{{display:flex;gap:24px;color:var(--muted);font-size:13px}}main{{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:1px;background:#c9c5bc;border-bottom:1px solid #c9c5bc}}.shot{{background:var(--paper);min-width:0}}.media{{background:#171a1e;aspect-ratio:{_escape(project.aspect_ratio.replace(':','/'))};position:relative;overflow:hidden}}video{{width:100%;height:100%;object-fit:cover}}.media-empty{{height:100%;display:grid;place-items:center;color:#aaa;font-family:'DM Mono',monospace;text-transform:uppercase}}.number{{position:absolute;left:14px;top:12px;background:var(--signal);color:#fff;padding:6px 8px;font:500 11px 'DM Mono',monospace}}.body{{padding:26px 26px 34px}}.eyebrow{{display:flex;justify-content:space-between;color:var(--signal)}}h2{{font-size:25px;letter-spacing:-.04em;margin:12px 0}}.context{{font-size:15px;line-height:1.6;color:#494844;min-height:72px}}dl{{margin:22px 0 0;border-top:1px solid #cbc8c0}}dl div{{display:grid;grid-template-columns:70px 1fr;gap:12px;padding:10px 0;border-bottom:1px solid #d8d4cb}}dt{{color:var(--muted)}}dd{{margin:0;font-size:12px;line-height:1.5}}details{{margin-top:20px;font-size:12px}}summary{{cursor:pointer;font-family:'DM Mono',monospace;text-transform:uppercase}}details p{{line-height:1.6;color:#555}}footer{{padding:30px 6vw 60px;display:flex;justify-content:space-between;color:var(--muted);font:11px 'DM Mono',monospace;text-transform:uppercase}}@media(max-width:600px){{header{{padding:48px 22px 30px}}main{{display:block}}.shot{{border-bottom:1px solid #c9c5bc}}footer{{padding:24px 22px}}}}
</style></head><body>
<header><div class="kicker">Pre-visualization treatment · Scene {project.scene_metadata.scene_number}</div><h1>{_escape(project.title)}</h1><div class="meta"><span>{_escape(project.visual_style)}</span><span>{_escape(project.aspect_ratio)}</span><span>{len(project.shots)} shots</span><span>{sum(s.duration_seconds for s in project.shots)} sec</span></div></header>
<main>{''.join(cards)}</main>
<footer><span>{_escape(project.scene_metadata.global_aesthetic)}</span><span>FrameForge · 24 fps</span></footer>
</body></html>"""
