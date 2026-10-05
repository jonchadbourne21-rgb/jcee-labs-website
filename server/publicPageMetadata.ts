import routeMetadata from "../client/src/content/routeMetadata.json";
import { publications } from "../client/src/content/publications";

type PageMetadata = {
  title: string;
  description: string;
  type?: string;
  publishedTime?: string;
};

const metadata: Record<string, PageMetadata> = routeMetadata;
const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

// Use a fixed public origin: request headers must not become canonical URLs.
export function applyPublicPageMetadata(html: string, requestPath: string) {
  const pathname = requestPath.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const meta = metadata[pathname];
  if (!meta) return html;
  const canonical = `https://jceelabs.com${pathname}`;
  let result = html
    .replace(
      /<script id="public-schema" type="application\/ld\+json">[\s\S]*?<\/script>/g,
      ""
    )
    .replace(/<meta property="article:published_time"[^>]*>/g, "")
    .replace(
      /<title>[^<]*<\/title>/,
      () => `<title>${escapeHtml(meta.title)}</title>`
    )
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*/,
      (_, prefix) => `${prefix}${escapeHtml(meta.description)}`
    )
    .replace(
      /(<meta\s+(?:property|name)="(?:og|twitter):title"\s+content=")[^"]*/g,
      (_, prefix) => `${prefix}${escapeHtml(meta.title)}`
    )
    .replace(
      /(<meta\s+(?:property|name)="(?:og|twitter):description"\s+content=")[^"]*/g,
      (_, prefix) => `${prefix}${escapeHtml(meta.description)}`
    )
    .replace(
      /(<meta\s+property="og:url"\s+content=")[^"]*/,
      (_, prefix) => `${prefix}${canonical}`
    )
    .replace(
      /(<link\s+rel="canonical"\s+href=")[^"]*/,
      (_, prefix) => `${prefix}${canonical}`
    )
    .replace(
      /(<meta\s+property="og:type"\s+content=")[^"]*/,
      (_, prefix) => `${prefix}${meta.type || "website"}`
    );
  if (meta.publishedTime) {
    result = result.replace(
      "</head>",
      `<meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}" />\n</head>`
    );
  }
  const organization = {
    "@type": "Organization",
    "@id": "https://jceelabs.com/#organization",
    name: "JCEE Labs",
    url: "https://jceelabs.com/",
    logo: "https://jceelabs.com/brand/jcee-labs-mark.png",
    location: { "@type": "Place", name: "Dallas, Texas" },
  };
  const publication = publications.find(item =>
    pathname.endsWith(`/${item.slug}`)
  );
  const schema = publication
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: publication.title,
        description: publication.summary,
        datePublished: publication.date,
        mainEntityOfPage: canonical,
        url: canonical,
        author: publication.author
          ? { "@type": "Person", name: publication.author }
          : organization,
        publisher: organization,
      }
    : pathname === "/" || pathname === "/company"
      ? { "@context": "https://schema.org", ...organization }
      : null;
  if (schema)
    result = result.replace(
      "</head>",
      `<script id="public-schema" type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>\n</head>`
    );
  return result;
}
