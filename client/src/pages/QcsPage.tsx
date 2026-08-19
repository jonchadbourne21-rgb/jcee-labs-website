import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import QcsTransitionGate from "@/components/QcsTransitionGate";

const statusRows = [
  ["PROGRAM", "Workflow-free transition legality calculus research"],
  ["SPECIFICATION", "QCS-2.0 normative core frozen"],
  ["REPRODUCTION GATE", "PASS across PostgreSQL transactional authority and a remote network-effect authority"],
  ["FROZEN BOUNDARY", "Grammar, judgments, proof semantics, evidence semantics, authority model, recovery semantics, and conservative UNKNOWN / WAIT behavior remained unchanged"],
  ["RELATION TO VOW", "Separate research identity; not the VOW product release"],
];

const evidenceRows = [
  ["POSTGRESQL", "50 concurrency rounds · 16 writers/round · 800 attempts · 50 winners · 750 stale losers · 100 stale-proof attacks rejected · 0 unsafe commits"],
  ["REMOTE AUTHORITY", "18/18 combined remote trials passed · 18 partition WAIT decisions · 0 executions while authority unreachable · 0 unsafe duplicate remote effects"],
  ["NEGATIVE RESULT", "The first Stage 5D campaign produced two harness failures. The failed run was preserved, the observation defect was diagnosed, and the corrected campaign passed without changing the QCS specification."],
];

export default function QcsPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "QCS-2.0 Research — JCEE Labs";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="program-page qcs-program-page" id="top">
      <CoreHeader current="qcs" />

      <section className="program-masthead qcs-program">
        <p className="eyebrow"><span /> RESEARCH PROGRAM · VERIFIED MILESTONE</p>
        <div className="program-number">QCS / RESEARCH PROGRAM</div>
        <h1>What evidence justifies<br /><em>the next action?</em></h1>
        <p className="program-deck">
          QCS is a workflow-free transition legality calculus for determining
          whether the currently proven authoritative state justifies a proposed
          causal transition.
        </p>
        <div className="program-status-row">
          <span>CORE · QCS-2.0 FROZEN</span>
          <span>REPRODUCTION GATE · PASS</span>
        </div>
      </section>

      <section className="program-statement program-statement-dark">
        <p className="charter-section-label">THE RESEARCH QUESTION</p>
        <h2>Can the same calculus survive a different authority?</h2>
        <div className="program-statement-copy">
          <p>
            The planned QCS-2.0 reproduction asked whether a new implementation
            could preserve the frozen authority, legality, evidence, recovery,
            and commit semantics across substantially different real execution
            substrates without changing the calculus.
          </p>
          <p>
            Within the tested scope, the answer was yes. The independently
            constructed implementation reproduced the frozen semantics against
            PostgreSQL transactional authority and a genuinely remote network
            authority while the normative QCS-2.0 boundary remained unchanged.
          </p>
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="qcs-status">
        <div className="section-index">
          <span>PUBLIC STATUS</span>
          <span>VERIFIED MILESTONE · BOUNDED SCOPE</span>
        </div>
        <h2 id="qcs-status">Where the work stands.</h2>
        <div className="program-boundary-list">
          {statusRows.map(([label, copy]) => (
            <article key={label}>
              <span>{label}</span>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="qcs-evidence">
        <div className="section-index">
          <span>REPRODUCTION EVIDENCE</span>
          <span>PRESERVED RECEIPTS · AUGUST 13, 2026</span>
        </div>
        <h2 id="qcs-evidence">What survived the gate.</h2>
        <div className="program-boundary-list">
          {evidenceRows.map(([label, copy]) => (
            <article key={label}>
              <span>{label}</span>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="program-next">
        <p className="charter-section-label">PUBLIC INTERACTIVE MODEL</p>
        <h2>A proof is only useful while its authority is current.</h2>
        <p>
          The demonstration below exposes a simplified public surface of the
          QCS-2.0 idea: PROVED, DISPROVED, and UNKNOWN remain distinct, and a
          proof tied to an older authoritative state cannot silently authorize
          a transition against a newer one.
        </p>
        <QcsTransitionGate />
      </section>

      <section className="program-next">
        <p className="charter-section-label">CLAIM BOUNDARY</p>
        <h2>A passed reproduction gate is not universal correctness.</h2>
        <p>
          The verified milestone applies to the frozen QCS-2.0 specification,
          the two tested authority classes, and the preserved adversarial
          conditions. It does not establish universal correctness over every
          authority system or failure model, production readiness, or
          independent third-party certification.
        </p>
        <div className="program-links">
          <a href="/research-evidence">VIEW THE EVIDENCE INDEX <span>→</span></a>
          <a href="/vow">VIEW VOW <span>→</span></a>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
