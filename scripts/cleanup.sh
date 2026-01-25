#!/bin/bash
# scripts/cleanup.sh

echo "🛑 Stopping all running containers..."
docker compose -f docker-compose.prod.yml down

echo "🧹 Removing all containers..."
docker rm -f $(docker ps -aq) 2>/dev/null

echo "🗑️  Removing all images..."
docker rmi -f $(docker images -q) 2>/dev/null

echo "📦 Removing all volumes (WARNING: DB DATA WILL BE LOST)..."
docker volume rm $(docker volume ls -q) 2>/dev/null

echo "🌐 Removing all custom networks..."
docker network prune -f

echo "✨ Clean reset complete. Ready for fresh deployment."
