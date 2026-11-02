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
              Bring AI into the workflows your business depends on. We help your
              team connect systems, define what automation can do, and verify
              the results.
            </p>
            <div className="customer-actions">
              <a className="customer-button" href="/consultation">
                Discuss your workflow <span aria-hidden="true">↗</span>
              </a>
              <a className="customer-link" href="#story">
                Explore JCEE Infrastructure ↓
              </a>
            </div>
            <p className="customer-signature">
              Intelligence That Leaves Receipts.
            </p>
          </div>
          <figure className="et-hero-art">
            <svg viewBox="0 0 600 510" fill="none" aria-hidden="true">
              <defs>
                <linearGradient
                  id="et-thread"
                  x1="100"
                  y1="400"
                  x2="480"
                  y2="90"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#1236BD"></stop>
                  <stop offset=".48" stopColor="#3568FF"></stop>
                  <stop offset="1" stopColor="#97B9FF"></stop>
                </linearGradient>
                <linearGradient
                  id="et-boundary"
                  x1="270"
                  y1="70"
                  x2="410"
                  y2="410"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#E8ECF2"></stop>
                  <stop offset="1" stopColor="#F7F8FA"></stop>
                </linearGradient>
                <filter id="et-shadow">
                  <feGaussianBlur stdDeviation="12"></feGaussianBlur>
                </filter>
              </defs>
              <ellipse
                cx="310"
                cy="449"
                rx="170"
                ry="17"
                fill="#1C45A0"
                opacity=".09"
                filter="url(#et-shadow)"
              ></ellipse>
              <path
                d="M70 374L298 506M52 286L396 485M52 194L493 449M92 125L546 387M176 81L557 301M255 37L555 210M76 404L486 167M76 310L408 118M81 216L327 74M168 449L549 229M249 496L556 319"
                stroke="#dfe2e3"
                strokeWidth="1"
              ></path>
              <path
                d="M269 80L414 164V381L269 297V80Z"
                fill="url(#et-boundary)"
                stroke="#CDD5E2"
              ></path>
              <path
                d="M269 80L285 71L430 155L414 164L269 80Z"
                fill="#FFF"
                stroke="#DCE1E9"
              ></path>
              <path d="M414 164L430 155V372L414 381V164Z" fill="#D9E0EB"></path>
              <path
                d="M54 339L143 288Q161 277 181 288L251 328Q273 341 296 328L345 300Q365 288 365 265V206Q365 184 385 172L455 132Q475 121 496 133L555 167"
                stroke="#E9EEFA"
                strokeWidth="29"
                strokeLinecap="round"
              ></path>
              <path
                className="et-et-flow-line"
                d="M54 339L143 288Q161 277 181 288L251 328Q273 341 296 328L345 300Q365 288 365 265V206Q365 184 385 172L455 132Q475 121 496 133L555 167"
                stroke="url(#et-thread)"
                strokeWidth="14"
                strokeLinecap="round"
              ></path>
              <path
                d="M274 165V251M286 172V258M298 179V265M310 186V272"
                stroke="#C7CFDD"
              ></path>
              <circle
                cx="65"
                cy="333"
                r="12"
                fill="#F8FAFF"
                stroke="#315CFF"
                strokeWidth="4"
              ></circle>
              <circle
                cx="365"
                cy="233"
                r="10"
                fill="#F8FAFF"
                stroke="#315CFF"
                strokeWidth="4"
              ></circle>
              <circle cx="546" cy="162" r="12" fill="#315CFF"></circle>
              <path
                d="M541 162L545 166L551 158"
                stroke="white"
                strokeWidth="2"
              ></path>
              <g
                fill="#6A7484"
                fontFamily="ui-monospace, monospace"
                fontSize="11"
                letterSpacing="1.2"
              >
                <text x="34" y="381">
                  REQUEST
                </text>
                <text x="314" y="418">
                  AUTHORITY
                </text>
                <text x="470" y="106">
                  RECORD
                </text>
              </g>
              <path
                d="M325 390L342 380M89 359L107 348M489 118L504 126"
                stroke="#A8B3C4"
              ></path>
            </svg>
            <figcaption>
              <span className="et-mono">REQUEST → AUTHORITY → RECORD</span>
              <span>Intelligence that leaves receipts.</span>
            </figcaption>
          </figure>
        </div>
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
              A subscription changes. A credit is approved. A support ticket
              needs closing.
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
          </article>
          <article>
            <span>02 / SOFTWARE OPERATIONS</span>
            <h3>Make changes accountable.</h3>
            <p>
              Engineering workflows that need clear permissions, execution
              records, and recovery procedures.
            </p>
          </article>
          <article>
            <span>03 / BUSINESS OPERATIONS</span>
            <h3>Connect the process.</h3>
            <p>
              Internal requests and approval processes that cross multiple
              applications.
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
            <a className="customer-link" href="/partners/enterprise">
              Explore the assessment ↗
            </a>
          </div>
          <ul>
            <li>Written boundary map and integration requirements</li>
            <li>
              Tests for interruptions, current permissions, and uncertain
              outcomes
            </li>
            <li>A reviewable target-system result and recovery record</li>
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
