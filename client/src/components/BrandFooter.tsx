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
            <small>INDEPENDENT SOFTWARE LAB · DALLAS, TEXAS</small>
          </span>
        </a>
        <p>We build for the distance between what software claims and what it can prove.</p>
      </div>

      <div className="brand-footer-links">
        <div>
          <span>INSTITUTION</span>
          <a href="/#company">JCEE Labs</a>
          <a href="/charter">Charter</a>
        </div>
        <div>
          <span>CORE WORK</span>
          <a href="/#vow">VOW</a>
          <a href="/research-evidence">Research &amp; Evidence</a>
          <a href="/research/jrp-000">JRP-000 · Evidence Boundary</a>
          <a href="/qcs">QCS</a>
        </div>
        <div>
          <span>CONSUMER</span>
          <a href="/#mirrored">Mirrored</a>
        </div>
        <div>
          <span>CONTACT</span>
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
