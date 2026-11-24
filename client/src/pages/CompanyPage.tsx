import EditorialLayout from "@/components/EditorialLayout";
export default function CompanyPage() {
  return (
    <EditorialLayout
      current="company"
      eyebrow="JCEE WorldLab / Dallas, Texas"
      title="Built for accountable operations."
      description="JCEE WorldLab is based in Dallas, Texas, and founded by Jonathan Matthew Chadbourne. We build software for AI-assisted operations where permissions, evidence, and human responsibility matter."
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
        <div className="editorial-actions">
          <a className="editorial-text-link" href="/founder">
            Meet Jonathan and read his story →
          </a>
          <a className="editorial-text-link" href="/blog/the-work-nobody-sees">
            Read the founder essay, The Work Nobody Sees →
          </a>
        </div>
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
      <section className="editorial-section editorial-section-dark">
        <h2>Work with JCEE WorldLab.</h2>
        <p>
          Bring us one workflow you want to improve. The first conversation is
          free; paid work follows an agreed scope.
        </p>
        <div className="editorial-actions">
          <a className="editorial-button" href="/consultation">
            Discuss your workflow →
          </a>
          <a className="editorial-text-link" href="/partners">
            Explore partnerships →
          </a>
          <a className="editorial-text-link" href="mailto:sales@jceelabs.com">
            sales@jceelabs.com ↗
          </a>
        </div>
        <p className="editorial-note">
          Every result we publish carries its tested conditions and limits.{" "}
          <a href="/registry">See the Public Registry →</a>
        </p>
      </section>
    </EditorialLayout>
  );
}
