import BuildStatusList from "@/components/BuildStatusList";
import EditorialLayout from "@/components/EditorialLayout";
export default function TechnologyPage() {
  return (
    <EditorialLayout
      current="technology"
      eyebrow="Technology / Execution assurance"
      title="Intelligence should leave receipts."
      description="JCEE studies and builds the infrastructure between a proposed action, current permission, the effect, and a reviewable record."
    >
      <section className="editorial-section">
        <h2>Distinct capabilities. Clear evidence.</h2>
        <div className="editorial-link-list">
          <a href="/vow">
            <strong>JCEE VOW</strong>
            <span>
              Execution and recovery. Preserve what happened when a process
              fails or a response is lost.
            </span>
            <span aria-hidden="true">→</span>
          </a>
          <a href="/qcs">
            <strong>QCS</strong>
            <span>
              Transition research. Ask whether current authoritative evidence
              justifies the next action.
            </span>
            <span aria-hidden="true">→</span>
          </a>
          <a href="/assurance">
            <strong>JCEE Assurance</strong>
            <span>
              Portable evidence and verification. Inspect what supports a
              bounded conclusion.
            </span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
      <section className="editorial-section editorial-section-muted">
        <p className="editorial-kicker">Applied development</p>
        <h2>From components to useful workflows.</h2>
        <a className="editorial-text-link" href="/operating-cloud">
          JCEE Operating Cloud: platform direction →
        </a>
        <p className="editorial-intro">
          JCEE Distribution applies the company’s operating-improvement
          direction to purchase-order integrity. AP Gate explores controlled
          payment execution and independently reviewable evidence. Component
          milestones remain separate from production integration claims.
        </p>
        <div className="editorial-actions">
          <a className="editorial-button" href="/solutions/distribution">
            Explore Distribution →
          </a>
          <a className="editorial-text-link" href="/registry#ap-gate">
            AP Gate status →
          </a>
        </div>
      </section>
      <section className="editorial-section">
        <h2>Execution tooling in development.</h2>
        <BuildStatusList ids={["ap-gate", "aeel", "vow-dx"]} />
        <h2>Understand the current build.</h2>
        <p>
          The public registry separates preserved milestones, development
          candidates, and unfinished evaluations. Research reports explain the
          tested conditions behind selected results.
        </p>
        <div className="editorial-actions">
          <a className="editorial-text-link" href="/registry">
            Public Registry →
          </a>
          <a className="editorial-text-link" href="/research">
            Read the research →
          </a>
        </div>
      </section>
    </EditorialLayout>
  );
}
