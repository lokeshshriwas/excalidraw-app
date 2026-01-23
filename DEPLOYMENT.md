# Excalidraw AWS Deployment Guide

Complete guide for deploying Excalidraw on AWS EC2 t3.small with Docker Hub.

## Prerequisites

- AWS Account
- Docker Hub account
- Domain name (optional but recommended)
- SSH client

---

## Step 1: Setup GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions

### Required Secrets

| Secret Name          | Value                                                                |
| -------------------- | -------------------------------------------------------------------- |
| `DOCKERHUB_USERNAME` | Your Docker Hub username                                             |
| `DOCKERHUB_TOKEN`    | Docker Hub access token (create at hub.docker.com/settings/security) |

### Required Variables (Settings → Variables)

| Variable Name                  | Example Value                |
| ------------------------------ | ---------------------------- |
| `NEXT_PUBLIC_API_URL`          | `https://your-domain.com/v1` |
| `NEXT_PUBLIC_WS_URL`           | `wss://your-domain.com/ws`   |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`  | `rzp_test_xxxxx`             |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your Google OAuth client ID  |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | Your GitHub OAuth client ID  |

---

## Step 2: Push Code to Trigger Build

```bash
git add .
git commit -m "Add Docker deployment configuration"
git push origin main
```

This triggers GitHub Actions to build and push images to Docker Hub.

> Check build status at: https://github.com/lokeshshriwas/excalidraw-app/actions

---

## Step 3: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance
2. **Configuration**:
   - **Name**: `excalidraw-server`
   - **AMI**: Ubuntu 22.04 LTS
   - **Instance type**: `t3.small`
   - **Key pair**: Create or select existing
   - **Storage**: 20 GB gp3

3. **Security Group** - Allow these ports:
   | Port | Source | Purpose |
   |------|--------|---------|
   | 22 | Your IP | SSH |
   | 80 | 0.0.0.0/0 | HTTP |
   | 443 | 0.0.0.0/0 | HTTPS |

---

## Step 4: Install Docker on EC2

```bash
# SSH into your instance
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
```

---

## Step 5: Clone & Configure

```bash
# Clone repository
git clone https://github.com/lokeshshriwas/excalidraw-app.git
cd excalidraw-app

# Create environment file
cp .env.production.example .env
nano .env
```

### Required .env Values

```env
DOCKERHUB_USERNAME=your_dockerhub_username
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
DOMAIN=your-domain.com
CORS_ORIGINS=https://your-domain.com
BASE_URL=https://your-domain.com/v1
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_test_secret
```

---

## Step 6: SSL Certificate

```bash
# Install Certbot
sudo apt install certbot -y

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com
```

---

## Step 7: Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

That's it! Your app should be live at `https://your-domain.com`

---

## Useful Commands

| Command                                             | Description                 |
| --------------------------------------------------- | --------------------------- |
| `docker-compose -f docker-compose.prod.yml ps`      | List containers             |
| `docker-compose -f docker-compose.prod.yml logs -f` | View logs                   |
| `docker-compose -f docker-compose.prod.yml pull`    | Pull latest images          |
| `./deploy.sh`                                       | Redeploy with latest images |

---

## Cost Estimate

| Resource      | Monthly Cost |
| ------------- | ------------ |
| EC2 t3.small  | ~$15         |
| EBS 20GB      | ~$2          |
| Data Transfer | ~$1-3        |
| **Total**     | **~$18-20**  |
