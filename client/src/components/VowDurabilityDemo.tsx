import { useEffect, useRef, useState } from "react";

type DemoState = "armed" | "crashed" | "recovering" | "verified";

const rows = [
  ["00", "INTENT", "RECORDED"],
  ["01", "ACTION", "REQUESTED"],
  ["02", "PROCESS", "INTERRUPTED"],
  ["03", "OBSERVATION", "AVAILABLE"],
  ["04", "RECOVERY", "RECONCILED"],
  ["05", "REVIEW", "ILLUSTRATED"],
] as const;

function visibleCount(state: DemoState) {
  if (state === "armed") return 2;
  if (state === "crashed") return 3;
  if (state === "recovering") return 5;
  return 6;
}

export default function VowDurabilityDemo() {
  const [state, setState] = useState<DemoState>("armed");
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const showInterruption = () => {
    if (state !== "armed") return;
    clearTimers();
    setState("crashed");
    timers.current.push(window.setTimeout(() => setState("recovering"), 820));
    timers.current.push(window.setTimeout(() => setState("verified"), 1880));
  };

  const replay = () => {
    clearTimers();
    setState("armed");
  };

  const count = visibleCount(state);

  return (
    <section className={`durability-demo is-${state}`} aria-labelledby="durability-title" aria-describedby="durability-description">
      <div className="durability-topline">
        <div>
          <p className="durability-kicker">INTERACTIVE RECOVERY ILLUSTRATION</p>
          <h3 id="durability-title">Follow recovery.<br /><em>Inspect each state.</em></h3>
        </div>
        <div className="durability-mode">
          <span className="durability-live-dot" aria-hidden="true" />
          EXAMPLE STATES · BROWSER ILLUSTRATION
        </div>
      </div>

      <div className="durability-console">
        <div className="durability-rail" aria-hidden="true">
          <span>INTENT</span><i />
          <span>EXECUTION</span><i />
          <span>CRASH</span><i />
          <span>RECOVERY</span><i />
          <span>REVIEW</span>
        </div>

        <div className="durability-machine">
          <div className="machine-head">
            <span>SCENARIO / INTERRUPTION</span>
            <strong>{state === "armed" ? "READY" : state === "crashed" ? "INTERRUPTION" : state === "recovering" ? "RECONCILIATION" : "EXAMPLE COMPLETE"}</strong>
          </div>

          <div className="machine-ledger" aria-live="polite">
            {rows.map(([index, label, value], rowIndex) => {
              const shown = rowIndex < count;
              const crashRow = rowIndex === 2;
              return (
                <div className={`machine-row ${shown ? "is-visible" : ""} ${crashRow && shown ? "is-failure" : ""}`} key={index}>
                  <span>{index}</span>
                  <span>{label}</span>
                  <strong>{shown ? value : "—"}</strong>
                  <b>{shown ? (crashRow ? "!" : "✓") : "·"}</b>
                </div>
              );
            })}
          </div>

          <div className="machine-proofline">
            <div><span>DATA</span><code>EXAMPLE ONLY</code></div>
            <div><span>STAGE</span><code>{state === "crashed" ? "INTERRUPTION" : state === "recovering" ? "RECOVERY" : state === "verified" ? "REVIEW" : "INTENT"}</code></div>
            <div><span>EXECUTION</span><code>ILLUSTRATED</code></div>
          </div>

          <div className="machine-actionbar">
            <button className="fault-button" type="button" onClick={showInterruption} disabled={state !== "armed"}>
              <span>SHOW INTERRUPTION</span>
              <i aria-hidden="true">↯</i>
            </button>
            {state !== "armed" && (
              <button className="replay-button" type="button" onClick={replay}>REPLAY EXAMPLE ↻</button>
            )}
            <p>{state === "armed" ? "Explore an interruption in this example." : state === "crashed" ? "The example pauses before recovery." : state === "recovering" ? "The example shows records being reconciled." : "Review the illustrated states and their boundaries."}</p>
          </div>
        </div>

        <div className="durability-sidecar" aria-hidden="true">
          <span>EXAMPLE</span>
          <span>INTENT</span>
          <span>ACTION</span>
          <span>RECORD</span>
          <span>RECOVERY</span>
          <span>REVIEW</span>
        </div>
      </div>
      <p id="durability-description">
        This browser illustration uses example states and performs no external
        action. <a href="/technology#current-integration">Read the recorded
        software qualification</a> for the tested behavior and its limits.
      </p>
    </section>
  );
}
