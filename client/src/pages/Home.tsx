import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import VowDurabilityDemo from "@/components/VowDurabilityDemo";
import { publications, publicationHref } from "@/content/publications";

const methodQuestions = [
  {
    title: "What was actually observed?",
    copy: "Keep source records and authoritative external facts distinct from transformed state, inference, and model judgment.",
  },
  {
    title: "What does the evidence support?",
    copy: "Define a claim that can fail, test it against explicit rules, and say exactly where the conclusion stops.",
  },
  {
    title: "What is allowed now?",
    copy: "A supported conclusion does not create permission. Current policy still decides whether a consequential action may happen.",
  },
];

export default function Home() {
  useEffect(() => {
    document.title = "JCEE Labs — Accountable AI-Assisted Operations";
  }, []);

  return (
    <main id="top" className="precision-home commercial-home">
      <CoreHeader />
      <section id="page-content" tabIndex={-1} className="hero hybrid-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> JCEE ASSURANCE METHOD
          </p>
          <h1>
            Keep AI-assisted work
            <br />
            <em>accountable.</em>
          </h1>
          <p className="hero-deck">
            JCEE is developing methods and software that connect operational
            actions to clear permissions, reviewable evidence, and human control.
            Start with one workflow where being wrong would matter, make the
            evidence boundary visible, and let the result earn the next step.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#distribution-demo">
              See it in one workflow <span>↓</span>
            </a>
            <a className="primary-link" href="/partners/enterprise">
              Discuss an assessment <span>↗</span>
            </a>
          </div>
          <p className="quiet">
            Reference software and bounded research milestones are available now.
            Customer savings and production performance have not yet been established.
          </p>
        </div>
        <aside className="hero-proof-index" aria-label="What accountable operation means">
          <span>THE CONTROL PATH</span>
          <ol>
            <li>
              <b>01</b>
              <strong>Observe</strong>
              <small>Keep source instructions and observed state separate.</small>
            </li>
            <li>
              <b>02</b>
              <strong>Judge</strong>
              <small>Show what the evidence supports and what remains unresolved.</small>
            </li>
            <li>
              <b>03</b>
              <strong>Authorize</strong>
              <small>Allow only the next action that current permission supports.</small>
            </li>
            <li>
              <b>04</b>
              <strong>Record</strong>
              <small>Leave an inspectable receipt of the decision and result.</small>
            </li>
          </ol>
          <a href="/assurance">Explore the full method →</a>
        </aside>
      </section>

      <div className="statement-band" aria-label="JCEE Labs principles">
        <span>EVIDENCE BEFORE CLAIM</span>
        <span aria-hidden="true">•</span>
        <span>PERMISSION BEFORE CONSEQUENCE</span>
        <span aria-hidden="true">•</span>
        <span>HUMAN ACCOUNTABILITY REMAINS</span>
      </div>

      <section
        className="editorial-section editorial-section-light distribution-intro"
        id="distribution-demo"
        aria-labelledby="distribution-demo-title"
      >
        <div>
          <p className="editorial-kicker">01 / SEE THE METHOD IN ONE WORKFLOW</p>
          <h2 id="distribution-demo-title">
            A mismatch should create a question, not silently create authority.
          </h2>
          <p>
            JCEE Distribution is the first concrete application of the method.
            In the current synthetic prototype, a purchase order can be compared
            with the entered sales order and a discrepancy can be surfaced for a
            person to investigate.
          </p>
          <p>
            Distribution demonstrates JCEE; it does not define JCEE&apos;s limits.
            The same separation among evidence, judgment, permission, and action
            is the broader company direction.
          </p>
          <a className="editorial-text-link" href="/blog/distribution-first-dry-run">
            Read the recorded dry-run result →
          </a>
        </div>
        <div
          className="order-example"
          aria-label="Illustrative rendering of the tested synthetic order-integrity workflow, not customer data"
        >
          <p className="editorial-kicker">SYNTHETIC WORKFLOW DEMONSTRATION</p>
          <h3>Purchase-order instruction → sales-order review</h3>
          <dl>
            <div>
              <dt>Source instruction</dt>
              <dd>Use customer freight account</dd>
            </div>
            <div>
              <dt>Observed sales order</dt>
              <dd>Freight account not recorded</dd>
            </div>
            <div>
              <dt>Comparison result</dt>
              <dd>
                <span className="status-label">Needs review</span>
              </dd>
            </div>
            <div>
              <dt>Human decision boundary</dt>
              <dd>A person investigates. The discrepancy does not authorize a change.</dd>
            </div>
            <div>
              <dt>Current recorded result</dt>
              <dd>20 / 20 expected synthetic classifications · 0 external effects</dd>
            </div>
          </dl>
          <p>
            Illustrative rendering, not customer data. Customer ROI, live
            integration, and production readiness remain unestablished. A limited,
            approved shadow evaluation is the next commercial gate.
          </p>
        </div>
      </section>

      <section className="company-section" id="company">
        <div className="section-index">
          <span>02 / THE METHOD</span>
          <span>METHOD ABOVE MECHANISMS</span>
        </div>
        <div className="company-statement">
          <p>MAKE THE BOUNDARY VISIBLE</p>
          <h2>
            What has to be true
            <br />
            <em>before software changes the world?</em>
          </h2>
        </div>
        <div className="customer-problem-grid">
          {methodQuestions.map(question => (
            <article key={question.title}>
              <h3>{question.title}</h3>
              <p>{question.copy}</p>
            </article>
          ))}
        </div>
        <div className="company-bottom">
          <p>
            The method is intentionally usable before a team adopts JCEE software.
            Start with one consequential question, preserve what happened, and
            expand only when the evidence justifies it.
          </p>
          <a href="/assurance">EXPLORE THE JCEE ASSURANCE METHOD <span>→</span></a>
        </div>
      </section>

      <section className="vow-section" id="working-example" aria-labelledby="working-example-title">
        <div className="section-index light">
          <span>03 / WORKING SOFTWARE</span>
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
              This interactive VOW reference demonstrates one implemented JCEE
              behavior: preserving execution evidence across interruption and recovery.
              It provides software evidence alongside the Distribution workflow example.
            </p>
            <p className="quiet">
              Synthetic execution and demonstration data. This is not a customer
              case study, production deployment, or proof of customer ROI.
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
            <span>04 / METHOD INTO SOFTWARE</span>
            <span>PLATFORM DIRECTION · IN DEVELOPMENT</span>
          </div>
          <div className="operating-cloud-home__lead">
            <div>
              <p className="operating-cloud-home__kicker">JCEE OPERATING CLOUD</p>
              <h2 id="operating-cloud-title">
                The method sits above the mechanisms.
              </h2>
            </div>
            <div className="operating-cloud-home__lead-copy">
              <p>
                JCEE systems implement different assurance obligations: evidence
                capture, authority and contract boundaries, durable execution,
                recovery, verification, replay, and review. The layers stay
                distinct so one green signal cannot silently stand in for truth
                or permission.
              </p>
              <p className="operating-cloud-home__boundary">
                Operating Cloud is a platform direction, not a production-certification
                claim. Broader workflow ownership remains to be demonstrated.
              </p>
            </div>
          </div>
          <div
            className="operating-cloud-home__systems"
            aria-label="Assurance architecture"
          >
            <span>THE STACK</span>
            <div>
              <b>METHOD</b>
              <b>EVIDENCE</b>
              <b>AUTHORITY</b>
              <b>RUNTIME</b>
              <b>RECEIPT</b>
            </div>
          </div>
          <div className="operating-cloud-home__distribution">
            <div>
              <span>FIRST INDUSTRY APPLICATION · IN DEVELOPMENT</span>
              <h3>JCEE Distribution</h3>
            </div>
            <div>
              <p>
                Distribution supplies a concrete operating environment for the
                method. It remains one application of the broader assurance and
                execution architecture, not the company&apos;s limiting identity.
              </p>
              <a href="/solutions/distribution">
                EXPLORE THE DISTRIBUTION APPLICATION <span aria-hidden="true">→</span>
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
            <p className="editorial-kicker">05 / IMPLEMENTATION LAYERS</p>
            <h2 id="technology-title">The method guides. The systems implement.</h2>
          </div>
          <a href="/technology">Explore the technology →</a>
        </div>
        <div className="technology-grid">
          <article>
            <p className="editorial-kicker">JCEE VOW</p>
            <h3>Execute and recover with evidence.</h3>
            <p>
              VOW preserves intent, ambiguity, recovery decisions, effect identity,
              and receipts around consequential workflows. VOW 1.1 remains the
              frozen milestone; 1.1.1.dev3 is a private development candidate.
            </p>
            <a href="/vow">Runtime and interactive demo →</a>
          </article>
          <article>
            <p className="editorial-kicker">QCS</p>
            <h3>Reason about the next action.</h3>
            <p>
              The frozen QCS-2.0 specification passed its recorded reproduction
              gate across two tested authority classes. Its scope remains bounded
              to the evidence behind that result.
            </p>
            <a href="/qcs">Research and interactive model →</a>
          </article>
          <article>
            <p className="editorial-kicker">JCEE ASSURANCE</p>
            <h3>Make the judgment inspectable.</h3>
            <p>
              Portable evidence, named verification rules, and bounded conclusions
              help a reviewer see where the evidence supports a claim and where it stops.
            </p>
            <a href="/assurance">Method and verification →</a>
          </article>
        </div>
        <div className="home-status-strip">
          <span>PUBLIC REGISTRY · REVIEWED SEPTEMBER 14, 2026</span>
          <a href="/registry">Milestones, candidates, and open gates →</a>
        </div>
      </section>

      <section className="company-section" id="engage" aria-labelledby="engage-title">
        <div className="section-index">
          <span>06 / WORK WITH JCEE</span>
          <span>ONE QUESTION · ONE BOUNDARY · ONE WRITTEN RESULT</span>
        </div>
        <div className="company-statement">
          <p>THE FIRST COMMERCIAL STEP</p>
          <h2 id="engage-title">
            Start with one place
            <br />
            <em>where being wrong matters.</em>
          </h2>
        </div>
        <div className="customer-problem-grid">
          <article>
            <h3>Who it is for</h3>
            <p>
              Product, operations, platform, security, infrastructure, and risk
              teams using AI or automation where a wrong or unexplained action has
              a real operational cost.
            </p>
          </article>
          <article>
            <h3>What happens</h3>
            <p>
              We scope one workflow or claim, map its evidence and current
              authority, identify unresolved recovery or control gaps, and apply a
              bounded review.
            </p>
          </article>
          <article>
            <h3>What you receive</h3>
            <p>
              A written finding that states what the evidence supports, what
              remains unresolved, and the next justified test or implementation
              step.
            </p>
          </article>
        </div>
        <div className="company-bottom">
          <p>
            An assurance assessment is not a certification, deployment, or promise
            of production readiness. Software implementation, production changes,
            timing, and commercial terms remain separately scoped and agreed in writing.
          </p>
          <a href="/partners/enterprise">DISCUSS AN ASSURANCE ASSESSMENT <span>→</span></a>
        </div>
      </section>

      <section
        className="editorial-section home-resources"
        aria-labelledby="resources-title"
      >
        <div className="editorial-section-heading">
          <div>
            <p className="editorial-kicker">07 / FROM THE LAB</p>
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
          Possibility is welcome. Evidence is explicit. Boundaries are visible.
          Consequences are earned. Receipts remain.
        </p>
        <a className="editorial-text-link" href="/company">
          Meet JCEE Labs →
        </a>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
