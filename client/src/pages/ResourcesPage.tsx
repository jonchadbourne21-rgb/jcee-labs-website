import { useState } from "react";
import EditorialLayout from "@/components/EditorialLayout";
import {
  publications,
  publicationHref,
  isResearch,
} from "@/content/publications";

export default function ResourcesPage() {
  const [filter, setFilter] = useState("All");
  const visible = publications.filter(
    p =>
      filter === "All" ||
      (filter === "Research" ? isResearch(p) : p.kind === filter)
  );
  return (
    <EditorialLayout
      current="resources"
      eyebrow="The JCEE library"
      title="Ideas, builds, and the evidence behind them."
      description="Follow the company, explore engineering progress, and read the results with their limits attached."
    >
      <section className="editorial-section" aria-labelledby="library-title">
        <div className="editorial-section-heading">
          <h2 id="library-title">Latest from the lab</h2>
          <a href="/registry">Build status ↗</a>
        </div>
        <div
          className="resource-filters"
          role="group"
          aria-label="Filter resources"
        >
          {[
            "All",
            "From the Founder",
            "Company blog",
            "Engineering blog",
            "Research",
          ].map(label => (
            <button
              type="button"
              key={label}
              aria-pressed={filter === label}
              onClick={() => setFilter(label)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="sr-only" role="status">
          {visible.length} resources shown
        </p>
        <div className="resource-grid">
          {visible.map(item => (
            <article key={item.slug} className="resource-card">
              <p className="editorial-kicker">
                {item.kind} ·{" "}
                <time dateTime={item.date}>September 14, 2026</time>
              </p>
              <h3>
                <a href={publicationHref(item)}>{item.title}</a>
              </h3>
              <p>{item.summary}</p>
              <a className="editorial-text-link" href={publicationHref(item)}>
                Read {isResearch(item) ? "report" : "article"}{" "}
                <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </section>
      <section
        className="editorial-section editorial-section-muted"
        aria-labelledby="reference-title"
      >
        <h2 id="reference-title">Reference desk</h2>
        <div className="editorial-link-list">
          <a href="/registry">
            <strong>Public Registry</strong>
            <span>
              Current milestones, version history, and what remains open.
            </span>
            <span aria-hidden="true">→</span>
          </a>
          <a href="/research/jrp-000">
            <strong>The Evidence Boundary</strong>
            <span>
              Our published standard for research claims and evidence.
            </span>
            <span aria-hidden="true">→</span>
          </a>
          <a href="/technology">
            <strong>Technology overviews</strong>
            <span>Understand VOW, QCS, and JCEE Assurance.</span>
            <span aria-hidden="true">→</span>
          </a>
          <a href="/charter">
            <strong>Company charter</strong>
            <span>The principles governing our work.</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </EditorialLayout>
  );
}
