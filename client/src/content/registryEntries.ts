export type RegistryEntry = {
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
  next?: string;
};

export const entries: RegistryEntry[] = [
  {
    id: "distribution",
    name: "JCEE Distribution P0.1",
    kind: "ORDER-INTEGRITY DEVELOPMENT",
    status: "experimental",
    statusLabel: "SYNTHETIC DRY RUN · REAL-WORKFLOW EVALUATION PENDING",
    date: "SEPTEMBER 14, 2026",
    summary:
      "The initial industry workflow compares purchase orders with sales orders and records missing, mismatched, duplicate, or matching records.",
    supports:
      "20/20 expected synthetic classifications matched: 13 PASS, one missing order, five field mismatches, and one duplicate. Zero external effects.",
    boundary:
      "No customer data, email, or live ERP connection was used. No customer ROI, production readiness, buyer willingness, or real-world accuracy rate is established.",
    next: "Obtain a defined company/IT approval before calibration and a limited read-only shadow evaluation.",
    href: "/solutions/distribution",
  },
  {
    id: "crucible-p02",
    name: "CRUCIBLE P0.2",
    kind: "SEMANTIC-KERNEL RESEARCH",
    status: "experimental",
    statusLabel: "BOUNDED PASS · CONVENTIONAL PARITY",
    date: "SEPTEMBER 14, 2026",
    summary:
      "The terminal R52 review records a frozen synthetic benchmark and held-out transfer evaluation, including a conventional comparator.",
    supports:
      "96/96 payment and 64/64 held-out verdicts matched. Go reproduced 160/160 verdicts. The conventional composite also matched all 160.",
    boundary:
      "Synthetic semantic evidence, not exclusive JCEE mechanisms, novelty, independent-team verification, or production safety. P0.2 GitHub CI remains NOT_RUN.",
    next: "Evaluate operational integration burden or independent-team real-system reproduction under a separate gate.",
    href: "/research/crucible-semantic-kernel",
  },
  {
    id: "vow-dev3",
    name: "JCEE VOW 1.1.1.dev3",
    kind: "PRIVATE DEVELOPMENT CANDIDATE",
    status: "experimental",
    statusLabel: "SOURCE ADMITTED · RELEASE ON HOLD",
    date: "SEPTEMBER 10, 2026",
    summary:
      "The exact reviewed candidate and phased CI controls were admitted to private source control. VOW 1.1 remains the frozen runtime milestone.",
    supports:
      "Source admission of the reviewed candidate. The merge is not a new runtime-validation result.",
    boundary:
      "No public release, deployment, or active-root promotion. The separately sealed integration-correctness candidate remains NOT_RUN in the current register.",
    next: "Complete the separately scoped integration-correctness gate; preserve frozen results and version any repair.",
    href: "/vow",
  },
  {
    id: "ap-gate",
    name: "AP Gate",
    kind: "PAYMENT EXECUTION ASSURANCE DEVELOPMENT",
    status: "experimental",
    statusLabel: "LOCAL REFERENCE BUILD · EXTERNAL INTEGRATION OPEN",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "Contract, execution/recovery, and independent-verifier reference code are present. The verifier derives bounded conclusions from declared evidence.",
    supports:
      "The reference slice includes local execution/recovery and signed, role-bound verification. A bounded sandbox read assessment is recorded separately.",
    boundary:
      "Local reference behavior and sandbox reads do not establish complete provider-route closure, production payment control, or customer economics.",
    next: "Resolve external authority and route questions within the explicitly approved evaluation scope.",
    href: "/technology",
  },

  {
    id: "jcee-vow-1-1",
    name: "JCEE VOW 1.1",
    kind: "EXECUTION RUNTIME",
    status: "verified",
    statusLabel: "VERIFIED MILESTONE · ACTIVE HARDENING",
    date: "AUGUST 12, 2026",
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
    date: "AUGUST 13, 2026",
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
    name: "JEC 1.0 / 1.0.1 successor",
    kind: "PORTABLE EVIDENCE CONTRACT",
    status: "defined",
    statusLabel: "DEFINED CONTRACT · APPROVED SUCCESSOR",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "A runtime-neutral evidence contract for carrying typed records, scope, lineage, commitments, and declared uncertainty.",
    supports:
      "The current register carries forward JEC 1.0.1 packaging R1 with corrected 8/8 validation and the approved variant A. Packaging validation does not prove the truth of a record.",
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
    date: "REVIEWED SEPTEMBER 14, 2026",
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
    statusLabel: "LOCAL HARNESS REPRODUCED · MODEL TEST NOT RUN",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "A separate judgment lane for testing whether a reviewer can rederive a terminal result without trusting the original narrator.",
    supports:
      "Frozen deterministic stages remain preserved. The P0.4 local harness reproduced 5/5; the provider/model experiment remains unexecuted. A harness result is not a model result.",
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
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "The presentation and inspection layer for claim-to-effect records, verification output, and replayable evidence.",
    supports:
      "The preserved synthetic refund pilot reports 11/11 cases and 14 tests. Evidence admission, snapshot verification, and operator display are connected in bounded local scope.",
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
    supports: "A governing JCEE Labs research standard.",
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
