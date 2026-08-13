import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const statusRows = [
  ["PROGRAM", "Workflow-free transition calculus research"],
  ["SPECIFICATION", "QCS 1.x frozen as a candidate specification"],
  ["CURRENT PHASE", "QCS-2.0 independent reproduction"],
  ["RELATION TO VOW", "Separate research identity; not the VOW product release"],
];

export default function QcsPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "QCS Research — JCEE Labs";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="program-page qcs-program-page" id="top">
      <CoreHeader current="qcs" />

      <section className="program-masthead qcs-program">
        <p className="eyebrow"><span /> RESEARCH PROGRAM · FROZEN CANDIDATE</p>
        <div className="program-number">02 / QCS</div>
        <h1>What evidence justifies<br /><em>the next action?</em></h1>
        <p className="program-deck">
          QCS is a JCEE Labs research program studying the relationship between
          available evidence, permitted transitions, and justified execution.
        </p>
        <div className="program-status-row">
          <span>LINE · QCS 1.x</span>
          <span>CURRENT PHASE · QCS-2.0 REPRODUCTION</span>
        </div>
      </section>

      <section className="program-statement program-statement-dark">
        <p className="charter-section-label">THE RESEARCH QUESTION</p>
        <h2>Can the same reasoning survive a different implementation?</h2>
        <div className="program-statement-copy">
          <p>
            QCS asks whether a fixed transition standard can continue to produce
            valid decisions when the surrounding execution environment changes.
          </p>
          <p>
            The test is intentionally strict: the specification has been frozen.
            Reproduction must adapt the implementation without quietly rewriting
            the reasoning to fit each new case.
          </p>
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="qcs-status">
        <div className="section-index">
          <span>PUBLIC STATUS</span>
          <span>RESEARCH · NOT PRODUCT CLAIM</span>
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

      <section className="program-next">
        <p className="charter-section-label">CLAIM BOUNDARY</p>
        <h2>A frozen specification is not the same as a proven general calculus.</h2>
        <p>
          The present status supports a defined candidate specification and an
          active independent reproduction program. It does not establish universal
          transfer, production readiness, or third-party certification.
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
