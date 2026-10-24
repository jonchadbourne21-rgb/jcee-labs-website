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
      <ResearchPrograms />
    </>
  ),
  measurement: <MeasurementResearch />,
  "physical-experiments": <PhysicalExperiments />,
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
