export default function WhoThisIsFor() {
  return (
    <section className="editorial-section who-this-is-for" aria-labelledby="who-this-is-for">
      <h2 id="who-this-is-for">Who this is for</h2>
      <p>
        JCEE’s work is intended for teams using AI or automation where a wrong,
        repeated, unauthorized, or unexplained action has real operational cost.
      </p>
      <div className="resource-grid">
        <article className="resource-card">
          <h3>Product and operations</h3>
          <p>
            Evaluate workflows that need explicit review and decision ownership.
          </p>
        </article>
        <article className="resource-card">
          <h3>Platform and infrastructure</h3>
          <p>
            Investigate execution, interruption, recovery, and uncertain
            outcomes.
          </p>
        </article>
        <article className="resource-card">
          <h3>Security and risk</h3>
          <p>
            Examine how permission, scope, and evidence relate to consequential
            actions.
          </p>
        </article>
      </div>
      <p>
        A useful starting point is one workflow with identifiable instructions,
        an accountable owner, and an observable result.
      </p>
      <a className="editorial-text-link" href="/partners/enterprise">
        Discuss your workflow →
      </a>
    </section>
  );
}
