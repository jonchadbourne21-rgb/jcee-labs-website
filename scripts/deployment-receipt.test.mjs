// Copyright (c) 2026 Jonathan Chadbourne.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  inspectSource,
  requireParity,
  writeReceipt,
  verifyReceipt,
  sha256,
} from "./deployment-receipt.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "jcee-receipt-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync("git", ["-C", root, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  git("init");
  fs.mkdirSync(path.join(root, "client/src/content"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "client/src/content/publicRoutes.json"),
    '["/","/research"]'
  );
  fs.writeFileSync(path.join(root, "app.txt"), "approved bytes\n");
  fs.writeFileSync(path.join(root, ".gitignore"), "hidden-extra.txt\n");
  git("add", ".");
  git(
    "-c",
    "user.name=Receipt Test",
    "-c",
    "user.email=receipt@example.invalid",
    "commit",
    "-m",
    "fixture"
  );
  const commit = git("rev-parse", "HEAD");
  fs.mkdirSync(path.join(root, "dist/public/assets"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "dist/public/index.html"),
    "<h1>Website</h1>"
  );
  fs.writeFileSync(
    path.join(root, "dist/public/assets/app.js"),
    "// built asset\n"
  );
  fs.writeFileSync(path.join(root, "dist/index.js"), "// built server\n");
  fs.writeFileSync(path.join(root, "dist/public/.gitkeep"), "");
  return {
    root,
    commit,
    snapshot: () => inspectSource({ root, sourceRepo: root, commit: "HEAD" }),
  };
}
test("verified receipts bind source tree, full public output, and server output", t => {
  const f = fixture(t);
  const before = f.snapshot();
  requireParity(before);
  const receipt = writeReceipt(before, {
    root: f.root,
    approvedCommit: f.commit,
    sourceOptions: { sourceRepo: f.root, commit: "HEAD" },
  });
  verifyReceipt(receipt, f.commit);
  assert.equal(receipt.tree.length, 40);
  assert.equal(receipt.publicFiles.length, 2);
  assert.deepEqual(
    receipt.hostingMetadataFiles.map(file => file.path),
    [".gitkeep"]
  );
  assert.ok(receipt.server.sha256);
  assert.equal(receipt.sourceVerification.trackedFiles, 3);
  assert.equal(
    receipt.publicFiles.some(file => file.path === "deployment.json"),
    false
  );
});
test("missing and byte-mismatched files never count as parity", t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.root, "app.txt"), "approved bytes\r\n");
  assert.throws(() => requireParity(f.snapshot()), /changed: app.txt/);
  fs.unlinkSync(path.join(f.root, "app.txt"));
  assert.throws(() => requireParity(f.snapshot()), /missing: app.txt/);
});
test("gitignored extra source is rejected, platform metadata is explicitly excluded", t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.root, ".project-config.json"), "{}");
  fs.writeFileSync(path.join(f.root, ".env"), "EXAMPLE=not-public");
  requireParity(f.snapshot());
  fs.writeFileSync(path.join(f.root, "hidden-extra.txt"), "unexpected input");
  assert.throws(() => requireParity(f.snapshot()), /extra: hidden-extra.txt/);
});
test("an external canonical checkout detects drift in a Manus mirror", t => {
  const f = fixture(t);
  const mirror = fs.mkdtempSync(path.join(os.tmpdir(), "jcee-mirror-"));
  t.after(() => fs.rmSync(mirror, { recursive: true, force: true }));
  fs.cpSync(f.root, mirror, { recursive: true });
  const options = { root: mirror, sourceRepo: f.root, commit: f.commit };
  requireParity(inspectSource(options));
  fs.writeFileSync(path.join(mirror, "app.txt"), "old Manus copy");
  assert.throws(
    () => requireParity(inspectSource(options)),
    /changed: app.txt/
  );
});
test("a source mutation during build aborts receipt generation", t => {
  const f = fixture(t);
  const before = f.snapshot();
  fs.writeFileSync(path.join(f.root, "app.txt"), "changed while building");
  assert.throws(
    () =>
      writeReceipt(before, {
        root: f.root,
        sourceOptions: { sourceRepo: f.root, commit: "HEAD" },
      }),
    /Source changed during/
  );
});
test("wrong commits, dirty source, modified manifests and unsafe paths fail verification", t => {
  const f = fixture(t);
  const receipt = writeReceipt(f.snapshot(), {
    root: f.root,
    approvedCommit: f.commit,
    sourceOptions: { sourceRepo: f.root, commit: "HEAD" },
  });
  assert.throws(
    () => verifyReceipt(receipt, "a".repeat(40)),
    /approved source/
  );
  const dirty = structuredClone(receipt);
  dirty.sourceVerification.status = "UNVERIFIED_WORKTREE";
  assert.throws(() => verifyReceipt(dirty, f.commit), /approved source/);
  const tampered = structuredClone(receipt);
  tampered.publicFiles[0].sha256 = "b".repeat(64);
  assert.throws(
    () => verifyReceipt(tampered, f.commit),
    /Invalid public manifest/
  );
  tampered.publicFiles[0].path = "../private";
  tampered.publicManifestSha256 = sha256(JSON.stringify(tampered.publicFiles));
  assert.throws(
    () => verifyReceipt(tampered, f.commit),
    /Invalid public file entry/
  );
});

test("a clean but unpinned checkout cannot claim an approved release", t => {
  const f = fixture(t);
  const receipt = writeReceipt(f.snapshot(), {
    root: f.root,
    approvedCommit: null,
    sourceOptions: { sourceRepo: f.root, commit: "HEAD" },
  });
  assert.equal(receipt.sourceVerification.status, "UNPINNED_SOURCE");
  assert.throws(() => verifyReceipt(receipt, f.commit), /approved source/);
});
