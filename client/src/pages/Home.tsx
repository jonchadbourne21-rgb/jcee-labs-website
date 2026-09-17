import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import VowDurabilityDemo from "@/components/VowDurabilityDemo";
import { publications, publicationHref } from "@/content/publications";

const buyerProblems = [
  {
    title: "Did the automated action actually happen?",
    copy: "When a request times out or a process stops halfway through, establish what happened before deciding whether to retry.",
  },
  {
    title: "Is the action still allowed now?",
    copy: "Re-check the current state, approval, policy, and other facts that matter before consequential work continues.",
  },
  {
    title: "Can another person verify the result?",
    copy: "Preserve an inspectable record of what was proposed, what evidence was used, what happened, and what remains uncertain.",
  },
];

export default function Home() {
  useEffect(() => {
    document.title = "JCEE Labs — Software for Answerable Automated Work";
  }, []);

  return (
    <main id="top" className="precision-home commercial-home">
      <CoreHeader />
      <section id="page-content" tabIndex={-1} className="hero hybrid-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> SOFTWARE + EXECUTION ASSURANCE
          </p>
          <h1>
            Know what happened.
            <br />
            <em>Know what can happen next.</em>
          </h1>
          <p className="hero-deck">
            JCEE Labs builds software and assurance infrastructure for automated
            work with real consequences. We help teams check the current basis
            for an action, recover safely when outcomes are unclear, and preserve
            evidence of what happened.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#working-example">
              See a working example <span>↓</span>
            </a>
            <a className="primary-link" href="/partners/enterprise">
              Bring us one workflow <span>↗</span>
            </a>
          </div>
          <p className="quiet">
            Reference software and bounded research milestones are available now.
            Customer savings and production performance have not yet been established.
          </p>
        </div>
        <aside className="hero-proof-index" aria-label="How JCEE approaches automated work">
          <span>THE OPERATING LOOP</span>
          <ol>
            <li>
              <b>01</b>
              <strong>Define</strong>
              <small>Name the action, owner, inputs, and required outcome.</small>
            </li>
            <li>
              <b>02</b>
              <strong>Check</strong>
              <small>Establish what the current evidence supports.</small>
            </li>
            <li>
              <b>03</b>
              <strong>Act or stop</strong>
              <small>Continue only inside the supported boundary.</small>
            </li>
            <li>
              <b>04</b>
              <strong>Record</strong>
              <small>Leave an inspectable receipt of the result.</small>
            </li>
          </ol>
        </aside>
      </section>

      <div className="statement-band" aria-label="JCEE Labs principles">
        <span>CLEAR OWNERSHIP</span>
        <span aria-hidden="true">•</span>
        <span>CURRENT CHECKS</span>
        <span aria-hidden="true">•</span>
        <span>SAFE RECOVERY</span>
        <span aria-hidden="true">•</span>
        <span>INSPECTABLE RESULTS</span>
      </div>

      <section className="company-section" id="company">
        <div className="section-index">
          <span>01 / THE PROBLEM</span>
          <span>START IN PLAIN ENGLISH</span>
        </div>
        <div className="company-statement">
          <p>AUTOMATED WORK NEEDS AN ANSWERABLE CONTROL PATH</p>
          <h2>
            When software acts,
            <br />
            <em>your team needs answers.</em>
          </h2>
        </div>
        <div className="customer-problem-grid">
          {buyerProblems.map(problem => (
            <article key={problem.title}>
              <h3>{problem.title}</h3>
              <p>{problem.copy}</p>
            </article>
          ))}
        </div>
        <div className="company-bottom">
          <p>
            Start with one recurring workflow, the controls already in place,
            and the point where work becomes unclear, repetitive, or difficult to verify.
          </p>
          <a href="/partners/enterprise">DISCUSS ONE WORKFLOW <span>→</span></a>
        </div>
      </section>

      <section className="vow-section" id="working-example" aria-labelledby="working-example-title">
        <div className="section-index light">
          <span>02 / WORKING SOFTWARE</span>
          <span>REFERENCE DEMONSTRATION · NOT A CUSTOMER DEPLOYMENT</span>
        </div>
        <div className="vow-intro">
          <h2 id="working-example-title">
            Interrupt the work.
            <br />
            Inspect what survives.
          </h2>
          <div>
            <p>
              The interactive reference below demonstrates one implemented JCEE
              behavior: preserving execution evidence across interruption and recovery.
              It lets you inspect the operating idea rather than relying on prose alone.
            </p>
            <p className="quiet">
              Synthetic execution and demonstration data. This is software evidence,
              not a customer case study, production deployment, or proof of customer ROI.
            </p>
          </div>
        </div>
        <VowDurabilityDemo />
        <a className="section-detail-link" href="/vow">
          READ THE TECHNICAL JCEE VOW OVERVIEW <span>→</span>
        </a>
      </section>

      <section
        className="operating-cloud-home"
        id="operating-cloud"
        aria-labelledby="operating-cloud-title"
      >
        <div className="operating-cloud-home__ambient" aria-hidden="true" />
        <div className="operating-cloud-home__frame">
          <div className="operating-cloud-home__topline">
            <span>03 / JCEE OPERATING CLOUD</span>
            <span>PLATFORM DIRECTION · IN DEVELOPMENT</span>
          </div>
          <div className="operating-cloud-home__lead">
            <div>
              <p className="operating-cloud-home__kicker">
                BEGIN ALONGSIDE YOUR SYSTEMS
              </p>
              <h2 id="operating-cloud-title">
                Prove value in one workflow. Earn the next.
              </h2>
            </div>
            <div className="operating-cloud-home__lead-copy">
              <p>
                Our direction starts with an overlay on existing email and
                business systems. Reconcile records, preserve the evidence, and
                help a person find the next useful check.
              </p>
              <p className="operating-cloud-home__boundary">
                Broader workflow ownership and industry operating software are
                roadmap stages. Customer savings and production integration
                remain to be demonstrated.
              </p>
            </div>
          </div>
          <div
            className="operating-cloud-home__systems"
            aria-label="Planned progression"
          >
            <span>THE ROADMAP</span>
            <div>
              <b>OVERLAY</b>
              <b>ASSURE</b>
              <b>ASSIST</b>
              <b>OWN WORKFLOW</b>
              <b>VERTICAL OS</b>
            </div>
          </div>
          <div className="operating-cloud-home__distribution">
            <div>
              <span>FIRST INDUSTRY FOCUS</span>
              <h3>JCEE Distribution</h3>
            </div>
            <div>
              <p>
                The first synthetic dry run matched 20 of 20 expected order
                classifications, with zero external effects. A limited, approved
                shadow evaluation is the next commercial gate.
              </p>
              <a href="/solutions/distribution">
                EXPLORE THE WORKFLOW <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        className="editorial-section editorial-section-light"
        id="technology"
        aria-labelledby="technology-title"
      >
        <div className="editorial-section-heading">
          <div>
            <p className="editorial-kicker">04 / THE TECHNOLOGY</p>
            <h2 id="technology-title">The deeper machinery, when you need it.</h2>
          </div>
          <a href="/technology">Explore the technology →</a>
        </div>
        <div className="technology-grid">
          <article>
            <p className="editorial-kicker">JCEE VOW</p>
            <h3>Recover with evidence.</h3>
            <p>
              Preserve what happened when an execution stops or a response is
              lost. VOW 1.1 remains the frozen milestone; 1.1.1.dev3 is a
              private development candidate.
            </p>
            <a href="/vow">Runtime and interactive demo →</a>
          </article>
          <article>
            <p className="editorial-kicker">QCS</p>
            <h3>Check the next action.</h3>
            <p>
              The frozen QCS-2.0 specification passed its recorded reproduction
              gate across two tested authority classes.
            </p>
            <a href="/qcs">Research and interactive model →</a>
          </article>
          <article>
            <p className="editorial-kicker">JCEE ASSURANCE</p>
            <h3>Make the result inspectable.</h3>
            <p>
              Portable evidence and bounded verification help a reviewer examine
              the record behind a conclusion.
            </p>
            <a href="/assurance">Evidence and verification →</a>
          </article>
        </div>
        <div className="home-status-strip">
          <span>PUBLIC REGISTRY · REVIEWED SEPTEMBER 14, 2026</span>
          <a href="/registry">Milestones, candidates, and open gates →</a>
        </div>
      </section>

      <section className="company-section" id="engage" aria-labelledby="engage-title">
        <div className="section-index">
          <span>05 / WORK WITH JCEE</span>
          <span>ONE WORKFLOW FIRST</span>
        </div>
        <div className="company-statement">
          <p>THE FIRST ENGAGEMENT</p>
          <h2 id="engage-title">
            Bring one workflow that keeps getting
            <br />
            <em>stuck, repeated, or disputed.</em>
          </h2>
        </div>
        <div className="customer-problem-grid">
          <article>
            <h3>1. Boundary review</h3>
            <p>We review the workflow, current tools, owners, checks, and failure mode.</p>
          </article>
          <article>
            <h3>2. Fit decision</h3>
            <p>We identify whether a bounded JCEE assessment, implementation, or experiment is useful.</p>
          </article>
          <article>
            <h3>3. Written scope</h3>
            <p>Before paid work begins, deliverables, acceptance criteria, required access, exclusions, timing, and commercial terms are agreed in writing.</p>
          </article>
        </div>
        <div className="company-bottom">
          <p>
            A completed engagement should leave inspectable results and explicit limits,
            not a vague success claim.
          </p>
          <a href="/partners/enterprise">BRING US ONE WORKFLOW <span>→</span></a>
        </div>
      </section>

      <section
        className="editorial-section home-resources"
        aria-labelledby="resources-title"
      >
        <div className="editorial-section-heading">
          <div>
            <p className="editorial-kicker">06 / FROM THE LAB</p>
            <h2 id="resources-title">The work, in readable form.</h2>
          </div>
          <a href="/resources">All resources →</a>
        </div>
        <div className="resource-grid">
          {publications.map(item => (
            <article className="resource-card" key={item.slug}>
              <p className="editorial-kicker">
                {item.kind} · September 14, 2026
              </p>
              <h3>
                <a href={publicationHref(item)}>{item.title}</a>
              </h3>
              <p>{item.summary}</p>
              <a className="editorial-text-link" href={publicationHref(item)}>
                Read more →
              </a>
            </article>
          ))}
        </div>
      </section>

      <section
        className="principles-summary"
        id="charter"
        aria-labelledby="principles-title"
      >
        <h2 id="principles-title">We build intelligence that leaves receipts.</h2>
        <p>
          The technical depth remains available. The commercial starting point is
          simpler: one consequential workflow, the evidence it needs, and a result
          your team can inspect.
        </p>
        <a className="editorial-text-link" href="/company">
          Meet JCEE Labs →
        </a>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
