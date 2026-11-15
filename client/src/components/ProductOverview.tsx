import { ArrowUpRight } from "lucide-react";
import HexWaveField from "./HexWaveField";
import "./worldlab-product-overview.css";

/**
 * Buyer-facing homepage lead. Matches the orbital-blue canvas and uses a
 * plainly illustrative receipt, not a recorded action or customer result.
 */
export default function ProductOverview() {
  return (
    <section
      id="product-overview"
      className="wl-product-overview"
      aria-labelledby="product-overview-title"
    >
      <div className="wl-hex-background" aria-hidden="true">
        <HexWaveField variant="worldlab" className="wl-full-hex-field" />
      </div>
      <div id="page-content" tabIndex={-1} className="customer-shell wl-product-overview-inner">
        <div className="wl-product-stage">
          <div className="wl-product-stage-copy">
            <p className="wl-product-eyebrow">
              <span aria-hidden="true" className="wl-product-dot" />
              01 / SOFTWARE FOR YOUR OPERATIONS
            </p>
            <h1 id="product-overview-title">
              Put AI to work.
              <br />
              Stay in control.
            </h1>
            <p className="wl-product-lead">
              We build custom software and connect the systems your business
              runs on—with clear permissions, controlled recovery, and
              a record of what happened. Put AI and automation to work
              where they can make a practical difference.
            </p>
            <div className="wl-product-actions">
              <a href="/consultation" className="wl-product-primary">
                Discuss your workflow
                <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
              </a>
              <a href="/solutions" className="wl-product-secondary">
                Explore solutions
                <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </div>
          </div>

          <figure className="wl-product-visual" aria-label="Illustrative AI action receipt interface, not a record of a real customer action">
            <div className="wl-receipt" data-demo="illustrative">
              <div className="wl-receipt-top">
                <span className="wl-receipt-mark" aria-hidden="true"><i /><i /></span>
                <span>JCEE WORLDLAB / INTERFACE STUDY</span>
                <span>FIG. 001</span>
              </div>
              <div className="wl-receipt-heading">
                <p className="wl-receipt-overline">CONSEQUENTIAL ACTION / CONTROL RECORD</p>
                <h3 className="wl-receipt-title">AI action receipt<span className="wl-receipt-period">.</span></h3>
              </div>
              <div className="wl-receipt-state">
                <span className="wl-receipt-led" aria-hidden="true" />
                <strong>HELD FOR REVIEW</strong>
                <span className="wl-receipt-no-effect">NO CHANGE EXECUTED</span>
              </div>
              <dl className="wl-receipt-entries">
                <div>
                  <dt>01 / REQUEST</dt>
                  <dd>Restart production service</dd>
                </div>
                <div>
                  <dt>02 / CURRENT AUTHORITY</dt>
                  <dd>Paused pending review</dd>
                </div>
                <div>
                  <dt>03 / OBSERVED EFFECT</dt>
                  <dd>No change executed</dd>
                </div>
                <div>
                  <dt>04 / EVIDENCE</dt>
                  <dd>Decision and outcome recorded</dd>
                </div>
              </dl>
              <div className="wl-receipt-bottom">
                <div className="wl-receipt-fingerprint" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
                <span>EXAMPLE INTERFACE<br /><strong>NOT A LIVE RECEIPT</strong></span>
              </div>
            </div>
            <figcaption>CONCEPT / AUTHORITY → EFFECT → EVIDENCE</figcaption>
          </figure>
        </div>

        <div className="wl-product-market" aria-label="What JCEE WorldLab offers">
          <div className="wl-product-market-heading">
            <p>START WITH A REAL WORKFLOW</p>
            <p>Assess a workflow. Build a solution. Partner on what comes next.</p>
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
              <a href="/solutions#assessment">
                See the assessment deliverables
                <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </article>
            <article className="wl-product-offer wl-product-offer-platform">
              <p className="wl-product-offer-type">02 / CUSTOM SOFTWARE &amp; INTEGRATION</p>
              <h3>Build around your business</h3>
              <p>
                Connect business applications, replace manual handoffs, and
                build the tools your team needs. We bring existing action
                controls, recovery mechanisms, and evidence records into
                a solution scoped to your systems.
              </p>
              <a href="/solutions#build">
                Explore implementation
                <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </article>
            <article className="wl-product-offer">
              <p className="wl-product-offer-type">03 / DESIGN PARTNERSHIPS</p>
              <h3>Build the next step together</h3>
              <p>Bring a real operational challenge. Shape a focused pilot with us, review the results, and decide together what is ready to scale.</p>
              <a href="/solutions#design-partners">Explore a partnership <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" /></a>
            </article>
          </div>
          <p className="wl-product-limit">
            Every engagement has an agreed scope, deliverables, and acceptance criteria.
            Integrations are tested for your workflow before production use.
            The receipt above is an illustrative design, not an executed customer workflow.
          </p>
        </div>
      </div>
    </section>
  );
}
