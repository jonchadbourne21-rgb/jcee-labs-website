import React from "react";
import { bb84PublicRelease as paper } from "@/content/bb84Release";

export default function BB84PublicPreprint() {
  return (
    <article
      id="bb84-preprint"
      className="resource-card mb-6 min-w-0"
      aria-labelledby="bb84-preprint-title"
    >
      <p className="editorial-kicker">
        {paper.kind} · {paper.version} ·{" "}
        <time dateTime={paper.date}>October 1, 2026</time>
      </p>
      <h3 id="bb84-preprint-title">
        <a href={paper.landingUrl} target="_blank" rel="noopener noreferrer">
          {paper.title}
        </a>
      </h3>
      <p>{paper.author} · JCEE Labs</p>
      <p>{paper.summary}</p>
      <p>{paper.reviewNote}</p>
      <p>{paper.scopeNote}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <a
          className="editorial-text-link"
          href={paper.landingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read public preprint ↗
        </a>
        <a
          className="editorial-text-link"
          href={paper.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download PDF ↗
        </a>
      </div>
      <details className="mt-5">
        <summary>Release record and PDF checksum</summary>
        <p>{paper.record} · {paper.version}</p>
        <p>{paper.correctionNote}</p>
        <p>
          Released PDF SHA-256:{" "}
          <code style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
            {paper.sha256}
          </code>
        </p>
      </details>
    </article>
  );
}
