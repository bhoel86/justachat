#!/bin/bash
# =============================================================================
# Fix VPS Email System for Password Reset
# Fixes: webhook binding, GoTrue hook config, service restart
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================"
echo -e "  FIX EMAIL SYSTEM FOR PASSWORD RESET"
echo -e "========================================${NC}"
echo ""

# =============================================================================
# Step 1: Fix webhook to listen on 0.0.0.0 instead of 127.0.0.1
# =============================================================================
echo -e "${YELLOW}[1/5] Fixing webhook server binding...${NC}"

WEBHOOK_DIR="/opt/justachat-email"
if [ -d "$WEBHOOK_DIR" ]; then
    # Check if server.js has the old binding
    if grep -q "127.0.0.1" "$WEBHOOK_DIR/server.js" 2>/dev/null; then
        # Fix the binding to 0.0.0.0
        sed -i "s/app.listen(PORT, '127.0.0.1'/app.listen(PORT, '0.0.0.0'/" "$WEBHOOK_DIR/server.js"
        echo -e "${GREEN}✓ Updated webhook to listen on 0.0.0.0:3001${NC}"
    else
        echo -e "${GREEN}✓ Webhook already configured for 0.0.0.0${NC}"
    fi
else
    echo -e "${RED}✗ Webhook directory not found at $WEBHOOK_DIR${NC}"
    exit 1
fi

# =============================================================================
# Step 2: Add GOTRUE email hook settings to Docker .env
# =============================================================================
echo -e "${YELLOW}[2/5] Configuring GoTrue email hook...${NC}"

DOCKER_ENV="$HOME/supabase/docker/.env"
if [ -f "$DOCKER_ENV" ]; then
    # Get Docker gateway IP
    GATEWAY_IP=$(docker network inspect supabase_default 2>/dev/null | grep -oP '"Gateway": "\K[^"]+' | head -1)
    if [ -z "$GATEWAY_IP" ]; then
        GATEWAY_IP="172.18.0.1"
        echo -e "${YELLOW}⚠ Could not detect gateway, using default: $GATEWAY_IP${NC}"
    fi
    
    # Check if email hook is already configured
    if grep -q "GOTRUE_HOOK_SEND_EMAIL_ENABLED" "$DOCKER_ENV"; then
        echo -e "${GREEN}✓ Email hook settings already exist${NC}"
    else
        echo "" >> "$DOCKER_ENV"
        echo "# Email Hook Configuration (added by fix script)" >> "$DOCKER_ENV"
        echo "GOTRUE_HOOK_SEND_EMAIL_ENABLED=true" >> "$DOCKER_ENV"
        echo "GOTRUE_HOOK_SEND_EMAIL_URI=http://${GATEWAY_IP}:3001/hook/email" >> "$DOCKER_ENV"
        echo -e "${GREEN}✓ Added email hook settings to Docker .env${NC}"
    fi
    
    # Show current settings
    echo -e "${BLUE}Current email settings:${NC}"
    grep -E "GOTRUE_HOOK_SEND_EMAIL|GOTRUE_MAILER" "$DOCKER_ENV" | head -5
else
    echo -e "${RED}✗ Docker .env not found at $DOCKER_ENV${NC}"
    exit 1
fi

# =============================================================================
# Step 3: Verify RESEND_API_KEY is configured
# =============================================================================
echo -e "${YELLOW}[3/5] Checking Resend API key...${NC}"

WEBHOOK_ENV="$WEBHOOK_DIR/.env"
if [ -f "$WEBHOOK_ENV" ]; then
    if grep -q "RESEND_API_KEY=re_" "$WEBHOOK_ENV"; then
        echo -e "${GREEN}✓ RESEND_API_KEY is configured${NC}"
    else
        echo -e "${RED}✗ RESEND_API_KEY not set or invalid${NC}"
        echo -e "${YELLOW}Please edit $WEBHOOK_ENV and add your Resend API key${NC}"
        echo -e "${YELLOW}Get one at: https://resend.com/api-keys${NC}"
    fi
