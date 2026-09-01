import { useEffect } from "react";
import BrandFooter from "@/components/BrandFooter";
import CoreHeader from "@/components/CoreHeader";
import CurlicueField from "@/components/CurlicueField";

type RegistryEntry = {
  id: string;
  name: string;
  kind: string;
  status: "verified" | "experimental" | "defined" | "adopted";
  statusLabel: string;
  date: string;
  summary: string;
  supports: string;
  boundary: string;
  href?: string;
};

const entries: RegistryEntry[] = [
  {
    id: "jcee-vow-1-1",
    name: "JCEE VOW 1.1",
    kind: "EXECUTION RUNTIME",
    status: "verified",
    statusLabel: "VERIFIED MILESTONE · ACTIVE HARDENING",
    date: "AUGUST 2026",
    summary:
      "A pinned JCEE VOW release and preserved verification record for evidence-first execution, interruption, recovery, and bounded verdicts.",
    supports:
      "A defined release exists and its covered behavior completed the named internal release gate.",
    boundary:
      "Not independent certification, universal safety, default legal compliance, or production readiness in every environment.",
    href: "/vow",
  },
  {
    id: "qcs-2-0",
    name: "QCS-2.0",
    kind: "TRANSITION CALCULUS RESEARCH",
    status: "verified",
    statusLabel: "VERIFIED MILESTONE · CORE FROZEN",
    date: "AUGUST 2026",
    summary:
      "A workflow-free transition-legality calculus for deciding whether current authoritative evidence justifies a proposed transition.",
    supports:
      "The frozen normative core passed its planned reproduction gate across the two tested authority classes.",
    boundary:
      "Not universal correctness, production readiness, or guaranteed transfer to every future substrate.",
    href: "/qcs",
  },
  {
    id: "jec-1-0",
    name: "JEC 1.0",
    kind: "PORTABLE EVIDENCE CONTRACT",
    status: "defined",
    statusLabel: "DEFINED SPECIFICATION · BOUNDED VALIDATION",
    date: "AUGUST 2026",
    summary:
      "A runtime-neutral evidence contract for carrying typed records, scope, lineage, commitments, and declared uncertainty.",
    supports:
      "A stable public concept and bounded structural-validation record for portable execution evidence.",
    boundary:
      "A well-formed or signed record does not by itself prove that its source was competent, complete, current, or truthful.",
    href: "/assurance",
  },
  {
    id: "jcee-assurance",
    name: "JCEE Assurance",
    kind: "CLAIM-SCOPED VERIFICATION",
    status: "experimental",
    statusLabel: "EXPERIMENTAL · FROZEN VERIFIER STAGES",
    date: "AUGUST 2026",
    summary:
      "Research into independently deriving bounded execution conclusions from named evidence, authority, scope, and verification rules.",
    supports:
      "Deterministic verifier stages and adversarial evidence work exist within recorded experimental boundaries.",
    boundary:
      "Not a universal exactly-once guarantee, generalized Byzantine-resilience claim, or third-party certification.",
    href: "/assurance",
  },
  {
    id: "iej",
    name: "IEJ",
    kind: "INDEPENDENT EVIDENCE JUDGMENT",
    status: "experimental",
    statusLabel: "EXPERIMENTAL · DETERMINISTIC BASELINE",
    date: "AUGUST 2026",
    summary:
      "A separate judgment lane for testing whether a reviewer can rederive a terminal result without trusting the original narrator.",
    supports:
      "A bounded deterministic baseline and staged evaluation record.",
    boundary:
      "The current record does not establish general-purpose judgment correctness or replace qualified external review.",
    href: "/assurance",
  },
  {
    id: "evidence-engine",
    name: "Evidence Engine",
    kind: "INSPECTION AND REPLAY",
    status: "experimental",
    statusLabel: "EXPERIMENTAL · BOUNDED SHADOW SLICE",
    date: "AUGUST 2026",
    summary:
      "The presentation and inspection layer for claim-to-effect records, verification output, and replayable evidence.",
    supports:
      "A bounded local shadow-slice milestone and preserved evidence package.",
    boundary:
      "Presentation does not strengthen the underlying evidence, establish external truth, or substitute for an independent verifier.",
    href: "/assurance",
  },
  {
    id: "jrp-000",
    name: "JRP-000 · The Evidence Boundary",
    kind: "RESEARCH GOVERNANCE",
    status: "adopted",
    statusLabel: "ADOPTED STANDARD",
    date: "AUGUST 13, 2026",
    summary:
      "The public standard governing claim cards, evidence packages, admission gates, verdict language, limitations, and corrections.",
    supports:
      "A governing JCEE Labs research standard.",
    boundary:
      "An institutional standard, not an empirical result, external consensus standard, or independent certification.",
    href: "/research/jrp-000",
  },
  {
    id: "first-principle",
    name: "JCEE First Principle",
    kind: "INSTITUTIONAL GOVERNANCE",
    status: "adopted",
    statusLabel: "ADOPTED STANDARD",
    date: "AUGUST 31, 2026",
    summary:
      "Hypotheses may begin with experience, intuition, coherence, imagination, serendipity, faith, love, or felt meaning. Consequential authority still must be earned.",
    supports:
      "A governing separation between hypothesis generation, empirical claim, system state, and consequential authority.",
    boundary:
      "The principle does not settle metaphysical questions; it constrains what JCEE may claim or authorize from available evidence.",
    href: "/charter",
  },
];

