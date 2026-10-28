import EditorialLayout from "@/components/EditorialLayout";
import { bb84PublicRelease as paper } from "@/content/bb84Release";

export default function BB84PaperPage() {
  const pdf = `${import.meta.env.BASE_URL}${paper.pdfUrl.slice(1)}`;
  return (
    <EditorialLayout
      current="research"
      eyebrow={`Public preprint · ${paper.version} · October 1, 2026`}
      title={paper.title}
      description={paper.summary}
    >
      <div className="publication-layout">
        <aside className="publication-toc">
          <a href="/research">← All research</a>
          <nav aria-label="On this page">
            <p>On this page</p>
            <a href="#overview">The question</a>
            <a href="#results">Results and assumptions</a>
            <a href="#limits">Open questions</a>
            <a href="#paper">Read the paper</a>
            <a href="#release">Release details</a>
          </nav>
          <a href={pdf} download>
            Download PDF ↓
          </a>
        </aside>
        <article className="publication-body min-w-0">
          <section id="overview">
            <p>{paper.author} · JCEE Labs</p>
            <h2>How much communication makes perfect recovery possible?</h2>
            <p>
              Two separated holders of quantum side information are asked to
              recover the same complete BB84 measurement outcome after the basis
              string is publicly revealed. The paper studies how much classical
              communication they need, and what a limited one-message budget
              permits.
            </p>
            <p>
              {paper.reviewNote} No claim of novelty or priority is established
              by this release.
            </p>
          </section>
          <section id="results">
            <h2>Results, with their assumptions attached</h2>
            <p>
              The paper establishes the exact perfect-recovery cost c_min(n) = n
              for finite-round classical interaction, together with a
              bounded-error converse. For one-message protocols, its lower and
              upper bounds meet at c = n − 1: the optimal success probability is
              Q = cos²(π/8) for every n ≥ 1. This includes the one-message (2,1)
              case; the interactive (2,1) case has the same value under the
              stated cost convention.
            </p>
            <p>
              The model permits arbitrary finite-dimensional prior entanglement
              prepared independently of the later basis choice. The basis is
              uniform and publicly revealed. Success means that both receivers
              recover the entire outcome string. Post-split quantum
              communication is excluded. Classical communication uses the
              manuscript’s worst-case cost convention, including informative
              timing, speaker choice, and stopping.
            </p>
            <p>
              The PDF gives the precise statements, proofs, bounded-error
              formula, one-message inequalities, and message-block projector
              argument. This overview does not replace those definitions.
            </p>
          </section>
          <section id="limits">
            <h2>What remains open</h2>
            <p>{paper.scopeNote}</p>
            <p>
              The perfect-recovery theorem does not settle the general guessing
              frontier. The external review does not establish publication acceptance,
              practical cryptographic security, or a production implementation.
            </p>
          </section>
          <section id="paper">
            <h2>Read the released paper</h2>
            <p>
              <a className="editorial-text-link" href={pdf} download>
                Download the seven-page PDF ↓
              </a>
            </p>
            <p>
              <a href={pdf} target="_blank" rel="noopener noreferrer">
                Open PDF in a new tab ↗
              </a>
            </p>
            <object
              data={pdf}
              type="application/pdf"
              aria-label={paper.title}
              style={{
                width: "100%",
                height: "75vh",
                minHeight: "360px",
                border: "1px solid currentColor",
              }}
            >
              <p>
                Your browser does not display embedded PDFs.{" "}
                <a href={pdf}>Read or download the paper here.</a>
              </p>
            </object>
          </section>
          <section id="release">
            <h2>A stable, identifiable release</h2>
            <p>{paper.correctionNote}</p>
            <p>
              Original manuscript: September 21, 2026. Public release: October
              1, 2026. Version: {paper.version}.
            </p>
            <p>
              PDF SHA-256:{" "}
              <code style={{ overflowWrap: "anywhere" }}>{paper.sha256}</code>
            </p>
            <p>
              <a
                href={paper.mirrorUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Original public release mirror ↗
              </a>
            </p>
            <p>
              Cite as: Chadbourne, Jonathan Matthew. “{paper.title}.” JCEE Labs,
              public preprint {paper.version}, October 1, 2026.
            </p>
          </section>
        </article>
      </div>
    </EditorialLayout>
  );
}
