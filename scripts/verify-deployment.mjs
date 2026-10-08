// Copyright (c) 2026 Jonathan Chadbourne.
import fs from "node:fs";
import path from "node:path";
import {
  inspectSource,
  requireParity,
  sha256,
  verifyReceipt,
  outputManifest,
} from "./deployment-receipt.mjs";
const expected = process.env.BUILD_SOURCE_COMMIT || process.argv[2];
const base = process.argv[3];
const local = JSON.parse(
  fs.readFileSync("dist/public/deployment.json", "utf8")
);
verifyReceipt(local, expected);
const source = inspectSource({ commit: expected });
requireParity(source);
if (
  source.tree !== local.tree ||
  sha256(JSON.stringify(source.files)) !==
    local.sourceVerification.manifestSha256
)
  throw new Error("Local receipt differs from canonical source");
if (
  JSON.stringify(outputManifest("dist/public")) !==
  JSON.stringify(local.publicFiles)
)
  throw new Error("Local output differs from receipt (including extra files)");
for (const file of local.publicFiles) {
  const bytes = fs.readFileSync(path.join("dist/public", file.path));
  if (bytes.length !== file.bytes || sha256(bytes) !== file.sha256)
    throw new Error(`Local artifact changed: ${file.path}`);
}
if (
  local.server &&
  sha256(fs.readFileSync(local.server.path)) !== local.server.sha256
)
  throw new Error("Server artifact changed");
if (base) {
  const root = new URL(base.endsWith("/") ? base : `${base}/`);
  if (
    !["https:", "http:"].includes(root.protocol) ||
    root.username ||
    root.password ||
    root.search ||
    root.hash
  )
    throw new Error("Invalid deployment URL");
  const get = async name => {
    const url = new URL(
      name.split("/").map(encodeURIComponent).join("/"),
      root
    );
    url.searchParams.set("verify", `${expected}-${Date.now()}`);
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
      headers: { "User-Agent": "Mozilla/5.0 JCEE-release-verification" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${name}`);
    return Buffer.from(await response.arrayBuffer());
  };
  const live = JSON.parse((await get("deployment.json")).toString());
  verifyReceipt(live, expected);
  if (JSON.stringify(live) !== JSON.stringify(local))
    throw new Error(
      "Published receipt is not the locally verified build receipt"
    );
  // Check every public output, not only the visible homepage or a sample of assets.
  const pending = [...local.publicFiles];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (pending.length) {
        const file = pending.shift();
        const bytes = await get(file.path);
        if (bytes.length !== file.bytes || sha256(bytes) !== file.sha256)
          throw new Error(`Published bytes differ: ${file.path}`);
      }
    })
  );
  console.log(
    `Published receipt and all ${local.publicFiles.length} public files match ${expected}. Server runtime identity still requires the hosting deployment record.`
  );
} else
  console.log(
    `Local source and build verified: ${expected}; ${local.publicFiles.length} public files`
  );
