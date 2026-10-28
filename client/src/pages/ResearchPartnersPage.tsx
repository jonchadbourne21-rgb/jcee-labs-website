import { FormEvent, useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import { buildPartnerInquiryMailto } from "@/lib/partnerInquiry";

const researchFit = [
  ["CLAIM", "A falsifiable claim, method, or architecture has a boundary that can be stated precisely."],
  ["ARTIFACT", "Code, traces, specifications, datasets, or protocols exist—or can be produced—for independent inspection."],
  ["REPRODUCTION", "The work can survive an environment, authority class, or evaluator not controlled by its authors."],
  ["DISCLOSURE", "Publication scope, attribution, confidentiality, and negative-result handling can be agreed before work begins."],
];

export default function ResearchPartnersPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Research Partnerships — JCEE Labs";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const openInquiryDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);

    window.location.href = buildPartnerInquiryMailto("research", {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      organization: String(data.get("organization") || ""),
      role: String(data.get("role") || ""),
      focus: String(data.get("collaboration") || ""),
      timeline: String(data.get("timeline") || ""),
      primaryLabel: "Research question or claim",
      primary: String(data.get("question") || ""),
      evidenceLabel: "Available artifacts and evidence",
      evidence: String(data.get("artifacts") || ""),
      outcomeLabel: "Reproduction or publication outcome",
      outcome: String(data.get("outcome") || ""),
    });
  };

  return (
    <main className="program-page partner-page partner-path-page research-partner-page" id="top">
      <CoreHeader current="partners" />

      <section id="page-content" tabIndex={-1} className="program-masthead partner-masthead research-partner-masthead">
        <p className="eyebrow"><span /> RESEARCH PARTNERSHIPS · CLAIMS + REPRODUCTION</p>
        <div className="program-number">JCEE LABS / PARTNERS / RESEARCH</div>
        <h1>
          Put the claim where<br />
          <em>another team can test it.</em>
        </h1>
        <p className="program-deck">
          For research groups, technical institutions, and applied teams working on
          execution evidence, causal constraints, verification, and bounded intelligence.
        </p>
        <div className="program-status-row">
          <span>PATH · REPLICATION / METHODS / PUBLICATION</span>
          <span>ROUTING · RESEARCH REVIEW</span>
        </div>
      </section>

      <section className="partner-fit research-fit" aria-labelledby="research-fit-title">
        <div className="section-index">
          <span>01 / FIT SIGNALS</span>
          <span>CLAIM · ARTIFACT · REPRODUCTION</span>
        </div>
        <div className="partner-fit-intro">
          <p>RESEARCH FIT</p>
          <h2 id="research-fit-title">A claim worth exposing to another environment.</h2>
          <p>
            The strongest collaboration has a narrow question, inspectable artifacts,
            explicit uncertainty, and a plan for what happens if the result does not reproduce.
          </p>
        </div>
        <div className="partner-signal-grid">
          {researchFit.map(([label, copy], index) => (
            <article key={label}>
              <span>0{index + 1} / {label}</span>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="partner-engagement-model" aria-labelledby="research-engagement-title">
        <div className="section-index light">
          <span>02 / COLLABORATION MODEL</span>
          <span>PRE-REGISTER THE EVIDENCE BOUNDARY</span>
        </div>
        <div className="partner-shared-layout">
          <div>
            <p className="partner-kicker">HOW WE START</p>
            <h2 id="research-engagement-title">Agree on the claim before looking at the result.</h2>
          </div>
          <ol className="partner-sequence">
            <li><span>01</span><strong>Bound</strong><p>State the claim, exclusions, authority model, and expected failure conditions.</p></li>
            <li><span>02</span><strong>Inventory</strong><p>Name the code, data, traces, specifications, and environments available for review.</p></li>
            <li><span>03</span><strong>Reproduce</strong><p>Test in a declared independent setting and preserve negative or ambiguous outcomes.</p></li>
            <li><span>04</span><strong>Publish</strong><p>Report only what the resulting evidence supports, including limitations and unresolved states.</p></li>
          </ol>
        </div>
      </section>

      <section className="partner-inquiry" aria-labelledby="research-inquiry-title">
        <div className="section-index">
          <span>03 / RESEARCH INQUIRY</span>
          <span>ROUTED · RESEARCH</span>
        </div>
        <div className="partner-inquiry-layout">
          <div className="partner-inquiry-copy">
            <p className="partner-kicker">INITIATE RESEARCH REVIEW</p>
            <h2 id="research-inquiry-title">Show us the claim, the artifacts, and the test.</h2>
            <p>
              Describe the question, available evidence, and the result you want to test.
              This form opens an email draft for you to review and send.
            </p>
            <dl>
              <div><dt>ROUTE</dt><dd>Research collaboration review</dd></div>
              <div><dt>FIRST STEP</dt><dd>Claim and artifact assessment</dd></div>
              <div><dt>DIRECT</dt><dd><a href="mailto:support+research@jceelabs.com">support+research@jceelabs.com</a></dd></div>
            </dl>
          </div>

          <form className="partner-form research-partner-form" onSubmit={openInquiryDraft}>
            <div className="partner-form-route">RESEARCH / COLLABORATION INQUIRY</div>
            <div className="partner-form-row">
              <label><span>NAME *</span><input name="name" autoComplete="name" required /></label>
              <label><span>EMAIL *</span><input name="email" type="email" autoComplete="email" required /></label>
            </div>
            <div className="partner-form-row">
              <label><span>INSTITUTION / TEAM *</span><input name="organization" autoComplete="organization" required /></label>
              <label><span>ROLE / DISCIPLINE *</span><input name="role" required /></label>
            </div>
            <div className="partner-form-row">
              <label>
                <span>COLLABORATION TYPE *</span>
                <select name="collaboration" defaultValue="" required>
                  <option value="" disabled>Select a collaboration</option>
                  <option>Independent replication</option>
                  <option>Methods or measurement study</option>
                  <option>Benchmark or evaluation design</option>
                  <option>Joint technical publication</option>
                  <option>Standards or protocol work</option>
                  <option>Exploratory research</option>
                </select>
              </label>
              <label><span>TIMELINE</span><input name="timeline" placeholder="e.g. six-month study" /></label>
            </div>
            <label>
              <span>RESEARCH QUESTION OR CLAIM *</span>
              <textarea name="question" rows={6} required placeholder="State the question or claim narrowly enough that a result could challenge it." />
            </label>
            <label>
              <span>AVAILABLE ARTIFACTS AND EVIDENCE</span>
              <textarea name="artifacts" rows={4} placeholder="List specifications, code, datasets, traces, environments, protocols, or prior results." />
            </label>
            <label>
              <span>REPRODUCTION OR PUBLICATION OUTCOME *</span>
              <textarea name="outcome" rows={4} required placeholder="Describe the result, publication, benchmark, or decision the collaboration should produce." />
            </label>
            <div className="partner-form-submit">
              <button type="submit">OPEN RESEARCH DRAFT <span aria-hidden="true">→</span></button>
              <p>Opens your email app. Review the draft, then send it to start an inquiry.</p>
            </div>
          </form>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
