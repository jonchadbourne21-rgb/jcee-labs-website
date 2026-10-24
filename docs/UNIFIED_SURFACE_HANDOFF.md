# Unified public website design

This implements the approved evidence-thread review in the official
`jonchadbourne21-rgb/jcee-labs-website` source. Manus remains the production
publication step for jceelabs.com.

## Experience

- One warm-white surface, black dimensional headings, JCEE blue/navy accents,
  open content rows, and a shared header/footer across public pages.
- The homepage explains the problem, services, intended customers, a fictional
  four-outcome workflow, dated evidence, and the first consultation.
- Six approved generated chapter illustrations are encoded as WebP assets
  (about 550 KiB combined), blended into the paper surface.
- Research is a six-topic directory. Publications, programs, measurement,
  physical experiments, and evidence standards have dedicated routes; the
  existing research-fields page remains available. Old research fragments
  redirect to the corresponding topic and section.
- Research details, publication data, claim boundaries, downloads, and the
  existing consultation/partner email-draft behavior are retained.

## Implementation and verification

Homepage styles are scoped with `et-` classes to avoid the retained legacy
hero selectors. Shared public styles are in `unified-surface.css`; admin
surfaces are excluded. The illustrative workflow uses React state and performs
no backend operation. New research routes are included in prerendering,
metadata, sitemap generation, mobile checks, and public-surface checks.

The existing release gate covers TypeScript, application tests, source/build
receipt tests, production build, device-width layouts, public surfaces, and
fragment navigation. The public-surface gate additionally exercises all four
homepage outcomes and reset/focus behavior. Browser review checks the approved
layout, three narrow widths, the mobile menu, and the four scenarios. Representative company, technology, research,
program, legal, and inquiry pages were also reviewed for surface/contrast
consistency. See [the implemented homepage](design-review/homepage.jpg).

## Manus publication

Use the final merged commit, not the review repository or an earlier draft SHA.
Follow `RELEASE_CHECKLIST.md`: preserve the existing Manus runtime configuration,
sync the exact canonical source, run `pnpm install --frozen-lockfile`, then run
`pnpm release:check` with `BUILD_SOURCE_REPOSITORY` and `BUILD_SOURCE_COMMIT`
pinned to that checkout and full merged SHA. Run `pnpm release:verify` for the
same SHA before publishing. Do not make DNS or credential changes.

The repository's pre-existing GitHub Pages workflow can run after merge.
Actual iPhone Safari and Android device checks remain a publication checklist
item; Chromium viewport tests do not establish physical-device coverage.
