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
