type BrandFooterProps = {
  backToTopHref?: string;
};

export default function BrandFooter({
  backToTopHref = "/#top",
}: BrandFooterProps) {
  return (
    <footer className="brand-footer">
      <div className="brand-footer-wordmark">
        Intelligence That Leaves Receipts
      </div>

      <div className="brand-footer-links">
        <div>
          <span>COMPANY</span>
          <a href="/company">JCEE Labs</a>
          <a href="/founder">Meet the founder</a>
          <a href="/charter" id="charter">
            Charter
          </a>
          <a href="/charter/archive/v1.0">Charter v1.0 Archive</a>
        </div>
        <div>
          <span>TECHNOLOGY</span>
          <a href="/solutions/distribution">JCEE Distribution</a>
          <a href="/vow">JCEE VOW</a>
          <a href="/qcs">QCS</a>
          <a href="/assurance">JCEE Assurance</a>
        </div>
        <div>
          <span>RESOURCES</span>
          <a href="/resources">Blog and resources</a>
          <a href="/research">Research publications</a>
          <a href="/research/fields">Research fields</a>
          <a href="/registry">Public Registry</a>
          <a href="/research/jrp-000">JRP-000 · Evidence Boundary</a>
        </div>
        <div>
          <span>CONTACT</span>
          <a href="/partners">Partner with JCEE Labs</a>
          <a href="/partners/enterprise">Enterprise pathway</a>
          <a href="/partners/research">Research pathway</a>
          <a href="mailto:support@jceelabs.com">support@jceelabs.com ↗</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>

      <div className="brand-footer-top brand-footer-bottom-identity">
        <div>
          <a className="brand-footer-lockup" href="/" aria-label="JCEE Labs home">
            <img src="/brand/jcee-labs-mark.png" alt="" aria-hidden="true" />
            <span>
              <strong>JCEE LABS</strong>
              <small>PRECISION RESEARCH + INTELLIGENCE · DALLAS, TEXAS</small>
            </span>
          </a>
          <a className="footer-founder" href="/founder">Founded by Jonathan Matthew Chadbourne ↗</a>
        </div>
      </div>

      <div className="brand-footer-meta">
        <span>© {new Date().getFullYear()} JCEE Labs LLC</span>
        <a href={backToTopHref}>BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}
