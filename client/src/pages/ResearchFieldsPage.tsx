import EditorialLayout from "@/components/EditorialLayout";

const researchFields = [
  {
    id: "01",
    title: "Trustworthy AI & AI Assurance",
    topics: [
      "Verifiable agent behavior",
      "Evidence-backed AI decisions",
      "Runtime assurance",
      "AI judges and evaluation",
      "Bounded autonomy and consequence control",
    ],
  },
  {
    id: "02",
    title: "Agentic Systems & Autonomous Software",
    topics: [
      "Multi-agent architectures",
      "Speculative and branching agent execution",
      "Agent authority separation",
      "Recovery and retracing",
      "Human-agent control boundaries",
    ],
  },
  {
    id: "03",
    title: "Distributed Systems",
    topics: [
      "Exactly-once effects",
      "Crash recovery",
      "Distributed state",
      "Cross-host execution",
      "Coordination failure",
      "Partial failure and ambiguity",
    ],
  },
  {
    id: "04",
    title: "Formal Methods & Software Verification",
    topics: [
      "Executable contracts",
      "Invariants",
      "State-machine verification",
      "Proof obligations",
      "Reproducible verification gates",
    ],
  },
  {
    id: "05",
    title: "Authorization, Delegation & Computer Security",
    topics: [
      "Temporal authority",
      "Delegation and revocation",
      "Least authority",
      "Stale-authority prevention",
      "TOCTOU safety",
      "Fail-closed architectures",
    ],
  },
  {
    id: "06",
    title: "Provenance, Evidence & Auditability",
    topics: [
      "Evidence graphs",
      "Cryptographic receipts",
      "Hash-chained journals",
      "Provenance tracking",
      "Reproducibility",
      "Counsel-grade evidence preservation",
    ],
  },
  {
    id: "07",
    title: "Causal Inference & Causal Assurance",
    topics: [
      "Causal direction",
      "Hidden feedback",
      "Unobserved backaction",
      "Observation/intervention separation",
      "Limits of causal claims under incomplete closure",
    ],
  },
  {
    id: "08",
    title: "Quantum Information Science",
    topics: [
      "Quantum information theory",
      "Entanglement",
      "Measurement",
      "BB84-type systems",
      "Classical/quantum communication limits",
      "Information-theoretic uncertainty",
    ],
  },
  {
    id: "09",
    title: "Quantum Foundations",
    topics: [
      "Measurement and observation",
      "Uncertainty",
      "Locality and nonlocality",
      "Information versus physical state",
      "Operational interpretations of quantum mechanics",
    ],
  },
  {
    id: "10",
    title: "Quantum Communication Complexity",
    topics: [
      "Split-memory problems",
      "Communication lower bounds",
      "One-bit communication questions",
      "Entropic uncertainty proofs",
      "Distributed quantum-information tasks",
    ],
  },
  {
    id: "11",
    title: "Quantum Causal Inference",
    topics: [
      "Unknown feedback channels",
      "Causal direction in quantum systems",
      "Measurement backaction",
      "Hidden variables and context",
      "Limits on evidential assurance",
    ],
  },
  {
    id: "12",
    title: "Information Theory",
    topics: [
      "Entropy",
      "Conditional entropy",
      "Mutual information",
      "Channel capacity",
      "Communication lower bounds",
      "Information loss and recoverability",
    ],
  },
  {
    id: "13",
    title: "Computability / Limits of Knowledge",
    topics: [
      "What observations permit us to establish",
      "Epistemic boundaries",
      "Proof versus inference",
      "Evidence insufficiency",
      "Limits imposed by inaccessible state",
    ],
  },
  {
    id: "14",
    title: "Resilient Computing & Fault Tolerance",
    topics: [
      "Fault containment",
      "Recovery semantics",
      "Ambiguous outcomes",
      "Dependency failure",
      "Compensation before collapse",
      "Coordination reserve",
    ],
  },
  {
    id: "15",
    title: "Complex Systems & Coordination Science",
    topics: [
      "Multi-component coordination",
      "Graph-based state relationships",
      "Early-warning signals",
      "Relational precursors to failure",
      "Emergent system behavior",
    ],
  },
  {
    id: "16",
    title: "Topology Applied to State Systems",
    topics: [
      "Orientation-sensitive state",
      "State equivalence",
      "Lifted representations",
      "Context-dependent identity",
      "Topological analogies such as Klein-bottle work",
    ],
  },
  {
    id: "17",
    title: "Programming Languages, Runtimes & Compiler Architecture",
    topics: [
      "Agent/runtime semantics",
      "Intermediate representations",
      "Execution contracts",
      "Compiler/runtime boundaries",
      "JAIR and LLVM-style ecosystem research",
    ],
  },
  {
    id: "18",
    title: "Database & Temporal-State Systems",
    topics: [
      "Bitemporal state",
      "Versioned authority",
      "Epochs and generations",
      "Historical state reconstruction",
      "Distributed persistence",
    ],
  },
  {
    id: "19",
    title: "AI Memory & Knowledge Systems",
    topics: [
      "Retrieval-augmented generation",
      "Semantic memory",
      "Vector retrieval",
      "Persistent personalization",
      "Controlled cross-application information sharing",
    ],
  },
  {
    id: "20",
    title: "Human-AI Interaction",
    topics: [
      "Adaptive AI interfaces",
      "Higher-order personalization",
      "Explainable agent behavior",
      "User control of AI authority",
      "Trust calibration",
    ],
  },
  {
    id: "21",
    title: "Machine Learning Evaluation",
    topics: [
      "LLM-as-judge research",
      "Deterministic versus learned judges",
      "Open-weight model evaluation",
      "Adversarial test fixtures",
      "Reliability benchmarking",
    ],
  },
  {
    id: "22",
    title: "Applied AI Safety",
    topics: [
      "Preventing unauthorized consequences",
      "Separating hypothesis from action",
      "Non-broadening authority",
      "Safe speculative reasoning",
      "Fail-closed execution",
    ],
  },
  {
    id: "23",
    title: "Fintech / Payment-System Reliability",
    topics: [
      "Ambiguous payments",
      "Capture and payout recovery",
      "Financial authorization boundaries",
      "Idempotency",
      "Reconciliation and evidence",
    ],
  },
  {
    id: "24",
    title: "Acoustics & Spatial Audio Computing",
    topics: [
      "Acoustic signatures of spaces",
      "Frequency response",
      "Impulse-response-like representations",
      "Spatial sound characterization",
      "Creative reuse of environmental acoustics through SIGRESO",
    ],
  },
  {
    id: "25",
    title: "Computational Culinary Intelligence",
    topics: [
      "Technique representation",
      "Flavor and palate modeling",
      "Substitution reasoning",
      "Cooking-process sequencing",
      "Personalized culinary intelligence through MISE",
    ],
  },
] as const;

