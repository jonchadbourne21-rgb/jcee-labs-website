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
      <section className="editorial-section" id="integration-law" aria-labelledby="integration-law-title">
        <p className="editorial-kicker">HOW JCEE INTEGRATES</p>
        <h2 id="integration-law-title">The integration is a chain of boundaries, not a library call.</h2>
        <p className="editorial-intro">
          JCEE sits between a proposed consequential action and its effect. It binds the action to current evidence and authority, carries that decision to a customer-controlled consequence boundary, preserves execution and recovery evidence when outcomes are ambiguous, and leaves a result that can be checked independently of the originating process.
        </p>
        <div className="editorial-link-list" aria-label="JCEE integration boundaries">
          <div><strong>Agent / application — proposes</strong><span>Names the candidate action. Proposal carries no effect authority.</span></div>
          <div><strong>Current evidence + authority — establishes the basis</strong><span>Keeps the decision tied to what is current for the proposed action.</span></div>
          <div><strong>JCEE evaluation — judges</strong><span>Determines what the current record supports. A supported claim is not execution permission.</span></div>
          <div><strong>Customer-controlled consequence boundary — allows or refuses</strong><span>The target retains final consequence control. JCEE cannot manufacture that authority.</span></div>
          <div><strong>VOW execution + recovery — preserves</strong><span>Carries durable execution evidence through interruption and ambiguous outcomes before another consequential action is taken.</span></div>
          <div><strong>Authoritative external systems — establish</strong><span>The systems competent for the relevant facts remain authoritative; JCEE does not replace them.</span></div>
          <div><strong>Independent verification — checks</strong><span>Reviews the retained evidence without relying on the originating agent&apos;s narrative.</span></div>
          <div><strong>Bounded receipt — records</strong><span>States what was supported and what remains unresolved.</span></div>
        </div>
        <p className="quiet">
          This diagram describes JCEE&apos;s integration model. It is not a public SDK, production certification, universal non-bypassability claim, or customer-deployment claim. Concrete recovery rules, enforcement mechanics, adapters, proof internals, attack corpora, and customer topology remain private.
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
