# Publication route

Source authority: https://github.com/jonchadbourne21-rgb/jcee-labs-website
Development branch: protected `main`.
Primary host: existing Manus project serving https://jceelabs.com/.

## Observed baseline, November 5, 2026

- Current approved source: `19dfa53782582887f58dd638438ebb768d9245bf`.
- Source tree: `dbe355a413dbd39ce1039f3a9d0508914d0b5a9f`.
- Includes typography/binary-wave PR #71 and scenario-terminal PR #72.
- The primary site's receipt and sampled live design agree with this source.
- Full live all-file byte verification and the authenticated provider deployment
  record remain separate requirements; source identity alone is insufficient.

This baseline is an observation, not an evergreen approval to publish later
main commits. Refresh the approved SHA and read the current provider state
before each release.

## Release procedure

1. Retain the approved full commit and a clean canonical checkout.
2. Follow `docs/MANUS_BUILD_HANDOFF.md`: synchronize tracked source, generate
   the authentic release-source bundle, use `sh scripts/manus-build.sh`, and
   output `dist/public`. Preserve runtime configuration and secrets.
3. Run existing release checks and retain the final build receipt. Record
   non-secret build configuration separately because it can change output
   while Git source remains identical.
4. Obtain explicit publication approval and preserve the provider checkpoint
   and deployment ID. A saved checkpoint does not establish publication.
5. Read back the public receipt and apply the existing full-file verifier
   against that exact final build. Separately record managed HTML additions;
   do not weaken strict byte verification or broadly ignore HTML differences.
6. Check desktop/mobile rendering and the approved navigation and illustrations.

## Backups and history

GitHub Pages and Railway are secondary routes, not independent source authorities.
Keep their configured source commits and build pins coherent and preserve their
deployment receipts. A backup is not current until its own checks pass.

Pages currently reads its provider domain setting and deploys on main. A proposed
move to its native project URL needs separate approval and provider verification.
Railway's November 5 inspection found the October 30 source still deployed.
Updating Railway requires a coordinated source/pin change and a new deployment;
it does not authorize routing the primary domain to Railway.

Do not overwrite divergent historical repositories or create automatic two-way
sync. Preserve them and document an approved role before any future migration.
DNS, source bindings, synchronization settings, publication and branch changes
require their applicable explicit approval.
