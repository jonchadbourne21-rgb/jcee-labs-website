export default function WhoThisIsFor() {
  return (
    <section className="editorial-section who-this-is-for" aria-labelledby="who-this-is-for">
      <p className="editorial-kicker">02 / WHERE THE WORK BREAKS</p>
      <h2 id="who-this-is-for">Who this is for</h2>
      <p>
        Teams with recurring AI-assisted or automated work where “assigned” and
        “done” are separated by manual checking, uncertain outcomes, or changing
        permission.
      </p>
      <div className="resource-grid">
        <article className="resource-card">
          <h3>Product and operations</h3>
          <p>
            Orders, approvals, reviews, or handoffs that require repeated
            checking before anyone can say the work is actually complete.
          </p>
        </article>
        <article className="resource-card">
          <h3>Platform and infrastructure</h3>
          <p>
            Timeouts, partial completion, retries, and cross-system effects that
            make the final state difficult to reconstruct with confidence.
          </p>
        </article>
        <article className="resource-card">
          <h3>Security and risk</h3>
          <p>
            Work where permission can change and a consequential action needs a
            clear owner, current authority, and inspectable evidence.
          </p>
        </article>
      </div>
      <p>
        The starting point is one workflow, one accountable owner, and one
        observable result—not a platform migration.
      </p>
      <a className="editorial-text-link" href="/partners/enterprise">
        Discuss one workflow →
      </a>
    </section>
  );
}
