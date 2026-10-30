import BuildStatusList from "@/components/BuildStatusList";
import EditorialLayout from "@/components/EditorialLayout";
export default function CompanyPage() {
  return (
    <EditorialLayout
      current="company"
      eyebrow="JCEE WorldLab / Dallas, Texas"
      title="About JCEE WorldLab: why we build for accountable operations"
      description="JCEE WorldLab is based in Dallas, Texas, and founded by Jonathan Matthew Chadbourne. We develop methods and software for AI-assisted operations where permissions, evidence, and human responsibility matter."
    >
      <section className="editorial-section editorial-section-muted">
        <p className="editorial-kicker">FOUNDER</p>
        <h2>Jonathan Matthew Chadbourne</h2>
        <p className="editorial-intro">
          Jonathan is the founder of JCEE WorldLab and an independent researcher
          based in Dallas, Texas. His background is in sales; his work at JCEE
          connects application development with a practical question: how can
          someone check what an AI-assisted system actually did?
        </p>
        <a className="editorial-text-link" href="/founder">
          Meet Jonathan and read his story →
        </a>
      </section>
      <section className="editorial-section">
        <h2>Why we exist</h2>
        <p>
          When software recommends an action, changes a record, or resumes after
          an interruption, someone still needs to answer practical questions:
        </p>
        <ul>
          <li>What was requested?</li>
          <li>What did the system observe?</li>
          <li>Who authorized the action?</li>
          <li>What actually happened?</li>
          <li>What remains uncertain?</li>
        </ul>
        <p>
          We exist to make those questions easier to answer with evidence people
          can inspect.
        </p>
      </section>
      <section className="editorial-section editorial-section-muted">
        <p className="editorial-kicker">CURRENT ENGINEERING FOCUS / OCTOBER 19, 2026</p>
        <h2>Follow the evidence through the connected systems.</h2>
        <p className="editorial-intro">
          We have built substantial parts of the assurance architecture. Our
          priority is to qualify one connected path that another reviewer can
          reproduce: evidence, current authority, the target's actual effect,
          recovery, and the resulting record.
        </p>
        <p>
          A reconciled software candidate is now in working integration after
          bounded shared-source revocation and protected-restoration tests.
          Production admission and physical commitment still require their own
          evidence. The long-term direction remains a reusable assurance core,
          repeatable qualification, and business claims bounded by results.
        </p>
        <a className="editorial-text-link" href="/technology#current-integration">Current result and open gates →</a>
      </section>
      <section className="editorial-section">
        <p className="editorial-kicker">Our direction</p>
        <h2>Better operations, one earned step at a time.</h2>
        <p className="editorial-intro">
          We begin with a specific workflow and the people doing the work. Our
          first industry focus is industrial distribution. The goal is to
          demonstrate measurable improvement alongside existing systems, then
          expand into more workflow ownership as evidence and economics justify
          it.
        </p>
        <a className="editorial-text-link" href="/blog/start-with-the-workflow">
          Read our approach →
        </a>
      </section>
      <section
        className="editorial-section editorial-section-muted"
        aria-labelledby="founder-title"
      >
        <p className="editorial-kicker">
          From the Founder · Jonathan Matthew Chadbourne
        </p>
        <h2 id="founder-title">The Work Nobody Sees</h2>
        <p className="editorial-intro">
          Why JCEE WorldLab starts with observation, evidence, and the workflows
          between systems. The thinking that connects our research to the work
          of ordinary businesses.
        </p>
        <a className="editorial-text-link" href="/blog/the-work-nobody-sees">
          Read the founder essay →
        </a>
      </section>
      <section className="editorial-section">
        <p className="editorial-kicker">The wider company</p>
        <h2>Operating software and personal applications.</h2>
        <p>
          Distribution is our first industry focus. JCEE Operating Cloud
          describes the longer-term platform direction. Howm.io is our separate
          personal-app suite in development, including Mirrored and MISE.
        </p>
        <div className="editorial-actions">
          <a className="editorial-text-link" href="/operating-cloud">
            Operating Cloud direction →
          </a>
          <a className="editorial-text-link" href="/registry#personal-apps">
            Howm and app build status →
          </a>
        </div>
        <BuildStatusList ids={["howm", "mise", "mirrored"]} />
      </section>
      <section className="editorial-section editorial-section-muted">
        <h2>The standard behind the work.</h2>
        <div className="resource-grid">
          <article className="resource-card">
            <h3>Evidence over claims</h3>
            <p>
              State what was tested, preserve the result, and keep failures
              visible.
            </p>
          </article>
          <article className="resource-card">
            <h3>Current authority</h3>
            <p>
              A useful idea or recommendation does not create permission to act.
            </p>
          </article>
          <article className="resource-card">
            <h3>Accountable progress</h3>
            <p>
              Keep versioned milestones and make the next decision
              understandable.
            </p>
          </article>
          <article className="resource-card">
            <h3>Human responsibility</h3>
            <p>
              Support people making consequential decisions with evidence they
              can inspect.
            </p>
          </article>
        </div>
        <a className="editorial-text-link" href="/charter">
          Read the full charter →
        </a>
      </section>
      <section className="editorial-section">
        <h2>The method behind the software</h2>
        <p>
          The JCEE Assurance Method organizes the work around four steps:
          Observe, Judge, Authorize, and Record.
        </p>
        <p>
          JCEE Distribution provides a concrete application. VOW and QCS address
          execution and authority questions. Operating Cloud describes the
          longer-term platform direction. Each program has its own evidence
          boundary. A result in one program does not establish every claim about
          another.
        </p>
        <a href="/assurance">Explore the JCEE Assurance Method →</a>
        <h2>What our results mean</h2>
        <p>
          We distinguish synthetic tests, reference implementations, research
          results, and observations from real operating environments.
        </p>
        <p>
          A recorded milestone establishes only what its evidence supports under
          the stated conditions. Customer ROI and production readiness remain
          unestablished where the relevant evidence is missing.
        </p>
        <a href="/registry">
          Review published milestones and their boundaries →
        </a>
      </section>
      <section className="editorial-section">
        <h2>Work with JCEE WorldLab.</h2>
        <p>
          Companies can bring an operational problem. Researchers can bring a
          question, method, or reproduction proposal.
        </p>
        <div className="editorial-actions">
          <a className="editorial-button" href="/partners">
            Explore partnerships →
          </a>
          <a className="editorial-text-link" href="mailto:support@jceelabs.com">
            support@jceelabs.com ↗
          </a>
        </div>
      </section>
    </EditorialLayout>
  );
}
