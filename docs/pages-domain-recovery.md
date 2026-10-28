# Custom-domain recovery

The September 1 deployment at commit `3f507282b176928e505882ce13922c802155c589`
used GitHub Pages for `jceelabs.com`:
[successful deployment](https://github.com/jonchadbourne21-rgb/jcee-labs-website/actions/runs/33551264416).
A successful deployment alone does not prove the domain's DNS state at that time.

The current public site can use this hosting path with ordinary A records.
GitHub Pages does not run the application's server, authentication, database, or
administrative APIs. The current enterprise/research inquiry paths compose
email drafts and do not depend on those APIs.

## Prepared behavior

The Pages workflow reads the URL from Settings → Pages, builds for that location,
and validates both the project URL and root-domain layout. Pull requests only
validate and retain artifacts; they do not deploy. Public routes have static
entry files for direct visits. Unknown routes use the JCEE 404 document.
Public Markdown downloads and legacy homepage images are served within the
artifact. The approved remote cinematic image URLs are preserved.

`deployment.json` identifies the deployed source commit and public URL.

## September 30 publication audit

PR #30 merged as `ff2dc3c68927c9cb0576424fb3e4401a9cc74822`.
Its Public Surface and Pages workflows succeeded. Pages uses the Actions
publishing source and the configured custom domain `jceelabs.com`; the deploy
job reported `http://jceelabs.com/`, while the artifact correctly records
`https://jceelabs.com/`. The artifact has no `CNAME` file. The root and project
layouts are both validated before the configured-domain build is deployed.

An origin request to GitHub Pages with the HTTP host `jceelabs.com` returned
that exact commit in `deployment.json`, the new article, registry v1.3, and
the local hero image. This verifies the GitHub deployment separately from
the domain's public DNS route.

Public DNS still returns `104.18.26.246` for both `jceelabs.com` and
`www.jceelabs.com`, with no AAAA or CNAME answers. The authoritative
nameservers are `ns1.globaldomaingroup.com` and `ns2.globaldomaingroup.com`.
The apex has a Google verification TXT record; `www` has an OpenAI domain
verification TXT record. Preserve both.

The default project URL returns HTTP 301 to `http://jceelabs.com/`.
The public domain responds with `x-manus-proxy-mode: transparent/1`, and
`/deployment.json` returns the old site's HTML instead of the Pages receipt.
The domain is therefore still served by Manus. A successful Pages deployment
does not establish primary-domain publication.

The editorial metadata now removes Vite's hosting base path before constructing
the primary-domain canonical and Open Graph URLs. The browser gate checks
these URLs after rendering in both root and project builds.

The remaining apex cutover requires explicit approval to replace its current
`@` A value `104.18.26.246` with the four GitHub Pages addresses below. No
DNS change, Manus credit purchase, or external hosting change is part of this
repository repair. Leave `www` unchanged until its TXT/CNAME dependency has
an approved resolution. GitHub's HTTP redirect and HTTPS enforcement should
be checked again after the domain reaches Pages and its certificate is ready.

## Cutover sequence

1. Require passing root/project static checks and the existing public-surface gate.
2. In this repository's **Settings → Pages**, retain **GitHub Actions** as the
   publishing source and save `jceelabs.com` as the custom domain.
3. Run **JCEE Labs GitHub Pages** again. Confirm a successful root build and
   deployment before changing the working website connection.
4. At the current authoritative DNS provider, replace the website's root A
   record with these four GitHub Pages A records (name `@`):
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   Preserve the existing mail and verification records.
5. Validate public DNS, HTTPS, the commit in `deployment.json`, images,
   direct links, and downloads. Enable Enforce HTTPS when GitHub makes it available.

The existing `www` TXT verification record conflicts with a `www` CNAME.
Resolve that ownership-verification dependency before configuring GitHub's
recommended `www` CNAME. Do not silently discard it.

These changes do not activate Cloudflare, modify nameservers, disconnect Manus,
or change Railway. The working website should stay connected until the target
deployment and replacement DNS values are prepared.

[GitHub custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
