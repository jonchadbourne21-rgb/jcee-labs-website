import BuildStatusList from "@/components/BuildStatusList";
import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const assuranceLoop = [
  ["01", "State the consequential question", "Name the decision or action that could change if the claim is accepted."],
  ["02", "Define the claim", "Make the proposition specific enough that it can be wrong."],
  ["03", "Write the disproof recipe", "State what observation would count against the claim before running the test."],
  ["04", "Map assumptions", "List dependencies, hidden state, timing, model assumptions, and external authorities."],
  ["05", "Freeze the protocol", "Lock inputs, versions, fixtures, scoring, and stop conditions for the run."],
  ["06", "Separate observations", "Distinguish raw state, transformed state, inferred state, and model judgment."],
  ["07", "Run adversarial cases", "Test ambiguity, missing data, stale state, contradictions, retries, crashes, and edge conditions."],
  ["08", "Capture provenance", "Identify inputs, artifacts, code, environment, and outputs with immutable references where appropriate."],
  ["09", "Evaluate the frozen rule", "Decide using the precommitted rule, not a post-hoc narrative."],
  ["10", "Set the boundary", "Record exactly what the evidence supports and what remains outside scope."],
  ["11", "Authorize the consequence", "Apply explicit authority; do not let the result broaden its own scope."],
  ["12", "Emit the receipt", "Preserve enough evidence for another reviewer to reconstruct the decision."],
];

const methodLayers = [
  { id: "01", name: "JCEE Assurance Method", role: "Method above mechanisms", copy: "The public-facing logic for how a claim earns trust and how authority remains bounded." },
  { id: "02", name: "Assurance Playbook", role: "Teachable operating guide", copy: "Templates, review gates, and an adoption pattern for applying the method consistently." },
  { id: "03", name: "Evidence & Judgment", role: "Observation and bounded conclusion", copy: "Captures observations, provenance, scoring, review, and conclusions without collapsing inference into fact." },
  { id: "04", name: "Authority & Contract", role: "Permission stays separate", copy: "Expresses what an actor may do under explicit scope, state, freshness, delegation, and revocation constraints." },
  { id: "05", name: "VOW Runtime", role: "Consequential execution and recovery", copy: "Preserves durable intent, ambiguity, recovery, effect identity, policy boundaries, and receipts." },
  { id: "06", name: "Adapters & Integrations", role: "Real-system translation", copy: "Translate external systems into explicit observations and permitted actions without hiding uncertainty." },
];

const commercialPath = [
  ["01", "Public playbook", "A technical calling card for learning the method and its vocabulary once the release gate is cleared."],
  ["02", "Assurance assessment", "A time-bounded review of one AI workflow, claim, or consequential automation."],
  ["03", "Implementation sprint", "Freeze protocol, define evidence and authority boundaries, and produce reconstructable receipts."],
  ["04", "Reference tooling", "Selected validators and examples that make the method easier for technical teams to adopt."],
  ["05", "VOW / assurance software", "Software for effect identity, recovery, policy, evidence, judgment, replay, and receipts."],
  ["06", "Enterprise assurance program", "Ongoing controls, evidence operations, review, and integration across multiple workflows."],
];

const supported = [
  "A portable evidence layer can be separated from the runtime that produced the underlying records.",
  "A bounded verifier can distinguish supported, contradictory, and insufficient evidence under declared conditions.",
  "Verification output can state its premises, limits, and evidence identity instead of returning an unexplained success label.",
  "The method can guide a team before that team adopts JCEE software.",
];

const notClaimed = [
  "Universal proof that every consequential action was correct",
  "Independent third-party certification",
  "Production readiness in every environment",
  "Truth merely because a record is signed or well formed",
  "Elimination of every compromised authority, hidden dependency, or bypass path",
  "Public release of the internal working playbook, private verifier logic, attack corpora, trust profiles, or counsel material",
];

