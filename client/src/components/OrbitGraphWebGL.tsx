import { useEffect, useRef, useState } from "react";
import graph from "../generated/worldlab-orbit-graph.json";

/** Decorative, browser-local graph. The J sculpture beneath uses Rust-compiled mesh assets.
 * This graph never reads permissions, receipts, or production telemetry.
 */
const NODES = graph.nodes;

type ShaderKind = "vertex" | "fragment";
function compile(gl: WebGL2RenderingContext, kind: ShaderKind, source: string) {
  const shader = gl.createShader(kind === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function OrbitGraphWebGL({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [selected, select] = useState(0);
  const [renderer, setRenderer] = useState<"webgl2" | "fallback">("fallback");
  const selectedRef = useRef(selected);
  const pausedRef = useRef(paused);
  const requestFrameRef = useRef<(() => void) | null>(null);
  useEffect(() => { selectedRef.current = selected; requestFrameRef.current?.(); }, [selected]);
  useEffect(() => { pausedRef.current = paused; requestFrameRef.current?.(); }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const area = areaRef.current;
    if (!canvas || !area) return;
    let gl: WebGL2RenderingContext | null = null;
    try { gl = canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "low-power" }); } catch { /* no GPU context */ }
    if (!gl) return;
    const gpu = gl;
    const vert = compile(gpu, "vertex", `#version 300 es
      in vec2 a_position;
      uniform float u_time;
      uniform float u_point_size;
      uniform int u_selected;
      out float v_energy;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        int index = gl_VertexID;
        float highlight = u_point_size > 1.0 && index == u_selected ? 1.0 : 0.0;
        v_energy = 0.45 + highlight * 0.52 + 0.08 * sin(u_time * 2.3 + float(index));
        gl_PointSize = u_point_size > 1.0 ? u_point_size * (1.0 + highlight * 0.22) : 1.0;
      }`);
    const frag = compile(gpu, "fragment", `#version 300 es
      precision mediump float;
      uniform bool u_nodes;
      in float v_energy;
      out vec4 fragColor;
      void main() {
        if (u_nodes) {
          vec2 uv = gl_PointCoord * 2.0 - 1.0;
          float r = length(uv);
          if (r > 1.0) discard;
          float core = 1.0 - smoothstep(0.04, 0.28, r);
          float halo = (1.0 - smoothstep(0.34, 1.0, r)) * 0.30;
          fragColor = vec4(0.42, 0.73, 1.0, (core + halo) * v_energy);
        } else {
          fragColor = vec4(0.40, 0.72, 0.97, 0.30);
        }
      }`);
    if (!vert || !frag) { if (vert) gpu.deleteShader(vert); if (frag) gpu.deleteShader(frag); return; }
    const program = gpu.createProgram();
    if (!program) return;
    gpu.attachShader(program, vert); gpu.attachShader(program, frag);
    gpu.linkProgram(program);
    gpu.deleteShader(vert); gpu.deleteShader(frag);
    if (!gpu.getProgramParameter(program, gpu.LINK_STATUS)) { gpu.deleteProgram(program); return; }
    const buffer = gpu.createBuffer();
    if (!buffer) { gpu.deleteProgram(program); return; }
    const location = gpu.getAttribLocation(program, "a_position");
    const timeLoc = gpu.getUniformLocation(program, "u_time");
    const selectedLoc = gpu.getUniformLocation(program, "u_selected");
    const sizeLoc = gpu.getUniformLocation(program, "u_point_size");
    const nodeLoc = gpu.getUniformLocation(program, "u_nodes");
    const positions = NODES.flatMap(node => [node.x, node.y]);
    const edges = graph.edges.flatMap(pair => pair.flatMap(index => [NODES[index].x, NODES[index].y]));
    let frame = 0;
    let offscreen = false;
    let yawOffset = 0;
    let dragging = false;
    let pointerX = 0;
    let elapsed = 0;
    let last = 0;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resize = () => {
      const rect = area.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      gpu.viewport(0, 0, canvas.width, canvas.height);
    };
    const paint = (now: number) => {
      frame = 0;
      if (!document.hidden && !offscreen) {
        if (!motion.matches && !pausedRef.current) elapsed += Math.min(now - (last || now), 50) / 1000;
        last = now;
        gpu.clearColor(0, 0, 0, 0); gpu.clear(gpu.COLOR_BUFFER_BIT);
        gpu.enable(gpu.BLEND); gpu.blendFunc(gpu.SRC_ALPHA, gpu.ONE_MINUS_SRC_ALPHA);
        gpu.useProgram(program);
        gpu.bindBuffer(gpu.ARRAY_BUFFER, buffer);
        gpu.enableVertexAttribArray(location);
        gpu.vertexAttribPointer(location, 2, gpu.FLOAT, false, 0, 0);
        const shift = Math.sin(yawOffset) * .07;
        const graphEdges = edges.map((v, i) => i % 2 === 0 ? v + shift : v);
        const graphNodes = positions.map((v, i) => i % 2 === 0 ? v + shift : v);
        gpu.uniform1f(timeLoc, elapsed);
        gpu.uniform1i(selectedLoc, selectedRef.current);
        gpu.bufferData(gpu.ARRAY_BUFFER, new Float32Array(graphEdges), gpu.DYNAMIC_DRAW);
        gpu.uniform1i(nodeLoc, 0); gpu.uniform1f(sizeLoc, 1); gpu.drawArrays(gpu.LINES, 0, 6);
        gpu.bufferData(gpu.ARRAY_BUFFER, new Float32Array(graphNodes), gpu.DYNAMIC_DRAW);
        gpu.uniform1i(nodeLoc, 1); gpu.uniform1f(sizeLoc, 26 * Math.min(window.devicePixelRatio || 1, 1.5));
        gpu.drawArrays(gpu.POINTS, 0, 3);
      }
      if (!document.hidden && !offscreen && !motion.matches && !pausedRef.current) frame = requestAnimationFrame(paint);
    };
    const requestPaint = () => { if (!frame) frame = requestAnimationFrame(paint); };
    requestFrameRef.current = requestPaint;
    const target = area.closest("figure") ?? area;
    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest("button")) return;
      dragging = true; pointerX = event.clientX;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      yawOffset += (event.clientX - pointerX) * .006;
      pointerX = event.clientX; requestPaint();
    };
    const onPointerUp = () => { dragging = false; };
    target.addEventListener("pointerdown", onPointerDown);
    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerup", onPointerUp);
    target.addEventListener("pointercancel", onPointerUp);
    const observer = new IntersectionObserver(entries => {
      offscreen = !(entries[0]?.isIntersecting ?? false);
      if (!offscreen) requestPaint();
    });
    observer.observe(canvas);
    const sizing = new ResizeObserver(() => { resize(); requestPaint(); });
    sizing.observe(area);
    const onMotion = () => { requestPaint(); };
    const onVisibility = () => { if (!document.hidden) requestPaint(); };
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    resize(); setRenderer("webgl2"); requestPaint();
    return () => {
      cancelAnimationFrame(frame);
      requestFrameRef.current = null;
      sizing.disconnect(); observer.disconnect();
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      target.removeEventListener("pointerdown", onPointerDown);
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerup", onPointerUp);
      target.removeEventListener("pointercancel", onPointerUp);
      gpu.deleteBuffer(buffer); gpu.deleteProgram(program);
    };
  }, []);
  return (
    <div className="wl-orbit-webgl" ref={areaRef} data-orbit-renderer={renderer}>
      <canvas className="wl-orbit-webgl-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="wl-orbit-node-controls" role="group" aria-label="Explore illustrative workflow states">
        {NODES.map((node, index) => (
          <button
            type="button"
            key={node.label}
            aria-pressed={selected === index}
            onMouseEnter={() => { selectedRef.current = index; select(index); requestFrameRef.current?.(); }}
            onFocus={() => { selectedRef.current = index; select(index); requestFrameRef.current?.(); }}
            onClick={() => { selectedRef.current = index; select(index); requestFrameRef.current?.(); }}
            title={`Inspect ${node.label.toLowerCase()} node`}
          >{node.label}</button>
        ))}
      </div>
      <span className="wl-orbit-explainer" role="status">FIG. 001 / {NODES[selected].label} / GRAPH STUDY</span>
    </div>
  );
}
