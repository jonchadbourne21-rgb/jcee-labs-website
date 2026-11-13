import CoreHeader from "@/components/CoreHeader";
import BrandFooter from "@/components/BrandFooter";
import usePageSeo from "@/components/usePageSeo";
import { JCEESignalForge } from "@/components/magicpath/JCEESignalForge";
import "./worldlab-experiences.css";

// MagicPath design 470136268773285888, revision 470138610860052480.
// Browser-local React/Canvas 2D illustration: no live action or Rust runtime.
export default function SignalForgePage() {
  usePageSeo("/experiences/signal-forge");
  return (
    <div id="top" className="worldlab-experience-page" data-worldlab-section="technology">
      <CoreHeader current="technology" />
      <div id="page-content" tabIndex={-1}>
        <div className="experience-gateway">
          <p>SIGNAL FORGE · Explore an interrupted action. Fictional data. No live agent actions.</p>
          <nav aria-label="Explore JCEE interface studies">
            <a href="/experiences/evidence-engine">Explore Evidence Engine ↗</a>
            <a href="/technology">Engineering evidence ↗</a>
          </nav>
        </div>
        <JCEESignalForge />
      </div>
      <BrandFooter backToTopHref="#top" />
    </div>
  );
}
