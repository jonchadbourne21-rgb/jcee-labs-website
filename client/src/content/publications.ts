export type Publication = {
  slug: string;
  title: string;
  kind:
    | "From the Founder"
    | "Company blog"
    | "Engineering blog"
    | "Technical report"
    | "Research brief";
  date: string;
  author?: string;
  related?: { label: string; href: string }[];
  summary: string;
  sections: { title: string; paragraphs: string[]; bullets?: string[] }[];
};

export const publications: Publication[] = [
  {
    slug: "start-with-the-workflow",
    title: "Start with the workflow. Earn the next step.",
    kind: "Company blog",
    date: "2026-09-14",
    summary:
      "Why JCEE begins alongside existing business systems and measures value before expanding its role.",
    sections: [
      {
        title: "The work between systems",
        paragraphs: [
          "A purchase order arrives by email. Someone enters it into an ERP. Another person checks the freight account, price, ship-to address, and quantities. The transaction may be digital from end to end, yet the work of keeping it consistent still falls to people.",
          "JCEE Labs is starting with that work. Our first industry focus is industrial distribution, where small discrepancies can create additional checking, corrections, delays, or margin loss. Our product direction begins with comparing records and making exceptions easier to investigate.",
        ],
      },
      {
        title: "Keep the systems that already run the business",
        paragraphs: [
          "The first step is an overlay on an existing workflow. A customer should be able to evaluate whether the comparison is useful while keeping its normal order-entry process. The proposed initial evaluation is read-only, with people reviewing every flagged exception.",
          "We call this sequence Overlay, Assure, Assist, Own workflow, and Vertical OS. Each step is a direction to earn through evidence. It is not a claim that the complete platform exists today. Greater automation requires its own operational evidence and authorization.",
        ],
      },
      {
        title: "Measure operating improvement",
        paragraphs: [
          "A useful product must justify the attention it asks of a team. The measurements we propose include supported order discrepancies, checking and correction time, first-pass accuracy, manual touches, and the burden of reviewing false alarms.",
          "Actual savings need case evidence. Time saved should only count as usable capacity when the team can use it. A synthetic test cannot establish customer ROI, and one successful evaluation would not establish repeatability across an industry.",
        ],
      },
      {
        title: "Where we are now",
        paragraphs: [
          "A September 14 synthetic dry run matched all 20 expected classifications across normal, missing, mismatched, and duplicate orders. It used no customer data or live ERP connection and caused no external effects.",
          "The next step is an explicitly approved, limited shadow evaluation: calibrate matching, inspect the exceptions, measure the work, and decide whether to continue. The research behind JCEE remains essential, but the customer’s first question is practical: does this improve our work?",
        ],
      },
    ],
  },
  {
    slug: "distribution-first-dry-run",
    title: "JCEE Distribution: the first order-integrity dry run",
    kind: "Engineering blog",
    date: "2026-09-14",
    summary:
      "Twenty synthetic purchase orders, four result categories, and a clear boundary for the next evaluation.",
    sections: [
      {
        title: "What we tested",
        paragraphs: [
          "The initial Distribution workflow compares purchase-order instructions with corresponding sales-order records. Its checks cover order existence, freight terms or account designation, price, ship-to address, line items and quantities, and duplicate order identity.",
          "The recorded run, JCEE-DIST-P0.1-DRYRUN-20260914, used 20 synthetic purchase orders with expected classifications. No employer or customer records, email account, or ERP connection were used.",
        ],
      },
      {
        title: "The recorded result",
        paragraphs: [
          "The comparator matched 20 of 20 expected classifications and produced zero external effects. The categories were:",
        ],
        bullets: [
          "13 PASS: the synthetic records matched.",
          "1 MISSING_ORDER: no matching order was present.",
          "5 FIELD_MISMATCH: a compared field differed.",
          "1 DUPLICATE_ORDER: more than one order matched the PO identity.",
        ],
      },
      {
        title: "What that establishes",
        paragraphs: [
          "This is evidence that the comparison and receipt mechanics worked on the frozen synthetic cases. It gives the next evaluation a concrete starting point and preserves a baseline against which changes can be checked.",
          "It does not establish a real-world accuracy rate, live integration, production readiness, customer savings, or buyer willingness. The case count describes the test; it is not a performance promise.",
        ],
      },
      {
        title: "The next measurement",
        paragraphs: [
          "The proposed next stage starts with company and IT approval of the data boundary, source, retention, access, and time budget. Calibration would be followed by a limited read-only shadow, with each exception manually verified.",
          "The review should count real issues, false alarms, missed issues found by audit, supported dollars or minutes, and operator burden. The outcome may be to stop, continue observing, or separately design a broader evaluation.",
        ],
      },
      {
        title: "Record and provenance",
        paragraphs: [
          "Source: JCEE Labs Business Model v1.0 — Industrial Distribution Value & Pilot, dated September 14, 2026. This article summarizes the recorded dry run; it does not report a new execution or an independent customer evaluation.",
        ],
      },
    ],
  },
  {
    slug: "qcs-frozen-specification-reproduction",
    title: "QCS-2.0: reproducing a frozen specification",
    kind: "Technical report",
    date: "2026-09-14",
    summary:
      "A public report of the August 13 reproduction across transactional and remote network authorities, including the preserved harness failure.",
    sections: [
      {
        title: "Abstract",
        paragraphs: [
          "QCS studies whether current authoritative evidence justifies a proposed transition. The August 13, 2026 final reproduction receipt records a successful implementation of its frozen specification across two tested authority classes: PostgreSQL transactional authority and a remote network-effect authority. The result supports the named reproduction gate within its tested scope.",
          "This report summarizes that preserved receipt. It introduces no new experimental result and has not been peer reviewed. An implementation constructed separately from earlier QCS implementations is not, by itself, independent-team replication.",
        ],
      },
      {
        title: "Question and method",
        paragraphs: [
          "The question was whether the frozen specification could reproduce its authority, legality, evidence, recovery, and commit semantics on substantially different execution substrates without changing the calculus.",
          "Grammar, judgments, proof-object and evidence semantics, the authority model, the substrate contract, recovery semantics, and conservative UNKNOWN / WAIT behavior remained frozen. Adapter translation was allowed; authority-specific exceptions in the verifier were not.",
          "The reproduction implementation was constructed from the frozen normative specification. The final receipt states that the earlier QCS-1.8 shadow, VOW integration, and SQLite reproduction implementations were not imported as the QCS-2.0 implementation.",
        ],
      },
      {
        title: "Transactional authority result",
        paragraphs: [
          "The PostgreSQL evaluation covered current-state commit, stale-proof rejection, rollback, repeated stale-proof attacks, and concurrent writers. The reported adversarial soak used 50 rounds with 16 writers per round: 800 attempts, exactly 50 winners, 750 stale losers, and zero errors.",
          "The receipt also records 100 stale-proof attacks rejected and zero unsafe commits. These counts apply to the described campaign; they do not establish a universal failure probability.",
        ],
      },
      {
        title: "Remote authority result",
        paragraphs: [
          "The remote evaluation used a separate private GitHub repository as a network authority. It exercised duplicate-create refusal, lost client responses after remote commit, process restart and reconciliation, delayed responses, stale replicas, conflicting state, concurrent clients, partitions, and reconnection.",
          "The final combined soak reports 18 of 18 trials passed, 18 partition WAIT decisions, zero executions while the authority was unreachable, 18 authority overrides, 18 duplicate refusals, and zero unsafe duplicate remote effects.",
        ],
      },
      {
        title: "The failure that remains part of the record",
        paragraphs: [
          "The first Stage 5D campaign produced two harness failures associated with immediate post-write observation. Subsequent independent re-observation found a matching payload and exactly one remote commit.",
          "The harness was corrected to verify successful writes against immutable authority commit identity instead of assuming immediate convergence through a mutable branch reference. The failed run was preserved. The QCS normative specification did not change, and the corrected campaign passed. This distinction matters: a harness repair is part of the experimental history, not a reason to erase a failure.",
        ],
      },
      {
        title: "Conclusion and limits",
        paragraphs: [
          "The recorded result is PASS for the planned frozen-specification reproduction gate across the two tested authority classes. It supports keeping the QCS-2.0 core frozen while directing further work toward reproduction, formalization, implementation, and evidence tooling.",
          "It does not establish universal correctness, production safety, independent certification, performance on every substrate, or success under every failure model. Further claims need their own tests.",
        ],
      },
      {
        title: "Source record",
        paragraphs: [
          "QCS-2.0 — Frozen Specification Reproduction Final Receipt, August 13, 2026, status PASS. The technical freeze remains carried forward in the September 14 canonical review. This public report omits private repository identities and restricted archive contents. Review inquiries can be made through the research partnership page.",
        ],
      },
    ],
  },
  {
    slug: "crucible-semantic-kernel",
    title: "CRUCIBLE P0.2: a bounded result, with conventional parity",
    kind: "Research brief",
    date: "2026-09-14",
    summary:
      "What the latest synthetic benchmark supports—and why the conventional comparator belongs beside the result.",
    sections: [
      {
        title: "The question",
        paragraphs: [
          "CRUCIBLE P0.2 examined whether a bounded set of semantic capabilities could support correct verdicts in a frozen synthetic payment corpus and transfer to a held-out repository/deployment corpus. It also tested a conventional composite, so a successful JCEE result would not be mistaken for exclusive differentiation.",
        ],
      },
      {
        title: "Recorded results",
        paragraphs: [
          "The September 14 R52 terminal review records 96 of 96 exact payment verdicts and 64 of 64 first-run held-out verdicts for the full candidate. A Go implementation reproduced all 160 verdicts without importing the Python/JCEE runtime.",
          "The conventional composite also matched all 160 verdicts. It used 26 executable lines of code compared with 31 for the full candidate, with 20 predicates and seven durable fields in each. It did not trigger the preregistered burden threshold, but the outcome remains conventional parity rather than an exclusive JCEE mechanism.",
        ],
      },
      {
        title: "Adversarial and ablation checks",
        paragraphs: [
          "The review records 3,072 evaluator-private mutations with zero common-oracle changes and detection of all 64 deliberately contaminated sentinel batches. Across exhaustive subsets of the six tested capabilities, the complete set was the sole perfect minimal subset in the frozen payment corpus.",
          "That establishes a bounded property of this experiment. It is not a proof that the same set is necessary or sufficient for every real-world system.",
        ],
      },
      {
        title: "What remains open",
        paragraphs: [
          "The terminal classification is PASS_BOUNDED_SEMANTIC_KERNEL / CONVENTIONAL_PARITY. The result does not establish novelty, production safety, independent-team replication, or unification of the JCEE product portfolio.",
          "The Go result is language/runtime reproduction, not independent-team verification. The P0.2 GitHub CI gate is recorded as NOT_RUN. Operational integration burden and real-system evaluation remain separate questions.",
        ],
      },
      {
        title: "Source and publication status",
        paragraphs: [
          "Source: JCEE Component Capability Review R52, September 14, 2026, 09:51:52 UTC, and canonical register v1.92/R52. This is an author-reported public research brief, not a peer-reviewed paper or a new rerun. The full experiment and private evaluation artifacts are retained separately for controlled review.",
        ],
      },
    ],
  },
];

