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
  return { send, runtimeErrors, close: () => socket.close() };
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
const distEntry = path.join(projectRoot, "dist", "index.js");
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
  const baseUrl = `http://127.0.0.1:${appPort}`;
  await waitForUrl(baseUrl, "production server");
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
  ];
  if (!footer.present) failures.push("shared footer is missing from homepage");
  for (const [href, text] of requiredFooterLinks) {
    if (!footer.links.some(link => link.href === href && link.text === text)) {
      failures.push(`footer is missing ${text} link (${href})`);
    }
  }

  for (const route of retiredRoutes) {
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
  ]) {
    await navigate(page.send, baseUrl, route);
    if (!(await readBody(page.send)).includes(expectedHeading)) {
      failures.push(`${route} does not render expected text: ${expectedHeading}`);
    }
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
    "Boolean(document.querySelector('a[download][href=\"/JCEE_Labs_Public_Registry_v1.0.md\"]'))"
  );
  if (!registryDownloadLink) {
    failures.push("Public Registry page is missing its Markdown download link");
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
    "Boolean(document.querySelector('a[download][href=\"/JCEE_Labs_Charter_v1.1.md\"]'))"
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
    "Boolean(document.querySelector('a[download][href=\"/JCEE_Labs_Charter_v1.0.md\"]'))"
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
