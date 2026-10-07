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
        <h2>Bind the workflow. Keep the competent systems in place.</h2>
        <p className="editorial-intro">
          JCEE has implemented reference software; this is not a generic public
          SDK announcement. Private work begins with one bounded workflow and
          connects to the systems that already hold evidence, permission, and
          the external result.
        </p>
        <ol className="binding-strip" aria-label="JCEE public integration binding path">
          <li><span>01</span><h3>Claim + evidence</h3><p>Bind the proposed conclusion to the source record, observation, and evidence revision that support it.</p></li>
          <li><span>02</span><h3>Current authority</h3><p>Check the competent source of permission at action time. A proposal is not authority; entitlement is not execution.</p></li>
          <li><span>03</span><h3>Consequence</h3><p>The target system retains authority over the real-world effect. JCEE does not invent permission.</p></li>
          <li><span>04</span><h3>Recovery</h3><p>Preserve durable intent, effect identity, and uncertainty. Missing evidence stays unknown; recovery is not blind retry.</p></li>
          <li><span>05</span><h3>System of record</h3><p>Reconcile against the existing competent external record rather than treating an internal model assertion as the result.</p></li>
          <li><span>06</span><h3>Receipt</h3><p>Preserve an inspectable record of the authorized occurrence, its evidence basis, and unresolved state.</p></li>
        </ol>
        <p className="binding-note">
          Each arrow is a binding between evidence, authority, and external
          systems—not a library call.
        </p>
        <div className="resource-grid integration-posture-grid" aria-label="Current JCEE integration posture">
          <article className="resource-card">
            <p className="editorial-kicker">CURRENTLY PUBLIC</p>
            <h3>Method, reference behavior, and evidence.</h3>
            <p>Public pages describe the semantic boundary, selected tested behavior, and registry status without publishing private implementation mechanics.</p>
          </article>
          <article className="resource-card">
            <p className="editorial-kicker">PRIVATE INTEGRATION</p>
            <h3>One workflow at a time.</h3>
            <p>Integration is scoped around the buyer's existing evidence sources, authority systems, consequence boundary, recovery path, and system of record.</p>
          </article>
          <article className="resource-card">
            <p className="editorial-kicker">NOT OFFERED AS PUBLIC PRODUCT</p>
            <h3>No generic SDK or blanket authority layer.</h3>
            <p>A public package, universal API, production certification, or autonomous authority claim is not currently offered.</p>
          </article>
        </div>
        <p className="editorial-intro">
          Internal recovery law, verifier algorithms, receipt encoding,
          hostile-test corpora, adapter mechanics, and bypass analysis remain
          private.
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
