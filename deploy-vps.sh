#!/bin/bash
# NightRx VPS Deployment Script
#
# Prerequisites on VPS:
#   - Node.js 22+
#   - Docker & Docker Compose
#   - nginx
#
# Usage:
#   1. Clone repo to VPS
#   2. Copy .env with MIDNIGHT_SEED
#   3. Run: bash deploy-vps.sh

set -e

echo "=== NightRx VPS Deployment ==="

# Install deps
echo "[1/6] Installing dependencies..."
npm install

# Build frontend
echo "[2/6] Building frontend..."
npx vite build

# Start proof server (required for ZK proof generation)
echo "[3/6] Starting proof server..."
docker pull midnightntwrk/proof-server:8.0.3
docker rm -f nightrx-proof-server 2>/dev/null || true
docker run -d \
  --name nightrx-proof-server \
  --restart unless-stopped \
  -p 127.0.0.1:6300:6300 \
  -e RUST_BACKTRACE=full \
  midnightntwrk/proof-server:8.0.3 \
  midnight-proof-server -v

echo "Waiting for proof server..."
sleep 5

# Load env
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Deploy contract to preprod (if not already deployed)
if [ ! -f deployment.json ] || [ "$(cat deployment.json | grep -c preprod)" = "0" ]; then
  echo "[4/6] Deploying contract to preprod..."
  npx tsx src/midnight/deploy.ts preprod
else
  echo "[4/6] Contract already deployed to preprod, skipping."
fi

# Update server to use preprod config
echo "[5/6] Starting backend server..."
# The server.ts reads from deployment.json and uses the network config
# For preprod, we set env vars
export NIGHTRX_NETWORK=preprod
npx tsx src/midnight/server.ts &
SERVER_PID=$!
echo "Backend server PID: $SERVER_PID"

# Setup nginx config
echo "[6/6] Setting up nginx..."
cat > /tmp/nightrx-nginx.conf << 'NGINX'
server {
    listen 80;
    server_name _;

    # Frontend static files
    root /opt/nightrx/dist;
    index index.html;

    # API proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "To finish setup:"
echo "  1. Copy nginx config:  sudo cp /tmp/nightrx-nginx.conf /etc/nginx/sites-available/nightrx"
echo "  2. Enable site:        sudo ln -sf /etc/nginx/sites-available/nightrx /etc/nginx/sites-enabled/"
echo "  3. Remove default:     sudo rm -f /etc/nginx/sites-enabled/default"
echo "  4. Reload nginx:       sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "Backend server running on :3001 (PID: $SERVER_PID)"
echo "Frontend served by nginx on :80"
echo ""
echo "For production, use a process manager:"
echo "  npm install -g pm2"
echo "  pm2 start 'npx tsx src/midnight/server.ts' --name nightrx-server"
echo "  pm2 save && pm2 startup"
