import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const principles = [
  {
    number: "01",
    title: "State is not authority.",
    copy: "A model output, prediction, memory, simulation, belief, confidence score, or internal representation does not become consequential authority merely because it exists.",
  },
  {
    number: "02",
    title: "Unknown is not permission.",
    copy: "Missing evidence, ambiguity, timeout, convenience, or expected success cannot silently become authorization. Unresolved conditions remain unresolved.",
  },
  {
    number: "03",
    title: "Consequential authority must be current.",
    copy: "Permission for a real-world effect must come from the relevant authorized boundary and remain bound to the current evidence, scope, policy, state, and effect.",
  },
  {
    number: "04",
    title: "Human responsibility remains.",
    copy: "Intelligent software does not absorb responsibility from the people and institutions that choose its objectives, authority, deployment conditions, and tolerated consequences.",
  },
];

export default function CharterV11() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "The JCEE Labs Charter — Version 1.1";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="program-page charter-v11-page" id="top">
      <CoreHeader current="charter" />

      <section className="program-masthead charter-v11-program">
        <p className="eyebrow"><span /> PUBLIC STANDARD · VERSION 1.1</p>
        <div className="program-number">THE JCEE LABS CHARTER</div>
        <h1>
          Hypotheses may<br />
          <em>begin anywhere.</em>
        </h1>
        <p className="program-deck">
          Consequential authority cannot. This first-principle addendum joins
          ontological openness to evidence discipline, bounded authority, and
          human responsibility.
        </p>
        <div className="program-status-row">
          <span>ADOPTED · AUGUST 31, 2026</span>
          <span>VERSION 1.0 FOUNDATION · PRESERVED</span>
        </div>
      </section>

      <section className="program-statement charter-first-principle">
        <p className="charter-section-label">JCEE FIRST PRINCIPLE</p>
        <h2>Hypotheses may begin anywhere. Authority cannot.</h2>
        <div className="program-statement-copy">
          <p>
            First-person experience, intuition, coherence, imagination,
            serendipity, faith, love, and felt meaning may legitimately
            generate hypotheses, research questions, and human values.
          </p>
          <p>
            They do not, by themselves, establish shared-world empirical
            claims, prove an external causal account, or create authority for
            consequential execution.
          </p>
        </div>
      </section>

      <section className="charter-openness" aria-labelledby="charter-openness-title">
        <div className="section-index">
          <span>ONTOLOGICAL OPENNESS</span>
          <span>EMPIRICAL DISCIPLINE</span>
        </div>
        <h2 id="charter-openness-title">Meaning may open the inquiry. Evidence governs the claim.</h2>
        <div className="charter-openness-grid">
          <article>
            <span>AUTHORITATIVE ABOUT EXPERIENCE</span>
            <p>
              A person may speak with authority about the fact and character
              of their own experience: what they perceived, felt, valued, or
              found meaningful.
            </p>
          </article>
          <article>
            <span>NOT AUTOMATICALLY AUTHORITATIVE ABOUT THE WORLD</span>
            <p>
              An experience alone does not establish an external mechanism,
              universal ontology, physical cause, or permission to impose a
              consequential interpretation on others.
            </p>
          </article>
          <article>
            <span>RESEARCH MAY CONTINUE</span>
            <p>
              JCEE may investigate unusual, intuitive, spiritual,
              consciousness-related, mathematical, or physical hypotheses when
              the claim, evidence, uncertainty, and consequence boundary remain
              explicit.
            </p>
          </article>
        </div>
      </section>

      <section className="program-boundaries" aria-labelledby="charter-laws-title">
        <div className="section-index">
          <span>NON-CONSEQUENTIAL STATE NON-AUTHORITY</span>
          <span>PUBLIC GOVERNING RULES</span>
        </div>
        <h2 id="charter-laws-title">What follows from the first principle.</h2>
        <div className="charter-law-grid">
          {principles.map((principle) => (
            <article key={principle.number}>
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="charter-relationship">
        <div>
          <p className="charter-section-label">RELATION TO VERSION 1.0</p>
          <h2>The foundation remains in force.</h2>
        </div>
        <div>
          <p>
            Version 1.1 supplements rather than rewrites the August 4, 2026
            Charter. Its commitments to falsifiable claims, preserved
            failures, bounded authority, durable evidence, responsible
            disclosure, and human accountability remain governing.
          </p>
          <p>
            The preserved Version 1.0 page and Markdown remain available as the
            historical foundation. This successor addendum records the
            accepted first-principle layer without altering the earlier
            artifact.
          </p>
          <div className="program-links">
            <a href="/charter/archive/v1.0">READ PRESERVED VERSION 1.0 <span>→</span></a>
            <a href="/JCEE_Labs_Charter_v1.1.md" download>DOWNLOAD VERSION 1.1 ADDENDUM <span>↓</span></a>
          </div>
        </div>
      </section>

      <section className="program-next">
        <p className="charter-section-label">PUBLICATION AND ACTION BOUNDARY</p>
        <h2>Openness expands what may be asked. It does not weaken what must be proved.</h2>
        <p>
          Every JCEE experiment, product, agent, architecture, review, and
          consequential-action system remains subject to evidence before
          judgment, current authority before effect, explicit uncertainty, and
          responsibility that resolves upward to the humans and institutions
          involved.
        </p>
        <div className="program-links">
          <a href="/registry">VIEW THE PUBLIC REGISTRY <span>→</span></a>
          <a href="/research/jrp-000">READ JRP-000 <span>→</span></a>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
