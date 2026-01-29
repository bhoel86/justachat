#!/bin/bash
# =============================================================================
# FORCE FIX VPS EMAIL SYSTEM
# Run as root: sudo bash /var/www/justachat/public/vps-deploy/force-fix-email.sh
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  FORCE FIX VPS EMAIL SYSTEM${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Must run as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root: sudo bash $0${NC}"
    exit 1
fi

# Find unix user home
UNIX_HOME="/home/unix"
DOCKER_ENV="${UNIX_HOME}/supabase/docker/.env"
WEBHOOK_DIR="/opt/justachat-email"

# =============================================================================
# STEP 1: Detect Docker Gateway IP (multiple methods)
# =============================================================================
echo -e "${YELLOW}[1/7] Detecting Docker gateway IP...${NC}"

# Method 1: docker network inspect
GATEWAY_IP=$(docker network inspect supabase_default 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['IPAM']['Config'][0]['Gateway'])" 2>/dev/null)

# Method 2: docker network inspect with grep
if [ -z "$GATEWAY_IP" ]; then
    GATEWAY_IP=$(docker network inspect supabase_default 2>/dev/null | grep -A5 '"IPAM"' | grep '"Gateway"' | sed 's/.*"Gateway": "\([^"]*\)".*/\1/')
fi

# Method 3: ip route
if [ -z "$GATEWAY_IP" ]; then
    GATEWAY_IP=$(ip route | grep docker0 | awk '{print $NF}' | head -1)
fi

# Method 4: Check what IP Docker containers use for host
if [ -z "$GATEWAY_IP" ]; then
    GATEWAY_IP=$(docker exec supabase-auth ip route 2>/dev/null | grep default | awk '{print $3}')
fi

# Fallback
if [ -z "$GATEWAY_IP" ]; then
    GATEWAY_IP="172.18.0.1"
    echo -e "${YELLOW}⚠ Using fallback gateway: $GATEWAY_IP${NC}"
else
    echo -e "${GREEN}✓ Detected gateway: $GATEWAY_IP${NC}"
fi

# Also try to get subnet
SUBNET=$(docker network inspect supabase_default 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['IPAM']['Config'][0]['Subnet'])" 2>/dev/null)
if [ -z "$SUBNET" ]; then
    SUBNET="172.18.0.0/16"
fi
echo -e "${GREEN}✓ Subnet: $SUBNET${NC}"
echo ""

# =============================================================================
# STEP 2: Fix webhook server binding
# =============================================================================
echo -e "${YELLOW}[2/7] Fixing webhook server binding...${NC}"

if [ -f "${WEBHOOK_DIR}/server.js" ]; then
    # Replace any localhost or 127.0.0.1 with 0.0.0.0
    sed -i "s/listen(PORT, '127.0.0.1'/listen(PORT, '0.0.0.0'/g" "${WEBHOOK_DIR}/server.js"
    sed -i "s/listen(PORT, 'localhost'/listen(PORT, '0.0.0.0'/g" "${WEBHOOK_DIR}/server.js"
    sed -i 's/listen(3001, "127.0.0.1"/listen(3001, "0.0.0.0"/g' "${WEBHOOK_DIR}/server.js"
    echo -e "${GREEN}✓ Updated server.js to bind 0.0.0.0${NC}"
else
    echo -e "${RED}✗ ${WEBHOOK_DIR}/server.js not found${NC}"
fi
echo ""

# =============================================================================
# STEP 3: Update GoTrue config in Docker .env
# =============================================================================
echo -e "${YELLOW}[3/7] Updating GoTrue email hook config...${NC}"

if [ -f "$DOCKER_ENV" ]; then
    # Remove old hook settings
    sed -i '/GOTRUE_HOOK_SEND_EMAIL_ENABLED/d' "$DOCKER_ENV"
    sed -i '/GOTRUE_HOOK_SEND_EMAIL_URI/d' "$DOCKER_ENV"
    sed -i '/GOTRUE_HOOK_CUSTOM_EMAIL/d' "$DOCKER_ENV"
    
    # Add correct settings
    echo "" >> "$DOCKER_ENV"
    echo "# Email Hook Config (fixed $(date))" >> "$DOCKER_ENV"
    echo "GOTRUE_HOOK_SEND_EMAIL_ENABLED=true" >> "$DOCKER_ENV"
    echo "GOTRUE_HOOK_SEND_EMAIL_URI=http://${GATEWAY_IP}:3001/hook/email" >> "$DOCKER_ENV"
    
    echo -e "${GREEN}✓ Updated: GOTRUE_HOOK_SEND_EMAIL_ENABLED=true${NC}"
    echo -e "${GREEN}✓ Updated: GOTRUE_HOOK_SEND_EMAIL_URI=http://${GATEWAY_IP}:3001/hook/email${NC}"
else
    echo -e "${RED}✗ Docker .env not found at $DOCKER_ENV${NC}"
    exit 1
fi
echo ""

# =============================================================================
# STEP 4: Add UFW rules for Docker access to port 3001
# =============================================================================
echo -e "${YELLOW}[4/7] Adding UFW firewall rules...${NC}"

# Allow from Docker subnet
ufw allow from "$SUBNET" to any port 3001 proto tcp 2>/dev/null && \
    echo -e "${GREEN}✓ Added UFW rule: allow from $SUBNET to port 3001${NC}" || \
    echo -e "${YELLOW}⚠ UFW rule may already exist${NC}"

# Also allow from docker0 interface
ufw allow in on docker0 to any port 3001 2>/dev/null || true

# Allow from 172.x.x.x range (common Docker range)
ufw allow from 172.16.0.0/12 to any port 3001 proto tcp 2>/dev/null || true

echo ""

# =============================================================================
# STEP 5: Restart webhook service
# =============================================================================
echo -e "${YELLOW}[5/7] Restarting email webhook service...${NC}"

if systemctl is-enabled justachat-email 2>/dev/null; then
    systemctl restart justachat-email
    echo -e "${GREEN}✓ Restarted justachat-email${NC}"
elif systemctl is-enabled jac-email-webhook 2>/dev/null; then
    systemctl restart jac-email-webhook  
    echo -e "${GREEN}✓ Restarted jac-email-webhook${NC}"
else
    echo -e "${YELLOW}⚠ No systemd email service found${NC}"
    # Try to kill and restart manually
    pkill -f "node.*server.js.*3001" 2>/dev/null || true
    cd "${WEBHOOK_DIR}" && nohup node server.js > /tmp/email-webhook.log 2>&1 &
    echo -e "${GREEN}✓ Started webhook manually${NC}"
fi

sleep 2
echo ""

# =============================================================================
# STEP 6: Restart auth container
# =============================================================================
echo -e "${YELLOW}[6/7] Restarting Supabase auth container...${NC}"

cd "${UNIX_HOME}/supabase/docker"
docker compose up -d --force-recreate auth 2>&1 | grep -v "WARN" || docker compose up -d auth
echo -e "${GREEN}✓ Auth container restarted${NC}"

sleep 3
echo ""

# =============================================================================
# STEP 7: Verify everything works
# =============================================================================
echo -e "${YELLOW}[7/7] Verifying configuration...${NC}"
echo ""

# Check webhook binding
echo -n "Webhook binding: "
BINDING=$(ss -tlnp | grep ":3001" | awk '{print $4}' | head -1)
if echo "$BINDING" | grep -q "0.0.0.0:3001"; then
    echo -e "${GREEN}0.0.0.0:3001 ✓${NC}"
else
    echo -e "${YELLOW}$BINDING${NC}"
fi

# Test health from localhost
echo -n "Localhost health: "
LOCAL_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/health 2>/dev/null || echo "FAIL")
if [ "$LOCAL_HEALTH" = "200" ]; then
    echo -e "${GREEN}HTTP 200 ✓${NC}"
