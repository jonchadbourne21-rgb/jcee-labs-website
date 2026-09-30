# JCEE Labs Website

Static homepage for JCEE Labs.

- JCEE Labs is the company.
- VOW is the evidence-first execution runtime.
- Mirrored is the upcoming consumer product.

This repo is intentionally plain static HTML/CSS so Manus can sync and serve it without a build step.

## FrameForge Pre-Visualization Engine

The repository also contains an isolated FastAPI application under [`previs-engine/`](./previs-engine/). It turns scene briefs into structured Higgsfield-ready shot lists, runs asynchronous preview jobs, presents an interactive horizontal pitch deck, supports individual shot rerolls, and exports client-facing review packages. See [`previs-engine/README.md`](./previs-engine/README.md) for setup, configuration, tests, and deployment guidance.
