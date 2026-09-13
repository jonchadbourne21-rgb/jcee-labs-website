import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

const profiles = [
  { name: "iphone", width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
  { name: "compact", width: 1024, height: 768, deviceScaleFactor: 1, mobile: false },
  { name: "desktop", width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
];

const routes = [
  ["/", "JCEE OPERATING CLOUD"],
  ["/operating-cloud", "Keep the systems that work."],
  ["/distribution", "Catch the mismatch"],
  ["/technology", "Different jobs."],
];

const expectedNavigation = [
  "JCEE LABS",
  "OPERATING CLOUD",
  "DISTRIBUTION",
  "TECHNOLOGY",
  "EVIDENCE",
  "PARTNERS",
];

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function findOpenPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not allocate a local port"));
        return;
      }
      const { port } = address;
      server.close(error => (error ? reject(error) : resolve(port)));
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

async function waitForUrl(url, description, timeout = 15_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // Process is still starting.
    }
    await wait(125);
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function connect(debugPort) {
  const endpoint = `http://127.0.0.1:${debugPort}/json/list`;
  await waitForUrl(endpoint, "headless Chromium");
  const targets = await (await fetch(endpoint)).json();
  const target = targets.find(item => item.type === "page") ?? targets[0];
  if (!target?.webSocketDebuggerUrl) throw new Error("Chromium did not expose a page target");

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  const runtimeErrors = [];
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
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
    const requestId = ++id;
    socket.send(JSON.stringify({ id: requestId, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(requestId, message =>
        message.error ? reject(new Error(message.error.message)) : resolve(message.result)
      );
    });
  };

  await send("Page.enable");
  await send("Runtime.enable");
  return { send, runtimeErrors, close: () => socket.close() };
}

async function waitForApp(send) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const state = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: "({ready:document.readyState,text:document.querySelector('#root')?.textContent?.trim().length||0})",
    });
    if (state.result.value.ready === "complete" && state.result.value.text > 120) {
      await send("Runtime.evaluate", { awaitPromise: true, expression: "document.fonts.ready" });
      return;
    }
    await wait(100);
  }
  throw new Error("Application did not finish rendering");
}

async function navigate(send, url) {
  await send("Page.navigate", { url });
  await waitForApp(send);
}

async function evaluate(send, expression, awaitPromise = false) {
  const result = await send("Runtime.evaluate", { returnByValue: true, awaitPromise, expression });
  return result.result.value;
}

async function setProfile(send, profile) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: profile.width,
    height: profile.height,
    deviceScaleFactor: profile.deviceScaleFactor,
    mobile: profile.mobile,
  });
  await send("Emulation.setTouchEmulationEnabled", {
    enabled: profile.mobile,
    maxTouchPoints: profile.mobile ? 5 : 1,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "hover", value: profile.mobile ? "none" : "hover" },
      { name: "pointer", value: profile.mobile ? "coarse" : "fine" },
    ],
  });
}

async function inspectPage(send) {
  return evaluate(send, `(async () => {
    await document.fonts.ready;
    const headings = [...document.querySelectorAll('h1')];
    const body = document.body.innerText;
    const escapedHeadings = [];
    for (const heading of document.querySelectorAll('h1, h2, h3')) {
      const box = heading.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      const range = document.createRange();
      range.selectNodeContents(heading);
      if ([...range.getClientRects()].some(rect => rect.width > 0 && (rect.left < box.left - 3 || rect.right > box.right + 3))) {
        escapedHeadings.push(heading.textContent.trim());
      }
    }
    return {
      body,
      title: document.title,
      h1Count: headings.length,
      width: innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      escapedHeadings,
    };
  })()`, true);
}

async function capture(send, outputPath) {
  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(outputPath, Buffer.from(screenshot.data, "base64"));
}

const projectRoot = process.cwd();
const distEntry = path.join(projectRoot, "dist", "index.js");
if (!existsSync(distEntry)) {
  throw new Error("Missing dist/index.js. Run pnpm build before pnpm test:operating-cloud.");
}

const artifactDirectory = path.join(projectRoot, "artifacts", "site-screenshots");
await rm(artifactDirectory, { recursive: true, force: true });
await mkdir(artifactDirectory, { recursive: true });

