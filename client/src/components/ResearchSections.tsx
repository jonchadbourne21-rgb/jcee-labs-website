import BB84PublicPreprint from "@/components/BB84PublicPreprint";
import BuildStatusList from "@/components/BuildStatusList";
import EvidenceLadder from "@/components/EvidenceLadder";
import {
  publications,
  publicationDate,
  publicationHref,
  isResearch,
} from "@/content/publications";

export function ResearchPriority() {
  return (
    <section
      className="editorial-section"
      aria-labelledby="current-research-priority"
    >
      <p className="editorial-kicker">CURRENT PRIORITY / OCTOBER 19, 2026</p>
      <h2 id="current-research-priority">
        Qualify one connected assurance path.
      </h2>
      <p className="editorial-intro">
        The immediate engineering priority is to connect the components and
        establish which guarantees survive when evidence changes, permission is
        revoked, replies disappear, and recovery resumes. The latest software
        candidate has passed its bounded combined qualification and entered
        working integration with the reviewed source tree preserved.
      </p>
      <p>
        The retained result covers a controlled fictional ledger and a declared
        protected-checkpoint restore model. Independent human review, production
        admission, and E003 physical commitment remain separate gates. The
        broader research portfolio below is a dated map of the questions we
        study, not a claim that every field is actively qualified.
      </p>
      <div className="editorial-actions">
        <a
          className="editorial-text-link"
          href="/technology#current-integration"
        >
          Integrated software result →
        </a>
        <a
          className="editorial-text-link"
          href="/technology#physical-commitment"
        >
          The physical commitment question →
        </a>
      </div>
    </section>
  );
}

export function MeasurementResearch() {
  return (
    <section
      className="editorial-section editorial-section-muted"
      id="measurement-assurance"
      aria-labelledby="measurement-assurance-title"
    >
      <p className="editorial-kicker">MEASUREMENT WORK / OCTOBER 12–19, 2026</p>
      <h2 id="measurement-assurance-title">
        Test the calculation and the evidence around it.
      </h2>
      <p className="editorial-intro">
        A convincing output can still fail to support its claim. Our measurement
        work now includes a fixed-corpus numerical-assurance evaluation,
        reproduction of an idealized wave model, and recovery of a physical
        experiment's analysis software. These results answer different
        questions.
      </p>
      <div className="resource-grid">
        <article className="resource-card">
          <p className="editorial-kicker">NUMERICAL ASSURANCE / OCTOBER 19</p>
          <h3>A good sample fit can hide a wrong result.</h3>
          <p>
            In the fixed synthetic corpus, 8/8 valid controls passed; 6/6
            unsuitable or numerically unqualified cases and 13/13 altered
            receipts were held. One test fit its recorded samples closely while
            missing an unmeasured midpoint.
          </p>
          <p>
            This qualifies those fixtures. New-case numerical reasoning,
            whole-domain error certification, and independent-host reproduction
            remain to be established. Refusing an unsupported input is recorded
            separately from detecting a bad calculation.
          </p>
          <a href="/registry#numerical-assurance-v01">
            Fixed-corpus result and next gate →
          </a>
        </article>
        <article className="resource-card">
          <p className="editorial-kicker">WAVE ASSESSMENT 001 / OCTOBER 12</p>
          <h3>Reproduce the model before extending the claim.</h3>
          <p>
            The archived baseline reproduced its frozen output. A separately
            written simulation cross-checked ten configurations within the same
            idealized model.
          </p>
          <p>
            This establishes computational repeatability within that model.
            Physical preparation, retention, readout, and device noise remain
            unqualified; the broader cited source chain still has an unresolved
            appendix hash discrepancy.
          </p>
          <a href="/registry#wave-assessment-001">Reproduction boundary →</a>
        </article>
        <article className="resource-card">
          <p className="editorial-kicker">GRANULAR MEASUREMENT / OCTOBER 13</p>
          <h3>Recover the analysis baseline faithfully.</h3>
          <p>
            The recovered private baseline matched its frozen source inventory,
            reproduced 92/92 software tests, and regenerated 8/8 checked fixture
            files identically.
          </p>
          <p>
            These are offline software results. Equipment qualification,
            acquisition, and the physical experiment remain pending.
          </p>
          <a href="/registry#granular-measurement-software">
            Recovered software record →
          </a>
        </article>
      </div>
    </section>
  );
}

