#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# JustAChat™ SEO Updates Deployment Script
# Run on VPS: bash deploy-seo-updates.sh
# ═══════════════════════════════════════════════════════════════════════════

set -e
cd /var/www/justachat

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║        JustAChat™ SEO Updates Deployment                          ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Pull latest from GitHub
echo "📥 Step 1: Pulling latest changes from GitHub..."
git fetch origin
git reset --hard origin/main
echo "✓ Code updated"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
npm install --silent
echo "✓ Dependencies installed"
echo ""

# Step 3: Build frontend
echo "🔨 Step 3: Building frontend..."
rm -rf dist
npm run build
echo "✓ Frontend built"
echo ""

# Step 4: Update Nginx config
echo "⚙️  Step 4: Updating Nginx configuration..."
sudo cp public/nginx-justachat.conf /etc/nginx/sites-available/justachat
echo "✓ Nginx config updated"
echo ""

# Step 5: Enable gzip compression
echo "🗜️  Step 5: Enabling gzip compression..."
NGINX_CONF="/etc/nginx/nginx.conf"
if grep -q "gzip on;" "$NGINX_CONF"; then
    echo "   Gzip already enabled, skipping..."
else
    sudo sed -i '/http {/a\
    # Gzip Compression\
    gzip on;\
    gzip_vary on;\
    gzip_proxied any;\
    gzip_comp_level 6;\
    gzip_min_length 1000;\
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;' "$NGINX_CONF"
    echo "✓ Gzip compression enabled"
fi
echo ""

# Step 6: Test and reload Nginx
echo "🔄 Step 6: Testing and reloading Nginx..."
sudo nginx -t
sudo systemctl reload nginx
echo "✓ Nginx reloaded"
echo ""

# Verification
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ DEPLOYMENT COMPLETE                          ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🔍 Verify these URLs:"
echo "   • https://justachat.net/sitemap.xml"
echo "   • https://justachat.net/about"
echo "   • https://justachat.net/features"
echo "   • https://justachat.net/faq"
echo ""
echo "🧪 Test SEO at:"
echo "   • https://search.google.com/test/rich-results"
echo "   • https://validator.schema.org/"
echo ""
