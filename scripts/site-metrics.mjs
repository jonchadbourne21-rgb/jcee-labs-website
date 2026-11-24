// Customer-readiness metrics: renders each public route in a real browser and
// prints measured page metrics to the CI log (AUDIT lines), checks every internal
// link and #anchor found, and optionally prints reduced screenshots
// (SITE_METRICS_SHOTS=1). Informational; broken links exit non-zero.
import { tmpdir } from "node:os";
import path from "node:path";
import {
  sleep, findOpenPort, start, stop, removeProfileDirectory, waitForUrl, connect, navigate, evaluate,
} from "./browser-test-helpers.mjs";

const ROUTES = [
  "/", "/solutions", "/solutions/distribution", "/technology", "/technology/engineering-log", "/research", "/resources",
  "/company", "/founder", "/consultation", "/partners", "/partners/enterprise",
  "/capabilities/infrastructure", "/assurance", "/registry", "/operating-cloud", "/vow",
  "/charter", "/experiences/evidence-engine", "/research/fields", "/blog/start-with-the-workflow",
];
const SHOTS = new Set(["/", "/solutions", "/technology", "/research", "/resources", "/company", "/consultation"]);

const DISCLAIMER = /\b(illustrative|illustration|not a live|not live|not a record|fictional|do(?:es)? not establish|not establish|not (?:a )?guarantee|not independently|no external action|not production|not yet|example interface|conceptual interface|scoped and tested|require(?:s)? (?:its|their) own|does not (?:prove|imply|certify)|not (?:certified|qualified))\b/gi;
const JARGON = /\b(consequential|authority|qualification|qualified|receipts?|evidence boundary|shadow mode|attestation|provenance|adjudicat\w*|registry|charter|falsif\w*|frozen specification|composition tax|reconcil\w*|idempoten\w*|fail-closed|semantic kernel|admission gate|G0|VOW|QCS|JRP|BB84|crucible)\b/gi;

const MEASURE = `(() => {
  const main = document.querySelector('main') || document.body;
  const clone = main;
  const exclude = el => el.closest('header, .site-header, footer, .brand-footer, nav[aria-label="Main navigation"], nav[aria-label="Mobile navigation"]');
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
  let text = ''; let tiny = 0; let caps = 0; const tinySamples = [];
  while (walker.nextNode()) {
    const n = walker.currentNode; const el = n.parentElement;
    if (!el || exclude(el)) continue;
    const t = n.textContent.trim(); if (!t) continue;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || el.closest('details:not([open]) > :not(summary)')) continue;
    text += ' ' + t;
    if (parseFloat(s.fontSize) < 12) {
      tiny++;
      if (tinySamples.length < 25) tinySamples.push({ el: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''), parent: el.parentElement?.className?.toString().slice(0, 40) || '', size: s.fontSize, text: t.slice(0, 32) });
    }
    if (s.textTransform === 'uppercase' || (t.length > 6 && t === t.toUpperCase() && /[A-Z]/.test(t))) caps++;
  }
  text = text.replace(/\\s+/g, ' ').trim();
  const words = (text.match(/[A-Za-z][A-Za-z'’&-]*/g) || []).length;
  const links = [...main.querySelectorAll('a[href]')].filter(a => !exclude(a) && a.offsetParent !== null);
  const label = a => (a.getAttribute('aria-label') || a.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 70);
  const ctas = links.filter(a => /button|cta|primary|secondary|customer-link|editorial-button|wl-product-(primary|secondary)/.test(a.className));
  const heads = sel => [...main.querySelectorAll(sel)].filter(h => !exclude(h)).map(h => h.innerText.replace(/\\s+/g, ' ').trim()).filter(Boolean);
  const sections = [...main.querySelectorAll('section')].filter(s => !exclude(s) && !s.parentElement.closest('section'));
  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || null,
    h1: heads('h1'), h2: heads('h2'), h3count: heads('h3').length,
    words, sections: sections.length, height: document.documentElement.scrollHeight,
    links: links.length,
    linkTargets: [...new Set(links.map(a => a.getAttribute('href')))],
    ctaLabels: ctas.map(label),
    contactLinks: links.filter(a => /consultation|mailto:/.test(a.getAttribute('href'))).map(label),
    numberedLabels: (text.match(/\\b0\\d ?\\/ /g) || []).length,
    tinyTextNodes: tiny, tinySamples, uppercaseTextNodes: caps,
    canvases: document.querySelectorAll('canvas').length,
    signature: [...document.querySelectorAll('.signature-panel, .brand-footer-field')].map(el => {
      const c = el.querySelector('canvas'); const r = el.getBoundingClientRect();
      const shown = c && getComputedStyle(c).display !== 'none' && Number(getComputedStyle(c).opacity) > 0.3;
      let lit = 0;
      try { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 16) if (d[i] > 8) lit++; } catch {}
      return { cls: el.className.split(' ')[0], shown, w: Math.round(r.width), h: Math.round(r.height), canvas: !!c, lit, seed: el.dataset.signatureSeed || null };
    }),
    renders3d: [...document.images].filter(i => /worldlab-(technology|research|company)-v1\.webp/.test(i.currentSrc || i.src)).length,
    runningAnimations: document.getAnimations().filter(a => a.playState === 'running').length,
    details: main.querySelectorAll('details').length,
    text,
  };
})()`;

