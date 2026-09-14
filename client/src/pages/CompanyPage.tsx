import BuildStatusList from "@/components/BuildStatusList";
import EditorialLayout from "@/components/EditorialLayout";
export default function CompanyPage() {
  return (
    <EditorialLayout
      current="company"
      eyebrow="JCEE Labs / Dallas, Texas"
      title="Build useful intelligence. Keep the evidence."
      description="JCEE Labs develops operating software and researches execution assurance: how intelligent systems can act within current authority and leave an inspectable account."
    >
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
          From the Founder · Jonathan Chadbourne
        </p>
        <h2 id="founder-title">The Work Nobody Sees</h2>
        <p className="editorial-intro">
          Why JCEE Labs starts with observation, evidence, and the workflows
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
          describes the longer-term platform direction. Howm.ai is our separate
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
        <h2>Work with JCEE Labs.</h2>
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
