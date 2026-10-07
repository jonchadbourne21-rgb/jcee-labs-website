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
            <h3>No generic SDK or blanket authority layer.</h3>
            <p>A public package, universal API, production certification, or autonomous authority claim is not currently offered.</p>
          </article>
        </div>
        <p className="editorial-intro">
          This public semantic contract does not publish the internal recovery
          law, verifier algorithms, receipt encoding, hostile-test corpora,
          adapter mechanics, or bypass analysis; those remain private.
        </p>
      </section>
      <section
        className="editorial-section editorial-section-muted"
        id="infrastructure-build"
        aria-labelledby="infrastructure-build-title"
      >
        <p className="editorial-kicker">JCEE-INFRA / UNIFIED ASSURANCE AND EXECUTION</p>
        <h2 id="infrastructure-build-title">
          Infrastructure that connects authority to an actual, reviewable effect.
        </h2>
        <p className="editorial-intro">
          JCEE is building a bounded infrastructure layer for organizations
          that must reconstruct which machine decision was authorized, what
          external consequence occurred, and whether the surviving evidence
          supports that conclusion. It connects existing authority sources,
          external systems of record, durable execution, and reviewable receipts.
        </p>
        <div className="infrastructure-contract" aria-label="What the JCEE infrastructure is built to demonstrate">
          <strong>THE CORE ASSURANCE QUESTION</strong>
          <p>
            Who authorized this exact action, under which current business
            authority, what did the competent target actually commit, and
            what evidence can another party inspect afterward?
          </p>
        </div>
        <div className="infra-stage-grid" aria-label="JCEE infrastructure P0 through P3 evidence status">
          <article className="infra-stage">
            <p className="editorial-kicker">P0 / UNIFIED CONTRACT</p>
            <span className="infra-stage__status">CONTRACT FROZEN</span>
            <h3>JAIR v0.1</h3>
            <p>
              Establish a common semantic boundary across authority,
              evidence, exact effect identity, execution, recovery, and
              receipts without merging their distinct responsibilities.
            </p>
            <p className="infra-stage__limit">
              A frozen contract is not proof of full system integration.
            </p>
          </article>
          <article className="infra-stage">
            <p className="editorial-kicker">P1 / GOLDEN EXECUTION PATH</p>
            <span className="infra-stage__status">BOUNDED PASS</span>
            <h3>One reconstructable path</h3>
            <p>
              Reproduce a scoped authorization-to-effect-to-evidence path,
              including durable intent and the observable terminal outcome,
              in the qualified test setting.
            </p>
            <p className="infra-stage__limit">
              This is bounded test evidence, not customer production qualification.
            </p>
          </article>
          <article className="infra-stage">
            <p className="editorial-kicker">P2 / HOSTILE CONFORMANCE</p>
            <span className="infra-stage__status">BOUNDED PASS</span>
            <h3>Test disagreement and interruption</h3>
            <p>
              Challenge the semantics with stale or revoked authority,
              duplicate attempts, missing responses, contradictory evidence,
              and uncertain external state.
            </p>
            <p className="infra-stage__limit">
              Covered tests do not establish universal safety or independent certification.
            </p>
          </article>
          <article className="infra-stage">
            <p className="editorial-kicker">P3 / HETEROGENEOUS ADAPTERS</p>
            <span className="infra-stage__status infra-stage__status--hold">PARTIAL / GOVERNANCE HOLD</span>
            <h3>Transfer across external boundaries</h3>
            <p>
              Qualify the same contract across materially different target
              systems. A bounded infrastructure adapter result is retained;
              the payment consequence lane has not qualified.
            </p>
            <p className="infra-stage__limit">
              The authority-at-consequence mapping is frozen. No provider
              execution, replacement adapter, or P3 completion is authorized.
            </p>
          </article>
        </div>
        <p className="editorial-intro">
          <strong>Regulatory and organizational assurance:</strong> This work
          is intended to help organizations produce inspectable evidence for
          consequential AI controls. The applicable mandate, jurisdiction,
          obligation-to-control mapping, independent evaluation, and operational
          compliance must be assessed separately for each deployment.
          JCEE does not claim blanket mandate compliance, regulatory approval,
          production certification, or an authorized enterprise deployment.
        </p>
        <div className="editorial-actions">
          <a className="editorial-text-link" href="/registry">
            Recorded component milestones and limitations →
          </a>
          <a className="editorial-text-link" href="/partners/enterprise">
            Discuss a bounded workflow assessment →
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
