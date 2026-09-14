import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

const retiredRoutes = [
  "/products",
  "/services",
  "/team",
  "/faq",
  "/truerpm",
  "/nicheflo",
  "/flocraft",
  "/rooh",
  "/revel",
  "/sopforge",
  "/babodie",
  "/mirrored",
];

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function findOpenPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        return reject(new Error("Could not allocate a local port"));
      }
      server.close(error => (error ? reject(error) : resolve(address.port)));
    });
  });
}

function start(command, args, options = {}) {
  const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], ...options });
  const output = [];
  child.stdout.on("data", chunk => output.push(chunk.toString()));
  child.stderr.on("data", chunk => output.push(chunk.toString()));
  return { child, output };
}

function stop(child) {
  if (child.exitCode !== null || child.signalCode) return Promise.resolve();
  return new Promise(resolve => {
    const timeout = setTimeout(() => child.kill("SIGKILL"), 2_000);
    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
    child.kill("SIGTERM");
  });
}

async function removeProfileDirectory(directory) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      await rm(directory, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 5) throw error;
      await sleep(150);
    }
  }
}

async function waitForUrl(url, description) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // The server is still starting.
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function connect(debugPort) {
  const endpoint = `http://127.0.0.1:${debugPort}/json/list`;
  await waitForUrl(endpoint, "headless browser");
  const targets = await (await fetch(endpoint)).json();
  const target = targets.find(item => item.type === "page") ?? targets[0];
  if (!target?.webSocketDebuggerUrl) {
    throw new Error("Headless browser did not expose a page target");
  }

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let sequence = 0;
  const pending = new Map();
  const runtimeErrors = [];
  const networkFailures = [];
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.method === "Network.responseReceived") {
      const { response, type } = message.params;
      if (response.url.startsWith("http://127.0.0.1:") &&
          ((response.status >= 400 && type !== "Document") || response.url.includes("/api/"))) {
        networkFailures.push(`${response.status} ${response.url}`);
      }
    }
    if (message.method === "Runtime.exceptionThrown") {
      runtimeErrors.push(message.params.exceptionDetails.text);
    }
    const callback = pending.get(message.id);
    if (callback) {
      pending.delete(message.id);
      callback(message);
    }
  });

  const send = (method, params = {}) => {
    const id = ++sequence;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(id, message =>
        message.error ? reject(new Error(message.error.message)) : resolve(message.result)
      );
    });
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  return { send, runtimeErrors, networkFailures, close: () => socket.close() };
}

async function waitForApp(send) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const response = await send("Runtime.evaluate", {
      returnByValue: true,
      expression:
        "({ ready: document.readyState, textLength: document.querySelector('#root')?.textContent?.trim().length ?? 0 })",
    });
    if (response.result.value.ready === "complete" && response.result.value.textLength > 100) return;
    await sleep(75);
  }
  throw new Error("Application root did not finish rendering");
}

async function navigate(send, baseUrl, route) {
  await send("Page.navigate", { url: `${baseUrl}${route}` });
  await waitForApp(send);
}

async function readBody(send) {
  const response = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: "document.body.innerText",
  });
  return response.result.value;
}

async function evaluate(send, expression) {
  const response = await send("Runtime.evaluate", {
    returnByValue: true,
    expression,
  });
  return response.result.value;
}

const projectRoot = process.cwd();
const staticMode = Object.hasOwn(process.env, "PAGES_BASE_PATH");
const prefix = staticMode ? process.env.PAGES_BASE_PATH : "";
const distEntry = path.join(projectRoot, staticMode ? "scripts/serve-pages-test.mjs" : "dist/index.js");
if (!existsSync(distEntry)) {
  throw new Error("Missing dist/index.js. Run pnpm build before pnpm test:public-surface.");
}

