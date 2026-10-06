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
      <section className="editorial-section">
        <p className="editorial-kicker">Public integration model</p>
        <h2>Keep evidence, authority, execution, and verification distinct.</h2>
        <div className="resource-grid" aria-label="JCEE public binding path">
          <article className="resource-card">
            <h3>01 · Claim or observation</h3>
            <p>Start with the instruction, source record, or proposed action. A proposal is not authority.</p>
          </article>
          <article className="resource-card">
            <h3>02 · Evidence boundary</h3>
            <p>Bind the conclusion to the evidence and revision that support it. Inference does not silently become fact.</p>
          </article>
          <article className="resource-card">
            <h3>03 · Current authority</h3>
            <p>Check the competent source of permission at the time of action. Entitlement is not execution.</p>
          </article>
          <article className="resource-card">
            <h3>04 · Consequence boundary</h3>
            <p>The target system remains the owner of the real-world consequence; JCEE does not invent authority the target did not grant.</p>
          </article>
          <article className="resource-card">
            <h3>05 · Durable execution and recovery</h3>
            <p>Preserve intent and uncertainty across interruption. Missing evidence stays unknown; recovery does not become blind retry.</p>
          </article>
          <article className="resource-card">
            <h3>06 · Terminal verification and receipt</h3>
            <p>Verify the observable outcome independently where possible and preserve a reviewable receipt of what is known.</p>
          </article>
        </div>
        <p className="editorial-intro">
          This is the public semantic contract, not a published SDK or protocol specification.
          Internal recovery law, verifier algorithms, receipt encoding, hostile-test corpora,
          adapter mechanics, and bypass analysis remain private.
        </p>
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
