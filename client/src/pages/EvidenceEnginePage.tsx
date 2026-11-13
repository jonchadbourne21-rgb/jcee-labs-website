import CoreHeader from "@/components/CoreHeader";
import BrandFooter from "@/components/BrandFooter";
import usePageSeo from "@/components/usePageSeo";
import { JCEEWorldLabEvidenceEngine } from "@/components/magicpath/JCEEWorldLabEvidenceEngine";
import "./worldlab-experiences.css";

// MagicPath design 470133291253641216, revision 470133291253641217.
// Browser-local fictional records; no live execution, telemetry or receipts.
export default function EvidenceEnginePage() {
  usePageSeo("/experiences/evidence-engine");
  return (
    <div id="top" className="worldlab-experience-page" data-worldlab-section="technology">
      <CoreHeader current="technology" />
      <div id="page-content" tabIndex={-1}>
        <div className="experience-gateway">
          <p>EVIDENCE ENGINE · Review the outcome. Fictional records. No live system access.</p>
          <nav aria-label="Explore JCEE interface studies">
            <a href="/experiences/signal-forge">Explore Signal Forge ↗</a>
            <a href="/technology">Engineering evidence ↗</a>
          </nav>
        </div>
        <JCEEWorldLabEvidenceEngine />
      </div>
      <BrandFooter backToTopHref="#top" />
    </div>
  );
}
