import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Streamdown } from "streamdown";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";

const sourcePath = "/JRP-001_The_Assurance_Boundary_v1.0.md";
const githubUrl =
  "https://github.com/jonchadbourne21-rgb/jcee-labs-website/blob/main/client/public/JRP-001_The_Assurance_Boundary_v1.0.md";

const contents = [
  ["abstract", "Abstract"],
  ["i-the-problem", "I. The Problem"],
  ["ii-the-frozen-product-boundary", "II. Product Boundary"],
  ["iii-frozen-interfaces-and-conformance-fixtures", "III. Interfaces & Fixtures"],
  ["iv-the-deterministic-verification-kernel", "IV. Verification Kernel"],
  ["v-immutable-evidence-ledger-and-snapshot-resolver", "V. Evidence Ledger"],
  ["vi-admitted-claim", "VI. Admitted Claim"],
  ["vii-claims-not-admitted", "VII. Claims Not Admitted"],
  ["viii-why-the-refusals-matter", "VIII. Why Refusals Matter"],
  ["ix-next-scientific-and-engineering-gates", "IX. Next Gates"],
  ["x-conclusion", "X. Conclusion"],
  ["publication-record", "Publication Record"],
] as const;

function childText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) return children.map(childText).join("");
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

export default function Jrp001() {
  const [source, setSource] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "JRP-001 — The Assurance Boundary | JCEE Labs";

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

  const paperBody = useMemo(() => bodyOnly(source), [source]);

  return (
    <main className="paper-page" id="top">
      <CoreHeader current="research" />

      <section className="paper-masthead paper-masthead-assurance">
        <p className="eyebrow">
          <span /> JCEE LABS RESEARCH PAPERS · VERIFIED MILESTONE
        </p>
        <div className="paper-code">JRP—001</div>
        <h1>
          The Assurance
          <br />
          <em>Boundary</em>
        </h1>
        <p className="paper-deck">
          What JCEE Assurance can verify—and what it must refuse to claim.
        </p>
        <blockquote>
          Verification authority must never exceed the authority contained in
          the evidence.
        </blockquote>
        <div className="paper-version-row">
          <span>VERSION 1.0 · AUGUST 13, 2026</span>
          <span>STATUS · BOUNDED INTERNAL VERIFICATION</span>
        </div>
      </section>

      <div className="paper-shell">
        <aside
          className="paper-sidebar"
          aria-label="JRP-001 publication record and contents"
        >
          <div className="paper-record">
            <p>PUBLICATION RECORD</p>
            <dl>
              <div><dt>IDENTIFIER</dt><dd>JRP-001</dd></div>
              <div><dt>VERSION</dt><dd>1.0</dd></div>
              <div><dt>STATUS</dt><dd>Verified Milestone</dd></div>
              <div><dt>SCOPE</dt><dd>Bounded internal verification</dd></div>
              <div><dt>CLASS</dt><dd>Research publication</dd></div>
              <div><dt>AUTHOR</dt><dd>Jonathan Chadbourne</dd></div>
              <div><dt>PUBLISHED</dt><dd>August 13, 2026</dd></div>
            </dl>
          </div>

          <div className="paper-file-links">
            <a href={sourcePath} download>DOWNLOAD VERSION 1.0 ↓</a>
            <a href={githubUrl} target="_blank" rel="noreferrer">
              VIEW SOURCE ON GITHUB ↗
            </a>
          </div>

          <nav className="paper-toc" aria-label="JRP-001 table of contents">
            <p>CONTENTS</p>
            <ol>
              {contents.map(([id, label]) => (
                <li key={id}><a href={`#${id}`}>{label}</a></li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="paper-document">
          {loadFailed ? (
            <div className="paper-load-state" role="alert">
              <strong>The paper source could not be loaded.</strong>
              <a href={sourcePath}>Open the published Version 1.0 source →</a>
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
              Loading published source…
            </div>
          )}
        </article>
      </div>

      <section className="paper-next-record">
        <p>THE ADMITTED RESULT</p>
        <h2>The system preserves evidence without inventing authority.</h2>
        <div>
          <p>
            JRP-001 records the first bounded JCEE Assurance / Evidence Engine
            milestone. Its exclusions are part of the result, not fine print.
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
