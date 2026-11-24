import { FormEvent, useEffect, useRef, useState } from "react";
import CoreHeader from "@/components/CoreHeader";
import BrandFooter from "@/components/BrandFooter";
import "./home-editorial-refresh.css";
import { buildConsultationDraft, consultationServices } from "@/lib/consultationDraft";

const serviceGroups = [
  ["01", "Architecture & systems", "AI and software architecture, systems analysis, engineering design, and discovery."],
  ["02", "Application engineering", "Custom applications, prototypes, and iOS/mobile development."],
  ["03", "Testing & verification", "Evidence-backed testing and separately scoped independent validation, with review independence defined."],
  ["04", "Research & documentation", "Technical research, research-driven problem solving, and auditable handoff documentation."],
] as const;

function ConsultationEntry() {
  const [draft, setDraft] = useState<ReturnType<typeof buildConsultationDraft> | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [copyStatus, setCopyStatus] = useState("");
  const reviewRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!draft) return;
    reviewRef.current?.focus({ preventScroll: true });
    reviewRef.current?.parentElement?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [draft]);

  // Send the request to the sales inbox. If the sending service is unavailable
  // (or this is the static preview build), fall back to a ready-made email draft.
  const sendRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity() || status === "sending") return;
    const data = new FormData(form);
    const fields = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      organization: String(data.get("organization") || ""),
      service: String(data.get("service") || ""),
      summary: String(data.get("summary") || ""),
    };
    setCopyStatus("");
    setDraft(null);
    setStatus("sending");
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/consultation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, website: String(data.get("website") || "") }),
      });
      if (response.ok) {
        setStatus("sent");
        form.reset();
        return;
      }
    } catch {
      // Network failure: use the email fallback below.
    }
    setStatus("idle");
    setDraft(buildConsultationDraft(fields));
  };
  // The prepared email is a snapshot, not permission to send stale fields.
  // Any form edit returns the visitor to editing before another draft can be sent.
  const invalidateDraft = () => {
    if (draft !== null) {
      setDraft(null);
      setCopyStatus("");
    }
    if (status === "sent") setStatus("idle");
  };

  const copyDraft = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`To: sales@jceelabs.com\nSubject: ${draft.subject}\n\n${draft.body}`);
      setCopyStatus("Request copied. Paste it into an email to sales@jceelabs.com.");
    } catch {
      setCopyStatus("Clipboard access is unavailable. Select and copy the request below, then email sales@jceelabs.com.");
    }
  };

  return (
    <main id="top" className="jcee-preview preview-consultation-page customer-inquiry">
      <CoreHeader contactLabel="Discuss your workflow" contactHref="/consultation" />
      <section id="page-content" tabIndex={-1} className="preview-section preview-consultation-entry" aria-labelledby="consult-title">
        <div className="preview-consult-copy">
          <div className="preview-consult-intro">
          <a href="/" className="preview-back-link">← Back to JCEE WorldLab</a>
          <p className="preview-kicker">JCEE WORLDLAB / BUILD WITH US</p>
          <h1 id="consult-title">A real problem.<br /><em>A clear first step.</em></h1>
          <p className="preview-deck">Start with a free 10–30-minute consultation. For operations, distribution, IT, and engineering teams: tell us what you want to build, which systems need to work together, or where automation needs better control. We will discuss the problem and whether a scoped next step makes sense.</p>
          <div className="preview-call-facts"><span>10–30 minutes</span><span>Free first call</span><span>No paid work before agreed scope</span></div>
          </div>
          <ol className="preview-call-process">
            <li><span>01</span><div><h3>Describe the problem.</h3><p>A non-confidential summary is enough. Bring the question, not your credentials or customer records.</p></div></li>
            <li><span>02</span><div><h3>Send your request.</h3><p>It goes straight to our team. Sending it requests a conversation; it does not confirm an appointment.</p></div></li>
            <li><span>03</span><div><h3>Agree the next step.</h3><p>If there is a fit, any assessment or implementation gets its own written scope, terms, and authorization.</p></div></li>
          </ol>
          <div className="preview-direct-contact"><p className="preview-kicker">PREFER EMAIL?</p><a href="mailto:sales@jceelabs.com">sales@jceelabs.com ↗</a><p>Prefer a simple email? Tell us about the workflow and we can arrange a conversation.</p></div>
        </div>
        <div className="preview-form-column">
          <form className="preview-consult-form" onSubmit={sendRequest} onChange={invalidateDraft} aria-labelledby="request-title">
            <div className="preview-panel-top"><span>FIRST CONSULTATION</span><span>10–30 MIN / FREE</span></div>
            <h2 id="request-title">Tell us what you’re working on.</h2>
            <p>Three required fields. No lengthy intake before a first conversation.</p>
            <div className="preview-form-grid">
              <label htmlFor="consult-name">Name <span>(required)</span><input ref={nameRef} id="consult-name" name="name" autoComplete="name" maxLength={100} required /></label>
              <label htmlFor="consult-email">Email <span>(required)</span><input id="consult-email" name="email" type="email" autoComplete="email" maxLength={254} required /></label>
            </div>
            <label htmlFor="consult-company">Company <span>(optional)</span><input id="consult-company" name="organization" autoComplete="organization" maxLength={150} /></label>
            <label htmlFor="consult-service">Service interest <span>(optional)</span><select id="consult-service" name="service" defaultValue=""><option value="">Not sure yet — let’s discuss</option>{consultationServices.map(service => <option key={service}>{service}</option>)}</select></label>
            <label htmlFor="consult-summary">What are you trying to build or resolve? <span>(required)</span><textarea id="consult-summary" name="summary" rows={4} maxLength={2000} required aria-describedby="consult-summary-help" placeholder="For example: an account change crosses our support and billing systems. Timeouts leave the team checking the result manually." /></label>
            <p id="consult-summary-help" className="preview-form-help">Use a non-confidential summary. Do not include credentials, personal customer records, payment details, private source code, or sensitive incident evidence. Agree a secure exchange separately.</p>
            <label className="preview-honeypot" aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <button className="preview-button" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send request"} <span aria-hidden="true">→</span></button>
            <p className="preview-form-help">Your request goes to sales@jceelabs.com. We use these details only to reply to you.</p>
            {status === "sent" && <p className="preview-copy-status" role="status"><strong>Request sent.</strong> We’ll reply from sales@jceelabs.com to agree a time. This does not confirm an appointment.</p>}
            <a className="preview-text-link" href="/privacy">Privacy information ↗</a>
          </form>
          {draft && <section className="preview-draft-review" aria-labelledby="draft-title">
            <p className="preview-kicker" role="status">NOT SENT YET · SEND BY EMAIL</p>
            <h2 id="draft-title" ref={reviewRef} tabIndex={-1}>Send it from your email.</h2>
            <p>We couldn’t send this automatically. Your request is ready below.</p>
            <p>To: <strong>sales@jceelabs.com</strong></p>
            <p className="preview-draft-subject"><strong>Subject:</strong> {draft.subject}</p>
            <pre>{draft.body}</pre>
            <div className="preview-draft-actions"><a className="preview-button" href={draft.mailto}>Open in email app <span aria-hidden="true">↗</span></a><button type="button" className="preview-secondary-button" onClick={copyDraft}>Copy request</button></div>
            <p className="preview-form-help">No email app? Copy the request and send it to sales@jceelabs.com. Sending it does not confirm an appointment.</p>
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
      <section className="preview-section preview-existing-inquiry" aria-labelledby="workflow-title"><div><p className="preview-kicker">ALREADY HAVE A WORKFLOW TO SCOPE?</p><h2 id="workflow-title">Scope your workflow.</h2><p>Describe the systems, approval requirements, and outcomes that matter to your team. Review your inquiry before sending it.</p></div><a className="preview-secondary-button" href="/solutions">Explore solutions and partnerships ↗</a></section>
      <BrandFooter backToTopHref="#top" />
    </main>
  );
}

export default function ConsultationPreview() {
  return <ConsultationEntry />;
}
