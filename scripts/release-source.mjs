// Copyright (c) 2026 Jonathan Chadbourne.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspectSource, requireParity, repository, sha256 } from "./deployment-receipt.mjs";

const bundleName = "release-source.bundle";
const metadataName = "release-source.json";
const git = (cwd, ...args) => execFileSync("git", ["-C", cwd, ...args], {
  encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 20_000_000,
}).trim();
const fullSha = value => /^[a-f0-9]{40}$/.test(value || "");

// Prepare before checkpointing: preserve authentic Git objects, not fabricated
// metadata. These two generated root files must travel in the source package.
export function prepareReleaseSource({ root = process.cwd(), sourceRepo = root, commit } = {}) {
  if (!fullSha(commit)) throw new Error("Supply the full approved commit SHA");
  if (git(sourceRepo, "rev-parse", "HEAD^{commit}") !== commit)
    throw new Error("Canonical checkout HEAD must equal the approved commit");
  const before = inspectSource({ root, sourceRepo, commit });
  requireParity(before);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "jcee-source-pack-"));
  try {
    const bundle = path.join(temporary, bundleName);
    git(sourceRepo, "bundle", "create", bundle, "HEAD");
    git(sourceRepo, "bundle", "verify", bundle);
    const shallowPath = path.resolve(sourceRepo, git(sourceRepo, "rev-parse", "--git-path", "shallow"));
    const metadata = {
      schemaVersion: 1, repository, source: before.source, tree: before.tree,
      bundleSha256: sha256(fs.readFileSync(bundle)),
      // Preserve an existing shallow boundary verbatim; do not invent history.
      shallowCommits: fs.existsSync(shallowPath)
        ? fs.readFileSync(shallowPath, "utf8").trim().split("\n") : [],
    };
    const after = inspectSource({ root, sourceRepo, commit });
    requireParity(after);
    if (after.fingerprint !== before.fingerprint)
      throw new Error("Source changed while preparing the release bundle");
    fs.copyFileSync(bundle, path.join(root, bundleName));
    fs.writeFileSync(path.join(root, metadataName), JSON.stringify(metadata, null, 2) + "\n");
    return metadata;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

// Cloud Run stages sources without .git. Restore only a temporary canonical
// checkout from the packaged bundle, then compare every application file with it.
// Never fetch a moving branch, skip parity, or reuse a previous build receipt.
export function withReleaseSource({ root = process.cwd(), sourceRepo, commit } = {}, run) {
  if (sourceRepo || fs.existsSync(path.join(root, ".git")))
    return run({ root, sourceRepo: sourceRepo || root, commit: commit || "HEAD" }, commit);
  const metadata = JSON.parse(fs.readFileSync(path.join(root, metadataName), "utf8"));
  if (metadata.schemaVersion !== 1 || metadata.repository !== repository ||
      !fullSha(metadata.source) || !fullSha(metadata.tree) ||
      !/^[a-f0-9]{64}$/.test(metadata.bundleSha256 || "") ||
      !Array.isArray(metadata.shallowCommits) || !metadata.shallowCommits.every(fullSha))
    throw new Error("Invalid packaged source identity");
  if (commit && commit !== metadata.source)
    throw new Error("Packaged source does not match the approved commit");
  const bundle = path.join(root, bundleName);
  if (sha256(fs.readFileSync(bundle)) !== metadata.bundleSha256)
    throw new Error("Packaged source bundle hash mismatch");
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "jcee-canonical-"));
  try {
    const canonical = path.join(temporary, "source");
    git(temporary, "clone", "--no-checkout", bundle, canonical);
    if (metadata.shallowCommits.length)
      fs.writeFileSync(path.join(canonical, ".git/shallow"), metadata.shallowCommits.join("\n") + "\n");
    if (git(canonical, "rev-parse", "HEAD^{commit}") !== metadata.source ||
        git(canonical, "rev-parse", `${metadata.source}^{tree}`) !== metadata.tree)
      throw new Error("Packaged Git objects do not match the declared source identity");
    git(canonical, "fsck", "--no-reflogs");
    const options = { root, sourceRepo: canonical, commit: metadata.source };
    requireParity(inspectSource(options));
    return run(options, metadata.source);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const metadata = prepareReleaseSource({
    sourceRepo: process.env.BUILD_SOURCE_REPOSITORY || process.cwd(),
    commit: process.argv[2] || process.env.BUILD_SOURCE_COMMIT,
  });
  console.log(`Packaged authentic source: ${metadata.source}; tree ${metadata.tree}`);
}
