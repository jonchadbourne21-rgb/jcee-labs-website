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
    title: "Permission changed. Can it continue?",
    copy: "A previous approval may no longer cover the next action. QCS studies how to bind a transition to current authority and evidence.",
    href: "/qcs",
    link: "Explore QCS research",
  },
  {
    title: "The system says it worked. What supports that?",
    copy: "A reviewer needs an inspectable record. JCEE Assurance explores portable evidence and verification with explicit limits.",
    href: "/assurance",
    link: "Explore JCEE Assurance",
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
            JCEE Labs builds assurance and execution infrastructure between
            machine intelligence and real-world consequence. For teams managing
            automated actions, we focus on current permission, recovery after
            failure, and evidence of what happened.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#vow">SEE THE RUNTIME <span>↓</span></a>
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
            When software acts,<br />
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
            Start with one workflow, its existing controls, and a failure your
            team needs to resolve. Explore a bounded technical evaluation with
            JCEE Labs.
          </p>
          <a href="/partners/enterprise">DISCUSS YOUR WORKFLOW <span>→</span></a>
        </div>
        <div className="breath" aria-hidden="true" />
      </section>

      <section className="vow-section" id="vow">
        <div className="section-index">
          <span>02 / JCEE VOW</span>
          <span>EVIDENCE-FIRST EXECUTION RUNTIME</span>
        </div>

        <figure className="chapter-visual chapter-visual-vow">
          <img
            src="https://jceelabs.com/manus-storage/02-vow-receipt_372bf105.webp"
            alt="Three aligned execution receipts joined by one electric-blue verification line"
            loading="lazy"
          />
          <figcaption><span>EXECUTION RECEIPT / 01</span> Intent, effect, and outcome remain joined.</figcaption>
        </figure>

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

        <VowDurabilityDemo />

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
      <div className="breath" aria-hidden="true" />

      <section className="qcs-section" id="qcs" aria-labelledby="qcs-title">
        <div className="section-index light">
          <span>03 / QCS</span>
          <span>WORKFLOW-FREE TRANSITION CALCULUS · RESEARCH</span>
        </div>
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

        <figure className="chapter-visual chapter-visual-qcs">
          <img
            src="https://jceelabs.com/manus-storage/03-qcs-causal-rail_731e5c1a.webp"
            alt="A causal rail with three state blocks stopped at a transparent evidence boundary"
            loading="lazy"
          />
          <figcaption><span>CAUSAL BOUNDARY / 02</span> A proposed effect stops where authority is unresolved.</figcaption>
        </figure>

        <QcsTransitionGate />
      </section>
      <div className="breath" aria-hidden="true" />

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
      <div className="breath" aria-hidden="true" />

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
      <div className="breath" aria-hidden="true" />

      <section className="principles-summary" id="charter" aria-labelledby="principles-title">
        <h2 id="principles-title">Intelligence should leave receipts.</h2>
        <p>We test our claims, preserve evidence including failures, and require
          current authority before consequential action. Human accountability remains.</p>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
