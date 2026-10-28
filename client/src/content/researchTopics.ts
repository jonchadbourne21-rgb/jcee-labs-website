export const researchTopics = [
  {
    slug: "publications",
    title: "Reports & publications",
    description: "Read the methods, results, and limits of each public report.",
    detail: "Technical reports · research notes · public preprints",
  },
  {
    slug: "programs",
    title: "Research programs",
    description:
      "Follow the questions, recorded outcomes, and next qualifying gates.",
    detail: "Current priority · program status · negative results",
  },
  {
    slug: "measurement",
    title: "Measurement & numerical assurance",
    description:
      "Examine the calculation and the evidence supporting its claim.",
    detail: "Numerical assurance · wave models · recovered analysis",
  },
  {
    slug: "physical-experiments",
    title: "Physical experiments",
    description:
      "Explore planned experiments and the observations still to earn.",
    detail: "Proposed studies · controls · physical work pending",
  },
  {
    slug: "fields",
    title: "Research fields",
    description:
      "Explore the dated 25-field portfolio and its unifying question.",
    detail: "Research portfolio · scope · connections",
  },
  {
    slug: "evidence-standards",
    title: "Evidence standards",
    description:
      "Understand what different kinds of evidence can—and cannot—support.",
    detail: "Evidence ladder · review boundaries · public registry",
  },
] as const;

/** Preserve published bookmarks after moving detail into focused topic pages. */
export const legacyResearchFragments: Record<string, string> = {
  "current-research-priority": "programs",
  "measurement-assurance": "measurement",
  "measurement-assurance-title": "measurement",
  "portfolio-title": "fields",
  "evidence-ladder": "evidence-standards",
  "evidence-ladder-title": "evidence-standards",
  "physical-validation": "physical-experiments",
  "physical-validation-title": "physical-experiments",
  "papers-title": "publications",
  "bb84-preprint": "publications",
  "bb84-preprint-title": "publications",
};