const interdisciplinaryDomains = [
  "Computer science",
  "Artificial intelligence",
  "Mathematics",
  "Information theory",
  "Quantum information",
  "Distributed systems",
  "Epistemology",
] as const;

export default function ResearchFieldsPage() {
  return (
    <EditorialLayout
      current="research"
      eyebrow="JCEE Labs / Research Portfolio"
      title="Research fields"
      description="Current research portfolio and interdisciplinary scope across 25 fields, connected by evidence, authority, state, and consequence."
    >
      <section className="editorial-section research-portfolio-intro" aria-labelledby="portfolio-summary-title">
        <p className="editorial-kicker">
          PORTFOLIO REFERENCE · PREPARED <time dateTime="2026-09-18">18 SEPTEMBER 2026</time>
        </p>
        <h2 id="portfolio-summary-title">25 fields. One unifying research question.</h2>
        <p className="editorial-intro">
          The current portfolio spans trustworthy AI, distributed and resilient
          computing, formal verification, quantum information, information
          theory, causal assurance, complex systems, human-AI interaction, and
          applied computational intelligence.
        </p>
        <div className="research-question">
          <span>UNIFYING RESEARCH QUESTION</span>
          <blockquote>
            How do you determine what a system actually knows, what that evidence
            permits it to conclude, what authority it possesses, and what
            consequences it may safely produce?
          </blockquote>
        </div>
        <p>
          JCEE Labs operates across multiple research domains, but the work is
          connected by a common concern: making evidence, authority, state, and
          consequence explicit enough to test, verify, and audit.
        </p>
      </section>

      <section className="editorial-section editorial-section-muted" aria-labelledby="research-fields-title">
        <div className="editorial-section-heading">
          <div>
            <p className="editorial-kicker">THE CURRENT PORTFOLIO</p>
            <h2 id="research-fields-title">Research Portfolio</h2>
          </div>
          <a href="/research">Research publications →</a>
        </div>
        <div className="research-field-grid">
          {researchFields.map(field => (
            <article className="research-field-card" key={field.id}>
              <div className="research-field-heading">
                <span>{field.id}</span>
                <h3>{field.title}</h3>
              </div>
              <ul>
                {field.topics.map(topic => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="editorial-section editorial-section-dark research-identity" aria-labelledby="research-identity-title">
        <p className="editorial-kicker">INTERDISCIPLINARY RESEARCH IDENTITY</p>
        <h2 id="research-identity-title">The work crosses substrates. The boundary stays recognizable.</h2>
        <p>
          At the highest level, JCEE Labs sits at the intersection of:
        </p>
        <div className="research-identity-grid">
          {interdisciplinaryDomains.map(domain => (
            <div key={domain}>{domain}</div>
          ))}
        </div>
        <div className="research-question research-question-dark">
          <span>THE CONNECTING THREAD</span>
          <blockquote>
            How do you determine what a system actually knows, what that evidence
            permits it to conclude, what authority it possesses, and what
            consequences it may safely produce?
          </blockquote>
        </div>
        <p>
          This question links JCEE Labs research in trustworthy AI, formal
          verification, distributed execution, authority systems, causal
          assurance, quantum information, evidence provenance, resilient
          computing, and applied intelligence. The individual projects differ in
          substrate, but they repeatedly test the same boundary: what is
          justified, what is authorized, and what follows safely from the state
          actually observed.
        </p>
        <div className="editorial-actions">
          <a className="editorial-button" href="/research">
            Read research publications →
          </a>
          <a className="editorial-text-link" href="/partners/research">
            Discuss research collaboration →
          </a>
        </div>
      </section>
    </EditorialLayout>
  );
}
