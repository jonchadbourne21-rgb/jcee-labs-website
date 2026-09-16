import BuildStatusList from "@/components/BuildStatusList";
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
    document.title = "JCEE Assurance — Method and Workflow Assessments";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="program-page assurance-program-page" id="top">
      <CoreHeader current="assurance" />

      <section
        id="page-content"
        tabIndex={-1}
        className="program-masthead assurance-program"
      >
        <p className="eyebrow">
          <span /> METHOD · ASSESSMENT · IMPLEMENTATION
        </p>
        <div className="program-number">JCEE ASSURANCE / PUBLIC OVERVIEW</div>
        <h1>
          Confidence is not
          <br />
          <em>authority.</em>
        </h1>
        <p className="program-deck">
          A practical method for separating what a system claims, what the
          evidence establishes, and what it is permitted to do next.
        </p>
        <div className="program-status-row">
          <span>START · ONE CONSEQUENTIAL WORKFLOW</span>
          <span>PUBLIC CLAIM · BOUNDED</span>
        </div>
        <div className="program-links">
          <a href="/partners/enterprise">DISCUSS AN ASSESSMENT <span>→</span></a>
          <a href="/registry">INSPECT THE EVIDENCE <span>→</span></a>
        </div>
      </section>

      <section className="program-statement" aria-labelledby="assurance-method-title">
        <p className="charter-section-label">THE METHOD ABOVE THE MECHANISMS</p>
        <h2 id="assurance-method-title">
          Possibility. Evidence. Boundary. Permitted consequence. Receipt.
        </h2>
        <div className="program-statement-copy">
          <p>
            Begin with a claim that can fail. Name the required observations,
            preserve the test conditions, and examine failure and recovery paths.
            Keep a supported result separate from permission to act.
          </p>
          <p>
            The method can guide work before a team adopts JCEE software.
            The Assurance Playbook explains that operating discipline; VOW and
            the other research layers are distinct implementation paths, each
            with its own evidence and readiness boundary.
          </p>
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="assurance-offer-title">
        <div className="section-index">
          <span>THE FIRST ENGAGEMENT</span>
          <span>AGREED SCOPE · WRITTEN DELIVERABLES</span>
        </div>
        <h2 id="assurance-offer-title">Consequential Workflow Assessment</h2>
        <div className="assurance-boundary-columns">
          <article>
            <span>WHAT WE EXAMINE</span>
            <p>
              One workflow, one consequential action, and its existing controls.
              Examples include payment or refund retries, provisioning, approval
              changes, and deployment decisions. An example is not a claim of
              production support for every system.
            </p>
          </article>
          <article>
            <span>WHAT YOU RECEIVE</span>
            <p>
              An Assurance Boundary Report, a Failure Map, an Evidence
              Architecture, and a prioritized control plan. The report states
              what was examined, what remains unknown, and the next useful test.
            </p>
          </article>
        </div>
        <div className="program-links">
          <a href="/partners/enterprise">SCOPE YOUR WORKFLOW <span>→</span></a>
        </div>
      </section>

      <section className="program-statement" aria-labelledby="assurance-adoption-title">
        <p className="charter-section-label">ADOPTION WITHOUT A PLATFORM LEAP</p>
        <h2 id="assurance-adoption-title">Learn the method. Implement where it earns its place.</h2>
        <div className="program-statement-copy">
          <p>
            Start with an assessment. A separately scoped implementation sprint
            can define controls, observations, failure tests, and receipts.
            Software adoption and ongoing assurance follow only where the
            workflow, evidence, and delivery readiness justify them.
          </p>
          <p>
            Our direction is an open method, selectively released reference
            tooling, and proprietary implementation and operating services.
            Public release and licensing are decided artifact by artifact.
            This overview does not release the full playbook or private code,
            grant a software license, or certify a customer system.
          </p>
        </div>
      </section>

      <section className="program-statement">
        <p className="charter-section-label">THE RESEARCH AND IMPLEMENTATION LAYERS</p>
        <h2>
          Execution, evidence, verification, and review are different jobs.
        </h2>
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

      <section
        className="assurance-architecture"
        aria-labelledby="assurance-architecture-title"
      >
        <div className="section-index">
          <span>PUBLIC ARCHITECTURE</span>
          <span>ROLES · NOT IMPLEMENTATION DISCLOSURE</span>
        </div>
        <h2 id="assurance-architecture-title">
          One lab. Distinct layers. Separate evidence.
        </h2>
        <div className="assurance-architecture-grid">
          {assuranceLayers.map(layer => (
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

      <section
        className="program-boundaries"
        aria-labelledby="assurance-supported"
      >
        <div className="section-index">
          <span>PUBLIC CLAIM BOUNDARY</span>
          <span>WHAT THE CURRENT RECORD SUPPORTS</span>
        </div>
        <h2 id="assurance-supported">What we can say now.</h2>
        <div className="assurance-boundary-columns">
          <article>
            <span>SUPPORTED</span>
            <ul>
              {supported.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <span>NOT CLAIMED</span>
            <ul>
              {notClaimed.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="current-builds">
        <div className="section-index">
          <span>CURRENT BUILD RECORDS</span>
          <span>REVIEWED SEPTEMBER 14, 2026</span>
        </div>
        <h2 id="current-builds">
          The built components and their current limits.
        </h2>
        <BuildStatusList
          ids={[
            "jec-1-0",
            "ja-p03",
            "ja-p04",
            "iej",
            "evidence-engine",
            "jec-ea",
            "compound",
          ]}
        />
      </section>
      <section className="program-next">
        <p className="charter-section-label">RELATION TO JCEE VOW AND QCS</p>
        <h2>
          The runtime acts. The calculus constrains. Assurance checks the
          evidence.
        </h2>
        <p>
          JCEE VOW, QCS, JEC, JCEE Assurance, IEJ, and the Evidence Engine are
          distinct public identities with different responsibilities and
          evidence boundaries. Their composition must be tested; it is not
          assumed merely because the layers were designed by the same lab.
        </p>
        <div className="program-links">
          <a href="/registry">
            VIEW THE PUBLIC REGISTRY <span>→</span>
          </a>
          <a href="/vow">
            VIEW JCEE VOW <span>→</span>
          </a>
          <a href="/qcs">
            VIEW QCS <span>→</span>
          </a>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
