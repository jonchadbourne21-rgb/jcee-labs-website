import { FormEvent, useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const engagementPaths = [
  {
    id: "01",
    title: "Design partnership",
    copy: "Apply evidence-first execution, bounded authority, and verification principles to a consequential system under active development.",
  },
  {
    id: "02",
    title: "Technical evaluation",
    copy: "Evaluate a concrete workflow, failure boundary, or evidence requirement against JCEE VOW, QCS, or Assurance concepts.",
  },
  {
    id: "03",
    title: "Research collaboration",
    copy: "Reproduce, challenge, or extend a bounded research claim with explicit assumptions, artifacts, and publication rules.",
  },
  {
    id: "04",
    title: "Strategic integration",
    copy: "Explore an integration where execution receipts, causal constraints, or portable evidence improve an existing product or platform.",
  },
];

const inquirySignals = [
  ["SYSTEM", "What acts, changes state, or crosses a trust boundary?"],
  ["CONSEQUENCE", "What can fail, duplicate, drift, or become difficult to explain?"],
  ["EVIDENCE", "What record exists today, and who needs to trust it?"],
  ["DECISION", "What would a successful first engagement allow you to decide?"],
];

export type PartnerInquiryFields = {
  name: string;
  email: string;
  company: string;
  role: string;
  engagement: string;
  timeline: string;
  problem: string;
  evidence: string;
};

export function buildPartnerInquiryMailto(fields: PartnerInquiryFields) {
  const company = fields.company.trim() || "Company";
  const subject = `Partnership inquiry — ${company}`;
  const body = [
    "JCEE Labs partnership inquiry",
    "",
    `Name: ${fields.name}`,
    `Work email: ${fields.email}`,
    `Company: ${company}`,
    `Role: ${fields.role || "Not provided"}`,
    `Engagement: ${fields.engagement || "Not selected"}`,
    `Timeline: ${fields.timeline || "Not provided"}`,
    "",
    "System / problem:",
    fields.problem,
    "",
    "Current evidence or control boundary:",
    fields.evidence || "Not provided",
  ].join("\n");

  return `mailto:support@jceelabs.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function PartnersPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Partner With JCEE Labs";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const openInquiryDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    window.location.href = buildPartnerInquiryMailto({
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      company: String(data.get("company") || ""),
      role: String(data.get("role") || ""),
      engagement: String(data.get("engagement") || ""),
      timeline: String(data.get("timeline") || ""),
      problem: String(data.get("problem") || ""),
      evidence: String(data.get("evidence") || ""),
    });
  };

  return (
    <main className="program-page partner-page" id="top">
      <CoreHeader current="partners" />

      <section className="program-masthead partner-masthead">
        <p className="eyebrow"><span /> COMPANY PARTNERSHIPS · SELECTIVE ENGAGEMENTS</p>
        <div className="program-number">JCEE LABS / PARTNERS</div>
        <h1>
          Bring us the system<br />
          <em>that has to answer for itself.</em>
        </h1>
        <p className="program-deck">
          We work with companies operating near consequential boundaries—where software acts,
          authority changes, failures compound, and evidence must survive the process that created it.
        </p>
        <div className="program-status-row">
          <span>ENGAGEMENT · TECHNICAL / RESEARCH / STRATEGIC</span>
          <span>STARTING POINT · A CONCRETE SYSTEM BOUNDARY</span>
        </div>
      </section>

      <section className="partner-fit" aria-labelledby="partner-fit-title">
        <div className="section-index">
          <span>01 / WHERE WE ENGAGE</span>
          <span>BOUNDED PROBLEMS · REVIEWABLE OUTCOMES</span>
        </div>
        <div className="partner-fit-intro">
          <p>PARTNERSHIP THESIS</p>
          <h2 id="partner-fit-title">The strongest inquiry starts with a real consequence.</h2>
          <p>
            We are most useful when a team can name the action, authority, failure mode, and proof
            requirement—not when the goal is simply to add AI to an existing product.
          </p>
        </div>
        <div className="partner-path-grid">
          {engagementPaths.map((path) => (
            <article key={path.id}>
              <span>{path.id}</span>
              <h3>{path.title}</h3>
              <p>{path.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="partner-brief" aria-labelledby="partner-brief-title">
        <div className="section-index light">
          <span>02 / THE USEFUL BRIEF</span>
          <span>CONTEXT BEFORE CALLS</span>
        </div>
        <div className="partner-brief-layout">
          <div>
            <p className="partner-kicker">A GOOD FIRST NOTE</p>
            <h2 id="partner-brief-title">Give us enough evidence to identify the boundary.</h2>
          </div>
          <div className="partner-signal-list">
            {inquirySignals.map(([label, copy]) => (
              <article key={label}>
                <span>{label}</span>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="partner-inquiry" aria-labelledby="partner-inquiry-title">
        <div className="section-index">
          <span>03 / PARTNER INQUIRY</span>
          <span>DIRECT TO JCEE LABS</span>
        </div>
        <div className="partner-inquiry-layout">
          <div className="partner-inquiry-copy">
            <p className="partner-kicker">INITIATE REVIEW</p>
            <h2 id="partner-inquiry-title">Tell us what must be proved before it can act.</h2>
            <p>
              We review each inquiry for technical fit, evidence boundaries, and a concrete next
              decision. If there is a credible starting point, we will reply with the smallest useful
              engagement—not a generic sales process.
            </p>
            <dl>
              <div><dt>RESPONSE</dt><dd>Direct review by JCEE Labs</dd></div>
              <div><dt>FORMAT</dt><dd>Written brief before scheduling</dd></div>
              <div><dt>CONTACT</dt><dd><a href="mailto:support@jceelabs.com">support@jceelabs.com</a></dd></div>
            </dl>
          </div>

          <form className="partner-form" onSubmit={openInquiryDraft}>
            <div className="partner-form-row">
              <label>
                <span>NAME *</span>
                <input name="name" autoComplete="name" required />
              </label>
              <label>
                <span>WORK EMAIL *</span>
                <input name="email" type="email" autoComplete="email" required />
              </label>
            </div>
            <div className="partner-form-row">
              <label>
                <span>COMPANY *</span>
                <input name="company" autoComplete="organization" required />
              </label>
              <label>
                <span>ROLE</span>
                <input name="role" autoComplete="organization-title" />
              </label>
            </div>
            <div className="partner-form-row">
              <label>
                <span>ENGAGEMENT</span>
                <select name="engagement" defaultValue="">
                  <option value="" disabled>Select a path</option>
                  <option>Design partnership</option>
                  <option>Technical evaluation</option>
                  <option>Research collaboration</option>
                  <option>Strategic integration</option>
                  <option>Not sure yet</option>
                </select>
              </label>
              <label>
                <span>TIMELINE</span>
                <input name="timeline" placeholder="e.g. Q4 evaluation" />
              </label>
            </div>
            <label>
              <span>SYSTEM / PROBLEM *</span>
              <textarea
                name="problem"
                rows={6}
                required
                placeholder="Describe the system, the action it takes, and the consequence that needs stronger assurance."
              />
            </label>
            <label>
              <span>CURRENT EVIDENCE OR CONTROL BOUNDARY</span>
              <textarea
                name="evidence"
                rows={4}
                placeholder="What logs, receipts, authority checks, recovery guarantees, or verification controls exist today?"
              />
            </label>
            <div className="partner-form-submit">
              <button type="submit">OPEN EMAIL DRAFT <span aria-hidden="true">→</span></button>
              <p>Your details stay in this browser until your email client opens. Nothing is uploaded by this page.</p>
            </div>
          </form>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
