import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import QcsTransitionGate from "@/components/QcsTransitionGate";
import VowDurabilityDemo from "@/components/VowDurabilityDemo";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const customerProblems = [
  {
    title: "A request timed out. Did it act?",
    copy: "When an operation stops halfway through, teams need evidence of what happened before deciding whether to retry.",
    href: "/vow",
    link: "Explore VOW recovery",
  },
  {
    title: "Two systems disagree. Which one controls the next step?",
    copy: "Critical instructions can live in email, a purchase order, and an ERP at the same time. JCEE is building a way to surface the mismatch before it becomes an operational error.",
    href: "/distribution",
    link: "Explore JCEE Distribution",
  },
  {
    title: "The system says it worked. What supports that?",
    copy: "A reviewer needs an inspectable record. JCEE Assurance explores portable evidence and verification with explicit limits.",
    href: "/assurance",
    link: "Explore JCEE Assurance",
  },
];

const cloudPillars = [
  {
    index: "01",
    title: "Connect the work",
    copy: "Bring the minimum required context together from the systems a team already uses instead of forcing a rip-and-replace project.",
  },
  {
    index: "02",
    title: "Reconcile the differences",
    copy: "Apply industry-specific rules and agent assistance where records, instructions, or workflow state disagree.",
  },
  {
    index: "03",
    title: "Control the action",
    copy: "Keep consequential writes behind explicit authority, evidence, and human review until the operating record supports more automation.",
  },
];

const guarantees = [
  {
    index: "01",
    title: "Durable evidence",
    copy: "Covered executions produce durable receipts designed to survive the process that created them.",
  },
  {
    index: "02",
    title: "Evidence-aware recovery",
    copy: "Recovery decisions remain tied to what preserved execution evidence can actually establish.",
  },
  {
    index: "03",
    title: "Crash recovery",
    copy: "Covered interruptions become explicit states that can be reconciled instead of reconstructed from memory.",
  },
  {
    index: "04",
    title: "Bounded verdicts",
    copy: "The runtime records what is supported, what is refused, and what still requires observation.",
  },
];

const assuranceLayers = [
  {
    label: "JEC",
    title: "Portable evidence contract",
    copy: "Separates evidence records from the claims later derived from them, so a receiving system can inspect scope, lineage, and limits.",
  },
  {
    label: "JCEE ASSURANCE",
    title: "Claim-scoped verification",
    copy: "Evaluates bounded conclusions against named evidence, authority, currentness, and declared certificate rules.",
  },
  {
    label: "IEJ",
    title: "Independent evidence judgment",
    copy: "Studies deterministic review that keeps contradiction, insufficiency, and support meaningfully distinct.",
  },
  {
    label: "EVIDENCE ENGINE",
    title: "Inspection and replay",
    copy: "Presents claim-to-effect records without making the evidence stronger than the underlying artifacts allow.",
  },
];

const registryPreview = [
  {
    status: "VERIFIED MILESTONE",
    name: "JCEE VOW 1.1",
    boundary: "Pinned release and preserved verification record; active hardening continues.",
  },
  {
    status: "VERIFIED MILESTONE",
    name: "QCS-2.0",
    boundary: "Frozen normative core reproduced across the two tested authority classes.",
  },
  {
    status: "EXPERIMENTAL",
    name: "JCEE Assurance",
    boundary: "Bounded verifier stages and portable evidence work; no universal certification claim.",
  },
];