const classifications = [
  ["VERIFIED MILESTONE", "A specific bounded claim survived its named gate and the supporting evidence was preserved."],
  ["EXPERIMENTAL", "Results exist, but reproduction, transfer, adversarial review, or external verification remains incomplete."],
  ["DEFINED SPECIFICATION", "A stable public specification or contract exists; implementation and transfer claims remain separately bounded."],
  ["ADOPTED STANDARD", "A governance rule adopted by JCEE Labs. It is not an empirical result."],
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

      <section className="program-masthead registry-program">
        <p className="eyebrow"><span /> PUBLIC RECORD · CURRENT</p>
        <div className="program-number">JCEE PUBLIC REGISTRY</div>
        <h1>
          A living record.<br />
          <em>Not a highlight reel.</em>
        </h1>
        <p className="program-deck">
          The public registry records what JCEE Labs can responsibly say about
          selected systems, research programs, and governing standards.
        </p>
        <div className="program-status-row">
          <span>PUBLIC PROJECTION · SANITIZED</span>
          <span>PRIVATE SOURCE AND COUNSEL MATERIAL · EXCLUDED</span>
        </div>
      </section>

      <section className="program-statement registry-position">
        <p className="charter-section-label">PUBLIC CLAIM CONTROL</p>
        <h2>The registry shows status, evidence boundary, and limitation.</h2>
        <div className="program-statement-copy">
          <p>
            The internal JCEE register contains substantially more detail:
            source identity, evidence locations, review history, failures,
            restart points, next gates, and protected materials.
          </p>
          <p>
            This page is a controlled public derivative. It provides enough
            information to understand our claims without publishing private
            code, attack corpora, verifier internals, patent-counsel material,
            or enabling implementation details.
          </p>
          <div className="program-links">
            <a href="/JCEE_Labs_Public_Registry_v1.0.md" download>
              DOWNLOAD REGISTRY VERSION 1.0 <span>↓</span>
            </a>
            <a href="/research/jrp-000">
              READ JRP-000 <span>→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="registry-classifications" aria-labelledby="registry-classifications-title">
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

      <section className="registry-records" aria-labelledby="registry-records-title">
        <div className="section-index">
          <span>SELECTED PUBLIC RECORDS</span>
          <span>UPDATED · AUGUST 31, 2026</span>
        </div>
        <h2 id="registry-records-title">Current public entries.</h2>

        <div className="registry-grid">
          {entries.map((entry, index) => (
            <article className="registry-entry" id={entry.id} key={entry.id}>
              <div className="registry-entry-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="registry-entry-body">
                <div className="registry-entry-topline">
                  <span>{entry.kind}</span>
                  <span>{entry.date}</span>
                </div>
                <h3>{entry.name}</h3>
                <span className={`registry-status registry-status-${entry.status}`}>
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
                </dl>
                {entry.href ? (
                  <a href={entry.href}>VIEW PUBLIC CONTEXT <span>→</span></a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
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

      <section className="curlicue-section registry-curlicue" aria-labelledby="registry-curlicue-title">
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
            <h2 id="registry-curlicue-title">Perfect rule.<br />No true repeat.</h2>
            <p>
              This live client-side field demonstrates how a small public rule
              can generate intricate non-periodic geometry. It is presented as
              a mathematical visualization, not as QCS execution, proof of a
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