export function ResearchPortfolio() {
  return (
    <section
      className="editorial-section editorial-section-muted"
      aria-labelledby="portfolio-title"
    >
      <p className="editorial-kicker">
        RESEARCH PORTFOLIO REFERENCE · PREPARED SEPTEMBER 18, 2026
      </p>
      <h2 id="portfolio-title">25 fields. One unifying research question.</h2>
      <p className="editorial-intro">
        The portfolio spans trustworthy AI, distributed and resilient computing,
        formal verification, quantum information, information theory, causal
        assurance, complex systems, human-AI interaction, and applied
        computational intelligence.
      </p>
      <div className="research-question">
        <span>UNIFYING RESEARCH QUESTION</span>
        <blockquote>
          How do you determine what a system actually knows, what that evidence
          permits it to conclude, what authority it possesses, and what
          consequences it may safely produce?
        </blockquote>
      </div>
      <a className="editorial-text-link" href="/research/fields">
        Explore all 25 research fields →
      </a>
    </section>
  );
}

export function ResearchEvidence() {
  return (
    <section
      className="editorial-section"
      id="evidence-ladder"
      aria-labelledby="evidence-ladder-title"
    >
      <p className="editorial-kicker">CURRENT CLAIMS / EVIDENCE STANDARD</p>
      <h2 id="evidence-ladder-title">
        Different claims require different evidence.
      </h2>
      <p className="editorial-intro">
        A mathematical argument, a synthetic system test, a physical
        observation, and a production result answer different questions. JCEE
        does not promote one into another without a new qualifying gate.
      </p>
      <EvidenceLadder />
      <a className="editorial-text-link" href="/registry">
        Read selected recorded milestones and boundaries →
      </a>
    </section>
  );
}

export function PhysicalExperiments() {
  return (
    <section
      className="editorial-section editorial-section-muted"
      id="physical-validation"
      aria-labelledby="physical-validation-title"
    >
      <p className="editorial-kicker">PHYSICAL RESEARCH / NOT YET RUN</p>
      <h2 id="physical-validation-title">
        Two experiments. Two observations still to earn.
      </h2>
      <p className="editorial-intro">
        These are testable research hypotheses, not physical findings. Their
        scientific implications are conditional on meeting their respective
        frozen controls and decision thresholds.
      </p>
      <div className="physical-program-grid">
        <article className="physical-program">
          <p className="editorial-kicker">
            JCEE-MMC-P0.1 · LATENT TARGET-STATE RESTORATION
          </p>
          <p className="research-status-line">
            PRE-EXECUTION QUALIFIED / PHYSICAL_NOT_RUN
          </p>
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
                Evidence for target-specific morphological history dependence in
                that bounded material and preparation.
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
          <p className="research-status-line">
            PRE-BIOLOGY QUALIFICATION / PHYSICAL_NOT_RUN
          </p>
          <h3>
            Can a quantum nonseparability witness coexist with two viable cells?
          </h3>
          <p>
            The proposed experiment seeks an entanglement witness between
            selected quantum degrees of freedom associated with two separate
            living cells, while testing the viability of each cell
            independently.
          </p>
          <dl>
            <div>
              <dt>DECISIVE OBSERVATION</dt>
              <dd>
                A qualifying nonseparability witness under the specified
                fidelity criterion, alongside separate evidence that both cells
                remain alive under the measured conditions.
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
                Quantum consciousness, generalized organism-scale entanglement,
                or a universal biological computing mechanism.
              </dd>
            </div>
          </dl>
          <p className="research-status-detail">
            The physical Bell-fidelity and viability qualification has not been
            adjudicated. Design screens and biophysical estimates are not
            measurements of entanglement in living cells.
          </p>
        </article>
      </div>
      <p className="evidence-ladder__note">
        Negative results, failed controls, and inconclusive observations remain
        reportable outcomes. No patent priority, novel physical mechanism, or
        independent reproduction is asserted here.
      </p>
    </section>
  );
}

export function ResearchPublications() {
  return (
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
  );
}

export function ResearchPrograms() {
  return (
    <section className="editorial-section">
      <h2>Research programs and recorded outcomes</h2>
      <p>
        Completed gates, negative results, and open evaluations all remain part
        of the record.
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
  );
}

export function ResearchInvitation() {
  return (
    <section className="editorial-section editorial-section-dark">
      <p className="editorial-kicker">Reproduction and review</p>
      <h2>A result becomes more useful when someone else can examine it.</h2>
      <p>
        Bring a research question, a reproduction proposal, or a specific claim
        you want to evaluate. We can discuss the appropriate evidence and review
        boundary.
      </p>
      <a className="editorial-button" href="/partners/research">
        Discuss research →
      </a>
    </section>
  );
}
