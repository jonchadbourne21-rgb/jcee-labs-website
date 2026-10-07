import WhoThisIsFor from "@/components/WhoThisIsFor";
import usePageSeo from "@/components/usePageSeo";
import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import VowDurabilityDemo from "@/components/VowDurabilityDemo";
import {
  publications,
  publicationHref,
  publicationDate,
} from "@/content/publications";

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
  usePageSeo("/");

  return (
    <main id="top" className="precision-home commercial-home">
      <CoreHeader />
<section id="page-content" tabIndex={-1} className="hero hybrid-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> ACCOUNTABLE AI · PERMISSION · EVIDENCE
          </p>
          <h1>
            Keep AI-assisted operations
            <br />
            <em>accountable.</em>
          </h1>
          <p className="hero-deck">
            JCEE Labs helps teams improve consequential AI-assisted workflows
            with clear ownership, current permission, practical checks, and a
            record of what actually happened.
          </p>
          <p className="hero-deck">
            Start with one workflow where “assigned” and “done” are separated by
            manual checking, uncertain outcomes, or changing authority. Map the
            boundary before changing the system.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="/partners/enterprise">
              Scope one workflow <span>↗</span>
            </a>
            <a className="primary-link" href="#distribution-demo">
              Inspect recorded proof <span>↓</span>
            </a>
          </div>
          <p className="quiet">
            First commercial engagement: a bounded Workflow Assurance Assessment.
            Reference software and recorded research evidence are available now;
            customer savings and production performance have not yet been established.
          </p>
        </div>
        <aside
          className="hero-proof-index"
          aria-label="What accountable operation means"
        >
          <span>THE CONTROL PATH</span>
          <ol>
            <li>
              <b>01</b>
              <strong>Observe</strong>
              <small>
                Keep source instructions and observed state separate.
              </small>
            </li>
            <li>
              <b>02</b>
              <strong>Judge</strong>
              <small>
                Show what the evidence supports and what remains unresolved.
              </small>
            </li>
            <li>
              <b>03</b>
              <strong>Authorize</strong>
              <small>
                Allow only the next action that current permission supports.
              </small>
            </li>
            <li>
              <b>04</b>
              <strong>Record</strong>
              <small>
                Leave an inspectable receipt of the decision and result.
              </small>
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
        className="company-section"
        id="engage"
        aria-labelledby="engage-title"
      >
        <div className="section-index">
          <span>01 / WORKFLOW ASSURANCE ASSESSMENT</span>
          <span>ONE WORKFLOW · WRITTEN SCOPE · WRITTEN RESULT</span>
        </div>
        <div className="company-statement">
          <p>THE OFFER</p>
          <h2 id="engage-title">
            Start with one workflow.
            <br />
            <em>Leave with a written boundary.</em>
          </h2>
        </div>
        <div className="customer-problem-grid">
          <article>
            <h3>Who it is for</h3>
            <p>
              Teams with one recurring AI-assisted or automated workflow where
              a wrong, duplicated, unauthorized, or unexplained action has real
              operational cost.
            </p>
          </article>
          <article>
            <h3>What happens</h3>
            <p>
              We trace the workflow from instruction and evidence through
              current authority, execution, recovery, and the observable result.
              We do not begin by asking you to replace your systems.
            </p>
          </article>
          <article>
            <h3>Commercial model</h3>
            <p>
              The assessment is a separately scoped engagement. Deliverables,
              access, exclusions, timing, and commercial terms are agreed in
              writing after the workflow review. No SaaS tier is implied.
            </p>
          </article>
        </div>
        <div className="resource-grid assessment-deliverables" aria-label="Workflow Assurance Assessment deliverables">
          <article className="resource-card">
            <p className="editorial-kicker">DELIVERABLE 01</p>
            <h3>Workflow boundary map</h3>
            <p>Where the work starts, who owns it, which systems participate, and where a consequential effect can occur.</p>
          </article>
          <article className="resource-card">
            <p className="editorial-kicker">DELIVERABLE 02</p>
            <h3>Evidence and authority map</h3>
            <p>Which records support the decision, which source grants permission, and where inference must remain separate from fact.</p>
          </article>
          <article className="resource-card">
            <p className="editorial-kicker">DELIVERABLE 03</p>
            <h3>Failure and recovery gaps</h3>
            <p>Where timeout, partial completion, retry, revocation, or an uncertain external outcome can break accountability.</p>
          </article>
          <article className="resource-card">
            <p className="editorial-kicker">DELIVERABLE 04</p>
            <h3>Next justified step</h3>
            <p>A bounded recommendation for the next test, shadow evaluation, implementation scope, or a finding that JCEE is not the right fit.</p>
          </article>
        </div>
        <div className="company-bottom">
          <p>
            An assessment is not a certification, deployment, production-readiness
            promise, or grant of execution authority. Production changes and
            implementation remain separately authorized.
          </p>
          <a href="/partners/enterprise">
            DISCUSS ONE WORKFLOW <span>→</span>
          </a>
        </div>
      </section>

      <WhoThisIsFor />

<section
        className="editorial-section editorial-section-light distribution-intro"
        id="distribution-demo"
        aria-labelledby="distribution-demo-title"
      >
        <div>
          <p className="editorial-kicker">
            03 / RECORDED PROOF
          </p>
          <h2 id="distribution-demo-title">
            A mismatch should create a question, not silently create authority.
          </h2>
          <p>
            JCEE Distribution is a working reference implementation of one bounded
            workflow. In the current demonstration, a purchase order is compared
            with the entered sales order and a discrepancy is surfaced for a
            person to investigate.
          </p>
          <p>
            The point is not the order screen. The point is the control pattern:
            preserve the source instruction, compare the observed state, surface
            the mismatch, keep the decision with the accountable person, and
            record the result.
          </p>
          <a
            className="editorial-text-link"
            href="/blog/distribution-first-dry-run"
          >
            Read the recorded dry-run result →
          </a>
        </div>
        <div
          className="order-example"
          aria-label="Illustrative rendering of the tested synthetic order-integrity workflow, not customer data"
        >
          <p className="editorial-kicker">
            DISTRIBUTION REFERENCE IMPLEMENTATION · DEMONSTRATION DATA · NOT A
            CUSTOMER DEPLOYMENT
          </p>
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
              <dd>
                A person investigates. The discrepancy does not authorize a
                change.
              </dd>
            </div>
            <div>
              <dt>Current recorded result</dt>
              <dd>
                20 / 20 expected synthetic classifications · 0 external effects
              </dd>
            </div>
          </dl>
          <p>
            Illustrative rendering, not customer data. Customer ROI, live
            integration, and production readiness remain unestablished. A
            limited, approved shadow evaluation is the next commercial gate.
          </p>
        </div>
      </section>

<section
        className="editorial-section editorial-section-light"
        id="technology"
        aria-labelledby="technology-title"
      >
        <div className="editorial-section-heading">
          <div>
            <p className="editorial-kicker">04 / PROOF AND INTEGRATION</p>
            <h2 id="technology-title">
              Know what exists today—and where the claim stops.
            </h2>
          </div>
          <a href="/technology">Technical detail →</a>
        </div>

        <div className="resource-grid proof-status-grid" aria-label="Current JCEE availability">
          <article className="resource-card">
            <p className="editorial-kicker">BUILT / TESTED</p>
            <h3>Reference behaviors with recorded evidence.</h3>
            <p>
              Frozen or reproduced VOW and QCS milestones, the interactive VOW
              reference, and the bounded synthetic Distribution comparison are
              represented in the Public Registry and supporting evidence.
            </p>
          </article>
          <article className="resource-card">
            <p className="editorial-kicker">AVAILABLE TO SCOPE</p>
            <h3>One Workflow Assurance Assessment.</h3>
            <p>
              A buyer can scope one consequential workflow, receive the written
              boundary and control findings, and decide whether a shadow
              evaluation or implementation step is justified.
            </p>
          </article>
          <article className="resource-card">
            <p className="editorial-kicker">NOT YET ESTABLISHED</p>
            <h3>Production claims we do not make.</h3>
            <p>
              Customer ROI, production performance, generic public SDK or API
              availability, production certification, and autonomous operating
              authority have not been established.
            </p>
          </article>
        </div>

        <div className="buyer-hierarchy">
          <p className="editorial-kicker">WHAT JCEE IS</p>
          <h2>Company, method, runtime, reference workflow, record.</h2>
          <div className="technology-grid buyer-hierarchy-grid">
            <article>
              <p className="editorial-kicker">JCEE LABS</p>
              <h3>The company.</h3>
              <p>Researches and builds accountable execution and assurance systems.</p>
            </article>
            <article>
              <p className="editorial-kicker">JCEE ASSURANCE</p>
              <h3>The method.</h3>
              <p>Separates evidence, judgment, permission, consequence, and the claim boundary.</p>
            </article>
            <article>
              <p className="editorial-kicker">JCEE VOW</p>
              <h3>The runtime reference.</h3>
              <p>Preserves durable intent, uncertainty, recovery decisions, effect identity, and receipts.</p>
            </article>
            <article>
              <p className="editorial-kicker">JCEE DISTRIBUTION</p>
              <h3>The workflow reference.</h3>
              <p>Applies the control pattern to a concrete order-integrity workflow using demonstration data.</p>
            </article>
            <article>
              <p className="editorial-kicker">PUBLIC REGISTRY</p>
              <h3>The evidence record.</h3>
              <p>Shows selected milestones, boundaries, current status, and what remains unresolved.</p>
            </article>
          </div>
          <div className="editorial-actions">
            <a className="editorial-text-link" href="/assurance">Assurance method →</a>
            <a className="editorial-text-link" href="/vow">VOW runtime →</a>
            <a className="editorial-text-link" href="/qcs">QCS transition research →</a>
          </div>
        </div>

        <div className="buyer-binding">
          <p className="editorial-kicker">THE PUBLIC BINDING PATH</p>
          <h2>From instruction to receipt without silently creating authority.</h2>
          <ol className="growth-sequence buyer-binding-sequence">
            <li>
              <span>01</span>
              <h3>Instruction / claim</h3>
              <p>Start with the source record, observation, or proposed action. A proposal is not authority.</p>
            </li>
            <li>
              <span>02</span>
              <h3>Evidence</h3>
              <p>Bind the conclusion to the records and revision that support it. Inference stays distinct from fact.</p>
            </li>
            <li>
              <span>03</span>
              <h3>Authority</h3>
              <p>Check the competent source of permission at the time of action. Entitlement is not execution.</p>
            </li>
            <li>
              <span>04</span>
              <h3>Consequence</h3>
              <p>The target system owns the real-world effect. JCEE does not invent authority the target did not grant.</p>
            </li>
            <li>
              <span>05</span>
              <h3>Recovery</h3>
              <p>Preserve intent and uncertainty across interruption. Missing evidence stays unknown; recovery is not blind retry.</p>
            </li>
            <li>
              <span>06</span>
              <h3>Verification / receipt</h3>
              <p>Check the observable outcome independently where possible and retain a reviewable record of what is known.</p>
            </li>
          </ol>
          <p className="editorial-intro">
            This is the public semantic contract, not a published SDK or
            protocol specification. Internal recovery law, verifier algorithms,
            receipt encoding, hostile-test corpora, adapter mechanics, and
            bypass analysis remain private.
          </p>
        </div>

        <div className="home-status-strip">
          <span>PUBLIC REGISTRY · CURRENT EVIDENCE AND OPEN GATES</span>
          <a href="/registry">Inspect the evidence record →</a>
        </div>
      </section>

<section
        className="vow-section"
        id="working-example"
        aria-labelledby="working-example-title"
      >
        <div className="section-index light">
          <span>05 / WORKING SOFTWARE</span>
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
              behavior: preserving execution evidence across interruption and
              recovery. It provides software evidence alongside the Distribution
              workflow example.
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

<section className="company-section" id="company">
        <div className="section-index">
          <span>06 / THE METHOD</span>
          <span>FULL METHOD · TECHNICAL DETAIL</span>
        </div>
        <div className="company-statement">
          <p>JCEE ASSURANCE</p>
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
            The method is intentionally usable before a team adopts JCEE
            software. Start with one consequential question, preserve what
            happened, and expand only when the evidence justifies it.
          </p>
          <a href="/assurance">
            EXPLORE THE JCEE ASSURANCE METHOD <span>→</span>
          </a>
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
            <span>07 / PLATFORM DIRECTION</span>
            <span>PLATFORM DIRECTION · IN DEVELOPMENT · AFTER THE BOUNDED WORKFLOW</span>
          </div>
          <div className="operating-cloud-home__lead">
            <div>
              <p className="operating-cloud-home__kicker">
                JCEE OPERATING CLOUD
              </p>
              <h2 id="operating-cloud-title">
                The method sits above the mechanisms.
              </h2>
            </div>
            <div className="operating-cloud-home__lead-copy">
              <p>
                Reconcile records and observations before promoting a
                conclusion. JCEE systems implement different assurance
                obligations: evidence capture, authority and contract
                boundaries, durable execution, recovery, verification, replay,
                and review. The layers stay distinct so one green signal cannot
                silently stand in for truth or permission.
              </p>
              <p className="operating-cloud-home__boundary">
                Operating Cloud is a platform direction, not a
                production-certification claim. Broader workflow ownership
                remains to be demonstrated.
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
                execution architecture, not the company&apos;s limiting
                identity.
              </p>
              <a href="/solutions/distribution">
                EXPLORE THE DISTRIBUTION APPLICATION{" "}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

<section
        className="editorial-section recent-progress"
        aria-labelledby="progress-title"
      >
        <div className="editorial-section-heading">
          <div>
            <p className="editorial-kicker">08 / RECENT PROGRESS · SEPTEMBER 2026</p>
            <h2 id="progress-title">Recent progress.</h2>
          </div>
          <a href="/registry">The current public record →</a>
        </div>
        <div className="resource-grid">
          <article className="resource-card">
            <p className="editorial-kicker">
              <time dateTime="2026-09-29">September 29, 2026</time> · NEW
              ARTICLE
            </p>
            <h3>
              <a href="/blog/a-confident-model-still-needs-permission">
                A confident model still needs permission.
              </a>
            </h3>
            <p>
              A practical look at why evidence, judgment, permission, and
              consequence need separate checks.
            </p>
            <a
              className="editorial-text-link"
              href="/blog/a-confident-model-still-needs-permission"
            >
              Read the article →
            </a>
          </article>
          <article className="resource-card">
            <p className="editorial-kicker">
              <time dateTime="2026-09-29">September 29, 2026</time> · EVIDENCE
              REVIEW
            </p>
            <h3>
              <a href="/registry#mise">
                MISE: the next question is repeated use.
              </a>
            </h3>
            <p>
              Preserved September 12 web MVP test evidence is now reflected in
              the registry. Repeated cooking, retention, and user value remain
              unvalidated.
            </p>
            <a className="editorial-text-link" href="/registry#mise">
              Read the evidence boundary →
            </a>
          </article>
          <article className="resource-card">
            <p className="editorial-kicker">
              <time dateTime="2026-09-29">September 29, 2026</time> · STATUS
              RECONCILED
            </p>
            <h3>
              <a href="/registry#distribution">
                Distribution: source merged, real workflow still to test.
              </a>
            </h3>
            <p>
              The private source merge is verified. The synthetic baseline is
              preserved; an approved, read-only shadow evaluation remains the
              next gate.
            </p>
            <a className="editorial-text-link" href="/registry#distribution">
              See current Distribution status →
            </a>
          </article>
        </div>
      </section>

<section
        className="editorial-section home-resources"
        aria-labelledby="resources-title"
      >
        <div className="editorial-section-heading">
          <div>
            <p className="editorial-kicker">09 / FROM THE LAB</p>
            <h2 id="resources-title">The work, in readable form.</h2>
          </div>
          <a href="/resources">All resources →</a>
        </div>
        <div className="resource-grid">
          {publications.map(item => (
            <article className="resource-card" key={item.slug}>
              <p className="editorial-kicker">
                {item.kind} ·{" "}
                <time dateTime={item.date}>{publicationDate(item.date)}</time>
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
        <h2 id="principles-title">
          We build intelligence that leaves receipts.
        </h2>
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
