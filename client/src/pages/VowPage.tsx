import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const boundaries = [
  ["WHAT IT IS", "JCEE VOW is an evidence-first execution runtime for consequential software and AI-directed actions."],
  ["WHAT IT RECORDS", "A durable account of covered execution, interruption, recovery, and the resulting verdict."],
  ["WHAT IT IS NOT", "A model, a claim of universal safety, or an automatic statement of legal compliance."],
  ["CURRENT STATUS", "VOW 1.1 has reached a bounded internal verification milestone and remains under active hardening and reproduction."],
];

export default function VowPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "JCEE VOW — JCEE Labs";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="program-page" id="top">
      <CoreHeader current="vow" />

      <section className="program-masthead vow-program">
        <p className="eyebrow"><span /> PUBLIC OVERVIEW · ACTIVE</p>
        <div className="program-number">JCEE VOW / PUBLIC OVERVIEW</div>
        <h1>Execution should<br /><em>leave evidence.</em></h1>
        <p className="program-deck">
          JCEE VOW is JCEE Labs&apos; evidence-first runtime for software that must act,
          recover, and remain accountable when execution does not go as planned.
        </p>
        <div className="program-status-row">
          <span>HISTORICAL RELEASE · VOW 1.1</span>
          <span>STATUS · VERIFIED MILESTONE / ACTIVE HARDENING</span>
        </div>
      </section>

      <section className="program-statement">
        <p className="charter-section-label">THE POSITION</p>
        <h2>Capability is not enough.<br />The execution has to answer for itself.</h2>
        <div className="program-statement-copy">
          <p>
            Intelligent systems increasingly move from suggestions to actions.
            Once software can change an external system, retry after interruption,
            or continue without its original operator, a transcript is no longer
            enough to explain what happened.
          </p>
          <p>
            JCEE VOW is being built for that boundary. Its public claim is deliberately
            narrow: within the covered conditions, it produces durable evidence that
            supports inspection, recovery, and a bounded execution verdict.
          </p>
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="vow-boundaries">
        <div className="section-index">
          <span>PUBLIC CLAIM BOUNDARY</span>
          <span>EVIDENCE BEFORE LANGUAGE</span>
        </div>
        <h2 id="vow-boundaries">What we can say now.</h2>
        <div className="program-boundary-list">
          {boundaries.map(([label, copy]) => (
            <article key={label}>
              <span>{label}</span>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="program-next">
        <p className="charter-section-label">THE NEXT GATE</p>
        <h2>Reproduce the result outside the environment that created it.</h2>
        <p>
          Current work is focused on independent runtime reproduction and external
          integration hardening. The public claim will expand only if that evidence
          survives. If it does not, the claim will narrow.
        </p>
        <div className="program-links">
          <a href="/registry">VIEW THE PUBLIC REGISTRY <span>→</span></a>
          <a href="/assurance">VIEW JCEE ASSURANCE <span>→</span></a>
          <a href="/charter">READ THE CHARTER <span>→</span></a>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
