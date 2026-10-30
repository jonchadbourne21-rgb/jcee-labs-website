import CoreHeader from "@/components/CoreHeader";
import BrandFooter from "@/components/BrandFooter";
import EvidenceTrace from "@/components/EvidenceTrace";
import "./home-editorial-refresh.css";

/** The approved evidence-thread design, rendered as native React for every delivery target. */
export default function Home() {
  return (
    <main id="top" className="unified-home jcee-home-refresh">
      <CoreHeader />
      <section
        className="et-hero et-section-shell"
        id="page-content"
        tabIndex={-1}
        aria-labelledby="hero-title"
      >
        <div className="et-hero-topline">
          <p className="et-eyebrow">
            <span className="et-signal-dot"></span> ADVANCED TECHNOLOGY &amp;
            ENGINEERING
          </p>
          <span className="et-hero-location et-mono">DALLAS, TEXAS / JCEE LABS</span>
        </div>
        <div className="et-hero-layout">
          <div className="et-hero-copy">
            <h1 id="hero-title">
              Build what comes next.
              <br />
              <span>Prove what holds.</span>
            </h1>
            <p className="et-hero-deck">
              JCEE Labs invents and engineers advanced technologies. We design, build, and test AI-assisted software for work that
              needs clear permission, reliable recovery, and an inspectable
              record.
            </p>
            <div className="et-hero-actions">
              <a className="et-button" href="/consultation">
                Discuss your workflow <span aria-hidden="true">↗</span>
              </a>
              <a className="et-text-link" href="#working-example">
                Explore the example <span aria-hidden="true">↓</span>
              </a>
            </div>
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
        <div className="et-hero-bottom">
          <p>
            For inventors, product teams, and organizations.
            <br />
            <strong>From first question to testable system.</strong>
          </p>
          <div>
            <span className="et-mono">DESIGN</span>
            <i aria-hidden="true"></i>
            <span className="et-mono">BUILD</span>
            <i aria-hidden="true"></i>
            <span className="et-mono">VERIFY</span>
          </div>
          <a href="#story" aria-label="Discover how JCEE works">
            Scroll to follow the thread <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section className="jcee-capability-panel et-section-shell" id="capabilities" aria-labelledby="capabilities-title">
        <div className="jcee-capability-heading">
          <p className="et-eyebrow">WHERE ENGINEERING MEETS EVIDENCE</p>
          <h2 id="capabilities-title">Distinct work. One engineering standard.</h2>
          <p>We invent and build advanced technologies. Assurance and verification are our first commercial focus—not the limits of the company.</p>
        </div>
        <div className="jcee-capability-grid">
          <a href="/capabilities/infrastructure" className="jcee-capability-card">
            <span className="jcee-capability-index">01 / INTELLIGENT SYSTEMS</span>
            <h3>Infrastructure &amp; Runtime Systems</h3>
            <p>Software for reliable actions, recovery, and integration across operational workflows.</p>
            <span className="jcee-capability-arrow">Explore infrastructure ↗</span>
          </a>
          <a href="/capabilities/assurance" className="jcee-capability-card">
            <span className="jcee-capability-index">02 / ASSURANCE &amp; EVIDENCE</span>
            <h3>Software &amp; Consequence Assurance</h3>
            <p>Inspectable authority, outcome reconciliation, and bounded technical verification.</p>
            <span className="jcee-capability-arrow">Explore assurance ↗</span>
          </a>
          <a href="/capabilities/technology-validation" className="jcee-capability-card">
            <span className="jcee-capability-index">03 / SCIENTIFIC &amp; ENGINEERING R&amp;D</span>
            <h3>Technology Validation &amp; Engineering</h3>
            <p>Scientific assessment, experimental verification, and R&amp;D implementation support.</p>
            <span className="jcee-capability-arrow">Explore validation ↗</span>
          </a>
        </div>
      </section>

      <div
        id="transition-story"
        className="et-chapter-bridge bridge-story"
        aria-label="Introducing: the question"
      >
        <div className="et-bridge-inner">
          <span className="et-bridge-index et-mono">01 / UP NEXT</span>
          <div className="et-bridge-copy">
            <span className="et-eyebrow">THE QUESTION</span>
            <p>An instruction becomes an action.</p>
            <small>Can your team tell who approved the change?</small>
          </div>
          <img
            className="et-bridge-art"
            src="/landing/illustrations/story-v2.webp"
            alt="A customer order passes an approval gate before shipment."
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
          <a href="#story" aria-label="Continue to the question">
            ↓
          </a>
        </div>
      </div>
      <section
        className="et-story et-section-shell et-chapter"
        id="story"
        aria-labelledby="story-title"
      >
        <div className="et-section-label">
          <span className="et-eyebrow">01 / THE PROBLEM WE WORK ON</span>
          <span className="et-mono">A REQUEST IS ONLY THE BEGINNING</span>
        </div>
        <div className="et-section-heading">
          <h2 id="story-title">
            “Done” should come
            <br />
            with a record.
          </h2>
          <div>
            <p className="et-lead">
              An AI recommendation can become an approval, an order, or a change
              in another system. The hard part is knowing whether the action was
              permitted—and what actually happened.
            </p>
            <p>
              We connect the instruction, supporting evidence, current
              authority, target-system result, and recovery record. People keep
              responsibility. Uncertainty stays visible.
            </p>
          </div>
        </div>
        <ol className="et-method-steps" aria-label="The JCEE Assurance Method">
          <li>
            <span className="et-step-index et-mono">01</span>
            <h3>Observe</h3>
            <p>
              Preserve the source request and what the system actually measured.
            </p>
          </li>
          <li>
            <span className="et-step-index et-mono">02</span>
            <h3>Judge</h3>
            <p>
              Compare the evidence with the claim. Expose conflicts and missing
              information.
            </p>
          </li>
          <li>
            <span className="et-step-index et-mono">03</span>
            <h3>Authorize</h3>
            <p>
              Check current permission at the action boundary owned by the
              target system.
            </p>
          </li>
          <li>
            <span className="et-step-index et-mono">04</span>
            <h3>Record</h3>
            <p>
              Reconcile the outcome. Retain what changed, what did not, and what
              remains unknown.
            </p>
          </li>
        </ol>
        <div className="et-section-foot">
          <p>
            Interruption belongs in the design. Recovery begins by checking the
            outcome before another attempt.
          </p>
          <a className="et-text-link" href="/assurance">
            Explore the assurance method <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <div
        id="transition-services"
        className="et-chapter-bridge et-bridge-services"
        aria-label="Introducing: the work"
      >
        <div className="et-bridge-inner">
          <span className="et-bridge-index et-mono">02 / UP NEXT</span>
          <div className="et-bridge-copy">
            <span className="et-eyebrow">THE WORK</span>
            <p>A clear plan for the work ahead.</p>
            <small>Plan it. Build it. Test what it actually does.</small>
          </div>
          <img
            className="et-bridge-art"
            src="/landing/illustrations/services-v2.webp"
            alt="A blueprint, modular system, and inspection lens represent planning, building, and testing."
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
          <a href="#services" aria-label="Continue to the work">
            ↓
          </a>
        </div>
      </div>
      <section
        className="et-services et-section-shell et-chapter"
        id="services"
        aria-labelledby="services-title"
      >
        <span id="engage" className="et-anchor-alias" aria-hidden="true"></span>
        <div className="et-section-label">
          <span className="et-eyebrow">02 / WHAT WE OFFER</span>
          <span className="et-mono">DISCOVERY → ENGINEERING → EVIDENCE</span>
        </div>
        <div className="et-section-heading">
          <h2 id="services-title">
            <span id="engage-title" aria-hidden="true"></span>Bring the problem.
            <br />
            We scope the work.
          </h2>
          <p className="et-lead">
            Technical services for teams building something new, improving an
            existing process, or testing whether a system deserves more
            responsibility.
          </p>
        </div>
        <div className="service-list">
          <article className="et-service-row">
            <span className="et-mono et-service-number">01</span>
            <h3>
              Workflow Assurance
              <br /> Assessment
            </h3>
            <div>
              <p>
                Map one consequential workflow, its handoffs, current
                permissions, and recovery gaps.
              </p>
              <span className="et-service-output">
                OUTPUT / Written boundary map, findings, and next justified
                test.
              </span>
            </div>
            <a
              href="/partners/enterprise"
              aria-label="Discuss a Workflow Assurance Assessment"
            >
              <span aria-hidden="true">↗</span>
            </a>
          </article>
          <article className="et-service-row">
            <span className="et-mono et-service-number">02</span>
            <h3>
              AI &amp; systems
              <br /> architecture
            </h3>
            <div>
              <p>
                Shape the system around the real operating problem, from
                AI-assisted decisions to the boundaries between existing tools.
              </p>
              <span className="et-service-output">
                SCOPE / Discovery, systems analysis, architecture, engineering
                design.
              </span>
            </div>
            <a
              href="/consultation"
              aria-label="Discuss AI and systems architecture"
            >
              <span aria-hidden="true">↗</span>
            </a>
          </article>
          <article className="et-service-row">
            <span className="et-mono et-service-number">03</span>
            <h3>
              Application
              <br /> engineering
            </h3>
            <div>
              <p>
                Develop custom applications and prototypes with a clear path
                from user need to observable behavior.
              </p>
              <span className="et-service-output">
                SCOPE / Web applications, custom software, iOS and mobile
                development.
              </span>
            </div>
            <a
              href="/consultation"
              aria-label="Discuss application engineering"
            >
              <span aria-hidden="true">↗</span>
            </a>
          </article>
          <article className="et-service-row">
            <span className="et-mono et-service-number">04</span>
            <h3>
              Testing &amp; technical
              <br /> research
            </h3>
            <div>
              <p>
                Challenge a claim, reproduce a result, and document the evidence
                another reviewer needs to inspect it.
              </p>
              <span className="et-service-output">
                SCOPE / Verification, research, documentation; independent
                review scoped separately.
              </span>
            </div>
            <a
              href="/consultation"
              aria-label="Discuss testing and technical research"
            >
              <span aria-hidden="true">↗</span>
            </a>
          </article>
        </div>
        <p className="et-section-note">
          Every engagement starts with agreed deliverables, access, exclusions,
          timing, and terms. Implementation and production changes require their
          own written scope and authorization.
        </p>
      </section>

      <div
        id="transition-fit"
        className="et-chapter-bridge et-bridge-fit"
        aria-label="Introducing: the people"
      >
        <div className="et-bridge-inner">
          <span className="et-bridge-index et-mono">03 / UP NEXT</span>
          <div className="et-bridge-copy">
            <span className="et-eyebrow">THE PEOPLE</span>
            <p>Software serves people doing real work.</p>
            <small>
              For the people running, building, and checking the work.
            </small>
          </div>
          <img
            className="et-bridge-art"
            src="/landing/illustrations/fit-v2.webp"
            alt="Concept illustration of operations, engineering, and review professionals collaborating."
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
          <a href="#fit" aria-label="Continue to the people">
            ↓
          </a>
        </div>
      </div>
      <section
        className="et-audience et-section-shell et-chapter"
        id="fit"
        aria-labelledby="fit-title"
      >
        <div className="et-section-label">
          <span className="et-eyebrow">03 / WHO WE SERVE</span>
          <span className="et-mono">REAL WORK. ACCOUNTABLE PEOPLE.</span>
        </div>
        <div className="et-section-heading">
          <h2 id="fit-title">
            <span id="who-this-is-for" aria-hidden="true"></span>For the teams
            <br />
            behind the outcome.
          </h2>
          <div>
            <p className="et-lead">
              Our intended customers are businesses building AI-assisted
              products or running workflows across people and software.
            </p>
            <p>
              Industrial distribution is our first industry focus. The wider fit
              is defined by the problem: changing permissions, uncertain
              completion, and records that need to stand up to review.
            </p>
          </div>
        </div>
        <dl className="et-audience-list">
          <div>
            <dt>Operations &amp; distribution</dt>
            <dd>
              Orders, approvals, back-office handoffs, and exceptions that still
              need repeated manual checking.
            </dd>
          </div>
          <div>
            <dt>Product &amp; engineering</dt>
            <dd>
              Founders and technical teams turning an AI-assisted idea into a
              defined, testable application.
            </dd>
          </div>
          <div>
            <dt>Platform, security &amp; risk</dt>
            <dd>
              Teams examining retries, partial completion, changing authority,
              and the evidence left across systems.
            </dd>
          </div>
          <div>
            <dt>Research collaborators</dt>
            <dd>
              Partners with a technical claim, a reproduction question, or an
              experiment that needs a clear evidence boundary.
            </dd>
          </div>
        </dl>
        <div className="et-section-foot">
          <p>
            Start with one workflow, one accountable owner, and one outcome we
            can inspect.
          </p>
          <a className="et-text-link" href="/partners">
            Explore working together <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <div
        id="transition-working-example"
        className="et-chapter-bridge et-bridge-working-example"
        aria-label="Introducing: the challenge"
      >
        <div className="et-bridge-inner">
          <span className="et-bridge-index et-mono">04 / UP NEXT</span>
          <div className="et-bridge-copy">
            <span className="et-eyebrow">THE CHALLENGE</span>
            <p>What happens when the situation changes?</p>
            <small>
              Try an order approval, a cancellation, or a missing response.
            </small>
          </div>
          <img
            className="et-bridge-art"
            src="/landing/illustrations/working-example-v2.webp"
            alt="An order reaches two routes: an approved path and a held path."
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
          <a href="#working-example" aria-label="Continue to the challenge">
            ↓
          </a>
        </div>
      </div>
      <section
        className="et-example et-chapter"
        id="working-example"
        aria-labelledby="example-title"
      >
        <div className="et-section-shell">
          <div className="et-section-label">
            <span className="et-eyebrow">04 / FOLLOW THE EVIDENCE</span>
            <span className="et-mono">FICTIONAL DATA · BROWSER ILLUSTRATION</span>
          </div>
          <div className="et-section-heading">
            <h2 id="example-title">
              <span id="working-example-title" aria-hidden="true"></span>One
              request.
              <br />
              Four possible outcomes.
            </h2>
            <p className="et-lead">
              An operations team asks its software to release order SO-1042.
              Change the conditions and inspect the records that matter.
            </p>
          </div>
          <EvidenceTrace />
          <div className="et-example-boundary">
            <p>
              This interactive example models the control pattern. It performs
              no external action, runs no VOW engine, and creates no
              qualification receipt.
            </p>
            <a className="et-text-link" href="/technology#current-integration">
              Inspect the recorded software result{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <noscript>
            <p>
              The interactive scenarios require JavaScript. The recorded
              qualification and its limits are available through the link above.
            </p>
          </noscript>
        </div>
      </section>

      <div
        id="transition-evidence"
        className="et-chapter-bridge et-bridge-evidence"
        aria-label="Introducing: the record"
      >
        <div className="et-bridge-inner">
          <span className="et-bridge-index et-mono">05 / UP NEXT</span>
          <div className="et-bridge-copy">
            <span className="et-eyebrow">THE RECORD</span>
            <p>Show what happened. Keep the receipt.</p>
            <small>
              See the recorded results and what still needs testing.
            </small>
          </div>
          <img
            className="et-bridge-art"
            src="/landing/illustrations/evidence-v2.webp"
            alt="Layered records and a receipt represent an inspectable history of work."
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
          <a href="#evidence" aria-label="Continue to the record">
            ↓
          </a>
        </div>
      </div>
      <section
        className="et-evidence et-section-shell et-chapter"
        id="evidence"
        aria-labelledby="evidence-title"
      >
        <span
          id="current-progress"
          className="et-anchor-alias"
          aria-hidden="true"
        ></span>
        <span
          id="evidence-frontier"
          className="et-anchor-alias"
          aria-hidden="true"
        ></span>
        <div className="et-section-label">
          <span className="et-eyebrow">
            05 / OUR CLAIMS, WITH THEIR BOUNDARIES
          </span>
          <a className="et-mono" href="/registry">
            PUBLIC REGISTRY <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="et-section-heading">
          <h2 id="evidence-title">
            <span id="current-progress-title" aria-hidden="true"></span>The
            claim follows
            <br />
            the evidence.
          </h2>
          <p className="et-lead">
            Implemented software, synthetic tests, and platform ambitions carry
            different claims. Here is what the published record supports.
          </p>
        </div>
        <div className="et-evidence-record" id="technology">
          <div className="et-record-label">
            <span className="et-status-dot" aria-hidden="true"></span>
            <span className="et-eyebrow">RECORDED SOFTWARE RESULT</span>
            <time className="et-mono" dateTime="2026-10-19">
              OCT 19, 2026
            </time>
          </div>
          <div className="et-record-content">
            <h3>
              <span id="technology-title" aria-hidden="true"></span>Connected
              software.
              <br />
              Bounded qualification.
            </h3>
            <div>
              <p>
                The JCEE-INFRA candidate connects evidence, current authority,
                target-owned action controls, and recovery. In the tested
                PostgreSQL ledger with fictional data, authorized controls
                completed; a committed effect was reconciled without
                duplication; an uncertain outcome remained held.
              </p>
              <p className="et-evidence-limit">
                Scope: one qualified configuration, trusted installed services,
                and a separately protected checkpoint. Deployment admission,
                independent human review, physical A4/E003 commitment, native
                C09, and P3 completion remain open. The payment consequence lane
                remains unqualified.
              </p>
              <div className="et-inline-links">
                <a className="et-text-link" href="/technology#current-integration">
                  Read the qualification <span aria-hidden="true">↗</span>
                </a>
                <a
                  className="et-text-link"
                  href="/JCEE_INFRA_Software_Qualification_2026-10-19.md"
                >
                  Source summary <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="et-evidence-record" id="distribution-demo">
          <div className="et-record-label">
            <span className="et-status-dot et-gray" aria-hidden="true"></span>
            <span className="et-eyebrow">SYNTHETIC REFERENCE WORKFLOW</span>
            <time className="et-mono" dateTime="2026-09-14">
              SEP 14, 2026
            </time>
          </div>
          <div className="et-record-content">
            <h3>
              <span id="distribution-demo-title" aria-hidden="true"></span>JCEE
              Distribution.
              <br />
              One concrete application.
            </h3>
            <div>
              <p>
                A purchase order is compared with the entered sales order. A
                mismatch is surfaced for a person to investigate; the
                discrepancy itself grants no authority to change the order.
              </p>
              <p className="et-evidence-limit">
                The recorded dry run matched expected classifications in 20 of
                20 synthetic cases across four result categories, with zero
                external effects. Customer ROI, live integration, and production
                readiness remain unestablished.
              </p>
              <a className="et-text-link" href="/blog/distribution-first-dry-run">
                Read the dry-run record <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
        <div className="et-claim-boundary">
          <span className="et-eyebrow">THE CURRENT BOUNDARY</span>
          <p>
            These results support the tested mechanics within their stated
            conditions. Customer savings, production performance, independent
            certification, and autonomous operating authority have not been
            established.
          </p>
          <a
            className="et-text-link"
            href="/research/evidence-standards#evidence-ladder"
          >
            See the evidence ladder <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="et-direction-row" id="operating-cloud">
          <span className="et-eyebrow">PLATFORM DIRECTION</span>
          <p>
            <strong id="operating-cloud-title">JCEE Operating Cloud</strong> is
            the longer-term direction for a reusable assurance and execution
            architecture. It remains in development; broader workflow ownership
            must be demonstrated.
          </p>
          <a className="et-text-link" href="/operating-cloud">
            Explore the direction <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="et-technology-links">
          <span className="et-mono" id="progress-title">
            EXPLORE THE MECHANISMS
          </span>
          <a href="/technology#infrastructure-build">
            Infrastructure overview ↗
          </a>
          <a href="/research/physical-experiments#physical-validation">
            Physical research ↗
          </a>
          <a href="/vow">VOW / execution &amp; recovery ↗</a>
          <a href="/qcs">QCS / authority research ↗</a>
          <a href="/resources">Research &amp; engineering notes ↗</a>
        </div>
      </section>

      <div
        id="transition-consultation"
        className="et-chapter-bridge et-bridge-consultation"
        aria-label="Introducing: the next question"
      >
        <div className="et-bridge-inner">
          <span className="et-bridge-index et-mono">06 / UP NEXT</span>
          <div className="et-bridge-copy">
            <span className="et-eyebrow">THE NEXT QUESTION</span>
            <p>Tell us what your team is trying to do.</p>
            <small>Start with a conversation and one useful next step.</small>
          </div>
          <img
            className="et-bridge-art"
            src="/landing/illustrations/consultation-v2.webp"
            alt="A laptop, shared workflow board, and conversation symbols introduce planning together."
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
          <a href="#consultation" aria-label="Continue to the next question">
            ↓
          </a>
        </div>
      </div>
      <section
        className="et-consultation et-section-shell et-chapter"
        id="consultation"
        aria-labelledby="consultation-title"
      >
        <div>
          <p className="et-eyebrow">06 / START SMALL. MAKE IT TESTABLE.</p>
          <h2 id="consultation-title">
            Your workflow.
            <br />
            Our next question.
          </h2>
          <p className="et-lead">
            What must your team be able to verify before this software gets more
            responsibility?
          </p>
          <p>
            Bring a non-confidential summary. We’ll discuss the problem and
            define a useful first step.
          </p>
        </div>
        <div className="et-consultation-action">
          <a className="et-button" href="/consultation">
            Request a free consultation <span aria-hidden="true">↗</span>
          </a>
          <span className="et-mono">10–30 MINUTES / FREE FIRST CALL</span>
          <p>Paid work begins after an agreed written scope.</p>
          <a className="et-text-link" href="/partners/enterprise">
            Already have a workflow to scope? <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <div id="company">
        <BrandFooter backToTopHref="#top" />
      </div>
    </main>
  );
}
