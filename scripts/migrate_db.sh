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
DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ DB_PASSWORD not found in .env"
  exit 1
fi

echo "🔑 Found DB Password. Connecting to database..."

# Extract DB_USER and DB_NAME or default to 'excalidraw'
DB_USER=$(grep DB_USER .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
DB_USER=${DB_USER:-excalidraw}

DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
DB_NAME=${DB_NAME:-excalidraw}

echo "🔑 Connecting as user: $DB_USER to db: $DB_NAME"

# Run a temporary node container in the same network to apply schema
# We mount the packages/db directory to access schema.prisma
docker run -it --rm \
  --network excalidraw-app_default \
  -v "$PWD/packages/db:/app/packages/db" \
  -w /app/packages/db \
  -e DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@postgres:5432/$DB_NAME?schema=public" \
  node:20-alpine \
  sh -c "npm install -g prisma@6.11.1 && prisma db push"

echo "✅ Migrations Applied!"
