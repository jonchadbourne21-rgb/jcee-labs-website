import CoreHeader from "@/components/CoreHeader";
import BrandFooter from "@/components/BrandFooter";
import ProductOverview from "@/components/ProductOverview";
import TechnicalBento from "@/components/TechnicalBento";
import CapabilityCatalog from "@/components/CapabilityCatalog";
import "./home-editorial-refresh.css";

/**
 * Buyer-first homepage: one hero with the three ways to work with us, the
 * capabilities, how it works, who it is for, and one call to action carrying
 * the page's single evidence note.
 */
export default function Home() {
  return (
    <main id="top" className="unified-home customer-home worldlab-home">
      <CoreHeader integrated />
      <ProductOverview />

      <CapabilityCatalog />

      <section
        id="story"
        className="customer-shell customer-section"
        aria-labelledby="story-title"
      >
        <p className="customer-kicker">HOW IT WORKS</p>
        <h2 id="story-title">
          From request to a result
          <br />
          you can check.
        </h2>
        <p className="customer-deck">
          When an automated change crosses several tools, your team should not
          need hours of investigation to learn what happened.
        </p>
        <ol className="customer-steps">
          <li>
            <span>01</span>
            <h3>The request</h3>
            <p>Capture the intended change and the approval it needs.</p>
          </li>
          <li>
            <span>02</span>
            <h3>The work</h3>
            <p>Connect the workflow to your systems with clear permissions.</p>
          </li>
          <li>
            <span>03</span>
            <h3>The result</h3>
            <p>Check the outcome and keep a record your team can review.</p>
          </li>
        </ol>
      </section>

      <section
        id="fit"
        className="customer-shell customer-section"
        aria-labelledby="fit-title"
      >
        <p className="customer-kicker">WHO IT’S FOR</p>
        <h2 id="fit-title">
          For the teams responsible
          <br />
          for getting work done.
        </h2>
        <TechnicalBento />
        <div className="customer-actions">
          <a className="customer-link" href="/solutions/distribution">
            See the distribution example ↗
          </a>
        </div>
      </section>

      <section
        id="consultation"
        className="customer-shell customer-section customer-close"
        aria-labelledby="consultation-title"
      >
        <div>
          <p className="customer-kicker">LET’S BUILD SOMETHING USEFUL</p>
          <h2 id="consultation-title">
            What would you like
            <br />
            your systems to do better?
          </h2>
          <p>
            Tell us what you want to build, connect, or improve. The first
            conversation is free; paid work follows an agreed scope.
          </p>
        </div>
        <div>
          <a className="customer-button" href="/consultation">
            Discuss your workflow ↗
          </a>
          <p id="evidence" className="customer-note customer-evidence-note">
            <span id="evidence-frontier" />
            <span id="current-progress" />
            <span id="technology" />
            Integrations are tested for your workflow before production use.
            Our published tests cover specific configurations.{" "}
            <a href="/registry">See results in the Public Registry ↗</a>
          </p>
        </div>
      </section>
      <div id="company">
        <BrandFooter backToTopHref="#top" />
      </div>
    </main>
  );
}
