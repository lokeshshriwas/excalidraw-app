# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy all packages
COPY packages ./packages

# Copy ws-backend
COPY apps/ws-backend ./apps/ws-backend

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
WORKDIR /app/packages/db
RUN pnpm prisma generate

# Build backend-common (TypeScript to JS)
WORKDIR /app/packages/backend-common
RUN pnpm exec tsc --outDir ./dist --declaration || true

# Build the ws-backend application
WORKDIR /app/apps/ws-backend
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy built packages
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/ws-backend/dist ./apps/ws-backend/dist
COPY --from=builder /app/apps/ws-backend/package.json ./apps/ws-backend/
COPY --from=builder /app/apps/ws-backend/node_modules ./apps/ws-backend/node_modules

WORKDIR /app/apps/ws-backend

EXPOSE 9090

CMD ["node", "dist/index.js"]
