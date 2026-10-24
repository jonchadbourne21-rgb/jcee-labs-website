import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import WhoThisIsFor from "@/components/WhoThisIsFor";
import EvidenceThreadScene from "@/components/EvidenceThreadScene";
import "@/evidence-thread.css";
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
  ["01", "Map of the workflow", "Where the work starts, who is responsible, which systems are involved, and where a record or real-world result can change."],
  ["02", "Records and permissions", "What information supports a decision, who can approve the action, and which facts still need checking."],
  ["03", "Failure and recovery gaps", "What happens if the process stops, permission is withdrawn, or nobody can tell whether an action finished."],
  ["04", "Written next step", "A clear recommendation for a test, an evaluation alongside the existing workflow, or an agreed implementation scope, including any fit concerns."],
] as const;
const latest = [...publications].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

export default function Home() {
  return (
    <main id="top" className="jcee-preview evidence-home">
      <CoreHeader contactLabel="Free call" contactHref="/consultation" />
      <section id="page-content" tabIndex={-1} className="hero hybrid-hero">
        <div className="et-hero-copy">
          <p className="et-eyebrow"><span className="et-brand-dot" /> JCEE LABS / ACCOUNTABLE SOFTWARE</p>
          <h1>When software acts,<br /><em>follow the evidence.</em></h1>
          <p className="et-hero-deck">Clear permission. Recoverable work. A record of what actually changed.</p>
          <p className="et-hero-description">JCEE Labs helps teams design, build, and test AI-assisted software.</p>
          <div className="et-hero-actions"><a className="et-primary" href="#working-example">Explore the demonstration <span aria-hidden="true">↘</span></a><a className="et-link" href="/consultation">Discuss your workflow <span aria-hidden="true">↗</span></a></div>
          <div className="et-hero-meta"><a href="/founder">Founded by Jonathan Matthew Chadbourne <span aria-hidden="true">↗</span></a><span>Dallas, Texas</span></div>
        </div>
        <figure className="et-hero-art">
          <svg viewBox="0 0 600 510" fill="none" aria-hidden="true">
            <defs><linearGradient id="et-thread" x1="100" y1="400" x2="480" y2="90" gradientUnits="userSpaceOnUse"><stop stopColor="#1236BD"/><stop offset=".48" stopColor="#3568FF"/><stop offset="1" stopColor="#97B9FF"/></linearGradient><linearGradient id="et-boundary" x1="270" y1="70" x2="410" y2="410" gradientUnits="userSpaceOnUse"><stop stopColor="#E8ECF2"/><stop offset="1" stopColor="#F7F8FA"/></linearGradient><filter id="et-shadow"><feGaussianBlur stdDeviation="12"/></filter></defs>
            <ellipse cx="310" cy="449" rx="170" ry="17" fill="#1C45A0" opacity=".09" filter="url(#et-shadow)"/>
            <path d="M70 374L298 506M52 286L396 485M52 194L493 449M92 125L546 387M176 81L557 301M255 37L555 210M76 404L486 167M76 310L408 118M81 216L327 74M168 449L549 229M249 496L556 319" stroke="#E1E5EB" strokeWidth="1"/>
            <path d="M269 80L414 164V381L269 297V80Z" fill="url(#et-boundary)" stroke="#CDD5E2"/>
            <path d="M269 80L285 71L430 155L414 164L269 80Z" fill="#FFF" stroke="#DCE1E9"/><path d="M414 164L430 155V372L414 381V164Z" fill="#D9E0EB"/>
            <path d="M54 339L143 288Q161 277 181 288L251 328Q273 341 296 328L345 300Q365 288 365 265V206Q365 184 385 172L455 132Q475 121 496 133L555 167" stroke="#E9EEFA" strokeWidth="29" strokeLinecap="round"/>
            <path className="et-flow-line" d="M54 339L143 288Q161 277 181 288L251 328Q273 341 296 328L345 300Q365 288 365 265V206Q365 184 385 172L455 132Q475 121 496 133L555 167" stroke="url(#et-thread)" strokeWidth="14" strokeLinecap="round"/>
            <path d="M274 165V251M286 172V258M298 179V265M310 186V272" stroke="#C7CFDD"/>
            <circle cx="65" cy="333" r="12" fill="#F8FAFF" stroke="#315CFF" strokeWidth="4"/><circle cx="365" cy="233" r="10" fill="#F8FAFF" stroke="#315CFF" strokeWidth="4"/><circle cx="546" cy="162" r="12" fill="#315CFF"/><path d="M541 162L545 166L551 158" stroke="white" strokeWidth="2"/>
            <g fill="#6A7484" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1.2"><text x="34" y="381">REQUEST</text><text x="314" y="418">AUTHORITY</text><text x="470" y="106">RECORD</text></g>
            <path d="M325 390L342 380M89 359L107 348M489 118L504 126" stroke="#A8B3C4"/>
          </svg>
          <figcaption><span className="et-art-index">01 — ∞</span><span>Intelligence that leaves receipts.</span></figcaption>
        </figure>
      </section>
      <div className="et-intro-strip"><p>Designed for the moment an instruction becomes an action.</p><a href="#distribution-demo">See a recorded example <span aria-hidden="true">↓</span></a></div>
      <section id="working-example" className="et-experience" aria-labelledby="working-example-title"><EvidenceThreadScene /></section>
      <div className="preview-principles"><span>EVIDENCE BEFORE CLAIM</span><span>PERMISSION BEFORE CONSEQUENCE</span><span>HUMAN ACCOUNTABILITY REMAINS</span></div>

      <section id="engage" className="preview-section preview-offer" aria-labelledby="engage-title">
        <div className="preview-section-label"><span>01 / THE OFFER</span><span>ONE WORKFLOW · WRITTEN SCOPE · WRITTEN RESULT</span></div>
        <div className="preview-offer-layout">
          <div><p className="preview-kicker">WORKFLOW ASSURANCE ASSESSMENT</p><h2 id="engage-title">Start with one workflow.<br /><em>Leave with a written assessment.</em></h2>
            <p>Bring one process that is difficult to trust, check, or recover. We map the handoffs, examine the permissions, and identify what needs testing before you give the software more responsibility.</p>
            <div className="preview-commercial"><h3>Commercial model</h3><p>The free call is an introduction. The assessment is a separately scoped engagement: deliverables, access, exclusions, timing, and commercial terms are agreed in writing. No SaaS tier is implied.</p></div>
            <a className="preview-text-link" href="/partners/enterprise">DISCUSS ONE WORKFLOW <span aria-hidden="true">→</span></a>
          </div>
          <ol className="preview-deliverables">{assessmentDeliverables.map(([number, title, copy]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
        </div>
        <p className="preview-boundary-note">Customer savings and production performance have not yet been established. An assessment is not a certification, deployment, production-readiness promise, or grant of execution authority. Production changes and implementation remain separately authorized.</p>
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
          <article><p className="preview-kicker">BUILT / TESTED</p><h3>Connected software, tested together.</h3><p>The October 19 JCEE-INFRA candidate joins evidence, authority, target-owned action controls, and recovery in a qualified fictional-ledger setting. Earlier VOW, QCS, and Distribution results retain their own boundaries.</p><a className="preview-text-link" href="/technology#current-integration">October 19 integration result →</a><a className="preview-text-link" href="/qcs">QCS transition research →</a><a className="preview-text-link" href="/vow">VOW runtime overview →</a></article>
          <article><p className="preview-kicker">AVAILABLE TO SCOPE</p><h3>One Workflow Assurance Assessment.</h3><p>Map one consequential workflow, current evidence, authority, recovery gaps, and the next justified test or implementation step.</p><a className="preview-text-link" href="/partners/enterprise">Start a conversation →</a></article>
          <article><p className="preview-kicker">NOT YET ESTABLISHED</p><h3>Production claims we do not make.</h3><p>Customer ROI, production performance, generic public SDK or API availability, production certification, and autonomous operating authority have not been established.</p><a className="preview-text-link" href="/registry">PUBLIC REGISTRY →</a></article>
        </div>
      </section>

      <section id="current-progress" className="preview-section preview-proof" aria-labelledby="current-progress-title">
        <div className="preview-section-label"><span>CURRENT ENGINEERING CHECKPOINT</span><time dateTime="2026-10-19">OCTOBER 19, 2026</time></div>
        <div className="preview-section-heading">
          <h2 id="current-progress-title">Permission changed.<br /><em>Recovery had to account for it.</em></h2>
          <div>
            <p>One reconciled software candidate is now in working integration with its qualified source tree preserved. We tested shared-source revocation, competing work, lost responses, and restoration from older records against the same configuration.</p>
            <p>Authorized controls completed. An already committed effect was reconciled without duplication. An uncertain outcome stayed held without permission to retry.</p>
          </div>
        </div>
        <p className="preview-boundary-note">Recorded in a controlled PostgreSQL ledger with fictional data and a separately protected checkpoint that survives restoration. This is a bounded software result; production admission, external human review, and physical commitment qualification remain open.</p>
        <div className="preview-evidence-links"><a href="/technology#current-integration">Inspect the result and scope ↗</a><a href="/registry#infra-integrated-software">Dated registry entry ↗</a></div>
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
        <div id="evidence-frontier" className="preview-evidence-row"><div><p className="preview-kicker">EVIDENCE / OPEN GATES</p><h3>Test status is not certification.</h3></div><div><p>The October 19 integrated software result is recorded with its scope. P0 remains frozen; earlier P1 and P2 passes stay bounded; P3 is partial and held. The payment consequence lane and E003 physical commitment remain unqualified. Biological proposals are not physically validated; numerical models retain separate evidence boundaries.</p><div className="preview-evidence-links"><a href="/research#evidence-ladder">Evidence ladder ↗</a><a href="/technology#infrastructure-build">Infrastructure gates ↗</a><a href="/research#physical-validation">Physical-test boundaries ↗</a></div></div></div>
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
