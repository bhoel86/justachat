#!/bin/bash
# JustAChat VPS - Analytics / Kong DNS Health Check
# Run: sudo bash /var/www/justachat/public/vps-deploy/check-analytics-health.sh

set -euo pipefail

echo "========================================"
echo "  ANALYTICS / KONG DNS HEALTH CHECK"
echo "========================================"
echo ""

DOCKER_DIR="$HOME/supabase/docker"
if [ ! -d "$DOCKER_DIR" ]; then
  echo "ERROR: Supabase docker directory not found at: $DOCKER_DIR"
  echo "Expected to run as the supabase host user (e.g. unix)."
  exit 1
fi

cd "$DOCKER_DIR"

echo "=== 1) Compose services (quick view) ==="
sudo docker compose ps || true
echo ""

echo "=== 2) Containers matching analytics/logflare/kong ==="
sudo docker ps --format "table {{.Names}}\t{{.Status}}" | grep -iE "(kong|analytics|logflare)" || echo "(no matching containers found)"
echo ""

KONG_CONTAINER=$(sudo docker ps --format "{{.Names}}" | grep -E "supabase-?kong" | head -n 1 || true)
if [ -z "$KONG_CONTAINER" ]; then
  echo "ERROR: Kong container not found (expected name like 'supabase-kong')."
  exit 1
fi

echo "Using Kong container: $KONG_CONTAINER"
echo ""

echo "=== 3) Kong DNS config (/etc/resolv.conf) ==="
sudo docker exec "$KONG_CONTAINER" sh -lc 'echo "--- /etc/resolv.conf ---"; cat /etc/resolv.conf; echo "----------------------"' || true
echo ""

echo "=== 4) Kong can resolve 'analytics' (getent / nslookup) ==="
sudo docker exec "$KONG_CONTAINER" sh -lc 'command -v getent >/dev/null 2>&1 && (getent hosts analytics || true) || echo "getent not available"'
sudo docker exec "$KONG_CONTAINER" sh -lc 'command -v nslookup >/dev/null 2>&1 && (nslookup analytics || true) || echo "nslookup not available"'
echo ""

echo "=== 5) Kong recent DNS/analytics errors ==="
sudo docker logs "$KONG_CONTAINER" --tail 200 2>&1 | grep -iE "(dns|resolve|resolution failed|analytics)" | tail -40 || echo "(no recent matching log lines)"
echo ""

echo "=== 6) Local Kong /analytics endpoint (may require apikey) ==="
ANON_KEY=$(grep "^ANON_KEY=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"' || true)
if [ -z "$ANON_KEY" ]; then
  echo "WARN: Could not read ANON_KEY from $DOCKER_DIR/.env"
fi

echo -n "GET http://127.0.0.1:8000/analytics/v1/ (no key): "
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/analytics/v1/ || echo "FAILED"

if [ -n "$ANON_KEY" ]; then
  echo -n "GET http://127.0.0.1:8000/analytics/v1/ (with apikey): "
  curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/analytics/v1/ -H "apikey: $ANON_KEY" || echo "FAILED"
fi
echo ""

echo "=== 7) Docker network quick check ==="
NET=$(sudo docker inspect "$KONG_CONTAINER" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' 2>/dev/null || true)
echo "Kong networks: ${NET:-unknown}"
if [ -n "$NET" ]; then
  for n in $NET; do
    echo "-- network: $n (containers) --"
    sudo docker network inspect "$n" --format '{{range $id,$c := .Containers}}{{println $c.Name}}{{end}}' 2>/dev/null | sort || true
  done
fi

echo ""
echo "========================================"
echo "DONE. If 'analytics' does not resolve inside Kong, it's a Docker DNS/network issue."
echo "Next step I can give you: a safe restart script (kong + analytics) or a docker network rebuild script."
echo "========================================"
