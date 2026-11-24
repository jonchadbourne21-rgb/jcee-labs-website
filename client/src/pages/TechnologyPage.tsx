import EditorialLayout from "@/components/EditorialLayout";
import { CapabilityDetails } from "@/components/CapabilityCatalog";

export default function TechnologyPage() {
  return (
    <EditorialLayout
      current="technology"
      eyebrow="How it works"
      title="Permission, action, and a record you can review."
      description="How we connect AI-assisted work to your systems: who may act, what actually happened, and a record your team can check."
    >
      <CapabilityDetails />
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
          <li><span>02</span><h3>Current authority</h3><p>Check the competent source of permission at action time. A proposal is not authority. Entitlement is not execution.</p></li>
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
            <h3>Private interfaces; scoped integration.</h3>
            <p>Private SDK, CLI and service distributions have bounded component results. Public package availability and production admission remain separate decisions.</p>
          </article>
        </div>
        <p className="editorial-intro">
          This public semantic contract does not publish the internal recovery
          law, verifier algorithms, receipt encoding, hostile-test corpora,
          adapter mechanics, or bypass analysis; those remain private.
        </p>
      </section>
      <section className="editorial-section editorial-section-muted">
        <p className="editorial-kicker">Applied development</p>
        <h2>From engineering evidence to your workflow.</h2>
        <p className="editorial-intro">
          Start with the business process you want to improve. A Workflow
          Assurance assessment maps your systems, permissions, recovery
          requirements, and the evidence needed for a useful next decision.
        </p>
        <div className="editorial-actions">
          <a className="editorial-button" href="/solutions#assessment">
            See the Workflow Assurance assessment →
          </a>
          <a className="editorial-text-link" href="/consultation">
            Discuss your workflow →
          </a>
        </div>
        <details>
          <summary>Earlier applied workflow studies</summary>
          <p>Distribution's synthetic order-review study and AP Gate's payment
          research retain their original scope and limits. They are not current
          production service claims.</p>
          <div className="editorial-actions">
            <a className="editorial-text-link" href="/solutions/distribution">Order-review study →</a>
            <a className="editorial-text-link" href="/registry#ap-gate">AP Gate status →</a>
          </div>
        </details>
      </section>
      <section className="editorial-section">
        <p className="editorial-kicker">The software behind it</p>
        <h2>Three programs, one connected system.</h2>
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
      <section className="editorial-section technology-engineering-pointer" id="current-integration" aria-labelledby="engineering-log-pointer-title">
        <div id="infrastructure-build" className="technology-anchor" />
        <div id="formal-foundation" className="technology-anchor" />
        <div id="october-2026-integration" className="technology-anchor" />
        <div id="physical-commitment" className="technology-anchor" />
        <p className="editorial-kicker">Engineering progress</p>
        <h2 id="engineering-log-pointer-title">Dated results, with their limits.</h2>
        <p>
          The engineering log records what was tested, when, and what remains
          open. The Public Registry keeps every dated entry.
        </p>
        <div className="editorial-actions">
          <a className="editorial-text-link" href="/technology/engineering-log">Read the engineering log →</a>
          <a className="editorial-text-link" href="/registry">Public Registry →</a>
        </div>
      </section>
    </EditorialLayout>
  );
}
