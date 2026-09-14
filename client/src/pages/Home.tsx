import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import { publications, publicationHref } from "@/content/publications";

export default function Home() {
  useEffect(() => {
    document.title = "JCEE Labs — Verified Operating Improvement";
  }, []);
  return (
    <main id="top" className="precision-home commercial-home">
      <CoreHeader />
      <section id="page-content" tabIndex={-1} className="hero hybrid-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> OPERATING SOFTWARE + EXECUTION ASSURANCE
          </p>
          <h1>
            Make everyday operations
            <br />
            <em>more accurate.</em>
          </h1>
          <p className="hero-deck">
            JCEE Labs is developing software that helps industrial distributors
            reconcile purchase orders with sales orders, investigate exceptions,
            and measure operational improvement—starting alongside the systems
            their teams already use.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="/solutions/distribution">
              Explore Distribution <span>→</span>
            </a>
            <a className="primary-link" href="/partners/enterprise">
              Discuss your workflow <span>↗</span>
            </a>
          </div>
        </div>
        <aside className="hero-proof-index" aria-label="Our approach">
          <span>START WITH THE WORK</span>
          <ol>
            <li>
              <b>01</b>
              <strong>Compare</strong>
              <small>Keep records true to the instructions.</small>
            </li>
            <li>
              <b>02</b>
              <strong>Investigate</strong>
              <small>Give every exception its context.</small>
            </li>
            <li>
              <b>03</b>
              <strong>Measure</strong>
              <small>Expand when the results justify it.</small>
            </li>
          </ol>
          <a href="/blog/start-with-the-workflow">Read our approach →</a>
        </aside>
      </section>
      <div className="statement-band" aria-label="JCEE Labs principles">
        <span>EVIDENCE OVER CLAIMS</span>
        <span aria-hidden="true">•</span>
        <span>CURRENT AUTHORITY</span>
        <span aria-hidden="true">•</span>
        <span>HUMAN ACCOUNTABILITY</span>
      </div>
      <section className="company-section" id="company">
        <div className="section-index">
          <span>01 / THE CUSTOMER’S WORK</span>
          <span>INDUSTRIAL DISTRIBUTION</span>
        </div>
        <div className="company-statement">
          <p>SMALL DISCREPANCIES. REAL WORK.</p>
          <h2>
            The order arrived.
            <br />
            <em>Did the details carry through?</em>
          </h2>
        </div>
        <div className="customer-problem-grid">
          <article>
            <h3>The freight account was missed.</h3>
            <p>
              The purchase order names a customer account. The sales order does
              not. Surface the difference with the instructions beside it.
            </p>
            <a href="/solutions/distribution">Order integrity →</a>
          </article>
          <article>
            <h3>The price or quantity changed.</h3>
            <p>
              Compare the order with its approved basis, so a person can
              investigate the discrepancy before deciding what to change.
            </p>
            <a href="/solutions/distribution">The first checks →</a>
          </article>
          <article>
            <h3>The team keeps checking by hand.</h3>
            <p>
              Measure the time spent checking, correcting, and escalating. The
              product should earn its place through supported operating value.
            </p>
            <a href="/blog/start-with-the-workflow">Our approach →</a>
          </article>
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
            <span>02 / JCEE OPERATING CLOUD</span>
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
            <p className="editorial-kicker">03 / THE TECHNOLOGY</p>
            <h2 id="technology-title">Built on execution assurance.</h2>
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
        <h2>Intelligence should leave receipts.</h2>
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
