import { spawn } from "node:child_process";
import { writeFile, rm } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const baseUrl = process.argv[2] || "http://127.0.0.1:8000";
const projectId = process.argv[3];
const profiles = [
  { name: "iphone", width: 390, height: 844, scale: 3 },
  { name: "android", width: 412, height: 915, scale: 2.625 },
];

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function openPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") return reject(new Error("No debug port"));
      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });
}

async function waitForJson(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (_) {}
    await wait(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function connect(port) {
  const targets = await waitForJson(`http://127.0.0.1:${port}/json/list`);
  const target = targets.find((item) => item.type === "page") || targets[0];
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener("message", (event) => {
    const response = JSON.parse(event.data);
    if (response.method === "Runtime.exceptionThrown") {
      errors.push(response.params.exceptionDetails.text);
    }
    const callback = pending.get(response.id);
    if (callback) {
      pending.delete(response.id);
      response.error ? callback.reject(new Error(response.error.message)) : callback.resolve(response.result);
    }
  });
  const send = (method, params = {}) => {
    const requestId = ++id;
    socket.send(JSON.stringify({ id: requestId, method, params }));
    return new Promise((resolve, reject) => pending.set(requestId, { resolve, reject }));
  };
  await send("Page.enable");
  await send("Runtime.enable");
  return { send, close: () => socket.close(), errors };
}

async function evaluate(send, expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result.result.value;
}

async function navigate(send, url, selector) {
  await send("Page.navigate", { url });
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const ready = await evaluate(send, `document.readyState === 'complete' && Boolean(document.querySelector(${JSON.stringify(selector)}))`);
    if (ready) return;
    await wait(100);
  }
  throw new Error(`Page did not render ${selector}: ${url}`);
}

async function inspect(send, selector) {
  return evaluate(send, `(() => {
    const target = document.querySelector(${JSON.stringify(selector)});
    const rect = target?.getBoundingClientRect();
    return {
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      target: rect ? { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), height: Math.round(rect.height) } : null,
      timelineScrollable: (() => { const el = document.querySelector('#timeline'); return !el || el.scrollWidth > el.clientWidth; })(),
      visibleCards: Array.from(document.querySelectorAll('.shot-card')).filter(el => { const r = el.getBoundingClientRect(); return r.right > 0 && r.left < innerWidth; }).length,
    };
  })()`);
}

const debugPort = await openPort();
const profileDirectory = path.join(os.tmpdir(), `frameforge-responsive-${process.pid}`);
const browser = spawn("chromium", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDirectory}`,
  "about:blank",
], { stdio: "ignore" });

let failed = false;
try {
  const page = await connect(debugPort);
  for (const profile of profiles) {
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: profile.width,
      height: profile.height,
      deviceScaleFactor: profile.scale,
      mobile: true,
    });
    await page.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    await navigate(page.send, `${baseUrl}/`, ".brief-form");
    const intake = await inspect(page.send, "#generateButton");
    if (intake.documentWidth > profile.width || intake.bodyWidth > profile.width) {
      throw new Error(`${profile.name} intake has body overflow: ${JSON.stringify(intake)}`);
    }
    if (!intake.target || intake.target.width < 44 || intake.target.height < 44) {
      throw new Error(`${profile.name} generate button is not touch-safe: ${JSON.stringify(intake)}`);
    }

    if (projectId) {
      await navigate(page.send, `${baseUrl}/review/${projectId}`, ".shot-card");
      const deck = await inspect(page.send, ".shot-card");
      if (deck.documentWidth > profile.width || deck.bodyWidth > profile.width) {
        throw new Error(`${profile.name} deck has body overflow: ${JSON.stringify(deck)}`);
      }
      if (!deck.target || deck.target.right > profile.width || deck.target.left < 0) {
        throw new Error(`${profile.name} shot card exceeds viewport: ${JSON.stringify(deck)}`);
      }
      if (!deck.timelineScrollable || deck.visibleCards < 1) {
        throw new Error(`${profile.name} timeline is not usable: ${JSON.stringify(deck)}`);
      }
      if (profile.name === "iphone") {
        const capture = await page.send("Page.captureScreenshot", { format: "png" });
        await writeFile("/tmp/frameforge-mobile.png", Buffer.from(capture.data, "base64"));
      }
      console.log(`${profile.name}: intake ${intake.documentWidth}px, deck ${deck.documentWidth}px, card ${deck.target.width}px`);
    }
  }
  if (page.errors.length) throw new Error(`Runtime errors: ${page.errors.join("; ")}`);
  page.close();
  console.log("Responsive smoke check passed.");
} catch (error) {
  failed = true;
  console.error(error instanceof Error ? error.message : String(error));
} finally {
  browser.kill("SIGTERM");
  await wait(200);
  await rm(profileDirectory, { recursive: true, force: true });
}

process.exitCode = failed ? 1 : 0;
