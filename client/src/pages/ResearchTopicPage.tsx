import NovemberProgress from "@/components/NovemberProgress";
import EditorialLayout from "@/components/EditorialLayout";
import { researchTopics } from "@/content/researchTopics";
import {
  ResearchPriority,
  MeasurementResearch,
  ResearchEvidence,
  PhysicalExperiments,
  ResearchPublications,
  ResearchPrograms,
  ResearchInvitation,
} from "@/components/ResearchSections";

const content = {
  publications: <ResearchPublications />,
  programs: (
    <>
      <ResearchPriority />
      <NovemberProgress id="november-programs" title="What advanced across the portfolio." ids={[
        "installed-interfaces-november", "portable-evidence-november", "formal-foundation-november",
        "operational-self-use-november", "retrieval-lens-november", "native-comparisons-november",
        "security-crypto-november", "closed-results-november", "memory-evidence-extensions-november",
      ]} />
      <ResearchPrograms />
    </>
  ),
  measurement: <><NovemberProgress id="november-measurement" title="Measurements, models and their limits." ids={[
    "bb84-math-november", "bb84-hardware-november", "quantum-followup-simulation",
    "quantum-record-verification", "c1-numerical-november", "memory-material-models-november", "portfolio-simulation-november",
  ]} /><MeasurementResearch /></>,
  "physical-experiments": <><NovemberProgress id="november-physical" title="From observed qubits to proposed physical systems." ids={[
    "bb84-hardware-november", "artle-november", "physical-materials-november",
  ]} /><PhysicalExperiments /></>,
  "evidence-standards": <ResearchEvidence />,
};
export type ResearchTopicSlug = keyof typeof content;
export default function ResearchTopicPage({
  topic,
}: {
  topic: ResearchTopicSlug;
}) {
  const info = researchTopics.find(item => item.slug === topic)!;
  return (
    <EditorialLayout
      current="research"
      eyebrow="JCEE RESEARCH"
      title={info.title}
      description={info.description}
    >
      <nav className="research-topic-nav" aria-label="Research topics">
        <a href="/research">← All research</a>
        {researchTopics.map(item => (
          <a
            key={item.slug}
            href={`${import.meta.env.BASE_URL}research/${item.slug}`}
            aria-current={item.slug === topic ? "page" : undefined}
          >
            {item.title}
          </a>
        ))}
      </nav>
      {content[topic]}
      <ResearchInvitation />
    </EditorialLayout>
  );
}
