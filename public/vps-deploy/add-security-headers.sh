#!/bin/bash
# Add Permissions-Policy and Referrer-Policy headers to nginx
# Run on VPS: bash add-security-headers.sh

set -e

NGINX_CONF="/etc/nginx/sites-available/justachat"

echo "=== Adding Security Headers to Nginx ==="

# Check if nginx config exists
if [ ! -f "$NGINX_CONF" ]; then
    echo "Error: Nginx config not found at $NGINX_CONF"
    exit 1
fi

# Backup current config
cp "$NGINX_CONF" "$NGINX_CONF.bak.$(date +%Y%m%d%H%M%S)"
echo "✓ Backed up current config"

# Check if headers already exist
if grep -q "Referrer-Policy" "$NGINX_CONF"; then
    echo "⚠ Referrer-Policy header already exists, skipping..."
else
    # Add Referrer-Policy after X-XSS-Protection
    sed -i '/X-XSS-Protection/a\    add_header Referrer-Policy "strict-origin-when-cross-origin" always;' "$NGINX_CONF"
    echo "✓ Added Referrer-Policy header"
fi

if grep -q "Permissions-Policy" "$NGINX_CONF"; then
    echo "⚠ Permissions-Policy header already exists, skipping..."
else
    # Add Permissions-Policy after Referrer-Policy (or after X-XSS-Protection if Referrer wasn't added)
    if grep -q "Referrer-Policy" "$NGINX_CONF"; then
        sed -i '/Referrer-Policy/a\    add_header Permissions-Policy "geolocation=(), microphone=(self), camera=(self), payment=(), usb=()" always;' "$NGINX_CONF"
    else
        sed -i '/X-XSS-Protection/a\    add_header Permissions-Policy "geolocation=(), microphone=(self), camera=(self), payment=(), usb=()" always;' "$NGINX_CONF"
    fi
    echo "✓ Added Permissions-Policy header"
fi

# Test nginx config
echo "Testing nginx configuration..."
nginx -t

# Reload nginx
echo "Reloading nginx..."
systemctl reload nginx

echo ""
echo "=== Security Headers Added Successfully ==="
echo "Headers now include:"
echo "  - Strict-Transport-Security (HSTS)"
echo "  - X-Content-Type-Options"
echo "  - X-Frame-Options"
echo "  - X-XSS-Protection"
echo "  - Referrer-Policy"
echo "  - Permissions-Policy"
echo ""
echo "Test at: https://securityheaders.com/?q=justachat.net"
