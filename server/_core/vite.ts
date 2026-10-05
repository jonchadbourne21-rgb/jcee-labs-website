import publicRoutes from "../../client/src/content/publicRoutes.json";
import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { applyPublicPageMetadata } from "../publicPageMetadata";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(
        url,
        applyPublicPageMetadata(template, req.originalUrl)
      );
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  const template = fs.readFileSync(
    path.resolve(distPath, "index.html"),
    "utf-8"
  );
  app.use((req, res, next) => {
    const route = req.path.replace(/\/+$/, "") || "/";
    if (route === "/research-evidence") {
      res.redirect(301, "/registry");
      return;
    }
    if (publicRoutes.includes(route)) {
      const file = path.join(distPath, route.slice(1), "index.html");
      if (fs.existsSync(file)) {
        res.sendFile(file);
        return;
      }
    }
    next();
  });
  app.use(express.static(distPath, { index: false }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const route = req.path.replace(/\/+$/, "") || "/";
    if (route.startsWith("/admin")) {
      res
        .type("html")
        .send(
          template.replace(
            'content="index,follow,max-image-preview:large"',
            'content="noindex,nofollow"'
          )
        );
      return;
    }
    res.status(404).sendFile(path.join(distPath, "404.html"));
  });
}