const appPort = await findOpenPort();
const debugPort = await findOpenPort();
const profileDirectory = path.join(tmpdir(), `jcee-public-surface-${process.pid}`);
const app = start("node", [distEntry], {
  cwd: projectRoot,
  env: { ...process.env, NODE_ENV: "production", PORT: String(appPort) },
});
const browser = start(process.env.CHROMIUM_BIN || "chromium", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDirectory}`,
  "about:blank",
]);

let exitCode = 0;
try {
  const baseUrl = `http://127.0.0.1:${appPort}${prefix}`;
  await waitForUrl(`${baseUrl}/`, staticMode ? "static Pages server" : "production server");
  const page = await connect(debugPort);
  const failures = [];

  await navigate(page.send, baseUrl, "/");
  const homepageText = await readBody(page.send);
  if (!homepageText.includes("JCEE ASSURANCE")) {
    failures.push("homepage is missing the JCEE Assurance section");
  }
  if (!homepageText.includes("PUBLIC REGISTRY")) {
    failures.push("homepage is missing the Public Registry section");
  }
  if (homepageText.includes("MIRRORED")) {
    failures.push("homepage still exposes Mirrored");
  }

  const footer = await evaluate(page.send, `(() => {
    const footer = document.querySelector('.brand-footer');
    const links = [...(footer?.querySelectorAll('a') ?? [])].map(link => ({
      href: link.getAttribute('href'),
      text: link.textContent?.trim(),
    }));
    return { present: Boolean(footer), links };
  })()`);

  const requiredFooterLinks = [
    ["/privacy", "Privacy"],
    ["/terms", "Terms"],
    ["/registry", "Public Registry"],
    ["/assurance", "JCEE Assurance"],
    ["/partners", "Partner with JCEE Labs"],
    ["/partners/enterprise", "Enterprise pathway"],
    ["/partners/research", "Research pathway"],
  ];
  if (!footer.present) failures.push("shared footer is missing from homepage");
  for (const [href, text] of requiredFooterLinks) {
    if (!footer.links.some(link => link.href === `${prefix}${href}` && link.text === text)) {
      failures.push(`footer is missing ${text} link (${href})`);
    }
  }

  if (staticMode) {
    const manifestResponse = await fetch(`${baseUrl}/deployment.json`);
    if (!manifestResponse.ok) throw new Error("Missing static deployment manifest");
    const manifest = await manifestResponse.json();
    for (const route of manifest.publicRoutes) {
      const response = await fetch(`${baseUrl}${route}`);
      if (response.status !== 200) failures.push(`Static public route returned ${response.status}: ${route}`);
    }
    const cloudPanel = await evaluate(page.send,
      "Boolean(document.querySelector('.operating-cloud-home'))");
    if (!cloudPanel) failures.push("Latest Operating Cloud panel is missing");
    for (const name of ["01-signature-hero-exposed.webp", "01-signature-hero-exposed-mobile.webp",
                        "02-vow-receipt.webp", "03-qcs-causal-rail.webp"]) {
      const response = await fetch(`${baseUrl}/visuals/${name}`);
      if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
        failures.push(`Static image is missing: ${name}`);
      }
    }
  }

  for (const route of retiredRoutes) {
    if (staticMode && (await fetch(`${baseUrl}${route}`)).status !== 404) {
      failures.push(`Retired static route did not return HTTP 404: ${route}`);
    }
    await navigate(page.send, baseUrl, route);
    const text = await readBody(page.send);
    if (!text.includes("404 / UNKNOWN STATE") || !text.includes("is not in evidence")) {
      failures.push(`retired route does not render the JCEE 404: ${route}`);
    }
  }

  for (const [route, expectedHeading] of [
    ["/privacy", "Privacy Policy"],
    ["/terms", "Terms of Service"],
    ["/registry", "A living record."],
    ["/assurance", "The actor is not"],
    ["/charter", "Hypotheses may"],
    ["/partners", "Choose the boundary"],
    ["/partners/enterprise", "Make consequential software"],
    ["/partners/research", "Put the claim where"],
  ]) {
    await navigate(page.send, baseUrl, route);
    if (!(await readBody(page.send)).includes(expectedHeading)) {
      failures.push(`${route} does not render expected text: ${expectedHeading}`);
    }
  }

  await navigate(page.send, baseUrl, "/assurance");
  const assuranceArchitectureColors = await evaluate(page.send, `(() => {
    const copy = document.querySelector('.assurance-architecture-grid article > div > p:last-child');
    const label = document.querySelector('.assurance-architecture-grid article > div > p:first-child');
    return {
      copy: copy ? getComputedStyle(copy).color : null,
      label: label ? getComputedStyle(label).color : null,
      labelTransition: label ? getComputedStyle(label).transitionProperty : null,
    };
  })()`);
  if (assuranceArchitectureColors.copy !== "rgba(9, 11, 16, 0.68)") {
    failures.push(`Assurance architecture copy has unexpected low-contrast color: ${assuranceArchitectureColors.copy}`);
  }
  if (assuranceArchitectureColors.label !== "rgb(49, 92, 255)") {
    failures.push(`Assurance architecture label has unexpected color: ${assuranceArchitectureColors.label}`);
  }
  if (!assuranceArchitectureColors.labelTransition?.includes("color") || !assuranceArchitectureColors.labelTransition?.includes("transform")) {
    failures.push(`Assurance architecture label is missing its subtle hover transition: ${assuranceArchitectureColors.labelTransition}`);
  }

  for (const [route, heading] of [
    ["/operating-cloud", "A common foundation"], ["/blog/the-work-nobody-sees", "The Work Nobody Sees"], ["/research/crucible-composition-tax", "testing the cost of composition"],
    ["/solutions/distribution", "Keep the order true"], ["/technology", "Intelligence should leave receipts"],
    ["/research", "Results you can examine"], ["/resources", "Ideas, builds"], ["/company", "Build useful intelligence"],
    ["/blog/start-with-the-workflow", "Start with the workflow"],
    ["/blog/distribution-first-dry-run", "the first order-integrity dry run"],
    ["/research/qcs-frozen-specification-reproduction", "reproducing a frozen specification"],
    ["/research/crucible-semantic-kernel", "conventional parity"],
  ]) {
    await navigate(page.send, baseUrl, route);
    if (!(await readBody(page.send)).includes(heading)) failures.push(`${route}: missing publication or page`);
  }
  for (const asset of ["publications/the-work-nobody-sees.md", "publications/crucible-composition-tax.md", "JCEE_Labs_Public_Registry_v1.2.md", "publications/start-with-the-workflow.md", "publications/distribution-first-dry-run.md", "publications/qcs-frozen-specification-reproduction.md", "publications/crucible-semantic-kernel.md"]) {
    const response = await fetch(`${baseUrl}/${asset}`);
    const text = await response.text();
    if (!response.ok || !text.startsWith("# ")) failures.push(`${asset}: missing Markdown publication`);
  }
  await navigate(page.send, baseUrl, "/resources");
  await evaluate(page.send, `(() => { [...document.querySelectorAll('.resource-filters button')].find(b=>b.textContent === 'Engineering blog')?.click(); })()`);
  await sleep(100);
  const filtered = await evaluate(page.send, `({ count:document.querySelectorAll('.resource-card').length, text:document.querySelector('.resource-card')?.textContent })`);
  if (filtered.count !== 1 || !filtered.text.includes('order-integrity')) failures.push('Resource filter did not show the engineering article');

  for (const [label, count] of [["From the Founder", 1], ["Research", 3]]) {
    await evaluate(page.send, `(() => { [...document.querySelectorAll('.resource-filters button')].find(b=>b.textContent === '${label}')?.click(); })()`);
    await sleep(100);
    const cards = await evaluate(page.send, `({ count:document.querySelectorAll('.resource-card').length, text:document.querySelector('.resource-grid')?.textContent })`);
    if (cards.count !== count) failures.push(`${label}: wrong category count`);
    if (label === "Research" && cards.text.includes("The Work Nobody Sees")) failures.push('Founder essay incorrectly classified as research');
  }
  await navigate(page.send, baseUrl, "/terms");
  const termsText = await readBody(page.send);
  if (termsText.toUpperCase().includes("MIRRORED")) {
    failures.push("Terms still expose the retired Mirrored product");
  }
  for (const requiredTermsSurface of [
    "JCEE VOW",
    "QCS research program",
    "JCEE Assurance",
    "JCEE Public Registry",
    "JCEE Labs Charter",
  ]) {
    if (!termsText.includes(requiredTermsSurface)) {
      failures.push(`Terms are missing current public surface: ${requiredTermsSurface}`);
    }
  }

  await navigate(page.send, baseUrl, "/registry");
  const registryDownloadLink = await evaluate(
    page.send,
    `Boolean(document.querySelector('a[download][href="${prefix}/JCEE_Labs_Public_Registry_v1.0.md"]'))`
  );
  if (!registryDownloadLink) {
    failures.push("Public Registry page is missing its Markdown download link");
  }

  const registryInteractions = await evaluate(page.send, `(() => {
    const index = document.querySelector('.registry-entry-index');
    const label = document.querySelector('.registry-entry dt');
    const link = document.querySelector('.registry-entry a');
    link?.focus();
    const containsFocusRule = rules => [...rules].some(rule => {
      if (rule.cssText?.includes('.registry-entry a:focus-visible') && rule.cssText?.includes('outline')) return true;
      return rule.cssRules ? containsFocusRule(rule.cssRules) : false;
    });
    return {
      indexTransition: index ? getComputedStyle(index).transitionProperty : null,
      labelTransition: label ? getComputedStyle(label).transitionProperty : null,
      linkFocused: document.activeElement === link,
      focusRulePresent: [...document.styleSheets].some(sheet => {
        try { return containsFocusRule(sheet.cssRules); } catch { return false; }
      }),
    };
  })()`);
  if (!registryInteractions.indexTransition?.includes("color") || !registryInteractions.indexTransition?.includes("transform")) {
    failures.push(`Registry entry index is missing its subtle label transition: ${registryInteractions.indexTransition}`);
  }
  if (!registryInteractions.labelTransition?.includes("color") || !registryInteractions.labelTransition?.includes("transform")) {
    failures.push(`Registry evidence label is missing its subtle label transition: ${registryInteractions.labelTransition}`);
  }
  if (!registryInteractions.linkFocused || !registryInteractions.focusRulePresent) {
    failures.push(`Registry technical link is missing visible keyboard focus: ${JSON.stringify(registryInteractions)}`);
  }

  const registryResponse = await fetch(`${baseUrl}/JCEE_Labs_Public_Registry_v1.0.md`);
  const registryText = await registryResponse.text();
  if (
    !registryResponse.ok ||
    !registryResponse.headers.get("content-type")?.includes("text/markdown") ||
    !registryText.startsWith("# JCEE Labs Public Registry — Version 1.0")
  ) {
    failures.push("Public Registry Markdown endpoint is not valid");
  }

  await navigate(page.send, baseUrl, "/charter");
  const charterV11Link = await evaluate(
    page.send,
    `Boolean(document.querySelector('a[download][href="${prefix}/JCEE_Labs_Charter_v1.1.md"]'))`
  );
  if (!charterV11Link) {
    failures.push("Charter v1.1 page is missing the addendum download link");
  }

  const charterV11Response = await fetch(`${baseUrl}/JCEE_Labs_Charter_v1.1.md`);
  const charterV11Text = await charterV11Response.text();
  if (
    !charterV11Response.ok ||
    !charterV11Response.headers.get("content-type")?.includes("text/markdown") ||
    !charterV11Text.startsWith("# The JCEE Labs Charter — Version 1.1")
  ) {
    failures.push("Charter v1.1 Markdown download endpoint is not valid");
  }

  await navigate(page.send, baseUrl, "/charter/archive/v1.0");
  const charterV10Link = await evaluate(
    page.send,
    `Boolean(document.querySelector('a[download][href="${prefix}/JCEE_Labs_Charter_v1.0.md"]'))`
  );
  if (!charterV10Link) {
    failures.push("Preserved Charter v1.0 page is missing its Markdown download link");
  }

  const charterV10Response = await fetch(`${baseUrl}/JCEE_Labs_Charter_v1.0.md`);
  const charterV10Text = await charterV10Response.text();
  if (
    !charterV10Response.ok ||
    !charterV10Response.headers.get("content-type")?.includes("text/markdown") ||
    !charterV10Text.startsWith("# The JCEE Labs Charter")
  ) {
    failures.push("Preserved Charter v1.0 Markdown endpoint is not valid");
  }

  if (staticMode) {
    await navigate(page.send, baseUrl, "/research/jrp-000");
    // This request formerly escaped the project prefix and silently loaded 404 HTML.
    const paper = await fetch(`${baseUrl}/JRP-000_The_Evidence_Boundary_v1.0.md`);
    if (!paper.ok || !(await paper.text()).startsWith("#")) failures.push("Research paper download failed");
    let paperRendered = false;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      paperRendered = await evaluate(page.send,
        "Boolean(document.querySelector('.paper-markdown h2'))");
      if (paperRendered) break;
      await sleep(100);
    }
    if (!paperRendered) failures.push("Research paper body did not render from its static Markdown source");
    if (page.networkFailures.length) failures.push(`Static resource/API failures: ${page.networkFailures.join("; ")}`);
    console.log(`Static Pages checks completed for ${prefix || "/"}: direct routes, local images, documents, and no application API.`);
  }

  if (page.runtimeErrors.length) {
    failures.push(`runtime errors: ${page.runtimeErrors.join("; ")}`);
  }
  if (failures.length) throw new Error(failures.join("\n"));

  console.log(
    `Public surface gate passed: ${retiredRoutes.length} retired routes resolve to JCEE 404; ` +
      "JCEE Assurance, Public Registry, Charter v1.1, preserved Charter v1.0, Privacy, and current Terms are intact."
  );
  page.close();
} catch (error) {
  exitCode = 1;
  console.error(
    `Public surface gate failed: ${error instanceof Error ? error.message : String(error)}`
  );
  console.error(`Application output:\n${app.output.join("")}`);
} finally {
  await Promise.all([stop(app.child), stop(browser.child)]);
  await removeProfileDirectory(profileDirectory);
}

process.exitCode = exitCode;
