import type { ReactNode } from "react";
import BrandFooter from "./BrandFooter";
import CoreHeader, { type CoreHeaderCurrent } from "./CoreHeader";
import { useEffect } from "react";

export default function EditorialLayout({
  title,
  eyebrow,
  description,
  current,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  current: CoreHeaderCurrent;
  children: ReactNode;
}) {
  useEffect(() => {
    document.title = `${title} — JCEE Labs`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    for (const key of ["og:title", "twitter:title"])
      document
        .querySelector(`meta[property="${key}"],meta[name="${key}"]`)
        ?.setAttribute("content", document.title);
    for (const key of ["og:description", "twitter:description"])
      document
        .querySelector(`meta[property="${key}"],meta[name="${key}"]`)
        ?.setAttribute("content", description);
  }, [title, description]);
  return (
    <main className="editorial-page" id="top">
      <CoreHeader current={current} />
      <div id="page-content" tabIndex={-1}>
        <header className="editorial-masthead">
          <p className="editorial-kicker">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="editorial-deck">{description}</p>
        </header>
        {children}
      </div>
      <BrandFooter backToTopHref="#top" />
    </main>
  );
}
