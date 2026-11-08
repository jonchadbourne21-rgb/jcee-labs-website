import { useEffect, useRef, useState } from "react";

/** Copies a public UI projection. Its digest is calculated in the browser and
 * is not a source artifact hash, provider receipt, or qualification result.
 */
export default function PublicDataDrawer({
  title, record, onClose,
}: {
  title: string;
  record: Record<string, unknown> | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [fingerprint, setFingerprint] = useState("NOT CALCULATED");
  const [feedback, setFeedback] = useState("");
  const json = record ? JSON.stringify(record, null, 2) : "";
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (record && !node.open) node.showModal();
    if (!record && node.open) node.close();
  }, [record]);
  useEffect(() => {
    if (!record) { setFingerprint("NOT CALCULATED"); return; }
    let cancelled = false;
    const compute = async () => {
      try {
        if (!crypto?.subtle) return;
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(json));
        const hex = Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, "0")).join("");
        if (!cancelled) setFingerprint(hex);
      } catch { if (!cancelled) setFingerprint("UNAVAILABLE"); }
    };
    void compute();
    return () => { cancelled = true; };
  }, [json, record]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setFeedback("Public JSON projection copied.");
    } catch { setFeedback("Clipboard unavailable in this browser."); }
  };
  return (
    <dialog
      ref={dialog}
      className="wl-data-drawer"
      aria-label={title + " public record"}
      onClose={onClose}
      onClick={event => { if (event.target === dialog.current) dialog.current?.close(); }}
    >
      <div className="wl-data-drawer-body">
        <div className="wl-data-drawer-head"><span>PUBLIC RECORD / INSPECTABLE PROJECTION</span><button type="button" onClick={() => dialog.current?.close()}>Close ×</button></div>
        <h2>{title}</h2>
        <p>Public presentation fields only. The following SHA-256 is computed over the JSON shown here; it is not an original archived evidence hash.</p>
        <pre><code>{json}</code></pre>
        <div className="wl-data-drawer-foot"><span>LOCAL JSON SHA-256</span><code>{fingerprint}</code><button type="button" onClick={() => { void copy(); }} disabled={!record}>Copy JSON</button></div>
        <p role="status">{feedback}</p>
      </div>
    </dialog>
  );
}
