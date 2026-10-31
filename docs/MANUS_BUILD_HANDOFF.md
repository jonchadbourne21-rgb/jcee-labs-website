# Manus build handoff

Set the existing project build command to exactly:

```sh
sh scripts/manus-build.sh
```

Keep the static output directory `dist/public`. Do not paste a separate runtime bootstrap into provider configuration. This command uses the repository checksum-pinned Node 22.23.4 bootstrap, checks pnpm 10.4.1, installs the frozen lockfile, and builds with authentic source verification.

Before checkpointing, synchronize all tracked source files from the approved full commit. In that synchronized directory run `BUILD_SOURCE_REPOSITORY=/path/to/canonical-checkout pnpm release:prepare FULL_COMMIT_SHA`. The canonical checkout HEAD must equal that SHA. Include both generated release-source.bundle and release-source.json in the checkpoint. Preserve platform configuration and secrets. Never hand-copy source identity fields or reuse a predecessor bundle.

Run the existing release:check and release:verify gates for the approved commit. Publish only later when authorized and Manus credits are available. After publication compare deployment.json and every public file using release:verify against the primary domain. A saved checkpoint is not a successful publication.

## Recovered failure

The earlier deployment 69459262 stopped after verifying an archive under /root/.jcee-node. That is not the repository bootstrap path (.pnpm-store/jcee-node). The exact earlier extraction/launch error is not exposed and remains undetermined.

The current Manus publish error for checkpoint 8b967ced6ae2fecff5c34c1174ce5a113652ae03 instead reports host-node=v24.22.1 and host-pnpm=10.4.1. A native-runtime command cannot assume the pinned Node 22 runtime on that host. This successor centralizes runtime selection and build execution in tracked code. It does not claim that unavailable provider stderr was recovered or that hosted publication has passed.

Regression coverage exercises Node24 host-to-Node22 child PATH handoff, pnpm mismatch, install failure and build failure. The actual checksum-pinned download is separately exercised by CI. Provider configuration must be synchronized with this command; GitHub changes alone cannot change an existing Manus setting.

## Reproduced extraction defect

On the restricted root build filesystem, the real checksum-verified Node archive failed extraction with `Cannot change ownership to uid 1001, gid 1001: Invalid argument`, exit 2. GNU tar attempts archived ownership restoration when root. `--no-same-owner` retains the build user ownership and removes that unnecessary privileged operation. The real download/extraction/execution is rerun after the repair. This reproduces the failure stage; unavailable historical provider stderr prevents asserting that deployment 69459262 had the identical cause.
