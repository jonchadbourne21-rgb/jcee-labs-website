import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import CurlicueField from "@/components/CurlicueField";

import { entries, registryGroups, groupId } from "@/content/registryEntries";

const classifications = [
  [
    "VERIFIED MILESTONE",
    "A specific bounded claim survived its named gate and the supporting evidence was preserved.",
  ],
  [
    "EXPERIMENTAL",
    "Results exist, but reproduction, transfer, adversarial review, or external verification remains incomplete.",
  ],
  [
    "DEFINED SPECIFICATION",
    "A stable public specification or contract exists; implementation and transfer claims remain separately bounded.",
  ],
  [
    "ADOPTED STANDARD",
    "A governance rule adopted by JCEE Labs. It is not an empirical result.",
  ],
];

export default function PublicRegistry() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "JCEE Public Registry";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="program-page registry-page" id="top">
      <CoreHeader current="registry" />

      <section
        id="page-content"
        tabIndex={-1}
        className="program-masthead registry-program"
      >
        <p className="eyebrow">
          <span /> PUBLIC RECORD · CURRENT
        </p>
        <div className="program-number">JCEE PUBLIC REGISTRY</div>
        <h1>
          A living record.
          <br />
          <em>Not a highlight reel.</em>
        </h1>
        <p className="program-deck">
          The public registry records what JCEE Labs can responsibly say about
          selected systems, research programs, and governing standards.
        </p>
        <div className="program-status-row">
          <span>PUBLIC PROJECTION · SANITIZED</span>
          <span>MILESTONES + CANDIDATES + OPEN GATES</span>
        </div>
      </section>

      <section className="program-statement registry-position">
        <p className="charter-section-label">PUBLIC CLAIM CONTROL</p>
        <h2>The registry shows status, evidence boundary, and limitation.</h2>
        <div className="program-statement-copy">
          <p>
            Each entry names a recorded milestone, its scope, and its
            limitations. Newer candidate work is listed separately so a
            source-control change cannot be mistaken for a released product.
          </p>
          <p>
            Reviewed against the September 14 portfolio records and current
            source-control history. Historical milestone dates are preserved.
            Read the linked reports for selected methods, results, and open
            questions.
          </p>
          <div className="program-links">
            <a href="/JCEE_Labs_Public_Registry_v1.2.md" download>
              DOWNLOAD CURRENT REGISTRY · VERSION 1.2 <span>↓</span>
            </a>
            <a href="/JCEE_Labs_Public_Registry_v1.0.md" download>
              ARCHIVE · REGISTRY VERSION 1.0 <span>↓</span>
            </a>
            <a href="/research/jrp-000">
              READ JRP-000 <span>→</span>
            </a>
          </div>
        </div>
      </section>

      <section
        className="registry-classifications"
        aria-labelledby="registry-classifications-title"
      >
        <div className="section-index">
          <span>STATUS LANGUAGE</span>
          <span>THE LABEL DOES NOT OVERRIDE THE BOUNDARY</span>
        </div>
        <h2 id="registry-classifications-title">How to read this record.</h2>
        <div className="registry-classification-grid">
          {classifications.map(([label, copy]) => (
            <article key={label}>
              <span>{label}</span>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="registry-records"
        aria-labelledby="registry-records-title"
      >
        <div className="section-index">
          <span>SELECTED PUBLIC RECORDS</span>
          <span>REVIEWED · SEPTEMBER 14, 2026</span>
        </div>
        <h2 id="registry-records-title">Current public entries.</h2>
        <nav className="registry-jump-links" aria-label="Build categories">
          {registryGroups.map(group => (
            <a key={group} href={`#${groupId(group)}`}>
              {group}
            </a>
          ))}
        </nav>

        {registryGroups.map(group => (
          <section
            className="registry-group"
            key={group}
            aria-labelledby={groupId(group)}
          >
            <h2 id={groupId(group)}>{group}</h2>
            <div className="registry-grid">
              {entries
                .filter(entry => entry.group === group)
                .map((entry, index) => (
                  <article
                    className="registry-entry"
                    id={entry.id}
                    key={entry.id}
                  >
                    <div className="registry-entry-index">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="registry-entry-body">
                      <div className="registry-entry-topline">
                        <span>{entry.kind}</span>
                        <span>{entry.date}</span>
                      </div>
                      <h3>{entry.name}</h3>
                      <span
                        className={`registry-status registry-status-${entry.status}`}
                      >
                        {entry.statusLabel}
                      </span>
                      <p className="registry-entry-summary">{entry.summary}</p>
                      <dl>
                        <div>
                          <dt>WHAT THE RECORD SUPPORTS</dt>
                          <dd>{entry.supports}</dd>
                        </div>
                        <div>
                          <dt>KNOWN BOUNDARY</dt>
                          <dd>{entry.boundary}</dd>
                        </div>
                        {entry.next && (
                          <div>
                            <dt>NEXT GATE</dt>
                            <dd>{entry.next}</dd>
                          </div>
                        )}
                      </dl>
                      {entry.href ? (
                        <a href={entry.href}>
                          VIEW PUBLIC CONTEXT <span>→</span>
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </section>

      <section className="registry-disclosure">
        <div>
          <p className="charter-section-label">RESPONSIBLE DISCLOSURE</p>
          <h2>Evidence-first does not mean publishing every artifact.</h2>
        </div>
        <div>
          <p>
            JCEE may withhold source code, private evidence packages, attack
            corpora, security-sensitive details, patent material, customer
            information, and counsel work product while still keeping each
            public claim inside a clear evidence boundary.
          </p>
          <p>
            A withheld artifact cannot be used to make an unlimited public
            claim. Where independent review is required, it must occur through
            an appropriate confidential process.
          </p>
        </div>
      </section>

      <section
        className="curlicue-section registry-curlicue"
        aria-labelledby="registry-curlicue-title"
      >
        <div className="curlicue-index">
          <span>PUBLIC RESEARCH FIELD / IRRATIONAL ORDER</span>
          <span>ONE RULE · CONTINUOUS UNFOLDING</span>
        </div>
        <div className="curlicue-layout">
          <div className="curlicue-stage">
            <CurlicueField />
            <div className="curlicue-coordinates" aria-hidden="true">
              <span>α = √2 − 1 · IRRATIONAL</span>
              <span>EQUAL STEP · QUADRATIC PHASE · LIVE TRACE</span>
            </div>
          </div>
          <div className="curlicue-copy">
            <p className="curlicue-kicker">PUBLIC MATHEMATICAL VISUALIZATION</p>
            <h2 id="registry-curlicue-title">
              Perfect rule.
              <br />
              No true repeat.
            </h2>
            <p>
              This live client-side field demonstrates how a small public rule
              can generate intricate non-periodic geometry. It is presented as a
              mathematical visualization, not as QCS execution, proof of a
              physical claim, or evidence for a proprietary JCEE mechanism.
            </p>
            <div className="curlicue-formula">
              <span>PUBLIC GENERATIVE RULE</span>
              <code>θₙ = 2π α n² · pₙ₊₁ = pₙ + (cos θₙ, sin θₙ)</code>
            </div>
          </div>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
