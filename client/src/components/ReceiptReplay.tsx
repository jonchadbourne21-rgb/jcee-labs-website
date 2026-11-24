import { useCallback, useEffect, useRef, useState } from "react";
import "./receipt-replay.css";

/**
 * Homepage hero demo: one request, one ERP timeout, two outcomes.
 * A typical agent retries blindly and duplicates the order; with JCEE the
 * permission is checked, the ERP is checked before retrying, and a receipt
 * is kept. Illustrative only: no system is called.
 *
 * The final state is the server-rendered state, so the story reads
 * completely without JavaScript and under reduced motion. With motion
 * allowed, the replay plays once on load and can be replayed.
 */
type Tone = "ok" | "warn" | "bad" | "good";
type Step = { at: number; text: string; tone: Tone };

const agentSteps: Step[] = [
  { at: 1, text: "Submit the order", tone: "ok" },
  { at: 2, text: "ERP times out", tone: "warn" },
  { at: 3, text: "Retry without checking", tone: "warn" },
  { at: 4, text: "Two orders in the ERP", tone: "bad" },
];
const jceeSteps: Step[] = [
  { at: 1, text: "Permission confirmed: ops lead", tone: "ok" },
  { at: 2, text: "Submit the order", tone: "ok" },
  { at: 3, text: "ERP times out", tone: "warn" },
  { at: 4, text: "Check the ERP before retrying", tone: "ok" },
  { at: 5, text: "One order, confirmed", tone: "good" },
];
export const REPLAY_FINAL_STEP = 6;
const STEP_MS = 1100;
const START_MS = 700;
const icon: Record<Tone, string> = { ok: "✓", warn: "!", bad: "✕", good: "✓" };

function Lane({ title, steps, step, result, resultTone, lane }: {
  title: string; steps: Step[]; step: number; result: string; resultTone: Tone; lane: string;
}) {
  return (
    <div className={`rr-lane rr-lane--${lane}`}>
      <span className="rr-lane-title">{title}</span>
      <ol className="rr-steps">
        {steps.map(s => (
          <li key={s.text + s.at} className={`rr-step rr-step--${s.tone}`} data-on={step >= s.at}>
            <span className="rr-icon" aria-hidden="true">{icon[s.tone]}</span>
            {s.text}
          </li>
        ))}
      </ol>
      <p className={`rr-result rr-result--${resultTone}`} data-on={step >= REPLAY_FINAL_STEP}>{result}</p>
    </div>
  );
}

export default function ReceiptReplay() {
  const [step, setStep] = useState(REPLAY_FINAL_STEP);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach(id => window.clearTimeout(id));
    timers.current = [];
  };

  const play = useCallback(() => {
    clear();
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setStep(REPLAY_FINAL_STEP);
      return;
    }
    setStep(0);
    for (let next = 1; next <= REPLAY_FINAL_STEP; next += 1) {
      timers.current.push(window.setTimeout(() => setStep(next), START_MS + (next - 1) * STEP_MS));
    }
  }, []);

  useEffect(() => {
    play();
    return clear;
  }, [play]);

  const done = step >= REPLAY_FINAL_STEP;
  return (
    <div className="wl-receipt wl-receipt--replay" data-demo="illustrative" data-step={step}>
      <div className="wl-receipt-top">
        <span className="wl-receipt-mark" aria-hidden="true"><i /><i /></span>
        <span>JCEE WORLDLAB / AI ACTION RECEIPT</span>
        <span>REPLAY</span>
      </div>
      <div className="rr-request">
        <span className="rr-label">REQUEST</span>
        <h3 className="rr-request-text">Submit purchase order PO-4471 to the ERP.</h3>
      </div>
      <div className="rr-lanes">
        <Lane lane="agent" title="TYPICAL AI AGENT" steps={agentSteps} step={step}
          result="Duplicate order to clean up, and no record of why." resultTone="bad" />
        <Lane lane="jcee" title="WITH JCEE" steps={jceeSteps} step={step}
          result="Receipt kept: who approved it and what happened." resultTone="good" />
      </div>
      <div className="rr-bottom">
        <span className="rr-label">EXAMPLE · NOT A LIVE RECEIPT</span>
        <button type="button" className="rr-replay" onClick={play} disabled={!done} aria-label="Replay the example">
          {done ? "Replay ↻" : "Playing…"}
        </button>
      </div>
    </div>
  );
}
