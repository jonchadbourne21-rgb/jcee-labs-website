import EditorialLayout from "@/components/EditorialLayout";
const checks = [
  ["Order existence", "Did the purchase order produce a matching sales order?"],
  [
    "Freight and pricing",
    "Do the account, terms, and unit prices match the approved instructions?",
  ],
  [
    "Destination and line items",
    "Are the ship-to address, products, accessories, and quantities consistent?",
  ],
  [
    "Duplicate orders",
    "Has the same purchase order been entered more than once?",
  ],
];
export default function DistributionPage() {
  return (
    <EditorialLayout
      current="solutions"
      eyebrow="Solutions / Industrial distribution"
      title="Keep the order true to the instructions."
      description="JCEE Distribution is in development to help teams compare purchase orders with sales orders, investigate exceptions, and measure the work those exceptions create."
    >
      <section className="editorial-section distribution-intro">
        <div>
          <p className="editorial-kicker">
            Begin alongside your existing systems
          </p>
          <h2>One workflow. A measurable improvement.</h2>
          <p>
            The initial focus is purchase-order integrity: compare what was
            requested with what was entered, then give a person enough context
            to check the difference.
          </p>
          <p>
            The proposed first evaluation is a read-only shadow of an existing
            order workflow. Your team keeps control of order entry and every
            consequential action.
          </p>
          <a className="editorial-button" href="/partners/enterprise">
            Discuss your workflow →
          </a>
        </div>
        <div
          className="order-example"
          aria-label="Illustrative order comparison, not customer data"
        >
          <p className="editorial-kicker">Illustrative comparison</p>
          <h3>PO instruction → Sales order</h3>
          <dl>
            <div>
              <dt>Purchase order</dt>
              <dd>Use customer freight account</dd>
            </div>
            <div>
              <dt>Sales order</dt>
              <dd>Freight account not recorded</dd>
            </div>
            <div>
              <dt>Result</dt>
              <dd>
                <span className="status-label">Needs review</span>
              </dd>
            </div>
          </dl>
          <p>
            A discrepancy is a request to investigate. It does not authorize a
            change.
          </p>
        </div>
      </section>
      <section className="editorial-section editorial-section-muted">
        <p className="editorial-kicker">The first checks</p>
        <h2>Find the mismatch. Keep its context.</h2>
        <div className="resource-grid">
          {checks.map(([title, copy]) => (
            <article className="resource-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="editorial-section">
        <div className="editorial-section-heading">
          <h2>Progress, with a clear next step.</h2>
          <span className="status-label">Synthetic prototype</span>
        </div>
        <div className="evidence-numbers">
          <div>
            <strong>20 / 20</strong>
            <span>Expected synthetic classifications matched</span>
          </div>
          <div>
            <strong>4</strong>
            <span>Result categories exercised</span>
          </div>
          <div>
            <strong>0</strong>
            <span>External effects</span>
          </div>
        </div>
        <p className="editorial-intro">
          Recorded September 14, 2026. These results establish comparison
          mechanics on the tested cases. Customer ROI, live integration, and
          production readiness remain unestablished.
        </p>
        <a
          className="editorial-text-link"
          href="/blog/distribution-first-dry-run"
        >
          Read the engineering update →
        </a>
      </section>
      <section className="editorial-section editorial-section-dark">
        <p className="editorial-kicker">The longer direction</p>
        <h2>Earn more of the workflow.</h2>
        <ol className="growth-sequence">
          {[
            ["Overlay", "Work alongside existing systems."],
            ["Assure", "Reconcile records and preserve evidence."],
            ["Assist", "Help a person find the next useful check."],
            [
              "Own workflow",
              "Automate bounded steps after separate validation.",
            ],
            [
              "Vertical OS",
              "Build an industry workflow surface where value justifies it.",
            ],
          ].map(([title, copy], i) => (
            <li key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
        <p>
          This is the product roadmap. Progress depends on observed operating
          value and explicit authority at each stage.
        </p>
      </section>
    </EditorialLayout>
  );
}