const appPort = await findOpenPort();
const debugPort = await findOpenPort();
const profileDirectory = path.join(tmpdir(), `jcee-operating-cloud-${process.pid}`);
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
  const baseUrl = `http://127.0.0.1:${appPort}`;
  await waitForUrl(baseUrl, "production server");
  const page = await connect(debugPort);
  const failures = [];

  for (const profile of profiles) {
    await setProfile(page.send, profile);
    for (const [route, expectedText] of routes) {
      await navigate(page.send, `${baseUrl}${route}?operating-cloud-check=${profile.name}`);
      const result = await inspectPage(page.send);
      if (!result.body.includes(expectedText)) failures.push(`${profile.name} ${route}: missing ${expectedText}`);
      if (/\bwedge\b/i.test(result.body)) failures.push(`${profile.name} ${route}: exposes internal term "wedge"`);
      if (result.h1Count !== 1) failures.push(`${profile.name} ${route}: expected one h1, found ${result.h1Count}`);
      if (result.scrollWidth > result.clientWidth + 1 || result.bodyWidth > result.clientWidth + 1 || result.width > profile.width + 1) {
        failures.push(`${profile.name} ${route}: horizontal overflow ${result.scrollWidth}/${result.bodyWidth} at ${result.width}px`);
      }
      for (const heading of result.escapedHeadings) failures.push(`${profile.name} ${route}: heading escapes its column: ${heading}`);
    }
  }

  await setProfile(page.send, profiles[2]);
  await navigate(page.send, `${baseUrl}/?operating-cloud-check=brand`);
  const contract = await evaluate(page.send, `(() => ({
    nav: [...document.querySelectorAll('.desktop-nav a')].map(a => a.textContent.trim()),
    navColor: getComputedStyle(document.querySelector('.desktop-nav a:not([aria-current="page"])')).color,
    activeColor: getComputedStyle(document.querySelector('.desktop-nav a[aria-current="page"]')).color,
    qcsQuiet: getComputedStyle(document.querySelector('.qcs-copy .quiet')).color,
    brandBlue: getComputedStyle(document.documentElement).getPropertyValue('--jcee-blue').trim(),
  }))()`);

  if (JSON.stringify(contract.nav) !== JSON.stringify(expectedNavigation)) {
    failures.push(`navigation mismatch: ${JSON.stringify(contract.nav)}`);
  }
  if (contract.navColor !== "rgba(255, 255, 255, 0.82)") {
    failures.push(`navigation contrast drifted: ${contract.navColor}`);
  }
  if (contract.activeColor !== "rgb(255, 255, 255)") {
    failures.push(`active navigation contrast drifted: ${contract.activeColor}`);
  }
  if (contract.qcsQuiet !== "rgba(9, 11, 16, 0.72)") {
    failures.push(`QCS bounded-scope copy is still too faint or changed unexpectedly: ${contract.qcsQuiet}`);
  }
  if (contract.brandBlue.toLowerCase() !== "#315cff") {
    failures.push(`brand blue drifted: ${contract.brandBlue}`);
  }

  await capture(page.send, path.join(artifactDirectory, "home-hero-desktop.png"));
  await evaluate(page.send, "document.querySelector('.operating-cloud-section')?.scrollIntoView({block:'start'})");
  await wait(120);
  await capture(page.send, path.join(artifactDirectory, "home-operating-cloud-desktop.png"));

  for (const [route, fileName] of [
    ["/operating-cloud", "operating-cloud-desktop.png"],
    ["/distribution", "distribution-desktop.png"],
    ["/technology", "technology-desktop.png"],
  ]) {
    await navigate(page.send, `${baseUrl}${route}?screenshot=desktop`);
    await capture(page.send, path.join(artifactDirectory, fileName));
  }

  await setProfile(page.send, profiles[0]);
  await navigate(page.send, `${baseUrl}/?screenshot=mobile`);
  await capture(page.send, path.join(artifactDirectory, "home-mobile.png"));

  if (page.runtimeErrors.length) failures.push(`runtime errors: ${page.runtimeErrors.join("; ")}`);
  if (failures.length) throw new Error(failures.join("\n"));

  console.log(`Operating Cloud public-surface check passed across ${profiles.length} profiles and ${routes.length} routes.`);
  console.log(`Screenshots written to ${artifactDirectory}.`);
  page.close();
} catch (error) {
  exitCode = 1;
  console.error(`Operating Cloud check failed: ${error instanceof Error ? error.message : String(error)}`);
  console.error(`Application output:\n${app.output.join("")}`);
  console.error(`Browser output:\n${browser.output.join("")}`);
} finally {
  await Promise.all([stop(app.child), stop(browser.child)]);
  await rm(profileDirectory, { recursive: true, force: true });
}

process.exitCode = exitCode;
