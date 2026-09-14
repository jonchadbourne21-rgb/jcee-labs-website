import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Use the URL in Settings > Pages; validate both supported locations in CI.
const site = new URL(
  process.env.PAGES_BASE_URL ||
    "https://jonchadbourne21-rgb.github.io/jcee-labs-website/"
);
const prefix = site.pathname.replace(/\/$/, "");
if (
  !/^https?:$/.test(site.protocol) ||
  site.search ||
  site.hash ||
  !["", "/jcee-labs-website"].includes(prefix)
) {
  throw new Error(`Unsupported Pages URL: ${site.href}`);
}
site.protocol = "https:";
const publicUrl = `${site.origin}${prefix}/`;
const exported = spawnSync(
  process.execPath,
  ["--import", "tsx", "scripts/export-publications.ts"],
  { stdio: "inherit" }
);
if (exported.status !== 0) throw new Error("Publication export failed");
const routeMetadata = JSON.parse(
  fs.readFileSync("client/src/content/routeMetadata.json", "utf8")
);
const built = spawnSync(
  "pnpm",
  ["exec", "vite", "build", `--base=${prefix}/`],
  { stdio: "inherit" }
);
if (built.status !== 0)
  throw new Error(`Vite build failed: ${built.error || built.status}`);

const root = "dist/public";
const assets = path.join(root, "assets");
const media = new Map([
  [
    "https://jceelabs.com/manus-storage/01-signature-hero-exposed_8b945d8c.webp",
    "01-signature-hero-exposed.webp",
  ],
  [
    "https://jceelabs.com/manus-storage/01-signature-hero-exposed-mobile_1b03fe3f.webp",
    "01-signature-hero-exposed-mobile.webp",
  ],
  [
    "https://jceelabs.com/manus-storage/02-vow-receipt_372bf105.webp",
    "02-vow-receipt.webp",
  ],
  [
    "https://jceelabs.com/manus-storage/03-qcs-causal-rail_731e5c1a.webp",
    "03-qcs-causal-rail.webp",
  ],
]);
const documents = fs.readdirSync(root).filter(name => name.endsWith(".md"));
for (const name of media.values()) {
  if (!fs.existsSync(path.join(root, "visuals", name)))
    throw new Error(`Missing public image: ${name}`);
}

for (const name of fs.readdirSync(assets)) {
  if (!/\.(js|css)$/.test(name)) continue;
  const file = path.join(assets, name);
  let source = fs.readFileSync(file, "utf8");
  if (prefix) {
    // Preserve the backup's route/link behavior without double-prefixing Vite URLs.
    source = source.replace(
      /((?:href|src|path):")\/(?!\/)([^"]*)"/g,
      (match, start, value) =>
        value.startsWith(`${prefix.slice(1)}/`)
          ? match
          : `${start}${prefix}/${value}"`
    );
    // The paper reader fetches a named Markdown file rather than an href prop.
    for (const document of documents) {
      source = source.replaceAll(`"/${document}"`, `"${prefix}/${document}"`);
    }
  }
  for (const [from, name] of media)
    source = source.replaceAll(from, `${prefix}/visuals/${name}`);
  fs.writeFileSync(file, source);
}

const indexPath = path.join(root, "index.html");
let html = fs
  .readFileSync(indexPath, "utf8")
  .replace(/\s*<script id="manus-runtime">[\s\S]*?<\/script>/, "")
  .replace(
    /\s*<script\s+defer\s+src="%VITE_ANALYTICS_ENDPOINT%\/umami"[\s\S]*?<\/script>/,
    ""
  )
  .replace('content="https://jceelabs.com"', `content="${publicUrl}"`)
  .replaceAll(
    'content="/manus-storage/jcee-labs-og-teal_587de72d.png"',
    `content="${publicUrl}brand/jcee-labs-mark.png"`
  );
for (const [from, name] of media)
  html = html.replaceAll(from, `${publicUrl}visuals/${name}`);
if (
  /id="manus-runtime"|%VITE_ANALYTICS_/.test(html) ||
  !html.includes(`${prefix}/assets/`)
) {
  throw new Error("Pages entry point failed its runtime/asset check");
}
if (!prefix && html.includes("/jcee-labs-website/assets/"))
  throw new Error("Root build contains project asset paths");
// Actions Pages uses the repository's domain setting, not a CNAME file.
if (fs.existsSync(path.join(root, "CNAME")))
  throw new Error(
    "Remove stale CNAME file; configure the domain in GitHub Pages settings"
  );
fs.writeFileSync(indexPath, html);
fs.writeFileSync(path.join(root, "404.html"), html);
fs.writeFileSync(path.join(root, ".nojekyll"), "");

// Public deep links return HTTP 200 on a static host. Unknown routes use 404.html.
const appSource = fs.readFileSync("client/src/App.tsx", "utf8");
const routes = [...appSource.matchAll(/<Route path="([^"]+)"/g)]
  .map(match => match[1])
  .filter(
    route => route !== "/" && route !== "/404" && !route.startsWith("/admin")
  );
for (const route of routes) {
  const directory = path.join(root, route.slice(1));
  fs.mkdirSync(directory, { recursive: true });
  const meta = routeMetadata[route];
  const escapeHtml = value =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  let routeHtml = html;
  if (meta) {
    routeHtml = routeHtml
      .replace(
        /<title>[^<]*<\/title>/,
        `<title>${escapeHtml(meta.title)}</title>`
      )
      .replace(
        /(<meta\s+name="description"\s+content=")[^"]*/,
        `$1${escapeHtml(meta.description)}`
      )
      .replace(
        /(<meta\s+(?:property|name)="(?:og|twitter):title"\s+content=")[^"]*/g,
        `$1${escapeHtml(meta.title)}`
      )
      .replace(
        /(<meta\s+(?:property|name)="(?:og|twitter):description"\s+content=")[^"]*/g,
        `$1${escapeHtml(meta.description)}`
      )
      .replace(
        /(<meta\s+property="og:url"\s+content=")[^"]*/,
        `$1${publicUrl.replace(/\/$/, "")}${route}`
      );
  }
  fs.writeFileSync(path.join(directory, "index.html"), routeHtml);
}
fs.writeFileSync(
  path.join(root, "deployment.json"),
  JSON.stringify(
    {
      source: process.env.GITHUB_SHA || "local",
      publicUrl,
      publicRoutes: ["/", ...routes],
    },
    null,
    2
  ) + "\n"
);
console.log(
  `Pages artifact ready: ${publicUrl}; ${routes.length + 1} public routes; ${documents.length} Markdown files.`
);
