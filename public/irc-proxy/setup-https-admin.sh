#!/bin/bash
# =============================================================================
# JAC IRC Proxy - HTTPS Admin API Setup Script
# =============================================================================
# This script sets up HTTPS for the Admin API using Caddy (recommended)
# or Nginx with Let's Encrypt certificates.
#
# Usage: ./setup-https-admin.sh [caddy|nginx] <domain>
# Example: ./setup-https-admin.sh caddy ircadmin.justachat.net
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║       JAC IRC Proxy - HTTPS Admin API Setup                   ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}Error: Please run as root (sudo)${NC}"
        exit 1
    fi
}

check_domain_dns() {
    local domain=$1
    echo -e "${YELLOW}Checking DNS for ${domain}...${NC}"
    
    if ! host "$domain" > /dev/null 2>&1; then
        echo -e "${RED}Warning: DNS lookup failed for ${domain}${NC}"
        echo -e "${YELLOW}Make sure the domain points to this server's IP before continuing.${NC}"
        read -p "Continue anyway? (y/n): " confirm
        if [ "$confirm" != "y" ]; then
            exit 1
        fi
    else
        echo -e "${GREEN}✓ DNS lookup successful${NC}"
    fi
}

setup_caddy() {
    local domain=$1
    
    echo -e "${BLUE}Installing Caddy...${NC}"
    apt update
    apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
    
    if [ ! -f /usr/share/keyrings/caddy-stable-archive-keyring.gpg ]; then
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    fi
    
    echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" | tee /etc/apt/sources.list.d/caddy-stable.list
    apt update
    apt install -y caddy
    
    echo -e "${BLUE}Configuring Caddy for ${domain}...${NC}"
    
    # Backup existing config
    if [ -f /etc/caddy/Caddyfile ]; then
        cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%s)
    fi
    
    cat > /etc/caddy/Caddyfile << EOF
${domain} {
    reverse_proxy localhost:6680
    
    header {
        Access-Control-Allow-Origin "*"
        Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS"
        Access-Control-Allow-Headers "Authorization, Content-Type, X-Admin-Token"
    }
    
    @options method OPTIONS
    handle @options {
        respond 204
    }
}
EOF
    
    echo -e "${BLUE}Starting Caddy...${NC}"
    systemctl enable caddy
    systemctl restart caddy
    
    # Wait for cert provisioning
    echo -e "${YELLOW}Waiting for SSL certificate provisioning...${NC}"
    sleep 5
    
    echo -e "${GREEN}✓ Caddy setup complete!${NC}"
    echo -e "${GREEN}Admin API URL: https://${domain}${NC}"
}

setup_nginx() {
    local domain=$1
    
    echo -e "${BLUE}Installing Nginx and Certbot...${NC}"
    apt update
    apt install -y nginx certbot python3-certbot-nginx
    
    echo -e "${BLUE}Obtaining SSL certificate...${NC}"
    certbot certonly --standalone --non-interactive --agree-tos --email admin@${domain} -d ${domain} || {
        echo -e "${YELLOW}Standalone cert failed, trying webroot...${NC}"
        systemctl start nginx
        certbot --nginx --non-interactive --agree-tos --email admin@${domain} -d ${domain}
    }
    
    echo -e "${BLUE}Configuring Nginx...${NC}"
    
    cat > /etc/nginx/sites-available/irc-admin << EOF
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${domain};

    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Admin-Token" always;

    if (\$request_method = 'OPTIONS') {
        return 204;
    }

    location / {
        proxy_pass http://127.0.0.1:6680;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name ${domain};
    return 301 https://\$server_name\$request_uri;
}
EOF
    
    ln -sf /etc/nginx/sites-available/irc-admin /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    nginx -t
    systemctl enable nginx
    systemctl restart nginx
    
    echo -e "${GREEN}✓ Nginx setup complete!${NC}"
    echo -e "${GREEN}Admin API URL: https://${domain}${NC}"
}

configure_firewall() {
    echo -e "${BLUE}Configuring firewall...${NC}"
    
    if command -v ufw &> /dev/null; then
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw reload
        echo -e "${GREEN}✓ Firewall configured${NC}"
    else
        echo -e "${YELLOW}UFW not found, skipping firewall configuration${NC}"
    fi
}

verify_setup() {
    local domain=$1
    
    echo -e "${BLUE}Verifying setup...${NC}"
    sleep 3
    
    if curl -sI "https://${domain}/status" | grep -q "200\|401"; then
        echo -e "${GREEN}✓ HTTPS Admin API is responding!${NC}"
    else
        echo -e "${YELLOW}Warning: Could not verify HTTPS endpoint${NC}"
        echo -e "${YELLOW}It may take a minute for SSL to be provisioned${NC}"
    fi
}

print_summary() {
    local domain=$1
    local method=$2
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Setup Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${BLUE}Method:${NC} ${method}"
    echo -e "  ${BLUE}Admin API URL:${NC} https://${domain}"
    echo ""
    echo -e "  ${YELLOW}Next Steps:${NC}"
    echo "  1. Go to Admin → IRC Gateway in your web app"
    echo "  2. Set Proxy Admin URL to: https://${domain}"
    echo "  3. Enter your Admin Token"
    echo "  4. Click 'Test Connection'"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
}

# Main
print_banner
check_root

if [ $# -lt 2 ]; then
    echo "Usage: $0 [caddy|nginx] <domain>"
    echo ""
    echo "Examples:"
    echo "  $0 caddy ircadmin.justachat.net"
    echo "  $0 nginx ircadmin.example.com"
    echo ""
    echo "Options:"
    echo "  caddy  - Use Caddy (recommended, automatic HTTPS)"
    echo "  nginx  - Use Nginx with Let's Encrypt"
    exit 1
fi

METHOD=$1
DOMAIN=$2

check_domain_dns "$DOMAIN"

case $METHOD in
    caddy)
        setup_caddy "$DOMAIN"
        ;;
    nginx)
        setup_nginx "$DOMAIN"
        ;;
    *)
        echo -e "${RED}Unknown method: ${METHOD}${NC}"
        echo "Use 'caddy' or 'nginx'"
        exit 1
        ;;
esac

configure_firewall
verify_setup "$DOMAIN"
print_summary "$DOMAIN" "$METHOD"
