#!/bin/bash
# JustAChat VPS - Fix Frontend Environment to Use Self-Hosted Supabase
# Run: bash /var/www/justachat/public/vps-deploy/fix-frontend-env.sh

set -euo pipefail

PROJECT_DIR="/var/www/justachat"
DOCKER_ENV="$HOME/supabase/docker/.env"

echo "========================================"
echo "  FIX FRONTEND SUPABASE CONFIGURATION"
echo "========================================"
echo ""

# Step 1: Get the ANON_KEY from Docker env
echo "=== Reading ANON_KEY from Docker config ==="
if [[ ! -f "$DOCKER_ENV" ]]; then
  echo "ERROR: Docker .env not found at $DOCKER_ENV"
  exit 1
fi

ANON_KEY=$(grep "^ANON_KEY=" "$DOCKER_ENV" | cut -d'=' -f2- | tr -d '"' || true)
if [[ -z "$ANON_KEY" ]]; then
  echo "ERROR: ANON_KEY not found in $DOCKER_ENV"
  exit 1
fi
echo "✓ Found ANON_KEY: ${ANON_KEY:0:20}..."

# Step 2: Create the frontend .env file
echo ""
echo "=== Creating frontend .env for VPS ==="
cd "$PROJECT_DIR"

cat > .env << EOF
# VPS Frontend Configuration - Points to self-hosted Supabase
VITE_SUPABASE_URL=https://justachat.net
VITE_SUPABASE_PUBLISHABLE_KEY=$ANON_KEY
VITE_SUPABASE_PROJECT_ID=justachat-vps
EOF

echo "✓ Created $PROJECT_DIR/.env"
cat .env

# Step 3: Rebuild the frontend
echo ""
echo "=== Rebuilding frontend ==="
npm run build

echo ""
echo "========================================"
echo "✓ DONE! Frontend now uses self-hosted Supabase"
echo ""
echo "Test by visiting https://justachat.net"
echo "API calls should go to justachat.net, not supabase.co"
echo "========================================"
