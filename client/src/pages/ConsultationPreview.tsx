import { FormEvent, useEffect, useRef, useState } from "react";
import CoreHeader from "@/components/CoreHeader";
import BrandFooter from "@/components/BrandFooter";
import { buildConsultationDraft, consultationServices } from "@/lib/consultationDraft";

const serviceGroups = [
  ["01", "Architecture & systems", "AI and software architecture, systems analysis, engineering design, and discovery."],
  ["02", "Application engineering", "Custom applications, prototypes, and iOS/mobile development."],
  ["03", "Testing & verification", "Evidence-backed testing and separately scoped independent validation, with review independence defined."],
  ["04", "Research & documentation", "Technical research, research-driven problem solving, and auditable handoff documentation."],
] as const;

function ConsultationEntry() {
  const [draft, setDraft] = useState<ReturnType<typeof buildConsultationDraft> | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const reviewRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!draft) return;
    reviewRef.current?.focus({ preventScroll: true });
    reviewRef.current?.parentElement?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [draft]);

  const prepareDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setCopyStatus("");
    setDraft(buildConsultationDraft({
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      organization: String(data.get("organization") || ""),
      service: String(data.get("service") || ""),
      summary: String(data.get("summary") || ""),
    }));
  };
  const copyDraft = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`To: support+enterprise@jceelabs.com\nSubject: ${draft.subject}\n\n${draft.body}`);
      setCopyStatus("Draft copied. Nothing has been sent or booked.");
    } catch {
      setCopyStatus("Clipboard access is unavailable. Select and copy the draft below, then email support+enterprise@jceelabs.com.");
    }
  };

  return (
    <main id="top" className="jcee-preview preview-consultation-page">
      <CoreHeader contactLabel="Free call" contactHref="/consultation" />
      <section id="page-content" tabIndex={-1} className="preview-section preview-consultation-entry" aria-labelledby="consult-title">
        <div className="preview-consult-copy">
          <div className="preview-consult-intro">
          <a href="/" className="preview-back-link">← Back to JCEE WorldLab</a>
          <p className="preview-kicker">TECHNICAL SERVICES / START HERE</p>
          <h1 id="consult-title">A real problem.<br /><em>A clear first step.</em></h1>
          <p className="preview-deck">Start with a free 10–30-minute consultation. Tell us what you are trying to build, improve, or understand. We will discuss the problem and whether a scoped next step makes sense.</p>
          <div className="preview-call-facts"><span>10–30 minutes</span><span>Free first call</span><span>No paid work before agreed scope</span></div>
          </div>
          <ol className="preview-call-process">
            <li><span>01</span><div><h3>Describe the problem.</h3><p>A non-confidential summary is enough. Bring the question, not your credentials or customer records.</p></div></li>
            <li><span>02</span><div><h3>Review and send your request.</h3><p>Prepare an email draft below. Sending it requests a conversation; it does not confirm an appointment.</p></div></li>
            <li><span>03</span><div><h3>Agree the next step.</h3><p>If there is a fit, any assessment or implementation gets its own written scope, terms, and authorization.</p></div></li>
          </ol>
          <div className="preview-direct-contact"><p className="preview-kicker">PREFER EMAIL?</p><a href="mailto:support+enterprise@jceelabs.com">support+enterprise@jceelabs.com ↗</a><p>No scheduling service or automated submission is connected.</p></div>
        </div>
        <div className="preview-form-column">
          <form className="preview-consult-form" onSubmit={prepareDraft} aria-labelledby="request-title">
            <div className="preview-panel-top"><span>FIRST CONSULTATION</span><span>10–30 MIN / FREE</span></div>
            <h2 id="request-title">Tell us what you’re working on.</h2>
            <p>Three required fields. No lengthy intake before a first conversation.</p>
            <div className="preview-form-grid">
              <label htmlFor="consult-name">Name <span>(required)</span><input ref={nameRef} id="consult-name" name="name" autoComplete="name" maxLength={100} required /></label>
              <label htmlFor="consult-email">Email <span>(required)</span><input id="consult-email" name="email" type="email" autoComplete="email" maxLength={254} required /></label>
            </div>
            <label htmlFor="consult-company">Company <span>(optional)</span><input id="consult-company" name="organization" autoComplete="organization" maxLength={150} /></label>
            <label htmlFor="consult-service">Service interest <span>(optional)</span><select id="consult-service" name="service" defaultValue=""><option value="">Not sure yet — let’s discuss</option>{consultationServices.map(service => <option key={service}>{service}</option>)}</select></label>
            <label htmlFor="consult-summary">What are you trying to build or resolve? <span>(required)</span><textarea id="consult-summary" name="summary" rows={4} maxLength={2000} required aria-describedby="consult-summary-help" placeholder="A workflow, an application, a technical question, or a system that needs clearer evidence." /></label>
            <p id="consult-summary-help" className="preview-form-help">Use a non-confidential summary. Do not include credentials, personal customer records, payment details, private source code, or sensitive incident evidence. Agree a secure exchange separately.</p>
            <button className="preview-button" type="submit">Prepare email draft <span aria-hidden="true">→</span></button>
            <p className="preview-form-help">Nothing is submitted to a server, saved, sent, or booked by this form. You review the draft and send it yourself.</p>
            <a className="preview-text-link" href="/privacy">Privacy information ↗</a>
          </form>
          {draft && <section className="preview-draft-review" aria-labelledby="draft-title">
            <p className="preview-kicker" role="status">DRAFT READY · NOT SENT</p>
            <h2 id="draft-title" ref={reviewRef} tabIndex={-1}>Review your request.</h2>
            <p>To: <strong>support+enterprise@jceelabs.com</strong></p>
            <p className="preview-draft-subject"><strong>Subject:</strong> {draft.subject}</p>
            <pre>{draft.body}</pre>
            <div className="preview-draft-actions"><a className="preview-button" href={draft.mailto}>Open in email app <span aria-hidden="true">↗</span></a><button type="button" className="preview-secondary-button" onClick={copyDraft}>Copy draft</button></div>
            <p className="preview-form-help">An email app is required for the mailto link. You can also copy the draft and email it manually. An appointment is not confirmed by preparing or sending this request.</p>
            <p className="preview-copy-status" role="status">{copyStatus}</p>
            <button className="preview-text-link" type="button" onClick={() => nameRef.current?.focus()}>Return to the form ↑</button>
          </section>}
        </div>
      </section>
      <section className="preview-section preview-services" aria-labelledby="services-title">
        <div className="preview-section-label"><span>TECHNICAL SERVICES</span><span>AVAILABLE TO DISCUSS AND SCOPE</span></div>
        <div className="preview-section-heading"><h2 id="services-title">From first question<br /><em>to auditable system.</em></h2><p>JCEE WorldLab provides end-to-end technical services through discovery, architecture, prototyping, implementation, evidence-backed testing, technical documentation, and research-driven problem solving.</p></div>
        <div className="preview-services-grid">{serviceGroups.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <p className="preview-boundary-note">The free first call is not an assessment report, certification, implementation, or grant of execution authority. Production changes and paid work remain separately scoped and authorized. Independent validation requires a scope that preserves review independence.</p>
      </section>
      <section className="preview-section preview-existing-inquiry" aria-labelledby="workflow-title"><div><p className="preview-kicker">ALREADY HAVE A WORKFLOW TO SCOPE?</p><h2 id="workflow-title">Keep the detailed inquiry available.</h2><p>The existing Workflow Assurance Assessment inquiry is unchanged. Its detailed questions and review-before-send email behavior remain available for a later scoping stage.</p></div><a className="preview-secondary-button" href="/partners/enterprise">Open detailed workflow inquiry ↗</a></section>
      <BrandFooter backToTopHref="#top" />
    </main>
  );
}

export default function ConsultationPreview() {
  return <ConsultationEntry />;
}
