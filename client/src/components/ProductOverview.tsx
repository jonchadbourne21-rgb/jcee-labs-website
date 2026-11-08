import { ArrowUpRight } from "lucide-react";
import "./worldlab-product-overview.css";

/**
 * Commercial second act of the homepage. The existing orbital-blue hero is
 * unchanged; this light editorial surface reuses the earlier customer-first
 * presentation while clearly separating current services from developing software.
 */
export default function ProductOverview() {
  return (
    <section
      id="product-overview"
      className="wl-product-overview"
      aria-labelledby="product-overview-title"
    >
      <div className="customer-shell wl-product-overview-inner">
        <div className="wl-product-stage">
          <div className="wl-product-stage-copy">
            <p className="wl-product-eyebrow">
              <span aria-hidden="true" className="wl-product-dot" />
              02 / THE PRODUCT &amp; THE WORK
            </p>
            <h2 id="product-overview-title">
              Put AI to work.
              <br />
              Stay in control.
            </h2>
            <p className="wl-product-lead">
              Bring AI into the workflows your business depends on. We help
              your team connect systems, define what automation can do, and
              verify the results.
            </p>
            <div className="wl-product-actions">
              <a href="/consultation" className="wl-product-primary">
                Discuss your workflow
                <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
              </a>
              <a href="/capabilities/infrastructure" className="wl-product-secondary">
                Explore JCEE Infrastructure
                <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </div>
          </div>
          <figure className="wl-product-visual">
            <img
              src={`${import.meta.env.BASE_URL}visuals/jcee-authority-hero-v3.webp`}
              width={1344}
              height={752}
              loading="lazy"
              decoding="async"
              alt="A glass core inside a titanium frame with light tracing through it."
            />
            <figcaption>DESIGN STUDY / THE CONSEQUENCE BOUNDARY</figcaption>
          </figure>
        </div>

        <div className="wl-product-market" aria-label="What JCEE WorldLab offers">
          <div className="wl-product-market-heading">
            <p>START WITH A REAL WORKFLOW</p>
            <p>One engagement you can scope today. One platform we're building.</p>
          </div>
          <div className="wl-product-offers">
            <article className="wl-product-offer">
              <p className="wl-product-offer-type">01 / SCOPED SERVICE ENGAGEMENT</p>
              <h3>Workflow Assurance assessment</h3>
              <p>
                We examine one workflow, its existing permissions, failure
                points, and records. Your team receives written findings,
                acceptance criteria, and a practical next-step plan.
              </p>
              <a href="/capabilities/infrastructure#deliverables">
                See the assessment deliverables
                <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </article>
            <article className="wl-product-offer wl-product-offer-platform">
              <p className="wl-product-offer-type">02 / SOFTWARE IN DEVELOPMENT</p>
              <h3>JCEE Infrastructure</h3>
              <p>
                We're integrating execution, current authority, recovery, and
                inspectable evidence for consequential automated actions.
                Deployment suitability must be qualified for each workflow.
              </p>
              <a href="/technology#current-integration">
                Explore the engineering
                <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </article>
          </div>
          <p className="wl-product-limit">
            Assessments are individually scoped. JCEE Infrastructure remains
            in development; recorded tests do not establish general production
            readiness or customer outcomes.
          </p>
        </div>
      </div>
    </section>
  );
}
