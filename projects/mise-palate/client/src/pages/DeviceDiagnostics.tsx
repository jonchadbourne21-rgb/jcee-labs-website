import { useAuth } from "@/_core/hooks/useAuth";
import AppShell from "@/components/product/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Focus,
  Gauge,
  HelpCircle,
  Loader2,
  Play,
  RotateCcw,
  Smartphone,
  Sparkles,
  StopCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Trial = {
  id: number;
  barcode: string;
  durationMs: number;
  engine: "native" | "zxing";
  timestamp: string;
};

type TrackCapabilitiesLike = {
  focusMode?: string[];
  torch?: boolean;
};

function detectPlatformAndBrowser() {
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const platform = isIOS ? "Apple iOS" : isAndroid ? "Android" : "Desktop/Other";

  let browser = "Browser";
  if (/CriOS|Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = "Google Chrome";
  else if (/FxiOS|Firefox/i.test(ua)) browser = "Mozilla Firefox";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Mobile Safari";
  else if (/Edg/i.test(ua)) browser = "Microsoft Edge";

  const defaultLabel = isIOS ? "iPhone" : isAndroid ? "Android Phone" : "Test Camera";
  return { platform, browser, defaultLabel };
}

export default function DeviceDiagnostics() {
  useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const env = useMemo(detectPlatformAndBrowser, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);
  const zxingControlsRef = useRef<{ stop: () => void } | null>(null);

  const [deviceLabel, setDeviceLabel] = useState(env.defaultLabel);
  const [testNotes, setTestNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "starting" | "ready" | "timing">("idle");
  const [engine, setEngine] = useState<"native" | "zxing" | "unavailable">("unavailable");
  const [cameraStartMs, setCameraStartMs] = useState<number | null>(null);
  const [capabilities, setCapabilities] = useState<{
    focusSupported: boolean;
    continuousFocusSupported: boolean;
    torchSupported: boolean;
    rearCameraSelected: boolean;
    videoWidth: number | null;
    videoHeight: number | null;
  }>({
    focusSupported: false,
    continuousFocusSupported: false,
    torchSupported: false,
    rearCameraSelected: false,
    videoWidth: null,
    videoHeight: null,
  });

  const [trials, setTrials] = useState<Trial[]>([]);
  const trialStartRef = useRef<number | null>(null);
  const activeTrialRef = useRef(false);

  const diagnosticsQuery = trpc.barcode.deviceDiagnostics.useQuery();
  const recordMutation = trpc.barcode.recordDeviceDiagnostic.useMutation({
    onSuccess: async () => {
      await utils.barcode.deviceDiagnostics.invalidate();
      toast.success("Device diagnostics submitted and recorded");
    },
    onError: error => toast.error(error.message),
  });

  const stopCamera = useCallback(() => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    zxingControlsRef.current?.stop();
    zxingControlsRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    activeTrialRef.current = false;
    trialStartRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  async function startCamera() {
    stopCamera();
    setStatus("starting");
    const t0 = performance.now();

    if (!navigator.mediaDevices?.getUserMedia) {
      setEngine("unavailable");
      setStatus("idle");
      toast.error("Camera API not available in this browser context.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack?.getSettings?.() || {};
      const trackCaps = (videoTrack?.getCapabilities?.() || {}) as TrackCapabilitiesLike;
      const focusModes = trackCaps.focusMode || [];

      setCapabilities({
        focusSupported: focusModes.length > 0,
        continuousFocusSupported: focusModes.includes("continuous"),
        torchSupported: Boolean(trackCaps.torch),
        rearCameraSelected: settings.facingMode === "environment" || !settings.facingMode,
        videoWidth: settings.width || null,
        videoHeight: settings.height || null,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const startupDuration = Math.round(performance.now() - t0);
      setCameraStartMs(startupDuration);

      const NativeDetector = (window as unknown as { BarcodeDetector?: new () => { detect: (v: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector;
      if (NativeDetector) {
        setEngine("native");
        const detector = new NativeDetector();
        let lastFrame = 0;
        const loop = async (timestamp: number) => {
          if (videoRef.current && timestamp - lastFrame > 90 && videoRef.current.readyState >= 2) {
            lastFrame = timestamp;
            if (activeTrialRef.current && trialStartRef.current) {
              try {
                const results = await detector.detect(videoRef.current);
                const raw = results[0]?.rawValue?.replace(/[^0-9]/g, "");
                if (raw && [8, 12, 13, 14].includes(raw.length)) {
                  handleSuccessfulDetection(raw);
                }
              } catch {
                // Ignore transient frame errors
              }
            }
          }
          animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
      } else {
        setEngine("zxing");
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        zxingControlsRef.current = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: "environment" } } },
          videoRef.current!,
          result => {
            if (activeTrialRef.current && trialStartRef.current && result) {
              const raw = result.getText().replace(/[^0-9]/g, "");
              if ([8, 12, 13, 14].includes(raw.length)) {
                handleSuccessfulDetection(raw);
              }
            }
          }
        );
      }

      setStatus("ready");
      toast.success(`Camera active (${startupDuration} ms startup)`);
    } catch (error) {
      stopCamera();
      toast.error(error instanceof Error ? error.message : "Failed to access camera.");
    }
  }

  function beginTimedTrial() {
    if (status !== "ready") return;
    activeTrialRef.current = true;
    trialStartRef.current = performance.now();
    setStatus("timing");
    toast.info("Point camera directly at any product barcode now!");
  }

  function handleSuccessfulDetection(barcode: string) {
    if (!trialStartRef.current) return;
    const durationMs = Math.round(performance.now() - trialStartRef.current);
    activeTrialRef.current = false;
    trialStartRef.current = null;
    setStatus("ready");

    setTrials(current => [
      ...current,
      {
        id: current.length + 1,
        barcode,
        durationMs,
        engine: engine === "native" ? "native" : "zxing",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    toast.success(`Scan caught in ${durationMs} ms (${barcode})`);
  }

  function resetTrials() {
    setTrials([]);
    activeTrialRef.current = false;
    trialStartRef.current = null;
    if (status === "timing") setStatus("ready");
  }

  const trialDurations = trials.map(t => t.durationMs);
  const medianMs = useMemo(() => {
    if (!trialDurations.length) return null;
    const sorted = [...trialDurations].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }, [trialDurations]);

  function submitTelemetry() {
    recordMutation.mutate({
      deviceLabel,
      platform: env.platform,
      browser: env.browser,
      engine: engine,
      cameraStartMs,
      firstDetectionMs: trials[0]?.durationMs ?? null,
      trialCount: trials.length,
      successfulTrials: trials.length,
      trialDetectionMs: trialDurations,
      focusSupported: capabilities.focusSupported,
      continuousFocusSupported: capabilities.continuousFocusSupported,
      torchSupported: capabilities.torchSupported,
      rearCameraSelected: capabilities.rearCameraSelected,
      videoWidth: capabilities.videoWidth,
      videoHeight: capabilities.videoHeight,
      notes: testNotes.trim() || null,
    });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8 pb-16">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow">Hardware Telemetry</span>
            <Smartphone className="size-4 text-copper-deep" />
          </div>
          <h1 className="mt-2 font-display text-4xl">Camera Focus & Detection Speed Test</h1>
          <p className="mt-2 text-sm leading-6 text-muted-ink">
            Run this tool on physical iPhone (Safari/Chrome) and Android devices to verify auto-focus hardware capabilities and measure actual frame detection latency across repeated trials.
          </p>
        </div>

        {/* Device Info & Controls */}
        <section className="surface p-6 sm:p-8">
          <h2 className="font-display text-2xl">1. Test Device Identity</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-bold text-muted-ink">Device Label</label>
              <Input
                value={deviceLabel}
                onChange={e => setDeviceLabel(e.target.value)}
                placeholder="e.g. iPhone 15 Pro, Pixel 8"
                className="mt-1 h-11 rounded-xl bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-ink">Reported OS</label>
              <div className="mt-1 flex h-11 items-center rounded-xl border border-ink/10 bg-black/5 px-3 text-xs font-semibold">
                {env.platform}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-ink">Reported Browser</label>
              <div className="mt-1 flex h-11 items-center rounded-xl border border-ink/10 bg-black/5 px-3 text-xs font-semibold">
                {env.browser}
              </div>
            </div>
          </div>
        </section>

        {/* Live Camera Viewfinder & Capability Inspection */}
        <section className="surface p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">2. Hardware Inspection & Latency Probe</h2>
            {status !== "idle" && (
              <Button size="sm" variant="outline" onClick={stopCamera} className="rounded-full text-xs">
                <StopCircle className="mr-1.5 size-3.5 text-rose-500" /> Stop Camera
              </Button>
            )}
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            {/* Viewfinder */}
            <div className="relative overflow-hidden rounded-2xl border border-ink/15 bg-black">
              <video
                ref={videoRef}
                muted
                playsInline
                className="h-80 w-full object-cover"
                aria-label="Diagnostics camera feed"
              />
              {status === "idle" && (
                <div className="absolute inset-0 grid place-items-center bg-black/75 p-6 text-center text-white">
                  <div>
                    <Camera className="mx-auto size-8 text-copper" />
                    <p className="mt-3 font-display text-xl">Camera Standby</p>
                    <p className="mt-1 text-xs text-white/60">Open rear camera to query focus modes & resolution</p>
                    <Button onClick={startCamera} className="mt-4 rounded-full bg-copper text-ink font-bold">
                      <Play className="mr-2 size-4" /> Start Camera
                    </Button>
                  </div>
                </div>
              )}
              {status === "starting" && (
                <div className="absolute inset-0 grid place-items-center bg-black/60 text-white">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Loader2 className="size-4 animate-spin text-copper" /> Requesting stream...
                  </div>
                </div>
              )}
              {status === "timing" && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center bg-copper/10">
                  <div className="animate-pulse rounded-2xl border-2 border-copper p-8 text-center text-white shadow-[0_0_24px_rgba(240,157,92,0.6)]">
                    <p className="font-display text-2xl font-black text-copper">TIMING SCAN...</p>
                    <p className="text-xs text-white/90">Bring barcode into frame</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hardware Capability Sheet */}
            <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-ink/10 bg-white/40 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-ink">Hardware Telemetry</p>
                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-ink/5 pb-2">
                    <span className="flex items-center gap-1.5 font-medium text-muted-ink">
                      <Focus className="size-3.5" /> Auto-Focus Mode
                    </span>
                    <span className="font-bold">
                      {capabilities.continuousFocusSupported ? (
                        <span className="text-emerald-700">Continuous Auto-Focus</span>
                      ) : capabilities.focusSupported ? (
                        <span className="text-amber-700">Manual / Tap</span>
                      ) : (
                        <span className="text-muted-ink">Fixed / Restricted</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-ink/5 pb-2">
                    <span className="flex items-center gap-1.5 font-medium text-muted-ink">
                      <Gauge className="size-3.5" /> Decoder Engine
                    </span>
                    <span className="font-bold uppercase tracking-wider">
                      {engine === "native" ? (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[0.65rem] text-emerald-800">Native BarcodeDetector</span>
                      ) : engine === "zxing" ? (
                        <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[0.65rem] text-sky-800">ZXing WebAssembly</span>
                      ) : (
                        "Pending"
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-ink/5 pb-2">
                    <span className="flex items-center gap-1.5 font-medium text-muted-ink">
                      <Clock className="size-3.5" /> Camera Startup
                    </span>
                    <span className="font-mono font-bold">
                      {cameraStartMs !== null ? `${cameraStartMs} ms` : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-ink/5 pb-2">
                    <span className="flex items-center gap-1.5 font-medium text-muted-ink">
                      <Sparkles className="size-3.5" /> Stream Resolution
                    </span>
                    <span className="font-mono font-bold">
                      {capabilities.videoWidth && capabilities.videoHeight ? `${capabilities.videoWidth} × ${capabilities.videoHeight}` : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: Trigger Timed Probe */}
              <div className="pt-2">
                <Button
                  onClick={beginTimedTrial}
                  disabled={status !== "ready"}
                  className="h-12 w-full rounded-xl bg-ink font-bold text-white shadow-md disabled:opacity-40"
                >
                  <Activity className="mr-2 size-4 text-copper" /> Measure Barcode Detection Speed
                </Button>
                <p className="mt-1.5 text-center text-[0.65rem] text-muted-ink">
                  Starts high-resolution timer until barcode is cleanly parsed
                </p>
              </div>
            </div>
          </div>

          {/* Trials History Table */}
          <div className="mt-8 border-t border-ink/10 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl">Recorded Detection Trials</h3>
                <p className="text-xs text-muted-ink">Run 3+ trials to verify focus settling latency</p>
              </div>
              {trials.length > 0 && (
                <Button size="sm" variant="ghost" onClick={resetTrials} className="text-xs text-muted-ink">
                  <RotateCcw className="mr-1 size-3" /> Reset
                </Button>
              )}
            </div>

            {trials.length > 0 ? (
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-4 rounded-lg bg-ink/5 p-2 text-[0.68rem] font-bold uppercase tracking-wider text-muted-ink">
                  <span>Trial</span>
                  <span>Barcode</span>
                  <span>Duration</span>
                  <span>Engine</span>
                </div>
                {trials.map(trial => (
                  <div key={trial.id} className="grid grid-cols-4 items-center rounded-xl border border-ink/5 bg-white/70 p-3 text-xs">
                    <span className="font-bold">#{trial.id}</span>
                    <span className="font-mono text-muted-ink">{trial.barcode}</span>
                    <span className="font-mono font-bold text-copper-deep">{trial.durationMs} ms</span>
                    <span className="uppercase text-[0.65rem] font-semibold text-muted-ink">{trial.engine}</span>
                  </div>
                ))}

                <div className="mt-4 flex items-center justify-between rounded-2xl bg-copper/15 p-4 text-xs font-bold text-copper-deep">
                  <span>Median Detection Speed:</span>
                  <span className="text-base font-mono">{medianMs} ms</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-ink/15 p-6 text-center text-xs text-muted-ink">
                No trials run yet. Tap “Measure Barcode Detection Speed” and aim at any package barcode.
              </div>
            )}
          </div>
        </section>

        {/* Submission Form */}
        <section className="surface p-6 sm:p-8">
          <h2 className="font-display text-2xl">3. Save Telemetry Log</h2>
          <p className="mt-1 text-xs text-muted-ink">
            Persist this device profile into your account database to compare latency benchmarks across physical test phones.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-ink">Field Notes (Optional)</label>
              <Input
                value={testNotes}
                onChange={e => setTestNotes(e.target.value)}
                placeholder="e.g. Tested in low warm kitchen lighting; focus settled immediately."
                className="mt-1 h-11 rounded-xl bg-white"
              />
            </div>

            <Button
              onClick={submitTelemetry}
              disabled={recordMutation.isPending || trials.length === 0}
              className="h-12 w-full rounded-full bg-emerald-800 font-bold text-white hover:bg-emerald-900 disabled:opacity-40"
            >
              {recordMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
              Save Diagnostic Report ({trials.length} trials)
            </Button>
          </div>
        </section>

        {/* Prior Saved Logs */}
        {diagnosticsQuery.data && diagnosticsQuery.data.length > 0 && (
          <section className="surface p-6 sm:p-8">
            <h2 className="font-display text-2xl">Historical Device Telemetry</h2>
            <div className="mt-4 divide-y divide-ink/10">
              {diagnosticsQuery.data.map(item => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm text-ink">{item.deviceLabel}</p>
                      <p className="text-[0.68rem] text-muted-ink">
                        {item.platform} · {item.browser} · {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-mono font-bold">
                      {item.medianDetectionMs ? `${item.medianDetectionMs} ms median` : "No trials"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[0.65rem]">
                    <span className="rounded bg-black/5 px-2 py-0.5">Engine: {item.engine}</span>
                    <span className="rounded bg-black/5 px-2 py-0.5">Startup: {item.cameraStartMs}ms</span>
                    <span className="rounded bg-black/5 px-2 py-0.5">Focus: {item.continuousFocusSupported ? "Continuous" : item.focusSupported ? "Basic" : "Fixed"}</span>
                    {item.notes && <span className="italic text-muted-ink">“{item.notes}”</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
