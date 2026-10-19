import EditorialLayout from "@/components/EditorialLayout";

export default function OperatingCloudPage() {
  return (
    <EditorialLayout
      current="technology"
      eyebrow="JCEE Operating Cloud / Platform direction"
      title="A common foundation. Workflows that fit the industry."
      description="Our direction is operating software grounded in how businesses actually work, with evidence, authority, recovery, and review built into the foundation."
    >
      <section className="editorial-section">
        <p className="editorial-kicker">Start with Distribution</p>
        <h2>Prove value in one workflow.</h2>
        <p className="editorial-intro">
          JCEE Distribution is the first industry focus. Order integrity gives
          us a specific problem to evaluate alongside existing systems: compare
          the instructions with the recorded order, investigate exceptions, and
          measure the improvement.
        </p>
        <div className="editorial-actions">
          <a className="editorial-button" href="/solutions/distribution">
            Explore Distribution →
          </a>
          <a className="editorial-text-link" href="/registry#distribution">
            Current build and evidence →
          </a>
        </div>
      </section>
      <section className="editorial-section editorial-section-muted">
        <h2>Earn responsibility in stages.</h2>
        <div className="editorial-link-list">
          {[
            [
              "Overlay",
              "Observe and compare records alongside the systems already in use.",
            ],
            [
              "Assure",
              "Make discrepancies, supporting evidence, and uncertainty reviewable.",
            ],
            [
              "Assist",
              "Help people resolve the work within an explicitly permitted scope.",
            ],
            [
              "Own workflow",
              "Take on a defined workflow when operational results and authority support it.",
            ],
            [
              "Vertical OS",
              "Develop operating software around the needs of a particular industry.",
            ],
          ].map(([name, copy]) => (
            <article className="cloud-stage" key={name}>
              <h3>{name}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <p>
          These are roadmap stages. The complete Operating Cloud and industry
          operating systems are not released products. Customer economics and
          production integration still need to be demonstrated.
        </p>
      </section>
      <section className="editorial-section">
        <h2>Reuse the foundation. Learn the work.</h2>
        <p>
          VOW, QCS, and the Assurance components address execution, current
          authority, evidence, and verification. Their individual milestones are
          recorded separately. The October 19 JCEE-INFRA candidate now provides
          a bounded combined software result in a fictional-ledger test setting.
          That working integration does not establish a production platform or
          customer operating improvement.
        </p>
        <a className="editorial-text-link" href="/technology#current-integration">Review the connected software result →</a>
        <div className="editorial-actions">
          <a className="editorial-text-link" href="/technology">
            Explore the components →
          </a>
          <a className="editorial-text-link" href="/blog/the-work-nobody-sees">
            Why this strategy exists →
          </a>
        </div>
      </section>
      <section className="editorial-section editorial-section-muted">
        <p className="editorial-kicker">PRODUCT DISCOVERY / PILOT MILESTONE</p>
        <h2>Two approved exports. One useful report.</h2>
        <p>
          A focused ChatGPT workflow is being scoped around two real exports:
          compare the supplied records, make mismatches and missing information
          visible, and return a report the user can act on. The first milestone
          is usefulness within one approved workflow.
        </p>
        <p>
          This is a planned pilot milestone. Successful use with real exports,
          repeated customer value, and a publicly available plugin have not
          been established. It does not authorize changes to the source systems.
        </p>
      </section>
    </EditorialLayout>
  );
}
