import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const requestedProfile = process.argv
  .find(argument => argument.startsWith("--profile="))
  ?.split("=")[1];

const profiles = {
  smallPhone: { label: "320px narrow viewport", width: 320, height: 740, deviceScaleFactor: 1 },
  iphone: {
    label: "iPhone Safari profile",
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  },
  android: {
    label: "Android Chrome profile",
    width: 412,
    height: 915,
    deviceScaleFactor: 2.625,
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  },
  tablet: { label: "768px tablet viewport", width: 768, height: 1024, deviceScaleFactor: 1 },
  compact: { label: "1024px compact laptop viewport", width: 1024, height: 768, deviceScaleFactor: 1, desktop: true },
  chromebook: { label: "1280px Chromebook viewport", width: 1280, height: 800, deviceScaleFactor: 1, desktop: true },
  desktop: { label: "1440px desktop viewport", width: 1440, height: 900, deviceScaleFactor: 1, desktop: true },
};

const publicRoutes = [
  "/", "/partners", "/partners/enterprise", "/partners/research", "/vow", "/qcs",
  "/assurance", "/registry", "/research-evidence", "/charter", "/charter/archive/v1.0",
  "/research/jrp-000", "/privacy", "/terms", "/portfolio", "/404",
];

const profileEntries = requestedProfile
  ? [[requestedProfile, profiles[requestedProfile]]]
  : Object.entries(profiles);

if (profileEntries.some(([, profile]) => !profile)) {
  throw new Error(`Unknown device profile: ${requestedProfile}`);
}

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

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

function startProcess(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
  const output = [];
  child.stdout.on("data", chunk => output.push(chunk.toString()));
  child.stderr.on("data", chunk => output.push(chunk.toString()));
  return { child, output };
}

function stopProcess(child) {
  if (child.exitCode !== null || child.signalCode) return Promise.resolve();
  return new Promise(resolve => {
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
    }, 2_000);
    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
    child.kill("SIGTERM");
  });
}

async function removeProfileDirectory(profileDirectory) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      await rm(profileDirectory, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 5) throw error;
      await wait(150);
    }
  }
}

async function waitForUrl(url, description, timeoutMilliseconds = 15_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMilliseconds) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The local server is still starting.
    }
    await wait(150);
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function connectToPage(debugPort) {
  await waitForUrl(`http://127.0.0.1:${debugPort}/json/list`, "headless browser");
  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  const target = targets.find(item => item.type === "page") ?? targets[0];
  if (!target?.webSocketDebuggerUrl) {
    throw new Error("Headless browser did not expose a page target");
  }

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let requestId = 0;
  const pending = new Map();
  const runtimeErrors = [];

  socket.addEventListener("message", event => {
    const response = JSON.parse(event.data);
    if (response.method === "Runtime.exceptionThrown") {
      runtimeErrors.push(response.params.exceptionDetails.text);
    }
    const callback = pending.get(response.id);
    if (callback) {
      pending.delete(response.id);
      callback(response);
    }
  });

  function send(method, params = {}) {
    const id = ++requestId;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(id, response =>
        response.error ? reject(new Error(response.error.message)) : resolve(response.result)
      );
    });
  }

  await send("Page.enable");
  await send("Runtime.enable");
  return { send, runtimeErrors, close: () => socket.close() };
}

async function waitForApp(send) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const state = await send("Runtime.evaluate", {
      returnByValue: true,
      expression:
        "({ readyState: document.readyState, textLength: document.querySelector('#root')?.textContent?.trim().length ?? 0 })",
    });
    if (state.result.value.readyState === "complete" && state.result.value.textLength > 200) return;
    await wait(100);
  }
  throw new Error("Application root did not finish rendering");
}

async function navigate(send, url) {
  await send("Page.navigate", { url });
  await waitForApp(send);
}

