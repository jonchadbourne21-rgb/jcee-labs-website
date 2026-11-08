import { useEffect, useRef } from "react";
import rustWave from "../generated/worldlab-hex-wave.json";

const GLYPHS = ["0", "1", "A", "C", "E", "F", "2", "4", "7", "9"];

/** Linear interpolation over a Rust-generated 256-sample sine table. */
const RUST_WAVE_LEN = rustWave.sinLut.length;
function rustSin(angle: number): number {
  const position = (((angle / (Math.PI * 2)) % 1) + 1) % 1 * RUST_WAVE_LEN;
  const low = Math.floor(position);
  const fraction = position - low;
  return rustWave.sinLut[low] * (1 - fraction) +
    rustWave.sinLut[(low + 1) % RUST_WAVE_LEN] * fraction;
}


type HexWaveFieldProps = {
  /** Original August 18 hex wave or the cobalt WorldLab homepage restoration. */
  variant?: "classic" | "worldlab";
  className?: string;
};

export default function HexWaveField({ variant = "classic", className = "" }: HexWaveFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let visible = true;
    let lastPaint = 0;
    let disposed = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      raf = 0;
      if (disposed || !visible || document.hidden) return;
      const delta = Math.min(34, now - last);
      last = now;
      if (!reducedMotion.matches && now - lastPaint < 33) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastPaint = now;
      if (!reducedMotion.matches) time += delta * 0.001;

      ctx.clearRect(0, 0, width, height);

      const mobile = width < 720;
      const worldlab = variant === "worldlab";
      const waves = worldlab ? (mobile ? rustWave.mobileWaves : rustWave.desktopWaves) : (mobile ? 3 : 5);
      const spacing = mobile ? 34 : 28;
      const pointCount = Math.ceil(width / spacing) + 5;

      for (let wave = 0; wave < waves; wave += 1) {
        const baseY = worldlab
          ? height * (0.075 + wave * (0.85 / Math.max(1, waves - 1)))
          : height * (0.18 + wave * 0.145);
        const amplitude = worldlab
          ? Math.min(96, height * (0.042 + (wave % 3) * 0.004))
          : height * (0.045 + wave * 0.006);
        const phase = time * (0.24 + wave * 0.025) + wave * 0.9;
        const hue = worldlab
          ? rustWave.colors[wave % rustWave.colors.length]
          : (wave % 2 === 0 ? "90, 255, 138" : "76, 201, 240");

        ctx.beginPath();
        for (let i = 0; i < pointCount; i += 1) {
          const x = (i - 2) * spacing;
          const normalized = x / Math.max(1, width);
          const y =
            baseY +
            (worldlab
              ? rustSin(normalized * Math.PI * (2.25 + wave * 0.32) + phase)
              : Math.sin(normalized * Math.PI * (2.25 + wave * 0.32) + phase)) * amplitude +
            (worldlab
              ? rustSin(normalized * Math.PI * 5.1 - phase * 0.42 + Math.PI / 2)
              : Math.cos(normalized * Math.PI * 5.1 - phase * 0.42)) * amplitude * 0.22;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${hue}, ${worldlab ? 0.085 : 0.09 + wave * 0.015})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = `${mobile ? 8 : 9}px "SF Mono", ui-monospace, Menlo, Consolas, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let i = 0; i < pointCount; i += 1) {
          const x = (i - 2) * spacing;
          const normalized = x / Math.max(1, width);
          const y =
            baseY +
            (worldlab
              ? rustSin(normalized * Math.PI * (2.25 + wave * 0.32) + phase)
              : Math.sin(normalized * Math.PI * (2.25 + wave * 0.32) + phase)) * amplitude +
            (worldlab
              ? rustSin(normalized * Math.PI * 5.1 - phase * 0.42 + Math.PI / 2)
              : Math.cos(normalized * Math.PI * 5.1 - phase * 0.42)) * amplitude * 0.22;
          const alphabet = worldlab ? rustWave.glyphs : GLYPHS.join("");
          const glyphIndex = (i * 3 + wave * 5 + Math.floor(time * 1.1)) % alphabet.length;
          const pulse = (worldlab ? 0.15 : 0.16) + (worldlab ? 0.23 : 0.22) * (0.5 + 0.5 * Math.sin(time * 0.8 + i * 0.36 + wave));
          ctx.fillStyle = `rgba(${hue}, ${pulse})`;
          ctx.fillText(alphabet[glyphIndex], x, y);
        }
      }

      const scanX = ((time * 0.045) % 1.15) * width - width * 0.08;
      const gradient = ctx.createLinearGradient(scanX - 42, 0, scanX + 42, 0);
      gradient.addColorStop(0, worldlab ? "rgba(106,184,255,0)" : "rgba(95,255,141,0)");
      gradient.addColorStop(0.5, worldlab ? "rgba(106,184,255,0.055)" : "rgba(95,255,141,0.08)");
      gradient.addColorStop(1, worldlab ? "rgba(106,184,255,0)" : "rgba(95,255,141,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(scanX - 42, 0, 84, height);

      frame += 1;
      if (!reducedMotion.matches && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };

    const refresh = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = performance.now();
      lastPaint = 0;
      if (visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const handleResize = () => { resize(); refresh(); };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? true;
      refresh();
    });
    const sizeObserver = new ResizeObserver(handleResize);
    observer.observe(canvas);
    sizeObserver.observe(canvas.parentElement ?? canvas);
    resize();
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", refresh);
    reducedMotion.addEventListener("change", refresh);
    refresh();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", refresh);
      observer.disconnect();
      sizeObserver.disconnect();
      reducedMotion.removeEventListener("change", refresh);
    };
  }, [variant]);

  return <canvas ref={canvasRef} className={["hex-wave-field", className].filter(Boolean).join(" ")} aria-hidden="true" />;
}
