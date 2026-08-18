import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

export default function NotFound() {
  return (
    <main className="program-page" id="top">
      <CoreHeader />

      <section className="program-masthead">
        <p className="eyebrow"><span /> ROUTE STATUS · NOT FOUND</p>
        <div className="program-number">404 / UNKNOWN STATE</div>
        <h1>The requested route<br /><em>is not in evidence.</em></h1>
        <p className="program-deck">
          This page may have moved, been retired, or never existed on the current public surface.
        </p>
        <div className="program-links">
          <a href="/">RETURN TO JCEE LABS <span>→</span></a>
          <a href="/research-evidence">VIEW THE EVIDENCE INDEX <span>→</span></a>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
