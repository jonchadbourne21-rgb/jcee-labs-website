// Copyright (c) 2026 Jonathan Chadbourne.
// Measures the eight-capability catalog as rendered in a real browser and
// reports the computed values as GitHub annotations so the visual contract
// can be compared across routes without downloading artifacts.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  sleep,
  findOpenPort,
  start,
  stop,
  removeProfileDirectory,
  waitForUrl,
  connect,
  navigate,
  evaluate,
} from "./browser-test-helpers.mjs";

const VIEWPORTS = [
  ["desktop", 1440, 900, false],
  ["tablet", 1000, 900, false],
  ["iPhone", 390, 844, true],
];

// Every visual property the catalog depends on, per element role.
const MEASURE = `(sectionSelector) => {
  const section = document.querySelector(sectionSelector);
  if (!section) return null;
  const pick = (el, props) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const out = {};
    for (const p of props) out[p] = s.getPropertyValue(p);
    const r = el.getBoundingClientRect();
    out.width = Math.round(r.width);
    out.height = Math.round(r.height);
    return out;
  };
  const type = ["font-family","font-size","font-weight","line-height","letter-spacing","color","text-transform","text-shadow"];
  const box = ["padding-top","padding-right","padding-bottom","padding-left","margin-top","margin-bottom","max-width"];
  const cards = [...section.querySelectorAll('.capability-catalog__card')];
  const card = cards[0];
  const sr = section.getBoundingClientRect();
  return {
    viewport: innerWidth,
    sectionLeftInset: Math.round(sr.left),
    section: pick(section, [...box, "background-color", "border-top-width"]),
    kicker: pick(section.querySelector('.editorial-kicker'), [...type, ...box]),
    heading: pick(section.querySelector('h2'), [...type, ...box]),
    lede: pick(section.querySelector('.capability-catalog__heading > p'), [...type, ...box]),
    ledeStrong: pick(section.querySelector('.capability-catalog__heading > p strong'), type),
    headingBlock: pick(section.querySelector('.capability-catalog__heading'), ["display","grid-template-columns","column-gap","align-items","margin-bottom"]),
    grid: pick(section.querySelector('.capability-catalog__grid'), ["display","grid-template-columns","column-gap","row-gap","list-style-type"]),
    card: pick(card, ["background-color","border-top-width","border-top-style","border-top-color","border-top-left-radius"]),
    cardLink: pick(card?.querySelector('a'), ["display","flex-direction","min-height","padding-top","padding-left","color","text-decoration-line"]),
    cardTop: pick(card?.querySelector('.capability-catalog__card-top'), ["display","margin-bottom","color"]),
    icon: pick(card?.querySelector('svg'), ["color","stroke-width"]),
    number: pick(card?.querySelector('.capability-catalog__number'), type),
    title: pick(card?.querySelector('strong'), [...type, "display"]),
    summary: pick(card?.querySelector('.capability-catalog__summary'), [...type, "margin-top","margin-bottom"]),
    cta: pick(card?.querySelector('.capability-catalog__link'), [...type, "border-top-width","border-top-color","padding-top","display","justify-content"]),
    note: pick(section.querySelector('.capability-catalog__note'), [...type, ...box]),
    cardCount: cards.length,
    titles: cards.map(c => c.querySelector('strong')?.textContent?.trim()),
    numbers: cards.map(c => c.querySelector('.capability-catalog__number')?.textContent?.trim()),
    hrefs: cards.map(c => c.querySelector('a')?.getAttribute('href')),
    cardHeights: cards.map(c => Math.round(c.getBoundingClientRect().height)),
    rows: new Set(cards.map(c => Math.round(c.getBoundingClientRect().top))).size,
    kickerText: section.querySelector('.editorial-kicker')?.textContent?.trim(),
    headingText: section.querySelector('h2')?.textContent?.trim(),
    ledeText: section.querySelector('.capability-catalog__heading > p')?.textContent?.replace(/\\s+/g,' ').trim(),
    noteText: section.querySelector('.capability-catalog__note')?.textContent?.replace(/\\s+/g,' ').trim(),
  };
}`;

const appPort = await findOpenPort();
const debugPort = await findOpenPort();
const profile = path.join(tmpdir(), `jcee-capability-${process.pid}`);
const base = `http://127.0.0.1:${appPort}`;
const app = start("node", ["dist/index.js"], {
  env: { ...process.env, PORT: String(appPort), NODE_ENV: "production" },
});
const browser = start(process.env.CHROMIUM_BIN || "chromium", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profile}`,
  "about:blank",
]);
for (const service of [app, browser])
  service.child.on("error", error => service.output.push(error.message));

const annotate = (level, title, payload) => {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload);
  // Workflow commands require newlines and % to be escaped.
  const escaped = text.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  console.log(`::${level} title=${title}::${escaped}`);
};

async function measure(send, route, selector, viewport) {
  const [name, width, height, mobile] = viewport;
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await navigate(send, base, route);
  await evaluate(send, `document.fonts.ready.then(() => true)`);
  for (let attempt = 0; attempt < 40; attempt++) {
    if (await evaluate(send, `document.fonts.status === 'loaded' && !!document.querySelector(${JSON.stringify(selector)})`)) break;
    await sleep(100);
  }
  await evaluate(send, `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'start',behavior:'instant'})`);
  await sleep(250);
  const result = await evaluate(send, `(${MEASURE})(${JSON.stringify(selector)})`);
  return { name, result };
}

let page;
try {
  await waitForUrl(`${base}/`, "website");
  page = await connect(debugPort);
  const { send } = page;
  const mode = process.env.CAPABILITY_CHECK_MODE || "compare";
  if (mode === "baseline") {
    for (const viewport of VIEWPORTS) {
      const { name, result } = await measure(send, "/technology", ".capability-catalog", viewport);
      assert.ok(result, `technology catalog missing at ${name}`);
      annotate("notice", `capability-baseline-${name}`, result);
    }
    console.log("Capability catalog baseline recorded.");
  } else {
    const baseline = JSON.parse(
      await readFile(new URL("./fixtures/capability-catalog-baseline.json", import.meta.url), "utf8")
    );
    void baseline;
  }
  assert.deepEqual(page.runtimeErrors, [], "Capability catalog route threw a browser exception");
} catch (error) {
  console.error(error);
  console.error(app.output.join(""), browser.output.join(""));
  annotate("error", "capability-catalog-check", String(error?.message ?? error));
  process.exitCode = 1;
} finally {
  page?.close();
  await stop(browser.child);
  await stop(app.child);
  await removeProfileDirectory(profile);
}
