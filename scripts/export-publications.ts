import fs from "node:fs";
import pageSeo from "../client/src/content/pageSeo.json";
import {
  publications,
  publicationHref,
} from "../client/src/content/publications";
import { entries } from "../client/src/content/registryEntries";
import { bb84PublicRelease as paper } from "../client/src/content/bb84Release";
fs.mkdirSync("client/public/publications", { recursive: true });
for (const item of publications) {
  const text =
    `# ${item.title}\n\n${item.kind} · ${item.author || "JCEE Labs"} · ${item.date} · Version 1.0\n\n${item.summary}\n\n` +
    item.sections
      .map(
        s =>
          `## ${s.title}\n\n${s.paragraphs.join("\n\n")}\n${s.bullets ? "\n" + s.bullets.map(b => `- ${b}`).join("\n") + "\n" : ""}`
      )
      .join("\n") +
    (item.related
      ? "\n## Continue reading\n\n" +
        item.related
          .map(link => `- [${link.label}](https://jceelabs.com${link.href})`)
          .join("\n") +
        "\n"
      : "");
  fs.writeFileSync(`client/public/publications/${item.slug}.md`, text);
  fs.writeFileSync(`client/public/publications/${item.slug}.txt`, text);
}
fs.writeFileSync(
  "client/public/JCEE_WorldLab_Public_Registry_v1.6.md",
  "# JCEE WorldLab Public Registry — Version 1.6\n\nPrepared November 6, 2026. This successor corrects the Autography P0.7 CI status after review on November 6, 2026; the broader portfolio review remains through November 4, 2026 (America/Chicago). Dates below identify each result or review; preparation of this file is not proof of live website publication. Earlier entries remain dated historical records. Versions 1.0–1.5 are preserved unchanged.\n\nThis is a selected first-party public record, not a new execution of every program, independent certification or a production release. Public summaries describe capabilities, recorded observations, scope and limitations. Private implementation, unpublished derivations, exact experimental protocols and third-party confidential material are excluded. Detailed disclosure requires a separate appropriate agreement.\n\nFull G0 is not admitted and has not run. Independent review and final runtime bindings remain required. P3 remains partial, physical A4 remains open, and production release remains on hold.\n\n" +
    entries
      .map(
        e =>
          `## ${e.name}\n\n${e.kind} · ${e.date}\n\n**Status:** ${e.statusLabel}\n\n${e.summary}\n\n**Recorded support:** ${e.supports}\n\n**Boundary:** ${e.boundary}\n\n${e.next ? `**Next gate:** ${e.next}\n\n` : ""}${e.href ? `[Public context](https://jceelabs.com${e.href})\n` : ""}`
      )
      .join("\n")
);
console.log(
  `Exported ${publications.length} publications and ${entries.length} registry entries.`
);

const routeMetadata: Record<
  string,
  { title: string; description: string; type?: string; publishedTime?: string }
> = {
  [paper.landingUrl]: {
    title: `${paper.title} — JCEE WorldLab`,
    description: paper.summary,
    type: "article",
    publishedTime: paper.date,
  },
  "/": {
    title: "JCEE WorldLab — Accountable AI-Assisted Operations",
    description:
      "JCEE WorldLab develops methods and software that connect AI-assisted operational actions to clear permissions, reviewable evidence, and human control.",
  },
  "/solutions/distribution": {
    title: "JCEE Distribution — Order Integrity",
    description:
      "Compare purchase orders with sales orders, investigate exceptions, and measure operating improvement. Explore the JCEE Distribution prototype and its next gate.",
  },
  "/operating-cloud": {
    title: "JCEE Operating Cloud — Platform Direction",
    description:
      "Explore JCEE’s platform direction for accountable AI-assisted operations, its current evidence, and the implementation gates still ahead.",
  },
  "/technology": {
    title: "Technology — JCEE WorldLab",
    description:
      "Review JCEE WorldLab's native recovery, installed interfaces, hosted evidence and formal research, with the full integration and physical qualification gates still open.",
  },
  "/research": {
    title: "Research — JCEE WorldLab",
    description:
      "Read JCEE technical reports and research briefs with methods, recorded results, and explicit limitations.",
  },
  "/research/fields": {
    title: "Research Fields — JCEE WorldLab",
    description:
      "Explore JCEE WorldLab's dated 25-field research portfolio and its current focus on qualifying a connected assurance path, with distinct mathematical, numerical, and physical evidence.",
  },
  "/resources": {
    title: "Resources — JCEE WorldLab",
    description:
      "Company articles, engineering updates, research publications, and the current public build registry.",
  },
  "/company": {
    title: "Company — JCEE WorldLab",
    description:
      "JCEE WorldLab develops methods and software for accountable AI-assisted operations. Read about the company, its principles, and its research.",
  },
  "/registry": {
    title: "Public Registry — JCEE WorldLab",
    description:
      "Selected results through November 4, 2026: software qualification, quantum observations, modeling, planned programs and explicit limits.",
  },
};
Object.assign(routeMetadata, pageSeo);
for (const p of publications)
  routeMetadata[publicationHref(p)] = {
    title: `${p.title} — JCEE WorldLab`,
    description: p.summary,
    type: "article",
    publishedTime: `${p.date}T00:00:00Z`,
  };
fs.writeFileSync(
  "client/src/content/routeMetadata.json",
  JSON.stringify(routeMetadata, null, 2) + "\n"
);

// Inventory is shared by sitemap generation, prerendering, and production routing.
const publicRoutes = [
  ...new Set(
    [
      ...fs
        .readFileSync("client/src/App.tsx", "utf8")
        .matchAll(/<Route\s+path="([^"]+)"/g),
    ].map(m => m[1])
  ),
].filter(p => !p.startsWith("/admin") && p !== "/404");
fs.writeFileSync(
  "client/src/content/publicRoutes.json",
  JSON.stringify(publicRoutes, null, 2) + "\n"
);
fs.copyFileSync("robots.txt", "client/public/robots.txt");
const sitemapRoutes = publicRoutes.filter(p => p !== "/research-evidence");
fs.writeFileSync(
  "client/public/sitemap.xml",
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    sitemapRoutes
      .map(p => `  <url><loc>https://jceelabs.com${p}</loc></url>`)
      .join("\n") +
    "\n</urlset>\n"
);
