import CoreHeader from "@/components/CoreHeader";
import BrandFooter from "@/components/BrandFooter";
import "./home-editorial-refresh.css";

export default function InfrastructurePage() {
  return (
    <main id="top" className="customer-home customer-service">
      <CoreHeader current="solutions" />
      <section
        id="page-content"
        tabIndex={-1}
        className="customer-shell customer-hero"
      >
        <p className="customer-kicker">
          JCEE INFRASTRUCTURE / WORKFLOW ASSURANCE
        </p>
        <h1>
          One workflow.
          <br />A clear way forward.
        </h1>
        <p className="customer-deck">
          Connect the systems, permissions, and records your team needs to put
          AI to work. Start with a focused assessment of one business process.
        </p>
        <div className="customer-actions">
          <a className="customer-button" href="/consultation">
            Discuss your workflow ↗
          </a>
          <a className="customer-link" href="#deliverables">
            See what you receive ↓
          </a>
        </div>
        <p className="customer-note">
          For operations and engineering teams evaluating a specific automation
          or integration problem.
        </p>
      </section>
      <section
        className="customer-shell customer-section"
        id="deliverables"
        aria-labelledby="deliverables-title"
      >
        <p className="customer-kicker">01 / THE FIRST ENGAGEMENT</p>
        <h2 id="deliverables-title">A decision you can act on.</h2>
        <p className="customer-deck">
          The Workflow Assurance assessment gives your team a written view of
          the process, the risks at each handoff, and the engineering needed to
          move forward.
        </p>
        <div className="customer-cards customer-deliverables">
          <article>
            <span>01 / MAP</span>
            <h3>Your workflow, connected.</h3>
            <p>
              Systems, owners, approval points, and the records that establish
              what happened.
            </p>
          </article>
          <article>
            <span>02 / EVALUATE</span>
            <h3>Your failure cases, defined.</h3>
            <p>
              Where a timeout, changed permission, or partial completion creates
              uncertainty—and what needs testing.
            </p>
          </article>
          <article>
            <span>03 / DECIDE</span>
            <h3>Your next step, scoped.</h3>
            <p>
              Findings, unresolved requirements, acceptance criteria, and a
              recommended implementation or test plan.
            </p>
          </article>
        </div>
        <p className="customer-note">
          The assessment is a defined services engagement. Implementation,
          target-system testing, and production changes are scoped separately.
        </p>
      </section>
      <section
        className="customer-shell customer-section"
        aria-labelledby="engagement-title"
      >
        <p className="customer-kicker">02 / HOW WE WORK TOGETHER</p>
        <h2 id="engagement-title">
          Keep your systems.
          <br />
          Improve how the work moves.
        </h2>
        <ol className="customer-steps">
          <li>
            <span>DISCUSS</span>
            <h3>Start with the problem.</h3>
            <p>
              A free first conversation about the workflow, the systems
              involved, and the outcome your team needs.
            </p>
          </li>
          <li>
            <span>AGREE</span>
            <h3>Define the engagement.</h3>
            <p>
              Deliverables, access requirements, timing, price, and acceptance
              criteria are agreed in writing before paid work.
            </p>
          </li>
          <li>
            <span>ASSESS</span>
            <h3>Make the next decision.</h3>
            <p>
              Review the findings together. Decide whether to adapt an existing
              tool, run a focused test, or commission implementation.
            </p>
          </li>
        </ol>
      </section>
      <section
        className="customer-shell customer-section"
        aria-labelledby="service-evidence-title"
      >
        <p className="customer-kicker">03 / THE ENGINEERING FOUNDATION</p>
        <h2 id="service-evidence-title">Inspect the work behind it.</h2>
        <p className="customer-deck">
          JCEE WorldLab builds assurance and execution infrastructure between
          machine intelligence and real-world consequence.
        </p>
        <div className="customer-cards">
          <article>
            <span>EXECUTION & RECOVERY</span>
            <h3>What happened?</h3>
            <p>Explore the VOW execution and recovery work.</p>
            <a className="customer-link" href="/vow">
              Explore VOW ↗
            </a>
          </article>
          <article>
            <span>INTEGRATED SOFTWARE</span>
            <h3>What was tested?</h3>
            <p>
              Read the dated software qualification, its configuration, and its
              limits.
            </p>
            <a className="customer-link" href="/technology#current-integration">
              Read the engineering evidence ↗
            </a>
          </article>
          <article>
            <span>EVIDENCE & STATUS</span>
            <h3>What supports the result?</h3>
            <p>
              Examine public records and the boundaries attached to each
              conclusion.
            </p>
            <a className="customer-link" href="/registry">
              Open the public registry ↗
            </a>
          </article>
        </div>
        <p className="customer-note">
          JCEE Infrastructure is in development. Recorded engineering results do
          not establish customer production readiness or universal safety. A
          service assessment does not grant production execution authority.
        </p>
      </section>
      <section
        className="customer-shell customer-section customer-faq"
        aria-labelledby="questions-title"
      >
        <p className="customer-kicker">04 / BEFORE WE TALK</p>
        <h2 id="questions-title">A few practical questions.</h2>
        <details>
          <summary>Do we need to replace our existing tools?</summary>
          <p>
            The first step is to map what you already use. We assess where
            existing tools are sufficient and where an integration or additional
            control may help.
          </p>
        </details>
        <details>
          <summary>Can we start before choosing an AI model?</summary>
          <p>
            Yes. The assessment starts with the business workflow and its
            requirements. Model choice is one part of the design, alongside
            permissions, integrations, and outcome verification.
          </p>
        </details>
        <details>
          <summary>What does it cost, and how long does it take?</summary>
          <p>
            The first conversation is free. Assessment pricing and timing depend
            on the agreed scope and system access. Both are set in writing
            before paid work begins.
          </p>
        </details>
        <details>
          <summary>What should we share initially?</summary>
          <p>
            A non-confidential description of the workflow, systems involved,
            and desired improvement. Any sensitive material or system access
            needs a separately agreed exchange.
          </p>
        </details>
      </section>
      <section className="customer-shell customer-section customer-close">
        <div>
          <p className="customer-kicker">START WITH ONE WORKFLOW</p>
          <h2>
            Bring us the work
            <br />
            worth improving.
          </h2>
          <p>We will discuss whether a scoped next step makes sense.</p>
        </div>
        <div>
          <a className="customer-button" href="/consultation">
            Discuss your workflow ↗
          </a>
          <p className="customer-note">
            Already have a detailed brief?{" "}
            <a href="/partners/enterprise">Use the workflow inquiry.</a>
          </p>
        </div>
      </section>
      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
