type BrandFooterProps = {
  backToTopHref?: string;
};

export default function BrandFooter({ backToTopHref = "/#top" }: BrandFooterProps) {
  return (
    <footer className="brand-footer">
      <div className="brand-footer-top">
        <a className="brand-footer-lockup" href="/" aria-label="JCEE Labs home">
          <img src="/brand/jcee-labs-mark.png" alt="" aria-hidden="true" />
          <span>
            <strong>JCEE LABS</strong>
            <small>PRECISION RESEARCH + INTELLIGENCE · DALLAS, TEXAS</small>
          </span>
        </a>
        <p>We build operating and assurance infrastructure for the distance between what software intends, what it does, and what the evidence can prove.</p>
      </div>

      <div className="brand-footer-links">
        <div>
          <span>PLATFORM</span>
          <a href="/operating-cloud">JCEE Operating Cloud</a>
          <a href="/distribution">JCEE Distribution</a>
          <a href="/partners/enterprise">Enterprise pathway</a>
        </div>
        <div>
          <span>TECHNOLOGY</span>
          <a href="/technology">Technology overview</a>
          <a href="/vow">JCEE VOW</a>
          <a href="/qcs">QCS</a>
          <a href="/assurance">JCEE Assurance</a>
        </div>
        <div>
          <span>EVIDENCE + INSTITUTION</span>
          <a href="/registry">Public Registry</a>
          <a href="/research/jrp-000">JRP-000 · Evidence Boundary</a>
          <a href="/charter">Charter</a>
          <a href="/charter/archive/v1.0">Charter v1.0 Archive</a>
        </div>
        <div>
          <span>CONTACT</span>
          <a href="/partners">Partner with JCEE Labs</a>
          <a href="/partners/research">Research pathway</a>
          <a href="mailto:support@jceelabs.com">support@jceelabs.com ↗</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>

      <div className="brand-footer-wordmark" aria-label="Evidence over claims">
        <span>EVIDENCE</span>
        <em>OVER</em>
        <span>CLAIMS</span>
      </div>

      <div className="brand-footer-meta">
        <span>© {new Date().getFullYear()} HOWM HOLDINGS LLC</span>
        <span>JCEE LABS · PUBLIC SITE</span>
        <a href={backToTopHref}>BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}