else
    echo -e "${RED}HTTP $LOCAL_HEALTH${NC}"
fi

# Test health from gateway
echo -n "Gateway health ($GATEWAY_IP): "
GW_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "http://${GATEWAY_IP}:3001/health" --connect-timeout 3 2>/dev/null || echo "FAIL")
if [ "$GW_HEALTH" = "200" ]; then
    echo -e "${GREEN}HTTP 200 ✓${NC}"
else
    echo -e "${RED}HTTP $GW_HEALTH${NC}"
fi

# Check auth container env
echo -n "Auth container GOTRUE_HOOK_SEND_EMAIL_ENABLED: "
AUTH_ENABLED=$(docker exec supabase-auth printenv GOTRUE_HOOK_SEND_EMAIL_ENABLED 2>/dev/null || echo "NOT_SET")
if [ "$AUTH_ENABLED" = "true" ]; then
    echo -e "${GREEN}true ✓${NC}"
else
    echo -e "${RED}$AUTH_ENABLED${NC}"
fi

echo -n "Auth container GOTRUE_HOOK_SEND_EMAIL_URI: "
AUTH_URI=$(docker exec supabase-auth printenv GOTRUE_HOOK_SEND_EMAIL_URI 2>/dev/null || echo "NOT_SET")
EXPECTED="http://${GATEWAY_IP}:3001/hook/email"
if [ "$AUTH_URI" = "$EXPECTED" ]; then
    echo -e "${GREEN}$AUTH_URI ✓${NC}"
else
    echo -e "${RED}$AUTH_URI${NC}"
    echo -e "${YELLOW}Expected: $EXPECTED${NC}"
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  DONE - TEST PASSWORD RESET NOW${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Go to: https://justachat.net/auth"
echo "Click 'Forgot password' and enter your email"
echo ""
echo "If still not working, check these logs:"
echo "  sudo journalctl -u justachat-email -f"
echo "  docker logs supabase-auth -f 2>&1 | grep -iE 'hook|email'"
echo ""
