import fs from "node:fs";
import {
  publications,
  publicationHref,
} from "../client/src/content/publications";
import { entries } from "../client/src/content/registryEntries";
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
}
fs.writeFileSync(
  "client/public/JCEE_Labs_Public_Registry_v1.2.md",
  "# JCEE Labs Public Registry — Version 1.2\n\nReviewed September 14, 2026. Public summary of selected portfolio records. Historical milestone dates remain distinct from this review date. This publication is not a new experimental execution.\n\n" +
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

const routeMetadata: Record<string, { title: string; description: string }> = {
  "/": {
    title: "JCEE Labs — Verified Operating Improvement",
    description:
      "JCEE Labs develops operating software for industrial distribution and researches execution assurance. Explore our technology, research, and current build progress.",
  },
  "/solutions/distribution": {
    title: "JCEE Distribution — Order Integrity",
    description:
      "Compare purchase orders with sales orders, investigate exceptions, and measure operating improvement. Explore the JCEE Distribution prototype and its next gate.",
  },
  "/operating-cloud": {
    title: "JCEE Operating Cloud — Platform Direction",
    description:
      "A common foundation for industry operating software, beginning with JCEE Distribution. Explore the direction and current evidence.",
  },
  "/technology": {
    title: "Technology — JCEE Labs",
    description:
      "Explore JCEE VOW, QCS, and JCEE Assurance: execution, recovery, current authority, and portable evidence.",
  },
  "/research": {
    title: "Research — JCEE Labs",
    description:
      "Read JCEE technical reports and research briefs with methods, recorded results, and explicit limitations.",
  },
  "/resources": {
    title: "Resources — JCEE Labs",
    description:
      "Company articles, engineering updates, research publications, and the current public build registry.",
  },
  "/company": {
    title: "Company — JCEE Labs",
    description:
      "JCEE Labs builds operating software and researches execution assurance in Dallas, Texas.",
  },
  "/registry": {
    title: "Public Registry — JCEE Labs",
    description:
      "Selected JCEE build milestones, development candidates, and open gates. Reviewed September 14, 2026.",
  },
};
for (const p of publications)
  routeMetadata[publicationHref(p)] = {
    title: `${p.title} — JCEE Labs`,
    description: p.summary,
  };
fs.writeFileSync(
  "client/src/content/routeMetadata.json",
  JSON.stringify(routeMetadata, null, 2) + "\n"
);