export const publicationHref = (item: Publication) =>
  `${import.meta.env?.BASE_URL || "/"}${!isResearch(item) ? "blog" : "research"}/${item.slug}`;

export function isResearch(p: Publication) {
  return p.kind === "Technical report" || p.kind === "Research brief";
}

publications.push(
  {
    slug: "the-work-nobody-sees",
    title: "The Work Nobody Sees",
    kind: "From the Founder",
    date: "2026-09-14",
    author: "Jonathan Chadbourne, Founder",
    summary:
      "Why JCEE Labs starts with observation, evidence, and the workflows between systems.",
    sections: [
      {
        title: "Start with what actually happened",
        paragraphs: [
          "JCEE Labs grew out of a question I kept returning to: what supports the claim? A system can report success. A person can explain a decision. An AI can give a convincing account of its work. The account matters, but I want to know what someone else could inspect to establish what actually happened.",
          "That question shaped the principle of verification before judgment. Preserve the evidence before deciding what it means. Keep failures, missing information, and uncertainty visible. A result becomes more useful when its limits are understandable.",
          "The company did not arrive fully formed. Its direction developed as those questions moved from research into the practical problem of making software useful to the people who rely on it.",
        ],
      },
      {
        title: "Intelligence that leaves receipts",
        paragraphs: [
          "As AI systems take on more responsibility, the questions become sharper. What information did the system have? What did it attempt? What effect can we establish? Did it have current authority to act? If a process stopped halfway through, what would another person need to recover it?",
          "This is the thinking behind intelligence that leaves receipts. A receipt is an inspectable account with a defined scope. It should help a reviewer distinguish a supported conclusion from an assumption. A signature or a confident explanation cannot supply evidence that was never captured.",
          "Our work on execution, authority, portable evidence, and verification explores different parts of that problem. Each component has its own milestones and unfinished work. Putting them together creates another question to test; a collection of completed parts does not establish a completed operating system.",
        ],
      },
      {
        title: "The work between the official systems",
        paragraphs: [
          "Ordinary businesses face a closely related problem. Their software describes part of the operation. People do the work that keeps those descriptions aligned with reality.",
          "Consider a sticky note that records an exception. A spreadsheet that never appears in the software architecture diagram. A person comparing a purchase order with an ERP screen because the freight account sometimes needs another check. A late reconciliation. A phone call that finally resolves the discrepancy.",
          "These are illustrative situations, not accounts of a particular employer or customer. They make the same point: the work around a system can show where its model of the business stops matching the business itself.",
          "The people doing that work often know what the formal process leaves out. A useful software company has to learn from them. Before deciding which step to automate, understand the exception, the judgment it requires, and the reason the workaround exists.",
        ],
      },
      {
        title: "Why observation matters",
        paragraphs: [
          "My thesis is that as AI makes formalized information easier to analyze, observation becomes more valuable. The information that is easiest to retrieve is not necessarily the information that explains how a business gets its work done.",
          "By proprietary observation, I mean knowledge earned through permission, attention, and sustained work with a specific workflow. It includes understanding which exceptions recur, what people check, where responsibility changes hands, and which apparent inefficiencies are protecting the business from a real failure.",
          "The advantage I want JCEE to earn is an increasingly accurate understanding of the work, coupled with evidence that our software improves it. Observation needs discipline: record what was seen, separate it from interpretation, and let the people responsible for the workflow correct the model.",
        ],
      },
      {
        title: "Why Distribution comes first",
        paragraphs: [
          "Industrial distribution gives this philosophy a concrete place to begin. Purchase orders and sales orders need to agree. Freight instructions, quantities, prices, and delivery details need to survive the handoff. Exceptions need enough context for a person to investigate them.",
          "JCEE Distribution starts with order integrity alongside existing systems. The first synthetic evaluation is a development milestone. A real workflow still has to establish whether the checks are useful, whether exceptions are understandable, and whether the improvement is worth the team’s attention.",
          "Our deployment approach follows from that: observe one workflow, overlay the systems already in use, measure improvement, and earn the next step. Broader responsibility needs both evidence and permission.",
        ],
      },
      {
        title: "The foundation we intend to build",
        paragraphs: [
          "The longer-term direction is JCEE Operating Cloud: a common foundation for operating software shaped around the work of particular industries. Evidence, authority, recovery, and review should be reusable; the workflows should reflect the industry and the people doing the work.",
          "That is a direction we are working toward. Distribution is the first commercial focus, and the research remains a set of bounded results with open questions. The foundation has to be earned through useful deployments, not assumed from the ambition.",
          "The thread connecting that ambition to the earliest questions is straightforward. Observe carefully. Preserve what supports the conclusion. Make uncertainty understandable. Build something that helps with the work people are already carrying.",
        ],
      },
    ],
    related: [
      {
        label: "How we deploy: start with the workflow",
        href: "/blog/start-with-the-workflow",
      },
      {
        label: "JCEE Operating Cloud: the platform direction",
        href: "/operating-cloud",
      },
      {
        label: "Explore JCEE Distribution",
        href: "/solutions/distribution",
      },
    ],
  },
  {
    slug: "crucible-composition-tax",
    title: "CRUCIBLE P0.3: testing the cost of composition",
    kind: "Research brief",
    date: "2026-09-14",
    summary:
      "The broad operational-burden claim did not survive the tested comparison. A narrower integration-surface result remains.",
    sections: [
      {
        title: "The question after P0.2",
        paragraphs: [
          "P0.2 preserved a six-part semantic kernel and demonstrated conventional parity within its synthetic benchmark. P0.3 asked a different question: did the JCEE composition materially reduce operational burden against a strong conventional composition? The earlier semantic result remains a distinct, preserved milestone.",
        ],
      },
      {
        title: "The terminal result",
        paragraphs: [
          "The terminal disposition is KILL_BROAD_COMPOSITION_COMPRESSION_CLAIM. Both implementations met the safety criteria in the tested synthetic worlds. Late misconfiguration escapes, manual recovery actions, diagnosis burden, and offline audit burden tied. This comparison did not establish a broad operational-burden advantage for JCEE.",
          "A narrow integration-surface difference remained: three versus five integration touchpoints in both the payment and cold-domain evaluations. That observation supports a narrower future question, not a general superiority claim.",
        ],
      },
      {
        title: "Reproduction and scope",
        paragraphs: [
          "The recorded GitHub Actions reproduction passed on Python 3.10 and 3.12. It checked the frozen source and preregistration identities, 160 payment fault trials, the frozen integration boundary, the subsequent cold-domain reveal, and 20 cold-domain fault trials. Both environments reproduced the terminal disposition.",
          "This is a second execution environment for the same controlled research. It does not establish independent-team authorship, customer economics, production safety, or general transfer to real integrations.",
        ],
      },
      {
        title: "What follows",
        paragraphs: [
          "P0.3 is frozen. The broad composition-compression claim is retired for this tested comparison. The P0.2 semantic result remains intact.",
          "A further study would need a separately defined question about the narrow integration-surface difference, using heterogeneous real adapters or independent implementers. No such result is claimed here.",
        ],
      },
    ],
    related: [
      {
        label: "Read the preserved P0.2 semantic-kernel report",
        href: "/research/crucible-semantic-kernel",
      },
      {
        label: "Current CRUCIBLE status",
        href: "/registry#crucible-p03",
      },
    ],
  }
);
