import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import WhoThisIsFor from "@/components/WhoThisIsFor";
import VowDurabilityDemo from "@/components/VowDurabilityDemo";
import { publications, publicationHref, publicationDate } from "@/content/publications";

const integrationSteps = [
  ["01", "Claim + evidence", "Start with the source instruction, observation, and the evidence revision that supports the proposed conclusion."],
  ["02", "Current authority", "Check the competent source of permission at the time of action. A proposal is not authority. Entitlement is not execution."],
  ["03", "Consequence", "The target system retains authority over the real-world effect. JCEE does not invent authority the target did not grant."],
  ["04", "Recovery", "Preserve intent, effect identity, and uncertainty across interruption. Missing evidence stays unknown; recovery is not blind retry."],
  ["05", "System of record", "Reconcile against the existing competent external record instead of replacing it with an internal model assertion."],
  ["06", "Receipt", "Retain an inspectable record of the authorized occurrence, the evidence basis, and what remains unresolved."],
] as const;
const assessmentDeliverables = [
  ["01", "Workflow boundary map", "Where the work starts, who owns it, which systems participate, and where a consequential effect can occur."],
  ["02", "Evidence and authority map", "Which records support the decision, which source grants permission, and where inference must remain separate from fact."],
  ["03", "Failure and recovery gaps", "Where timeout, partial completion, retry, revocation, or an uncertain external outcome can break accountability."],
  ["04", "Next justified step", "A bounded recommendation for the next test, shadow evaluation, implementation scope, or a finding that JCEE is not the right fit."],
] as const;
const latest = [...publications].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

