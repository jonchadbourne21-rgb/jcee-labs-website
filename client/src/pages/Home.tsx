import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import { publications, publicationHref } from "@/content/publications";

export default function Home() {
  useEffect(() => {
    document.title = "JCEE Labs — AI Workflow Assurance";
  }, []);
  return (
    <main id="top" className="precision-home commercial-home">
      <CoreHeader />
      <section id="page-content" tabIndex={-1} className="hero hybrid-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> AI WORKFLOW ASSURANCE
          </p>
          <h1>
            AI can act.
            <br />
            <em>Make it accountable.</em>
          </h1>
          <p className="hero-deck">
            JCEE Labs helps teams examine consequential AI and automated
            workflows: what happened, what evidence supports the next action,
            and whether current permission allows it. Start with one bounded
            assessment. Implement controls where the evidence shows they are needed.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="/partners/enterprise">
              Discuss an assessment <span>→</span>
            </a>
            <a className="primary-link" href="/assurance">
              Explore the method <span>↗</span>
            </a>
          </div>
        </div>
        <aside className="hero-proof-index" aria-label="The assurance approach">
          <span>ONE WORKFLOW FIRST</span>
          <ol>
            <li>
              <b>01</b>
              <strong>Establish</strong>
              <small>Separate observed facts from inferred state.</small>
            </li>
            <li>
              <b>02</b>
              <strong>Bound</strong>
              <small>Identify what current permission allows.</small>
            </li>
            <li>
              <b>03</b>
              <strong>Preserve</strong>
              <small>Leave evidence a reviewer can inspect.</small>
            </li>
          </ol>
          <a href="/registry">Inspect the public evidence →</a>
        </aside>
      </section>
      <div className="statement-band" aria-label="JCEE Labs principles">
        <span>CONFIDENCE IS NOT AUTHORITY</span>
        <span aria-hidden="true">•</span>
        <span>EVIDENCE BEFORE ACTION</span>
        <span aria-hidden="true">•</span>
        <span>HUMAN ACCOUNTABILITY</span>
      </div>
      <section className="company-section" id="company">
        <div className="section-index">
          <span>01 / START WITH AN EXPENSIVE UNCERTAINTY</span>
          <span>CONSEQUENTIAL WORKFLOW ASSESSMENT</span>
        </div>
        <div className="company-statement">
          <p>ONE WORKFLOW. A CLEARER DECISION.</p>
          <h2>
            It says it worked.
            <br />
            <em>What does the evidence say?</em>
          </h2>
        </div>
        <div className="customer-problem-grid">
          <article>
            <h3>The request timed out. Did it act?</h3>
            <p>
              Examine the evidence available after an interrupted payment,
              refund, or automated action before deciding whether to retry.
            </p>
            <a href="/vow">Evidence-aware recovery →</a>
          </article>
          <article>
            <h3>The approval changed. Can it continue?</h3>
            <p>
              Map the action to its authority source, scope, and freshness.
              A plausible answer is not permission to change another system.
            </p>
            <a href="/assurance">Evidence and authority →</a>
          </article>
          <article>
            <h3>The team cannot explain the outcome.</h3>
            <p>
              Identify missing observations, failure paths, and review records.
              Leave with a bounded report and a prioritized control plan.
            </p>
            <a href="/partners/enterprise">Scope an assessment →</a>
          </article>
        </div>
        <div className="company-bottom">
          <p>
            Learn the method. Assess one workflow. Implement the needed controls.
            Expand only when evidence and delivery readiness justify it.
          </p>
          <a href="/assurance">HOW JCEE ASSURANCE WORKS <span>→</span></a>
        </div>
      </section>
      <section
        className="operating-cloud-home"
        id="operating-cloud"
        aria-labelledby="operating-cloud-title"
      >
        <div className="operating-cloud-home__ambient" aria-hidden="true" />
        <div className="operating-cloud-home__frame">
          <div className="operating-cloud-home__topline">
            <span>02 / ASSURANCE IN OPERATING SOFTWARE</span>
            <span>PLATFORM DIRECTION · IN DEVELOPMENT</span>
          </div>
          <div className="operating-cloud-home__lead">
            <div>
              <p className="operating-cloud-home__kicker">
                JCEE OPERATING CLOUD
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
              <span>INDUSTRY APPLICATION · IN DEVELOPMENT</span>
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
            <p className="editorial-kicker">03 / THE TECHNOLOGY</p>
            <h2 id="technology-title">The method guides. The software implements.</h2>
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
            <a href="/assurance">Method and verification →</a>
          </article>
        </div>
        <div className="home-status-strip">
          <span>PUBLIC REGISTRY · REVIEWED SEPTEMBER 14, 2026</span>
          <a href="/registry">Milestones, candidates, and open gates →</a>
        </div>
      </section>
      <section
        className="editorial-section home-resources"
        aria-labelledby="resources-title"
      >
        <div className="editorial-section-heading">
          <div>
            <p className="editorial-kicker">04 / FROM THE LAB</p>
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
        <h2 id="principles-title">Intelligence should leave receipts.</h2>
        <p>
          We test our claims, preserve evidence including failures, and require
          current authority before consequential action. Human accountability
          remains.
        </p>
        <a className="editorial-text-link" href="/company">
          Meet JCEE Labs →
        </a>
      </section>
      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
