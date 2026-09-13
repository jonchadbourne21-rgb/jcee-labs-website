import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const chromium = process.env.CHROMIUM_BIN || "chromium";
const outputDir = path.resolve("artifacts/enterprise-visual-review");

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function openPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") return reject(new Error("No local port"));
      server.close(error => (error ? reject(error) : resolve(address.port)));
    });
  });
}

async function waitForUrl(url, label, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await wait(150);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode) return Promise.resolve();
  return new Promise(resolve => {
    const timer = setTimeout(() => child.kill("SIGKILL"), 2000);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
    child.kill("SIGTERM");
  });
}

async function connect(debugPort) {
  await waitForUrl(`http://127.0.0.1:${debugPort}/json/list`, "Chromium CDP");
  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  const target = targets.find(item => item.type === "page") ?? targets[0];
  if (!target?.webSocketDebuggerUrl) throw new Error("No CDP page target");

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    const callback = pending.get(message.id);
    if (callback) {
      pending.delete(message.id);
      callback(message);
    }
  });

  function send(method, params = {}) {
    const requestId = ++id;
    socket.send(JSON.stringify({ id: requestId, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(requestId, response =>
        response.error ? reject(new Error(response.error.message)) : resolve(response.result)
      );
    });
  }

  await send("Page.enable");
  await send("Runtime.enable");
  return { send, close: () => socket.close() };
}

async function waitForApp(send) {
  for (let i = 0; i < 60; i += 1) {
    const result = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: "({ready: document.readyState, text: document.querySelector('#root')?.textContent?.trim().length || 0})",
    });
    if (result.result.value.ready === "complete" && result.result.value.text > 200) return;
    await wait(100);
  }
  throw new Error("Application did not finish rendering");
}

async function waitForImage(send, url) {
  const urlLiteral = JSON.stringify(url);
  const result = await send("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const image = new Image();
      const timer = setTimeout(() => reject(new Error('Timed out loading visual asset')), 10000);
      image.onload = () => { clearTimeout(timer); resolve({width:image.naturalWidth,height:image.naturalHeight}); };
      image.onerror = () => { clearTimeout(timer); reject(new Error('Failed to load visual asset')); };
      image.src = ${urlLiteral};
    })`,
  });
  const dimensions = result.result.value;
  if (!dimensions?.width || !dimensions?.height) throw new Error(`Visual asset did not decode: ${url}`);
  return dimensions;
}

async function capture(send, baseUrl, spec) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: spec.width,
    height: spec.height,
    deviceScaleFactor: spec.mobile ? 3 : 1,
    mobile: Boolean(spec.mobile),
  });
  await send("Emulation.setTouchEmulationEnabled", {
    enabled: Boolean(spec.mobile),
    maxTouchPoints: spec.mobile ? 5 : 1,
  });

  await send("Page.navigate", { url: `${baseUrl}${spec.route}?visual-review=${Date.now()}` });
  await waitForApp(send);
  const assetDimensions = await waitForImage(send, spec.assetUrl);

  const selectorLiteral = JSON.stringify(spec.selector);
  await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector(${selectorLiteral});
      if (!el) throw new Error('Missing selector: ' + ${selectorLiteral});
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo(0, Math.max(0, top));
      return {scrollY: window.scrollY, targetTop: top};
    })()`,
  });
  await wait(250);

  const state = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector(${selectorLiteral});
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const pseudo = getComputedStyle(el, '::before');
      return {
        viewport: [innerWidth, innerHeight],
        scrollY: window.scrollY,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        rect: {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
        backgroundImage: style.backgroundImage,
        pseudoBackgroundImage: pseudo.backgroundImage,
        pseudoBackgroundSize: pseudo.backgroundSize,
        pseudoBackgroundPosition: pseudo.backgroundPosition,
      };
    })()`,
  });

  const value = state.result.value;
  if (value.scrollWidth > value.clientWidth + 1 || value.bodyScrollWidth > value.clientWidth + 1) {
    throw new Error(`${spec.name}: horizontal overflow ${value.scrollWidth}/${value.bodyScrollWidth}/${value.clientWidth}`);
  }
  if (value.rect.width < Math.min(spec.width - 40, 300) || value.rect.height < 300) {
    throw new Error(`${spec.name}: target geometry is unexpectedly small ${JSON.stringify(value.rect)}`);
  }
  if (value.rect.y > 110 || value.rect.y + value.rect.height < 200) {
    throw new Error(`${spec.name}: target did not scroll into the review viewport ${JSON.stringify(value.rect)}`);
  }

  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(path.join(outputDir, spec.file), Buffer.from(screenshot.data, "base64"));
  return { name: spec.name, assetDimensions, ...value };
}

await mkdir(outputDir, { recursive: true });
const serverPort = await openPort();
const debugPort = await openPort();
const profileDir = path.join(os.tmpdir(), `jcee-enterprise-visual-${process.pid}`);

const server = spawn(process.execPath, ["dist/index.js"], {
  env: { ...process.env, NODE_ENV: "production", PORT: String(serverPort) },
  stdio: ["ignore", "pipe", "pipe"],
});
const browser = spawn(chromium, [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`,
  "about:blank",
], { stdio: ["ignore", "pipe", "pipe"] });

const operatingAsset = "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ef0blYk8J0Q4PEe6OMhNJQ9UTw/8eb43ee0-7cad-47f8-8667-2f7c6df92076.webp";
const assuranceAsset = "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ef0blYk8J0Q4PEe6OMhNJQ9UTw/ecc115d0-76eb-4a5c-bf41-bddd5e579065.webp";

try {
  const baseUrl = `http://127.0.0.1:${serverPort}`;
  await waitForUrl(baseUrl, "production server");
  const { send, close } = await connect(debugPort);
  const specs = [
    { name: "Operating Cloud desktop", route: "/", selector: "#operating-cloud", width: 1440, height: 900, file: "operating-cloud-desktop.png", assetUrl: operatingAsset },
    { name: "Assurance desktop", route: "/assurance", selector: ".assurance-program", width: 1440, height: 900, file: "assurance-desktop.png", assetUrl: assuranceAsset },
    { name: "Operating Cloud iPhone", route: "/", selector: "#operating-cloud", width: 390, height: 844, mobile: true, file: "operating-cloud-iphone.png", assetUrl: operatingAsset },
    { name: "Assurance iPhone", route: "/assurance", selector: ".assurance-program", width: 390, height: 844, mobile: true, file: "assurance-iphone.png", assetUrl: assuranceAsset },
  ];
  const results = [];
  for (const spec of specs) results.push(await capture(send, baseUrl, spec));
  close();

  const operating = results.filter(item => item.name.startsWith("Operating Cloud"));
  if (operating.some(item => !item.pseudoBackgroundImage.includes("8eb43ee0-7cad-47f8-8667-2f7c6df92076"))) {
    throw new Error("Operating Cloud optimized panorama is not active in captured render");
  }
  const assurance = results.filter(item => item.name.startsWith("Assurance"));
  if (assurance.some(item => !item.backgroundImage.includes("ecc115d0-76eb-4a5c-bf41-bddd5e579065"))) {
    throw new Error("Assurance optimized hero is not active in captured render");
  }

  await writeFile(path.join(outputDir, "layout-manifest.json"), JSON.stringify(results, null, 2));
  console.log(`Enterprise visual capture passed: ${results.map(item => item.name).join(", ")}`);
} finally {
  await stop(browser);
  await stop(server);
  await rm(profileDir, { recursive: true, force: true });
}
