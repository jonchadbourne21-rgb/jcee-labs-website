import { useEffect, useRef, useState } from "react";

type DemoState = "armed" | "crashed" | "recovering" | "verified";

const rows = [
  ["00", "INTENT", "RECORDED"],
  ["01", "EFFECT", "DISPATCHED"],
  ["02", "PROCESS", "TERMINATED"],
  ["03", "OBSERVATION", "PRESERVED"],
  ["04", "RECOVERY", "RECONCILED"],
  ["05", "VERDICT", "PROVED"],
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

  const injectFailure = () => {
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
    <section className={`durability-demo is-${state}`} aria-labelledby="durability-title">
      <div className="durability-topline">
        <div>
          <p className="durability-kicker">DURABILITY / LIVE FAULT INJECTION</p>
          <h3 id="durability-title">Break the process.<br /><em>Keep the evidence.</em></h3>
        </div>
        <div className="durability-mode">
          <span className="durability-live-dot" />
          SYNTHETIC EXECUTION · CLIENT-SIDE DEMO
        </div>
      </div>

      <div className="durability-console">
        <div className="durability-rail" aria-hidden="true">
          <span>INTENT</span><i />
          <span>EXECUTION</span><i />
          <span>CRASH</span><i />
          <span>RECOVERY</span><i />
          <span>VERIFIED</span>
        </div>

        <div className="durability-machine">
          <div className="machine-head">
            <span>RUN / 0x01HX7A</span>
            <strong>{state === "armed" ? "ACTIVE" : state === "crashed" ? "PROCESS LOST" : state === "recovering" ? "RECONCILING" : "RECOVERY COMPLETE"}</strong>
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
            <div><span>HEAD</span><code>7f2e9a…31c4</code></div>
            <div><span>EVIDENCE</span><code>{state === "crashed" ? "PERSISTING" : state === "recovering" ? "REPLAYING" : state === "verified" ? "PRESERVED" : "APPENDING"}</code></div>
            <div><span>DUPLICATE EFFECT</span><code>{state === "verified" ? "0" : "—"}</code></div>
          </div>

          <div className="machine-actionbar">
            <button className="fault-button" type="button" onClick={injectFailure} disabled={state !== "armed"}>
              <span>INJECT FAILURE</span>
              <i aria-hidden="true">↯</i>
            </button>
            {state !== "armed" && (
              <button className="replay-button" type="button" onClick={replay}>REPLAY RUN ↻</button>
            )}
            <p>{state === "armed" ? "The process is live. Interrupt it." : state === "crashed" ? "Execution stopped. Durable record remains." : state === "recovering" ? "A new process is reconciling preserved state." : "Software failed. The evidence didn't."}</p>
          </div>
        </div>

        <div className="durability-sidecar" aria-hidden="true">
          <span>0x7F20</span>
          <span>4A 43 45 45</span>
          <span>45 56 49 44</span>
          <span>45 4E 43 45</span>
          <span>52 45 43 4F</span>
          <span>56 45 52 59</span>
        </div>
      </div>
    </section>
  );
}
