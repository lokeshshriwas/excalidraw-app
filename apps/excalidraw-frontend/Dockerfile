# Dockerfile for Frontend - Optimized with Turbo Prune & Standalone Output
FROM node:20-alpine AS base
RUN npm install -g pnpm turbo
WORKDIR /app

FROM base AS pruner
COPY . .
RUN turbo prune excalidraw-frontend --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

RUN pnpm run build --filter=excalidraw-frontend...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/excalidraw-frontend/public ./apps/excalidraw-frontend/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/excalidraw-frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/excalidraw-frontend/.next/static ./apps/excalidraw-frontend/.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/excalidraw-frontend/server.js"]
