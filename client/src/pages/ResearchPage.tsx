import BB84PublicPreprint from "@/components/BB84PublicPreprint";
import BuildStatusList from "@/components/BuildStatusList";
import EditorialLayout from "@/components/EditorialLayout";
import EvidenceLadder from "@/components/EvidenceLadder";
import {
  publications,
  publicationDate,
  publicationHref,
  isResearch,
} from "@/content/publications";
export default function ResearchPage() {
  return (
    <EditorialLayout
      current="research"
      eyebrow="JCEE Research"
      title="Results you can examine."
      description="Research into execution, authority, and evidence. Each publication states what was tested, what was observed, and what remains unresolved."
    >
      <section
        className="editorial-section editorial-section-muted"
        aria-labelledby="portfolio-title"
      >
        <p className="editorial-kicker">
          CURRENT RESEARCH PORTFOLIO · PREPARED SEPTEMBER 18, 2026
        </p>
        <h2 id="portfolio-title">25 fields. One unifying research question.</h2>
        <p className="editorial-intro">
          The portfolio spans trustworthy AI, distributed and resilient
          computing, formal verification, quantum information, information
          theory, causal assurance, complex systems, human-AI interaction, and
          applied computational intelligence.
        </p>
        <div className="research-question">
          <span>UNIFYING RESEARCH QUESTION</span>
          <blockquote>
            How do you determine what a system actually knows, what that
            evidence permits it to conclude, what authority it possesses, and
            what consequences it may safely produce?
          </blockquote>
        </div>
        <a className="editorial-text-link" href="/research/fields">
          Explore all 25 research fields →
        </a>
      </section>
      <section
        className="editorial-section"
        id="evidence-ladder"
        aria-labelledby="evidence-ladder-title"
      >
        <p className="editorial-kicker">CURRENT CLAIMS / EVIDENCE STANDARD</p>
        <h2 id="evidence-ladder-title">Different claims require different evidence.</h2>
        <p className="editorial-intro">
          A mathematical argument, a synthetic system test, a physical
          observation, and a production result answer different questions.
          JCEE does not promote one into another without a new qualifying gate.
        </p>
        <EvidenceLadder />
        <a className="editorial-text-link" href="/registry">
          Read selected recorded milestones and boundaries →
        </a>
      </section>

      <section
        className="editorial-section editorial-section-muted"
        id="physical-validation"
        aria-labelledby="physical-validation-title"
      >
        <p className="editorial-kicker">PHYSICAL RESEARCH / NOT YET RUN</p>
        <h2 id="physical-validation-title">Two experiments. Two observations still to earn.</h2>
        <p className="editorial-intro">
          These are testable research hypotheses, not physical findings.
          Their scientific implications are conditional on meeting their
          respective frozen controls and decision thresholds.
        </p>
        <div className="physical-program-grid">
          <article className="physical-program">
            <p className="editorial-kicker">JCEE-MMC-P0.1 · LATENT TARGET-STATE RESTORATION</p>
            <p className="research-status-line">PRE-EXECUTION QUALIFIED / PHYSICAL_NOT_RUN</p>
            <h3>Can tissue reconstruction remember a prior geometric target?</h3>
            <p>
              The planned study transiently conditions living multicellular
              material to different non-native morphologies, removes the
              instructive condition, and tests whether recovery after matched
              injury depends on that earlier history.
            </p>
            <dl>
              <div>
                <dt>DECISIVE OBSERVATION</dt>
                <dd>
                  A blinded, replicated history-dependent reconstruction
                  difference after the groups are brought to a measured common
                  state and external directional cues are excluded.
                </dd>
              </div>
              <div>
                <dt>IF THE PHYSICAL GATE PASSES</dt>
                <dd>
                  Evidence for target-specific morphological history dependence
                  in that bounded material and preparation.
                </dd>
              </div>
              <div>
                <dt>WHAT IT WOULD NOT PROVE</dt>
                <dd>
                  Consciousness, psychological learning, generalized tissue
                  intelligence, or the mechanism that stored the information.
                </dd>
              </div>
            </dl>
            <p className="research-status-detail">
              Pre-execution statistical qualification and preregistration are
              completed. Wet-lab host qualification and actual specimen testing
              remain pending; a rescheduled feasibility discussion is not
              experimental execution or laboratory endorsement.
            </p>
          </article>
          <article className="physical-program">
            <p className="editorial-kicker">JCEE-QBIO-P0.1 · TWO LIVING CELLS</p>
            <p className="research-status-line">PRE-BIOLOGY QUALIFICATION / PHYSICAL_NOT_RUN</p>
            <h3>Can a quantum nonseparability witness coexist with two viable cells?</h3>
            <p>
              The proposed experiment seeks an entanglement witness between
              selected quantum degrees of freedom associated with two separate
              living cells, while testing the viability of each cell independently.
            </p>
            <dl>
              <div>
                <dt>DECISIVE OBSERVATION</dt>
                <dd>
                  A qualifying nonseparability witness under the specified
                  fidelity criterion, alongside separate evidence that both
                  cells remain alive under the measured conditions.
                </dd>
              </div>
              <div>
                <dt>IF THE PHYSICAL GATE PASSES</dt>
                <dd>
                  Evidence for quantum nonseparability in that particular
                  living-cell configuration, with contemporaneous viability.
                </dd>
              </div>
              <div>
                <dt>WHAT IT WOULD NOT PROVE</dt>
                <dd>
                  Quantum consciousness, generalized organism-scale
                  entanglement, or a universal biological computing mechanism.
                </dd>
              </div>
            </dl>
            <p className="research-status-detail">
              The physical Bell-fidelity and viability qualification has not
              been adjudicated. Design screens and biophysical estimates are
              not measurements of entanglement in living cells.
            </p>
          </article>
        </div>
        <p className="evidence-ladder__note">
          Negative results, failed controls, and inconclusive observations
          remain reportable outcomes. No patent priority, novel physical
          mechanism, or independent reproduction is asserted here.
        </p>
      </section>

      <section className="editorial-section" aria-labelledby="papers-title">
        <div className="editorial-section-heading">
          <h2 id="papers-title">Reports and research notes</h2>
          <a href="/registry">View all public milestones ↗</a>
        </div>
        <p className="editorial-intro">
          These are JCEE-authored publications. Public preprints, technical
          reports, research briefs, and governance standards are labeled
          separately; none is presented as peer-reviewed certification.
        </p>
        <BB84PublicPreprint />
        <div className="resource-grid">
          {publications
            .filter(p => isResearch(p))
            .map(item => (
              <article className="resource-card" key={item.slug}>
                <p className="editorial-kicker">
                  {item.kind} ·{" "}
                  <time dateTime={item.date}>{publicationDate(item.date)}</time>
                </p>
                <h3>
                  <a href={publicationHref(item)}>{item.title}</a>
                </h3>
                <p>{item.summary}</p>
                <a className="editorial-text-link" href={publicationHref(item)}>
                  Read report →
                </a>
              </article>
            ))}
        </div>
        <div className="editorial-link-list">
          <a href="/research/jrp-000">
            <strong>JRP-000 · The Evidence Boundary</strong>
            <span>
              Governance standard · August 13, 2026. How we admit, qualify, and
              correct a claim.
            </span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
      <section className="editorial-section">
        <h2>Research programs and recorded outcomes</h2>
        <p>
          Completed gates, negative results, and open evaluations all remain
          part of the record.
        </p>
        <BuildStatusList
          ids={[
            "crucible-p03",
            "autography",
            "lem",
            "lam",
            "vela",
            "tot",
            "rtl",
            "gmda",
          ]}
        />
      </section>
      <section className="editorial-section editorial-section-dark">
        <p className="editorial-kicker">Reproduction and review</p>
        <h2>A result becomes more useful when someone else can examine it.</h2>
        <p>
          Bring a research question, a reproduction proposal, or a specific
          claim you want to evaluate. We can discuss the appropriate evidence
          and review boundary.
        </p>
        <a className="editorial-button" href="/partners/research">
          Discuss research →
        </a>
      </section>
    </EditorialLayout>
  );
}
