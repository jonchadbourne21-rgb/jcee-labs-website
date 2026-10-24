import { useState } from "react";

const scenarios = [
  {
    id: "authorized",
    label: "As intended",
    number: "01",
    title: "An order ready to move.",
    intro:
      "An operations team asks its software to release a customer order. Follow the request through the checks that matter.",
    outcome: "Approved change illustrated",
    tone: "clear",
    summary:
      "The example permission is current. The illustrated action matches the request, and its resulting record is available for review.",
    steps: [
      [
        "Source instruction",
        "Release order SO-1042",
        "The original request identifies the order and the exact intended change.",
      ],
      [
        "Current permission",
        "Release permitted",
        "The example authority record permits this action on this order.",
      ],
      [
        "Action boundary",
        "Order release illustrated",
        "The modeled target accepts the permitted request once.",
      ],
      [
        "Resulting record",
        "Occurrence accounted for",
        "The example record connects the request, permission and modeled result.",
      ],
    ],
  },
  {
    id: "revoked",
    label: "Permission withdrawn",
    number: "02",
    title: "Approval was there. Then it changed.",
    intro:
      "The order is queued, but the person responsible withdraws permission before release. A prior approval cannot settle the current decision.",
    outcome: "Held at the action boundary",
    tone: "held",
    summary:
      "The illustrated release is held. The example keeps the request and the changed permission visible for the person responsible.",
    steps: [
      [
        "Source instruction",
        "Release order SO-1042",
        "The requested change is preserved, even when it cannot proceed.",
      ],
      [
        "Current permission",
        "Permission withdrawn",
        "The example authority record changes before the modeled action.",
      ],
      [
        "Action boundary",
        "Release held",
        "The illustrated target does not release the order under the withdrawn permission.",
      ],
      [
        "Resulting record",
        "Reason for hold retained",
        "The example record shows why the request did not become an authorized change.",
      ],
    ],
  },
  {
    id: "interrupted",
    label: "Response lost",
    number: "03",
    title: "The response vanished. Did the order move?",
    intro:
      "A request is sent and the connection drops. In this example the target record is available, so recovery can examine the outcome before another attempt.",
    outcome: "Existing occurrence reconciled",
    tone: "clear",
    summary:
      "The fictional target record shows the release already occurred. The example reconciles that occurrence without illustrating another release. Without a sufficient record, the outcome would stay unresolved.",
    steps: [
      [
        "Source instruction",
        "Release order SO-1042",
        "The original request and action identity remain available after interruption.",
      ],
      [
        "Current permission",
        "Original permission recorded",
        "Recovery preserves the original authority basis; it does not grant permission for a new action.",
      ],
      [
        "Action boundary",
        "Response missing",
        "A missing response alone cannot establish whether the target acted.",
      ],
      [
        "Resulting record",
        "Prior release found",
        "The fictional target record supports reconciliation of the existing occurrence, without another release.",
      ],
    ],
  },
  {
    id: "conflicting",
    label: "Records disagree",
    number: "04",
    title: "Two records. One unanswered question.",
    intro:
      "The source request and the order record disagree about the freight account. Someone must resolve the discrepancy before a change can be justified.",
    outcome: "Needs human review",
    tone: "held",
    summary:
      "The illustration surfaces the disagreement and holds the proposed change. A comparison result supplies evidence for review; it does not create permission to correct the order.",
    steps: [
      [
        "Source instruction",
        "Use customer freight account",
        "The source instruction specifies the intended freight arrangement.",
      ],
      [
        "Current permission",
        "Correction not authorized",
        "Finding a discrepancy does not grant authority to change the order.",
      ],
      [
        "Action boundary",
        "Mismatch surfaced",
        "The fictional order has no freight account recorded. The proposed change stays held.",
      ],
      [
        "Resulting record",
        "Review required",
        "The example retains the conflicting observations and the unresolved decision.",
      ],
    ],
  },
] as const;

