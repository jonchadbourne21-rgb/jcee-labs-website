/** Original procedural 3D artwork. No telemetry or execution data is used. */
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
  let yaw = -.4, pitch = -.25, auto = 0, paused = true, visible = false;
  let dragging = false, lastX = 0, lastY = 0, frame: number | null = null;
  let last = 0, width = 0, height = 0, disposed = false;
  const rotate = ([a, b, c]: Vector, x: number, y: number, z: number): Vector => {
    let co = Math.cos(x), si = Math.sin(x);
    [b, c] = [b * co - c * si, b * si + c * co];
    co = Math.cos(y); si = Math.sin(y);
    [a, c] = [a * co + c * si, -a * si + c * co];
    co = Math.cos(z); si = Math.sin(z);
    return [a * co - b * si, a * si + b * co, c];
  };
  const faces: Face[] = [];
  const configurations: Vector[] = [[.36, 0, .62], [1.38, 0, -.79], [.94, 0, 1.43]];
  // Fixed mesh bounds keep work and memory independent of viewport dimensions.
  for (let ring = 0; ring < 3; ring++) {
    const angles = configurations[ring], segments = 128, tube = 36;
    const vertex = (u: number, v: number) => rotate([
      (1.36 + .205 * Math.cos(v)) * Math.cos(u),
      .205 * Math.sin(v),
      (1.36 + .205 * Math.cos(v)) * Math.sin(u),
    ], ...angles);
    for (let i = 0; i < segments; i++) for (let j = 0; j < tube; j++) {
      const u = i * Math.PI * 2 / segments, v = j * Math.PI * 2 / tube;
      const du = Math.PI * 2 / segments, dv = Math.PI * 2 / tube;
      const points = [vertex(u, v), vertex(u + du, v), vertex(u + du, v + dv), vertex(u, v + dv)];
      const normal = rotate([Math.cos(u + du / 2) * Math.cos(v + dv / 2), Math.sin(v + dv / 2), Math.sin(u + du / 2) * Math.cos(v + dv / 2)], ...angles);
      faces.push({ points, normal, ring, seam: j === 17 });
    }
  }
  for (let i = 0; i < 36; i++) for (let j = 0; j < 18; j++) {
    const vertex = (u: number, v: number): Vector => [.38 * Math.cos(u) * Math.sin(v), .38 * Math.cos(v), .38 * Math.sin(u) * Math.sin(v)];
    const u = i * Math.PI * 2 / 36, v = j * Math.PI / 18, du = Math.PI * 2 / 36, dv = Math.PI / 18;
    faces.push({ points: [vertex(u, v), vertex(u + du, v), vertex(u + du, v + dv), vertex(u, v + dv)], normal: vertex(u + du / 2, v + dv / 2).map(x => x / .38) as Vector, ring: 3, seam: j % 4 === 0 });
  }
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
    const rx = pitch + Math.sin(auto * .7) * .07, ry = yaw + auto;
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
      const brightness = .11 + .17 * dot(n, [-.35, .7, .62]) + 1.5 * top + 1.1 * strip;
      const occlusion = face.ring === 3 ? .72 : 1;
      let r = (brightness * .96 + edge * .4) * occlusion, g = (brightness * 1.04 + edge * .64) * occlusion, b = (brightness * .98 + edge * .25) * occlusion;
      if (face.ring === 2) { r *= .91; g *= 1.02; b *= .87; }
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
    reset() { yaw = -.4; pitch = -.25; auto = 0; draw(); },
    dispose() {
      disposed = true; events.abort(); sizing.disconnect(); visibility.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null; faces.length = 0;
    },
  };
}
