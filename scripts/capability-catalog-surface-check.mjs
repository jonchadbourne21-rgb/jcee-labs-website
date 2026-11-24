// Copyright (c) 2026 Jonathan Chadbourne.
// Measures the eight-capability catalog as rendered in a real browser and
// reports the computed values as GitHub annotations so the visual contract
// can be compared across routes without downloading artifacts.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
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
  // Annotation messages are cut at 4 KB, so structured results are sent as
  // base64 raw-deflate ("z:" prefix) and decoded by the reviewer.
  const text = typeof payload === "string"
    ? payload
    : `z:${deflateRawSync(Buffer.from(JSON.stringify(payload))).toString("base64")}`;
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
    // Baseline: the catalog as it rendered on /technology at main cac64ea,
    // measured in CI by this script's baseline mode before the move.
    const baseline = JSON.parse(
      await readFile(new URL("./fixtures/capability-catalog-baseline.json", import.meta.url), "utf8")
    );
    const ids = ["authorization","consequence-control","durable-recovery","evidence-verification","receipts-and-audit","governed-knowledge","connected-workflows","qualification"];
    const differences = [];
    // The heading copy was rewritten for buyers and the closing note removed
    // (customer-readiness pass), so text and text-driven box sizes are not
    // compared; every style value and all card geometry still are.
    const textDriven = /^(desktop|tablet|iPhone)\.((kicker|heading|lede|ledeStrong|note)\.(width|height)|(section|headingBlock)\.height|note(\..*)?|(kicker|heading|lede|note)Text)$/;
    const compare = (label, expected, actual) => {
      if (textDriven.test(label)) return;
      if (typeof expected === "number" && typeof actual === "number") {
        if (Math.abs(expected - actual) > 1) differences.push({ label, expected, actual });
      } else if (expected && typeof expected === "object" && !Array.isArray(expected)) {
        for (const key of Object.keys(expected)) compare(`${label}.${key}`, expected[key], actual?.[key]);
      } else if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        differences.push({ label, expected, actual });
      }
    };
    for (const viewport of VIEWPORTS) {
      const { name, result } = await measure(send, "/", "#capabilities", viewport);
      assert.ok(result, `homepage catalog missing at ${name}`);
      const order = await evaluate(send, `(() => {
        const hero = document.querySelector('#product-overview');
        const catalog = document.querySelector('#capabilities');
        return { afterHero: hero?.nextElementSibling === catalog,
          beforeStory: catalog?.nextElementSibling?.id ?? null,
          inHome: !!catalog?.closest('main.worldlab-home') };
      })()`);
      assert.deepEqual(order, { afterHero: true, beforeStory: "story", inHome: true }, `${name}: catalog is not directly under the hero`);
      const { hrefs, ...visual } = result;
      const { hrefs: _baselineHrefs, ...expected } = baseline[name];
      assert.deepEqual(hrefs, ids.map(id => `/technology#detail-${id}`), `${name}: card links do not point at their /technology targets`);
      compare(name, expected, visual);
      annotate("notice", `capability-home-${name}`, { rows: result.rows, cardHeights: result.cardHeights, heading: result.heading, card: result.card });
    }
    if (differences.length) annotate("warning", "capability-visual-differences", differences.slice(0, 60));
    assert.deepEqual(differences, [], "Homepage catalog differs from the /technology baseline");

    // /technology keeps every detail target and no longer repeats the grid.
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await navigate(send, base, "/technology");
    const technology = await evaluate(send, `({
      grid: document.querySelectorAll('.capability-catalog').length,
      details: [...document.querySelectorAll('.capability-details__item')].map(el => el.id)
    })`);
    assert.deepEqual(technology, { grid: 0, details: ids.map(id => `detail-${id}`) }, "Technology detail targets changed");

    // Every card click lands on its own detail entry, below the fixed header.
    const landed = [];
    for (const [name, width, height, mobile] of [VIEWPORTS[0], VIEWPORTS[2]]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
      for (const id of ids) {
        await navigate(send, base, "/");
        await evaluate(send, `window.__capabilityToken = '${id}'`);
        const clicked = await evaluate(send, `(() => { const a = document.querySelector('#capabilities a[href="/technology#detail-${id}"]'); a?.click(); return !!a; })()`);
        assert.ok(clicked, `${name}: missing card for ${id}`);
        let state;
        for (let attempt = 0; attempt < 100; attempt++) {
          state = await evaluate(send, `(() => { const t = document.getElementById('detail-${id}');
            return { path: location.pathname, hash: location.hash, top: t ? Math.round(t.getBoundingClientRect().top) : null,
              title: t?.querySelector('h3')?.textContent, sameDocument: window.__capabilityToken === '${id}' }; })()`);
          if (state.path === "/technology" && state.hash === `#detail-${id}` && state.top !== null && state.top >= 60 && state.top <= 240) break;
          await sleep(100);
        }
        assert.ok(state.path === "/technology" && state.hash === `#detail-${id}` && state.top >= 60 && state.top <= 240,
          `${name}: ${id} card did not land on its detail entry: ${JSON.stringify(state)}`);
        landed.push({ viewport: name, id, top: state.top, title: state.title, sameDocument: state.sameDocument });
      }
    }
    annotate("notice", "capability-links", landed);
    console.log(`Capability catalog check passed: ${VIEWPORTS.length} viewports matched the /technology baseline; ${landed.length} card links landed on their targets.`);
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
