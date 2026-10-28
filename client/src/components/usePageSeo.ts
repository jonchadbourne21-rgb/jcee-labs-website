import { useEffect } from "react";
import metadata from "@/content/routeMetadata.json";
export default function usePageSeo(path: string) {
  useEffect(() => {
    const meta = (
      metadata as Record<string, { title: string; description: string }>
    )[path];
    if (!meta) return;
    document.title = meta.title;
    for (const key of ["description", "og:description", "twitter:description"])
      document
        .querySelector(`meta[name="${key}"],meta[property="${key}"]`)
        ?.setAttribute("content", meta.description);
    for (const key of ["og:title", "twitter:title"])
      document
        .querySelector(`meta[name="${key}"],meta[property="${key}"]`)
        ?.setAttribute("content", meta.title);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", `https://jceelabs.com${path}`);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", `https://jceelabs.com${path}`);
  }, [path]);
}
