import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const sharedStandard = [
  ["BOUNDARY", "Name the system, action, or claim that needs stronger control."],
  ["EVIDENCE", "Show what can be inspected today and what remains inferred."],
  ["DECISION", "Define what a successful engagement should allow you to decide."],
];

export default function PartnersPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Partner With JCEE Labs";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="program-page partner-page partner-gateway" id="top">
      <CoreHeader current="partners" />

      <section id="page-content" tabIndex={-1} className="program-masthead partner-masthead">
        <p className="eyebrow"><span /> JCEE LABS PARTNERSHIPS · TWO PATHWAYS</p>
        <div className="program-number">JCEE LABS / PARTNERS</div>
        <h1>
          Choose the boundary<br />
          <em>you need to strengthen.</em>
        </h1>
        <p className="program-deck">
          Companies bring us consequential systems. Research teams bring us claims,
          methods, and evidence. Each pathway starts with a different brief.
        </p>
        <div className="program-status-row">
          <span>01 · ENTERPRISE / OPERATIONAL SYSTEMS</span>
          <span>02 · RESEARCH / CLAIMS + REPRODUCTION</span>
        </div>
      </section>

      <section className="partner-pathways" aria-labelledby="partner-pathways-title">
        <div className="section-index">
          <span>SELECT A PATH</span>
          <span>TAILORED REVIEW · DISTINCT ROUTING</span>
        </div>
        <div className="partner-pathways-lead">
          <p>PARTNERSHIP ENTRY POINT</p>
          <h2 id="partner-pathways-title">Two ways to begin. One evidence standard.</h2>
        </div>

        <div className="partner-pathway-grid">
          <article className="partner-pathway-card partner-pathway-enterprise">
            <div className="partner-pathway-code">01 / ENTERPRISE</div>
            <h3>For teams deploying systems that can act.</h3>
            <p>
              Explore bounded evaluations, design partnerships, and strategic integrations
              for workflows where authority, recovery, and execution evidence matter.
            </p>
            <ul>
              <li>Operational and product systems</li>
              <li>Consequential automation</li>
              <li>Evidence and control architecture</li>
              <li>Integration or evaluation planning</li>
            </ul>
            <a className="partner-pathway-link" href="/partners/enterprise">
              ENTERPRISE PATHWAY <span aria-hidden="true">→</span>
            </a>
          </article>

          <article className="partner-pathway-card partner-pathway-research">
            <div className="partner-pathway-code">02 / RESEARCH</div>
            <h3>For teams testing what a claim can support.</h3>
            <p>
              Propose replication, methods, benchmark, standards, or joint-publication work
              with explicit artifacts, assumptions, and disclosure boundaries.
            </p>
            <ul>
              <li>Independent reproduction</li>
              <li>Methods and measurement</li>
              <li>Benchmarks and evidence artifacts</li>
              <li>Publication and standards work</li>
            </ul>
            <a className="partner-pathway-link" href="/partners/research">
              RESEARCH PATHWAY <span aria-hidden="true">→</span>
            </a>
          </article>
        </div>
      </section>

      <section className="partner-shared-standard" aria-labelledby="shared-standard-title">
        <div className="section-index light">
          <span>SHARED STANDARD</span>
          <span>EVIDENCE BEFORE SCHEDULING</span>
        </div>
        <div className="partner-shared-layout">
          <div>
            <p className="partner-kicker">EVERY INQUIRY</p>
            <h2 id="shared-standard-title">Start with the boundary, not the pitch.</h2>
          </div>
          <div className="partner-signal-list">
            {sharedStandard.map(([label, copy]) => (
              <article key={label}>
                <span>{label}</span>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
