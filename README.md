# JCEE Labs Website

React/Vite website for JCEE Labs, with a separately built application server.

Install with the pinned pnpm version and `pnpm install --frozen-lockfile`.
Run `pnpm release:check` before publishing.

GitHub Pages publishes the public static site from `main` using
`.github/workflows/pages-fallback.yml`. It reads the custom-domain setting,
validates root and project layouts, and builds with `scripts/build-pages.mjs`.
Pages does not run the application's server, database, or administrative APIs.

See [the domain recovery record](docs/pages-domain-recovery.md) for the verified
deployment and remaining DNS cutover, and [the release checklist](RELEASE_CHECKLIST.md)
for required checks. A merge or successful Pages deployment alone does not
prove that `jceelabs.com` serves the new source.
