import BuildStatusList from "@/components/BuildStatusList";
import EditorialLayout from "@/components/EditorialLayout";
import {
  publications,
  publicationHref,
  isResearch,
} from "@/content/publications";
export default function ResearchPage() {
  return (
    <EditorialLayout
      current="research"
      eyebrow="JCEE Research"
      title="Results you can examine."
      description="Research into execution, authority, and evidence. Each publication states what was tested, what was observed, and what remains unresolved."
    >
      <section
        className="editorial-section editorial-section-muted"
        aria-labelledby="portfolio-title"
      >
        <p className="editorial-kicker">
          CURRENT RESEARCH PORTFOLIO · PREPARED SEPTEMBER 18, 2026
        </p>
        <h2 id="portfolio-title">25 fields. One unifying research question.</h2>
        <p className="editorial-intro">
          The portfolio spans trustworthy AI, distributed and resilient computing,
          formal verification, quantum information, information theory, causal
          assurance, complex systems, human-AI interaction, and applied
          computational intelligence.
        </p>
        <div className="research-question">
          <span>UNIFYING RESEARCH QUESTION</span>
          <blockquote>
            How do you determine what a system actually knows, what that evidence
            permits it to conclude, what authority it possesses, and what
            consequences it may safely produce?
          </blockquote>
        </div>
        <a className="editorial-text-link" href="/research/fields">
          Explore all 25 research fields →
        </a>
      </section>
      <section className="editorial-section" aria-labelledby="papers-title">
        <div className="editorial-section-heading">
          <h2 id="papers-title">Reports and research notes</h2>
          <a href="/registry">View all public milestones ↗</a>
        </div>
        <p className="editorial-intro">
          These are JCEE-authored publications. Technical reports, research
          briefs, and governance standards are labeled separately; none is
          presented as peer-reviewed certification.
        </p>
        <div className="resource-grid">
          {publications
            .filter(p => isResearch(p))
            .map(item => (
              <article className="resource-card" key={item.slug}>
                <p className="editorial-kicker">
                  {item.kind} · September 14, 2026
                </p>
                <h3>
                  <a href={publicationHref(item)}>{item.title}</a>
                </h3>
                <p>{item.summary}</p>
                <a className="editorial-text-link" href={publicationHref(item)}>
                  Read report →
                </a>
              </article>
            ))}
        </div>
        <div className="editorial-link-list">
          <a href="/research/jrp-000">
            <strong>JRP-000 · The Evidence Boundary</strong>
            <span>
              Governance standard · August 13, 2026. How we admit, qualify, and
              correct a claim.
            </span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
      <section className="editorial-section">
        <h2>Research programs and recorded outcomes</h2>
        <p>
          Completed gates, negative results, and open evaluations all remain
          part of the record.
        </p>
        <BuildStatusList
          ids={[
            "crucible-p03",
            "autography",
            "lem",
            "lam",
            "vela",
            "tot",
            "rtl",
            "gmda",
          ]}
        />
      </section>
      <section className="editorial-section editorial-section-dark">
        <p className="editorial-kicker">Reproduction and review</p>
        <h2>A result becomes more useful when someone else can examine it.</h2>
        <p>
          Bring a research question, a reproduction proposal, or a specific
          claim you want to evaluate. We can discuss the appropriate evidence
          and review boundary.
        </p>
        <a className="editorial-button" href="/partners/research">
          Discuss research →
        </a>
      </section>
    </EditorialLayout>
  );
}
