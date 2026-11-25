FROM node:22.23.4-bookworm-slim AS build
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY . .
RUN apt-get update \
  && apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/* \
  && git clone --no-checkout release-source.bundle /tmp/jcee-canonical \
  && git -C /tmp/jcee-canonical checkout HEAD -- .gitignore \
  && cp /tmp/jcee-canonical/.gitignore .gitignore \
  && rm -rf /tmp/jcee-canonical \
  && rm -f Dockerfile \
  && corepack enable \
  && BUILD_SOURCE_COMMIT="$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync("release-source.json", "utf8")).source)')" \
     sh scripts/manus-build.sh --pinned-runtime

FROM node:22.23.4-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
