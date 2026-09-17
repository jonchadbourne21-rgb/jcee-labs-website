import { FormEvent, useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import { buildPartnerInquiryMailto } from "@/lib/partnerInquiry";

const enterpriseFit = [
  ["WORK GETS STUCK", "A recurring workflow needs manual follow-up, repeated checking, or reconstruction before anyone knows it is finished."],
  ["OUTCOMES GET UNCLEAR", "A timeout, partial completion, duplicate request, or handoff makes it difficult to tell what actually happened."],
  ["PERMISSION CAN CHANGE", "Approvals, policies, ownership, or source data can change between a decision and the action that follows."],
  ["THE RECORD MATTERS", "Operators, customers, auditors, or counterparties need an inspectable account of what happened and why."],
];

export default function EnterprisePartnersPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Discuss a Workflow — JCEE Labs";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const openInquiryDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);

    window.location.href = buildPartnerInquiryMailto("enterprise", {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      organization: String(data.get("organization") || ""),
      role: String(data.get("role") || ""),
      focus: String(data.get("domain") || ""),
      timeline: String(data.get("timeline") || ""),
      primaryLabel: "Workflow and where it gets stuck",
      primary: String(data.get("system") || ""),
      evidenceLabel: "Current tools, checks, and handoffs",
      evidence: String(data.get("controls") || ""),
      outcomeLabel: "What a useful first engagement should establish",
      outcome: String(data.get("outcome") || ""),
    });
  };

  return (
    <main className="program-page partner-page partner-path-page enterprise-partner-page" id="top">
      <CoreHeader current="partners" />

      <section id="page-content" tabIndex={-1} className="program-masthead partner-masthead enterprise-partner-masthead">
        <p className="eyebrow"><span /> WORK WITH JCEE · ONE WORKFLOW FIRST</p>
        <div className="program-number">JCEE LABS / WORKFLOW INQUIRY</div>
        <h1>
          Bring us the workflow<br />
          <em>your team cannot confidently close.</em>
        </h1>
        <p className="program-deck">
          Start with the operational problem, not JCEE terminology. Tell us what the work is,
          where it gets stuck or becomes uncertain, which systems are involved, and what your
          team needs to know at the end. The deeper engineering goal is to make consequential software
          answerable in operation without asking the buyer to learn our internal vocabulary first.
        </p>
        <div className="program-status-row">
          <span>FIRST STEP · WRITTEN BOUNDARY REVIEW</span>
          <span>NO PAID WORK BEFORE AGREED SCOPE</span>
        </div>
      </section>

      <section className="partner-fit enterprise-fit" aria-labelledby="enterprise-fit-title">
        <div className="section-index">
          <span>01 / GOOD FIT</span>
          <span>WORKFLOW · HANDOFF · RECOVERY · EVIDENCE</span>
        </div>
        <div className="partner-fit-intro">
          <p>START HERE</p>
          <h2 id="enterprise-fit-title">A specific workflow with a specific failure.</h2>
          <p>
            We are most useful when the problem can be tied to an action, an owner,
            the systems involved, and an outcome that can be checked.
          </p>
        </div>
        <div className="partner-signal-grid">
          {enterpriseFit.map(([label, copy], index) => (
            <article key={label}>
              <span>0{index + 1} / {label}</span>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="partner-engagement-model" aria-labelledby="enterprise-engagement-title">
        <div className="section-index light">
          <span>02 / WHAT HAPPENS NEXT</span>
          <span>CLEAR SCOPE BEFORE COMMITMENT</span>
        </div>
        <div className="partner-shared-layout">
          <div>
            <p className="partner-kicker">THE FIRST ENGAGEMENT</p>
            <h2 id="enterprise-engagement-title">Understand the workflow before prescribing software.</h2>
          </div>
          <ol className="partner-sequence">
            <li><span>01</span><strong>Review</strong><p>We read the workflow, current tools, owners, checks, and failure mode.</p></li>
            <li><span>02</span><strong>Map</strong><p>We identify the smallest boundary where clearer ownership, evidence, recovery, or software could help.</p></li>
            <li><span>03</span><strong>Scope</strong><p>If there is a fit, we define deliverables, acceptance criteria, required access, exclusions, timing, and commercial terms in writing.</p></li>
            <li><span>04</span><strong>Decide</strong><p>You receive a bounded recommendation. If JCEE is not useful for the problem, we say so rather than forcing an engagement.</p></li>
          </ol>
        </div>
      </section>

      <section className="partner-inquiry" aria-labelledby="enterprise-inquiry-title">
        <div className="section-index">
          <span>03 / WORKFLOW INQUIRY</span>
          <span>REVIEW BEFORE SEND</span>
        </div>
        <div className="partner-inquiry-layout">
          <div className="partner-inquiry-copy">
            <p className="partner-kicker">DESCRIBE THE WORK</p>
            <h2 id="enterprise-inquiry-title">Where does the workflow stop being clear?</h2>
            <p>
              This form opens an email draft for you to review and send.
              It does not create a contract or authorize paid work.
            </p>
            <dl>
              <div><dt>FIRST STEP</dt><dd>Written workflow boundary review</dd></div>
              <div><dt>IF THERE IS A FIT</dt><dd>Written scope and commercial proposal before paid work</dd></div>
              <div><dt>DIRECT</dt><dd><a href="mailto:support+enterprise@jceelabs.com">support+enterprise@jceelabs.com</a></dd></div>
            </dl>
          </div>

          <form className="partner-form enterprise-partner-form" onSubmit={openInquiryDraft}>
            <div className="partner-form-route">JCEE / WORKFLOW INQUIRY</div>
            <div className="partner-form-row">
              <label><span>NAME *</span><input name="name" autoComplete="name" required /></label>
              <label><span>WORK EMAIL *</span><input name="email" type="email" autoComplete="email" required /></label>
            </div>
            <div className="partner-form-row">
              <label><span>COMPANY *</span><input name="organization" autoComplete="organization" required /></label>
              <label><span>ROLE *</span><input name="role" autoComplete="organization-title" required /></label>
            </div>
            <div className="partner-form-row">
              <label>
                <span>WORKFLOW AREA *</span>
                <select name="domain" defaultValue="" required>
                  <option value="" disabled>Select an area</option>
                  <option>Distribution or back-office operations</option>
                  <option>AI and agent systems</option>
                  <option>Payments or financial operations</option>
                  <option>Cloud, data, or infrastructure</option>
                  <option>Regulated operations</option>
                  <option>Enterprise workflow automation</option>
                  <option>Other operational workflow</option>
                </select>
              </label>
              <label><span>TIMELINE</span><input name="timeline" placeholder="e.g. evaluating this quarter" /></label>
            </div>
            <label>
              <span>WORKFLOW AND WHERE IT GETS STUCK *</span>
              <textarea name="system" rows={6} required placeholder="What starts the work? Who owns it? Which systems are involved? Where does it stall, repeat, or become unclear?" />
            </label>
            <label>
              <span>CURRENT TOOLS, CHECKS, AND HANDOFFS</span>
              <textarea name="controls" rows={4} placeholder="How does your team handle this today? Include the systems, approvals, manual checks, logs, spreadsheets, or follow-up involved." />
            </label>
            <label>
              <span>WHAT SHOULD A USEFUL FIRST ENGAGEMENT ESTABLISH? *</span>
              <textarea name="outcome" rows={4} required placeholder="What decision, measurable improvement, or evidence would make the first engagement useful?" />
            </label>
            <div className="partner-form-submit">
              <button type="submit">OPEN EMAIL DRAFT <span aria-hidden="true">→</span></button>
              <p>Review the draft in your email app before sending.</p>
            </div>
          </form>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
