import { afterEach, describe, expect, it, vi } from "vitest";
import { createEvidenceCore } from "./evidenceCore";

afterEach(() => vi.unstubAllGlobals());

describe("decorative 3D artwork lifecycle", () => {
  it("falls back cleanly when a drawing context is unavailable", () => {
    expect(createEvidenceCore({ getContext: () => null } as unknown as HTMLCanvasElement)).toBeNull();
    expect(createEvidenceCore({ getContext: () => { throw new Error("unavailable"); } } as unknown as HTMLCanvasElement)).toBeNull();
  });

  it("animates only when visible and playing, and releases observers and input on disposal", () => {
    const drawing = vi.fn();
    const gradient = { addColorStop: vi.fn() };
    const context = new Proxy({ createRadialGradient: () => gradient }, { get: (target, key) => key in target ? target[key as keyof typeof target] : drawing, set: () => true });
    const canvas = Object.assign(new EventTarget(), {
      getContext: () => context,
      getBoundingClientRect: () => ({ width: 420, height: 420 }),
      width: 0, height: 0,
    });
    const doc = Object.assign(new EventTarget(), { hidden: false });
    let visibility!: (entries: Array<{ isIntersecting: boolean }>) => void;
    const disconnectResize = vi.fn(), disconnectVisibility = vi.fn();
    const frames = new Set<number>(); let frameId = 0;
    vi.stubGlobal("window", { devicePixelRatio: 3 });
    vi.stubGlobal("document", doc);
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect = disconnectResize; });
    vi.stubGlobal("IntersectionObserver", class { constructor(cb: typeof visibility) { visibility = cb; } observe() {} disconnect = disconnectVisibility; });
    vi.stubGlobal("requestAnimationFrame", () => { frames.add(++frameId); return frameId; });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
    const core = createEvidenceCore(canvas as unknown as HTMLCanvasElement)!;
    expect(canvas.width).toBe(588); // Density is capped on high-DPI screens.
    expect(frames.size).toBe(0);
    core.setPaused(false);
    expect(frames.size).toBe(0); // Offscreen work stays suspended.
    visibility([{ isIntersecting: true }]);
    expect(frames.size).toBe(1);
    core.setPaused(true);
    expect(frames.size).toBe(0);
    core.setPaused(false);
    doc.hidden = true; doc.dispatchEvent(new Event("visibilitychange"));
    expect(frames.size).toBe(0);
    doc.hidden = false; doc.dispatchEvent(new Event("visibilitychange"));
    expect(frames.size).toBe(1);
    visibility([{ isIntersecting: false }]);
    expect(frames.size).toBe(0);
    visibility([{ isIntersecting: true }]);
    core.dispose();
    expect(frames.size).toBe(0);
    expect(disconnectResize).toHaveBeenCalledOnce();
    expect(disconnectVisibility).toHaveBeenCalledOnce();
    drawing.mockClear();
    canvas.dispatchEvent(Object.assign(new Event("keydown"), { key: "ArrowRight" }));
    expect(drawing).not.toHaveBeenCalled();
  });
});
