import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import CurlicueField from "@/components/CurlicueField";
import HexInspector from "@/components/HexInspector";
import HexWaveField from "@/components/HexWaveField";
import QcsTransitionGate from "@/components/QcsTransitionGate";
import VowDurabilityDemo from "@/components/VowDurabilityDemo";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import "@/home-hex.css";

const guarantees = [
  {
    index: "01",
    title: "Durable evidence",
    copy: "Covered executions produce durable receipts designed to survive the process that created them.",
  },
  {
    index: "02",
    title: "Evidence-aware recovery",
    copy: "Recovery decisions are tied to what preserved execution evidence can actually establish.",
  },
  {
    index: "03",
    title: "Crash recovery",
    copy: "Covered interruptions become recorded states that can be reconciled instead of reconstructed from memory.",
  },
  {
    index: "04",
    title: "Explicit verdicts",
    copy: "The runtime records what is supported, what is refused, and what still requires observation.",
  },
];

export default function Home() {
  const revealRef = useScrollReveal();

  return (
    <main id="top" ref={revealRef as any}>
      <CoreHeader current="jcee" />

      <section className="hero hex-hero">
        <HexWaveField />
        <div className="hex-ambient-data" aria-hidden="true">
          <span>0x0000 · 4A 43 45 45 · JCEE</span>
          <span>01000101 01010110 01001001 01000100 01000101 01001110 01000011 01000101</span>
          <span>0x7F2E · STATE=OBSERVED · PROOF=BOUNDED</span>
        </div>

        <div className="hero-copy">
          <p className="eyebrow"><span /> INDEPENDENT SOFTWARE LAB · DALLAS, TX</p>
          <h1>
            AI can act.
            <br />
            <em>Can it prove it?</em>
          </h1>
          <p className="hero-deck">
            JCEE Labs builds software for the moment intelligence leaves the
            chat window and touches the real world.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#vow">SEE THE RUNTIME <span>↓</span></a>
            <span className="availability"><i /> BUILDING IN PUBLIC · 2026</span>
          </div>
        </div>

        <HexInspector />
      </section>

      <div className="statement-band" aria-label="JCEE Labs principle">
        <span>EVIDENCE OVER CLAIMS</span>
        <span>•</span>
        <span>STATE OVER GUESSWORK</span>
        <span>•</span>
        <span>RECOVERY OVER RESTARTS</span>
      </div>

      <section className="company-section" id="company">
        <div className="section-index">
          <span>01 / JCEE LABS</span>
          <span>INDEPENDENT SOFTWARE LAB · DALLAS, TEXAS</span>
        </div>
        <div className="company-statement">
          <p>OUR STANDARD</p>
          <h2>
            A claim is not a feature.<br />
            <em>A demo is not proof.</em><br />
            Intelligence should leave receipts.
          </h2>
        </div>
        <div className="company-bottom">
          <p>
            JCEE Labs discovers and engineers the principles of intelligent
            execution. We build software and conduct research where intelligence,
            evidence, execution, and human responsibility meet.
          </p>
          <a href="/charter">READ OUR CHARTER <span>→</span></a>
        </div>
        <div className="breath" aria-hidden="true" />
      </section>

      <section className="vow-section" id="vow">
        <div className="section-index">
          <span>02 / VOW</span>
          <span>EVIDENCE-FIRST EXECUTION RUNTIME</span>
        </div>

        <div className="vow-intro">
          <h2>The runtime between<br />intention and action.</h2>
          <div>
            <p>
              VOW is an evidence-first execution runtime for AI systems. It is
              designed to make agent work inspectable, resumable, and
              accountable—even when the process fails halfway through.
            </p>
            <p className="quiet">
              Not another model. The execution layer beneath the claim.
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
        <a className="section-detail-link" href="/vow">READ THE PUBLIC VOW OVERVIEW <span>→</span></a>
      </section>
      <div className="breath" aria-hidden="true" />

      <section className="charter-intro evidence-intro" id="research" aria-labelledby="evidence-intro-title">
        <div className="section-index">
          <span>03 / RESEARCH &amp; EVIDENCE</span>
          <span>PUBLIC RECORD · ACTIVE</span>
        </div>
        <div className="charter-intro-copy">
          <h2 id="evidence-intro-title">Research &amp; Evidence</h2>
          <p>
            A public record of what we are testing, what the evidence supports,
            where the limits are, and what remains unproven.
          </p>
          <div className="home-research-links">
            <a href="/research-evidence">View the Index <span aria-hidden="true">→</span></a>
            <a href="/research/jrp-000">Read JRP-000 <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>
      <div className="breath" aria-hidden="true" />

      <section className="curlicue-section" aria-labelledby="curlicue-title">
        <div className="curlicue-index">
          <span>RESEARCH FIELD / IRRATIONAL ORDER</span>
          <span>ONE RULE · CONTINUOUS UNFOLDING</span>
        </div>
        <div className="curlicue-layout">
          <div className="curlicue-stage">
            <CurlicueField />
            <div className="curlicue-coordinates" aria-hidden="true">
              <span>α = √2 − 1 · IRRATIONAL</span>
              <span>EQUAL STEP · QUADRATIC PHASE · LIVE TRACE</span>
            </div>
          </div>
          <div className="curlicue-copy">
            <p className="curlicue-kicker">IRRATIONAL ORDER / LIVE GENERATIVE FIELD</p>
            <h2 id="curlicue-title">Perfect rule.<br />No true repeat.</h2>
            <p>
              A curlicue path shows how intricate structure can emerge from an
              extremely small rule. Each segment is equal. Only its direction
              changes, driven by an irrational quadratic phase. The instruction
              stays exact while the geometry keeps unfolding into spiral-like,
              braided forms that do not settle into a finite repeating cycle.
            </p>
            <div className="curlicue-formula">
              <span>PUBLIC GENERATIVE RULE</span>
              <code>θₙ = 2π α n² · pₙ₊₁ = pₙ + (cos θₙ, sin θₙ)</code>
            </div>
            <p className="curlicue-note">
              LIVE CLIENT-SIDE VISUALIZATION · α = √2 − 1 · NOT QCS EXECUTION
            </p>
          </div>
        </div>
      </section>
      <div className="breath" aria-hidden="true" />

      <section className="qcs-section" id="qcs" aria-labelledby="qcs-title">
        <div className="section-index light">
          <span>04 / QCS</span>
          <span>WORKFLOW-FREE TRANSITION CALCULUS · RESEARCH</span>
        </div>
        <div className="qcs-layout">
          <div>
            <p className="qcs-kicker">VERIFIED MILESTONE · QCS-2.0 CORE FROZEN</p>
            <h2 id="qcs-title">When does the evidence justify the next action?</h2>
          </div>
          <div className="qcs-copy">
            <p>
              QCS is a workflow-free transition legality calculus for determining
              whether the currently proven authoritative state justifies a proposed
              causal transition.
            </p>
            <p>
              The frozen QCS-2.0 specification passed its planned reproduction gate
              across PostgreSQL transactional authority and a remote network-effect
              authority without changing the frozen calculus.
            </p>
            <p className="quiet">
              Verified milestone, bounded scope. The result applies to the tested
              specification, authority classes, and adversarial conditions. It is
              not a universal correctness, production-readiness, or third-party
              certification claim.
            </p>
            <dl className="qcs-status-grid">
              <div><dt>SPECIFICATION</dt><dd>QCS-2.0 CORE FROZEN</dd></div>
              <div><dt>REPRODUCTION GATE</dt><dd>PASS · TWO AUTHORITY CLASSES</dd></div>
              <div><dt>JUDGMENT</dt><dd>PROVED · DISPROVED · UNKNOWN</dd></div>
            </dl>
            <a href="/qcs">VIEW QCS <span aria-hidden="true">→</span></a>
          </div>
        </div>

        <QcsTransitionGate />
      </section>
      <div className="breath" aria-hidden="true" />

      <section className="charter-intro" aria-labelledby="charter-intro-title">
        <div className="section-index">
          <span>05 / CHARTER</span>
          <span>PUBLIC STANDARD · VERSION 1.0</span>
        </div>
        <div className="charter-intro-copy">
          <h2 id="charter-intro-title">The JCEE Labs Charter</h2>
          <p>
            Why we exist, how we conduct research, what we refuse to build, and
            the standards that govern the institution.
          </p>
          <a href="/charter">Read the Charter <span aria-hidden="true">→</span></a>
        </div>
        <div className="breath" aria-hidden="true" />
      </section>

      <section className="mirrored-section" id="mirrored">
        <div className="section-index light">
          <span>06 / MIRRORED</span>
          <span>CONSUMER PRODUCT · IN DEVELOPMENT</span>
        </div>

        <div className="mirrored-layout">
          <div className="mirror-orbit" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="mirror-core">M</div>
          </div>

          <div className="mirrored-copy">
            <p className="mirrored-kicker">A DIFFERENT SURFACE. THE SAME STANDARD.</p>
            <h2>A conversation<br />that reflects you.</h2>
            <p>
              Mirrored is a voice-first reflection product designed to help
              people hear their own patterns, examine their thinking, and move
              with greater intention.
            </p>
            <div className="mirrored-meta">
              <span>VOICE-TO-VOICE</span>
              <span>DAILY REFLECTION</span>
              <span>GUIDED PRACTICE</span>
            </div>
            <a href="/mirrored">
              VIEW MIRRORED <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
