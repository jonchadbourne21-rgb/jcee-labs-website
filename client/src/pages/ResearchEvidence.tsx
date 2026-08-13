import { useEffect } from "react";

const contents = [
  ["standard", "Evidence Before Claims"],
  ["classifications", "I. Evidence Classifications"],
  ["current-work", "II. Current Work"],
  ["evidence", "III. What Counts as Evidence"],
  ["negative-results", "IV. Failed and Negative Results"],
  ["public-protected", "V. Public Evidence and Protected Work"],
  ["separation", "VI. Product and Research Separation"],
  ["our-standard", "VII. Our Standard"],
  ["revisions", "Revision History"],
];

const githubUrl =
  "https://github.com/jonchadbourne21-rgb/jcee-labs-website/blob/main/public/JCEE_Labs_Research_Evidence_Index_v1.0.md";

const classifications = [
  ["Planned", "The problem and intended investigation have been identified, but the experiment or implementation has not been frozen. No result is claimed."],
  ["Preregistered", "The hypothesis, test conditions, scoring rules, stopping rules, and rejection thresholds have been defined before results are observed. A preregistered experiment is ready to run. It is not a verified result."],
  ["Experimental", "The work has produced results, but reproduction, transfer testing, adversarial review, or independent verification remains incomplete. Experimental findings may guide further work. They are not presented as established facts."],
  ["Verified Milestone", "A specific and bounded claim has survived its defined verification process, and the supporting evidence has been preserved. Verified applies only to the claim and conditions identified. It does not mean universally proven, independently certified, or production-ready in every environment."],
  ["Rejected", "The claim failed its stated threshold, depended on an unsupported assumption, or could not be reproduced under the required conditions. Rejected results are preserved. They are not rewritten as successes."],
  ["Closed", "The investigation has ended because the claim was rejected, the research question was answered, or further work no longer provides enough value to justify continuing."],
];

