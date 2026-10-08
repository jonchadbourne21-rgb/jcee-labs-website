// Copyright (c) 2026 Jonathan Chadbourne.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const repository =
  "https://github.com/jonchadbourne21-rgb/jcee-labs-website";
export const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const git = (directory, args) =>
  execFileSync("git", ["-C", directory, ...args], {
    encoding: "utf8",
    maxBuffer: 20_000_000,
  }).trimEnd();
// Runtime configuration and generated platform/dependency files are not source.
// Do not use .gitignore here: it could silently exempt an extra build input.
const excludedRoots = new Set([
  ".git",
  "node_modules",
  "dist",
  ".pnpm-store",
  ".manus-logs",
  ".webdev",
]);
export const sourceExclusions = [
  ...[...excludedRoots].map(name => `${name}/`),
  ".env",
  ".env.*",
  ".project-config.json",
  "client/public/__manus__/version.json",
];
function excluded(name) {
  return (
    excludedRoots.has(name.split("/")[0]) ||
    /^\.env(?:\..*)?$/.test(name) ||
    name === ".project-config.json" ||
    name === "client/public/__manus__/version.json"
  );
}
function filesIn(directory, prefix = "", ignore = () => false) {
  const files = [];
  for (const entry of fs.readdirSync(path.join(directory, prefix), {
    withFileTypes: true,
  })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (ignore(name)) continue;
    if (entry.isDirectory()) files.push(...filesIn(directory, name, ignore));
    else files.push(name);
  }
  return files.sort();
}
function fileBytes(file) {
  return fs.lstatSync(file).isSymbolicLink()
    ? Buffer.from(fs.readlinkSync(file))
    : fs.readFileSync(file);
}
export function inspectSource({
  root = process.cwd(),
  sourceRepo = process.env.BUILD_SOURCE_REPOSITORY || root,
  commit = process.env.BUILD_SOURCE_COMMIT || "HEAD",
} = {}) {
  const source = git(sourceRepo, [
    "rev-parse",
    "--verify",
    `${commit}^{commit}`,
  ]);
  const tree = git(sourceRepo, ["rev-parse", `${source}^{tree}`]);
  const entries = git(sourceRepo, ["ls-tree", "-rz", "--full-tree", source])
    .split("\0")
    .filter(Boolean);
  const files = [];
  const mismatches = [];
  for (const entry of entries) {
    const [metadata, name] = entry.split("\t");
    const [mode, type, blob] = metadata.split(" ");
    if (type !== "blob")
      throw new Error(`Unsupported source entry ${name}: ${type}`);
    const file = path.join(root, name);
    if (!fs.existsSync(file)) {
      mismatches.push(`missing: ${name}`);
      files.push({ path: name, sha256: null });
      continue;
    }
    const stat = fs.lstatSync(file);
    if (!stat.isFile() && !stat.isSymbolicLink())
      throw new Error(`Non-file source entry: ${name}`);
    const bytes = fileBytes(file);
    const actualBlob = createHash("sha1")
      .update(`blob ${bytes.length}\0`)
      .update(bytes)
      .digest("hex");
    const actualMode = stat.isSymbolicLink()
      ? "120000"
      : stat.mode & 0o111
        ? "100755"
        : "100644";
    if (actualBlob !== blob || actualMode !== mode)
      mismatches.push(`changed: ${name}`);
    files.push({
      path: name,
      bytes: bytes.length,
      sha256: sha256(bytes),
      mode: actualMode,
    });
  }
  const tracked = new Set(files.map(file => file.path));
  const extras = filesIn(root, "", excluded).filter(name => !tracked.has(name));
  mismatches.push(...extras.map(name => `extra: ${name}`));
  const fingerprint = sha256(
    JSON.stringify({
      files,
      extras: extras.map(name => [
        name,
        sha256(fileBytes(path.join(root, name))),
      ]),
    })
  );
  return { source, tree, files, fingerprint, mismatches };
}
export function requireParity(snapshot) {
  if (snapshot.mismatches.length)
    throw new Error(`Source parity failed:\n${snapshot.mismatches.join("\n")}`);
}
export const hostingMetadataPaths = new Set([".gitkeep", ".nojekyll"]);
export function outputManifest(publicRoot) {
  return filesIn(publicRoot)
    .filter(name => name !== "deployment.json")
    .map(name => {
      const file = path.join(publicRoot, name);
      if (fs.lstatSync(file).isSymbolicLink())
        throw new Error(`Public output must not contain symlinks: ${name}`);
      const bytes = fs.readFileSync(file);
      return { path: name, bytes: bytes.length, sha256: sha256(bytes) };
    });
}
export function writeReceipt(
  before,
  {
    root = process.cwd(),
    publicUrl = "https://jceelabs.com/",
    kind = "manus",
    sourceOptions = {},
    approvedCommit = process.env.BUILD_SOURCE_COMMIT,
  } = {}
) {
  const after = inspectSource({ root, ...sourceOptions });
  if (
    before.fingerprint !== after.fingerprint ||
    before.source !== after.source
  )
    throw new Error(
      "Source changed during the build; rebuild before publication"
    );
  if (approvedCommit) {
    if (
      !/^[a-f0-9]{40}$/.test(approvedCommit) ||
      after.source !== approvedCommit
    )
      throw new Error("Build source must match the full approved commit SHA");
    requireParity(after);
  }
  const publicRoot = path.join(root, "dist/public");
  const outputs = outputManifest(publicRoot);
  const metadataFiles = outputs.filter(file =>
    hostingMetadataPaths.has(file.path)
  );
  const files = outputs.filter(file => !hostingMetadataPaths.has(file.path));
  const receipt = {
    schemaVersion: 1,
    repository,
    source: after.source,
    tree: after.tree,
    sourceVerification: {
      status: after.mismatches.length
        ? "UNVERIFIED_WORKTREE"
        : approvedCommit
          ? "VERIFIED"
          : "UNPINNED_SOURCE",
      trackedFiles: after.files.length,
      manifestSha256: sha256(JSON.stringify(after.files)),
      exclusions: sourceExclusions,
      scope:
        "Git-tracked source bytes and modes checked before and after build. Runtime configuration, dependencies and hosting state are outside this source claim.",
    },
    sourceFiles: after.files,
    build: {
      kind,
      createdAt: new Date().toISOString(),
      node: process.version,
      workflowRun:
        process.env.GITHUB_ACTIONS === "true"
          ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
          : null,
    },
    publicUrl,
    publicRoutes: JSON.parse(
      fs.readFileSync(
        path.join(root, "client/src/content/publicRoutes.json"),
        "utf8"
      )
    ),
    hostingMetadataFiles: metadataFiles,
    hostingMetadataSha256: sha256(JSON.stringify(metadataFiles)),
    publicFiles: files,
    publicManifestSha256: sha256(JSON.stringify(files)),
  };
  if (kind === "manus")
    receipt.server = {
      path: "dist/index.js",
      sha256: sha256(fs.readFileSync(path.join(root, "dist/index.js"))),
    };
  fs.writeFileSync(
    path.join(publicRoot, "deployment.json"),
    JSON.stringify(receipt, null, 2) + "\n"
  );
  console.log(
    `Deployment receipt: ${receipt.sourceVerification.status}; ${receipt.source}; ${files.length} public files`
  );
  return receipt;
}
export function verifyReceipt(receipt, expectedCommit) {
  if (!/^[a-f0-9]{40}$/.test(expectedCommit || ""))
    throw new Error("Supply the full approved commit SHA");
  if (
    receipt.schemaVersion !== 1 ||
    receipt.repository !== repository ||
    receipt.source !== expectedCommit ||
    receipt.sourceVerification?.status !== "VERIFIED"
  )
    throw new Error(
      "Receipt does not establish parity with the approved source"
    );
  if (
    !Array.isArray(receipt.sourceFiles) ||
    receipt.sourceFiles.length !== receipt.sourceVerification.trackedFiles ||
    sha256(JSON.stringify(receipt.sourceFiles)) !==
      receipt.sourceVerification.manifestSha256
  )
    throw new Error("Invalid source manifest");
  if (
    !Array.isArray(receipt.publicFiles) ||
    !receipt.publicFiles.length ||
    sha256(JSON.stringify(receipt.publicFiles)) !== receipt.publicManifestSha256
  )
    throw new Error("Invalid public manifest");
  if (
    !Array.isArray(receipt.hostingMetadataFiles) ||
    receipt.hostingMetadataFiles.some(
      file => !hostingMetadataPaths.has(file.path)
    ) ||
    sha256(JSON.stringify(receipt.hostingMetadataFiles)) !==
      receipt.hostingMetadataSha256
  )
    throw new Error("Invalid hosting metadata manifest");
  const paths = new Set();
  for (const file of receipt.publicFiles) {
    if (
      !file.path ||
      file.path.startsWith("/") ||
      file.path.split("/").some(part => part === ".." || part === ".") ||
      /[?#\\]/.test(file.path) ||
      paths.has(file.path) ||
      !/^[a-f0-9]{64}$/.test(file.sha256)
    )
      throw new Error("Invalid public file entry");
    paths.add(file.path);
  }
}
