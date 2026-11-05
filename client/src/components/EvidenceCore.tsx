import { useEffect, useRef, useState } from "react";
import { createEvidenceCore, type EvidenceCoreController } from "@/lib/evidenceCore";

export default function EvidenceCore() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<EvidenceCoreController | null>(null);
  const [paused, setPaused] = useState(true);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    if (!canvas.current) return;
    const renderer = createEvidenceCore(canvas.current);
    controller.current = renderer;
    setAvailable(Boolean(renderer));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPaused(motion.matches);
    update(); motion.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      renderer?.dispose(); controller.current = null;
    };
  }, []);
  useEffect(() => { controller.current?.setPaused(paused); }, [paused]);
  return (
    <figure className={`wl-sculpture customer-hero-sculpture${available ? " is-interactive" : ""}`} aria-label="Interactive 3D illustration">
      <div className="wl-scene-grid" aria-hidden="true" />
      <figcaption className="wl-scene-caption"><span>FIG. 001 / THE EVIDENCE CORE</span><span aria-hidden="true">+</span></figcaption>
      <canvas ref={canvas} className="wl-core" tabIndex={available ? 0 : -1} role="img" aria-label="Three interlocking metallic rings. Drag or use arrow keys to rotate this decorative 3D illustration." />
      <div className="wl-fallback-art" aria-hidden="true"><i /><i /><i /></div>
      <div className="wl-floating-label wl-label-one" aria-hidden="true"><i /><span>CURRENT AUTHORITY</span></div>
      <div className="wl-floating-label wl-label-two" aria-hidden="true"><span>PRESERVED EVIDENCE</span><i /></div>
      <div className="wl-scene-bottom"><span>{available ? "DRAG TO EXPLORE ↔" : "SCULPTURAL STUDY"}</span>{available && <div>
        <button type="button" onClick={() => controller.current?.reset()} aria-label="Reset sculpture view" title="Reset view">↺</button>
        <button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? "Play sculpture motion" : "Pause sculpture motion"} aria-pressed={paused} title={paused ? "Play motion" : "Pause motion"}>{paused ? "▷" : "Ⅱ"}</button>
      </div>}</div>
    </figure>
  );
}
