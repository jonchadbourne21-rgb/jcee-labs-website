import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = path.resolve(import.meta.dirname);
const page = readFileSync(path.join(sourceRoot, "pages", "ResearchFieldsPage.tsx"), "utf8");
const app = readFileSync(path.join(sourceRoot, "App.tsx"), "utf8");
const research = readFileSync(path.join(sourceRoot, "pages", "ResearchPage.tsx"), "utf8");
const resources = readFileSync(path.join(sourceRoot, "pages", "ResourcesPage.tsx"), "utf8");
const footer = readFileSync(path.join(sourceRoot, "components", "BrandFooter.tsx"), "utf8");
const plain = (source: string) => source.replace(/\s+/g, " ");

const fieldTitles = [
  "Trustworthy AI & AI Assurance",
  "Agentic Systems & Autonomous Software",
  "Distributed Systems",
  "Formal Methods & Software Verification",
  "Authorization, Delegation & Computer Security",
  "Provenance, Evidence & Auditability",
  "Causal Inference & Causal Assurance",
  "Quantum Information Science",
  "Quantum Foundations",
  "Quantum Communication Complexity",
  "Quantum Causal Inference",
  "Information Theory",
  "Computability / Limits of Knowledge",
  "Resilient Computing & Fault Tolerance",
  "Complex Systems & Coordination Science",
  "Topology Applied to State Systems",
  "Programming Languages, Runtimes & Compiler Architecture",
  "Database & Temporal-State Systems",
  "AI Memory & Knowledge Systems",
  "Human-AI Interaction",
  "Machine Learning Evaluation",
  "Applied AI Safety",
  "Fintech / Payment-System Reliability",
  "Acoustics & Spatial Audio Computing",
  "Computational Culinary Intelligence",
];

describe("research portfolio public surface", () => {
  it("publishes all 25 named fields from the September 18 portfolio reference", () => {
    expect((page.match(/id: "\d{2}"/g) ?? []).length).toBe(25);
    for (const title of fieldTitles) expect(page).toContain(title);
    expect(page).toContain("SIGRESO");
    expect(page).toContain("MISE");
    expect(page).toContain("JAIR and LLVM-style ecosystem research");
  });

  it("preserves the unifying research question and interdisciplinary identity", () => {
    expect(plain(page)).toContain(
      "How do you determine what a system actually knows, what that evidence permits it to conclude, what authority it possesses, and what consequences it may safely produce?"
    );
    for (const domain of [
      "Computer science",
      "Artificial intelligence",
      "Mathematics",
      "Information theory",
      "Quantum information",
      "Distributed systems",
      "Epistemology",
    ]) expect(page).toContain(domain);
  });

  it("places the portfolio under Research and links it from the reference surfaces", () => {
    expect(app).toContain('path="/research/fields"');
    expect(research).toContain('href="/research/fields"');
    expect(resources).toContain('href="/research/fields"');
    expect(footer).toContain('href="/research/fields"');
  });
});
