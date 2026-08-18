import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const requestedProfile = process.argv.find(argument => argument.startsWith("--profile="))?.split("=")[1];
const profiles = {
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
};

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
  if (!target?.webSocketDebuggerUrl) throw new Error("Headless browser did not expose a page target");

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
        response.error ? reject(new Error(response.error.message)) : resolve(response.result),
      );
    });
  }

  await send("Page.enable");
  await send("Runtime.enable");
  return { send, runtimeErrors, close: () => socket.close() };
}

async function waitForApp(send) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const state = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: "({ readyState: document.readyState, textLength: document.querySelector('#root')?.textContent?.trim().length ?? 0 })",
    });
    if (state.result.value.readyState === "complete" && state.result.value.textLength > 200) return;
    await wait(100);
  }
  throw new Error("Application root did not finish rendering");
}

async function evaluateProfile(send, profileName, profile, baseUrl) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: profile.width,
    height: profile.height,
    deviceScaleFactor: profile.deviceScaleFactor,
    mobile: true,
  });
  await send("Emulation.setUserAgentOverride", { userAgent: profile.userAgent });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Emulation.setEmulatedMedia", {
    features: [
      { name: "hover", value: "none" },
      { name: "pointer", value: "coarse" },
      { name: "prefers-reduced-motion", value: "no-preference" },
    ],
  });
  await send("Page.navigate", { url: `${baseUrl}/?mobile-layout-check=${profileName}` });
  await waitForApp(send);
  const result = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const menu = document.querySelector('.mobile-menu-toggle');
      const curlicue = document.querySelector('.curlicue-stage');
      const menuRect = menu?.getBoundingClientRect();
      const curlicueRect = curlicue?.getBoundingClientRect();
      return {
        viewportWidth: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        menu: menuRect ? { width: Math.round(menuRect.width), height: Math.round(menuRect.height) } : null,
        curlicue: curlicueRect ? { width: Math.round(curlicueRect.width), right: Math.round(curlicueRect.right) } : null,
        touchPoints: navigator.maxTouchPoints,
      };
    })()`,
  });
  const checks = result.result.value;
  const failures = [];
  if (checks.scrollWidth !== checks.viewportWidth || checks.bodyScrollWidth > checks.viewportWidth) {
    failures.push(`horizontal overflow (${checks.scrollWidth}/${checks.bodyScrollWidth} at ${checks.viewportWidth}px)`);
  }
  if (!checks.menu || checks.menu.width < 40 || checks.menu.height < 40) {
    failures.push("mobile menu control is missing or smaller than 40px");
  }
  if (!checks.curlicue || checks.curlicue.right > checks.viewportWidth) {
    failures.push("curlicue stage is missing or exceeds the mobile viewport");
  }
  if (checks.touchPoints < 1) failures.push("touch emulation did not activate");
  return { profileName, profile, checks, failures };
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
  const failures = reports.flatMap(report => report.failures.map(failure => `${report.profileName}: ${failure}`));
  if (page.runtimeErrors.length) failures.push(`runtime errors: ${page.runtimeErrors.join("; ")}`);
  reports.forEach(report => {
    const { checks } = report;
    console.log(
      `${report.profile.label}: ${checks.viewportWidth}px viewport, ${checks.scrollWidth}px document width, ${checks.menu?.width ?? 0}×${checks.menu?.height ?? 0}px menu`,
    );
  });
  if (failures.length) throw new Error(failures.join("\n"));
  console.log("Mobile layout smoke check passed.");
  page.close();
} catch (error) {
  exitCode = 1;
  console.error(`Mobile layout smoke check failed: ${error instanceof Error ? error.message : String(error)}`);
  console.error(`App output:\n${app.output.join("")}`);
} finally {
  await Promise.all([stopProcess(app.child), stopProcess(browser.child)]);
  await removeProfileDirectory(profileDirectory);
}

process.exitCode = exitCode;
