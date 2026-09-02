import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const capabilities = [
  ["APPLIED AI & AGENTIC SYSTEMS", "Tool-mediated workflows, bounded execution authority, deterministic evaluation, human/target control, and explicit failure states."],
  ["DISTRIBUTED EXECUTION", "Idempotency, crash/retry recovery, concurrency, stale-state rejection, reconciliation, and durable effect histories."],
  ["ASSURANCE & VERIFICATION", "Typed evidence, provenance and lineage, deterministic verifiers, adversarial testing, mutation campaigns, and conservative claim boundaries."],
  ["TECHNICAL COMMERCIALIZATION", "Customer discovery, solution architecture, demos, objective pilot acceptance criteria, SOW structure, and product boundary design."],
];

const metrics = [
  ["371", "tests gated by the JCEE VOW 1.1 private-release CI workflow"],
  ["800", "QCS concurrent PostgreSQL write attempts"],
  ["0", "unsafe commits in that controlled concurrency campaign"],
  ["18 / 18", "combined remote-authority QCS fault trials passed"],
  ["500 / 500", "JA-P0.3 adversarial mutations rejected or narrowed"],
  ["0", "false PROVED and false permission in the JA-P0.3 kernel campaign"],
];

const method = [
  ["FREEZE THE QUESTION", "Define the candidate, claim boundary, fixtures/corpus, acceptance criteria, and failure conditions before the run."],
  ["ATTACK THE DESIGN", "Exercise concurrency, mutation, stale state, crash/retry, replay, wrong identity, missing evidence, and bypass cases."],
  ["PRESERVE FAILURES", "Retain failed experiments as evidence and distinguish semantic failures from infrastructure faults."],
  ["REPAIR NARROWLY", "Change only the verified defect, version the successor, and preserve the prior candidate."],
  ["REPRODUCE INDEPENDENTLY", "Use different substrates, separate verifiers, new implementations, and fresh-process repetition where possible."],
  ["STATE THE CLAIM CEILING", "Record exactly what the result establishes and what remains outside scope."],
];

