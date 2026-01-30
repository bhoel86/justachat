#!/bin/bash
#===============================================================================
# JUSTACHAT VPS - BOT SYSTEM DIAGNOSTIC
# Checks chat-bot edge function, OpenAI API key, and routing
#
# Usage: bash /var/www/justachat/public/vps-deploy/diagnose-bots.sh
#===============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SUPABASE_DIR="/home/unix/supabase/docker"
FUNCTIONS_DIR="$SUPABASE_DIR/volumes/functions"

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; FAILURES=$((FAILURES+1)); }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
info() { echo -e "${CYAN}→${NC} $1"; }

FAILURES=0

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           BOT SYSTEM DIAGNOSTIC                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

#-------------------------------------------------------------------------------
# 1. Check chat-bot function exists
#-------------------------------------------------------------------------------
echo "=== 1. Chat-Bot Function Files ==="

CHATBOT_DIR="$FUNCTIONS_DIR/chat-bot"
CHATBOT_INDEX="$CHATBOT_DIR/index.ts"

if [ -d "$CHATBOT_DIR" ]; then
  pass "chat-bot directory exists"
else
  fail "chat-bot directory NOT found at $CHATBOT_DIR"
fi

if [ -f "$CHATBOT_INDEX" ]; then
  pass "chat-bot/index.ts exists"
  
  # Check for OpenAI usage
  if grep -q "api.openai.com" "$CHATBOT_INDEX"; then
    pass "Function uses OpenAI API directly"
  elif grep -q "OPENAI_API_KEY" "$CHATBOT_INDEX"; then
    pass "Function references OPENAI_API_KEY"
  else
    warn "Function may not be using OpenAI - check implementation"
  fi
  
  # Check for Deno.serve pattern
  if grep -q "Deno.serve\|serve(" "$CHATBOT_INDEX"; then
    pass "Function has serve() handler"
  else
    fail "Function missing Deno.serve() - may not respond to requests"
  fi
else
  fail "chat-bot/index.ts NOT found"
fi

echo ""

#-------------------------------------------------------------------------------
# 2. Check OpenAI API key in functions .env
#-------------------------------------------------------------------------------
echo "=== 2. OpenAI API Key Configuration ==="

FUNC_ENV="$FUNCTIONS_DIR/.env"
if [ -f "$FUNC_ENV" ]; then
  pass "Functions .env exists"
  
  if grep -q "^OPENAI_API_KEY=" "$FUNC_ENV"; then
    OPENAI_VALUE=$(grep "^OPENAI_API_KEY=" "$FUNC_ENV" | cut -d= -f2-)
    if [ -n "$OPENAI_VALUE" ] && [ "$OPENAI_VALUE" != '""' ] && [ "$OPENAI_VALUE" != "''" ]; then
      # Check if it starts with sk-
      if [[ "$OPENAI_VALUE" == sk-* ]]; then
        pass "OPENAI_API_KEY is set and looks valid (sk-...)"
      else
        warn "OPENAI_API_KEY is set but doesn't start with 'sk-'"
      fi
    else
      fail "OPENAI_API_KEY is empty"
    fi
  else
    fail "OPENAI_API_KEY not found in functions .env"
  fi
else
  fail "Functions .env not found at $FUNC_ENV"
fi

echo ""

#-------------------------------------------------------------------------------
# 3. Check container environment
#-------------------------------------------------------------------------------
echo "=== 3. Container Environment ==="

if docker ps --format '{{.Names}}' | grep -q "^supabase-edge-functions$"; then
  pass "Edge functions container is running"
  
  # Check OPENAI_API_KEY in container
  OPENAI_CHECK=$(docker exec supabase-edge-functions printenv OPENAI_API_KEY 2>/dev/null || echo "")
  if [ -n "$OPENAI_CHECK" ]; then
    if [[ "$OPENAI_CHECK" == sk-* ]]; then
      pass "OPENAI_API_KEY loaded in container (sk-...${OPENAI_CHECK: -4})"
    else
      warn "OPENAI_API_KEY in container but format unexpected"
    fi
  else
    fail "OPENAI_API_KEY NOT loaded in container"
    info "Container may need restart: docker compose restart functions"
  fi
  
  # Check SUPABASE_URL
  SUPA_URL=$(docker exec supabase-edge-functions printenv SUPABASE_URL 2>/dev/null || echo "")
  if [ -n "$SUPA_URL" ]; then
    pass "SUPABASE_URL: $SUPA_URL"
  else
    fail "SUPABASE_URL not set in container"
  fi
else
  fail "Edge functions container NOT running"
fi

echo ""

#-------------------------------------------------------------------------------
# 4. Check main router
#-------------------------------------------------------------------------------
echo "=== 4. Main Router Configuration ==="

MAIN_INDEX="$FUNCTIONS_DIR/main/index.ts"
if [ -f "$MAIN_INDEX" ]; then
  pass "main/index.ts exists"
  
  if grep -q "import(" "$MAIN_INDEX"; then
    pass "Router uses dynamic imports"
  else
    fail "Router missing dynamic imports - won't dispatch to chat-bot"
  fi
