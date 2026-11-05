import WorldLabMasthead from "@/components/WorldLabMasthead";
import usePageSeo from "@/components/usePageSeo";
import BuildStatusList from "@/components/BuildStatusList";
import VowDurabilityDemo from "@/components/VowDurabilityDemo";
import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const boundaries = [
  [
    "WHAT IT IS",
    "JCEE VOW is an evidence-first execution runtime for consequential software and AI-directed actions.",
  ],
  [
    "WHAT IT RECORDS",
    "A durable account of covered execution, interruption, recovery, and the resulting verdict.",
  ],
  [
    "WHAT IT IS NOT",
    "A model, a claim of universal safety, or an automatic statement of legal compliance.",
  ],
  [
    "PRESERVED VOW RECORD",
    "VOW 1.1 remains the frozen verified milestone. The 1.1.1.dev3 candidate was admitted to private source control and its bounded founder-usability review closed on September 10; release, deployment, and active-root promotion remain on hold.",
  ],
];

export default function VowPage() {
  usePageSeo("/vow");

  return (
    <main className="program-page" id="top">
      <CoreHeader current="vow" />

      <WorldLabMasthead className="vow-program" artwork="technology">
        <p className="eyebrow">
          <span /> PUBLIC OVERVIEW · ACTIVE
        </p>
        <div className="program-number">JCEE VOW / PUBLIC OVERVIEW</div>
        <h1>
          JCEE VOW:
          <br />
          <em>an evidence-first execution runtime</em>
        </h1>
        <p className="program-deck">
          JCEE VOW is JCEE WorldLab&apos; evidence-first runtime for software that
          must act, recover, and remain accountable when execution does not go
          as planned.
        </p>
        <div className="program-status-row">
          <span>HISTORICAL RELEASE · VOW 1.1</span>
          <span>PRIVATE CANDIDATE · 1.1.1.dev3 · RELEASE ON HOLD</span>
        </div>
      </WorldLabMasthead>

      <section className="program-statement">
        <p className="charter-section-label">THE POSITION</p>
        <h2>
          Capability is not enough.
          <br />
          The execution has to answer for itself.
        </h2>
        <div className="program-statement-copy">
          <p>
            Intelligent systems increasingly move from suggestions to actions.
            Once software can change an external system, retry after
            interruption, or continue without its original operator, a
            transcript is no longer enough to explain what happened.
          </p>
          <p>
            JCEE VOW is being built for that boundary. Its public claim is
            deliberately narrow: within the covered conditions, it produces
            durable evidence that supports inspection, recovery, and a bounded
            execution verdict.
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
        <VowDurabilityDemo />
      </section>

      <section className="program-statement" aria-labelledby="vow-integration-update">
        <p className="charter-section-label">SOFTWARE INTEGRATION · THROUGH NOVEMBER 4, 2026</p>
        <h2 id="vow-integration-update">A connected recovery path, with a defined test boundary.</h2>
        <div className="program-statement-copy">
          <p>
            Native recovery and installed client qualification have advanced
            beyond the October baseline. Hosted work now includes real
            authentication, restart persistence and inspectable evidence.
            Completed actions remain preserved in their original records.
          </p>
          <p>
            These are bounded software results under declared trust assumptions.
            Full G0 is not admitted and has not run; its 20-case candidate is
            frozen for independent review. Physical commitment and production
            readiness remain open, and release remains on hold.
          </p>
        </div>
        <div className="program-links">
          <a href="/technology#current-integration">READ THE INTEGRATION UPDATE <span>→</span></a>
          <a href="/registry#portable-evidence-november">INSPECT THE RECORDED BOUNDARY <span>→</span></a>
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="current-builds">
        <div className="section-index">
          <span>PRESERVED COMPONENT RECORDS</span>
          <span>REVIEWED SEPTEMBER 14, 2026</span>
        </div>
        <h2 id="current-builds">Earlier VOW development lanes.</h2>
        <BuildStatusList ids={["vow-dev3", "vow-i1", "vow-dx"]} />
      </section>
      <section className="program-next">
        <p className="charter-section-label">THE NEXT GATE</p>
        <h2>Keep each result attached to the candidate tested.</h2>
        <p>
          The earlier sealed VOW I1 integration-correctness candidate retains
          its own unexecuted record. The October 19 infrastructure successor
          does not retroactively qualify that different candidate. Further
          operating environments and physical effects require their own
          completed gates.
        </p>
        <div className="program-links">
          <a href="/registry">
            VIEW THE PUBLIC REGISTRY <span>→</span>
          </a>
          <a href="/assurance">
            VIEW JCEE ASSURANCE <span>→</span>
          </a>
          <a href="/charter">
            READ THE CHARTER <span>→</span>
          </a>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
