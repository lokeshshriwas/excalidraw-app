#!/bin/bash
# scripts/setup_ec2.sh

# 1. Update OS
echo "🔄 Updating OS..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git unzip

# 2. Install Docker & Docker Compose
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  echo "Docker installed. Please re-login or run 'newgrp docker' to use without sudo."
else
  echo "Docker already installed."
fi

# 3. Setup Swap (Critical for t2.small)
echo "💾 Checking Swap..."
if [ $(swapon --show | wc -l) -eq 0 ]; then
  echo "Creating 4GB Swap file for t3.small stability (20GB Storage available)..."
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  
  # Optimize Swap behavior (Use RAM as much as possible, only swap when necessary)
  # Default is 60, we lower it to 10 for better latency
  sudo sysctl vm.swappiness=10
  echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
  
  echo "Swap created and optimized."
else
  echo "Swap already exists."
fi

# 4. Generate Init SSL Cert (Self-Signed) to prevent Nginx Crash
echo "🔒 Generating initial dummy SSL certificate..."
mkdir -p ./nginx/ssl/live/drawapp.bylokesh.in
if [ ! -f ./nginx/ssl/live/drawapp.bylokesh.in/fullchain.pem ]; then
  openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
    -keyout ./nginx/ssl/live/drawapp.bylokesh.in/privkey.pem \
    -out ./nginx/ssl/live/drawapp.bylokesh.in/fullchain.pem \
    -subj "/CN=drawapp.bylokesh.in"
  echo "Dummy certificate generated. Replace with Certbot later."
fi

echo "✅ EC2 Setup Complete."
