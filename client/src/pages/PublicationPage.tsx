import { useLocation } from "wouter";
import EditorialLayout from "@/components/EditorialLayout";
import { publications } from "@/content/publications";
import NotFound from "./NotFound";
export default function PublicationPage() {
  const [location] = useLocation();
  const pathname = location.replace(/\/+$/, "");
  const item = publications.find(p => pathname.endsWith(`/${p.slug}`));
  if (!item) return <NotFound />;
  const research = !item.kind.includes("blog");
  return (
    <EditorialLayout
      current={research ? "research" : "resources"}
      eyebrow={`${item.kind} · September 14, 2026 · JCEE Labs`}
      title={item.title}
      description={item.summary}
    >
      <div className="publication-layout">
        <aside className="publication-toc">
          <a href={research ? "/research" : "/resources"}>
            ← {research ? "All research" : "All resources"}
          </a>
          <nav aria-label="On this page">
            <p>On this page</p>
            {item.sections.map((s, i) => (
              <a href={`#section-${i + 1}`} key={s.title}>
                {s.title}
              </a>
            ))}
          </nav>
          <a
            href={`${import.meta.env.BASE_URL}publications/${item.slug}.md`}
            download
          >
            Download Markdown ↓
          </a>
        </aside>
        <article className="publication-body">
          {item.sections.map((s, i) => (
            <section id={`section-${i + 1}`} key={s.title}>
              <h2>{s.title}</h2>
              {s.paragraphs.map(p => (
                <p key={p}>{p}</p>
              ))}
              {s.bullets && (
                <ul>
                  {s.bullets.map(b => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <footer>
            <p>Published September 14, 2026 · Version 1.0</p>
            <a href="/registry">See current build status →</a>
          </footer>
        </article>
      </div>
    </EditorialLayout>
  );
}
