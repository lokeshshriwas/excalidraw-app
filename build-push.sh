#!/bin/bash

# ==============================================
# Build and Push Docker Images to Docker Hub
# ==============================================

set -e

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

echo "🔨 Building Docker images..."

# Build HTTP Backend
echo "📦 Building http-backend..."
docker build -t $DOCKERHUB_USERNAME/excalidraw-http:latest -f apps/http-backend/Dockerfile .

# Build WebSocket Backend
echo "📦 Building ws-backend..."
docker build -t $DOCKERHUB_USERNAME/excalidraw-ws:latest -f apps/ws-backend/Dockerfile .

# Build Frontend (with environment variables)
echo "📦 Building frontend..."
docker build -t $DOCKERHUB_USERNAME/excalidraw-frontend:latest \
  --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
  --build-arg NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL \
  --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
  --build-arg NEXT_PUBLIC_GITHUB_CLIENT_ID=$NEXT_PUBLIC_GITHUB_CLIENT_ID \
  -f apps/excalidraw-frontend/Dockerfile .

echo "✅ All images built successfully!"

# Push to Docker Hub
echo "📤 Pushing images to Docker Hub..."
docker push $DOCKERHUB_USERNAME/excalidraw-http:latest
docker push $DOCKERHUB_USERNAME/excalidraw-ws:latest
docker push $DOCKERHUB_USERNAME/excalidraw-frontend:latest

echo "✅ All images pushed to Docker Hub!"
