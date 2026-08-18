import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import HexInspector from "@/components/HexInspector";
import HexWaveField from "@/components/HexWaveField";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import "@/home-hex.css";

const guarantees = [
  {
    index: "01",
    title: "Durable evidence",
    copy: "Every meaningful execution leaves a receipt that survives the process that created it.",
  },
  {
    index: "02",
    title: "Evidence-aware recovery",
    copy: "Recovery decisions account for what the recorded execution can actually establish.",
  },
  {
    index: "03",
    title: "Crash recovery",
    copy: "Failure becomes a recorded state to resume from—not a mystery to reconstruct.",
  },
  {
    index: "04",
    title: "Explicit verdicts",
    copy: "The system records what is supported, what is refused, and what still requires observation.",
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

      <section className="qcs-section" id="qcs" aria-labelledby="qcs-title">
        <div className="section-index light">
          <span>04 / QCS</span>
          <span>WORKFLOW-FREE TRANSITION CALCULUS · RESEARCH</span>
        </div>
        <div className="qcs-layout">
          <div>
            <p className="qcs-kicker">A SEPARATE JCEE LABS RESEARCH PROGRAM</p>
            <h2 id="qcs-title">When does the evidence justify the next action?</h2>
          </div>
          <div className="qcs-copy">
            <p>
              QCS studies the rules that connect available evidence to a justified
              transition. Its 1.x line is frozen as a candidate specification;
              QCS-2.0 is focused on independent reproduction.
            </p>
            <p className="quiet">
              QCS is research. It is separate from the VOW product release, and
              its present status does not imply a universal result.
            </p>
            <dl className="qcs-status-grid">
              <div><dt>SPECIFICATION</dt><dd>FROZEN CANDIDATE</dd></div>
              <div><dt>CURRENT GATE</dt><dd>INDEPENDENT REPRODUCTION</dd></div>
              <div><dt>PUBLIC POSTURE</dt><dd>BOUNDED RESEARCH CLAIMS</dd></div>
            </dl>
            <a href="/qcs">VIEW QCS <span aria-hidden="true">→</span></a>
          </div>
        </div>
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
