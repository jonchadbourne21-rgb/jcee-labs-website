import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const contents = [
  ["standard", "Evidence Before Claims"],
  ["classifications", "I. Evidence Classifications"],
  ["current-work", "II. Current Work"],
  ["publications", "III. Research Publications"],
  ["evidence", "IV. What Counts as Evidence"],
  ["negative-results", "V. Failed and Negative Results"],
  ["public-protected", "VI. Public Evidence and Responsible Disclosure"],
  ["separation", "VII. Product and Research Separation"],
  ["our-standard", "VIII. Our Standard"],
  ["revisions", "Revision History"],
];

const githubUrl =
  "https://github.com/jonchadbourne21-rgb/jcee-labs-website/blob/main/client/public/JCEE_Labs_Research_Evidence_Index_v1.2.md";

const classifications = [
  ["Planned", "The problem and intended investigation have been identified, but the experiment or implementation has not been frozen. No result is claimed."],
  ["Preregistered", "The hypothesis, test conditions, scoring rules, stopping rules, and rejection thresholds have been defined before results are observed. A preregistered experiment is ready to run. It is not a verified result."],
  ["Experimental", "The work has produced results, but reproduction, transfer testing, adversarial review, or independent verification remains incomplete. Experimental findings may guide further work. They are not presented as established facts."],
  ["Verified Milestone", "A specific and bounded claim has survived its defined verification process, and the supporting evidence has been preserved. Verified applies only to the claim and conditions identified. It does not mean universally proven, independently certified, or production-ready in every environment."],
  ["Inconclusive", "The test did not provide enough valid information to admit or reject the claim. The reason must be recorded, and the result must not be presented as a pass."],
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
      <CoreHeader current="research" />

      <section className="charter-masthead evidence-masthead">
        <p className="eyebrow"><span /> PUBLIC RECORD · VERSION 1.2</p>
        <img
          className="evidence-brand-lockup"
          src="/manus-storage/jcee-labs-logo-horizontal-teal_500ebeed.png"
          alt="JCEE Labs"
        />
        <h1 className="charter-title evidence-title">Research &amp;<br /><em>Evidence</em></h1>
        <p className="charter-position">
          This index records the status of our work, the evidence behind it,
          its known limitations, and what remains unproven.
        </p>
        <div className="charter-version-row">
          <span>VERSION 1.2 — AUGUST 13, 2026</span>
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
            <a href="/JCEE_Labs_Research_Evidence_Index_v1.2.md" download>DOWNLOAD .MD ↓</a>
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
              <p>A pinned VOW 1.1 release has completed a bounded internal verification milestone. The release identity and supporting test record have been preserved.</p>
              <p>Current work is focused on independent reproduction and the hardening required for real external integrations.</p>
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
            </article>

            <article className="evidence-program">
              <div className="evidence-program-heading">
                <div>
                  <p className="charter-section-label">EXECUTION ASSURANCE</p>
                  <h3>JCEE Assurance / Evidence Engine</h3>
                </div>
                <span className="evidence-status verified">VERIFIED MILESTONE · BOUNDED INTERNAL</span>
              </div>
              <p>JCEE Assurance evaluates preserved evidence against frozen interfaces, profiles, and decision rules without granting that evidence authority it does not contain.</p>
              <p>The product boundary, interface schemas and 30-fixture conformance corpus, deterministic verification kernel, and application-level append-only evidence ledger and snapshot resolver have passed their frozen internal gates through JA-P0.4.</p>
              <p>This status supports deterministic behavior within the frozen artifacts and tested conditions. It does not establish external-world truth, production readiness, independent certification, legal conformity, physical write-once storage, multi-host consensus, or activation of QCS-backed profiles.</p>
              <p><strong>The exclusions are part of the admitted result.</strong></p>
            </article>

            <article className="evidence-program">
              <div className="evidence-program-heading">
                <div>
                  <p className="charter-section-label">WORKFLOW-FREE TRANSITION CALCULUS</p>
                  <h3>QCS</h3>
                </div>
                <span className="evidence-status experimental">FROZEN CANDIDATE · REPRODUCTION</span>
              </div>
              <p>QCS is a separate JCEE Labs research program studying when available evidence is sufficient to justify a system transition.</p>
              <p>The QCS 1.x line has been frozen as a candidate specification. QCS-2.0 is focused on independent reproduction against materially different execution environments without changing the frozen reasoning.</p>
              <p>This status supports the existence of a defined candidate specification and an active reproduction program. It does not establish universal transfer, production readiness, or independent certification.</p>
              <p><strong>QCS is research. It is not the VOW product release, and the two names are not interchangeable.</strong></p>
            </article>

            <article className="evidence-program">
              <div className="evidence-program-heading">
                <div>
                  <p className="charter-section-label">EXECUTION-ASSURANCE VALIDATION</p>
                  <h3>Independent Runtime Reproduction</h3>
                </div>
                <span className="evidence-status experimental">ACTIVE VALIDATION</span>
              </div>
              <p>This work tests whether bounded execution-assurance claims survive outside the environment in which they were first developed.</p>
              <p>The current gate requires reproduction against independently authoritative systems while preserving the frozen decision standard.</p>
              <p>A successful result would apply only to the tested environments and conditions. No universal claim has been admitted.</p>
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
              <p>Current work is focused on evidence-producing local execution and recovery under constrained operating conditions.</p>
              <p>Physical-device validation remains incomplete. AEEL should therefore be understood as an experimental system, not a production-ready edge platform.</p>
              <p>AEEL is separate from VOW. The two programs may share engineering principles, but they do not share the same identity or present evidence status.</p>
            </article>
          </section>

          <section id="publications">
            <h2><span>III.</span> Research Publications</h2>
            <p>Adopted papers and experiment records establish the standards and evidence behind entries in this index. Publication does not strengthen a claim by itself; the status shown on each record controls.</p>
            <article className="evidence-publication-card">
              <div className="evidence-publication-topline">
                <span>JRP-000 · VERSION 1.0</span>
                <span>ADOPTED · AUGUST 13, 2026</span>
              </div>
              <h3>The Evidence Boundary</h3>
              <p className="evidence-publication-subtitle">How JCEE Labs Admits, Limits, and Rejects Technical Claims</p>
              <p>JRP-000 defines the claim cards, evidence packages, mandatory admission gates, verdict vocabulary, limitation rules, and correction process that govern later JCEE Labs research and experiment records.</p>
              <p><strong>Document class:</strong> JCEE Labs research-governance standard. Its adoption governs JCEE Labs; it is not an empirical result, external consensus standard, or independent certification.</p>
              <div className="evidence-publication-links">
                <a href="/research/jrp-000">READ JRP-000 <span>→</span></a>
                <a href="/JRP-000_The_Evidence_Boundary_v1.0.md" download>DOWNLOAD VERSION 1.0 <span>↓</span></a>
              </div>
            </article>
          </section>

          <section id="evidence">
            <h2><span>IV.</span> What Counts as Evidence</h2>
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
            <h2><span>V.</span> Failed and Negative Results</h2>
            <p>Negative results are part of the research record.</p>
            <p>When a claim fails, we preserve what failed, why it failed, and what changed afterward. We do not silently alter the original threshold or present a redesigned experiment as proof that the earlier version succeeded.</p>
            <p>JCEE Labs intends to publish meaningful negative and contradictory results alongside successful ones whenever responsible disclosure permits.</p>
            <blockquote>A failed test can still produce useful knowledge. It cannot be counted as a pass.</blockquote>
          </section>

          <section id="public-protected">
            <h2><span>VI.</span> Public Evidence and Responsible Disclosure</h2>
            <p>Evidence-first research does not require making every working artifact public.</p>
            <p>JCEE Labs will publish enough information to make public claims understandable, bounded, and open to scrutiny while practicing responsible disclosure.</p>
            <p>When a result cannot be reproduced from the public record alone, that limitation will be stated directly.</p>
            <p><strong>An internal evidence package should not be mistaken for independent verification.</strong></p>
          </section>

          <section id="separation">
            <h2><span>VII.</span> Product and Research Separation</h2>
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
            <h2><span>VIII.</span> Our Standard</h2>
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
              <strong>1.1</strong>
              <span>AUGUST 13, 2026</span>
              <p>Added Inconclusive to the public status vocabulary and added JRP-000 as the first adopted research publication.</p>
              <span className="revision-status">CURRENT</span>
            </div>
            <div className="revision-row">
              <strong>1.0</strong>
              <span>AUGUST 13, 2026</span>
              <p>Initial publication.</p>
              <span className="revision-status superseded">SUPERSEDED</span>
            </div>
          </section>
        </article>
      </div>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