export default function EvidenceThreadScene() {
  const [selected, setSelected] = useState(0);
  const [step, setStep] = useState(0);
  const [traced, setTraced] = useState(false);
  const scenario = scenarios[selected];
  const choose = (index: number) => {
    setSelected(index);
    setStep(0);
    setTraced(false);
  };
  const next = () => {
    if (step < 3) setStep(step + 1);
    else setTraced(true);
  };
  const download = () => {
    const record = {
      kind: "ILLUSTRATIVE_EXAMPLE",
      scenario: scenario.id,
      order: "SO-1042",
      outcome: scenario.outcome,
      external_action_performed: false,
      qualification_receipt: false,
      steps: scenario.steps.map(([stage, value, explanation]) => ({
        stage,
        value,
        explanation,
      })),
      scope:
        "Fictional browser illustration. Not a VOW engine run, target-system record or qualification result.",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(record, null, 2)], { type: "application/json" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `jcee-example-${scenario.id}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="evidence-scene">
      <div className="et-scene-top">
        <span className="et-eyebrow">
          THE EVIDENCE THREAD / INTERACTIVE EXAMPLE
        </span>
        <span className="et-example-label">
          Fictional data · Browser illustration
        </span>
      </div>
      <div className="et-scene-heading">
        <h2 id="working-example-title">
          Follow the request.
          <br />
          <span>Challenge the outcome.</span>
        </h2>
        <p>
          One business action. Four ways it can unfold. Choose a scenario, then
          inspect what each record tells you.
        </p>
      </div>
      <div
        className="et-scenarios"
        role="group"
        aria-label="Choose an example scenario"
      >
        {scenarios.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected === index}
            onClick={() => choose(index)}
          >
            <span>{item.number}</span>
            {item.label}
            <span className="et-scenario-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
        ))}
      </div>
      <div className="et-workbench">
        <div className="et-story">
          <span className="et-eyebrow">
            SCENARIO {scenario.number} / ORDER SO-1042
          </span>
          <h3>{scenario.title}</h3>
          <p>{scenario.intro}</p>
          <div className="et-story-foot">
            <span className="et-small-rule" />
            <p>
              What is requested?
              <br />
              Who permits it?
              <br />
              What actually changed?
            </p>
          </div>
        </div>
        <div className={`et-trace et-tone-${scenario.tone}`}>
          <div className="et-trace-top">
            <span>REQUEST → RECORD</span>
            <span>{traced ? "EXAMPLE COMPLETE" : `STEP ${step + 1} OF 4`}</span>
          </div>
          <ol className="et-stages" aria-label="Inspect the evidence stages">
            {scenario.steps.map(([label, value], index) => (
              <li key={label} className={index <= step ? "is-reached" : ""}>
                <button
                  type="button"
                  aria-current={step === index ? "step" : undefined}
                  onClick={() => {
                    setStep(index);
                    setTraced(false);
                  }}
                >
                  <span className="et-stage-point">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <small>{label}</small>
                    <strong>
                      {index <= step ? value : "Awaiting inspection"}
                    </strong>
                  </span>
                  <span className="et-stage-indicator" aria-hidden="true">
                    {index === step ? "←" : index < step ? "✓" : "·"}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="et-inspection" aria-live="polite" aria-atomic="true">
            <span className="et-eyebrow">
              {traced ? "MODELED OUTCOME" : scenario.steps[step][0]}
            </span>
            <p>{traced ? scenario.summary : scenario.steps[step][2]}</p>
            {traced && (
              <strong className="et-outcome">{scenario.outcome}</strong>
            )}
          </div>
          <div className="et-trace-actions">
            {!traced ? (
              <button type="button" className="et-primary" onClick={next}>
                {step === 3 ? "See the outcome" : "Follow the evidence"}
                <span aria-hidden="true">→</span>
              </button>
            ) : (
              <>
                <button type="button" className="et-primary" onClick={download}>
                  Download example record <span aria-hidden="true">↓</span>
                </button>
                <button
                  type="button"
                  className="et-reset"
                  onClick={() => choose(selected)}
                >
                  Start again ↻
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="et-scene-boundary">
        <p>
          This browser illustration performs no external action. It does not run
          the VOW engine, persist a target effect, or produce a new test
          receipt.
        </p>
        <a href="/technology#current-integration">
          Read the recorded qualification <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
