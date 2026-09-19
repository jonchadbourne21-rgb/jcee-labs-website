# VOW 1.1 Reference Deployment

This directory corrects the deployment mechanics in the supplied package while preserving the frozen VOW 1.1 source under `vendor/vow-1.1/`.

The stack is intended for **local and controlled integration testing**. It is not a production edge deployment. The VOW API has no built-in authentication layer and must not be exposed directly to an untrusted network.

## Corrections applied

| Package issue | Correction |
| --- | --- |
| Docker build attempted `pip install .` before source was copied | The frozen source is copied before installation. |
| PostgreSQL credentials were embedded in Compose | `.env.example` contains placeholders and Compose requires explicit values. |
| Recovery depended on container restart behavior | A persistent, signal-aware worker runs `vow sweep` at a configurable interval. |
| Startup used only process ordering | PostgreSQL and VOW API readiness health checks gate dependent services. |
| Frozen integrity was assumed | The image build runs `sha256sum -c CAUSAL-EFFECTS-MANIFEST.sha256`. |

## Run locally

From the repository root:

```bash
cp deploy/vow-reference/.env.example deploy/vow-reference/.env
# Replace both password placeholders in the new .env file.

docker compose --env-file deploy/vow-reference/.env \
  -f deploy/vow-reference/docker-compose.yml config

docker compose --env-file deploy/vow-reference/.env \
  -f deploy/vow-reference/docker-compose.yml up --build
```

The VOW API is available at `http://localhost:8080` by default. Stop the stack with:

```bash
docker compose --env-file deploy/vow-reference/.env \
  -f deploy/vow-reference/docker-compose.yml down
```

Use `down -v` only when you intentionally want to delete the local PostgreSQL data volume.

## Production prerequisites

Before production use, add an authenticated TLS edge, least-privilege network rules, managed database credentials, a managed Ed25519 signing key, backup and restore procedures, metrics and alerting, schema migrations, provider-specific effect adapters, and tested recovery runbooks. Do not infer legal compliance from this reference stack or from a successful evidence verification.
