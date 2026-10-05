import routeMetadata from "@/content/routeMetadata.json";
import type { ReactNode } from "react";
import BrandFooter from "./BrandFooter";
import CoreHeader, { type CoreHeaderCurrent } from "./CoreHeader";
import { useEffect } from "react";
import { useLocation } from "wouter";

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
  const [location] = useLocation();
  useEffect(() => {
    const route =
      location
        .replace(import.meta.env.BASE_URL.replace(/\/+$/, ""), "")
        .replace(/\/+$/, "") || "/";
    const meta = (
      routeMetadata as Record<string, { title: string; description: string }>
    )[route];
    document.title = meta?.title || `${title} — JCEE Labs`;
    const seoDescription = meta?.description || description;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", seoDescription);
    for (const key of ["og:title", "twitter:title"])
      document
        .querySelector(`meta[property="${key}"],meta[name="${key}"]`)
        ?.setAttribute("content", document.title);
    for (const key of ["og:description", "twitter:description"])
      document
        .querySelector(`meta[property="${key}"],meta[name="${key}"]`)
        ?.setAttribute("content", seoDescription);
    const pathname = location.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
    const basePath = import.meta.env.BASE_URL.replace(/\/+$/, "");
    const publicPath =
      basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
        ? pathname.slice(basePath.length) || "/"
        : pathname;
    const canonical = `https://jceelabs.com${publicPath}`;
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", canonical);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", canonical);
  }, [title, description, location]);
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
