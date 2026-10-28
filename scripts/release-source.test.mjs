// Copyright (c) 2026 Jonathan Chadbourne.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { inspectSource, writeReceipt, verifyReceipt } from "./deployment-receipt.mjs";
import { prepareReleaseSource, withReleaseSource } from "./release-source.mjs";

function fixture(t) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "jcee-pack-test-"));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const root = path.join(temporary, "source");
  fs.mkdirSync(root);
  const git = (...args) => execFileSync("git", ["-C", root, ...args], {
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  git("init");
  fs.mkdirSync(path.join(root, "client/src/content"), { recursive: true });
  fs.writeFileSync(path.join(root, "client/src/content/publicRoutes.json"), '["/"]');
  fs.writeFileSync(path.join(root, "app.txt"), "approved source\n");
  git("add", ".");
  git("-c", "user.name=Receipt Test", "-c", "user.email=receipt@example.invalid", "commit", "-m", "fixture");
  const commit = git("rev-parse", "HEAD");
  const metadata = prepareReleaseSource({ root, commit });
  const staged = path.join(temporary, "staged");
  fs.cpSync(root, staged, { recursive: true, filter: p => path.basename(p) !== ".git" });
  return { root, staged, commit, metadata };
}

test("a source package with no .git builds a fresh verified receipt offline", t => {
  const f = fixture(t);
  assert.equal(fs.existsSync(path.join(f.staged, ".git")), false);
  let restored;
  const receipt = withReleaseSource({ root: f.staged }, (sourceOptions, approvedCommit) => {
    restored = sourceOptions.sourceRepo;
    const before = inspectSource(sourceOptions);
    fs.mkdirSync(path.join(f.staged, "dist/public"), { recursive: true });
    fs.writeFileSync(path.join(f.staged, "dist/public/index.html"), "fresh output");
    fs.writeFileSync(path.join(f.staged, "dist/index.js"), "fresh server");
    return writeReceipt(before, { root: f.staged, sourceOptions, approvedCommit });
  });
  verifyReceipt(receipt, f.commit);
  assert.equal(receipt.tree, f.metadata.tree);
  assert.equal(fs.existsSync(restored), false);
  assert.equal(receipt.sourceFiles.some(file => file.path.startsWith("release-source.")), false);
});

test("missing packaging, corrupt bundle, and wrong expected commit fail closed", t => {
  const f = fixture(t);
  const run = () => assert.fail("must not build");
  assert.throws(() => withReleaseSource({ root: f.staged, commit: "a".repeat(40) }, run), /approved commit/);
  fs.appendFileSync(path.join(f.staged, "release-source.bundle"), "corrupt");
  assert.throws(() => withReleaseSource({ root: f.staged }, run), /bundle hash mismatch/);
  fs.unlinkSync(path.join(f.staged, "release-source.json"));
  assert.throws(() => withReleaseSource({ root: f.staged }, run), /ENOENT/);
});

test("a relabeled bundle cannot claim a different commit or tree", t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.staged, "release-source.json"), JSON.stringify({ ...f.metadata, tree: "a".repeat(40) }));
  assert.throws(() => withReleaseSource({ root: f.staged }, () => assert.fail()), /Git objects/);
});

test("source drift and unexpected build inputs are rejected before building", t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.staged, "app.txt"), "changed");
  assert.throws(() => withReleaseSource({ root: f.staged }, () => assert.fail()), /changed: app.txt/);
  fs.copyFileSync(path.join(f.root, "app.txt"), path.join(f.staged, "app.txt"));
  fs.writeFileSync(path.join(f.staged, "extra.js"), "unexpected");
  assert.throws(() => withReleaseSource({ root: f.staged }, () => assert.fail()), /extra: extra.js/);
});

test("preparation rejects dirty application source", t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.root, "app.txt"), "dirty");
  assert.throws(() => prepareReleaseSource({ root: f.root, commit: f.commit }), /changed: app.txt/);
});

test("a shallow canonical checkout retains its real boundary when packaged", t => {
  const f = fixture(t);
  const shallow = path.join(path.dirname(f.root), "shallow");
  execFileSync("git", ["clone", "--depth=1", `file://${f.root}`, shallow], { stdio: "pipe" });
  const metadata = prepareReleaseSource({ root: shallow, commit: f.commit });
  assert.deepEqual(metadata.shallowCommits, [f.commit]);
  fs.rmSync(path.join(shallow, ".git"), { recursive: true, force: true });
  withReleaseSource({ root: shallow }, options => {
    assert.equal(inspectSource(options).source, f.commit);
  });
});