else
    echo -e "${RED}✗ Webhook .env not found at $WEBHOOK_ENV${NC}"
fi

# =============================================================================
# Step 4: Restart email webhook service
# =============================================================================
echo -e "${YELLOW}[4/5] Restarting email webhook service...${NC}"

if systemctl is-active --quiet justachat-email 2>/dev/null; then
    systemctl restart justachat-email
    echo -e "${GREEN}✓ Restarted justachat-email service${NC}"
elif systemctl is-active --quiet jac-email-webhook 2>/dev/null; then
    systemctl restart jac-email-webhook
    echo -e "${GREEN}✓ Restarted jac-email-webhook service${NC}"
else
    # Try to start it
    if systemctl list-unit-files | grep -q "justachat-email"; then
        systemctl start justachat-email
        echo -e "${GREEN}✓ Started justachat-email service${NC}"
    else
        echo -e "${YELLOW}⚠ No email webhook systemd service found${NC}"
        echo -e "${YELLOW}Starting manually...${NC}"
        cd "$WEBHOOK_DIR" && node server.js &
        sleep 2
    fi
fi

# =============================================================================
# Step 5: Restart GoTrue auth container
# =============================================================================
echo -e "${YELLOW}[5/5] Restarting GoTrue auth container...${NC}"

cd ~/supabase/docker
docker compose up -d --force-recreate auth
echo -e "${GREEN}✓ Auth container restarted${NC}"

# =============================================================================
# Verify everything is working
# =============================================================================
echo ""
echo -e "${BLUE}========================================"
echo -e "  VERIFICATION"
echo -e "========================================${NC}"

sleep 3

# Check webhook is listening on 0.0.0.0
echo -e "${YELLOW}Checking webhook binding...${NC}"
if ss -tlnp | grep -q "0.0.0.0:3001"; then
    echo -e "${GREEN}✓ Webhook listening on 0.0.0.0:3001${NC}"
else
    echo -e "${YELLOW}⚠ Webhook may still be binding to 127.0.0.1${NC}"
    ss -tlnp | grep 3001
fi

# Test webhook endpoint
echo -e "${YELLOW}Testing webhook health endpoint...${NC}"
HEALTH=$(curl -s http://127.0.0.1:3001/health 2>/dev/null || echo "failed")
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✓ Webhook health check passed${NC}"
    echo "$HEALTH"
else
    echo -e "${YELLOW}⚠ Webhook health check: $HEALTH${NC}"
fi

# Test from Docker gateway
GATEWAY_IP=$(docker network inspect supabase_default 2>/dev/null | grep -oP '"Gateway": "\K[^"]+' | head -1)
if [ -n "$GATEWAY_IP" ]; then
    echo -e "${YELLOW}Testing from Docker gateway ($GATEWAY_IP)...${NC}"
    GATEWAY_TEST=$(curl -s "http://${GATEWAY_IP}:3001/health" 2>/dev/null || echo "failed")
    if echo "$GATEWAY_TEST" | grep -q "ok"; then
        echo -e "${GREEN}✓ Docker can reach webhook${NC}"
    else
        echo -e "${RED}✗ Docker cannot reach webhook: $GATEWAY_TEST${NC}"
    fi
fi

echo ""
echo -e "${GREEN}========================================"
echo -e "  EMAIL SYSTEM FIX COMPLETE"
echo -e "========================================${NC}"
echo ""
echo -e "${BLUE}Test password reset:${NC}"
echo "  1. Go to https://justachat.net/auth"
echo "  2. Click 'Forgot password'"
echo "  3. Enter your email"
echo "  4. Check inbox (and spam)"
echo ""
echo -e "${BLUE}If still not working, check logs:${NC}"
echo "  sudo journalctl -u justachat-email -f"
echo "  docker logs supabase-auth -f"
echo ""