export default function Home() {
  const revealRef = useScrollReveal();

  return (
    <main id="top" className="precision-home" ref={revealRef as any}>
      <CoreHeader current="jcee" />

      <section className="hero hybrid-hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> PRECISION RESEARCH + INTELLIGENCE · DALLAS, TX</p>
          <h1>
            AI can act.
            <br />
            <em>Can it prove it?</em>
          </h1>
          <p className="hero-deck">
            JCEE Labs builds operating and assurance infrastructure for software
            that crosses from intelligence into real-world work. We focus on the
            seams where systems disagree, authority changes, execution fails, or
            a consequential action needs an evidence trail.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="/operating-cloud">EXPLORE OPERATING CLOUD <span>→</span></a>
            <a className="primary-link" href="/partners/enterprise">DISCUSS YOUR WORKFLOW <span>→</span></a>
          </div>
        </div>

        <aside className="hero-proof-index" aria-label="JCEE Labs verification sequence">
          <span>VERIFICATION SEQUENCE</span>
          <ol>
            <li><b>01</b><strong>Observe</strong><small>Establish the authoritative state.</small></li>
            <li><b>02</b><strong>Authorize</strong><small>Earn permission for the next effect.</small></li>
            <li><b>03</b><strong>Preserve</strong><small>Leave a reviewable record.</small></li>
          </ol>
        </aside>
      </section>

      <div className="statement-band" aria-label="JCEE Labs principles">
        <span>EVIDENCE OVER CLAIMS</span>
        <span>•</span>
        <span>AUTHORITY OVER ASSUMPTION</span>
        <span>•</span>
        <span>UNKNOWN IS NOT PERMISSION</span>
      </div>

      <section className="company-section" id="company">
        <div className="section-index">
          <span>01 / JCEE LABS</span>
          <span>RESEARCH · INTELLIGENCE · EXECUTION ASSURANCE</span>
        </div>
        <div className="company-statement">
          <p>THE PROBLEMS WE WORK ON</p>
          <h2>
            When software crosses systems,<br />
            <em>your team needs answers.</em>
          </h2>
        </div>
        <div className="customer-problem-grid">
          {customerProblems.map((problem) => (
            <article key={problem.href}>
              <h3>{problem.title}</h3>
              <p>{problem.copy}</p>
              <a href={problem.href}>{problem.link} <span aria-hidden="true">→</span></a>
            </article>
          ))}
        </div>
        <div className="company-bottom">
          <p>
            Start with one workflow, its existing controls, and a failure or
            mismatch your team needs to prevent. JCEE Labs evaluates the smallest
            useful boundary before asking anyone to replace a system that already works.
          </p>
          <a href="/partners/enterprise">DISCUSS YOUR WORKFLOW <span>→</span></a>
        </div>
      </section>

      <section className="operating-cloud-section" id="operating-cloud" aria-labelledby="operating-cloud-title">
        <div className="operating-cloud-shell">
          <div className="operating-cloud-topline">
            <span>PLATFORM / JCEE OPERATING CLOUD</span>
            <span>PLATFORM DIRECTION · IN DEVELOPMENT</span>
          </div>

          <div className="operating-cloud-lead">
            <div>
              <p>COMMON CORE · INDUSTRY-SPECIFIC OPERATING SYSTEMS</p>
              <h2 id="operating-cloud-title">Keep the systems that work. Add intelligence at the seams.</h2>
            </div>
            <div className="operating-cloud-lead-copy">
              <p>
                JCEE Operating Cloud is the platform direction for connecting
                existing business systems, specialized agents, and assurance
                controls around work that crosses tools and teams.
              </p>
              <a href="/operating-cloud">EXPLORE THE PLATFORM DIRECTION <span>→</span></a>
            </div>
          </div>

          <div className="operating-cloud-flow" aria-label="JCEE Operating Cloud operating flow">
            <div className="cloud-system-column">
              <span>EXISTING SYSTEMS</span>
              <div><strong>EMAIL / PO</strong><small>Instructions + source documents</small></div>
              <div><strong>ERP / CRM</strong><small>Operational system of record</small></div>
              <div><strong>HUMAN REVIEW</strong><small>Exceptions + approval</small></div>
            </div>
            <div className="cloud-bridge" aria-hidden="true"><span>→</span></div>
            <div className="cloud-core-column">
              <span>JCEE OPERATING CLOUD</span>
              <strong>CONNECT</strong>
              <strong>RECONCILE</strong>
              <strong>CONTROL</strong>
            </div>
            <div className="cloud-bridge" aria-hidden="true"><span>→</span></div>
            <div className="cloud-outcome-column">
              <span>OPERATING OUTCOME</span>
              <div><strong>FLAG</strong><small>Surface exact mismatches</small></div>
              <div><strong>ASSIST</strong><small>Prepare the next step</small></div>
              <div><strong>ACT</strong><small>Only when authority permits</small></div>
            </div>
          </div>

          <div className="operating-cloud-pillars">
            {cloudPillars.map((pillar) => (
              <article key={pillar.index}>
                <span>{pillar.index}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.copy}</p>
              </article>
            ))}
          </div>

          <article className="distribution-spotlight">
            <div>
              <span>FIRST INDUSTRY OPERATING SYSTEM</span>
              <h3>JCEE Distribution</h3>
              <p>
                Built first for industrial distribution workflows where quotes,
                purchase orders, shipping instructions, fees, and ERP records can
                disagree across systems. The first evaluation target is simple:
                catch costly mismatches before they become margin loss.
              </p>
            </div>
            <div className="distribution-spotlight-meta">
              <span>DESIGN-STAGE · BOUNDED PILOT WORKFLOWS</span>
              <a href="/distribution">EXPLORE JCEE DISTRIBUTION <span>→</span></a>
            </div>
          </article>
        </div>
      </section>

      <section className="vow-section" id="vow">
        <div className="section-index">
          <span>02 / JCEE VOW</span>
          <span>EVIDENCE-FIRST EXECUTION RUNTIME</span>
        </div>

        <div className="integrated-technology-surface integrated-technology-dark">
          <div className="vow-intro">
            <h2>The runtime between<br />intention and action.</h2>
            <div>
              <p>
                JCEE VOW is an evidence-first execution runtime for consequential
                software and AI-directed actions. It is designed to make covered
                work inspectable, resumable, and accountable—even when a process
                fails halfway through.
              </p>
              <p className="quiet">
                Scope and limitations are documented in the public VOW overview.
              </p>
            </div>
          </div>

          <div className="native-evidence-rail" aria-label="VOW evidence flow">
            <article><span>01</span><strong>INTENT</strong><small>Name the effect before execution.</small></article>
            <i aria-hidden="true">→</i>
            <article><span>02</span><strong>AUTHORITY</strong><small>Check what may happen now.</small></article>
            <i aria-hidden="true">→</i>
            <article><span>03</span><strong>EFFECT</strong><small>Execute through a bounded capability.</small></article>
            <i aria-hidden="true">→</i>
            <article><span>04</span><strong>RECEIPT</strong><small>Preserve the outcome for recovery and review.</small></article>
          </div>
        </div>

        <div className="instrument-frame instrument-frame-dark">
          <div className="instrument-label"><span>LIVE PUBLIC MODEL</span><strong>Crash, recover, inspect.</strong></div>
          <VowDurabilityDemo />
        </div>

        <div className="guarantee-grid">
          {guarantees.map((item) => (
            <article key={item.index}>
              <span>{item.index}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>

        <div className="vow-close">
          <div className="terminal-line">
            <span>$</span>
            <code>vow inspect run_01HX7A --receipts</code>
            <span className="cursor" aria-hidden="true" />
          </div>
          <p>SOFTWARE FAILS. EVIDENCE SHOULDN&apos;T.</p>
        </div>
        <a className="section-detail-link" href="/vow">
          READ THE PUBLIC JCEE VOW OVERVIEW <span>→</span>
        </a>
      </section>

      <section className="qcs-section" id="qcs" aria-labelledby="qcs-title">
        <div className="section-index light">
          <span>03 / QCS</span>
          <span>TRANSITION-LEGITIMACY RESEARCH</span>
        </div>

        <div className="integrated-technology-surface integrated-technology-light">
          <div className="qcs-layout">
            <div>
              <p className="qcs-kicker">VERIFIED MILESTONE · QCS-2.0 CORE FROZEN</p>
              <h2 id="qcs-title">When does the evidence justify the next action?</h2>
            </div>
            <div className="qcs-copy">
              <p>
                QCS is a separate research program for determining whether the
                currently proven authoritative state justifies a proposed causal
                transition.
              </p>
              <p>
                The frozen QCS-2.0 specification passed its planned reproduction
                gate across PostgreSQL transactional authority and a remote
                network-effect authority without changing the frozen calculus.
              </p>
              <p className="quiet">
                Verified milestone, bounded scope. The result applies to the
                tested specification, authority classes, and adversarial
                conditions. It is not a universal correctness,
                production-readiness, or third-party certification claim.
              </p>
              <dl className="qcs-status-grid">
                <div><dt>SPECIFICATION</dt><dd>QCS-2.0 CORE FROZEN</dd></div>
                <div><dt>REPRODUCTION GATE</dt><dd>PASS · TWO AUTHORITY CLASSES</dd></div>
                <div><dt>JUDGMENT</dt><dd>PROVED · DISPROVED · UNKNOWN</dd></div>
              </dl>
              <a href="/qcs">VIEW QCS <span aria-hidden="true">→</span></a>
            </div>
          </div>

          <div className="native-causal-rail" aria-label="QCS transition decision flow">
            <article><span>01</span><strong>PROVEN STATE</strong><small>What is authoritative now?</small></article>
            <i aria-hidden="true">→</i>
            <article><span>02</span><strong>PROPOSED CHANGE</strong><small>What effect is being requested?</small></article>
            <i aria-hidden="true">→</i>
            <article className="native-causal-boundary"><span>03</span><strong>EVIDENCE BOUNDARY</strong><small>Current enough to authorize?</small></article>
            <i aria-hidden="true">→</i>
            <article><span>04</span><strong>ACT / WAIT</strong><small>Never turn unknown into permission.</small></article>
          </div>
        </div>

        <div className="instrument-frame instrument-frame-light">
          <div className="instrument-label"><span>PUBLIC TRANSITION MODEL</span><strong>Change the evidence. Watch the verdict move.</strong></div>
          <QcsTransitionGate />
        </div>
      </section>

      <section className="assurance-section" id="assurance" aria-labelledby="assurance-title">
        <div className="section-index light">
          <span>04 / JCEE ASSURANCE</span>
          <span>PORTABLE EVIDENCE · INDEPENDENT VERIFICATION</span>
        </div>

        <div className="assurance-intro">
          <div>
            <p className="assurance-kicker">ONE LAB · DISTINCT LAYERS · SEPARATE EVIDENCE</p>
            <h2 id="assurance-title">The system that acted should not be the only system asked to prove it.</h2>
          </div>
          <div className="assurance-intro-copy">
            <p>
              JCEE Assurance is the public name for our work on portable
              execution evidence, bounded verification, independent judgment,
              and reviewable proof objects.
            </p>
            <p className="quiet">
              This public overview describes roles and boundaries—not private
              verifier logic, attack corpora, trust profiles, or claim
              construction.
            </p>
          </div>
        </div>

        <div className="assurance-flow" aria-label="JCEE assurance flow">
          <article><span>01</span><strong>EXECUTION</strong><p>A system proposes, acts, waits, recovers, or refuses.</p></article>
          <article><span>02</span><strong>EVIDENCE</strong><p>Relevant state, authority, lineage, and outcome are preserved.</p></article>
          <article><span>03</span><strong>VERIFICATION</strong><p>A bounded conclusion is derived from declared evidence and rules.</p></article>
          <article><span>04</span><strong>REVIEW</strong><p>The result can be inspected without trusting the original narrator.</p></article>
        </div>

        <div className="infrastructure-grid">
          {assuranceLayers.map((layer) => (
            <article key={layer.label}>
              <span>{layer.label}</span>
              <h3>{layer.title}</h3>
              <p>{layer.copy}</p>
            </article>
          ))}
        </div>

        <a className="section-detail-link" href="/assurance">
          VIEW THE PUBLIC ASSURANCE OVERVIEW <span>→</span>
        </a>
      </section>

      <section className="registry-section" id="registry" aria-labelledby="registry-title">
        <div className="section-index">
          <span>05 / PUBLIC REGISTRY</span>
          <span>A LIVING RECORD · NOT A HIGHLIGHT REEL</span>
        </div>

        <div className="registry-intro">
          <div>
            <p className="registry-kicker">PUBLIC CLAIM CONTROL</p>
            <h2 id="registry-title">What we established. What failed. What remains unresolved.</h2>
          </div>
          <div>
            <p>
              Review each program&apos;s recorded milestone, supporting public
              references, and known limitations. Demonstrations explain the
              concepts; the registry distinguishes verified results from
              experimental work.
            </p>
          </div>
        </div>

        <div className="registry-preview">
          {registryPreview.map((entry, index) => (
            <article key={entry.name}>
              <span className="registry-sequence">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <span className="registry-state">{entry.status}</span>
                <h3>{entry.name}</h3>
                <p>{entry.boundary}</p>
              </div>
            </article>
          ))}
        </div>

        <a className="section-detail-link" href="/registry">
          OPEN THE JCEE PUBLIC REGISTRY <span>→</span>
        </a>
      </section>

      <section className="principles-summary" id="charter" aria-labelledby="principles-title">
        <h2 id="principles-title">Intelligence should leave receipts.</h2>
        <p>We test our claims, preserve evidence including failures, and require
          current authority before consequential action. Human accountability remains.</p>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
