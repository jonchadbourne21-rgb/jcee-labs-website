import { useState } from "react";

type DemoReceipt = {
  example: true;
  version: "browser-demo-1";
  attempt_id: string;
  requested_action: "restart_service";
  mock_api_result: "TIMEOUT_NO_ACK";
  authority_at_next_action: "REVIEW_REQUIRED";
  observed_external_effect: "UNKNOWN";
  recovery_decision: "HOLD_RETRY_AND_RECONCILE";
  proof_boundary: "LOCAL_DEMO_ONLY_NOT_A_REAL_RECEIPT";
};

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
}

/** The user may explore a mocked API timeout. No network call, VOW runtime, service mutation,
 * authority verifier, external evidence or durable append-only store is involved.
 * SHA-256 binds the displayed local JSON bytes only, not a real-world outcome.
 */
export default function ReceiptSimulator() {
  const [counter, setCounter] = useState(0);
  const [saved, setSaved] = useState<{ json: string; hash: string } | null>(null);
  const [altered, setAltered] = useState(false);
  const [integrity, setIntegrity] = useState<string>("READY / NO DEMO RECORD");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const shown = saved?.json
    ? altered
      ? saved.json.replace("REVIEW_REQUIRED", "APPROVED")
      : saved.json
    : "";

  const run = async () => {
    setBusy(true); setError("");
    try {
      if (!crypto?.subtle) throw new Error("Secure browser hashing is unavailable.");
      const next = counter + 1;
      const receipt: DemoReceipt = {
        example: true, version: "browser-demo-1", attempt_id: `DEMO-${String(next).padStart(4, "0")}`,
        requested_action: "restart_service", mock_api_result: "TIMEOUT_NO_ACK",
        authority_at_next_action: "REVIEW_REQUIRED", observed_external_effect: "UNKNOWN",
        recovery_decision: "HOLD_RETRY_AND_RECONCILE",
        proof_boundary: "LOCAL_DEMO_ONLY_NOT_A_REAL_RECEIPT",
      };
      const json = JSON.stringify(receipt, null, 2);
      setSaved({ json, hash: await sha256(json) });
      setCounter(next); setAltered(false);
      setIntegrity("LOCAL SHA-256 CREATED / EFFECT STILL UNKNOWN");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Cannot create the local example.");
    } finally { setBusy(false); }
  };
  const verify = async () => {
    if (!saved) return;
    try {
      setIntegrity((await sha256(shown)) === saved.hash
        ? "LOCAL HASH MATCH / UNCHANGED DEMO BYTES"
        : "LOCAL HASH MISMATCH / MODIFIED DEMO BYTES");
    } catch {
      setIntegrity("LOCAL HASH CHECK UNAVAILABLE");
    }
  };
  const copy = async () => {
    if (!saved) return;
    try { await navigator.clipboard.writeText(shown + "\nSHA256 " + saved.hash); setError("Copied local example JSON and original digest."); }
    catch { setError("Copy unavailable in this browser."); }
  };
  return (
    <section className="wl-receipt-lab" aria-labelledby="receipt-lab-title" data-demo="browser-only">
      <div className="wl-receipt-lab-heading">
        <span>LAB 001 / INTERACTIVE AUDIT EXAMPLE</span>
        <span>NO SYSTEM ACCESS · NO LIVE TELEMETRY</span>
      </div>
      <div className="wl-receipt-lab-layout">
        <div className="wl-receipt-lab-intro">
          <h2 id="receipt-lab-title">See what a timeout <em>doesn't</em> prove.</h2>
          <p>Trigger a fictional API timeout, generate a SHA-256 digest of a local JSON record, then modify a field to see integrity verification fail. No external action occurs.</p>
          <div className="wl-receipt-lab-controls">
            <button type="button" disabled={busy} onClick={() => { void run(); }}>Simulate failed API response</button>
            <button type="button" disabled={!saved || busy} onClick={() => { setAltered(v => !v); setIntegrity("MODIFIED DEMO / VERIFY TO CHECK"); }}>Toggle record alteration</button>
            <button type="button" disabled={!saved || busy} onClick={() => { void verify(); }}>Verify local SHA-256</button>
          </div>
          <p className="wl-receipt-lab-note">A matching digest verifies these browser-local bytes. It does <strong>not</strong> establish that a production change was blocked or that evidence was durably committed.</p>
        </div>
        <div className="wl-receipt-lab-console" aria-label="Local example audit viewer">
          <div className="wl-receipt-lab-console-top"><span>JCEE / PUBLIC ILLUSTRATION</span><span>SHA-256 / BROWSER</span></div>
          <p className="wl-receipt-lab-status" role="status" aria-live="polite">{integrity}</p>
          <pre><code>{shown || "// Press “Simulate failed API response” to generate fictional data."}</code></pre>
          {saved && <div className="wl-receipt-lab-hash"><span>ORIGINAL CONTENT FINGERPRINT</span><code>{saved.hash}</code><button type="button" onClick={() => { void copy(); }}>Copy example JSON + hash</button></div>}
          {error && <p role="status">{error}</p>}
        </div>
      </div>
    </section>
  );
}
