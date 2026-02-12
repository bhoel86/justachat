#!/bin/bash
# ╔═ JustAChat™ — Login Freeze Diagnostic ═╗
# Run: sudo bash /var/www/justachat/public/vps-deploy/diagnose-login-freeze.sh

echo "========================================"
echo "  LOGIN FREEZE DIAGNOSTIC"
echo "  $(date)"
echo "========================================"
echo ""

cd ~/supabase/docker 2>/dev/null || { echo "ERROR: ~/supabase/docker not found"; exit 1; }

echo "=== 1. CONTAINER STATUS ==="
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "supabase|edge" | sort
DEAD=$(docker ps -a --filter "status=exited" --format "{{.Names}}" | grep supabase)
if [ -n "$DEAD" ]; then
  echo ""
  echo "⚠️  STOPPED CONTAINERS:"
  echo "$DEAD"
else
  echo "✓ All Supabase containers running"
fi
echo ""

echo "=== 2. AUTH SERVICE HEALTH ==="
AUTH_HEALTH=$(curl -s -m 5 http://127.0.0.1:8000/auth/v1/health -H "apikey: $(grep '^ANON_KEY=' .env | cut -d'=' -f2 | tr -d '\"')" 2>&1)
echo "Via Kong (8000): $AUTH_HEALTH"

AUTH_DIRECT=$(curl -s -m 5 http://127.0.0.1:9999/health 2>&1)
echo "Direct GoTrue (9999): $AUTH_DIRECT"

# Test token endpoint (this is what login hits)
echo ""
echo "=== 3. TOKEN ENDPOINT TEST (login path) ==="
TOKEN_RESULT=$(curl -s -m 10 -o /dev/null -w "HTTP %{http_code} in %{time_total}s" \
  -X POST http://127.0.0.1:8000/auth/v1/token?grant_type=password \
  -H "apikey: $(grep '^ANON_KEY=' .env | cut -d'=' -f2 | tr -d '\"')" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' 2>&1)
echo "Token endpoint: $TOKEN_RESULT"
if echo "$TOKEN_RESULT" | grep -q "time_total"; then
  TIME=$(echo "$TOKEN_RESULT" | grep -oP '[\d.]+s$')
  echo "(Response time: $TIME — if >5s, auth is hanging)"
fi
echo ""

echo "=== 4. KONG GATEWAY RESPONSIVENESS ==="
KONG_TIME=$(curl -s -m 5 -o /dev/null -w "%{time_total}" http://127.0.0.1:8000/ 2>&1)
echo "Kong response time: ${KONG_TIME}s"
if (( $(echo "$KONG_TIME > 3" | bc -l 2>/dev/null || echo 0) )); then
  echo "⚠️  Kong is SLOW — may be the bottleneck"
fi
echo ""

echo "=== 5. AUTH CONTAINER LOGS (last 30 lines) ==="
docker logs supabase-auth --tail 30 2>&1 | grep -iE "error|fail|panic|timeout|refused|denied|crash|OOM" | tail -10
AUTH_ERRORS=$(docker logs supabase-auth --tail 100 2>&1 | grep -ciE "error|fail|panic")
echo "Error count in last 100 lines: $AUTH_ERRORS"
echo ""

echo "=== 6. KONG LOGS (auth-related) ==="
docker logs supabase-kong --tail 50 2>&1 | grep -iE "auth|error|timeout|502|503|504" | tail -10
echo ""

echo "=== 7. RESOURCE CHECK ==="
echo "--- Memory ---"
free -h | head -2
echo ""
echo "--- Disk ---"
df -h / | tail -1
echo ""
echo "--- Docker memory per container ---"
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}" | grep supabase | sort
echo ""

echo "=== 8. JWT KEY SYNC CHECK ==="
ANON_KEY=$(grep "^ANON_KEY=" .env | cut -d'=' -f2 | tr -d '"')
KONG_ANON=$(grep -A2 "consumers:" volumes/api/kong.yml 2>/dev/null | grep -oP 'key:\s*\K.*' | head -1 || echo "N/A")

echo "ANON_KEY length: ${#ANON_KEY}"
if [[ "$ANON_KEY" == ey* ]]; then
  echo "✓ ANON_KEY is valid JWT format"
else
  echo "✗ ANON_KEY is NOT a JWT — LOGIN WILL FAIL"
fi

# Check if frontend .env matches
if [ -f /var/www/justachat/.env ]; then
  FE_KEY=$(grep "VITE_SUPABASE_PUBLISHABLE_KEY\|VITE_SUPABASE_ANON_KEY" /var/www/justachat/.env | cut -d'=' -f2 | head -1 | tr -d '"')
  if [ "$FE_KEY" = "$ANON_KEY" ]; then
    echo "✓ Frontend key matches backend ANON_KEY"
  else
    echo "✗ FRONTEND KEY MISMATCH — this causes login freeze!"
    echo "  Frontend: ${FE_KEY:0:20}..."
    echo "  Backend:  ${ANON_KEY:0:20}..."
  fi
fi
echo ""

echo "=== 9. OPEN AUTH ROUTES IN KONG ==="
if [ -f volumes/api/kong.yml ]; then
  echo "Checking kong.yml for open auth routes..."
  grep -A5 "auth.*open\|/token\|/signup\|/health" volumes/api/kong.yml 2>/dev/null | head -20
  
  HAS_TOKEN_OPEN=$(grep -c "token" volumes/api/kong.yml 2>/dev/null)
  if [ "$HAS_TOKEN_OPEN" -gt 0 ]; then
    echo "✓ Token route found in kong.yml"
  else
    echo "⚠️  /token route may not be configured as open — login requests need API key bypass"
  fi
else
  echo "⚠️  kong.yml not found at volumes/api/kong.yml"
fi
echo ""

echo "=== 10. SITE URL & REDIRECT CONFIG ==="
grep -E "GOTRUE_SITE_URL|API_EXTERNAL_URL|GOTRUE_URI_ALLOW" .env | head -5
echo ""

echo "=== 11. NGINX UPSTREAM CHECK ==="
echo -n "Nginx status: "
systemctl is-active nginx 2>/dev/null || echo "unknown"
echo -n "Nginx test: "
nginx -t 2>&1 | tail -1
echo ""

echo "=== 12. DATABASE CONNECTION TEST ==="
DB_TEST=$(docker exec supabase-db psql -U supabase_admin -d postgres -c "SELECT count(*) FROM auth.users;" -t 2>&1)
echo "Total auth users: $(echo $DB_TEST | tr -d ' ')"
DB_SESSIONS=$(docker exec supabase-db psql -U supabase_admin -d postgres -c "SELECT count(*) FROM auth.sessions WHERE NOT (factor_id IS NOT NULL);" -t 2>&1)
echo "Active sessions: $(echo $DB_SESSIONS | tr -d ' ')"
echo ""

echo "========================================"
echo "  DIAGNOSIS SUMMARY"
echo "========================================"
echo ""
echo "If login freezes, the most common causes are:"
echo "1. Kong not forwarding /auth/v1/token (check section 3 & 9)"
echo "2. Frontend ANON_KEY mismatch (check section 8)"
echo "3. Auth container crashed or OOM (check section 1 & 5)"
echo "4. Server out of memory (check section 7)"
echo "5. GoTrue SITE_URL misconfigured (check section 10)"
echo ""
echo "Quick fix attempt:"
echo "  cd ~/supabase/docker && docker restart supabase-auth supabase-kong"
echo ""
echo "Full restart:"
echo "  cd ~/supabase/docker && docker compose down && docker compose up -d"
echo "========================================"
