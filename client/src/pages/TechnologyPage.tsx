import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const technologies = [
  {
    index: "01",
    label: "JCEE VOW",
    title: "Execution evidence and recovery",
    copy: "An evidence-first runtime for covered software actions that need to remain inspectable through interruption, retry, recovery, and review.",
    href: "/vow",
    status: "VERIFIED MILESTONE · ACTIVE HARDENING",
  },
  {
    index: "02",
    label: "QCS",
    title: "Current evidence before the next action",
    copy: "A separate research program asking whether the authoritative state proven now still justifies a proposed transition now.",
    href: "/qcs",
    status: "QCS-2.0 CORE FROZEN · REPRODUCTION GATE PASS",
  },
  {
    index: "03",
    label: "JCEE ASSURANCE",
    title: "Independent review of execution evidence",
    copy: "Research and infrastructure for carrying evidence across system boundaries and deriving bounded conclusions without asking the acting system to be its only judge.",
    href: "/assurance",
    status: "ACTIVE RESEARCH · BOUNDED PUBLIC CLAIMS",
  },
];

export default function TechnologyPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Technology — JCEE Labs";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="program-page technology-page" id="top">
      <CoreHeader current="technology" />

      <section className="program-masthead technology-program">
        <p className="eyebrow"><span /> EXECUTION · EVIDENCE · AUTHORITY</p>
        <div className="program-number">JCEE LABS / TECHNOLOGY</div>
        <h1>Different jobs.<br /><em>Explicit boundaries.</em></h1>
        <p className="program-deck">
          JCEE Labs separates the operating product from the technology that can
          support it. The runtime, transition research, and assurance work each
          answer a different question and keep their claims independently bounded.
        </p>
        <div className="program-status-row">
          <span>PUBLIC OVERVIEWS · EVIDENCE-LINKED</span>
          <span>DETAIL · PUBLIC REGISTRY</span>
        </div>
      </section>

      <section className="technology-overview-section" aria-labelledby="technology-overview-title">
        <div className="section-index">
          <span>PUBLIC TECHNOLOGY</span>
          <span>PLAIN LANGUAGE FIRST · TECHNICAL DETAIL AVAILABLE</span>
        </div>
        <h2 id="technology-overview-title">Three questions sit underneath the operating platform.</h2>
        <div className="technology-overview-grid">
          {technologies.map((technology) => (
            <article key={technology.label}>
              <div className="technology-card-topline">
                <span>{technology.index}</span>
                <span>{technology.label}</span>
              </div>
              <h3>{technology.title}</h3>
              <p>{technology.copy}</p>
              <small>{technology.status}</small>
              <a href={technology.href}>VIEW PUBLIC OVERVIEW <span>→</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="technology-boundary-section" aria-labelledby="technology-boundary-title">
        <div>
          <p className="charter-section-label">WHY THE SEPARATION MATTERS</p>
          <h2 id="technology-boundary-title">The product should not become a bundle of internal research names.</h2>
        </div>
        <div>
          <p>
            Customers should be able to understand the operating outcome first.
            JCEE VOW, QCS, and JCEE Assurance are exposed here for technical teams,
            reviewers, and partners who need to inspect the mechanisms and evidence
            behind that outcome.
          </p>
          <p>
            A capability is used only where it earns a role in the workflow. A
            normal application path stays normal application logic when it does not
            need a specialized assurance boundary.
          </p>
        </div>
      </section>

      <section className="program-next">
        <p className="charter-section-label">EVIDENCE BEFORE EXPANSION</p>
        <h2>See the recorded milestones and limitations, not just the architecture.</h2>
        <p>
          The JCEE Public Registry distinguishes verified milestones, experimental
          work, defined specifications, and governing standards. The label never
          overrides the stated boundary of the evidence.
        </p>
        <div className="program-links">
          <a href="/registry">OPEN THE PUBLIC REGISTRY <span>→</span></a>
          <a href="/operating-cloud">VIEW OPERATING CLOUD <span>→</span></a>
          <a href="/partners">PARTNER WITH JCEE LABS <span>→</span></a>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
