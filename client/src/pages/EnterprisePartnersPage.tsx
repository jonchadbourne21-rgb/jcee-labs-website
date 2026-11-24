import WorldLabMasthead from "@/components/WorldLabMasthead";
import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import "./home-editorial-refresh.css";
import CoreHeader from "@/components/CoreHeader";

const enterpriseFit = [
  ["WORK GETS STUCK", "A recurring workflow needs manual follow-up, repeated checking, or reconstruction before anyone knows it is finished."],
  ["OUTCOMES GET UNCLEAR", "A timeout, partial completion, duplicate request, or handoff makes it difficult to tell what actually happened."],
  ["PERMISSION CAN CHANGE", "Approvals, policies, ownership, or source data can change between a decision and the action that follows."],
  ["THE RECORD MATTERS", "Operators, customers, auditors, or counterparties need an inspectable account of what happened and why."],
];

export default function EnterprisePartnersPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Discuss a Workflow — JCEE WorldLab";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="program-page partner-page partner-path-page enterprise-partner-page" id="top">
      <CoreHeader current="partners" />
      <WorldLabMasthead className="partner-masthead enterprise-partner-masthead" artwork="company" signature="Enterprise pathway">
        <p className="eyebrow"><span /> WORK WITH JCEE · ONE WORKFLOW FIRST</p>
        <div className="program-number">JCEE WorldLab / WORKFLOW INQUIRY</div>
        <h1>Bring us the workflow<br /><em>your team cannot confidently close.</em></h1>
        <p className="program-deck">
          Tell us what the work is,
          where it gets stuck or becomes uncertain, which systems are involved, and what your
          team needs to know at the end. Make high-impact software accountable in operation
          with clear permissions, tested recovery, and a result your team can review.
        </p>
        <div className="program-status-row"><span>FIRST STEP · WORKFLOW ASSURANCE ASSESSMENT</span><span>NO PAID WORK BEFORE AGREED SCOPE</span></div>
      </WorldLabMasthead>

      <section className="partner-fit enterprise-fit" aria-labelledby="enterprise-fit-title">
        <div className="section-index"><span>GOOD FIT</span><span>WORKFLOW · HANDOFF · RECOVERY · EVIDENCE</span></div>
        <div className="partner-fit-intro"><p>START HERE</p><h2 id="enterprise-fit-title">A specific workflow with a specific failure.</h2><p>We are most useful when the problem can be tied to an action, an owner, the systems involved, and an outcome that can be checked.</p></div>
        <div className="partner-signal-grid">{enterpriseFit.map(([label, copy]) => <article key={label}><span>{label}</span><p>{copy}</p></article>)}</div>
      </section>

      <section className="partner-engagement-model" aria-labelledby="enterprise-engagement-title">
        <div className="section-index light"><span>WHAT HAPPENS NEXT</span><span>CLEAR SCOPE BEFORE COMMITMENT</span></div>
        <div className="partner-shared-layout">
          <div>
            <p className="partner-kicker">WORKFLOW ASSURANCE ASSESSMENT</p>
            <h2 id="enterprise-engagement-title">Understand the workflow before prescribing software.</h2>
            <p>The assessment maps one important workflow: the request, the approvals, where it can fail, how it recovers, and how you confirm the result. You receive written findings, open gaps, and a clear next step.</p>
            <p>Production changes, software implementation, and deployment remain separately scoped and authorized.</p>
          </div>
          <ol className="partner-sequence">
            <li><span>01</span><strong>Review</strong><p>We read the workflow, current tools, owners, checks, and failure mode.</p></li>
            <li><span>02</span><strong>Map</strong><p>We identify the smallest boundary where clearer ownership, evidence, recovery, or software could help.</p></li>
            <li><span>03</span><strong>Scope</strong><p>If there is a fit, we define deliverables, acceptance criteria, required access, exclusions, timing, and commercial terms in writing.</p></li>
            <li><span>04</span><strong>Deliver</strong><p>You receive the workflow map, findings, open gaps, and a clear recommendation. If JCEE is not useful for the problem, we say so.</p></li>
          </ol>
        </div>
      </section>

      <section className="partner-inquiry" aria-labelledby="enterprise-inquiry-title">
        <div className="section-index"><span>DESCRIBE THE WORK</span><span>FREE FIRST CONVERSATION</span></div>
        <div className="partner-inquiry-layout">
          <div className="partner-inquiry-copy">
            <h2 id="enterprise-inquiry-title">Where does the workflow stop being clear?</h2>
            <p>Tell us about the workflow on our consultation page. Your request goes straight to our team, and we reply to agree a time.</p>
            <a className="partner-cta enterprise-inquiry-cta" href="/consultation">Discuss your workflow <span aria-hidden="true">→</span></a>
            <dl>
              <div><dt>FIRST STEP</dt><dd>Workflow Assurance Assessment</dd></div>
              <div><dt>IF THERE IS A FIT</dt><dd>Written scope and commercial proposal before paid work</dd></div>
              <div><dt>DIRECT</dt><dd><a href="mailto:sales@jceelabs.com">sales@jceelabs.com</a></dd></div>
            </dl>
          </div>
        </div>
      </section>
      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
