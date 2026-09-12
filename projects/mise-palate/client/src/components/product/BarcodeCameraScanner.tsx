import { Button } from "@/components/ui/button";
import { Barcode, Camera, CameraOff, Loader2, ScanLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type ScannerControls = { stop: () => void };
type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
};
type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

export function BarcodeCameraScanner({
  disabled = false,
  onDetected,
}: {
  disabled?: boolean;
  onDetected: (barcode: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controlsRef = useRef<ScannerControls | null>(null);
  const animationRef = useRef<number | null>(null);
  const detectedRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "starting" | "scanning">("idle");
  const [engine, setEngine] = useState<"native" | "zxing" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    controlsRef.current?.stop();
    controlsRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  }, []);

  useEffect(() => stop, [stop]);

  const emit = useCallback((rawValue: string) => {
    const digits = rawValue.replace(/[^0-9]/g, "");
    if (detectedRef.current || ![8, 12, 13, 14].includes(digits.length)) return;
    detectedRef.current = true;
    stop();
    onDetected(digits);
  }, [onDetected, stop]);

  async function start() {
    if (!videoRef.current || disabled) return;
    detectedRef.current = false;
    setError(null);
    setStatus("starting");

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("idle");
      setError("Camera access is unavailable in this browser. Enter the barcode digits instead.");
      return;
    }

    try {
      const NativeDetector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
      if (NativeDetector) {
        setEngine("native");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("scanning");
        const detector = new NativeDetector();
        let lastCheck = 0;
        const scanFrame = async (timestamp: number) => {
          if (detectedRef.current || !videoRef.current) return;
          if (timestamp - lastCheck > 120 && videoRef.current.readyState >= 2) {
            lastCheck = timestamp;
            try {
              const barcodes = await detector.detect(videoRef.current);
              const value = barcodes[0]?.rawValue;
              if (value) emit(value);
            } catch {
              // Native detector can reject transient frames; continue scanning.
            }
          }
          animationRef.current = requestAnimationFrame(scanFrame);
        };
        animationRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      setEngine("zxing");
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      controlsRef.current = await reader.decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: "environment" } } },
        videoRef.current,
        result => {
          if (result) emit(result.getText());
        }
      );
      setStatus("scanning");
    } catch (cause) {
      stop();
      const name = cause instanceof DOMException ? cause.name : "";
      setError(
        name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in your browser or enter the barcode digits."
          : name === "NotFoundError"
            ? "No rear camera was found. Enter the barcode digits instead."
            : "The camera could not start. Enter the barcode digits or try another browser."
      );
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-ink text-white">
      <div className={`relative ${status === "idle" ? "hidden" : "block"}`}>
        <video ref={videoRef} muted playsInline className="h-64 w-full bg-black object-cover" aria-label="Live barcode camera view" />
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,rgba(0,0,0,.28),transparent_30%,transparent_70%,rgba(0,0,0,.35))]">
          <div className="relative h-28 w-[78%] rounded-2xl border-2 border-copper shadow-[0_0_0_999px_rgba(0,0,0,.18)]">
            <div className="absolute left-4 right-4 top-1/2 h-px bg-copper shadow-[0_0_12px_2px_rgba(240,157,92,.7)]" />
          </div>
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1.5 text-[0.65rem] font-bold backdrop-blur">
          {status === "starting" ? "Starting camera…" : `Scanning · ${engine === "native" ? "Native" : "ZXing"}`}
        </div>
        <Button type="button" size="sm" onClick={stop} className="absolute right-3 top-3 rounded-full bg-black/65 text-white hover:bg-black">
          <CameraOff className="mr-1.5 size-3.5" /> Stop
        </Button>
      </div>

      {status === "idle" && (
        <button
          type="button"
          onClick={start}
          disabled={disabled}
          className="grid min-h-40 w-full place-items-center p-6 text-center transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-copper text-ink">
              <Camera className="size-5" />
            </span>
            <p className="mt-3 font-display text-2xl">Open live scanner</p>
            <p className="mt-1 text-xs text-white/55">Align UPC, EAN, or GTIN inside the frame</p>
          </div>
        </button>
      )}

      {status === "starting" && (
        <div className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-white/65">
          <Loader2 className="size-3.5 animate-spin" /> Requesting rear camera
        </div>
      )}
      {status === "scanning" && (
        <div className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-white/65">
          <ScanLine className="size-3.5 text-copper" /> Hold steady; lookup starts automatically
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 border-t border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs leading-5 text-amber-100">
          <Barcode className="mt-0.5 size-3.5 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
