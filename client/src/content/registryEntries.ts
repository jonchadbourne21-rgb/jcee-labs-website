export type RegistryEntry = {
  id: string;
  group: string;
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
    statusLabel: "VERIFIED SOURCE CANDIDATE · REAL WORKFLOW NOT RUN",
    date: "SEPTEMBER 14, 2026",
    summary:
      "The initial industry workflow compares purchase orders with sales orders and records missing, mismatched, duplicate, or matching records.",
    supports:
      "20/20 expected synthetic classifications matched: 13 PASS, one missing order, five field mismatches, and one duplicate. The frozen source candidate reproduced 3/3 local tests. Zero external effects.",
    boundary:
      "The source review remains open and unmerged. A CI workflow exists, but no CI run was observed in the current receipt. No customer data, email, or live ERP connection; no customer ROI or real-world accuracy claim.",
    next: "Obtain a defined company/IT approval before calibration and a limited read-only shadow evaluation.",
    href: "/solutions/distribution",
    group: "Platforms",
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
    group: "Research",
  },
  {
    id: "vow-dev3",
    name: "JCEE VOW 1.1.1.dev3",
    kind: "PRIVATE DEVELOPMENT CANDIDATE",
    status: "experimental",
    statusLabel: "INTERNAL USABILITY ACCEPTED · RELEASE ON HOLD",
    date: "SEPTEMBER 10, 2026",
    summary:
      "The exact reviewed candidate and phased CI controls were admitted to private source control. VOW 1.1 remains the frozen runtime milestone.",
    supports:
      "The exact dev3 source was admitted privately. The September 10 reviewed founder-usability return records one synthetic dry run, zero recorded effects, and retrieval of the same full receipt without rerunning the quest. The founder accepted the bounded internal experience.",
    boundary:
      "Usability acceptance does not establish installed-wheel full-suite parity or production readiness. Release, deployment, and active-root promotion remain on hold. The separate integration-correctness candidate remains NOT_RUN.",
    next: "Complete the separately scoped integration-correctness gate; preserve frozen results and version any repair.",
    href: "/vow",
    group: "Execution",
  },
  {
    id: "ap-gate",
    name: "AP Gate",
    kind: "PAYMENT EXECUTION ASSURANCE DEVELOPMENT",
    status: "experimental",
    statusLabel: "REFERENCE BUILD · GOVERNED-REPAIR COMPARISON COMPLETE",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "Contract, execution/recovery, and independent-verifier reference code are present. The verifier derives bounded conclusions from declared evidence.",
    supports:
      "The practical comparison completed 78 local executions across 26 synthetic worlds and three lanes, with zero scored safety violations. Conventional governed repair fulfilled 9/9 eligible effects, the ELP verifier integration 8/9, and block-only 5/9.",
    boundary:
      "No incremental ELP value was shown in this slice. One acknowledgement remained unresolved per lane. Native target integration and production payment control remain unqualified.",
    next: "Use conventional governed repair as the reference; qualify the durable target and restart/observation boundary before product promotion.",
    href: "/technology",
    group: "Execution",
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
    group: "Execution",
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
    group: "Research",
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
    group: "Assurance",
  },
  {
    id: "jcee-assurance",
    name: "JCEE Assurance",
    kind: "CLAIM-SCOPED VERIFICATION",
    status: "experimental",
    statusLabel: "FROZEN VERIFICATION AND LEDGER MILESTONES",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "Research into independently deriving bounded execution conclusions from named evidence, authority, scope, and verification rules.",
    supports:
      "JA-P0.3 and JA-P0.4 have separate preserved verification and cross-host ledger receipts. Their specific versions and limits are listed below; they are not one blanket system certification.",
    boundary:
      "Not a universal exactly-once guarantee, generalized Byzantine-resilience claim, or third-party certification.",
    href: "/assurance",
    group: "Assurance",
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
    group: "Assurance",
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
    group: "Assurance",
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
    group: "Standards",
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
    group: "Standards",
  },
  {
    id: "crucible-p03",
    name: "CRUCIBLE P0.3",
    group: "Research",
    kind: "COMPOSITION AND FAILURE OPERATIONS",
    status: "experimental",
    statusLabel: "BROAD CLAIM RETIRED · NARROW RESIDUAL",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "The completed successor tests operational burden against a strong conventional composition. P0.2 remains preserved.",
    supports:
      "Both lanes met the tested safety criteria. Four burden axes tied; integration touchpoints were 3 versus 5. The terminal result retired the broad composition-compression claim. The recorded Python 3.10/3.12 CI reproduction passed.",
    boundary:
      "Synthetic, same-author research. No general advantage, independent-team verification, customer economics, or production-safety result.",
    href: "/research/crucible-composition-tax",
  },
  {
    id: "ja-p03",
    name: "JA-P0.3 Independent Verification Kernel",
    group: "Assurance",
    kind: "FROZEN VERIFIER",
    status: "verified",
    statusLabel: "BOUNDED REPRODUCTION COMPLETE",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "A verifier that derives claim-scoped conclusions from declared evidence.",
    supports:
      "The locked reproduction recorded 30/30 compatibility checks, 14/14 native checks, and 500/500 mutations for two active profiles.",
    boundary:
      "Three QCS-dependent profiles remain blocked by the absent exact accepted specification digest. No universal authority-truth claim.",
    href: "/assurance",
  },
  {
    id: "ja-p04",
    name: "JA-P0.4 Immutable Evidence Ledger",
    group: "Assurance",
    kind: "FROZEN LEDGER AND SNAPSHOTS",
    status: "verified",
    statusLabel: "CROSS-HOST REPRODUCTION COMPLETE",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "Preserves admitted evidence and verifiable snapshots for downstream inspection.",
    supports:
      "The final receipt records 27 native checks, 100 determinism checks, and 1,000 mutations on two hosts. The component is used in the bounded Evidence Engine slice.",
    boundary:
      "Ledger integrity does not prove external truth or activate blocked verifier profiles.",
    href: "/assurance",
  },
  {
    id: "jec-ea",
    name: "JEC-EA P0.2A",
    group: "Assurance",
    kind: "EXTERNAL EVIDENCE ANCHORING",
    status: "experimental",
    statusLabel: "BOUNDED HOST-B QUALIFICATION",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "Research into anchoring portable evidence to external timestamp and transparency records.",
    supports:
      "The Host-B RUN2 receipt reports a bounded timestamp/transparency qualification using the pinned contract variant and a synthetic transparency anchor.",
    boundary:
      "External key custody, immutable storage, formal P0.2 authority, and Host-A consumption remain unqualified.",
    href: "/assurance",
  },
  {
    id: "vow-i1",
    name: "VOW I1 Integration Correctness",
    group: "Execution",
    kind: "INTEGRATION CANDIDATE",
    status: "experimental",
    statusLabel: "SEALED CANDIDATE · NOT RUN",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "The separately scoped integration-correctness evaluation for VOW.",
    supports:
      "A sealed 32-test candidate is recorded. Its presence is preparation, not a completed execution result.",
    boundary:
      "No integration-correctness pass or release promotion follows from the candidate.",
    href: "/vow",
  },
  {
    id: "vow-dx",
    name: "VOW Developer Experience Bridge",
    group: "Execution",
    kind: "DEVELOPER WORKFLOW DESIGN",
    status: "experimental",
    statusLabel: "D0 DESIGN PREREGISTERED · NOT IMPLEMENTED",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "A planned bridge between developer workflows and reviewable execution evidence.",
    supports: "A private design and acceptance package exists.",
    boundary:
      "No implementation or runtime test. The public editor naming/release remains held behind the separate integration gate.",
    href: "/vow",
  },
  {
    id: "aeel",
    name: "AEEL-0009",
    group: "Execution",
    kind: "EDGE-LANGUAGE RESEARCH PROTOTYPE",
    status: "experimental",
    statusLabel: "PROTOTYPE ARCHIVE RECOVERED",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "A separate language and execution-tooling research asset for edge workflows.",
    supports:
      "The archive contains connected language, model, telemetry, and attestation tooling.",
    boundary:
      "Research fixtures do not establish hardware enforcement, real key custody, or deployment integration. AEEL is a separate asset from VOW.",
    href: "/technology",
  },
  {
    id: "compound",
    name: "JCEE Compounding System P0.5",
    group: "Assurance",
    kind: "CROSS-SYSTEM EVIDENCE",
    status: "verified",
    statusLabel: "FROZEN BOUNDED CANDIDATE",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "Tests whether evidence can retain attributable provenance as it moves between systems.",
    supports:
      "The preserved P0.5 gate passed 33/33 invariants on Python 3.10 and 3.12.",
    boundary:
      "Attributable provenance is not world truth, competent authority, or permission to execute. No automatic P0.6.",
    href: "/assurance",
  },
  {
    id: "autography",
    name: "AUTOGRAPHY P0.7",
    group: "Research",
    kind: "SOFTWARE TOPOLOGY RESEARCH",
    status: "experimental",
    statusLabel: "BOUNDED RESULT PRESERVED · CI BLOCKED",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary: "Cross-domain software topology discovery research.",
    supports:
      "The frozen result is KNOWN / PASS_BOUNDED with zero novel primitives. The preserved source archive is authoritative for that result.",
    boundary:
      "The historical repository archive is malformed; no green P0.7 CI or P0.8 result is claimed.",
    href: "/research",
  },
  {
    id: "howm",
    name: "Howm.ai Platform R3",
    group: "Personal apps",
    kind: "PERSONAL APPLICATION SUITE",
    status: "experimental",
    statusLabel: "IMPLEMENTED CANDIDATE · NOT LAUNCHED",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary: "The separate JCEE personal-app platform and catalog.",
    supports:
      "Eight routes built; 11/11 DOM interaction checks and 20/20 source-file readbacks matched.",
    boundary:
      "Rendered browser/device acceptance, service integration, merge, deployment, and public launch remain open.",
    href: "/company",
  },
  {
    id: "mise",
    name: "MISE / SOUS source lineage",
    group: "Personal apps",
    kind: "PERSONAL CULINARY APPLICATION",
    status: "experimental",
    statusLabel: "SOURCE SNAPSHOT VERIFIED · RUNTIME UNVERIFIED",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "The personal culinary application in the Howm suite. The preserved source and earlier receipts use the SOUS name.",
    supports:
      "A complete 214-file source snapshot was copied and matched by path, mode, and blob identity.",
    boundary:
      "Snapshot identity is not a build, provider-connection, semantic-memory, deployment, or production-readiness result.",
    href: "/company",
  },
  {
    id: "mirrored",
    name: "Mirrored / Higher Self",
    group: "Personal apps",
    kind: "PERSONAL REFLECTION APPLICATION",
    status: "experimental",
    statusLabel: "BACKEND AND IOS DEVELOPMENT",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "A personal application centered on reflection and the higher-self experience.",
    supports:
      "Backend and iOS repositories and application routes exist. The current review records prepared chat/check-in error-handling fixes.",
    boundary:
      "Full builds, device acceptance, and current production validation remain to be established. This work is separate from VOW.",
    href: "/company",
  },
  {
    id: "lem",
    name: "LEM / ESL",
    group: "Research",
    kind: "LEARNING AND TEACHING ORCHESTRATION",
    status: "experimental",
    statusLabel: "SYNTHETIC INTEGRATION MILESTONE",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary: "Research into evidence-informed learning and teaching workflows.",
    supports:
      "The preserved synthetic week reports 13/13 checks across connected learning components.",
    boundary:
      "No educational-efficacy, learner-proficiency, or production-launch result.",
    href: "/research",
  },
  {
    id: "lam",
    name: "LAM P0.1",
    group: "Research",
    kind: "MISUSE-TRACE BENCHMARK",
    status: "experimental",
    statusLabel: "HARNESS CONFORMANCE · MODEL RESULT PENDING",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "A local benchmark for preserving and scoring misuse-related traces.",
    supports:
      "Three reference cases cover normal operation, read failure, and prompt-injection containment.",
    boundary: "A functioning harness does not establish live model behavior.",
    href: "/research",
  },
  {
    id: "vela",
    name: "VELA",
    group: "Research",
    kind: "SEMANTIC RETRIEVAL RESEARCH",
    status: "experimental",
    statusLabel: "R4 OVERALL FAIL · R6 CHECKPOINT",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary: "A synthetic retrieval and evaluation research pipeline.",
    supports:
      "R4 was a valid study with a narrow supported effect, but missed all three absolute capability thresholds.",
    boundary:
      "No production retrieval capability. The R6 primary execution remains locked pending its named prerequisites.",
    href: "/research",
  },
  {
    id: "tot",
    name: "TOT 0.3R1",
    group: "Research",
    kind: "MATHEMATICAL CORE",
    status: "verified",
    statusLabel: "FROZEN MATHEMATICAL MILESTONE",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "A finite relational mathematical research core, separate from implementation experiments.",
    supports: "The frozen T1–T13 core has been recovered.",
    boundary:
      "Later 0.4 acceptance still requires exact evidence backfill. No physical correspondence or automatic runtime capability.",
    href: "/research",
  },
  {
    id: "rtl",
    name: "RTL-SR P0.8",
    group: "Research",
    kind: "CONTINUUM AND LOCALITY RESEARCH",
    status: "experimental",
    statusLabel: "CONDITIONAL PASS · PHYSICAL BRIDGE NO-GO",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "Research into the mathematical assumptions needed for continuum and locality claims.",
    supports: "A conditional result holds in the declared continuum class.",
    boundary:
      "Abstract-graph locality and the physical bridge remain NO_GO. No independently derived physical geometry or empirical clock law.",
    href: "/research",
  },
  {
    id: "gmda",
    name: "GMDA P0.3–P0.5",
    group: "Research",
    kind: "PHYSICAL-EXPERIMENT FEASIBILITY",
    status: "experimental",
    statusLabel: "FEASIBILITY STUDIED · FULL STACK NOT READY",
    date: "REVIEWED SEPTEMBER 14, 2026",
    summary:
      "Feasibility research for a proposed physical measurement program.",
    supports:
      "P0.3 identified a source-modulation path; P0.4 identified an institutional path while recording incomplete sensor-stack maturity.",
    boundary:
      "P0.5 qualification is preregistered, not run. No partner access, outreach result, physical campaign, or new-physics result.",
    href: "/research",
  },
];

export const registryGroups = [
  "Platforms",
  "Execution",
  "Assurance",
  "Research",
  "Personal apps",
  "Standards",
];
export const groupId = (name: string) =>
  name.toLowerCase().replaceAll(" ", "-");