else
  fail "main/index.ts NOT found - edge functions won't route properly"
fi

echo ""

#-------------------------------------------------------------------------------
# 5. Test chat-bot function directly
#-------------------------------------------------------------------------------
echo "=== 5. Direct Function Test (Port 9000) ==="

TEST_PAYLOAD='{"botId":"user-nova","channelName":"#Lobby","recentMessages":[{"username":"TestUser","content":"Hello bot!"}]}'

DIRECT_RESPONSE=$(curl -s -X POST "http://127.0.0.1:9000/chat-bot" \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD" \
  --max-time 30 2>/dev/null || echo "CURL_FAILED")

if [ "$DIRECT_RESPONSE" = "CURL_FAILED" ]; then
  fail "Could not connect to edge runtime on port 9000"
elif echo "$DIRECT_RESPONSE" | grep -q '"healthy"'; then
  fail "Router returned health check instead of dispatching to chat-bot"
  info "The main/index.ts router is not working correctly"
elif echo "$DIRECT_RESPONSE" | grep -q '"error"'; then
  warn "Function returned an error"
  info "Response: $DIRECT_RESPONSE"
  
  # Check for specific errors
  if echo "$DIRECT_RESPONSE" | grep -q "OPENAI_API_KEY"; then
    fail "OpenAI API key issue detected"
  fi
  if echo "$DIRECT_RESPONSE" | grep -q "Function not found"; then
    fail "chat-bot function not found by router"
  fi
elif echo "$DIRECT_RESPONSE" | grep -q '"response"'; then
  pass "chat-bot function responded successfully!"
  info "Response preview: ${DIRECT_RESPONSE:0:200}..."
else
  warn "Unexpected response from chat-bot"
  info "Response: ${DIRECT_RESPONSE:0:500}"
fi

echo ""

#-------------------------------------------------------------------------------
# 6. Test through Kong gateway
#-------------------------------------------------------------------------------
echo "=== 6. Kong Gateway Test (Port 8000) ==="

if [ -f "$SUPABASE_DIR/.env" ]; then
  ANON_KEY=$(grep '^ANON_KEY=' "$SUPABASE_DIR/.env" | cut -d= -f2- | tr -d '"' | tr -d "'")
  
  if [ -n "$ANON_KEY" ]; then
    KONG_RESPONSE=$(curl -s -X POST "http://127.0.0.1:8000/functions/v1/chat-bot" \
      -H "Content-Type: application/json" \
      -H "apikey: $ANON_KEY" \
      -H "Authorization: Bearer $ANON_KEY" \
      -d "$TEST_PAYLOAD" \
      --max-time 30 2>/dev/null || echo "CURL_FAILED")
    
    if [ "$KONG_RESPONSE" = "CURL_FAILED" ]; then
      fail "Could not connect to Kong gateway"
    elif echo "$KONG_RESPONSE" | grep -q '"response"'; then
      pass "Kong gateway routing to chat-bot works!"
    elif echo "$KONG_RESPONSE" | grep -q '"error"'; then
      warn "Function returned error via Kong"
      info "Response: ${KONG_RESPONSE:0:300}"
    else
      warn "Unexpected response via Kong"
      info "Response: ${KONG_RESPONSE:0:300}"
    fi
  else
    fail "ANON_KEY not found"
  fi
else
  fail "Backend .env not found"
fi

echo ""

#-------------------------------------------------------------------------------
# 7. Check recent container logs
#-------------------------------------------------------------------------------
echo "=== 7. Recent Edge Function Logs ==="

echo "Last 10 log lines from supabase-edge-functions:"
docker logs supabase-edge-functions --tail 10 2>&1 | head -15

echo ""

#-------------------------------------------------------------------------------
# Summary
#-------------------------------------------------------------------------------
echo "╔══════════════════════════════════════════════════════════════╗"
if [ $FAILURES -eq 0 ]; then
  echo -e "║  ${GREEN}ALL CHECKS PASSED${NC}                                          ║"
else
  echo -e "║  ${RED}$FAILURES CHECK(S) FAILED${NC}                                          ║"
fi
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ $FAILURES -gt 0 ]; then
  echo "Common fixes:"
  echo ""
  echo "1. If OPENAI_API_KEY missing from container:"
  echo "   Add to ~/supabase/docker/volumes/functions/.env:"
  echo "   OPENAI_API_KEY=sk-your-key-here"
  echo "   Then: cd ~/supabase/docker && docker compose restart functions"
  echo ""
  echo "2. If router not dispatching:"
  echo "   Re-sync functions from repo:"
  echo "   cp -r /var/www/justachat/supabase/functions/* ~/supabase/docker/volumes/functions/"
  echo "   sudo chown -R 1000:1000 ~/supabase/docker/volumes/functions"
  echo "   docker compose restart functions"
  echo ""
  echo "3. If chat-bot missing:"
  echo "   git pull in /var/www/justachat then re-sync functions"
  echo ""
  exit 1
fi

exit 0
