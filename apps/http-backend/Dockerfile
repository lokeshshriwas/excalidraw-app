# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy all packages (they will be built)
COPY packages ./packages

# Copy http-backend
COPY apps/http-backend ./apps/http-backend

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
WORKDIR /app/packages/db
RUN pnpm prisma generate

# Build backend-common (TypeScript to JS)
WORKDIR /app/packages/backend-common
RUN pnpm exec tsc --outDir ./dist --declaration || true

# Build the http-backend application
WORKDIR /app/apps/http-backend
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm for production
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy built packages (need node_modules and built files)
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/http-backend/dist ./apps/http-backend/dist
COPY --from=builder /app/apps/http-backend/package.json ./apps/http-backend/
COPY --from=builder /app/apps/http-backend/node_modules ./apps/http-backend/node_modules

WORKDIR /app/apps/http-backend

EXPOSE 3002

CMD ["node", "dist/index.js"]
