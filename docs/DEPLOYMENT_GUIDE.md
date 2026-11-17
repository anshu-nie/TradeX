# TradeX – Cloud Deployment Guide

This guide provides step-by-step instructions for deploying TradeX on an Ubuntu/Debian Cloud Virtual Machine (e.g., AWS EC2, DigitalOcean Droplet, Google Cloud Compute Engine, or Azure VM).

---

## 1. Cloud Server Requirements

- **OS**: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS
- **Hardware**: Minimum 2 vCPU, 2GB RAM (4GB RAM recommended)
- **Firewall Ports Open**:
  - `22` (SSH)
  - `80` (HTTP)
  - `443` (HTTPS)
  - `3000` (Optional for direct frontend access)
  - `5000` (Optional for direct API access)

---

## 2. Server Provisioning Steps

### Step 1: Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw
```

### Step 2: Install Docker & Docker Compose
```bash
# Add Docker official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow current user to run docker without sudo
sudo usermod -aG docker $USER
```

### Step 3: Clone Repository on Server
```bash
sudo mkdir -p /opt/tradex
sudo chown $USER:$USER /opt/tradex
git clone https://github.com/your-username/tradex.git /opt/tradex
cd /opt/tradex
```

### Step 4: Configure Environment Files
Create `/opt/tradex/backend/.env`:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://mongodb:27017/tradex
JWT_SECRET=generate_a_64_character_random_hex_string_here
CLIENT_URL=http://your-server-ip:3000
```

### Step 5: Start Containers with Docker Compose
```bash
docker compose up -d --build
```

### Step 6: Seed Stock Data
```bash
docker compose exec backend node seed.js
```

### Step 7: Configure Reverse Proxy & SSL (Optional with Certbot)
To run on standard port 80/443 with free SSL certificates:
```bash
sudo apt install -y certbot python3-certbot-nginx
```
Point your domain A-record to the server IP and obtain a certificate via:
```bash
sudo certbot --nginx -d tradex.yourdomain.com
```
