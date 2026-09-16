import { FormEvent, useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import { buildPartnerInquiryMailto } from "@/lib/partnerInquiry";

const enterpriseFit = [
  ["CLAIM", "A consequential AI or automated workflow produces an answer, decision, or action that another person or system must rely on."],
  ["EVIDENCE", "The team cannot yet reconstruct which observations, versions, rules, and assumptions actually support the result."],
  ["AUTHORITY", "The action depends on permission that can change by target, amount, environment, time, role, delegation, or revocation."],
  ["RECOVERY", "Timeouts, retries, partial completion, stale state, or contradictory sources create an expensive ambiguity."],
];

const assessmentSteps = [
  ["01", "Question", "Name the decision or action that could change if the claim is accepted."],
  ["02", "Claim and disproof", "Write a narrow claim and the observations that would fail, narrow, or block it."],
  ["03", "Evidence and authority", "Map observations, provenance, assumptions, current authority, and recovery gaps."],
  ["04", "Boundary and receipt", "Return a bounded written finding, unresolved items, and the next useful test or implementation scope."],
];

export default function EnterprisePartnersPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "JCEE Assurance Assessment — JCEE Labs";
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
      primaryLabel: "System, claim, or consequential action",
      primary: String(data.get("system") || ""),
      evidenceLabel: "Current evidence, authority, and controls",
      evidence: String(data.get("controls") || ""),
      outcomeLabel: "Decision the assessment must support",
      outcome: String(data.get("outcome") || ""),
    });
  };

  return (
    <main
      className="program-page partner-page partner-path-page enterprise-partner-page"
      id="top"
    >
      <CoreHeader current="partners" />

      <section
        id="page-content"
        tabIndex={-1}
        className="program-masthead partner-masthead enterprise-partner-masthead"
      >
        <p className="eyebrow">
          <span /> JCEE ASSURANCE ASSESSMENT
        </p>
        <div className="program-number">JCEE LABS / PARTNERS / ENTERPRISE</div>
        <h1>
          Make consequential software
          <br />
          <em>answerable in operation.</em>
        </h1>
        <p className="program-deck">
          A time-bounded review of one AI workflow, claim, or consequential
          automation. Establish what the evidence supports, where authority and
          recovery remain ambiguous, and what the next justified action should be.
        </p>
        <div className="program-status-row">
          <span>SCOPE · ONE BOUNDED QUESTION FIRST</span>
          <span>OUTCOME · EVIDENCE, BOUNDARY, NEXT ACTION</span>
        </div>
        <div className="program-links">
          <a href="#enterprise-inquiry-title">
            DISCUSS AN ASSESSMENT <span>→</span>
          </a>
          <a href="/assurance">
            EXPLORE THE METHOD <span>→</span>
          </a>
        </div>
      </section>

      <section className="partner-fit enterprise-fit" aria-labelledby="enterprise-fit-title">
        <div className="section-index">
          <span>01 / START WHERE BEING WRONG MATTERS</span>
          <span>ONE EXPENSIVE AMBIGUITY OR HIGH-CONSEQUENCE WORKFLOW</span>
        </div>
        <div className="partner-fit-intro">
          <p>ASSESSMENT FIT</p>
          <h2 id="enterprise-fit-title">Start where uncertainty already has an operational cost.</h2>
          <p>
            The method is broad enough for research, deployment gates, incident
            reconstruction, automation, and vendor or payment integrations. The
            first engagement should still be narrow enough to fail clearly.
          </p>
        </div>
        <div className="partner-signal-grid">
          {enterpriseFit.map(([label, copy], index) => (
            <article key={label}>
              <span>
                0{index + 1} / {label}
              </span>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="partner-engagement-model"
        aria-labelledby="enterprise-engagement-title"
      >
        <div className="section-index light">
          <span>02 / ASSESSMENT METHOD</span>
          <span>CLAIM · EVIDENCE · AUTHORITY · RECEIPT</span>
        </div>
        <div className="partner-shared-layout">
          <div>
            <p className="partner-kicker">THE FIRST COMMERCIAL STEP</p>
            <h2 id="enterprise-engagement-title">One question. One boundary. A written result.</h2>
            <p>
              The assessment applies the JCEE Assurance Method to a defined
              workflow or claim. Production changes, software implementation,
              and deployment remain separately scoped and authorized.
            </p>
          </div>
          <ol className="partner-sequence">
            {assessmentSteps.map(([id, title, copy]) => (
              <li key={id}>
                <span>{id}</span>
                <strong>{title}</strong>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="program-statement" aria-labelledby="assessment-output-title">
        <p className="charter-section-label">WHAT THE ASSESSMENT RETURNS</p>
        <h2 id="assessment-output-title">A bounded finding, not a certification label.</h2>
        <div className="program-statement-copy">
          <p>
            The written output identifies the claim and consequence boundary,
            evidence and provenance available, authority and recovery gaps,
            adversarial cases examined, limitations, and the next justified test
            or implementation step.
          </p>
          <p>
            If existing controls already close the named problem, that is a useful
            result. The assessment does not manufacture a software requirement in
            order to justify the engagement.
          </p>
        </div>
      </section>

      <section className="partner-inquiry" aria-labelledby="enterprise-inquiry-title">
        <div className="section-index">
          <span>03 / ASSESSMENT INQUIRY</span>
          <span>ROUTED · ENTERPRISE</span>
        </div>
        <div className="partner-inquiry-layout">
          <div className="partner-inquiry-copy">
            <p className="partner-kicker">START WITH THE CONSEQUENTIAL QUESTION</p>
            <h2 id="enterprise-inquiry-title">What must your team be able to establish?</h2>
            <p>
              Describe the workflow, claim, and decision your team needs to make.
              This form opens an email draft for you to review and send.
            </p>
            <p>
              Use a non-confidential summary. Do not include credentials, personal
              customer records, payment details, private source code, or sensitive
              incident evidence. Agree a secure exchange separately when necessary.
            </p>
            <dl>
              <div>
                <dt>ROUTE</dt>
                <dd>JCEE Assurance assessment inquiry</dd>
              </div>
              <div>
                <dt>FIRST STEP</dt>
                <dd>Scope and fit discussion</dd>
              </div>
              <div>
                <dt>DIRECT</dt>
                <dd>
                  <a href="mailto:support+enterprise@jceelabs.com">
                    support+enterprise@jceelabs.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <form className="partner-form enterprise-partner-form" onSubmit={openInquiryDraft}>
            <div className="partner-form-route">ENTERPRISE / ASSURANCE ASSESSMENT</div>
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
                <input name="organization" autoComplete="organization" required />
              </label>
              <label>
                <span>ROLE *</span>
                <input name="role" autoComplete="organization-title" required />
              </label>
            </div>
            <div className="partner-form-row">
              <label>
                <span>OPERATIONAL DOMAIN *</span>
                <select name="domain" defaultValue="" required>
                  <option value="" disabled>
                    Select a domain
                  </option>
                  <option>AI and agent systems</option>
                  <option>Payments or financial operations</option>
                  <option>Cloud, data, or infrastructure</option>
                  <option>Regulated operations</option>
                  <option>Enterprise workflow automation</option>
                  <option>Research or model evaluation</option>
                  <option>Other consequential system</option>
                </select>
              </label>
              <label>
                <span>TIMELINE</span>
                <input name="timeline" placeholder="e.g. Q4 evaluation" />
              </label>
            </div>
            <label>
              <span>SYSTEM, CLAIM, OR CONSEQUENTIAL ACTION *</span>
              <textarea
                name="system"
                rows={6}
                required
                placeholder="What claim or action matters, and what could change if your team accepts it?"
              />
            </label>
            <label>
              <span>CURRENT EVIDENCE, AUTHORITY, AND CONTROLS</span>
              <textarea
                name="controls"
                rows={4}
                placeholder="What observations, approvals, policies, logs, receipts, recovery paths, or reviews exist today?"
              />
            </label>
            <label>
              <span>DECISION THE ASSESSMENT MUST SUPPORT *</span>
              <textarea
                name="outcome"
                rows={4}
                required
                placeholder="What should the bounded result allow your team to decide, narrow, reproduce, or stop?"
              />
            </label>
            <div className="partner-form-submit">
              <button type="submit">
                OPEN ASSESSMENT DRAFT <span aria-hidden="true">→</span>
              </button>
              <p>Opens your email app. Review the draft, then send it to start an inquiry.</p>
            </div>
          </form>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
