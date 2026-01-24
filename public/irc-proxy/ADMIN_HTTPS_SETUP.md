# Admin API HTTPS Setup Guide

This guide shows how to expose the IRC Proxy Admin API over HTTPS using a reverse proxy (Nginx or Caddy). This allows the web Admin Panel to connect directly without mixed-content browser restrictions.

## Prerequisites

- A domain/subdomain pointing to your VPS (e.g., `ircadmin.justachat.net`)
- SSH access to your VPS
- The IRC proxy already running on port 6680 (HTTP)

---

## Option 1: Caddy (Recommended - Automatic HTTPS)

Caddy automatically obtains and renews SSL certificates from Let's Encrypt.

### Install Caddy

```bash
apt update && apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install caddy
```

### Configure Caddy

```bash
nano /etc/caddy/Caddyfile
```

Add this configuration:

```caddyfile
ircadmin.justachat.net {
    reverse_proxy localhost:6680
    
    # Optional: Restrict to specific origins
    @cors {
        method OPTIONS
    }
    handle @cors {
        header Access-Control-Allow-Origin "*"
        header Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS"
        header Access-Control-Allow-Headers "Authorization, Content-Type, X-Admin-Token"
        respond 204
    }
}
```

### Start Caddy

```bash
systemctl enable caddy
systemctl restart caddy
```

### Verify

```bash
curl -I https://ircadmin.justachat.net/status
```

---

## Option 2: Nginx with Let's Encrypt

### Install Nginx and Certbot

```bash
apt update && apt install -y nginx certbot python3-certbot-nginx
```

### Get SSL Certificate

```bash
certbot --nginx -d ircadmin.justachat.net
```

### Configure Nginx

```bash
nano /etc/nginx/sites-available/irc-admin
```

Add this configuration:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ircadmin.justachat.net;

    ssl_certificate /etc/letsencrypt/live/ircadmin.justachat.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ircadmin.justachat.net/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # CORS headers
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Admin-Token" always;

    # Handle preflight
    if ($request_method = 'OPTIONS') {
        return 204;
    }

    location / {
        proxy_pass http://127.0.0.1:6680;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name ircadmin.justachat.net;
    return 301 https://$server_name$request_uri;
}
```

### Enable the site

```bash
ln -s /etc/nginx/sites-available/irc-admin /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## Option 3: Built-in HTTPS (No Reverse Proxy)

The proxy can serve HTTPS directly if you have certificates.

### Get Certificate

```bash
certbot certonly --standalone -d ircadmin.justachat.net
```

### Update .env

```bash
cd /opt/justachat-irc
nano .env
```

Set these values:

```env
ADMIN_SSL_ENABLED=true
SSL_CERT=/etc/letsencrypt/live/ircadmin.justachat.net/fullchain.pem
SSL_KEY=/etc/letsencrypt/live/ircadmin.justachat.net/privkey.pem
```

### Restart Proxy

```bash
docker-compose down && docker-compose up -d
```

---

## Firewall Configuration

Ensure the relevant ports are open:

```bash
# For Caddy/Nginx (standard HTTPS)
ufw allow 443/tcp

# If using built-in HTTPS on port 6680
ufw allow 6680/tcp

ufw reload
```

---

## Admin Panel Configuration

Once HTTPS is set up, update the Admin Panel:

1. Go to **Admin → IRC Gateway**
2. Set **Proxy Admin URL** to:
   - Caddy/Nginx: `https://ircadmin.justachat.net`
   - Built-in HTTPS: `https://ircadmin.justachat.net:6680`
3. Enter your **Admin Token**
4. Click **Test Connection**

---

## Troubleshooting

### Certificate Issues
```bash
# Check certificate status
certbot certificates

# Force renewal
certbot renew --force-renewal
```

### Connection Refused
```bash
# Check if proxy is running
docker-compose ps

# Check proxy logs
docker-compose logs -f irc-proxy

# Test local connection
curl http://127.0.0.1:6680/status
```

### CORS Errors
Ensure your reverse proxy configuration includes the CORS headers shown above, or that the proxy itself handles CORS (it does by default).

### Mixed Content Still Blocked
Make sure you're using `https://` in the Admin Panel URL, not `http://`.
