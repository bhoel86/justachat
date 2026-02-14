#!/bin/bash
# JAC IRC Gateway Diagnostic Script
# Run: sudo bash /var/www/justachat/public/vps-deploy/diagnose-irc-gateway.sh

echo "============================================"
echo "  JAC IRC Gateway Diagnostic"
echo "  $(date)"
echo "============================================"
echo ""

DOCKER_DIR="/home/unix/supabase/docker"
cd "$DOCKER_DIR" 2>/dev/null || { echo "ERROR: $DOCKER_DIR not found"; exit 1; }

# 1. Check if port 6667 is listening
echo "=== 1. Port 6667 (IRC) Check ==="
if ss -tlnp | grep -q ':6667'; then
  echo "✓ Port 6667 is OPEN"
  ss -tlnp | grep ':6667'
else
  echo "✗ Port 6667 is NOT listening!"
fi

echo ""
echo "=== 2. Port 6697 (IRC SSL) Check ==="
if ss -tlnp | grep -q ':6697'; then
  echo "✓ Port 6697 (SSL) is OPEN"
  ss -tlnp | grep ':6697'
else
  echo "- Port 6697 (SSL) is NOT listening (optional)"
fi

echo ""
echo "=== 3. Nginx IRC Stream Config ==="
if sudo grep -rq 'stream' /etc/nginx/nginx.conf 2>/dev/null; then
  echo "✓ Nginx has stream block (TCP proxy)"
  sudo grep -A 20 'stream' /etc/nginx/nginx.conf | head -25
elif [ -f /etc/nginx/stream.d/irc.conf ]; then
  echo "✓ Nginx stream config found at /etc/nginx/stream.d/irc.conf"
  sudo cat /etc/nginx/stream.d/irc.conf
else
  echo "✗ No Nginx stream/TCP proxy config found for IRC"
fi

echo ""
echo "=== 4. Edge Function Container ==="
FUNC_STATUS=$(sudo docker ps --format "{{.Names}}\t{{.Status}}" | grep -i "functions")
if [ -n "$FUNC_STATUS" ]; then
  echo "✓ Functions container: $FUNC_STATUS"
else
  echo "✗ Functions container NOT running!"
fi

echo ""
echo "=== 5. IRC Gateway Function Exists ==="
FUNC_DIR="$DOCKER_DIR/volumes/functions/main"
if sudo test -f "$FUNC_DIR/irc-gateway/index.ts"; then
  echo "✓ irc-gateway/index.ts found in functions volume"
  echo "  Size: $(sudo wc -c < "$FUNC_DIR/irc-gateway/index.ts") bytes"
else
  echo "✗ irc-gateway/index.ts NOT found at $FUNC_DIR"
  echo "  Checking alternative locations..."
  sudo find /home/unix/supabase -name "irc-gateway" -type d 2>/dev/null
fi

echo ""
echo "=== 6. Test IRC Gateway via HTTP (Edge Function) ==="
ANON_KEY=$(sudo grep "^ANON_KEY=" .env 2>/dev/null | cut -d'=' -f2 | tr -d '"')
if [ -z "$ANON_KEY" ]; then
  echo "✗ Could not read ANON_KEY from .env"
else
  echo "Testing edge function endpoint..."
  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "apikey: $ANON_KEY" \
    -d '{"command":"PING","args":"test"}' \
    "http://127.0.0.1:8000/functions/v1/irc-gateway" 2>&1)
  
  HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")
  
  echo "  HTTP Status: $HTTP_CODE"
  echo "  Response: $BODY"
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✓ IRC Gateway edge function is responding"
  elif [ "$HTTP_CODE" = "401" ]; then
    echo "  ✗ 401 Unauthorized - ANON_KEY may be wrong"
  elif [ "$HTTP_CODE" = "404" ]; then
    echo "  ✗ 404 Not Found - function not deployed"
  elif [ "$HTTP_CODE" = "500" ]; then
    echo "  ✗ 500 Server Error - check function logs"
  fi
fi

echo ""
echo "=== 7. Test Auth (Simulated IRC Login) ==="
if [ -z "$ANON_KEY" ]; then
  echo "Skipped - no ANON_KEY"
else
  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "apikey: $ANON_KEY" \
    -d '{"command":"PASS","args":"test@test.com;testpassword123"}' \
    "http://127.0.0.1:8000/functions/v1/irc-gateway" 2>&1)
  
  HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")
  
  echo "  HTTP Status: $HTTP_CODE"
  echo "  Response: $BODY"
fi

echo ""
echo "=== 8. GoTrue Auth Health ==="
AUTH_HEALTH=$(curl -s http://127.0.0.1:8000/auth/v1/health 2>/dev/null)
echo "Auth health: $AUTH_HEALTH"

echo ""
echo "=== 9. Recent IRC-Related Function Logs ==="
sudo docker logs supabase-functions --tail 200 2>&1 | grep -iE "irc|gateway|PASS|NICK|USER|auth.*email" | tail -30

echo ""
echo "=== 10. Raw TCP Connection Test ==="
echo "Attempting raw TCP connection to localhost:6667..."
RESULT=$(echo -e "PASS test@test.com;test123\r\nNICK TestBot\r\nUSER TestBot 0 * :Test\r\nQUIT\r\n" | timeout 5 nc -q 3 127.0.0.1 6667 2>&1)
if [ $? -eq 0 ] && [ -n "$RESULT" ]; then
  echo "✓ Got response from port 6667:"
  echo "$RESULT" | head -20
else
  echo "✗ No response from port 6667"
fi

echo ""
echo "=== 11. Firewall Check ==="
if command -v ufw &>/dev/null; then
  UFW_STATUS=$(sudo ufw status 2>/dev/null | grep -E "6667|6697")
  if [ -n "$UFW_STATUS" ]; then
    echo "Firewall rules for IRC ports:"
    echo "$UFW_STATUS"
  else
    echo "✗ No firewall rules found for ports 6667/6697"
    echo "  Run: sudo ufw allow 6667/tcp && sudo ufw allow 6697/tcp"
  fi
else
  sudo iptables -L -n 2>/dev/null | grep -E "6667|6697" || echo "No iptables rules for IRC ports"
fi

echo ""
echo "============================================"
echo "  DIAGNOSIS COMPLETE"
echo "============================================"
