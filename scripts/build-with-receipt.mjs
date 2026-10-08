// Copyright (c) 2026 Jonathan Chadbourne.
import { spawnSync } from "node:child_process";
import {
  inspectSource,
  requireParity,
  writeReceipt,
} from "./deployment-receipt.mjs";
const before = inspectSource();
if (process.env.BUILD_SOURCE_COMMIT) requireParity(before);
const build = spawnSync("pnpm", ["run", "build:app"], { stdio: "inherit" });
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status || 1);
writeReceipt(before);
