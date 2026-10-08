// Copyright (c) 2026 Jonathan Chadbourne.
import assert from "node:assert/strict";
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

const appPort = await findOpenPort();
const debugPort = await findOpenPort();
const profile = path.join(tmpdir(), `jcee-fragments-${process.pid}`);
const staticMode = Object.hasOwn(process.env, "PAGES_BASE_PATH");
const prefix = staticMode ? process.env.PAGES_BASE_PATH : "";
const base = `http://127.0.0.1:${appPort}${prefix}`;
const app = start(
  "node",
  [staticMode ? "scripts/serve-pages-test.mjs" : "dist/index.js"],
  {
    env: { ...process.env, PORT: String(appPort), NODE_ENV: "production" },
  }
);
const browser = start(process.env.CHROMIUM_BIN || "chromium", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profile}`,
  "about:blank",
]);
// Report a missing executable directly instead of hanging until the CDP timeout.
for (const service of [app, browser])
  service.child.on("error", error => service.output.push(error.message));
let page;
try {
  await waitForUrl(`${base}/`, "website");
  page = await connect(debugPort);
  const { send } = page;
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  // Make cold lazy-route loads observable rather than relying on a warm cache.
  await send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 120,
    downloadThroughput: 5_000_000,
    uploadThroughput: 5_000_000,
  });
  const targets = [
    ["/research", "evidence-ladder"],
    ["/research", "physical-validation"],
    ["/technology", "infrastructure-build"],
  ];
  let checked = 0;
  async function atTarget(route, id, label) {
    let state;
    for (let attempt = 0; attempt < 100; attempt++) {
      state = await evaluate(
        send,
        `(() => {
        const target = document.getElementById(${JSON.stringify(id)});
        return {path: location.pathname, hash: location.hash, y: scrollY,
          ready: document.querySelector('#root')?.dataset.clientReady === 'true',
          top: target?.getBoundingClientRect().top, visible: !!target?.getClientRects().length,
          fonts: document.fonts.status, loading: !!document.querySelector('.route-shimmer-container')};
      })()`
      );
      if (
        state.path === `${prefix}${route}` &&
        state.hash === `#${id}` &&
        state.path === `${prefix}${route}` &&
        state.hash === `#${id}` &&
        state.fonts === "loaded" &&
        state.ready &&
        !state.loading &&
        state.fonts === "loaded" &&
        state.visible &&
        state.y > 0 &&
        state.top >= 80 &&
        state.top <= 230
      )
        break;
      await sleep(100);
    }
    assert.ok(
      state.path === `${prefix}${route}` &&
        state.hash === `#${id}` &&
        state.fonts === "loaded" &&
        state.ready &&
        !state.loading &&
        state.visible &&
        state.y > 0 &&
        state.top >= 80 &&
        state.top <= 230,
      `${label}: target is not below the fixed header: ${JSON.stringify(state)}`
    );
    // A late mount/animation must not reset an apparently successful scroll.
    await sleep(350);
    const top = await evaluate(
      send,
      `document.getElementById(${JSON.stringify(id)}).getBoundingClientRect().top`
    );
    assert.ok(top >= 80 && top <= 230, `${label}: late scroll reset (${top})`);
    checked++;
  }
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["iPhone", 390, 844],
    ["Android", 412, 915],
  ]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 500,
    });
    for (const reducedMotion of ["no-preference", "reduce"]) {
      await send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: reducedMotion }],
      });
      for (const [route, id] of targets) {
        await navigate(send, base, "/");
        const href = `${prefix}${route}#${id}`;
        const clicked = await evaluate(
          send,
          `(() => {
          const link = [...document.querySelectorAll('a')].find(a => a.getAttribute('href') === ${JSON.stringify(href)});
          link?.click(); return !!link;
        })()`
        );
        assert.ok(clicked, `Missing homepage link ${href}`);
        await atTarget(route, id, `${name}/${reducedMotion} homepage click`);
        await send("Page.reload", { ignoreCache: true });
        await sleep(200);
        await atTarget(route, id, `${name}/${reducedMotion} reload`);
      }
      await navigate(send, base, "/research#evidence-ladder");
      await atTarget("/research", "evidence-ladder", `${name} direct link`);
      // Wouter navigation uses pushState, which does not emit hashchange.
      await evaluate(
        send,
        "history.pushState(null, '', '#physical-validation')"
      );
      await atTarget(
        "/research",
        "physical-validation",
        `${name} same-page router link`
      );
      await evaluate(send, "history.back()");
      await atTarget("/research", "evidence-ladder", `${name} Back`);
      await evaluate(send, "history.forward()");
      await atTarget("/research", "physical-validation", `${name} Forward`);
      await evaluate(send, "location.hash = '#evidence-ladder'");
      await atTarget(
        "/research",
        "evidence-ladder",
        `${name} native hash link`
      );
      await evaluate(send, "history.pushState(null, '', location.pathname)");
      await sleep(300);
      assert.equal(
        await evaluate(send, "scrollY"),
        0,
        "Unfragmented navigation should reset to page top"
      );
      await evaluate(send, "location.hash = '#%ZZ-missing'");
      await sleep(100);
    }
  }
  assert.deepEqual(
    page.runtimeErrors,
    [],
    "Fragment navigation threw a browser exception"
  );
  console.log(
    `Fragment navigation passed ${checked} target checks: desktop, iPhone, Android; normal/reduced motion; cold clicks, direct links, reloads, same-page links, Back/Forward.`
  );
} catch (error) {
  console.error(error);
  console.error(app.output.join(""), browser.output.join(""));
  process.exitCode = 1;
} finally {
  page?.close();
  await stop(browser.child);
  await stop(app.child);
  await removeProfileDirectory(profile);
}