async function readLayout(send, selector) {
  const result = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      const rect = element?.getBoundingClientRect();
      return {
        viewportWidth: innerWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        element: rect
          ? {
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
            }
          : null,
        touchPoints: navigator.maxTouchPoints,
      };
    })()`,
  });
  return result.result.value;
}

async function evaluateProfile(send, profileName, profile, baseUrl) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: profile.width,
    height: profile.height,
    deviceScaleFactor: profile.deviceScaleFactor,
    mobile: !profile.desktop,
  });
  if (profile.userAgent) {
    await send("Emulation.setUserAgentOverride", { userAgent: profile.userAgent });
  } else {
    await send("Emulation.setUserAgentOverride", { userAgent: "" });
  }
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Emulation.setEmulatedMedia", {
    features: [
      { name: "hover", value: "none" },
      { name: "pointer", value: "coarse" },
      { name: "prefers-reduced-motion", value: "no-preference" },
    ],
  });

  await navigate(send, `${baseUrl}/?mobile-layout-check=${profileName}`);
  const homepage = await readLayout(send, ".mobile-menu-toggle");

  await navigate(send, `${baseUrl}/registry?mobile-layout-check=${profileName}`);
  const registry = await readLayout(send, ".curlicue-stage");

  await navigate(send, `${baseUrl}/partners?mobile-layout-check=${profileName}`);
  const partners = await readLayout(send, ".partner-pathway-link");

  await navigate(send, `${baseUrl}/partners/enterprise?mobile-layout-check=${profileName}`);
  const enterprise = await readLayout(send, ".enterprise-partner-form .partner-form-submit button");

  await navigate(send, `${baseUrl}/partners/research?mobile-layout-check=${profileName}`);
  const research = await readLayout(send, ".research-partner-form .partner-form-submit button");

  const failures = [];
  for (const [surface, checks] of [["homepage", homepage], ["registry", registry], ["partners", partners], ["enterprise", enterprise], ["research", research]]) {
    if (
      checks.scrollWidth > checks.clientWidth + 1 ||
      checks.bodyScrollWidth > checks.clientWidth + 1 ||
      checks.viewportWidth > profile.width + 1
    ) {
      failures.push(
        `${surface} horizontal overflow (${checks.scrollWidth}/${checks.bodyScrollWidth} at ${checks.viewportWidth}px)`
      );
    }
  }

  if (!profile.desktop && (!homepage.element || homepage.element.width < 40 || homepage.element.height < 40)) {
    failures.push("mobile menu control is missing or smaller than 40px");
  }

  if (!registry.element || registry.element.right > registry.viewportWidth || registry.element.left < 0) {
    failures.push("registry curlicue stage is missing or exceeds the mobile viewport");
  }

  if (!partners.element || partners.element.width < 40 || partners.element.height < 40) {
    failures.push("partner pathway control is missing or smaller than 40px");
  }

  if (!enterprise.element || enterprise.element.width < 40 || enterprise.element.height < 40) {
    failures.push("enterprise inquiry submit control is missing or smaller than 40px");
  }

  if (!research.element || research.element.width < 40 || research.element.height < 40) {
    failures.push("research inquiry submit control is missing or smaller than 40px");
  }

  if (homepage.touchPoints < 1 || registry.touchPoints < 1 || partners.touchPoints < 1 || enterprise.touchPoints < 1 || research.touchPoints < 1) {
    failures.push("touch emulation did not activate");
  }

  // Page width alone misses text painted underneath an adjacent grid column.
  // Inspect each heading's actual text fragments against its own box as well.
  const routeChecks = [];
  for (const route of publicRoutes) {
    await navigate(send, `${baseUrl}${route}`);
    const result = await send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `(async () => {
        await document.fonts.ready;
        const escapedHeadings = [];
        for (const heading of document.querySelectorAll('h1, h2, h3')) {
          const box = heading.getBoundingClientRect();
          if (!box.width || !box.height) continue;
          const range = document.createRange();
          range.selectNodeContents(heading);
          const escaped = [...range.getClientRects()].some(rect =>
            rect.width > 0 && (rect.left < box.left - 3 || rect.right > box.right + 3)
          );
          if (escaped) escapedHeadings.push(heading.textContent.trim());
        }
        const overflowingControls = [...document.querySelectorAll('.partner-form input, .partner-form select, .partner-form textarea, .partner-form-submit button')]
          .filter(el => {
            const a=el.getBoundingClientRect(), b=el.parentElement.getBoundingClientRect();
            return a.width && (a.left < b.left - 1 || a.right > b.right + 1);
          }).map(el => el.getAttribute('name') || el.textContent.trim());
        return {
          width: innerWidth, clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth, escapedHeadings, overflowingControls,
          expandedElements: [...document.querySelectorAll('body *')].filter(el => {
            const box=el.getBoundingClientRect();
            return box.width > 0 && box.right > ${profile.width} + 1 && getComputedStyle(el).visibility !== 'hidden';
          }).slice(0, 12).map(el => ({ tag: el.tagName, class: el.className, right: el.getBoundingClientRect().right })),
          title: document.title, headingCount: document.querySelectorAll('h1').length,
        };
      })()`,
    });
    const check = result.result.value;
    routeChecks.push({ route, ...check });
    if (check.headingCount !== 1) failures.push(`${route}: expected one page heading`);
    if (check.scrollWidth > check.clientWidth + 1 || check.bodyWidth > check.clientWidth + 1 || check.width > profile.width + 1) failures.push(`${route}: horizontal page overflow: ${JSON.stringify(check.expandedElements)}`);
    for (const heading of check.escapedHeadings) failures.push(`${route}: heading escapes its column: ${heading}`);
    for (const control of check.overflowingControls) failures.push(`${route}: form control escapes its field: ${control}`);
  }

  return { profileName, profile, homepage, registry, partners, enterprise, research, routeChecks, failures };
}

const projectRoot = process.cwd();
const distEntry = path.join(projectRoot, "dist", "index.js");
if (!existsSync(distEntry)) {
  throw new Error("Missing dist/index.js. Run `pnpm build` before `pnpm test:mobile-layout`.");
}

const appPort = await findOpenPort();
const debugPort = await findOpenPort();
const chromium = process.env.CHROMIUM_BIN || "chromium";
const profileDirectory = path.join(tmpdir(), `jcee-mobile-layout-${process.pid}`);
const app = startProcess("node", [distEntry], {
  cwd: projectRoot,
  env: { ...process.env, NODE_ENV: "production", PORT: String(appPort) },
});
const browser = startProcess(chromium, [
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
  const page = await connectToPage(debugPort);
  const reports = [];

  for (const [profileName, profile] of profileEntries) {
    reports.push(await evaluateProfile(page.send, profileName, profile, baseUrl));
  }

  const failures = reports.flatMap(report =>
    report.failures.map(failure => `${report.profileName}: ${failure}`)
  );
  if (page.runtimeErrors.length) {
    failures.push(`runtime errors: ${page.runtimeErrors.join("; ")}`);
  }

  reports.forEach(report => {
    console.log(
      `${report.profile.label}: ${report.homepage.viewportWidth}px viewport, ` +
        `${report.homepage.scrollWidth}px homepage width, ` +
        `${report.registry.scrollWidth}px registry width, ` +
        `${report.homepage.element?.width ?? 0}×${report.homepage.element?.height ?? 0}px menu`
    );
  });

  if (failures.length) throw new Error(failures.join("\n"));
  console.log("Mobile layout smoke check passed.");
  page.close();
} catch (error) {
  exitCode = 1;
  console.error(
    `Mobile layout smoke check failed: ${error instanceof Error ? error.message : String(error)}`
  );
  console.error(`App output:\n${app.output.join("")}`);
} finally {
  await Promise.all([stopProcess(app.child), stopProcess(browser.child)]);
  await removeProfileDirectory(profileDirectory);
}

process.exitCode = exitCode;
