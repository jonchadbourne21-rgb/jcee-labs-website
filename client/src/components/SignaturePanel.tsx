import HexWaveField from "./HexWaveField";
import "./signature-panel.css";

/** Stable small number from a label, so each page gets its own wave. */
export function signatureSeed(label: string) {
  let hash = 0;
  for (const ch of label) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (hash % 97) + 1;
}

/**
 * The site's one signature visual: the Rust-driven hex-wave field in an
 * instrument frame. Replaces the per-page 3D renders. Decorative only.
 */
export default function SignaturePanel({ label, seedKey, className = "" }: { label: string; seedKey?: string; className?: string }) {
  const seed = signatureSeed(seedKey ?? label);
  const tag = label.replace(/\s+/g, " ").trim().toUpperCase().slice(0, 32);
  return (
    <div className={`signature-panel ${className}`.trim()} data-signature-seed={seed} aria-hidden="true">
      <HexWaveField variant="worldlab" seed={seed} intensity={1.7} pulse className="signature-field" />
      <span className="signature-tick signature-tick--tl" />
      <span className="signature-tick signature-tick--tr" />
      <span className="signature-tick signature-tick--bl" />
      <span className="signature-tick signature-tick--br" />
      <span className="signature-readout">
        <span>JCEE / {tag}</span>
        <span>SIGNAL 0x{seed.toString(16).toUpperCase().padStart(2, "0")}</span>
      </span>
    </div>
  );
}
