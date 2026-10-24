import { useEffect, useRef, useState } from "react";
import {
  evidenceScenarios,
  type EvidenceScenario,
} from "@/content/evidenceScenarios";

const stageLabels = [
  "Source instruction",
  "Current permission",
  "Action boundary",
  "Resulting record",
];
const choices: [EvidenceScenario, string][] = [
  ["authorized", "As intended"],
  ["revoked", "Permission withdrawn"],
  ["lost", "Response lost"],
  ["conflict", "Records disagree"],
];

export default function EvidenceTrace() {
  const [current, setCurrent] = useState<EvidenceScenario>("authorized");
  const [stage, setStage] = useState(0);
  const [reached, setReached] = useState(0);
  const next = useRef<HTMLButtonElement>(null);
  const reset = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);
  const data = evidenceScenarios[current];
  useEffect(() => {
    if (moveFocus.current) {
      (stage === 3 ? reset : next).current?.focus({ preventScroll: true });
      moveFocus.current = false;
    }
  }, [stage]);
  const inspect = (value: number) => {
    setStage(value);
    setReached(old => Math.max(old, value));
  };
  return (
    <>
      <div
        className="et-scenario-picker"
        role="group"
        aria-label="Choose an example scenario"
      >
        {choices.map(([key, label], index) => (
          <button
            key={key}
            type="button"
            data-scenario={key}
            aria-pressed={current === key}
            onClick={() => {
              setCurrent(key);
              setStage(0);
              setReached(0);
            }}
          >
            <span className="et-mono">0{index + 1}</span>
            {label}
          </button>
        ))}
      </div>
      <div className="et-example-layout">
        <div className="et-scenario-copy">
          <p className="et-eyebrow" id="scenario-index">
            SCENARIO {data.index} / ORDER SO-1042
          </p>
          <h3 id="scenario-title">{data.title}</h3>
          <p id="scenario-description">{data.description}</p>
          <p className="et-scenario-question">
            What was requested?
            <br />
            Who permitted it?
            <br />
            What actually changed?
          </p>
        </div>
        <div className="trace">
          <div className="et-trace-top et-mono">
            <span>REQUEST → RECORD</span>
            <span id="trace-count">STEP {stage + 1} OF 4</span>
          </div>
          <ol className="et-trace-steps" aria-label="Inspect the evidence stages">
            {stageLabels.map((label, index) => (
              <li
                key={label}
                className={[
                  index === stage && "et-is-active",
                  index <= reached && "et-is-reached",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <button
                  type="button"
                  data-stage={index}
                  aria-current={index === stage ? "step" : undefined}
                  onClick={() => inspect(index)}
                >
                  <span className="et-trace-index et-mono">0{index + 1}</span>
                  <span>
                    <small>{label}</small>
                    <strong>
                      {index <= reached
                        ? data.values[index]
                        : "Awaiting inspection"}
                    </strong>
                  </span>
                  <span className="et-stage-mark" aria-hidden="true">
                    {index === stage ? "←" : index <= reached ? "✓" : "·"}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="et-trace-detail" aria-live="polite" aria-atomic="true">
            <span className="et-eyebrow" id="detail-label">
              {stageLabels[stage].toUpperCase()}
            </span>
            <p id="detail-copy">{data.detail[stage]}</p>
          </div>
          <div className="et-trace-actions">
            <button
              ref={next}
              className="et-button et-button-light"
              id="trace-next"
              type="button"
              hidden={stage === 3}
              onClick={() => {
                moveFocus.current = stage === 2;
                inspect(Math.min(3, stage + 1));
              }}
            >
              Follow the evidence <span aria-hidden="true">→</span>
            </button>
            <button
              ref={reset}
              className="et-reset-button"
              id="trace-reset"
              type="button"
              hidden={stage !== 3}
              onClick={() => {
                moveFocus.current = true;
                setStage(0);
                setReached(0);
              }}
            >
              Start again ↺
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
