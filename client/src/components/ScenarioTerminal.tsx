import { useEffect, useState } from "react";
import "./scenario-terminal.css";

const scenarios = [
  { title: "The timeout illusion", description: "A missing response does not tell you whether the change happened.", lines: [
    "[REQUEST] Add fictional employee #8801 to an application-access group.",
    "[STEP] Sending the approved request to the target system...",
    "[EVENT] The response window expires before confirmation arrives.",
    "[STATE] Access may or may not have been granted.",
    "[NOTE] A timeout is not a confirmed failure.",
    "[HOLD] This illustration pauses another attempt.",
    "[CHECK] Inspect target membership and available action history.",
    "[NEXT] Reconcile the outcome and current approval before acting again.",
    "[STATUS] Outcome unresolved — verification required.",
  ] },
  { title: "Permission withdrawn", description: "An earlier approval is not enough when permission has changed.", lines: [
    "[REQUEST] Create a workspace for fictional employee #8801.",
    "[RECORD] An earlier approval is present in this example.",
    "[EVENT] The manager withdraws permission before the illustrated action.",
    "[CHECK] Inspect the current authorization, not just the earlier approval.",
    "[STATE] Permission is no longer current in this scenario.",
    "[HOLD] The illustrated action does not proceed.",
    "[NEXT] A new request requires its own current authorization.",
    "[STATUS] Held — permission withdrawn.",
  ] },
  { title: "Broken cross-tool handoff", description: "Check what happened before sending the instruction again.", lines: [
    "[REQUEST] HR requests a workspace for fictional employee #8801.",
    "[STEP] Sending the request to the target system...",
    "[EVENT] Connection interrupted before confirmation.",
    "[STATE] The workspace may or may not have been created.",
    "[NOTE] A missing response does not establish failure.",
    "[HOLD] This illustration pauses another creation attempt.",
    "[CHECK] Inspect the target workspace and available action history.",
    "[CHECK] Confirm whether the original approval remains valid.",
    "[NEXT] Reconcile those findings before deciding what to do.",
    "[STATUS] Outcome unresolved — verification required.",
  ] },
];

export default function ScenarioTerminal() {
  const [selected, setSelected] = useState(0);
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const scenario = scenarios[selected];
  const complete = shown === scenario.lines.length;
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReducedMotion(media.matches); if (media.matches) setPlaying(false); };
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!playing || complete || reducedMotion) return;
    const timer = window.setTimeout(() => setShown(n => n + 1), 1100);
    return () => window.clearTimeout(timer);
  }, [playing, shown, complete, reducedMotion, selected]);
  useEffect(() => { if (complete) setPlaying(false); }, [complete]);
  return <section className="scenario-experience customer-shell customer-section" aria-labelledby="scenario-heading">
    <p className="customer-kicker">EXPLORE AN INTERRUPTED WORKFLOW</p>
    <h2 id="scenario-heading">Before you try again,<br />know what happened.</h2>
    <p className="scenario-disclosure">Interactive illustration with fictional data. No external systems are connected, no VOW engine runs, and no qualification receipt is created. Playback timing tells the story; it does not measure execution.</p>
    <div className="scenario-grid">
      <div className="scenario-selectors" role="group" aria-label="Choose a workflow illustration">
        {scenarios.map((item, index) => <button key={item.title} type="button" aria-pressed={selected === index} aria-controls="scenario-terminal" onClick={() => { setPlaying(false); setSelected(index); setShown(0); }}>
          <span className="scenario-number">SCENARIO 0{index + 1}</span>
          <strong>{item.title}</strong><span>{item.description}</span>
        </button>)}
      </div>
      <div className="scenario-console" id="scenario-terminal" role="region" aria-label={scenario.title}>
        <div className="scenario-console-top"><span>ILLUSTRATION / {scenario.title}</span><span>STEP {shown} / {scenario.lines.length}</span></div>
        <p className="scenario-demo-label">[DEMO] No external action. Fictional scenario.</p>
        <ol className="scenario-log" aria-label="Illustrative log">
          {scenario.lines.slice(0, shown).map((line, index) => <li key={index}>{line}</li>)}
        </ol>
        <p className="scenario-playback-status" role="status" aria-live="polite" aria-atomic="true">{shown ? scenario.lines[shown - 1] : "Ready. Choose Play or Next step."}</p>
        <div className="scenario-controls">
          <button type="button" disabled={complete || reducedMotion} onClick={() => setPlaying(true)}>Play</button>
          <button type="button" disabled={!playing} onClick={() => setPlaying(false)}>Pause</button>
          <button type="button" disabled={complete} onClick={() => { setPlaying(false); setShown(n => Math.min(n + 1, scenario.lines.length)); }}>Next step</button>
          <button type="button" onClick={() => { setPlaying(false); setShown(0); }}>Reset</button>
        </div>
        {reducedMotion && <p className="scenario-motion-note">Reduced motion is on. Use Next step to explore at your pace.</p>}
      </div>
    </div>
  </section>;
}
