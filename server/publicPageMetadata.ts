import routeMetadata from "../client/src/content/routeMetadata.json";

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
  return result;
}
