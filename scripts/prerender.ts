import fs from "node:fs";
import path from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { applyPublicPageMetadata } from "../server/publicPageMetadata";
const root = path.resolve("dist/public");
const template = fs.readFileSync(path.join(root, "index.html"), "utf8");
const routes: string[] = JSON.parse(
  fs.readFileSync("client/src/content/publicRoutes.json", "utf8")
);
const server = await createServer({
  ssr: { noExternal: ["streamdown", "katex"] },
  configFile: false,
  root: path.resolve("client"),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve("client/src"),
      "@shared": path.resolve("shared"),
    },
  },
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { render } = await server.ssrLoadModule("/src/prerender.tsx");
  for (const route of routes) {
    // Preserve the released standalone paper and its unchanged downloadable PDFs.
    if (route === "/research/bb84-communication") continue;
    const body = await render(route);
    if (!body.includes("<h1")) throw new Error(`Missing rendered H1: ${route}`);
    const html = applyPublicPageMetadata(template, route).replace(
      '<div id="root"></div>',
      () => `<div id="root">${body}</div>`
    );
    const directory = path.join(root, route.slice(1));
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "index.html"), html);
  }
  const notFound = await render("/404");
  fs.writeFileSync(
    path.join(root, "404.html"),
    template
      .replace(
        '<div id="root"></div>',
        () => `<div id="root">${notFound}</div>`
      )
      .replace(
        'content="index,follow,max-image-preview:large"',
        'content="noindex,follow"'
      )
      .replace(
        /<title>[^<]*<\/title>/,
        "<title>Page not found | JCEE Labs</title>"
      )
  );
  console.log(
    `Prerendered ${routes.length - 1} public routes with visible HTML content.`
  );
} finally {
  await server.close();
}
