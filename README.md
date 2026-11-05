# JCEE WorldLab Website

This repository is the authoritative application source for the JCEE WorldLab
public website. Preserve reviewed commits and publish an explicitly approved
full commit SHA through the existing Manus project.

The primary publication route is this repository → Manus → jceelabs.com.
See [Publication route](docs/PUBLICATION_ROUTE.md) for observed source identity,
backup roles, verification boundaries and changes that require approval.

Install with the pinned pnpm version and `pnpm install --frozen-lockfile`.
Run `pnpm release:check` and the existing source/output verification gates.
Use [the Manus build handoff](docs/MANUS_BUILD_HANDOFF.md) for the pinned runtime,
authentic release-source bundle and `dist/public` output.

GitHub Pages is a static backup. Its workflow currently deploys on pushes to
main and reads Settings > Pages; a successful run does not establish which host
serves the primary domain. Pages does not run the application server, database
or administrative APIs. Its existing apex-domain configuration needs separate
review before this intended backup role is fully reflected in provider settings.

Merging even a documentation-only change triggers the current Pages workflow.
Review Manus synchronization behavior before merging. A source merge is not a
publication receipt. Preserve the existing release gates in
[the release checklist](RELEASE_CHECKLIST.md).
