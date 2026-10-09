// Copyright (c) 2026 Jonathan Chadbourne.
import { spawnSync } from "node:child_process";
import {
  inspectSource,
  requireParity,
  writeReceipt,
} from "./deployment-receipt.mjs";
import { withReleaseSource } from "./release-source.mjs";
withReleaseSource({
  sourceRepo: process.env.BUILD_SOURCE_REPOSITORY,
  commit: process.env.BUILD_SOURCE_COMMIT,
}, (sourceOptions, approvedCommit) => {
  const before = inspectSource(sourceOptions);
  if (approvedCommit) requireParity(before);
  const build = spawnSync("pnpm", ["run", "build:app"], { stdio: "inherit" });
  if (build.error) throw build.error;
  if (build.status !== 0) throw new Error(`Application build failed: ${build.status}`);
  writeReceipt(before, { sourceOptions, approvedCommit });
});
