import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const mismatchExamples = [
  {
    label: "PO ↔ ORDER",
    title: "The customer asked for one thing. The order record says another.",
    copy: "Compare source documents and entered order details before the mismatch moves downstream.",
  },
  {
    label: "SHIP VIA ↔ ACCOUNT",
    title: "The shipping method or account does not match the instruction.",
    copy: "Surface the exact difference before freight is booked to the wrong party or carrier.",
  },
  {
    label: "QUOTE ↔ FEES",
    title: "A fee was quoted but never carried into the order.",
    copy: "Check agreed commercial terms against the transaction record before margin quietly disappears.",
  },
  {
    label: "EMAIL ↔ ERP",
    title: "The latest instruction lives outside the system of record.",
    copy: "Bring the relevant message and ERP state into one review surface without pretending either source is automatically correct.",
  },
];

const evaluationSteps = [
  ["HISTORICAL SAMPLE", "Use sanitized completed orders and their source documents before asking for production access."],
  ["DETECT", "Measure which known mismatches the system catches and which normal orders it incorrectly flags."],
  ["VALUE", "Attach the actual operational or margin exposure to the errors that would have been prevented."],
  ["DECIDE", "Advance to a bounded live pilot only if the signal is strong enough to justify integration work."],
];

export default function DistributionPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "JCEE Distribution — JCEE Labs";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="program-page distribution-page" id="top">
      <CoreHeader current="distribution" />

      <section className="program-masthead distribution-program">
        <p className="eyebrow"><span /> FIRST INDUSTRY OPERATING SYSTEM · IN DEVELOPMENT</p>
        <div className="program-number">JCEE DISTRIBUTION / PUBLIC OVERVIEW</div>
        <h1>Catch the mismatch<br /><em>before it costs margin.</em></h1>
        <p className="program-deck">
          JCEE Distribution is the first industry operating system being built on
          JCEE Operating Cloud. It starts with a practical problem: the commercial
          truth of an order is often split across documents, messages, and systems that do not agree.
        </p>
        <div className="program-status-row">
          <span>FIRST USE CASE · ORDER INTEGRITY</span>
          <span>STATUS · DESIGN-STAGE / PILOT VALIDATION NEXT</span>
        </div>
      </section>

      <section className="commercial-position distribution-position" aria-labelledby="distribution-position-title">
        <div className="commercial-position-copy">
          <p className="charter-section-label">THE FIRST PROBLEM</p>
          <h2 id="distribution-position-title">The expensive errors are often small contradictions between systems.</h2>
          <p>
            Industrial distributors already have ERPs, email, carrier tools, quotes,
            customer purchase orders, and established SOPs. JCEE Distribution is not
            being designed to replace all of them at once. It is being designed to
            reconcile the details that cross between them and surface exceptions before fulfillment.
          </p>
        </div>
        <div className="commercial-proof-card">
          <span>FIRST PRODUCT QUESTION</span>
          <strong>Can a read-only integrity layer catch real dollar leaks before an operator commits the order?</strong>
          <p>
            That question can be tested on historical work before claiming production
            value or asking a company to change its operating system.
          </p>
        </div>
      </section>

      <section className="distribution-mismatch-section" aria-labelledby="distribution-mismatch-title">
        <div className="section-index">
          <span>WHERE THE SEAMS OPEN</span>
          <span>CONCRETE OPERATING EXAMPLES</span>
        </div>
        <h2 id="distribution-mismatch-title">Four ordinary ways margin can leak.</h2>
        <div className="distribution-mismatch-grid">
          {mismatchExamples.map((item, index) => (
            <article key={item.label}>
              <div className="distribution-mismatch-topline">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{item.label}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="distribution-operating-flow" aria-labelledby="distribution-flow-title">
        <div>
          <p className="charter-section-label">HOW IT STARTS</p>
          <h2 id="distribution-flow-title">Read first. Reconcile second. Change nothing until the evidence earns it.</h2>
          <p>
            A first deployment can connect to a controlled mailbox or document feed
            and a read-only ERP source. The system extracts the terms that matter,
            compares them with the entered order, and presents an exception with the
            source context an operator needs to resolve it.
          </p>
        </div>
        <div className="distribution-native-flow" aria-label="JCEE Distribution reconciliation flow">
          <article><span>01</span><strong>INGEST</strong><small>PO, quote, message, order record</small></article>
          <i aria-hidden="true">→</i>
          <article><span>02</span><strong>RECONCILE</strong><small>Compare only the fields that govern the workflow</small></article>
          <i aria-hidden="true">→</i>
          <article><span>03</span><strong>EXPLAIN</strong><small>Show the mismatch and supporting source</small></article>
          <i aria-hidden="true">→</i>
          <article><span>04</span><strong>RESOLVE</strong><small>Human decision first; bounded write-back later</small></article>
        </div>
      </section>

      <section className="distribution-evaluation-section" aria-labelledby="distribution-evaluation-title">
        <div className="section-index light">
          <span>FIRST VALIDATION GATE</span>
          <span>PROVE VALUE BEFORE INTEGRATION DEPTH</span>
        </div>
        <div className="distribution-evaluation-layout">
          <div>
            <p className="charter-section-label">PILOT DESIGN</p>
            <h2 id="distribution-evaluation-title">A product claim should start with a measurable before-and-after.</h2>
          </div>
          <ol>
            {evaluationSteps.map(([label, copy], index) => (
              <li key={label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{label}</strong><p>{copy}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="program-next">
        <p className="charter-section-label">BUILT ON JCEE OPERATING CLOUD</p>
        <h2>Distribution is the first industry system, not a one-off application.</h2>
        <p>
          The working thesis is that connection, reconciliation, agent assistance,
          evidence, and action control can form a reusable platform core while each
          industry product keeps its own workflow, terminology, rules, and customer experience.
        </p>
        <div className="program-links">
          <a href="/operating-cloud">VIEW JCEE OPERATING CLOUD <span>→</span></a>
          <a href="/technology">VIEW THE TECHNOLOGY <span>→</span></a>
          <a href="/partners/enterprise">DISCUSS A DISTRIBUTION WORKFLOW <span>→</span></a>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