export default function ResearchEvidence() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "JCEE Labs Research & Evidence Index";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="charter-page evidence-page" id="top">
      <header className="site-header charter-header">
        <a className="wordmark" href="/" aria-label="JCEE Labs home">
          <span className="mark" aria-hidden="true">J</span>
          <span>JCEE LABS</span>
        </a>

        <nav aria-label="Main navigation">
          <a href="/#vow">VOW</a>
          <a href="/#mirrored">MIRRORED</a>
          <span className="nav-menu">
            <a href="/#company">ABOUT</a>
            <span className="nav-submenu">
              <a href="/charter">CHARTER</a>
              <a href="/research-evidence" aria-current="page">RESEARCH &amp; EVIDENCE</a>
            </span>
          </span>
        </nav>

        <a className="header-contact" href="mailto:support@jceelabs.com">
          CONTACT <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="charter-masthead evidence-masthead">
        <p className="eyebrow"><span /> PUBLIC RECORD · VERSION 1.0</p>
        <h1 className="charter-title evidence-title">Research &amp;<br /><em>Evidence</em></h1>
        <p className="charter-position">
          This index records the status of our work, the evidence behind it,
          its known limitations, and what remains unproven.
        </p>
        <div className="charter-version-row">
          <span>VERSION 1.0 — AUGUST 13, 2026</span>
          <span>STATUS · CURRENT</span>
        </div>
      </section>

      <div className="charter-shell">
        <aside className="charter-toc" aria-label="Research and Evidence table of contents">
          <p>CONTENTS</p>
          <ol>
            {contents.map(([id, label]) => (
              <li key={id}><a href={`#${id}`}>{label}</a></li>
            ))}
          </ol>
          <div className="charter-file-links">
            <a href={githubUrl} target="_blank" rel="noreferrer">VIEW ON GITHUB ↗</a>
            <a href="/JCEE_Labs_Research_Evidence_Index_v1.0.md" download>DOWNLOAD .MD ↓</a>
          </div>
        </aside>

        <article className="charter-document">
          <section id="standard">
            <p className="charter-section-label">EVIDENCE BEFORE CLAIMS</p>
            <p className="charter-opening">JCEE Labs was founded on a simple position: increasingly capable systems should not be trusted based on demonstrations, promises, or appearances alone.</p>
            <p>Their actions should produce evidence.</p>
            <p>That principle also applies to our own work. We do not treat an idea as an invention, an experiment as a result, or a successful test as a universal claim. Every public claim should be limited to what the available evidence can actually support.</p>
            <p>This index records the status of our work, the evidence behind it, its known limitations, and what remains unproven.</p>
            <blockquote>It exists so that our claims cannot quietly become stronger than our results.</blockquote>
          </section>

          <section id="classifications">
            <h2><span>I.</span> Evidence Classifications</h2>
            <p>Every JCEE Labs research program and technical claim is assigned a public status.</p>
            <div className="evidence-classifications">
              {classifications.map(([title, copy]) => (
                <article key={title}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="current-work">
            <h2><span>II.</span> Current Work</h2>

            <article className="evidence-program">
              <div className="evidence-program-heading">
                <div>
                  <p className="charter-section-label">EVIDENCE-FIRST EXECUTION RUNTIME</p>
                  <h3>VOW</h3>
                </div>
                <span className="evidence-status verified">VERIFIED MILESTONE · ACTIVE HARDENING</span>
              </div>
              <p>VOW is a runtime designed for consequential software and AI-directed actions where interruption, retry, incomplete information, and external effects can create uncertainty.</p>
              <p>Its purpose is to make execution inspectable, resumable, and accountable through durable evidence.</p>
              <p>A pinned private release of VOW 1.1 has completed a bounded verification milestone. The release, source manifest, evidence records, checksums, commit identity, and test materials have been preserved.</p>
              <p>Current work is focused on reproduction against independently authoritative systems and the hardening required for real external integrations.</p>
              <div className="evidence-boundary-grid">
                <div>
                  <h4>WHAT THIS STATUS SUPPORTS</h4>
                  <ul>
                    <li>A defined VOW 1.1 release exists.</li>
                    <li>Its preserved verification corpus completed the required release gate.</li>
                    <li>The runtime can produce durable evidence about covered executions.</li>
                    <li>Recovery behavior has been tested under the conditions included in that corpus.</li>
                  </ul>
                </div>
                <div>
                  <h4>WHAT THIS STATUS DOES NOT CLAIM</h4>
                  <ul>
                    <li>Independent third-party certification</li>
                    <li>Universal protection against every possible failure</li>
                    <li>Legal or regulatory compliance by default</li>
                    <li>Enterprise production readiness in every environment</li>
                    <li>Validation against every external authority or provider</li>
                  </ul>
                </div>
              </div>
              <p className="charter-note">Implementation details that may affect intellectual-property protection remain private while legal review is underway.</p>
            </article>

            <article className="evidence-program">
              <div className="evidence-program-heading">
                <div>
                  <p className="charter-section-label">EXECUTION-ASSURANCE RESEARCH</p>
                  <h3>Cross-Authority Execution Assurance</h3>
                </div>
                <span className="evidence-status experimental">ACTIVE EXPERIMENTAL REPRODUCTION</span>
              </div>
              <p>This research asks whether the same proof requirements can govern actions across materially different authoritative systems without changing the underlying reasoning for each provider.</p>
              <p>The present reproduction phase uses two different authority classes:</p>
              <ol>
                <li>A transactional authority with independently controlled state and concurrency.</li>
                <li>A remote effect authority with externally recognized identity and delivery evidence.</li>
              </ol>
              <p>The central test is strict: adapters may translate provider-specific information, but the assurance rules should not receive provider-specific exceptions.</p>
              <p>A successful reproduction would support a bounded claim that the assurance model transfers across those tested authority classes. It would not establish universal transfer across all systems.</p>
              <p><strong>No final public claim has been admitted at this stage.</strong></p>
            </article>

            <article className="evidence-program">
              <div className="evidence-program-heading">
                <div>
                  <p className="charter-section-label">FOUNDATIONAL RESEARCH</p>
                  <h3>Procedural Execution Science</h3>
                </div>
                <span className="evidence-status experimental">EXPERIMENTAL</span>
              </div>
              <p>This program investigates whether reusable structural rules can improve execution across different tasks and failure mechanisms.</p>
              <p>The work studies a small set of procedural roles:</p>
              <ul>
                <li><strong>Observe</strong></li>
                <li><strong>Intervene</strong></li>
                <li><strong>Condition</strong></li>
              </ul>
              <p>The research question is whether arrangements of these roles produce predictable effects across different task families, rather than merely describing a result after it occurs.</p>
              <p>Some experiments have produced promising internal results. Transfer, reproduction, and rejection testing are still active.</p>
              <p><strong>JCEE Labs does not currently claim that a general procedural grammar has been established.</strong></p>
            </article>

            <article className="evidence-program">
              <div className="evidence-program-heading">
                <div>
                  <p className="charter-section-label">EDGE EXECUTION RESEARCH</p>
                  <h3>AEEL</h3>
                </div>
                <span className="evidence-status experimental">EXPERIMENTAL PROTOTYPE</span>
              </div>
              <p>AEEL is a separate research program focused on evidence-producing AI execution for local, offline, and resource-constrained devices.</p>
              <p>Its intended environment includes edge computers, embedded systems, and air-gapped deployments where cloud-dependent assumptions may not hold.</p>
              <p>Current work includes local inference routing, tamper-evident execution records, replay verification, and signed evidence envelopes.</p>
              <p>Hardware-backed signing and physical-device recovery testing remain incomplete. AEEL should therefore be understood as an experimental system, not a production-ready edge platform.</p>
              <p>AEEL is separate from VOW. The two programs may share engineering principles, but they do not share the same identity or present evidence status.</p>
            </article>
          </section>

          <section id="evidence">
            <h2><span>III.</span> What Counts as Evidence</h2>
            <p>JCEE Labs does not treat screenshots, demonstrations, generated explanations, or passing examples as sufficient evidence by themselves.</p>
            <p>Depending on the claim, an acceptable evidence package may include:</p>
            <ul>
              <li>A frozen specification</li>
              <li>A pinned source revision</li>
              <li>Defined inputs and expected outputs</li>
              <li>Test results and failure records</li>
              <li>Adversarial cases</li>
              <li>Reproduction instructions</li>
              <li>Environment and dependency information</li>
              <li>Hashes or checksums</li>
              <li>Execution receipts</li>
              <li>Known limitations</li>
              <li>Rejected or contradictory results</li>
            </ul>
            <p>The required evidence depends on the claim being made. A narrow claim may require a narrow test. A broad claim requires stronger reproduction, transfer, and independent scrutiny.</p>
            <blockquote>The wording of the claim must remain inside the boundary established by the evidence.</blockquote>
          </section>

          <section id="negative-results">
            <h2><span>IV.</span> Failed and Negative Results</h2>
            <p>Negative results are part of the research record.</p>
            <p>When a claim fails, we preserve what failed, why it failed, and what changed afterward. We do not silently alter the original threshold or present a redesigned experiment as proof that the earlier version succeeded.</p>
            <p>Where publication does not expose protected mechanisms, security-sensitive information, personal data, or third-party confidential material, JCEE Labs intends to publish meaningful negative and contradictory results alongside successful ones.</p>
            <blockquote>A failed test can still produce useful knowledge. It cannot be counted as a pass.</blockquote>
          </section>

          <section id="public-protected">
            <h2><span>V.</span> Public Evidence and Protected Work</h2>
            <p>Evidence-first research does not require publishing every implementation detail.</p>
            <p>JCEE Labs will publish enough information to make public claims understandable, bounded, and open to scrutiny. We will also protect proprietary mechanisms, unpublished inventions, security-sensitive details, credentials, private source code, and confidential third-party information.</p>
            <p>Until intellectual-property review is complete, some programs may show a verified internal milestone without publishing the complete enabling implementation.</p>
            <p>In those cases, the limitation will be stated directly.</p>
            <p><strong>No private evidence package should be mistaken for independent verification.</strong></p>
          </section>

          <section id="separation">
            <h2><span>VI.</span> Product and Research Separation</h2>
            <p>JCEE Labs works across both products and research programs.</p>
            <p>A product may use findings from a research program, but the existence of the product does not prove the research claim. Likewise, a promising experiment does not make a system production-ready.</p>
            <p>We will identify which work is:</p>
            <ul>
              <li>A product</li>
              <li>A prototype</li>
              <li>A research program</li>
              <li>A verified milestone</li>
              <li>An active experiment</li>
            </ul>
            <p>These categories will not be used interchangeably.</p>
          </section>

          <section id="our-standard">
            <h2><span>VII.</span> Our Standard</h2>
            <p>Before a claim becomes part of JCEE Labs, it must survive verification.</p>
            <p>Enthusiasm is never sufficient evidence.</p>
            <div className="charter-signoff">
              <strong>Ideas are welcomed freely.</strong>
              <strong>Beliefs are admitted reluctantly.</strong>
              <strong>When the evidence changes, the claim changes with it.</strong>
            </div>
          </section>

          <section id="revisions" className="revision-history">
            <div className="revision-heading">
              <h2>Revision History</h2>
              <span>PUBLIC RECORD</span>
            </div>
            <div className="revision-row">
              <strong>1.0</strong>
              <span>AUGUST 13, 2026</span>
              <p>Initial publication.</p>
              <span className="revision-status">CURRENT</span>
            </div>
          </section>
        </article>
      </div>

      <footer className="charter-footer">
        <div className="footer-wordmark">JCEE LABS</div>
        <div className="footer-meta">
          <span>© 2026 HOWM HOLDINGS LLC</span>
          <span>VERSION 1.0 · AUGUST 13, 2026</span>
          <a href="#top">BACK TO TOP ↑</a>
        </div>
      </footer>
    </main>
  );
}
