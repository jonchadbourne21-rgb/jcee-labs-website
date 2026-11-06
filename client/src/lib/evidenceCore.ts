/** Rust-generated JCEE WorldLab geometry. Decorative; no telemetry or execution data. */
import mesh from "../generated/worldlab-mesh.json";
type Vector = [number, number, number];
type Face = { points: Vector[]; normal: Vector; ring: number; seam: boolean };
export type EvidenceCoreController = {
  setPaused: (value: boolean) => void;
  reset: () => void;
  dispose: () => void;
};

export function createEvidenceCore(canvas: HTMLCanvasElement): EvidenceCoreController | null {
  let context: CanvasRenderingContext2D | null;
  try { context = canvas.getContext("2d"); } catch { return null; }
  if (!context) return null;
  const ctx = context;
  const events = new AbortController();
  const { signal } = events;
  let yaw = -.18, pitch = -.18, auto = 0, paused = true, visible = false;
  let dragging = false, lastX = 0, lastY = 0, frame: number | null = null;
  let last = 0, width = 0, height = 0, disposed = false;
  // Positions, topology and materials come from the checked Rust output.
  const faces: Face[] = mesh.faces.map(([a, b, c, d, material]) => {
    const vertices = [a, b, c, d].map(index => mesh.vertices[index]);
    const sum = [0, 1, 2].map(axis => vertices.reduce((total, v) => total + v[axis + 3], 0));
    const length = Math.hypot(...sum);
    return { points: vertices.map(v => v.slice(0, 3) as Vector), normal: sum.map(n => n / length) as Vector, ring: material, seam: false };
  });
  function draw() {
    if (disposed || !width || !height) return;
    ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width, height) * .29, cx = width * .5, cy = height * .49;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 2);
    glow.addColorStop(0, "rgba(96,145,61,.085)"); glow.addColorStop(1, "rgba(8,10,9,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    ctx.save(); ctx.translate(cx, cy + scale * 1.65); ctx.scale(1, .16);
    const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 1.4);
    shadow.addColorStop(0, "rgba(0,0,0,.7)"); shadow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shadow; ctx.fillRect(-scale * 2, -scale * 2, scale * 4, scale * 4); ctx.restore();
    const rx = pitch + Math.sin(auto * .7) * .10, ry = yaw + Math.sin(auto) * .42;
    const cxr = Math.cos(rx), sxr = Math.sin(rx), cyr = Math.cos(ry), syr = Math.sin(ry);
    const transform = (v: Vector): Vector => {
      const y = v[1] * cxr - v[2] * sxr, z = v[1] * sxr + v[2] * cxr;
      return [v[0] * cyr + z * syr, y, -v[0] * syr + z * cyr];
    };
    const output: { points: [number, number][]; depth: number; color: string }[] = [];
    for (const face of faces) {
      const n = transform(face.normal); if (n[2] < -.15) continue;
      const ps = face.points.map(transform), depth = ps.reduce((a, p) => a + p[2], 0) / 4;
      const points = ps.map((p): [number, number] => {
        const perspective = 5.9 / (5.9 - p[2]);
        return [cx + p[0] * scale * perspective, cy - p[1] * scale * perspective];
      });
      const reflection: Vector = [2 * n[0] * n[2], 2 * n[1] * n[2], 2 * n[2] * n[2] - 1];
      const dot = (a: Vector, b: Vector) => Math.max(0, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
      const top = Math.pow(dot(reflection, [-.42, .72, .55]), 12), strip = Math.pow(dot(reflection, [.58, .2, .79]), 34), edge = Math.pow(dot(reflection, [.85, .1, -.52]), 15);
      const brightness = .26 + .27 * dot(n, [-.35, .7, .62]) + 1.5 * top + 1.1 * strip;
      const occlusion = 1;
      let r = (brightness * .96 + edge * .4) * occlusion, g = (brightness * 1.04 + edge * .64) * occlusion, b = (brightness * .98 + edge * .25) * occlusion;
      if (face.ring === 2) { r *= .55; g *= .90; b *= .74; }
      if (face.ring === 4) { r = .60 + brightness * .3; g = .86 + brightness * .3; b = .40 + brightness * .2; }
      if (face.seam) { r *= .55; g *= .6; b *= .5; }
      const tone = (x: number) => Math.round(Math.min(255, Math.max(0, x * 220)));
      output.push({ points, depth, color: `rgb(${tone(r)},${tone(g)},${tone(b)})` });
    }
    output.sort((a, b) => a.depth - b.depth);
    for (const face of output) {
      ctx.beginPath(); ctx.moveTo(...face.points[0]);
      for (let i = 1; i < 4; i++) ctx.lineTo(...face.points[i]);
      ctx.closePath(); ctx.fillStyle = face.color; ctx.strokeStyle = face.color; ctx.lineWidth = .6; ctx.fill(); ctx.stroke();
    }
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.4);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); draw();
  }
  function tick(time: number) {
    frame = null;
    if (disposed || paused || !visible || document.hidden) return;
    if (time - last > 45) { if (!dragging) auto += Math.min(time - last, 80) * .0001; draw(); last = time; }
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; last = performance.now();
    if (!disposed && !paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  canvas.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    dragging = true; lastX = event.clientX; lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  }, { signal });
  canvas.addEventListener("pointermove", event => {
    if (!dragging) return;
    yaw += (event.clientX - lastX) * .006; pitch += (event.clientY - lastY) * .006;
    lastX = event.clientX; lastY = event.clientY; draw();
  }, { signal });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(name => canvas.addEventListener(name, () => { dragging = false; }, { signal }));
  canvas.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "ArrowLeft") yaw -= .12;
    if (event.key === "ArrowRight") yaw += .12;
    if (event.key === "ArrowUp") pitch -= .12;
    if (event.key === "ArrowDown") pitch += .12;
    draw();
  }, { signal });
  const sizing = new ResizeObserver(resize);
  sizing.observe(canvas);
  const visibility = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: .05 });
  visibility.observe(canvas);
  document.addEventListener("visibilitychange", schedule, { signal });
  resize();
  return {
    setPaused(value) { paused = value; schedule(); },
    reset() { yaw = -.18; pitch = -.18; auto = 0; draw(); },
    dispose() {
      disposed = true; events.abort(); sizing.disconnect(); visibility.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null; faces.length = 0;
    },
  };
}
