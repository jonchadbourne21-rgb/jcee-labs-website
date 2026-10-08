# JCEE Labs Release Checklist

This checklist is a required release gate for changes that can affect the public site. It keeps automated layout safeguards in the same workflow as TypeScript, unit tests, and the production build.

## Required automated gate

Run the following command from the repository root before publishing:

```bash
pnpm release:check
```

The command performs the TypeScript check, complete Vitest suite, production build, headless device-profile smoke checks, and the public-surface integrity gate. The browser checks start an isolated production server and enforce all of the following at both target widths:

| Profile | Viewport | Required checks |
|---|---:|---|
| iPhone Safari profile | 390 × 844 | `scrollWidth === innerWidth`, no body overflow, a 40px-or-larger menu control, in-bounds curlicue stage, touch emulation, no runtime errors |
| Android Chrome profile | 412 × 915 | `scrollWidth === innerWidth`, no body overflow, a 40px-or-larger menu control, in-bounds curlicue stage, touch emulation, no runtime errors |

Use a profile-specific command while developing a targeted fix:

```bash
pnpm smoke:mobile:iphone
pnpm smoke:mobile:android
```

> The smoke checks are deterministic browser device-profile emulations. They are a release gate, but they do not replace a final physical-device check on iPhone Safari and Android Chrome for major visual or interaction changes.

## Public-surface integrity gate

`pnpm test:public-surface` is included in `pnpm release:check` and runs in the **public-surface** GitHub Actions job on every pull request to `main`. The job must be required in the repository’s main-branch protection rule so a failing result blocks merge.

The gate starts the production build and verifies that all retired public routes render the canonical **404 / UNKNOWN STATE** surface. It also verifies the shared footer’s Privacy and Terms links, the Charter page’s `.md` download link, and the production Markdown asset response at `/JCEE_Labs_Charter_v1.0.md`.

## Physical-device confirmation

For a release that changes navigation, mobile layout, animations, gestures, typography, or browser APIs, confirm these flows on a real iPhone and Android device before public announcement:

1. Open the homepage and scroll through the JCEE Labs, VOW, Research, curlicue, QCS, Charter, and Mirrored sections.
2. Open and close the mobile navigation; verify all navigation links and the theme control remain accessible.
3. Confirm the VOW synthetic failure interaction, recovery state, and replay control.
4. Confirm there is no sideways page scroll or clipped content.
5. Confirm reduced-motion behavior when the device accessibility preference is enabled.

## Environment requirement

The headless checks use Chromium. In environments where `chromium` is not on the command path, set `CHROMIUM_BIN` to the Chromium or Chrome executable before running the commands.

## Source identity and the Manus release receipt

Copyright (c) 2026 Jonathan Chadbourne.

The normal Manus production build and the Pages fallback both write
`dist/public/deployment.json`. This records the Git commit and tree, SHA-256
hashes of every tracked source file and every public build file, and the
server bundle hash for Manus. Source bytes and executable/symlink modes are
checked before and after building. The receipt excludes itself from output
hashing; the reviewed workflow artifact or retained build receipt is its
independent comparison point. This is a build record, not a cryptographic
hosting-provider attestation.

Development builds with source changes are marked `UNVERIFIED_WORKTREE`;
clean builds without an explicit approved SHA are marked `UNPINNED_SOURCE`.
Neither may be published. For a release, pin the complete approved commit:

```bash
export BUILD_SOURCE_COMMIT=FULL_APPROVED_COMMIT_SHA
pnpm install --frozen-lockfile
pnpm release:check
pnpm release:verify "$BUILD_SOURCE_COMMIT"
```

For the existing Manus project, point source verification at its separate
canonical GitHub checkout before those commands:

```bash
export BUILD_SOURCE_REPOSITORY=/home/ubuntu/jcee-labs-github
```

Fetch the approved commit into that checkout. Synchronize the existing Manus
project's tracked files from that exact commit, preserving runtime configuration
and approved page content. The explicit commit must exist in the canonical
checkout; a matching branch name or a copied SHA string alone is insufficient.
The checker rejects missing files, changed bytes/modes, and unexpected source
files, including extras hidden by `.gitignore`. Its narrow exclusions are listed
in the receipt: Git metadata, dependencies/build output, Manus logs/checkpoints,
runtime `.env` files, project configuration, and generated Manus version metadata.
Those excluded inputs are outside the Git-source identity claim.

Retain the exact validated build receipt and Manus checkpoint/deployment ID.
After approval of this new release commit, publish that checkpoint through the
existing Manus project. Do not change DNS, hosting settings, or production secrets.
Then verify from the same retained build directory:

```bash
pnpm release:verify "$BUILD_SOURCE_COMMIT" https://jceelabs.com/
```

This compares the public receipt and **every listed public output file** over
HTTP against the retained build. Any mismatch or unavailable file keeps the
release unverified. If the platform rebuilds during publication, retain and
verify the receipt from that final build rather than attaching an earlier one.
Public HTTP checks cannot prove private server runtime identity; preserve the
hosting deployment record linking the checkpoint to the recorded server hash.

`pnpm test:fragments`, included in `release:check`, exercises the three October
section links in desktop, iPhone, and Android Chromium profiles, with normal and
reduced motion. It covers cold homepage clicks, direct/reloaded deep links,
same-page router and native hash changes, and Back/Forward. The former source-text
assertion is replaced by these behavior checks. Real iPhone Safari and Android
confirmation remains required before public announcement, as described above.
