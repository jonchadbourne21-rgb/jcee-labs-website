import express from "express";
import path from "node:path";

// CI-only static server: no application API and no SPA success fallback.
const app = express();
const root = path.resolve("dist/public");
const prefix = process.env.PAGES_BASE_PATH || "";
app.use(prefix || "/", express.static(root, {
  setHeaders(response, file) {
    if (file.endsWith(".md")) response.type("text/markdown");
  },
}));
app.use((_request, response) => response.status(404).sendFile(path.join(root, "404.html")));
app.listen(Number(process.env.PORT), "127.0.0.1");
