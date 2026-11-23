import CoreHeader from "@/components/CoreHeader";
import BrandFooter from "@/components/BrandFooter";
import ProductOverview from "@/components/ProductOverview";
import TechnicalBento from "@/components/TechnicalBento";
import EvidenceTrace from "@/components/EvidenceTrace";
import DeferredEvidenceCore from "@/components/DeferredEvidenceCore";
import CapabilityCatalog from "@/components/CapabilityCatalog";
import "./home-editorial-refresh.css";

export default function Home() {
  return (
    <main id="top" className="unified-home customer-home worldlab-home">
      <CoreHeader integrated contactLabel="Let’s talk" />
      <ProductOverview />
      <section
        id="orbital-study"
        tabIndex={-1}
        className="customer-shell customer-hero"
        aria-labelledby="hero-title"
      >
        <p className="customer-kicker wl-hero-kicker"><i aria-hidden="true" /> 02 / CONTROL THAT SERVES YOUR BUSINESS</p>
        <div className="customer-hero-grid">
          <div className="wl-hero-copy">
            <h2 id="hero-title">
              Intelligence
              <br />
              that leaves
              <br />
              <span className="wl-receipt-word">receipts<span className="wl-period">.</span></span>
            </h2>
            <p className="customer-deck">
              Keep approvals, actions, and outcomes connected. Give your team
              a clear answer when a workflow pauses, a system times out,
              or someone asks what changed.
            </p>
          </div>
          <DeferredEvidenceCore />
          <nav className="hero-trust" aria-label="Explore workflow solutions">
            <p>BUILT INTO YOUR WORKFLOW</p>
            <div className="hero-trust-links">
              <a href="/solutions#build"><span className="trust-symbol" aria-hidden="true">▱</span><span><strong>Clear permissions</strong><small>Define who can do what</small></span></a>
              <a href="/solutions#workflows"><span className="trust-symbol" aria-hidden="true">↻</span><span><strong>Controlled recovery</strong><small>Resolve interrupted work</small></span></a>
              <a href="/solutions#build"><span className="trust-symbol" aria-hidden="true">≡</span><span><strong>Reviewable records</strong><small>Know what happened</small></span></a>
            </div>
          </nav>
        </div>
        <div className="wl-hero-baseline"><span>PERMISSION. ACTION. A RECORD YOU CAN REVIEW.</span></div>
      </section>

      <CapabilityCatalog />

      <section
        id="story"
        className="customer-shell customer-section"
        aria-labelledby="story-title"
      >
        <p className="customer-kicker">03 / FROM REQUEST TO RESULT</p>
        <h2 id="story-title">
          An approved request. An uncertain result.
          <br />
          Know what happened next.
        </h2>
        <div className="customer-story-grid">
          <div>
            <p className="customer-deck">
              For distribution, operations, and IT teams: when an automated
              change crosses several tools, finding out what happened should
              not require hours of investigation.
            </p>
            <p>
              Your AI can coordinate the work. Your business still needs a clear
              answer about what happened—especially when a system stops
              responding halfway through.
            </p>
            <p>
              JCEE WorldLab helps you engineer that workflow from request to
              verified outcome.
            </p>
          </div>
        </div>
        <ol className="customer-steps">
          <li>
            <span>01</span>
            <h3>The request</h3>
            <p>Capture the intended change and required approval.</p>
          </li>
          <li>
            <span>02</span>
            <h3>The work</h3>
            <p>
              Connect the workflow to your systems with defined permissions.
            </p>
          </li>
          <li>
            <span>03</span>
            <h3>The result</h3>
            <p>Check the outcome and preserve a record your team can review.</p>
          </li>
        </ol>
        <p className="customer-note">
          Integrations and supported controls are scoped and tested against your
          systems.
        </p>
      </section>

      <section
        id="fit"
        className="customer-shell customer-section"
        aria-labelledby="fit-title"
      >
        <p className="customer-kicker">04 / BUILT AROUND YOUR WORK</p>
        <h2 id="fit-title">
          For the teams responsible
          <br />
          for getting work done.
        </h2>
        <TechnicalBento />
        <p className="customer-note">
          Order review, connected business applications, and controlled IT changes.
          We scope the solution around your systems and the people who use them.
        </p>
      </section>

      <section
        id="services"
        className="customer-shell customer-section"
        aria-labelledby="services-title"
      >
        <span id="engage" />
        <p className="customer-kicker">05 / BUILD WITH US</p>
        <h2 id="services-title">
          Start with one workflow
          <br />
          worth improving.
        </h2>
        <p className="customer-deck">
          Bring us one workflow that is expensive to investigate when a
          change fails, times out, or leaves an uncertain result.
        </p>
        <div className="customer-offer">
          <div>
            <h3>From a practical first step to a working solution</h3>
            <p>
              Start with a Workflow Assurance Assessment, commission a custom
              build, or shape a pilot as a design partner. We agree what
              success looks like, build around your existing systems, and
              test the result with your team.
            </p>
            <a
              className="customer-link"
              href="/solutions"
            >
              Compare ways to work with us ↗
            </a>
          </div>
          <ul>
            <li>Assessment: a workflow map and prioritized remediation plan</li>
            <li>
              Implementation: custom software, connected systems, and tests
            </li>
            <li>Design partnership: a focused pilot with agreed success measures</li>
            <li>Handoff: documentation and a scoped deployment or support plan</li>
          </ul>
        </div>
        <p className="customer-note">
          Paid work and production changes require their own written scope and
          authorization.
        </p>
      </section>

      <section id="partnership" className="customer-shell customer-section" aria-labelledby="partner-title">
        <p className="customer-kicker">06 / DESIGN PARTNERSHIPS</p>
        <h2 id="partner-title">Bring the problem.<br />Build the next step with us.</h2>
        <p className="customer-deck">Help shape software around a workflow your team knows inside out. We’re inviting operations and IT teams to work with us on focused, measurable pilots.</p>
        <div className="customer-offer">
          <div><h3>See what a pilot can show.</h3><p>Where suitable, begin in shadow mode alongside your existing process. Review discrepancies and records before deciding whether to introduce live controls.</p><a className="customer-link" href="/solutions#design-partners">Explore design partner access ↗</a></div>
          <ul><li>One workflow and agreed data access</li><li>A defined pilot deliverable and success measures</li><li>Direct collaboration on the next useful improvement</li><li>A joint review before any production rollout</li></ul>
        </div>
      </section>
      <section id="evidence" className="customer-shell customer-section" aria-labelledby="evidence-title">
        <span id="evidence-frontier" /><span id="current-progress" /><span id="technology" />
        <p className="customer-kicker">07 / CONFIDENCE IN THE WORK</p>
        <h2 id="evidence-title">Clear scope. Tested behavior. A useful handoff.</h2>
        <p className="customer-deck">We use existing software for permission checks, recovery, order comparison, and action records. Each engagement defines the integrations and acceptance tests needed for your workflow.</p>
        <p>JCEE Infrastructure continues to develop. Recorded tests demonstrate specific configurations; they do not establish readiness for every customer system.</p>
        <div className="customer-actions"><a className="customer-link" href="/technology#current-integration">See the engineering behind our work ↗</a><a className="customer-link" href="/registry">PUBLIC REGISTRY ↗</a></div>
        <details className="customer-demo" id="working-example">
          <summary>See how a request becomes a reviewable record</summary>
          <p>This browser illustration uses fictional order data. It performs no external action and creates no qualification receipt.</p>
          <EvidenceTrace />
        </details>
      </section>

      <section
        id="consultation"
        className="customer-shell customer-section customer-close"
        aria-labelledby="consultation-title"
      >
        <div>
          <p className="customer-kicker">
            08 / LET’S BUILD SOMETHING USEFUL
          </p>
          <h2 id="consultation-title">
            What would you like
            <br />
            your systems to do better?
          </h2>
          <p>
            Tell us what you want to build, connect, or improve. We’ll discuss
            an assessment, implementation, or partnership that fits.
            Start with a non-confidential summary.
          </p>
        </div>
        <div>
          <a className="customer-button" href="/consultation">
            Tell us about your workflow ↗
          </a>
          <p className="customer-note">
            A free first conversation. Paid work follows an agreed scope.
          </p>
        </div>
      </section>
      <div id="company">
        <BrandFooter backToTopHref="#top" />
      </div>
    </main>
  );
}
