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
        <p className="editorial-kicker">How an integration works</p>
        <h2>Connect the workflow. Keep your systems in charge.</h2>
        <p className="editorial-intro">
          We start with one workflow and connect to the systems that already
          hold your records, your approvals, and the final result.
        </p>
        <ol className="binding-strip" aria-label="How a JCEE integration handles one request">
          <li><span>01</span><h3>Request + evidence</h3><p>Link the proposed change to the records and observations behind it.</p></li>
          <li><span>02</span><h3>Permission</h3><p>Check who may approve it at the moment it runs. A suggestion is not permission.</p></li>
          <li><span>03</span><h3>The change</h3><p>Your system makes the final call on the real-world change. We never invent permission.</p></li>
          <li><span>04</span><h3>Recovery</h3><p>If something times out, check what actually happened before retrying, instead of guessing.</p></li>
          <li><span>05</span><h3>System of record</h3><p>Confirm the result against your existing records, not an AI's say-so.</p></li>
          <li><span>06</span><h3>Receipt</h3><p>Keep a record your team can review: what was approved, what happened, and anything still open.</p></li>
        </ol>
        <div className="resource-grid integration-posture-grid" aria-label="How we work with you">
          <article className="resource-card">
            <p className="editorial-kicker">HOW WE WORK</p>
            <h3>One workflow at a time.</h3>
            <p>We scope each integration around your existing systems, approvals, and records, and test it with your team before production use.</p>
          </article>
          <article className="resource-card">
            <p className="editorial-kicker">WHAT WE PUBLISH</p>
            <h3>Our approach and dated test results.</h3>
            <p>The method and selected results are public in the engineering log and Public Registry. Implementation details stay private.</p>
          </article>
        </div>
      </section>
      <section className="editorial-section editorial-section-muted">
        <p className="editorial-kicker">Getting started</p>
        <h2>Start with one workflow.</h2>
        <p className="editorial-intro">
          Start with the business process you want to improve. A Workflow
          Assurance assessment maps your systems, permissions, and recovery
          needs, and ends with a practical next-step plan.
        </p>
        <div className="editorial-actions">
          <a className="editorial-button" href="/solutions#assessment">
            See the Workflow Assurance assessment →
          </a>
          <a className="editorial-text-link" href="/consultation">
            Discuss your workflow →
          </a>
        </div>
        <p>
          <a className="editorial-text-link" href="/solutions/distribution">See the distribution example →</a>
        </p>
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
              Decision research. Check whether the latest evidence supports the
              next action.
            </span>
            <span aria-hidden="true">→</span>
          </a>
          <a href="/assurance">
            <strong>JCEE Assurance</strong>
            <span>
              Evidence and verification. See what supports a conclusion, and
              what does not.
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
