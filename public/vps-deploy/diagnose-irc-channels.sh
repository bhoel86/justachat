#!/bin/bash
# ============================================
# JustAChat IRC Channel Diagnostics
# Tests channel visibility, RLS, edge functions
# ============================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  JUSTACHAT IRC CHANNEL DIAGNOSTICS                          ║"
echo "║  $(date '+%Y-%m-%d %H:%M:%S')                                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Load env
if [ -f /root/supabase/docker/.env ]; then
  source /root/supabase/docker/.env 2>/dev/null
fi

ANON_KEY="${ANON_KEY:-$SUPABASE_ANON_KEY}"
SERVICE_KEY="${SERVICE_ROLE_KEY:-$SUPABASE_SERVICE_ROLE_KEY}"
API_URL="http://localhost:8000"

echo "═══ 1. Docker Container Health ═══"
echo ""
for c in supabase-kong supabase-rest supabase-auth supabase-db supabase-edge-functions supabase-realtime; do
  STATUS=$(sudo docker inspect --format='{{.State.Status}} ({{.State.Health.Status}})' "$c" 2>/dev/null || echo "NOT FOUND")
  if echo "$STATUS" | grep -q "running"; then
    echo "  [✓] $c: $STATUS"
  else
    echo "  [✗] $c: $STATUS"
  fi
done

echo ""
echo "═══ 2. Kong API Gateway Test ═══"
echo ""
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/rest/v1/" 2>/dev/null)
echo "  REST API (no auth): HTTP $HTTP_CODE"
if [ "$HTTP_CODE" = "401" ]; then
  echo "  [✓] Kong is running (401 = auth required, expected)"
elif [ "$HTTP_CODE" = "000" ]; then
  echo "  [✗] Kong not responding! Connection refused."
  echo "  FIX: sudo docker restart supabase-kong"
else
  echo "  [?] Unexpected response: $HTTP_CODE"
fi

echo ""
echo "═══ 3. Direct Database Channel Check ═══"
echo ""
echo "  Channels in database:"
sudo docker exec supabase-db psql -U postgres -t -c "SELECT name, is_hidden, is_private FROM public.channels ORDER BY name;" 2>/dev/null
CHANNEL_COUNT=$(sudo docker exec supabase-db psql -U postgres -t -c "SELECT COUNT(*) FROM public.channels WHERE is_hidden = false AND is_private = false;" 2>/dev/null | tr -d ' ')
echo ""
echo "  Public visible channels: $CHANNEL_COUNT"

echo ""
echo "═══ 4. channels_public View Check ═══"
echo ""
VIEW_EXISTS=$(sudo docker exec supabase-db psql -U postgres -t -c "SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'channels_public' AND table_schema = 'public';" 2>/dev/null | tr -d ' ')
if [ "$VIEW_EXISTS" = "1" ]; then
  echo "  [✓] channels_public view EXISTS"
  echo ""
  echo "  View contents:"
  sudo docker exec supabase-db psql -U postgres -t -c "SELECT name FROM public.channels_public WHERE is_hidden = false AND is_private = false ORDER BY name;" 2>/dev/null
else
  echo "  [✗] channels_public view MISSING!"
  echo "  FIX: Run this SQL:"
  echo "    CREATE OR REPLACE VIEW public.channels_public"
  echo "    WITH (security_invoker=on) AS"
  echo "    SELECT id, name, description, is_private, is_hidden, created_at, created_by,"
  echo "           bg_color, name_color, name_gradient_from, name_gradient_to"
  echo "    FROM public.channels;"
fi

echo ""
echo "═══ 5. RLS Policies on channels table ═══"
echo ""
sudo docker exec supabase-db psql -U postgres -c "SELECT policyname, permissive, cmd, roles FROM pg_policies WHERE tablename = 'channels';" 2>/dev/null

echo ""
echo "═══ 6. PostgREST API Channel Fetch (anon key) ═══"
echo ""
if [ -n "$ANON_KEY" ]; then
  RESPONSE=$(curl -s "$API_URL/rest/v1/channels_public?select=name&is_hidden=eq.false&is_private=eq.false&order=name" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $ANON_KEY" 2>/dev/null)
  
  CHAN_COUNT=$(echo "$RESPONSE" | grep -o '"name"' | wc -l)
  echo "  Channels returned via API: $CHAN_COUNT"
  
  if [ "$CHAN_COUNT" -gt 0 ]; then
    echo "  [✓] API returns channels successfully"
    echo "  Sample: $(echo "$RESPONSE" | head -c 200)"
  else
    echo "  [✗] API returns NO channels!"
    echo "  Response: $(echo "$RESPONSE" | head -c 300)"
    echo ""
    echo "  Trying direct channels table..."
    RESPONSE2=$(curl -s "$API_URL/rest/v1/channels?select=name&is_hidden=eq.false&is_private=eq.false&order=name" \
      -H "apikey: $ANON_KEY" \
      -H "Authorization: Bearer $ANON_KEY" 2>/dev/null)
    CHAN_COUNT2=$(echo "$RESPONSE2" | grep -o '"name"' | wc -l)
    echo "  Direct channels table returned: $CHAN_COUNT2"
    echo "  Response: $(echo "$RESPONSE2" | head -c 300)"
  fi
else
  echo "  [✗] No ANON_KEY found! Cannot test API."
  echo "  Check /root/supabase/docker/.env"
fi

echo ""
echo "═══ 7. Edge Functions Container ═══"
echo ""
EF_STATUS=$(sudo docker inspect --format='{{.State.Status}}' supabase-edge-functions 2>/dev/null || echo "NOT FOUND")
echo "  Container status: $EF_STATUS"

if [ "$EF_STATUS" = "running" ]; then
  echo ""
  echo "  Testing irc-gateway edge function..."
  IRC_RESPONSE=$(curl -s -X POST "$API_URL/functions/v1/irc-gateway" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"command":"PING","args":"test"}' 2>/dev/null)
  echo "  IRC gateway response: $(echo "$IRC_RESPONSE" | head -c 300)"
else
  echo "  [✗] Edge functions container not running!"
  echo "  FIX: cd /root/supabase/docker && docker compose up -d functions"
fi

echo ""
echo "═══ 8. IRC Bridge Status ═══"
echo ""
PM2_STATUS=$(pm2 list 2>/dev/null | grep -i "irc\|bridge" || echo "PM2 not available or no bridge process")
echo "  $PM2_STATUS"
echo ""
BRIDGE_LISTEN=$(ss -tlnp 2>/dev/null | grep ":6667" || echo "Nothing listening on port 6667")
echo "  Port 6667: $BRIDGE_LISTEN"

echo ""
echo "═══ 9. Recent Edge Function Logs ═══"
echo ""
sudo docker logs supabase-edge-functions --tail 20 2>&1 | grep -v "^$" | tail -15

echo ""
echo "═══ 10. Nginx Upstream Errors (last 5) ═══"
echo ""
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "  No error log found"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  DIAGNOSTICS COMPLETE                                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Key things to check:"
echo "  1. channels_public view must exist"
echo "  2. API must return channels via anon key"
echo "  3. Edge functions container must be running"
echo "  4. IRC bridge must be listening on port 6667"
echo ""
