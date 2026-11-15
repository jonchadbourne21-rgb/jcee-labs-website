import { entries } from "@/content/registryEntries";

const projects = [
  { id: "native-recovery-november", title: "Workflow execution & recovery", type: "Software", value: "Know what completed before an interrupted workflow tries again.", application: "A foundation for service changes, operational handoffs, and workflows that need explicit permission and recoverable state." },
  { id: "distribution", title: "Order review for distribution", type: "Application", value: "Bring missing orders, mismatched fields, and duplicates into view.", application: "A starting point for a scoped order-review integration alongside your existing business systems." },
  { id: "hosted-evidence-november", title: "Evidence services & connected interfaces", type: "Software", value: "Give people a record they can retrieve, inspect, and reconstruct.", application: "Building blocks for operational review, incident investigation, and evidence access through connected tools." },
  { id: "formal-foundation-november", title: "CBAW: authority, action & evidence", type: "Formal research", value: "Make the obligations behind an authorized action explicit.", application: "A formal foundation for evaluating how permission, an action, and its evidence are connected within a defined system." },
  { id: "quantum-record-verification", title: "Quantum experiments & record verification", type: "Hardware research", value: "Connect a circuit's intended execution to retained provider records.", application: "Research into reproducible experiments, measurement, and the relationship between models and observed outcomes." },
  { id: "artle-november", title: "ARTLE: embodied synthetic worlds", type: "Architecture & simulation direction", value: "Explore how perception, action, and replay can meet in a modeled world.", application: "A research direction for manipulation, transport, and inspection, with physical fidelity treated as an explicit engineering requirement." },
];

export default function BuildsAndExperiments() {
  return <section className="editorial-section" id="builds-and-experiments" aria-labelledby="builds-and-experiments-title">
    <p className="editorial-kicker">Builds &amp; experiments</p>
    <h2 id="builds-and-experiments-title">Working software. Questions worth exploring.</h2>
    <p className="editorial-intro">Our work spans business applications, execution infrastructure, formal methods, and physical research. Explore what each project does and where it could fit into a collaboration.</p>
    <p>Selected public work, curated November 15, 2026. Each linked record retains its own evidence date and scope; this collection does not mark every project as a released product.</p>
    <div className="resource-grid">
      {projects.map(project => {
        const record = entries.find(entry => entry.id === project.id)!;
        return <article className="resource-card" key={project.id}>
          <p className="editorial-kicker">{project.type}</p>
          <h3>{project.title}</h3>
          <p><strong>{project.value}</strong></p>
          <p>{project.application}</p>
          <details>
            <summary>Results &amp; scope</summary>
            <p>{record.supports}</p>
            <p>{record.boundary}</p>
            <p className="editorial-kicker">Evidence record: {record.date}</p>
          </details>
          <a className="editorial-text-link" href={`${import.meta.env.BASE_URL}registry#${project.id}`}>Explore the record →</a>
        </article>;
      })}
    </div>
    <div className="editorial-actions">
      <a className="editorial-button" href={`${import.meta.env.BASE_URL}solutions#design-partners`}>Build with us →</a>
      <a className="editorial-text-link" href={`${import.meta.env.BASE_URL}partners/research`}>Propose a research collaboration →</a>
      <a className="editorial-text-link" href={`${import.meta.env.BASE_URL}registry`}>Explore the full public registry →</a>
    </div>
  </section>;
}
