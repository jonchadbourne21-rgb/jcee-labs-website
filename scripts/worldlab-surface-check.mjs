import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { findOpenPort, start, stop, waitForUrl, connect, navigate, sleep, removeProfileDirectory } from "./browser-test-helpers.mjs";

// Exercise every registered public route, not just the top-level navigation.
const routes = JSON.parse(await readFile("client/src/content/publicRoutes.json", "utf8"));
const output = path.resolve("artifacts/enterprise-visual-review/worldlab");
const port = await findOpenPort(), debug = await findOpenPort();
const profile = path.join(os.tmpdir(), `worldlab-surface-${process.pid}`);
const server = start(process.execPath, ["dist/index.js"], { env: { ...process.env, PORT: String(port), NODE_ENV: "production" } });
const browser = start(process.env.CHROMIUM_BIN || "chromium", ["--headless=new", "--no-sandbox", "--disable-gpu", `--remote-debugging-port=${debug}`, `--user-data-dir=${profile}`, "about:blank"]);
let client;
const rows = [], failures = [];
try {
  await mkdir(output, { recursive: true });
  await waitForUrl(`http://127.0.0.1:${port}`, "WorldLab production build");
  client = await connect(debug);
  for (const width of [390, 768, 1440]) {
    await client.send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width === 390 });
    for (const route of routes) {
      await navigate(client.send, `http://127.0.0.1:${port}`, route);
      const result = await client.send("Runtime.evaluate", {
        awaitPromise: true, returnByValue: true,
        expression: `(async () => {
          await document.fonts.ready;
          await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
          const visible = e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0;
          const headings = [...document.querySelectorAll('h1')].filter(visible);
          const expectedFont = getComputedStyle(document.querySelector('.site-header .wordmark')).fontFamily;
          const fontMismatches = [...document.querySelectorAll('#root h1,#root h2,#root h3,#root p,#root li,#root label,#root button,#root input,#root textarea,#root select,#root em,#root strong')]
            .filter(e => visible(e) && !e.closest('pre,code,svg,math,.katex') && getComputedStyle(e).fontFamily !== (e.closest('h1,h2,h3') ? getComputedStyle(document.querySelector('h1')).fontFamily : expectedFont))
            .map(e => ({tag:e.tagName,text:e.textContent.slice(0,60),font:getComputedStyle(e).fontFamily}));
          return {
            theme: {
              surface: getComputedStyle(document.querySelector('.site-header').parentElement).backgroundColor,
              header: getComputedStyle(document.querySelector('.site-header')).backgroundColor,
              displayFont: getComputedStyle(document.querySelector('h1')).fontFamily,
              bodyFont: expectedFont,
            },
            width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,
            headings:headings.length,header:document.querySelectorAll('.site-header').length,footer:document.querySelectorAll('.brand-footer').length,
            brokenImages:[...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')),
            fontMismatches,
            mobileHero: location.pathname === '/' && innerWidth <= 700 ? (() => {
              const rect = s => document.querySelector(s).getBoundingClientRect();
              const art=rect('.customer-hero-sculpture'), trust=rect('.hero-trust');
              const primary=rect('.customer-actions .customer-button'), secondary=rect('.customer-actions .customer-link');
              return {artTop:art.top,artBottom:art.bottom,trustTop:trust.top,primaryBottom:primary.bottom,secondaryTop:secondary.top,secondaryBottom:secondary.bottom};
            })() : null,
            artOverlap:[...document.querySelectorAll('.worldlab-masthead-art,.editorial-hero-art')].some(i => {
              const copy=i.previousElementSibling;
              if (!copy || !copy.matches('.worldlab-masthead-copy,.editorial-hero-copy')) return false;
              const a=i.getBoundingClientRect(),b=copy.getBoundingClientRect();
              return Math.min(a.right,b.right)>Math.max(a.left,b.left)+1 && Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)+1;
            })
          };
        })()`
      });
      assert.ok(!result.exceptionDetails, `DOM inspection failed: ${route}`);
      const value = result.result.value;
      const issues = [];
      if (value.scrollWidth > width + 1 || value.bodyWidth > width + 1) issues.push("horizontal overflow");
      if (value.headings !== 1 || value.header !== 1 || value.footer !== 1) issues.push("missing/duplicated page structure");
      if (value.brokenImages.length) issues.push("broken images");
      if (value.fontMismatches.length) issues.push("inconsistent typography");
      if (value.theme.surface !== "rgb(8, 11, 18)") issues.push("public surface does not match orbital-blue dark background");
      if (!value.theme.displayFont.includes("Space Grotesk") || !value.theme.bodyFont.includes("DM Sans")) issues.push("homepage type system missing");
      if (value.mobileHero) {
        const h=value.mobileHero;
        if (h.trustTop < h.artBottom - 1) issues.push("engineering links precede/overlap artwork");
        if (h.primaryBottom > h.secondaryTop + 1) issues.push("primary mobile action is not first");
        if (h.artTop < h.secondaryBottom || h.artTop > 680) issues.push("mobile artwork crowded or delayed");
      }
      if (value.artOverlap) issues.push("artwork overlaps introduction");
      if (issues.length) failures.push({route,width,issues,...value});
      // Viewport captures for human review accompany the structural checks.
      await sleep(100);
      const shot = await client.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
      const file = `${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${width}.png`;
      await writeFile(path.join(output, file), Buffer.from(shot.data, "base64"));
      rows.push({ route, width, file, pass: issues.length === 0 });
    }
  }
  await writeFile(path.join(output, "manifest.json"), JSON.stringify({cases:rows,failures,runtimeErrors:client.runtimeErrors,networkFailures:client.networkFailures},null,2));
  assert.deepEqual(failures, [], "WorldLab route/layout failures");
  assert.deepEqual(client.runtimeErrors, []);
  assert.deepEqual(client.networkFailures, []);
  console.log(`WorldLab surface PASS: ${routes.length} routes × 3 widths = ${rows.length} checks.`);
} finally {
  client?.close(); await stop(browser.child); await stop(server.child); await removeProfileDirectory(profile);
}
