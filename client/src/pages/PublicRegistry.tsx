import usePageSeo from "@/components/usePageSeo";
import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import CurlicueField from "@/components/CurlicueField";

import { entries, registryGroups, groupId } from "@/content/registryEntries";
import { getPublicClaimLabel } from "@/content/publicClaimLevels";

const classifications = [
  [
    "DEFINED",
    "A contract, governance standard, design, or model exists. Definition alone is not evidence of a real-world effect.",
  ],
  [
    "TESTED — BOUNDED",
    "A named test, formal check, or observation has a recorded result within explicit assumptions; the result may be positive or negative.",
  ],
  [
    "REPRODUCED — BOUNDED",
    "A named result was reproduced under the specified method or environments. Cross-host or same-team checks do not imply independent certification.",
  ],
  [
    "HOLD / NOT QUALIFIED",
    "The intended gate has not run, failed, or still lacks required evidence. Earlier partial tests remain documented without upgrading the claim.",
  ],
];

export default function PublicRegistry() {
  usePageSeo("/registry");

  return (
    <main className="program-page registry-page" id="top">
      <CoreHeader current="registry" />

      <section
        id="page-content"
        tabIndex={-1}
        className="program-masthead registry-program"
      >
        <p className="eyebrow">
          <span /> PUBLIC RECORD · DATED ENTRIES
        </p>
        <div className="program-number">JCEE PUBLIC REGISTRY</div>
        <h1>
          JCEE WorldLab Public Registry:
          <br />
          <em>results, boundaries, and status</em>
        </h1>
        <p className="program-deck">
          The public registry uses four evidence labels, with the exact test
          boundary and next gate recorded for each system, research program, and standard.
        </p>
        <div className="program-status-row">
          <span>PUBLIC PROJECTION · SANITIZED</span>
          <span>MILESTONES + CANDIDATES + OPEN GATES</span>
        </div>
      </section>

      <section className="program-statement registry-position">
        <p className="charter-section-label">PUBLIC CLAIM CONTROL</p>
        <h2>Four labels. Every claim has a boundary.</h2>
        <div className="program-statement-copy">
          <p>
            The category is only a summary. Each entry names its actual result, scope, and
            limitations. Governance adoption is a separate decision, not scientific validation. Newer work is listed separately so a
            source-control change cannot be mistaken for a released product.
          </p>
          <p>
            The portfolio review covers work through November 4, 2026: native
            recovery, installed interfaces, hosted evidence, formal research, quantum
            observations, simulations and planned physical programs. Earlier
            entries retain their dates and limits. Full G0 remains unrun and
            release remains on hold. Public summaries exclude private methods,
            unpublished derivations and confidential third-party material.
          </p>
          <p>
            A November 6, 2026 correction records successful scoped CI for
            Autography P0.7. Its scientific result and archive exclusion remain
            bounded as stated in the entry.
          </p>
          <div className="program-links">
            <a href="/technology#current-integration">
              CURRENT SOFTWARE RESULTS AND OPEN GATES <span>→</span>
            </a>
            <a href="/JCEE_WorldLab_Public_Registry_v1.6.md" download>
              DOWNLOAD CURRENT REGISTRY · VERSION 1.6 <span>↓</span>
            </a>
            <a href="/JCEE_WorldLab_Public_Registry_v1.5.md" download>
              ARCHIVE · REGISTRY VERSION 1.5 <span>↓</span>
            </a>
            <a href="/JCEE_Labs_Public_Registry_v1.4.md" download>
              ARCHIVE · REGISTRY VERSION 1.4 <span>↓</span>
            </a>
            <a href="/JCEE_Labs_Public_Registry_v1.3.md" download>
              ARCHIVE · REGISTRY VERSION 1.3 <span>↓</span>
            </a>
            <a href="/JCEE_Labs_Public_Registry_v1.2.md" download>
              ARCHIVE · REGISTRY VERSION 1.2 <span>↓</span>
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
          <span>PORTFOLIO REVIEW NOV 4 · AUTOGRAPHY CI CORRECTION NOV 6, 2026</span>
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
                        {getPublicClaimLabel(entry.id)}
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
