import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const assuranceLayers = [
  {
    id: "01",
    name: "JEC",
    role: "Portable evidence contract",
    copy: "Defines a runtime-neutral way to carry typed records, scope, lineage, commitments, and declared uncertainty between systems.",
  },
  {
    id: "02",
    name: "JCEE Assurance",
    role: "Claim-scoped verification",
    copy: "Evaluates whether named evidence establishes a bounded conclusion under an explicit authority and verification boundary.",
  },
  {
    id: "03",
    name: "IEJ",
    role: "Independent evidence judgment",
    copy: "Studies reproducible judgment that preserves the difference between contradiction, insufficient evidence, and supported closure.",
  },
  {
    id: "04",
    name: "Evidence Engine",
    role: "Inspection and replay",
    copy: "Turns preserved evidence into a reviewable record without replacing the underlying artifacts or strengthening their claim.",
  },
];

const supported = [
  "A portable evidence layer can be separated from the runtime that produced the underlying records.",
  "A bounded verifier can distinguish supported, contradictory, and insufficient evidence under declared conditions.",
  "Verification output can state its premises, limits, and evidence identity instead of returning an unexplained success label.",
  "The same public architecture can receive evidence from JCEE VOW, QCS-aligned systems, and other conforming producers.",
];

const notClaimed = [
  "Universal proof that every consequential action was correct",
  "Independent third-party certification",
  "Production readiness in every environment",
  "Truth merely because a record is signed or well formed",
  "Elimination of every compromised authority, hidden dependency, or bypass path",
  "Public disclosure of private verifier logic, attack corpora, trust profiles, or counsel material",
];

export default function AssurancePage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "JCEE Assurance — Public Overview";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="program-page assurance-program-page" id="top">
      <CoreHeader current="assurance" />

      <section className="program-masthead assurance-program">
        <p className="eyebrow"><span /> PUBLIC OVERVIEW · ACTIVE RESEARCH</p>
        <div className="program-number">JCEE ASSURANCE / PUBLIC OVERVIEW</div>
        <h1>
          The actor is not<br />
          <em>the final judge.</em>
        </h1>
        <p className="program-deck">
          JCEE Assurance is the infrastructure between execution evidence and a
          bounded, independently reviewable conclusion.
        </p>
        <div className="program-status-row">
          <span>SYSTEM · MULTI-LAYER ASSURANCE RESEARCH</span>
          <span>PUBLIC CLAIM · BOUNDED</span>
        </div>
      </section>

      <section className="program-statement">
        <p className="charter-section-label">THE POSITION</p>
        <h2>Execution, evidence, verification, and review are different jobs.</h2>
        <div className="program-statement-copy">
          <p>
            A runtime can record what it attempted and observed. That does not
            mean the runtime should be trusted to decide every claim about its
            own behavior.
          </p>
          <p>
            JCEE separates the evidence carrier, the verification rules, the
            resulting judgment, and the human-readable review surface. Each
            layer can remain bounded to what it is actually competent to
            establish.
          </p>
        </div>
      </section>

      <section className="assurance-architecture" aria-labelledby="assurance-architecture-title">
        <div className="section-index">
          <span>PUBLIC ARCHITECTURE</span>
          <span>ROLES · NOT IMPLEMENTATION DISCLOSURE</span>
        </div>
        <h2 id="assurance-architecture-title">One lab. Distinct layers. Separate evidence.</h2>
        <div className="assurance-architecture-grid">
          {assuranceLayers.map((layer) => (
            <article key={layer.id}>
              <span className="assurance-layer-number">{layer.id}</span>
              <div>
                <p>{layer.name}</p>
                <h3>{layer.role}</h3>
                <p>{layer.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="assurance-supported">
        <div className="section-index">
          <span>PUBLIC CLAIM BOUNDARY</span>
          <span>WHAT THE CURRENT RECORD SUPPORTS</span>
        </div>
        <h2 id="assurance-supported">What we can say now.</h2>
        <div className="assurance-boundary-columns">
          <article>
            <span>SUPPORTED</span>
            <ul>
              {supported.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <article>
            <span>NOT CLAIMED</span>
            <ul>
              {notClaimed.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </div>
      </section>

      <section className="program-next">
        <p className="charter-section-label">RELATION TO JCEE VOW AND QCS</p>
        <h2>The runtime acts. The calculus constrains. Assurance checks the evidence.</h2>
        <p>
          JCEE VOW, QCS, JEC, JCEE Assurance, IEJ, and the Evidence Engine are
          distinct public identities with different responsibilities and
          evidence boundaries. Their composition must be tested; it is not
          assumed merely because the layers were designed by the same lab.
        </p>
        <div className="program-links">
          <a href="/registry">VIEW THE PUBLIC REGISTRY <span>→</span></a>
          <a href="/vow">VIEW JCEE VOW <span>→</span></a>
          <a href="/qcs">VIEW QCS <span>→</span></a>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
