import { useMemo, useState } from "react";

type Phase = "unknown" | "proved" | "stale" | "disproved";

const phaseCopy: Record<Phase, { verdict: string; gate: string; note: string }> = {
  unknown: {
    verdict: "UNKNOWN",
    gate: "OBSERVE FIRST",
    note: "The candidate transition is not authorized while a required authority observation is missing.",
  },
  proved: {
    verdict: "PROVED",
    gate: "TRANSITION ADMISSIBLE",
    note: "The public demo now has enough current evidence to admit this candidate transition at the displayed authority state.",
  },
  stale: {
    verdict: "UNKNOWN",
    gate: "STALE PROOF · REFUSE",
    note: "The authority state advanced after proof. A proof of the prior state is no longer authority to commit against the current state.",
  },
  disproved: {
    verdict: "DISPROVED",
    gate: "TRANSITION REFUSED",
    note: "Current evidence contradicts a required premise, so the candidate transition is refused.",
  },
};

export default function QcsTransitionGate() {
  const [phase, setPhase] = useState<Phase>("unknown");
  const [stateVersion, setStateVersion] = useState(7);

  const copy = phaseCopy[phase];
  const proofState = phase === "stale" ? stateVersion - 1 : stateVersion;

  const rows = useMemo(
    () => [
      ["AUTHORITY BINDING", "CURRENT", "ok"],
      ["PREREQUISITE STATE", `σ${stateVersion} OBSERVED`, "ok"],
      [
        "EXTERNAL STATUS",
        phase === "unknown"
          ? "UNRESOLVED"
          : phase === "disproved"
            ? "CONTRADICTED"
            : phase === "stale"
              ? `PROOF REFERENCES σ${proofState}`
              : "CURRENT",
        phase === "unknown" || phase === "stale" ? "wait" : phase === "disproved" ? "bad" : "ok",
      ],
      ["CANDIDATE", `Δ · σ${stateVersion} → σ${stateVersion + 1}`, "neutral"],
    ],
    [phase, proofState, stateVersion],
  );

  const reset = () => {
    setStateVersion(7);
    setPhase("unknown");
  };

  const observe = () => setPhase("proved");

  const advanceAuthority = () => {
    setStateVersion((value) => value + 1);
    setPhase("stale");
  };

  const reobserve = () => setPhase("proved");

  return (
    <section className={`qcs-gate qcs-gate--${phase}`} aria-labelledby="qcs-gate-title">
      <div className="qcs-gate__topline">
        <span>QCS / TRANSITION GATE</span>
        <span>PUBLIC CLIENT-SIDE MODEL · NOT THE QCS ENGINE</span>
      </div>

      <div className="qcs-gate__layout">
        <div className="qcs-gate__graph" aria-label="Simplified QCS transition demonstration">
          <div className="qcs-gate__state qcs-gate__state--current">
            <small>AUTHORITATIVE STATE</small>
            <strong>σ{stateVersion}</strong>
            <span>CURRENT</span>
          </div>

          <div className="qcs-gate__rail" aria-hidden="true">
            <i className="qcs-gate__pulse" />
            <span>PROOF</span>
          </div>

          <div className="qcs-gate__decision">
            <small>THREE-VALUED JUDGMENT</small>
            <strong>{copy.verdict}</strong>
            <span>{copy.gate}</span>
          </div>

          <div className="qcs-gate__rail qcs-gate__rail--commit" aria-hidden="true">
            <i className="qcs-gate__pulse" />
            <span>COMMIT GATE</span>
          </div>

          <div className="qcs-gate__state qcs-gate__state--candidate">
            <small>CANDIDATE TRANSITION</small>
            <strong>Δ</strong>
            <span>σ{stateVersion} → σ{stateVersion + 1}</span>
          </div>
        </div>

        <div className="qcs-gate__panel">
          <p className="qcs-gate__kicker">EVIDENCE / AUTHORITY / CURRENT STATE</p>
          <h3 id="qcs-gate-title">A transition does not inherit permission from intention.</h3>

          <div className="qcs-gate__evidence">
            {rows.map(([label, value, status]) => (
              <div key={label} data-status={status}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="qcs-gate__verdict" aria-live="polite">
            <span>QCS JUDGMENT</span>
            <strong>{copy.verdict}</strong>
            <p>{copy.note}</p>
          </div>

          <div className="qcs-gate__controls">
            {phase === "unknown" && (
              <button type="button" onClick={observe}>ADD CURRENT OBSERVATION</button>
            )}
            {phase === "proved" && (
              <>
                <button type="button" onClick={advanceAuthority}>ADVANCE AUTHORITY STATE</button>
                <button type="button" className="qcs-gate__secondary" onClick={() => setPhase("disproved")}>INTRODUCE CONTRADICTION</button>
              </>
            )}
            {phase === "stale" && (
              <button type="button" onClick={reobserve}>REOBSERVE CURRENT STATE</button>
            )}
            {phase === "disproved" && (
              <button type="button" onClick={observe}>RESTORE SUPPORTING EVIDENCE</button>
            )}
            <button type="button" className="qcs-gate__secondary" onClick={reset}>RESET</button>
          </div>

          <p className="qcs-gate__caption">
            Simplified public visualization of QCS-2.0 concepts. It demonstrates the distinction between
            PROVED, DISPROVED, and UNKNOWN and the refusal of stale-state authorization; it is not an
            execution of the frozen QCS implementation.
          </p>
        </div>
      </div>
    </section>
  );
}
