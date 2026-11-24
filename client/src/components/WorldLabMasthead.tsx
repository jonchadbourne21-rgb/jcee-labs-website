import type { ReactNode } from "react";
import SignaturePanel from "./SignaturePanel";

/** Shared presentation for product and partnership introductions. */
export default function WorldLabMasthead({
  children,
  className = "",
  artwork = "technology",
  signature,
}: {
  children: ReactNode;
  className?: string;
  /** Kept for existing call sites; selects the default readout and wave seed. */
  artwork?: "technology" | "research" | "company";
  /** Readout label; defaults to the artwork family. The masthead class seeds the wave. */
  signature?: string;
}) {
  return (
    <section id="page-content" tabIndex={-1} className={`program-masthead worldlab-masthead ${className}`}>
      <div className="worldlab-masthead-copy">{children}</div>
      <SignaturePanel className="worldlab-masthead-art" label={signature ?? artwork} seedKey={className || artwork} />
    </section>
  );
}
