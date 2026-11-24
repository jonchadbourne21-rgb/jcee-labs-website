import AnimatedBrandLogo from "./AnimatedBrandLogo";
import HexWaveField from "./HexWaveField";
import "./signature-panel.css";
type BrandFooterProps = {
  backToTopHref?: string;
};

export default function BrandFooter({
  backToTopHref = "/#top",
}: BrandFooterProps) {
  return (
    <footer className="brand-footer">
      <div className="brand-footer-field" aria-hidden="true">
        <HexWaveField variant="worldlab" seed={11} intensity={0.8} pulse className="signature-field" />
      </div>
      <div className="brand-footer-wordmark brand-footer-wordmark--compact">
        Intelligence That Leaves Receipts
      </div>

      <div className="brand-footer-links">
        <div>
          <span>COMPANY</span>
          <a href="/company">JCEE WorldLab</a>
          <a href="/founder">Meet the founder</a>
          <a href="/charter" id="charter">
            Charter
          </a>
          <a href="/charter/archive/v1.0/">Charter v1.0 Archive</a>
        </div>
        <div>
          <span>SOLUTIONS &amp; TECHNOLOGY</span>
          <a href="/solutions">Solutions for your operations</a>
          <a href="/solutions#design-partners">Become a design partner</a>
          <a href="/solutions#assessment">Workflow Assurance assessment</a>
          <a href="/vow">JCEE VOW</a>
          <a href="/qcs">QCS</a>
          <a href="/assurance">JCEE Assurance</a>
        </div>
        <div>
          <span>RESOURCES</span>
          <a href="/resources">Blog and resources</a>
          <a href="/research">Research publications</a>
          <a href="/research#builds-and-experiments">Builds &amp; experiments</a>
          <a href="/research/fields">Research fields</a>
          <a href="/experiences/signal-forge">Signal Forge · Interactive concept</a>
          <a href="/experiences/evidence-engine">Evidence Engine · Interface study</a>
          <a href="/registry">Public Registry</a>
          <a href="/research/jrp-000">JRP-000 · Evidence Boundary</a>
        </div>
        <div>
          <span>CONTACT</span>
          <a href="/partners">Partner with JCEE WorldLab</a>
          <a href="/partners/enterprise">Enterprise pathway</a>
          <a href="/partners/research">Research pathway</a>
          <a href="mailto:sales@jceelabs.com">sales@jceelabs.com ↗</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>

      <div className="brand-footer-top brand-footer-bottom-identity">
        <div>
          <AnimatedBrandLogo />
          <a className="footer-founder" href="/founder">
            Founded by Jonathan Matthew Chadbourne ↗
          </a>
        </div>
      </div>

      <div className="brand-footer-meta">
        <span>© {new Date().getFullYear()} JCEE Labs LLC</span>
        <a href={backToTopHref} aria-label="Back to the top of the home page">BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}
