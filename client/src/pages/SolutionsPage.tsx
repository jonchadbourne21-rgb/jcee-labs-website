import EditorialLayout from "@/components/EditorialLayout";

const workflows = [
  ["Order integrity", "A purchase order and the entered order disagree.", "Compare structured order records, flag missing or duplicate entries, and keep the details a person needs to resolve the discrepancy."],
  ["Pricing & approval workflows", "A requested discount or credit needs the right approval.", "Build explicit approval rules into the action path, with a review step for exceptions and a record of the decision."],
  ["System handoffs & recovery", "An API times out after a change may have happened.", "Check the outcome before retrying. Build recovery around the connected system’s lookup and duplicate-prevention behavior, and escalate unresolved cases."],
  ["IT & service operations", "A change spans several tools and teams.", "Connect the request, permission, execution, and observed result so your team can investigate from one coherent record."],
];

export default function SolutionsPage() {
  return <EditorialLayout current="solutions" eyebrow="Solutions / Software for real operations"
    title="Make your systems work together. Keep your team in control."
    description="Custom software, workflow integration, and practical controls for business automation. We help operations and IT teams turn a costly handoff into a process they can run, review, and improve.">
    <section className="editorial-section">
      <div className="customer-actions">
        <a className="editorial-button" href="/consultation">Discuss your workflow ↗</a>
        <a className="editorial-text-link" href="#design-partners">Explore design partnerships ↓</a>
      </div>
      <p>You can start with one workflow alongside your existing ERP, CRM, or service desk. We scope the connections and controls your team needs, then build and test the agreed solution.</p>
    </section>
    <section className="editorial-section editorial-section-muted" id="workflows">
      <p className="editorial-kicker">Where we can help</p>
      <h2>Less uncertainty between request and result.</h2>
      <div className="resource-grid">{workflows.map(([title, problem, response]) => <article className="resource-card" key={title}><h3>{title}</h3><p><strong>{problem}</strong></p><p>{response}</p></article>)}</div>
      <p>These are workflows we can scope and engineer. The exact integrations, policies, and supported failure cases are defined for each engagement.</p>
      <a className="editorial-text-link" href="/solutions/distribution">Explore industrial distribution →</a>
    </section>
    <section className="editorial-section" id="assessment">
      <p className="editorial-kicker">01 / Workflow Assurance Assessment</p>
      <h2>Know what to fix—and what to build.</h2>
      <p>Choose one important workflow: quote-to-order, order review, an internal approval, or a multi-system change. We examine the handoffs, permissions, exception handling, and recovery behavior.</p>
      <div className="resource-grid">
        <article className="resource-card"><h3>Your deliverables</h3><ul><li>A map of the workflow and its system handoffs</li><li>Prioritized failure points and existing safeguards</li><li>Human review rules and proposed action controls</li><li>A remediation blueprint with testable acceptance criteria</li></ul></article>
        <article className="resource-card"><h3>A defined engagement</h3><p>We agree the workflow, access requirements, deliverables, fee, and schedule before work starts. The findings can guide your own team or a follow-on build with us.</p><a className="editorial-text-link" href="/consultation">Discuss your workflow ↗</a></article>
      </div>
    </section>
    <section className="editorial-section editorial-section-dark" id="build">
      <p className="editorial-kicker">02 / Custom software &amp; integration</p>
      <h2>Build the workflow your business needs.</h2>
      <p>From an internal approval tool to a connected business application, we design and implement software around the way your team works. Our existing permission checks, recovery mechanisms, and evidence records provide reusable foundations.</p>
      <div className="resource-grid">
        <article className="resource-card"><h3>Connect the work</h3><p>APIs, business-system adapters, internal interfaces, and shared records that bring scattered steps into a usable workflow.</p></article>
        <article className="resource-card"><h3>Control the action</h3><p>Define who can approve a change, which conditions it must meet, and when an uncertain case needs a person.</p></article>
        <article className="resource-card"><h3>Make the result reviewable</h3><p>Check outcomes, handle interrupted work under the target system’s contract, and retain action records for investigation and audit support.</p></article>
      </div>
      <p>Delivery includes the agreed implementation, tests, documentation, and handoff. Deployment and ongoing support are scoped with your team.</p>
      <a className="editorial-button" href="/consultation">Discuss your workflow ↗</a>
    </section>
    <section className="editorial-section" id="design-partners">
      <p className="editorial-kicker">03 / Design partner access</p>
      <h2>Your real workflow. Our next build. A shared measure of success.</h2>
      <p>We’re inviting operations and IT teams—including industrial distributors—to shape focused pilots with us. Bring a costly exception, a difficult handoff, or an automation project that needs stronger control.</p>
      <ol className="growth-sequence">
        <li><span>01</span><h3>Choose the workflow</h3><p>Agree the data route, responsibilities, pilot boundaries, and measures that matter to your team.</p></li>
        <li><span>02</span><h3>Observe alongside it</h3><p>Where suitable, start in shadow mode: inspect approved data and produce comparison or action records without permission to change production records.</p></li>
        <li><span>03</span><h3>Review the evidence</h3><p>Evaluate discrepancy coverage, review effort, and recovery behavior. Decide what merits a separately tested production integration.</p></li>
      </ol>
      <p>You contribute workflow expertise and feedback; we contribute engineering and a defined pilot deliverable. We agree pricing, data handling, ownership, and acceptance criteria before starting.</p>
      <a className="editorial-button" href="/consultation">Discuss your workflow ↗</a>
    </section>
    <section className="editorial-section editorial-section-muted">
      <p className="editorial-kicker">Engineering behind the offer</p>
      <h2>Built on software you can examine.</h2>
      <p>Our work includes built action controls, recovery, order comparison, and reviewable records. Every customer integration is tested against your own requirements before production use.</p>
      <a className="editorial-text-link" href="/technology/engineering-log#current-integration">Explore the software and recorded results →</a>
    </section>
  </EditorialLayout>;
}
