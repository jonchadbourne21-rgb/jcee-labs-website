import { useEffect, useRef } from "react";

const ALPHA = Math.SQRT2 - 1;
const TAU = Math.PI * 2;
const TRAIL = 820;
const POINTS_PER_SECOND = 42;

function traceCurlicue(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  startIndex: number,
  visiblePoints: number,
) {
  const points: Array<[number, number]> = [];
  let x = 0;
  let y = 0;
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  for (let i = 0; i < visiblePoints; i += 1) {
    const n = startIndex + i;
    const theta = TAU * ALPHA * n * n;
    x += Math.cos(theta);
    y += Math.sin(theta);
    points.push([x, y]);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  if (points.length < 2) return;

  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const padding = Math.min(width, height) * 0.12;
  const scale = Math.min(
    (width - padding * 2) / spanX,
    (height - padding * 2) / spanY,
  );
  const offsetX = (width - spanX * scale) / 2 - minX * scale;
  const offsetY = (height - spanY * scale) / 2 - minY * scale;

  ctx.clearRect(0, 0, width, height);

  const wash = ctx.createRadialGradient(
    width * 0.55,
    height * 0.48,
    0,
    width * 0.55,
    height * 0.48,
    Math.max(width, height) * 0.6,
  );
  wash.addColorStop(0, "rgba(37, 99, 235, 0.075)");
  wash.addColorStop(0.45, "rgba(37, 99, 235, 0.025)");
  wash.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  const drawPath = (lineWidth: number, alpha: number, blur: number) => {
    ctx.beginPath();
    points.forEach(([px, py], index) => {
      const dx = px * scale + offsetX;
      const dy = py * scale + offsetY;
      if (index === 0) ctx.moveTo(dx, dy);
      else ctx.lineTo(dx, dy);
    });
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = `rgba(111, 165, 255, ${alpha})`;
    ctx.shadowBlur = blur;
    ctx.shadowColor = "rgba(37, 99, 235, 0.82)";
    ctx.stroke();
  };

  drawPath(3.4, 0.12, 18);
  drawPath(1.15, 0.8, 6);
  drawPath(0.55, 0.95, 0);
  ctx.shadowBlur = 0;

  const [headX, headY] = points[points.length - 1];
  const hx = headX * scale + offsetX;
  const hy = headY * scale + offsetY;
  ctx.beginPath();
  ctx.arc(hx, hy, 2.2, 0, TAU);
  ctx.fillStyle = "rgba(226, 239, 255, 0.95)";
  ctx.shadowBlur = 14;
  ctx.shadowColor = "rgba(96, 165, 250, 0.95)";
  ctx.fill();
  ctx.shadowBlur = 0;
}

export default function CurlicueField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stage = canvas.parentElement;
    if (!stage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let startTime = performance.now();
    let lastPaint = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const paint = (now: number) => {
      if (now - lastPaint < 30) {
        frame = requestAnimationFrame(paint);
        return;
      }
      lastPaint = now;

      const elapsed = Math.max(0, now - startTime) / 1000;
      const total = Math.floor(elapsed * POINTS_PER_SECOND);
      const visible = Math.min(TRAIL, Math.max(150, total + 150));
      const start = Math.max(0, total - TRAIL + 150);
      traceCurlicue(ctx, width, height, start, visible);

      frame = requestAnimationFrame(paint);
    };

    const drawStatic = () => {
      traceCurlicue(ctx, width, height, 1880, TRAIL);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      resize();
      if (media.matches) {
        drawStatic();
      } else {
        startTime = performance.now() - 12000;
        frame = requestAnimationFrame(paint);
      }
    };

    const observer = new ResizeObserver(start);
    observer.observe(stage);
    media.addEventListener("change", start);
    start();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener("change", start);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="curlicue-canvas"
      aria-label="Animated curlicue fractal generated from an irrational quadratic phase rule"
      role="img"
    />
  );
}
