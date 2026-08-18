import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Streamdown } from "streamdown";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const sourcePath = "/JRP-000_The_Evidence_Boundary_v1.0.md";
const githubUrl =
  "https://github.com/jonchadbourne21-rgb/jcee-labs-website/blob/main/client/public/JRP-000_The_Evidence_Boundary_v1.0.md";

const contents = [
  ["abstract", "Abstract"],
  ["1-purpose", "1. Purpose"],
  [
    "2-the-problem-claims-expand-faster-than-evidence",
    "2. The evidence-boundary problem",
  ],
  ["3-definitions", "3. Definitions"],
  ["4-claim-specification", "4. Claim specification"],
  ["5-the-evidence-package", "5. The evidence package"],
  ["6-mandatory-admission-gates", "6. Mandatory admission gates"],
  ["7-evidence-quality-scorecard", "7. Evidence quality scorecard"],
  [
    "8-verdicts-and-publication-language",
    "8. Verdicts and publication language",
  ],
  ["9-negative-contradictory-and-null-results", "9. Negative and null results"],
  ["10-corrections-and-revision-history", "10. Corrections"],
  ["11-public-evidence-and-restricted-material", "11. Responsible disclosure"],
  ["12-worked-example-a-bounded-interruption-claim", "12. Worked example"],
  ["13-review-responsibilities", "13. Review responsibilities"],
  ["14-limits-of-this-standard", "14. Limits"],
  ["15-conclusion", "15. Conclusion"],
  ["appendix-a-claim-card-template", "Appendix A — Claim card"],
  ["appendix-b-admission-checklist", "Appendix B — Checklist"],
  ["appendix-c-publication-record", "Appendix C — Publication record"],
  ["references", "References"],
  ["revision-history", "Revision history"],
] as const;

function childText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(childText).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    return childText(
      (children as { props: { children?: ReactNode } }).props.children
    );
  }
  return "";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function bodyOnly(markdown: string): string {
  const firstDivider = markdown.indexOf("\n---\n");
  return firstDivider === -1 ? markdown : markdown.slice(firstDivider + 5);
}

export default function Jrp000() {
  const [source, setSource] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "JRP-000 — The Evidence Boundary | JCEE Labs";

    let active = true;
    fetch(sourcePath)
      .then(response => {
        if (!response.ok)
          throw new Error(`Paper source returned ${response.status}`);
        return response.text();
      })
      .then(text => {
        if (active) setSource(text);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });

    return () => {
      active = false;
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    if (!source) return;

    const wrappers = Array.from(
      document.querySelectorAll<HTMLElement>('[data-streamdown="table-wrapper"]')
    );
    const updateCue = (wrapper: HTMLElement) => {
      const atStart = wrapper.scrollLeft <= 1;
      const atEnd =
        wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 1;
      wrapper.classList.toggle("has-more-left", !atStart);
      wrapper.classList.toggle("has-more-right", !atEnd);
    };
    const listeners = wrappers.map(wrapper => {
      const onScroll = () => updateCue(wrapper);
      updateCue(wrapper);
      wrapper.addEventListener("scroll", onScroll, { passive: true });
      return { wrapper, onScroll };
    });
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => listeners.forEach(({ wrapper }) => updateCue(wrapper)))
        : null;
    listeners.forEach(({ wrapper }) => resizeObserver?.observe(wrapper));

    return () => {
      listeners.forEach(({ wrapper, onScroll }) =>
        wrapper.removeEventListener("scroll", onScroll)
      );
      resizeObserver?.disconnect();
    };
  }, [source]);

  const paperBody = useMemo(() => bodyOnly(source), [source]);

  return (
    <main className="paper-page" id="top">
      <CoreHeader current="research" />

      <section className="paper-masthead">
        <p className="eyebrow">
          <span /> JCEE LABS RESEARCH PAPERS · ADOPTED
        </p>
        <div className="paper-code">JRP—000</div>
        <h1>
          The Evidence
          <br />
          <em>Boundary</em>
        </h1>
        <p className="paper-deck">
          How JCEE Labs admits, limits, and rejects technical claims.
        </p>
        <blockquote>
          A claim may be narrower than the evidence hoped for. It may never be
          broader than the evidence obtained.
        </blockquote>
        <div className="paper-version-row">
          <span>VERSION 1.0 · AUGUST 13, 2026</span>
          <span>STATUS · ADOPTED</span>
        </div>
      </section>

      <div className="paper-shell">
        <aside
          className="paper-sidebar"
          aria-label="JRP-000 publication record and contents"
        >
          <div className="paper-record">
            <p>PUBLICATION RECORD</p>
            <dl>
              <div>
                <dt>IDENTIFIER</dt>
                <dd>JRP-000</dd>
              </div>
              <div>
                <dt>VERSION</dt>
                <dd>1.0</dd>
              </div>
              <div>
                <dt>STATUS</dt>
                <dd>Adopted</dd>
              </div>
              <div>
                <dt>CLASS</dt>
                <dd>Research-governance standard</dd>
              </div>
              <div>
                <dt>AUTHOR</dt>
                <dd>Jonathan Chadbourne</dd>
              </div>
              <div>
                <dt>ADOPTED</dt>
                <dd>August 13, 2026</dd>
              </div>
            </dl>
          </div>

          <div className="paper-file-links">
            <a href={sourcePath} download>
              DOWNLOAD VERSION 1.0 ↓
            </a>
            <a href={githubUrl} target="_blank" rel="noreferrer">
              VIEW SOURCE ON GITHUB ↗
            </a>
          </div>

          <nav className="paper-toc" aria-label="JRP-000 table of contents">
            <p>CONTENTS</p>
            <ol>
              {contents.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="paper-document">
          {loadFailed ? (
            <div className="paper-load-state" role="alert">
              <strong>The paper source could not be loaded.</strong>
              <a href={sourcePath}>Open the adopted Version 1.0 source →</a>
            </div>
          ) : source ? (
            <Streamdown
              className="paper-markdown"
              controls={false}
              components={{
                h2: ({ children }) => (
                  <h2 id={slugify(childText(children))}>{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 id={slugify(childText(children))}>{children}</h3>
                ),
              }}
            >
              {paperBody}
            </Streamdown>
          ) : (
            <div className="paper-load-state" aria-live="polite">
              Loading adopted source…
            </div>
          )}
        </article>
      </div>

      <section className="paper-next-record">
        <p>WHAT THIS STANDARD CHANGES</p>
        <h2>Every later experiment must now show where its claim stops.</h2>
        <div>
          <p>
            JRP-000 governs the claim cards, admission gates, verdict language,
            limitations, and correction records used in later JCEE Labs
            publications.
          </p>
          <a href="/research-evidence">
            RETURN TO THE RESEARCH &amp; EVIDENCE INDEX →
          </a>
        </div>
      </section>

      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
