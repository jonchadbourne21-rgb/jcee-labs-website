import { useEffect } from "react";
import { useLocation } from "wouter";
import EditorialLayout from "@/components/EditorialLayout";
import { ResearchInvitation } from "@/components/ResearchSections";
import {
  researchTopics,
  legacyResearchFragments,
} from "@/content/researchTopics";

export default function ResearchPage() {
  const [, navigate] = useLocation();
  useEffect(() => {
    const redirect = () => {
      const fragment = window.location.hash.slice(1);
      const topic = legacyResearchFragments[fragment];
      if (topic)
        navigate(
          `${import.meta.env.BASE_URL.replace(/\/$/, "")}/research/${topic}#${fragment}`,
          { replace: true }
        );
    };
    redirect();
    window.addEventListener("hashchange", redirect);
    window.addEventListener("popstate", redirect);
    return () => {
      window.removeEventListener("hashchange", redirect);
      window.removeEventListener("popstate", redirect);
    };
  }, [navigate]);
  return (
    <EditorialLayout
      current="research"
      eyebrow="JCEE RESEARCH / EXPLORE THE RECORD"
      title="Results you can examine."
      description="Choose a question to follow. Explore our publications, research programs, and evidence standards in focused sections."
    >
      <section
        className="editorial-section research-directory"
        aria-label="Research topics"
      >
        {researchTopics.map((topic, index) => (
          <a
            className="research-topic-row"
            key={topic.slug}
            href={`${import.meta.env.BASE_URL}research/${topic.slug}`}
          >
            <span className="research-topic-index">0{index + 1}</span>
            <div>
              <h2>{topic.title}</h2>
              <p>{topic.description}</p>
              <small>{topic.detail}</small>
            </div>
            <span className="research-topic-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        ))}
      </section>
      <ResearchInvitation />
    </EditorialLayout>
  );
}