export default function Home() {
  return (
    <main id="top" className="jcee-preview">
      <CoreHeader contactLabel="Free call" contactHref="/consultation" />
      <section id="page-content" tabIndex={-1} className="hero hybrid-hero">
        <div className="preview-hero-copy">
          <p className="preview-kicker"><span className="preview-dot" /> AI WORKFLOW INFRASTRUCTURE + TECHNICAL SERVICES</p>
          <h1>Engineering for<br /><em>accountable</em><br />AI workflows.</h1>
          <p className="preview-deck">From architecture and custom applications to testing and verification, JCEE Labs helps teams build systems with clear authority, recoverable workflows, and evidence of what happened.</p>
          <div className="preview-hero-actions">
            <a className="preview-button" href="/consultation">Request a free consultation <span aria-hidden="true">↗</span></a>
            <p className="preview-call-detail">Free first call · 10–30 minutes</p>
            <a className="preview-text-link" href="#distribution-demo">Inspect recorded proof <span aria-hidden="true">↓</span></a>
          </div>
          <p className="preview-disclosure">Reference software and recorded research evidence are available now. Customer savings and production performance have not yet been established.</p>
        </div>
        <aside className="preview-path" aria-labelledby="path-title">
          <div className="preview-panel-top"><span>THE PUBLIC INTEGRATION MODEL</span><span aria-hidden="true">01 — 06</span></div>
          <h2 id="path-title">From a proposed action<br />to an inspectable record.</h2>
          <p className="preview-panel-note">Illustrative control path · not live telemetry</p>
          <ol className="preview-path-list">
            {integrationSteps.map(([number, label]) => <li key={number}><span className="preview-path-number">{number}</span><strong>{label}</strong><span className="preview-path-check" aria-hidden="true">→</span></li>)}
          </ol>
          <div className="preview-path-boundary"><span>THE BOUNDARY</span><p>A supported conclusion does not create permission. The target system retains authority over the consequence.</p></div>
          <a className="preview-text-link" href="#technology">Inspect the integration contract <span aria-hidden="true">↘</span></a>
        </aside>
      </section>
      <div className="preview-principles"><span>EVIDENCE BEFORE CLAIM</span><span>PERMISSION BEFORE CONSEQUENCE</span><span>HUMAN ACCOUNTABILITY REMAINS</span></div>

      <section id="engage" className="preview-section preview-offer" aria-labelledby="engage-title">
        <div className="preview-section-label"><span>01 / THE OFFER</span><span>ONE WORKFLOW · WRITTEN SCOPE · WRITTEN RESULT</span></div>
        <div className="preview-offer-layout">
          <div><p className="preview-kicker">WORKFLOW ASSURANCE ASSESSMENT</p><h2 id="engage-title">Start with one workflow.<br /><em>Leave with a written boundary.</em></h2>
            <p>Keep AI-assisted operations accountable. JCEE Labs helps teams improve consequential AI-assisted workflows with clear ownership, current permission, practical checks, and a record of what actually happened.</p>
            <div className="preview-commercial"><h3>Commercial model</h3><p>The free call is an introduction. The assessment is a separately scoped engagement: deliverables, access, exclusions, timing, and commercial terms are agreed in writing. No SaaS tier is implied.</p></div>
            <a className="preview-text-link" href="/partners/enterprise">DISCUSS ONE WORKFLOW <span aria-hidden="true">→</span></a>
          </div>
          <ol className="preview-deliverables">{assessmentDeliverables.map(([number, title, copy]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
        </div>
        <p className="preview-boundary-note">An assessment is not a certification, deployment, production-readiness promise, or grant of execution authority. Production changes and implementation remain separately authorized.</p>
      </section>
      <div id="fit" className="preview-fit"><WhoThisIsFor /></div>

      <section id="distribution-demo" className="preview-section preview-proof" aria-labelledby="distribution-demo-title">
        <div className="preview-section-label"><span>03 / RECORDED PROOF</span><span>SYNTHETIC REFERENCE · NOT CUSTOMER DATA</span></div>
        <div className="preview-proof-layout">
          <div><p className="preview-kicker">JCEE DISTRIBUTION</p><h2 id="distribution-demo-title">A mismatch needs review.<br /><em>Not silent authority.</em></h2>
            <p>JCEE Distribution is one bounded, synthetic order-integrity workflow. A purchase order is compared with the entered sales order, and a discrepancy is surfaced for a person to investigate.</p>
            <p>The point is not the order screen. The point is the control pattern: preserve the source instruction, compare the observed state, surface the mismatch, keep the decision with the accountable person, and record the result.</p>
            <a className="preview-text-link" href="/blog/distribution-first-dry-run">Read the recorded dry-run result <span aria-hidden="true">↗</span></a><a className="preview-text-link" href="/solutions/distribution">Explore the Distribution application <span aria-hidden="true">→</span></a>
          </div>
          <article className="preview-record" aria-label="Illustrative rendering of the tested synthetic order-integrity workflow, not customer data">
            <div className="preview-panel-top"><span>DISTRIBUTION REFERENCE IMPLEMENTATION</span><span>SYNTHETIC</span></div>
            <p className="preview-record-date">Recorded <time dateTime="2026-09-14">September 14, 2026</time> · not a customer deployment</p>
            <h3>Purchase-order instruction<br />→ sales-order review</h3>
            <dl className="preview-record-lines"><div><dt>Source instruction</dt><dd>Use customer freight account</dd></div><div><dt>Observed sales order</dt><dd>Freight account not recorded</dd></div><div><dt>Comparison result</dt><dd><span className="preview-status">Needs review</span></dd></div><div><dt>Human decision boundary</dt><dd>A person investigates. The discrepancy does not authorize a change.</dd></div></dl>
            <div className="preview-proof-numbers"><div><strong>20 / 20</strong><span>Expected synthetic classifications matched</span></div><div><strong>4</strong><span>Result categories exercised</span></div><div><strong>0</strong><span>External effects</span></div></div>
          </article>
        </div>
        <p className="preview-boundary-note">This establishes comparison mechanics on the tested synthetic cases. It does not establish customer ROI, live integration, or production readiness. A limited, approved shadow evaluation is the next commercial gate.</p>
      </section>

      <section id="technology" className="preview-section preview-integration" aria-labelledby="technology-title">
        <div className="preview-section-label"><span>04 / INTEGRATION AND PROOF</span><a href="/technology">Technical integration <span aria-hidden="true">↗</span></a></div>
        <div className="preview-section-heading"><h2 id="technology-title">Keep your systems.<br /><em>Make the boundaries explicit.</em></h2><p>JCEE is implemented reference software, not a generic SDK announcement. This public semantic contract describes the binding between systems; a private integration starts with one bounded workflow and keeps the buyer’s existing systems in place.</p></div>
        <p className="preview-semantic-sequence">Claim + evidence → authority → consequence → recovery → system of record → receipt.</p>
        <ol className="preview-integration-steps" aria-label="JCEE public integration binding path">{integrationSteps.map(([number, label, copy]) => <li key={number}><span>{number}</span><h3>{label}</h3><p>{copy}</p></li>)}</ol>
        <p className="preview-panel-note">Each arrow is a binding between evidence, authority, and external systems—not a library call.</p>
        <div className="preview-proof-status" aria-label="Current JCEE evidence and availability">
          <article><p className="preview-kicker">BUILT / TESTED</p><h3>Bounded reference behavior.</h3><p>Frozen or reproduced VOW and QCS milestones, the interactive VOW recovery reference, and the recorded Distribution synthetic comparison.</p><a className="preview-text-link" href="/qcs">QCS transition research →</a></article>
          <article><p className="preview-kicker">AVAILABLE TO SCOPE</p><h3>One Workflow Assurance Assessment.</h3><p>Map one consequential workflow, current evidence, authority, recovery gaps, and the next justified test or implementation step.</p><a className="preview-text-link" href="/partners/enterprise">Start a conversation →</a></article>
          <article><p className="preview-kicker">NOT YET ESTABLISHED</p><h3>Production claims we do not make.</h3><p>Customer ROI, production performance, generic public SDK or API availability, production certification, and autonomous operating authority have not been established.</p><a className="preview-text-link" href="/registry">PUBLIC REGISTRY →</a></article>
        </div>
      </section>

      <section id="working-example" className="preview-section preview-recovery" aria-labelledby="working-example-title">
        <div className="preview-section-label"><span>WORKING SOFTWARE / VOW</span><span>REFERENCE DEMONSTRATION · NOT A CUSTOMER DEPLOYMENT</span></div>
        <div className="preview-section-heading"><h2 id="working-example-title">Interrupt the work.<br /><em>Inspect what survives.</em></h2><div><p>This interactive VOW reference demonstrates one implemented JCEE behavior: preserving execution evidence across interruption and recovery.</p><p className="preview-panel-note">Synthetic execution and demonstration data. This is not a customer case study, production deployment, or proof of customer ROI.</p></div></div>
        <VowDurabilityDemo />
        <a className="preview-text-link" href="/vow">Read the technical JCEE VOW overview <span aria-hidden="true">↗</span></a>
      </section>

      <section className="preview-section preview-method" aria-label="Method and current evidence boundaries">
        <div id="company" className="preview-method-row"><div><p className="preview-kicker">JCEE ASSURANCE</p><h2>The method above the mechanisms.</h2></div><div><p>Keep observation, judgment, current permission, and the resulting record distinct. Start with one consequential question and expand only when the evidence justifies it.</p><a className="preview-text-link" href="/assurance">Explore the full assurance method →</a></div></div>
<div className="precision-home">
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
      </div>
        <div id="evidence-frontier" className="preview-evidence-row"><div><p className="preview-kicker">EVIDENCE / OPEN GATES</p><h3>Test status is not certification.</h3></div><div><p>JCEE-INFRA: P0 contract frozen; P1 and P2 bounded test passes; P3 partial and held. The payment consequence lane has not qualified. Two research proposals are not physically validated. Each claim retains its conditions, unresolved gates, and independent-review limits.</p><div className="preview-evidence-links"><a href="/research#evidence-ladder">Evidence ladder ↗</a><a href="/technology#infrastructure-build">Infrastructure gates ↗</a><a href="/research#physical-validation">Physical-test boundaries ↗</a></div></div></div>
      </section>

      <section className="preview-section recent-progress preview-progress" aria-labelledby="progress-title">
        <div className="preview-section-label"><span>05 / SELECTED PROGRESS</span><a href="/resources">Full publication archive ↗</a></div>
        <h2 id="progress-title">The thinking behind the work.</h2>
        <div className="preview-progress-grid">{latest.map(item => <article key={item.slug}><p className="preview-kicker"><time dateTime={item.date}>{publicationDate(item.date)}</time></p><h3><a href={publicationHref(item)}>{item.title}</a></h3><p>{item.summary}</p><a className="preview-text-link" href={publicationHref(item)}>Read the article <span aria-hidden="true">↗</span></a></article>)}</div>
      </section>
      <section id="consultation" className="preview-section preview-consultation-close" aria-labelledby="consultation-title">
        <div><p className="preview-kicker">A CLEAR FIRST STEP</p><h2 id="consultation-title">Bring us the problem.<br /><em>Start with a conversation.</em></h2><p>AI and software architecture, custom applications, iOS/mobile development, testing and verification, technical research, systems analysis, and engineering design. Available to discuss and scope—not a claim of production qualification.</p></div>
        <div className="preview-close-action"><a className="preview-button" href="/consultation">Request a free consultation <span aria-hidden="true">↗</span></a><p>Free first call · 10–30 minutes</p><small>No paid work before an agreed scope.</small></div>
      </section>
      <div id="charter" className="preview-footer-principle"><span>INTELLIGENCE THAT LEAVES RECEIPTS.</span><a href="/charter">Our charter ↗</a></div>
      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
