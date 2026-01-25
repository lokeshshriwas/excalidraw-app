# Dockerfile for HTTP Backend - Optimized with Turbo Prune
FROM node:20-alpine AS base
RUN npm install -g pnpm turbo
WORKDIR /app

FROM base AS pruner
COPY . .
RUN turbo prune http-backend --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm run build --filter=http-backend...

FROM base AS runner
WORKDIR /app
COPY --from=installer /app .
EXPOSE 3002
CMD ["node", "apps/http-backend/dist/index.js"]
