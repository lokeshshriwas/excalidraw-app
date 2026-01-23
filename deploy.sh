#!/bin/bash

# ==============================================
# Excalidraw Deployment Script for AWS EC2
# Uses pre-built Docker Hub images
# ==============================================

set -e

echo "🚀 Starting Excalidraw Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.production.example to .env and configure it."
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Verify required variables
if [ -z "$DOCKERHUB_USERNAME" ]; then
    echo "❌ Error: DOCKERHUB_USERNAME not set in .env"
    exit 1
fi

if [ -z "$DOMAIN" ]; then
    echo "❌ Error: DOMAIN not set in .env"
    exit 1
fi

# Substitute domain in nginx config
echo "🔧 Configuring Nginx for domain: $DOMAIN"
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx/nginx.conf

echo "📦 Pulling latest images from Docker Hub..."
docker-compose -f docker-compose.prod.yml pull

echo "🗑️ Stopping old containers..."
docker-compose -f docker-compose.prod.yml down

echo "🚀 Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Run Prisma migrations
echo "📦 Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T http-backend sh -c "cd /app/packages/db && npx prisma migrate deploy" || echo "⚠️ Migration may need manual run"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 Your application should be available at:"
echo "   https://${DOMAIN}"
echo ""
echo "📋 Useful commands:"
echo "   View logs:     docker-compose -f docker-compose.prod.yml logs -f"
echo "   Restart:       docker-compose -f docker-compose.prod.yml restart"
echo "   Stop:          docker-compose -f docker-compose.prod.yml down"
