import CoreHeader from "@/components/CoreHeader";
import BrandFooter from "@/components/BrandFooter";
import EvidenceTrace from "@/components/EvidenceTrace";
import "./home-editorial-refresh.css";

export default function Home() {
  return (
    <main id="top" className="unified-home customer-home">
      <CoreHeader />
      <section
        id="page-content"
        tabIndex={-1}
        className="customer-shell customer-hero"
        aria-labelledby="hero-title"
      >
        <p className="customer-kicker">JCEE WORLDLAB · JCEE INFRASTRUCTURE</p>
        <div className="customer-hero-grid">
          <div>
            <h1 id="hero-title">
              Put AI to work.
              <br />
              Stay in control.
            </h1>
            <p className="customer-deck">
              Turn customer requests, approvals, and system changes into completed
              work. We help you automate across your existing tools, verify the
              result, and recover when a workflow is interrupted.
            </p>
            <div className="customer-actions">
              <a className="customer-button" href="/consultation">
                Discuss your workflow <span aria-hidden="true">↗</span>
              </a>
              <a className="customer-link" href="/capabilities/infrastructure">
                Explore JCEE Infrastructure ↗
              </a>
            </div>
            <div className="hero-trust" aria-label="Explore the engineering foundation">
              <p>EXPLORE THE ENGINEERING</p>
              <div className="hero-trust-links">
                <a href="/technology#current-integration"><span className="trust-symbol" aria-hidden="true">▱</span><span><strong>PostgreSQL</strong><small>Recorded reference tests</small></span></a>
                <a href="/vow"><span className="trust-symbol" aria-hidden="true">↻</span><span><strong>JCEE VOW</strong><small>Execution &amp; recovery</small></span></a>
                <a href="/registry"><span className="trust-symbol" aria-hidden="true">≡</span><span><strong>Evidence</strong><small>Results &amp; boundaries</small></span></a>
              </div>
            </div>
          </div>
          <figure className="customer-hero-sculpture">
            <img src="/visuals/jcee-authority-hero-v3.webp" width="1344" height="752" fetchPriority="high" alt="Light passes through a glass core in a titanium frame and continues as an ordered trail." />
          </figure>
        </div>
        <p className="hero-footer-signature">Intelligence That Leaves Receipts</p>
      </section>

      <section
        id="story"
        className="customer-shell customer-section"
        aria-labelledby="story-title"
      >
        <p className="customer-kicker">01 / FROM REQUEST TO RESULT</p>
        <h2 id="story-title">
          Your customer asked for a change.
          <br />
          Make sure the job gets done.
        </h2>
        <div className="customer-story-grid">
          <div>
            <p className="customer-deck">
              A customer’s account needs updating. A supplier needs onboarding.
              An approved change needs applying. Your team needs the work
              completed—and a clear record of the result.
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
          <aside
            className="customer-scenario"
            aria-label="Illustrative interrupted workflow"
          >
            <p className="customer-kicker">AN EVERYDAY EXCEPTION</p>
            <h3>The billing request timed out.</h3>
            <p>
              Did the credit happen? Has the subscription changed? Would another
              attempt duplicate the work?
            </p>
            <div className="customer-scenario-result">
              Check the outcome before deciding what happens next.
            </div>
            <small>
              Illustrative scenario, not a customer result or a live payment
              demonstration.
            </small>
          </aside>
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
        <div
          className="customer-record"
          aria-label="Illustrative workflow review record"
        >
          <div className="customer-record-heading">
            <span>WORKFLOW / ACCOUNT CHANGE</span>
            <span>ILLUSTRATIVE RECORD</span>
          </div>
          <dl>
            <div>
              <dt>01 / REQUEST</dt>
              <dd>Change the subscription and apply an approved credit.</dd>
            </div>
            <div>
              <dt>02 / OBSERVATION</dt>
              <dd>The billing response timed out. The outcome is unknown.</dd>
            </div>
            <div>
              <dt>03 / NEXT DECISION</dt>
              <dd>
                Inspect the billing record before approving another attempt.
              </dd>
            </div>
          </dl>
          <p>
            A designed example of the questions to resolve—not a live system or
            customer receipt.
          </p>
        </div>
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
        <p className="customer-kicker">02 / BUILT AROUND YOUR WORK</p>
        <h2 id="fit-title">
          Automate more of the work
          <br />
          your team handles every day.
        </h2>
        <div className="customer-cards">
          <article>
            <span>01 / CUSTOMER OPERATIONS</span>
            <h3>Keep requests moving.</h3>
            <p>
              Account updates, service requests, and approved changes across
              support and business systems.
            </p>
            <p className="customer-card-detail">
              Start with: an account change that crosses support and billing.
            </p>
          </article>
          <article>
            <span>02 / SOFTWARE OPERATIONS</span>
            <h3>Make changes accountable.</h3>
            <p>
              Engineering workflows that need clear permissions, execution
              records, and recovery procedures.
            </p>
            <p className="customer-card-detail">
              Start with: a deployment that needs an approval and a confirmed
              result.
            </p>
          </article>
          <article>
            <span>03 / BUSINESS OPERATIONS</span>
            <h3>Connect the process.</h3>
            <p>
              Internal requests and approval processes that cross multiple
              applications.
            </p>
            <p className="customer-card-detail">
              Start with: an internal request passed between teams and tools.
            </p>
          </article>
        </div>
        <p className="customer-note">
          Example engagement areas. Each workflow begins with an assessment of
          the existing systems and requirements.
        </p>
      </section>

      <section
        id="services"
        className="customer-shell customer-section"
        aria-labelledby="services-title"
      >
        <span id="engage" />
        <p className="customer-kicker">03 / A PRACTICAL FIRST ENGAGEMENT</p>
        <h2 id="services-title">
          Start with one workflow
          <br />
          worth improving.
        </h2>
        <p className="customer-deck">
          Bring us a process that is slow, difficult to automate, or expensive
          to investigate when something goes wrong.
        </p>
        <div className="customer-offer">
          <div>
            <h3>Workflow Assurance</h3>
            <p>
              We assess your existing systems, identify the controls the
              workflow needs, and scope the engineering and testing required to
              move it forward.
            </p>
            <a
              className="customer-link"
              href="/capabilities/infrastructure#deliverables"
            >
              Explore the assessment ↗
            </a>
          </div>
          <ul>
            <li>Written boundary map and integration requirements</li>
            <li>
              A test plan for interruptions, changed permissions, and uncertain
              outcomes
            </li>
            <li>Written findings and acceptance criteria for the next step</li>
            <li>A clear recommendation and delivery plan</li>
          </ul>
        </div>
        <p className="customer-note">
          Paid work and production changes require their own written scope and
          authorization.
        </p>
      </section>

      <section
        id="evidence"
        className="customer-shell customer-section"
        aria-labelledby="evidence-title"
      >
        <span id="evidence-frontier" />
        <span id="current-progress" />
        <span id="technology" />
        <p className="customer-kicker">04 / ENGINEERING YOU CAN EXAMINE</p>
        <h2 id="evidence-title">See the work behind the promise.</h2>
        <p className="customer-deck">
          Explore our recorded software results, execution and recovery
          mechanisms, and the boundaries of each test.
        </p>
        <p>
          JCEE Infrastructure is in development. Recorded tests use defined
          configurations and fictional data. Production readiness, customer
          savings, and payment safety have not been established by those
          results.
        </p>
        <div className="customer-actions">
          <a className="customer-button" href="/technology#current-integration">
            Explore our engineering evidence ↗
          </a>
          <a className="customer-link" href="/registry">
            PUBLIC REGISTRY ↗
          </a>
        </div>
        <div className="customer-cards customer-proof">
          <article>
            <span>RECORDED SOFTWARE BEHAVIOR</span>
            <h3>Recovery after a lost response.</h3>
            <p>
              Read the October 19 qualification: an existing effect was
              reconciled in the declared test setting.
            </p>
            <a
              className="customer-link"
              href="/registry#infra-integrated-software"
            >
              Result and limits ↗
            </a>
          </article>
          <article>
            <span>EXPLAINED STEP BY STEP</span>
            <h3>Follow a request to its record.</h3>
            <p>
              Explore the browser illustration below, including held and
              uncertain outcomes.
            </p>
            <a className="customer-link" href="#working-example">
              Explore the illustration ↓
            </a>
          </article>
          <article>
            <span>START WITH YOUR SYSTEMS</span>
            <h3>Define what a useful test proves.</h3>
            <p>
              The assessment turns your workflow into a map, findings, and a
              scoped next step.
            </p>
            <a className="customer-link" href="/capabilities/infrastructure">
              See the engagement ↗
            </a>
          </article>
        </div>
        <div className="customer-evidence-links">
          <a href="/technology#infrastructure-build">
            Infrastructure overview ↗
          </a>
          <a href="/vow">VOW / execution &amp; recovery ↗</a>
          <a href="/qcs">QCS / authority research ↗</a>
          <a href="/assurance">JCEE Assurance ↗</a>
          <a href="/research/evidence-standards#evidence-ladder">
            Evidence standards ↗
          </a>
          <a href="/research/physical-experiments#physical-validation">
            Physical research ↗
          </a>
        </div>
        <details className="customer-demo" id="working-example">
          <summary>Explore an illustrative request-to-record workflow</summary>
          <p>
            This browser illustration performs no external action, runs no VOW
            engine, and creates no qualification receipt. It uses fictional
            order data to explain the control pattern.
          </p>
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
            05 / LET’S MAKE THE NEXT STEP USEFUL
          </p>
          <h2 id="consultation-title">
            What do you want
            <br />
            to automate?
          </h2>
          <p>
            Tell us about the workflow, the systems involved, and what needs to
            work better. Start with a non-confidential summary.
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