export default function CareerPortfolio() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Jonathan Chadbourne — Technical Portfolio | JCEE Labs";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="program-page" id="top">
      <CoreHeader />

      <section className="program-masthead assurance-program">
        <p className="eyebrow"><span /> CAREER TECHNICAL PORTFOLIO · PUBLIC-SAFE</p>
        <div className="program-number">JONATHAN CHADBOURNE / FOUNDER & CHIEF ARCHITECT</div>
        <h1>I build systems that make consequential AI actions<br /><em>harder to get wrong — and easier to verify.</em></h1>
        <p className="program-deck">
          My work at JCEE Labs sits at the intersection of applied AI, distributed systems,
          execution reliability, evidence, verification, and technical commercialization.
        </p>
        <div className="program-status-row">
          <span>DALLAS, TX</span>
          <span>SUPPORT@JCEELABS.COM</span>
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="portfolio-capabilities">
        <div className="section-index">
          <span>TECHNICAL RANGE</span>
          <span>PUBLIC-SAFE SUMMARY</span>
        </div>
        <h2 id="portfolio-capabilities">What I work across.</h2>
        <div className="program-boundary-list">
          {capabilities.map(([label, copy]) => (
            <article key={label}>
              <span>{label}</span>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <p>
          Core source repositories, detailed schemas, hostile-test corpora, unpublished implementation
          methods, and partner-specific materials remain private for IP and trade-secret protection.
          This portfolio shows architecture, engineering decisions, controlled evidence, and claim boundaries
          without disclosing enabling proprietary detail.
        </p>
      </section>

      <section className="program-statement">
        <p className="charter-section-label">SYSTEMS MAP</p>
        <h2>From proposal to independently checkable effect.</h2>
        <div className="program-statement-copy">
          <p>
            Proposal / requested action → authority & currentness → evidence closure → consequence boundary
            → durable effect execution → independent verification.
          </p>
          <p>
            JCEE VOW focuses on execution assurance; QCS 2.0 on authority/currentness and transition legality;
            JEC + JCEE Assurance on portable evidence and independent verdicts; and Agentic AP Gate is the current
            product architecture applying those responsibilities to AI-proposed vendor-payment workflows.
          </p>
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="controlled-evidence">
        <div className="section-index">
          <span>CONTROLLED EVIDENCE</span>
          <span>BOUNDED CLAIMS</span>
        </div>
        <h2 id="controlled-evidence">Measured work, with the ceiling stated.</h2>
        <div className="program-boundary-list">
          {metrics.map(([value, copy]) => (
            <article key={`${value}-${copy}`}>
              <span>{value}</span>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <p>
          These metrics describe controlled internal test and reproduction records. They are not claims of
          universal correctness, production certification, regulatory compliance, or coverage of every authority
          and failure model.
        </p>
      </section>

      <section className="program-statement">
        <p className="charter-section-label">CASE STUDY 01</p>
        <h2>Reliable external effects under ambiguity.</h2>
        <div className="program-statement-copy">
          <p>
            I designed and tested private execution-assurance machinery around stable effect identity, durable
            journaling, recovery state, retry/refusal/observe-first behavior, and stale-authority rejection at
            ambiguous external-effect boundaries.
          </p>
          <p>
            QCS 2.0 was independently reproduced against PostgreSQL transactional authority and a genuinely remote
            network authority. The controlled PostgreSQL campaign recorded 800 attempts with 0 unsafe commits;
            combined remote-authority fault trials passed 18/18 with 0 unsafe duplicate remote effects.
          </p>
        </div>
      </section>

      <section className="program-statement">
        <p className="charter-section-label">CASE STUDY 02</p>
        <h2>Evidence that can be independently checked.</h2>
        <div className="program-statement-copy">
          <p>
            JEC defines public-safe evidence responsibilities around identity, provenance, lineage, stream ordering,
            integrity commitments, and profile-bound validation. JCEE Assurance uses a separate deterministic verdict
            path to rederive bounded conclusions from retained evidence and trust inputs.
          </p>
          <p>
            Controlled validation included 30/30 frozen interface cases, 14/14 native cases, fresh-process repetition,
            and 500/500 adversarial mutations rejected or narrowed with 0 false PROVED and 0 false permission in that campaign.
          </p>
        </div>
      </section>

      <section className="program-statement">
        <p className="charter-section-label">CASE STUDY 03</p>
        <h2>Productizing consequence control.</h2>
        <div className="program-statement-copy">
          <p>
            Agentic AP Gate is a current product architecture for the boundary between an AI-proposed vendor payment
            and an irreversible provider effect. The AI can propose; it is not given direct effect authority.
          </p>
          <p>
            The architecture is designed around current-state checks, explicit consequence boundaries, durable effect
            handling, target-owned control, independent verification, and hostile/recovery acceptance scenarios. It is
            an authorized construction program, not a claim of completed live money movement or production non-bypassability.
          </p>
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="engineering-method">
        <div className="section-index">
          <span>ENGINEERING METHOD</span>
          <span>FALSIFICATION-FIRST</span>
        </div>
        <h2 id="engineering-method">Versioned, reproducible, failure-preserving.</h2>
        <div className="program-boundary-list">
          {method.map(([label, copy]) => (
            <article key={label}>
              <span>{label}</span>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="program-next">
        <p className="charter-section-label">PUBLIC RECRUITING DEMONSTRATOR</p>
        <h2>Inspect the engineering style without opening the proprietary vault.</h2>
        <p>
          A small public recruiting demonstrator was authored from scratch to show a generic proposal → deterministic
          gate → simulated effect → receipt flow. It includes invented sample receipts, a deterministic test suite, and
          public-safe diagrams. It is explicitly not a subset, port, or reference implementation of protected JCEE systems.
        </p>
        <div className="program-links">
          <a href="https://github.com/jonchadbourne21-rgb/jcee-labs-website/tree/main/career-portfolio" target="_blank" rel="noreferrer">VIEW PUBLIC DEMONSTRATOR <span>→</span></a>
          <a href="/registry">VIEW PUBLIC RESEARCH EVIDENCE <span>→</span></a>
          <a href="mailto:support@jceelabs.com">CONTACT <span>→</span></a>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
