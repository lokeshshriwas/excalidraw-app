#!/bin/bash

# CAUTION: This script runs database migrations (schema push).
# It uses a temporary container to ensure the schema is applied to the postgres container.

echo "🚀 Applying Database Migrations..."

# Load env vars to get DB secrets if needed, or assume defaults from compose
# We used: POSTGRES_USER=excalidraw, POSTGRES_PASSWORD=${DB_PASSWORD}, DB=excalidraw

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file missing! Please create it first."
  exit 1
fi

# Extract DB_PASSWORD from .env
DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2)

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ DB_PASSWORD not found in .env"
  exit 1
fi

echo "🔑 Found DB Password. Connecting to database..."

# Run a temporary node container in the same network to apply schema
# We mount the packages/db directory to access schema.prisma
docker run -it --rm \
  --network excalidraw-app_default \
  -v "$PWD/packages/db:/app/packages/db" \
  -w /app/packages/db \
  -e DATABASE_URL="postgresql://excalidraw:$DB_PASSWORD@postgres:5432/excalidraw?schema=public" \
  node:20-alpine \
  sh -c "npm install -g prisma && npx prisma db push"

echo "✅ Migrations Applied!"
