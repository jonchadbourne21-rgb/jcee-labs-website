// Copyright (c) 2026 Jonathan Chadbourne.
// Browser check for the homepage receipt replay: it plays through on load,
// finishes, replays on demand, fits phone widths without overflow, and never
// animates under reduced motion. Prints reduced screenshots for review.
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  sleep, findOpenPort, start, stop, removeProfileDirectory, waitForUrl, connect, navigate, evaluate,
} from "./browser-test-helpers.mjs";

const FINAL = 6;
const appPort = await findOpenPort();
const debugPort = await findOpenPort();
const profile = path.join(tmpdir(), `jcee-replay-${process.pid}`);
const base = `http://127.0.0.1:${appPort}`;
const app = start("node", ["dist/index.js"], { env: { ...process.env, PORT: String(appPort), NODE_ENV: "production" } });
const browser = start(process.env.CHROMIUM_BIN || "chromium", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "about:blank",
]);

const stepNow = send => evaluate(send, `Number(document.querySelector('.wl-receipt--replay')?.dataset.step ?? -1)`);

async function shot(send, name) {
  const rect = await evaluate(send, `(() => { const r = document.querySelector('.wl-product-visual').getBoundingClientRect();
    return { x: Math.max(0, r.x + scrollX), y: Math.max(0, r.y + scrollY), width: r.width, height: r.height }; })()`);
  const result = await send("Page.captureScreenshot", { format: "jpeg", quality: 70, captureBeyondViewport: true, clip: { ...rect, scale: 1 } });
  const data = result.data;
  const parts = Math.ceil(data.length / 16000);
  for (let p = 0; p < parts; p++) console.log(`IMG replay-${name} ${p + 1}/${parts} ${data.slice(p * 16000, (p + 1) * 16000)}`);
}

let page;
const report = {};
try {
  await waitForUrl(`${base}/`, "website");
  page = await connect(debugPort);
  const { send } = page;

  // Desktop, motion allowed: plays through once, then rests on the final state.
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  await navigate(send, base, "/");
  const seen = new Set();
  let shotMid = false;
  const startedAt = Date.now();
  for (let i = 0; i < 120; i++) {
    const s = await stepNow(send);
    seen.add(s);
    if (!shotMid && s === 3) { await shot(send, "desktop-mid"); shotMid = true; }
    if (s === FINAL && seen.size > 2) break;
    await sleep(100);
  }
  report.desktopStepsSeen = [...seen].sort((a, b) => a - b);
  report.desktopSecondsToFinish = +((Date.now() - startedAt) / 1000).toFixed(1);
  assert.ok(seen.has(0) || seen.has(1), `replay never started: ${JSON.stringify(report.desktopStepsSeen)}`);
  assert.ok([2, 3, 4].some(s => seen.has(s)), "replay skipped its middle steps");
  assert.equal(await stepNow(send), FINAL, "replay did not finish within 12s");
  const finalState = await evaluate(send, `({
    stepsOn: document.querySelectorAll('.rr-step[data-on="true"]').length,
    resultsOn: document.querySelectorAll('.rr-result[data-on="true"]').length,
    button: document.querySelector('.rr-replay')?.textContent?.trim(),
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    request: document.querySelector('.rr-request-text')?.textContent
  })`);
  report.desktopFinal = finalState;
  assert.deepEqual([finalState.stepsOn, finalState.resultsOn, finalState.overflow], [9, 2, false], "final state incomplete");
  await shot(send, "desktop-final");

  // Replay button restarts the story and plays it through again.
  await evaluate(send, `document.querySelector('.rr-replay').click()`);
  await sleep(150);
  const restarted = await stepNow(send);
  let replayed = restarted;
  for (let i = 0; i < 100 && replayed !== FINAL; i++) { await sleep(100); replayed = await stepNow(send); }
  report.replay = { afterClick: restarted, end: replayed };
  assert.ok(restarted < 2 && replayed === FINAL, `replay button did not restart and finish: ${JSON.stringify(report.replay)}`);

  // iPhone width: lanes stack, the card fits, nothing overflows.
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await navigate(send, base, "/");
  for (let i = 0; i < 120 && (await stepNow(send)) !== FINAL; i++) await sleep(100);
  await evaluate(send, `document.querySelector('.wl-product-visual').scrollIntoView({block:'start'})`);
  await sleep(300);
  const mobile = await evaluate(send, `(() => {
    const lanes = [...document.querySelectorAll('.rr-lane')].map(l => l.getBoundingClientRect());
    const card = document.querySelector('.wl-receipt--replay').getBoundingClientRect();
    return { stacked: lanes[1].top >= lanes[0].bottom - 1, cardLeft: Math.round(card.left), cardRight: Math.round(card.right),
      viewport: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1,
      smallestText: Math.min(...[...document.querySelectorAll('.rr-step, .rr-result, .rr-label, .rr-lane-title')].map(e => parseFloat(getComputedStyle(e).fontSize))) };
  })()`);
  report.mobile = mobile;
  assert.ok(mobile.stacked && !mobile.overflow && mobile.cardLeft >= 0 && mobile.cardRight <= mobile.viewport + 1, `phone layout failed: ${JSON.stringify(mobile)}`);
  await shot(send, "iphone-final");

  // Reduced motion: complete story at once, and it stays still.
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await navigate(send, base, "/");
  const samples = [];
  for (let i = 0; i < 6; i++) { samples.push(await stepNow(send)); await sleep(250); }
  report.reducedMotionSamples = samples;
  assert.ok(samples.every(s => s === FINAL), `reduced motion animated: ${samples}`);

  assert.deepEqual(page.runtimeErrors, [], "Homepage threw a browser exception");
  console.log(`RECEIPTREPLAY ${JSON.stringify(report)}`);
  console.log("Receipt replay check passed.");
} catch (error) {
  console.error(error);
  console.error(`RECEIPTREPLAY ${JSON.stringify(report)}`);
  console.error(app.output.join(""), browser.output.join(""));
  process.exitCode = 1;
} finally {
  page?.close();
  await stop(browser.child);
  await stop(app.child);
  await removeProfileDirectory(profile);
}
