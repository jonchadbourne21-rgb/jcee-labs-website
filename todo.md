# Project TODO

- [x] Pull and confirm GitHub main commit a7cf5abd8f1c83414a8aa3c311443fe88f4128c1.
- [x] Run dependency installation, TypeScript check, full test suite, and production build.
- [x] Verify desktop, tablet, iPhone/mobile, and reduced-motion behavior for the cube animation and VOW synthetic fault-injection demo.
- [x] Verify navigation, routes, responsive layout, console/runtime health, and unchanged hero animation.
- [x] Publish the verified release to jceelabs.com and report results.

- [x] Browser-QA the homepage and VOW durability demo with prefers-reduced-motion enabled, confirming cube motion suppression and demo motion fallback behavior.
- [x] Publish commit a7cf5abd8f1c83414a8aa3c311443fe88f4128c1 to jceelabs.com and capture the successful deployment/checkpoint result.
- [x] Report deployed SHA, install/check/test/build results, QA outcomes, defects, and files changed.

- [x] Verify PR #6 metadata and head SHA 13a1fcb0a9bbc2e95f528b678de3011d1afc0b79 on feature/curlicue-irrational-order.
- [x] Run dependency installation, TypeScript check, tests, and production build on the PR branch.
- [x] QA curlicue visuals, performance, responsive behavior, reduced motion, existing homepage systems, and browser health.
- [x] Apply only a minor warranted correction if an actual visual or performance defect is found.
- [x] Report PR readiness, results, screenshots, motion assessment, and exact changed files without publishing production.

- [x] Re-validate the curlicue performance correction with evidence that the reported issue improved, or revert it if the improvement is not substantiated.
- [x] Send the final PR #6 QA report with build/test results, desktop and mobile screenshots, motion/performance assessment, exact changed files, final branch SHA, and readiness status.

- [x] Merge PR #6 feature/curlicue-irrational-order into main and confirm the merged commit.
- [x] Fix the existing narrow-mobile horizontal overflow without changing the curlicue feature or unrelated content.
- [x] Re-run TypeScript, tests, production build, and mobile QA on merged main.
- [x] Publish the verified merged site to the existing JCEE Labs production domains.
- [x] Report merge SHA, overflow fix, validation results, and live production status.

- [x] Run live-site iPhone and Android browser device-profile smoke tests and document the emulation limitation.
- [x] Add a durable mobile-overflow assertion to the release test coverage.
- [x] Run TypeScript, full tests, production build, and recheck the device-profile smoke tests.
- [x] Publish the verified mobile-overflow regression coverage.
- [x] Report device-profile QA outcomes, coverage added, validation results, and live status.

- [x] Add a permanent headless browser layout test asserting scrollWidth equals innerWidth at iPhone and Android widths.
- [x] Add reusable iPhone and Android device-profile smoke commands to the project scripts.
- [x] Document the automated mobile layout and device-profile checks in the release workflow.
- [x] Run the complete release automation, tests, TypeScript check, and production build.
- [ ] Publish the verified permanent mobile release-process automation.
- [ ] Report the safeguards added and live publication status.
