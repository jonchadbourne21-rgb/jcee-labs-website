import { useEffect, useRef } from "react";

const GLYPHS = ["0", "1", "A", "C", "E", "F", "2", "4", "7", "9"];

export default function HexWaveField() {
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
      const delta = Math.min(34, now - last);
      last = now;
      if (!reducedMotion.matches) time += delta * 0.001;

      ctx.clearRect(0, 0, width, height);

      const mobile = width < 720;
      const waves = mobile ? 3 : 5;
      const spacing = mobile ? 34 : 28;
      const pointCount = Math.ceil(width / spacing) + 5;

      for (let wave = 0; wave < waves; wave += 1) {
        const baseY = height * (0.18 + wave * 0.145);
        const amplitude = height * (0.045 + wave * 0.006);
        const phase = time * (0.24 + wave * 0.025) + wave * 0.9;
        const hue = wave % 2 === 0 ? "90, 255, 138" : "76, 201, 240";

        ctx.beginPath();
        for (let i = 0; i < pointCount; i += 1) {
          const x = (i - 2) * spacing;
          const normalized = x / Math.max(1, width);
          const y =
            baseY +
            Math.sin(normalized * Math.PI * (2.25 + wave * 0.32) + phase) * amplitude +
            Math.cos(normalized * Math.PI * 5.1 - phase * 0.42) * amplitude * 0.22;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${hue}, ${0.09 + wave * 0.015})`;
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
            Math.sin(normalized * Math.PI * (2.25 + wave * 0.32) + phase) * amplitude +
            Math.cos(normalized * Math.PI * 5.1 - phase * 0.42) * amplitude * 0.22;
          const glyphIndex = (i * 3 + wave * 5 + Math.floor(time * 1.1)) % GLYPHS.length;
          const pulse = 0.16 + 0.22 * (0.5 + 0.5 * Math.sin(time * 0.8 + i * 0.36 + wave));
          ctx.fillStyle = `rgba(${hue}, ${pulse})`;
          ctx.fillText(GLYPHS[glyphIndex], x, y);
        }
      }

      const scanX = ((time * 0.045) % 1.15) * width - width * 0.08;
      const gradient = ctx.createLinearGradient(scanX - 42, 0, scanX + 42, 0);
      gradient.addColorStop(0, "rgba(95,255,141,0)");
      gradient.addColorStop(0.5, "rgba(95,255,141,0.08)");
      gradient.addColorStop(1, "rgba(95,255,141,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(scanX - 42, 0, 84, height);

      frame += 1;
      if (!reducedMotion.matches || frame < 2) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    reducedMotion.addEventListener("change", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      reducedMotion.removeEventListener("change", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="hex-wave-field" aria-hidden="true" />;
}
