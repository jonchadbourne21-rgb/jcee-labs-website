import { FormEvent, useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import { buildPartnerInquiryMailto } from "@/lib/partnerInquiry";

const enterpriseFit = [
  ["ACTION", "Software or an agent can change an external system, initiate a transaction, or continue work without its original operator."],
  ["AUTHORITY", "Permission changes over time, across tools, or at a boundary the acting system cannot safely infer."],
  ["RECOVERY", "Retries, partial completion, duplicate effects, or interrupted workflows create real operational exposure."],
  ["EVIDENCE", "Operators, customers, auditors, or counterparties need a durable account of what happened and why."],
];

export default function EnterprisePartnersPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Enterprise Partnerships — JCEE Labs";
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
      primaryLabel: "System and consequential action",
      primary: String(data.get("system") || ""),
      evidenceLabel: "Current controls and evidence",
      evidence: String(data.get("controls") || ""),
      outcomeLabel: "Decision or outcome required",
      outcome: String(data.get("outcome") || ""),
    });
  };

  return (
    <main className="program-page partner-page partner-path-page enterprise-partner-page" id="top">
      <CoreHeader current="partners" />

      <section className="program-masthead partner-masthead enterprise-partner-masthead">
        <p className="eyebrow"><span /> ENTERPRISE PARTNERSHIPS · OPERATIONAL SYSTEMS</p>
        <div className="program-number">JCEE LABS / PARTNERS / ENTERPRISE</div>
        <h1>
          Make consequential software<br />
          <em>answerable in operation.</em>
        </h1>
        <p className="program-deck">
          For product, platform, security, infrastructure, and risk teams that need stronger
          execution evidence, bounded authority, and recovery guarantees around systems that act.
        </p>
        <div className="program-status-row">
          <span>PATH · DESIGN / EVALUATION / INTEGRATION</span>
          <span>ROUTING · ENTERPRISE REVIEW</span>
        </div>
      </section>

      <section className="partner-fit enterprise-fit" aria-labelledby="enterprise-fit-title">
        <div className="section-index">
          <span>01 / FIT SIGNALS</span>
          <span>CONSEQUENCE · CONTROL · OPERATIONS</span>
        </div>
        <div className="partner-fit-intro">
          <p>ENTERPRISE FIT</p>
          <h2 id="enterprise-fit-title">A system boundary worth engineering.</h2>
          <p>
            The best fit is a specific operational path where a wrong, duplicated, stale,
            unauthorized, or unexplained action would materially matter.
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
          <span>02 / ENGAGEMENT MODEL</span>
          <span>SMALLEST USEFUL BOUNDARY FIRST</span>
        </div>
        <div className="partner-shared-layout">
          <div>
            <p className="partner-kicker">HOW WE START</p>
            <h2 id="enterprise-engagement-title">One workflow. One evidence boundary. One decision.</h2>
          </div>
          <ol className="partner-sequence">
            <li><span>01</span><strong>Frame</strong><p>Name the action, authority source, failure mode, and required record.</p></li>
            <li><span>02</span><strong>Evaluate</strong><p>Map current controls and identify where evidence or recovery becomes ambiguous.</p></li>
            <li><span>03</span><strong>Design</strong><p>Specify the smallest integration, experiment, or architecture change worth testing.</p></li>
            <li><span>04</span><strong>Decide</strong><p>Return a bounded result: proceed, narrow, reproduce, or stop.</p></li>
          </ol>
        </div>
      </section>

      <section className="partner-inquiry" aria-labelledby="enterprise-inquiry-title">
        <div className="section-index">
          <span>03 / ENTERPRISE INQUIRY</span>
          <span>ROUTED · ENTERPRISE</span>
        </div>
        <div className="partner-inquiry-layout">
          <div className="partner-inquiry-copy">
            <p className="partner-kicker">INITIATE ENTERPRISE REVIEW</p>
            <h2 id="enterprise-inquiry-title">Where does your system need stronger control?</h2>
            <p>
              Describe the workflow and the decision your team needs to make.
              This form opens an email draft for you to review and send.
            </p>
            <dl>
              <div><dt>ROUTE</dt><dd>Enterprise partnership review</dd></div>
              <div><dt>FIRST STEP</dt><dd>Written boundary assessment</dd></div>
              <div><dt>DIRECT</dt><dd><a href="mailto:support+enterprise@jceelabs.com">support+enterprise@jceelabs.com</a></dd></div>
            </dl>
          </div>

          <form className="partner-form enterprise-partner-form" onSubmit={openInquiryDraft}>
            <div className="partner-form-route">ENTERPRISE / OPERATIONAL INQUIRY</div>
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
                <span>OPERATIONAL DOMAIN *</span>
                <select name="domain" defaultValue="" required>
                  <option value="" disabled>Select a domain</option>
                  <option>AI and agent systems</option>
                  <option>Payments or financial operations</option>
                  <option>Cloud, data, or infrastructure</option>
                  <option>Regulated operations</option>
                  <option>Enterprise workflow automation</option>
                  <option>Other consequential system</option>
                </select>
              </label>
              <label><span>TIMELINE</span><input name="timeline" placeholder="e.g. Q4 evaluation" /></label>
            </div>
            <label>
              <span>SYSTEM AND CONSEQUENTIAL ACTION *</span>
              <textarea name="system" rows={6} required placeholder="What does the system do, what can it change, and who or what is affected?" />
            </label>
            <label>
              <span>CURRENT CONTROLS AND EVIDENCE</span>
              <textarea name="controls" rows={4} placeholder="Describe authorization, logs, receipts, recovery, review, or compliance controls that exist today." />
            </label>
            <label>
              <span>DECISION OR OUTCOME REQUIRED *</span>
              <textarea name="outcome" rows={4} required placeholder="What should a successful first engagement let your team decide or de-risk?" />
            </label>
            <div className="partner-form-submit">
              <button type="submit">OPEN ENTERPRISE DRAFT <span aria-hidden="true">→</span></button>
              <p>Opens your email app. Review the draft, then send it to start an inquiry.</p>
            </div>
          </form>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
