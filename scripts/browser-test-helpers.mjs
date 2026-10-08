// Copyright (c) 2026 Jonathan Chadbourne.
import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import net from "node:net";
const sleep = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

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
  const child = spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
  const output = [];
  child.stdout.on("data", chunk => output.push(chunk.toString()));
  child.stderr.on("data", chunk => output.push(chunk.toString()));
  return { child, output };
}

function stop(child) {
  if (!child.pid || child.exitCode !== null || child.signalCode)
    return Promise.resolve();
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
      if (
        response.url.startsWith("http://127.0.0.1:") &&
        ((response.status >= 400 && type !== "Document") ||
          response.url.includes("/api/"))
      ) {
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
        message.error
          ? reject(new Error(message.error.message))
          : resolve(message.result)
      );
    });
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  return { send, runtimeErrors, networkFailures, close: () => socket.close() };
}

async function waitForApp(send, expectedUrl) {
  const normalizePath = value =>
    value.replace(/\/+$/, "").replace(/\/research-evidence$/, "/registry") ||
    "/";
  const expectedPath = normalizePath(new URL(expectedUrl).pathname);
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const response = await send("Runtime.evaluate", {
      returnByValue: true,
      expression:
        "({ path: location.pathname, clientReady: document.querySelector('#root')?.getAttribute('data-client-ready') === 'true', ready: document.readyState, textLength: document.querySelector('#root')?.textContent?.trim().length ?? 0 })",
    });
    if (
      normalizePath(response.result.value.path) === expectedPath &&
      response.result.value.clientReady &&
      response.result.value.ready === "complete" &&
      response.result.value.textLength > 100
    )
      return;
    await sleep(75);
  }
  throw new Error(`Application root did not finish rendering: ${expectedUrl}`);
}

async function navigate(send, baseUrl, route) {
  await send("Page.navigate", { url: `${baseUrl}${route}` });
  await waitForApp(send, `${baseUrl}${route}`);
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

export {
  sleep,
  findOpenPort,
  start,
  stop,
  removeProfileDirectory,
  waitForUrl,
  connect,
  navigate,
  evaluate,
};
