import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const platformLayers = [
  {
    index: "01",
    title: "Existing systems stay in place",
    copy: "Start beside the ERP, CRM, inbox, payment provider, or operational database a team already depends on. Pull only the context required for the workflow being evaluated.",
  },
  {
    index: "02",
    title: "Industry logic resolves the seams",
    copy: "Reconcile records, instructions, and operating rules with software designed for the specific workflow instead of asking a general-purpose agent to infer the business from scratch.",
  },
  {
    index: "03",
    title: "Agents assist inside a controlled boundary",
    copy: "Use specialized agents where they improve review, preparation, comparison, or routing. Keep uncertainty visible and keep material changes behind an explicit decision boundary.",
  },
  {
    index: "04",
    title: "Actions earn authority",
    copy: "Move from read-only detection to human-approved changes and, only where the evidence and provider controls support it, bounded write-back into the systems of record.",
  },
];

const adoptionStages = [
  ["OBSERVE", "Read existing records and establish where information diverges."],
  ["RECONCILE", "Flag the exact mismatch and show the supporting source context."],
  ["ASSIST", "Prepare the next step for a human operator instead of silently acting."],
  ["ACT", "Allow a bounded write only after the relevant authority and evidence are current."],
];

export default function OperatingCloudPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "JCEE Operating Cloud — JCEE Labs";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="program-page operating-cloud-page" id="top">
      <CoreHeader current="cloud" />

      <section className="program-masthead operating-cloud-program">
        <p className="eyebrow"><span /> PLATFORM DIRECTION · IN DEVELOPMENT</p>
        <div className="program-number">JCEE OPERATING CLOUD / PUBLIC OVERVIEW</div>
        <h1>Keep the systems that work.<br /><em>Add intelligence at the seams.</em></h1>
        <p className="program-deck">
          JCEE Operating Cloud is the shared platform direction for connecting
          business systems, industry-specific software, specialized agents, and
          assurance controls without requiring a company to replace its operating stack first.
        </p>
        <div className="program-status-row">
          <span>MODEL · SHARED CORE / INDUSTRY OPERATING SYSTEMS</span>
          <span>STATUS · DESIGN + VALIDATION</span>
        </div>
      </section>

      <section className="commercial-position" aria-labelledby="cloud-position-title">
        <div className="commercial-position-copy">
          <p className="charter-section-label">THE PLATFORM THESIS</p>
          <h2 id="cloud-position-title">One common operating core. Different software for different industries.</h2>
          <p>
            General enterprise platforms are broad by design. JCEE Operating Cloud
            takes a different route: keep a common connection, agent, evidence, and
            control layer underneath, then build the customer-facing operating system
            around how a specific industry actually works.
          </p>
        </div>
        <div className="commercial-proof-card">
          <span>WHAT THE CUSTOMER SHOULD EXPERIENCE</span>
          <strong>Specific workflow. Familiar systems. Fewer ambiguous handoffs.</strong>
          <p>
            The infrastructure can be shared. The product should still feel native
            to the operator, terminology, source documents, exceptions, and approvals of the industry using it.
          </p>
        </div>
      </section>

      <section className="platform-layer-section" aria-labelledby="cloud-layers-title">
        <div className="section-index">
          <span>HOW THE LAYER FITS</span>
          <span>START READ-ONLY · EARN MORE AUTHORITY</span>
        </div>
        <h2 id="cloud-layers-title">Add control before adding autonomy.</h2>
        <div className="platform-layer-grid">
          {platformLayers.map((layer) => (
            <article key={layer.index}>
              <span>{layer.index}</span>
              <h3>{layer.title}</h3>
              <p>{layer.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cloud-adoption-section" aria-labelledby="cloud-adoption-title">
        <div>
          <p className="charter-section-label">ADOPTION PATH</p>
          <h2 id="cloud-adoption-title">The first deployment should not require blind trust.</h2>
          <p>
            A workflow can begin by observing and reconciling historical or live
            records without changing anything. More authority is introduced only
            after the system demonstrates useful detection, acceptable error rates,
            and a clear review path.
          </p>
        </div>
        <ol className="cloud-adoption-rail">
          {adoptionStages.map(([label, copy], index) => (
            <li key={label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="industry-system-section" aria-labelledby="industry-system-title">
        <div className="industry-system-card">
          <div>
            <p className="charter-section-label">FIRST INDUSTRY OPERATING SYSTEM</p>
            <h2 id="industry-system-title">JCEE Distribution</h2>
            <p>
              The first industry operating system is being designed for industrial
              distribution, where critical instructions and commercial details often
              cross email, purchase orders, quotes, shipping systems, and ERP records.
            </p>
          </div>
          <div className="industry-system-actions">
            <span>DESIGN-STAGE · PILOT VALIDATION NEXT</span>
            <a href="/distribution">VIEW JCEE DISTRIBUTION <span>→</span></a>
            <a href="/partners/enterprise">DISCUSS AN OPERATING WORKFLOW <span>→</span></a>
          </div>
        </div>
      </section>

      <section className="program-next">
        <p className="charter-section-label">TECHNOLOGY UNDER THE PLATFORM</p>
        <h2>The operating layer and the assurance layer are separate jobs.</h2>
        <p>
          JCEE VOW, QCS, and JCEE Assurance remain distinct technology and research
          programs. Operating Cloud can use those capabilities where they fit without
          turning every business workflow into a research system.
        </p>
        <div className="program-links">
          <a href="/technology">VIEW THE TECHNOLOGY <span>→</span></a>
          <a href="/registry">VIEW THE PUBLIC EVIDENCE <span>→</span></a>
          <a href="/partners/enterprise">START AN ENTERPRISE INQUIRY <span>→</span></a>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
