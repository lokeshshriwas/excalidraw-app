# Dockerfile for WebSocket Backend - Optimized with Turbo Prune
FROM node:20-alpine AS base
RUN npm install -g pnpm turbo
WORKDIR /app

FROM base AS pruner
COPY . .
RUN turbo prune ws-backend --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm run build --filter=ws-backend...

FROM base AS runner
WORKDIR /app
COPY --from=installer /app .
EXPOSE 9090
CMD ["node", "apps/ws-backend/dist/index.js"]