export default function AssurancePage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "JCEE Assurance Method — Public Overview";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="program-page assurance-program-page" id="top">
      <CoreHeader current="assurance" />
      <section id="page-content" tabIndex={-1} className="program-masthead assurance-program">
        <p className="eyebrow"><span /> METHOD · EVIDENCE · BOUNDED CONSEQUENCE</p>
        <div className="program-number">JCEE ASSURANCE METHOD / PUBLIC OVERVIEW</div>
        <h1>The actor is not<br /><em>the final judge.</em></h1>
        <p className="program-deck">A repeatable operating method for turning uncertain AI-era claims into bounded, reproducible, reviewable evidence without letting confidence outrun authority.</p>
        <div className="program-status-row"><span>METHOD · ABOVE THE MECHANISMS</span><span>PUBLIC CLAIM · BOUNDED</span></div>
        <div className="program-links"><a href="#assurance-loop">SEE THE 12-STEP LOOP <span>→</span></a><a href="/partners/enterprise">DISCUSS AN ASSESSMENT <span>→</span></a></div>
      </section>

      <section className="program-statement" aria-labelledby="assurance-method-title">
        <p className="charter-section-label">WHAT THE METHOD IS</p>
        <h2 id="assurance-method-title">Possibility. Evidence. Boundary. Permitted consequence. Receipt.</h2>
        <div className="program-statement-copy">
          <p>Claims, observations, decisions, and consequences are different things. The method preserves those differences instead of collapsing them into one confidence score or one unexplained green state.</p>
          <p>Hypotheses may be broad. Authority must remain bounded. Evidence decides what can be claimed; policy decides what can be done.</p>
        </div>
      </section>

      <section id="assurance-loop" className="partner-engagement-model" aria-labelledby="assurance-loop-title">
        <div className="section-index light"><span>THE OPERATING METHOD</span><span>QUESTION → CLAIM → EVIDENCE → CONSEQUENCE → RECEIPT</span></div>
        <div className="partner-shared-layout">
          <div><p className="partner-kicker">THE 12-STEP ASSURANCE LOOP</p><h2 id="assurance-loop-title">A reusable path from question to bounded action.</h2><p>Precommit what would count against the claim, preserve the object tested, attack uncertainty directly, and let the final boundary be no broader than the evidence.</p></div>
          <ol className="partner-sequence">{assuranceLoop.map(([id, title, copy]) => <li key={id}><span>{id}</span><strong>{title}</strong><p>{copy}</p></li>)}</ol>
        </div>
      </section>

      <section className="assurance-architecture" aria-labelledby="assurance-architecture-title">
        <div className="section-index"><span>ASSURANCE STACK</span><span>METHOD ABOVE MECHANISMS</span></div>
        <h2 id="assurance-architecture-title">One operating method. Distinct implementation responsibilities.</h2>
        <div className="assurance-architecture-grid">{methodLayers.map(layer => <article key={layer.id}><span className="assurance-layer-number">{layer.id}</span><div><p>{layer.name}</p><h3>{layer.role}</h3><p>{layer.copy}</p></div></article>)}</div>
      </section>

      <section className="program-boundaries" aria-labelledby="commercial-path-title">
        <div className="section-index"><span>COMMERCIAL PATH</span><span>OPEN LANGUAGE · PROTECTED IMPLEMENTATION</span></div>
        <h2 id="commercial-path-title">The playbook can generate demand without being the whole product.</h2>
        <div className="partner-shared-layout">
          <div><p>The governing direction is method first: teach a discipline people can understand and apply, then sell assessment, implementation, software, and ongoing assurance where repeatability and integration create real operating value.</p><p>Public release decisions remain file-by-file and right-by-right. This page does not publish or release the internal working playbook, private code, sensitive verifier logic, or customer material.</p></div>
          <ol className="partner-sequence">{commercialPath.map(([id, title, copy]) => <li key={id}><span>{id}</span><strong>{title}</strong><p>{copy}</p></li>)}</ol>
        </div>
      </section>

      <section className="program-statement" aria-labelledby="receipt-title">
        <p className="charter-section-label">ENTERPRISE TRANSLATION</p>
        <h2 id="receipt-title">The receipt is the product of the decision.</h2>
        <div className="program-statement-copy"><p>A useful receipt identifies the intended claim or action, exact artifacts, authoritative observations, decision rule, effect identity, recovery state, limitations, and review pointer.</p><p>It lets a skeptical reviewer reconstruct what the organization knew when it acted. That enterprise framing sharpens the presentation without replacing the underlying method.</p></div>
      </section>

      <section className="program-boundaries" aria-labelledby="assurance-supported">
        <div className="section-index"><span>PUBLIC CLAIM BOUNDARY</span><span>WHAT THE CURRENT RECORD SUPPORTS</span></div>
        <h2 id="assurance-supported">What we can say now.</h2>
        <div className="assurance-boundary-columns">
          <article><span>SUPPORTED</span><ul>{supported.map(item => <li key={item}>{item}</li>)}</ul></article>
          <article><span>NOT CLAIMED</span><ul>{notClaimed.map(item => <li key={item}>{item}</li>)}</ul></article>
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="current-builds">
        <div className="section-index"><span>CURRENT BUILD RECORDS</span><span>REVIEWED SEPTEMBER 14, 2026</span></div>
        <h2 id="current-builds">The built components and their current limits.</h2>
        <BuildStatusList ids={["jec-1-0", "ja-p03", "ja-p04", "iej", "evidence-engine", "jec-ea", "compound"]} />
      </section>

      <section className="program-next">
        <p className="charter-section-label">RELATION TO JCEE SYSTEMS</p>
        <h2>The method guides. The systems implement bounded obligations.</h2>
        <p>JCEE VOW, QCS, JEC, JCEE Assurance, IEJ, and the Evidence Engine retain distinct responsibilities and evidence boundaries. Their composition must be tested; shared authorship does not make composition correct.</p>
        <div className="program-links"><a href="/registry">VIEW THE PUBLIC REGISTRY <span>→</span></a><a href="/vow">VIEW JCEE VOW <span>→</span></a><a href="/qcs">VIEW QCS <span>→</span></a></div>
      </section>
      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
