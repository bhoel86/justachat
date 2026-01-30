
# JustAChat VPS - Complete From-Scratch Rebuild Plan

## Overview

You're rebuilding the VPS from scratch. The frontend directory (`/var/www/justachat`) is missing, which is why you're getting 500 errors. Here's the complete step-by-step process to get everything running.

---

## Prerequisites - What You Need Before Starting

Have these ready before running the rebuild:

| Item | Where to get it |
|------|-----------------|
| **RESEND_API_KEY** | https://resend.com/api-keys |
| **OPENAI_API_KEY** | https://platform.openai.com/api-keys |
| **GOOGLE_CLIENT_ID** | https://console.cloud.google.com/apis/credentials |
| **GOOGLE_CLIENT_SECRET** | Same as above |

---

## Step-by-Step Instructions

### Step 1: SSH into the VPS

```bash
ssh unix@157.245.174.197
# Password: Khoel15$$
```

### Step 2: Download the rebuild script from GitHub

Since `/var/www/justachat` doesn't exist, we need to clone it first to get the scripts:

```bash
# Create directory and set ownership
sudo mkdir -p /var/www/justachat
sudo chown -R unix:unix /var/www/justachat

# Clone the repo
cd /var/www
rm -rf justachat
git clone https://github.com/UnixMint/justachat-unix.git justachat
cd justachat
```

### Step 3: Run the rebuild script

```bash
bash public/vps-deploy/rebuild-vps-v2.sh
```

The script will prompt you for:
1. RESEND_API_KEY
2. OPENAI_API_KEY
3. GOOGLE_CLIENT_ID
4. GOOGLE_CLIENT_SECRET
5. Whether to disable root login (say Y)

**What the script does automatically:**
- Stops all services
- Generates fresh JWT keys (ANON_KEY, SERVICE_KEY)
- Creates the Supabase Docker `.env` with all settings
- Starts database first, waits for health
- Starts analytics in background (won't block)
- Starts all other services (auth, rest, kong, etc.)
- Builds the frontend with correct `.env`
- Sets up the email webhook service
- Copies edge functions to Docker volume
- Applies database schema

### Step 4: Configure Nginx (if not already done)

After the rebuild, install the Nginx config with the email hook route:

```bash
sudo tee /etc/nginx/sites-available/justachat > /dev/null << 'NGINX'
server {
    listen 80;
    server_name justachat.net www.justachat.net;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name justachat.net www.justachat.net;

    ssl_certificate /etc/letsencrypt/live/justachat.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/justachat.net/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;

    root /var/www/justachat/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Email webhook (GoTrue -> Resend)
    location = /hook/email {
        proxy_pass http://127.0.0.1:3001/hook/email;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Supabase APIs
    location ~ ^/(rest|auth|realtime|storage|functions)/v1 {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }

    # Deploy service
    location /deploy/ {
        proxy_pass http://127.0.0.1:6680/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 300s;
    }

    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
NGINX

# Enable and test
sudo ln -sf /etc/nginx/sites-available/justachat /etc/nginx/sites-enabled/justachat
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### Step 5: Verify everything is working

```bash
# Check containers are running
cd ~/supabase/docker
sudo docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E 'supabase|kong|realtime'

# Get the ANON_KEY
ANON_KEY=$(grep "^ANON_KEY=" .env | cut -d'=' -f2- | tr -d '"')

# Test Auth API
curl -s "http://127.0.0.1:8000/auth/v1/health" -H "apikey: $ANON_KEY"
# Should return: {"description":"GoTrue is alive","version":"..."}

# Test REST API
curl -s "http://127.0.0.1:8000/rest/v1/" -H "apikey: $ANON_KEY" | head -c 100

# Test email webhook
curl -s http://127.0.0.1:3001/
# Should return: Email webhook OK

# Check the site
curl -sI https://justachat.net | head -5
# Should return: HTTP/2 200
```

### Step 6: Save your credentials

The script saves credentials to `~/justachat-credentials.txt`. Copy this somewhere safe:

```bash
cat ~/justachat-credentials.txt
```

---

## What If Something Goes Wrong?

### "Analytics stuck" during rebuild
This is handled automatically - analytics runs in background and won't block Kong or other services.

### 500 error after rebuild
Check if the build succeeded:
```bash
ls -la /var/www/justachat/dist/index.html
```
If missing, rebuild frontend:
```bash
cd /var/www/justachat
npm install && npm run build
```

### Auth API returning errors
Check the auth container logs:
```bash
sudo docker logs supabase-auth --tail 50
```

### Email not sending
Check email webhook:
```bash
sudo systemctl status justachat-email
sudo journalctl -u justachat-email --tail 30
```

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| SSH in | `ssh unix@157.245.174.197` |
| Check all containers | `cd ~/supabase/docker && sudo docker ps` |
| Restart Supabase | `cd ~/supabase/docker && sudo docker compose restart` |
| Restart email service | `sudo systemctl restart justachat-email` |
| Rebuild frontend | `cd /var/www/justachat && npm run build` |
| View auth logs | `sudo docker logs supabase-auth -f` |
| View nginx errors | `sudo tail -f /var/log/nginx/error.log` |

---

## Summary

1. **SSH in** as `unix`
2. **Clone repo** to `/var/www/justachat`
3. **Run** `bash public/vps-deploy/rebuild-vps-v2.sh` (enter API keys when prompted)
4. **Install Nginx config** with email hook route
5. **Verify** with curl commands

The entire process takes about 5-10 minutes depending on npm install and Docker image pulls.