const appPort = await findOpenPort();
const debugPort = await findOpenPort();
const profile = path.join(tmpdir(), `jcee-audit-${process.pid}`);
const base = `http://127.0.0.1:${appPort}`;
const app = start("node", ["dist/index.js"], { env: { ...process.env, PORT: String(appPort), NODE_ENV: "production" } });
const browser = start(process.env.CHROMIUM_BIN || "chromium", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "about:blank",
]);

async function settle(send) {
  await evaluate(send, `document.fonts.ready.then(() => true)`);
  const h = await evaluate(send, `document.documentElement.scrollHeight`);
  for (let y = 0; y < h; y += 600) { await evaluate(send, `scrollTo(0, ${y})`); await sleep(90); }
  await evaluate(send, `scrollTo(0, 0)`); await sleep(500);
}

async function shoot(send, name, width, height, scale, maxChunks) {
  const total = await evaluate(send, `document.documentElement.scrollHeight`);
  const chunk = 2400;
  const n = Math.min(maxChunks, Math.ceil(total / chunk));
  for (let i = 0; i < n; i++) {
    const shot = await send("Page.captureScreenshot", {
      format: "jpeg", quality: 55, captureBeyondViewport: true,
      clip: { x: 0, y: i * chunk, width, height: Math.min(chunk, total - i * chunk), scale },
    });
    const data = shot.data;
    const parts = Math.ceil(data.length / 16000);
    for (let p = 0; p < parts; p++) console.log(`IMG ${name}-${i} ${p + 1}/${parts} ${data.slice(p * 16000, (p + 1) * 16000)}`);
  }
}

let page;
const internal = new Map();
const summary = [];
try {
  await waitForUrl(`${base}/`, "website");
  page = await connect(debugPort);
  const { send } = page;
  for (const route of ROUTES) {
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await navigate(send, base, route);
    await settle(send);
    const m = await evaluate(send, MEASURE);
    const disclaimers = (m.text.match(DISCLAIMER) || []).length;
    const jargon = {};
    for (const j of m.text.match(JARGON) || []) jargon[j.toLowerCase()] = (jargon[j.toLowerCase()] || 0) + 1;
    for (const href of m.linkTargets) if (href.startsWith("/")) internal.set(href, [...(internal.get(href) || []), route]);
    if (process.env.SITE_METRICS_SHOTS && SHOTS.has(route)) await shoot(send, `desktop${route.replace(/\//g, "_") || "_home"}`, 1440, 900, 0.4, 6);
    await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await navigate(send, base, route);
    await settle(send);
    const mobileHeight = await evaluate(send, `document.documentElement.scrollHeight`);
    const overflow = await evaluate(send, `document.documentElement.scrollWidth > innerWidth + 1`);
    if (process.env.SITE_METRICS_SHOTS && (route === "/" || route === "/solutions")) await shoot(send, `mobile${route.replace(/\//g, "_") || "_home"}`, 390, 844, 1, 1);
    const { text, linkTargets, tinySamples, ...rest } = m;
    if (tinySamples.length) console.log(`AUDITTINY ${JSON.stringify({ route, tinySamples })}`);
    console.log(`AUDIT ${JSON.stringify({ route, ...rest, uniqueLinkTargets: linkTargets.length, disclaimers, jargon, mobileHeight, mobileOverflow: overflow, firstWords: text.slice(0, 600) })}`);
    console.log(`AUDITTEXT ${JSON.stringify({ route, text })}`);
    summary.push({ route, words: m.words, phoneScreens: +(mobileHeight / 844).toFixed(1), disclaimers, internalTerms: Object.values(jargon).reduce((a, b) => a + b, 0), contactLabels: [...new Set(m.contactLinks)].length });
  }
  console.table(summary);
  console.log(`AUDITSUMMARY ${JSON.stringify(summary)}`);
  // Internal link health: every same-site path and fragment found on the audited pages.
  const broken = [];
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  for (const [href, from] of internal) {
    const [p, hash] = href.split("#");
    if (/\.[a-z0-9]{2,5}$/i.test(p || "")) {
      const res = await fetch(base + p, { method: "HEAD" }).then(r => r.status).catch(() => 0);
      if (res >= 400 || res === 0) broken.push({ href, from: [...new Set(from)], status: res });
      continue;
    }
    try { await navigate(send, base, p || "/"); } catch (e) { broken.push({ href, from: [...new Set(from)], error: String(e.message).slice(0, 120) }); continue; }
    await sleep(300);
    const r = await evaluate(send, `({ notFound: /not found|404/i.test(document.title) || !!document.querySelector('[data-route="not-found"], .not-found'), hasHash: ${hash ? `!!document.getElementById(${JSON.stringify(hash)})` : "true"} })`);
    if (r.notFound || !r.hasHash) broken.push({ href, from: [...new Set(from)], ...r });
  }
  console.log(`AUDITLINKS ${JSON.stringify({ checked: internal.size, broken })}`);
  if (broken.length) process.exitCode = 1;
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
