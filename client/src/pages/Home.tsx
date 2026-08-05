const receiptRows = [
  ["00", "intent", "verified"],
  ["01", "effect", "committed once"],
  ["02", "operator", "crash observed"],
  ["03", "replay", "resumed"],
  ["04", "duplicate effects", "0"],
];

const guarantees = [
  {
    index: "01",
    title: "Durable evidence",
    copy: "Every meaningful execution leaves a receipt that survives the process that created it.",
  },
  {
    index: "02",
    title: "Exactly-once effects",
    copy: "Retries and recovery do not have to mean duplicate real-world actions.",
  },
  {
    index: "03",
    title: "Crash recovery",
    copy: "Failure becomes a recorded state to resume from—not a mystery to reconstruct.",
  },
  {
    index: "04",
    title: "Scar memory",
    copy: "Failed paths become durable knowledge, so the system can stop repeating avoidable mistakes.",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="JCEE Labs home">
          <span className="mark" aria-hidden="true">J</span>
          <span>JCEE LABS</span>
        </a>

        <nav aria-label="Main navigation">
          <a href="#vow">VOW</a>
          <a href="#mirrored">MIRRORED</a>
          <span className="nav-menu">
            <a href="#company">ABOUT</a>
            <span className="nav-submenu">
              <a href="/charter">CHARTER</a>
            </span>
          </span>
        </nav>

        <a className="header-contact" href="mailto:jonathan@jceelabs.com">
          CONTACT <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero" id="top">
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

        <aside className="receipt" aria-label="Example VOW execution receipt">
          <div className="receipt-header">
            <span>VOW / EXECUTION RECEIPT</span>
            <span className="receipt-status"><i /> PROVABLE</span>
          </div>
          <div className="receipt-id">
            <span>RUN</span>
            <strong>vow_01HX7A</strong>
            <span>2026-08-03 17:42:11</span>
          </div>
          <div className="receipt-rows">
            {receiptRows.map(([index, label, value]) => (
              <div className="receipt-row" key={index}>
                <span>{index}</span>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="hash-line">
            <span>PROOF</span>
            <code>4a91:0d72:bc8e:f103</code>
          </div>
          <div className="receipt-footer">
            <span>CLAIM</span>
            <strong>EXECUTION VERIFIED</strong>
          </div>
        </aside>
      </section>

      <div className="statement-band" aria-label="JCEE Labs principle">
        <span>EVIDENCE OVER CLAIMS</span>
        <span>•</span>
        <span>STATE OVER GUESSWORK</span>
        <span>•</span>
        <span>RECOVERY OVER RESTARTS</span>
      </div>

      <section className="vow-section" id="vow">
        <div className="section-index">
          <span>01 / VOW</span>
          <span>EXECUTION RUNTIME</span>
        </div>

        <div className="vow-intro">
          <h2>The runtime between<br />intention and effect.</h2>
          <div>
            <p>
              VOW is an evidence-first execution runtime for AI systems. It is
              designed to make agent work inspectable, resumable, and
              accountable—even when the process fails halfway through.
            </p>
            <p className="quiet">
              Not another model. Not another wrapper. The layer that remembers
              what actually happened.
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
      </section>

      <section className="mirrored-section" id="mirrored">
        <div className="section-index light">
          <span>02 / MIRRORED</span>
          <span>CONSUMER PRODUCT · COMING SOON</span>
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
              Mirrored is an upcoming voice-first reflection product designed
              to help people hear their own patterns, examine their thinking,
              and move with greater intention.
            </p>
            <div className="mirrored-meta">
              <span>VOICE-TO-VOICE</span>
              <span>DAILY REFLECTION</span>
              <span>PHILOSOPHICAL PROGRAMS</span>
            </div>
            <a href="mailto:jonathan@jceelabs.com?subject=Mirrored%20early%20access">
              REQUEST EARLY ACCESS <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="company-section" id="company">
        <div className="section-index">
          <span>03 / JCEE LABS</span>
          <span>HOWM HOLDINGS LLC</span>
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
            JCEE Labs is an independent software company building systems at
            the intersection of intelligence, execution, and human agency.
          </p>
          <a href="mailto:jonathan@jceelabs.com">jonathan@jceelabs.com <span>↗</span></a>
        </div>
      </section>

      <section className="charter-intro" aria-labelledby="charter-intro-title">
        <div className="section-index">
          <span>04 / CHARTER</span>
          <span>PUBLIC STANDARD · VERSION 1.0</span>
        </div>
        <div className="charter-intro-copy">
          <h2 id="charter-intro-title">The JCEE Labs Charter</h2>
          <p>
            Why we exist, what problems we pursue, how we conduct research, and
            the boundaries we will not cross.
          </p>
          <a href="/charter">Read the Charter <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <footer>
        <div className="footer-wordmark">JCEE LABS</div>
        <div className="footer-meta">
          <span>© 2026 HOWM HOLDINGS LLC</span>
          <span>DALLAS, TEXAS</span>
          <a href="#top">BACK TO TOP ↑</a>
        </div>
      </footer>
    </main>
  );
}

