import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import { publications, publicationHref } from "@/content/publications";

export default function Home() {
  useEffect(() => {
    document.title = "JCEE Labs — From Possibility to Trusted Claim";
  }, []);

  return (
    <main id="top" className="precision-home commercial-home">
      <CoreHeader />
      <section id="page-content" tabIndex={-1} className="hero hybrid-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> JCEE ASSURANCE METHOD
          </p>
          <h1>
            From possibility
            <br />
            <em>to trusted claim.</em>
          </h1>
          <p className="hero-deck">
            JCEE Labs builds assurance and execution infrastructure for work where
            AI, automation, or complex software can produce convincing answers
            faster than teams can establish whether those answers are warranted.
            Evidence decides what can be claimed. Policy decides what can be done.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="/assurance">
              Explore the method <span>→</span>
            </a>
            <a className="primary-link" href="/partners/enterprise">
              Discuss an assessment <span>↗</span>
            </a>
          </div>
        </div>
        <aside className="hero-proof-index" aria-label="The assurance path">
          <span>POSSIBILITY → EVIDENCE → CONSEQUENCE</span>
          <ol>
            <li>
              <b>01</b>
              <strong>Define</strong>
              <small>State a consequential question and a claim that can lose.</small>
            </li>
            <li>
              <b>02</b>
              <strong>Establish</strong>
              <small>Separate observation, inference, judgment, and authority.</small>
            </li>
            <li>
              <b>03</b>
              <strong>Bound</strong>
              <small>Permit only the consequence the evidence and policy support.</small>
            </li>
          </ol>
          <a href="/registry">Inspect the public evidence →</a>
        </aside>
      </section>

      <div className="statement-band" aria-label="JCEE Labs principles">
        <span>VERIFICATION BEFORE JUDGMENT</span>
        <span aria-hidden="true">•</span>
        <span>OBSERVATION IS NOT AUTHORITY</span>
        <span aria-hidden="true">•</span>
        <span>CONSEQUENCES LEAVE RECEIPTS</span>
      </div>

      <section className="company-section" id="company">
        <div className="section-index">
          <span>01 / THE METHOD</span>
          <span>METHOD ABOVE MECHANISMS</span>
        </div>
        <div className="company-statement">
          <p>A METHOD, NOT A MARKETING PROMISE.</p>
          <h2>
            What has to be true
            <br />
            <em>before the claim changes the world?</em>
          </h2>
        </div>
        <div className="customer-problem-grid">
          <article>
            <h3>Can the claim lose?</h3>
            <p>
              Define the actor, property, conditions, threshold, consequence,
              and disproof condition before the result is known.
            </p>
            <a href="/assurance">Claim and disproof →</a>
          </article>
          <article>
            <h3>What was actually observed?</h3>
            <p>
              Keep authoritative external facts distinct from deterministic
              transforms, inferred state, and bounded judgment.
            </p>
            <a href="/assurance">Observation and evidence →</a>
          </article>
          <article>
            <h3>What is permitted now?</h3>
            <p>
              Evidence can justify a conclusion. Only explicit, current policy
              can justify a consequential action. Preserve the decision in a receipt.
            </p>
            <a href="/partners/enterprise">Assess a real boundary →</a>
          </article>
        </div>
        <div className="company-bottom">
          <p>
            The method is intentionally usable before a team adopts JCEE software.
            Start with one expensive ambiguity or high-consequence workflow and
            make the evidence boundary explicit.
          </p>
          <a href="/assurance">
            EXPLORE THE JCEE ASSURANCE METHOD <span>→</span>
          </a>
        </div>
      </section>

      <section
        className="operating-cloud-home"
        id="operating-cloud"
        aria-labelledby="operating-cloud-title"
      >
        <div className="operating-cloud-home__ambient" aria-hidden="true" />
        <div className="operating-cloud-home__frame">
          <div className="operating-cloud-home__topline">
            <span>02 / METHOD INTO SOFTWARE</span>
            <span>PLATFORM DIRECTION · IN DEVELOPMENT</span>
          </div>
          <div className="operating-cloud-home__lead">
            <div>
              <p className="operating-cloud-home__kicker">JCEE OPERATING CLOUD</p>
              <h2 id="operating-cloud-title">
                The method sits above the mechanisms.
              </h2>
            </div>
            <div className="operating-cloud-home__lead-copy">
              <p>
                JCEE systems implement different assurance obligations: evidence
                capture, authority and contract boundaries, durable execution,
                recovery, verification, replay, and review. The layers stay
                distinct so one green signal cannot silently stand in for truth.
              </p>
              <p className="operating-cloud-home__boundary">
                Operating Cloud is a platform direction, not a production-certification
                claim. Broader workflow ownership remains to be demonstrated.
              </p>
            </div>
          </div>
          <div
            className="operating-cloud-home__systems"
            aria-label="Assurance architecture"
          >
            <span>THE STACK</span>
            <div>
              <b>METHOD</b>
              <b>EVIDENCE</b>
              <b>AUTHORITY</b>
              <b>RUNTIME</b>
              <b>RECEIPT</b>
            </div>
          </div>
          <div className="operating-cloud-home__distribution">
            <div>
              <span>INDUSTRY APPLICATION · IN DEVELOPMENT</span>
              <h3>JCEE Distribution</h3>
            </div>
            <div>
              <p>
                The first synthetic dry run matched 20 of 20 expected order
                classifications, with zero external effects. A limited, approved
                shadow evaluation is the next commercial gate.
              </p>
              <a href="/solutions/distribution">
                EXPLORE THE WORKFLOW <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        className="editorial-section editorial-section-light"
        id="technology"
        aria-labelledby="technology-title"
      >
        <div className="editorial-section-heading">
          <div>
            <p className="editorial-kicker">03 / IMPLEMENTATION LAYERS</p>
            <h2 id="technology-title">The method guides. The systems implement.</h2>
          </div>
          <a href="/technology">Explore the technology →</a>
        </div>
        <div className="technology-grid">
          <article>
            <p className="editorial-kicker">JCEE VOW</p>
            <h3>Execute and recover with evidence.</h3>
            <p>
              VOW preserves intent, ambiguity, recovery decisions, effect identity,
              and receipts around consequential workflows. VOW 1.1 remains the
              frozen milestone; 1.1.1.dev3 is a private development candidate.
            </p>
            <a href="/vow">Runtime and interactive demo →</a>
          </article>
          <article>
            <p className="editorial-kicker">QCS</p>
            <h3>Reason about the next action.</h3>
            <p>
              The frozen QCS-2.0 specification passed its recorded reproduction
              gate across two tested authority classes. Its scope remains bounded
              to the evidence behind that result.
            </p>
            <a href="/qcs">Research and interactive model →</a>
          </article>
          <article>
            <p className="editorial-kicker">JCEE ASSURANCE</p>
            <h3>Make the judgment inspectable.</h3>
            <p>
              Portable evidence, named verification rules, and bounded conclusions
              help a reviewer see where the evidence supports a claim and where it stops.
            </p>
            <a href="/assurance">Method and verification →</a>
          </article>
        </div>
        <div className="home-status-strip">
          <span>PUBLIC REGISTRY · REVIEWED SEPTEMBER 14, 2026</span>
          <a href="/registry">Milestones, candidates, and open gates →</a>
        </div>
      </section>

      <section
        className="editorial-section home-resources"
        aria-labelledby="resources-title"
      >
        <div className="editorial-section-heading">
          <div>
            <p className="editorial-kicker">04 / FROM THE LAB</p>
            <h2 id="resources-title">The work, in readable form.</h2>
          </div>
          <a href="/resources">All resources →</a>
        </div>
        <div className="resource-grid">
          {publications.map(item => (
            <article className="resource-card" key={item.slug}>
              <p className="editorial-kicker">
                {item.kind} · September 14, 2026
              </p>
              <h3>
                <a href={publicationHref(item)}>{item.title}</a>
              </h3>
              <p>{item.summary}</p>
              <a className="editorial-text-link" href={publicationHref(item)}>
                Read more →
              </a>
            </article>
          ))}
        </div>
      </section>

      <section
        className="principles-summary"
        id="charter"
        aria-labelledby="principles-title"
      >
        <h2 id="principles-title">We build intelligence that leaves receipts.</h2>
        <p>
          Possibility is welcome. Evidence is explicit. Boundaries are visible.
          Consequences are earned. Receipts remain.
        </p>
        <a className="editorial-text-link" href="/company">
          Meet JCEE Labs →
        </a>
      </section>
      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
