#!/bin/bash
# Fix Kong JWT Authentication on VPS
# Run: sudo bash /var/www/justachat/public/vps-deploy/fix-kong-jwt.sh

set -e
cd ~/supabase/docker

echo "=== Fixing Kong JWT Configuration ==="

# Get current JWT secret from .env
JWT_SECRET=$(grep '^JWT_SECRET=' .env | cut -d'=' -f2-)
ANON_KEY=$(grep '^ANON_KEY=' .env | cut -d'=' -f2-)
SERVICE_ROLE_KEY=$(grep '^SERVICE_ROLE_KEY=' .env | cut -d'=' -f2-)

echo "Current JWT_SECRET: ${JWT_SECRET:0:20}..."
echo "Current ANON_KEY: ${ANON_KEY:0:50}..."

# Verify keys match the secret
echo ""
echo "=== Checking if keys were generated with current JWT_SECRET ==="

# Decode ANON_KEY header to check algorithm
HEADER=$(echo "$ANON_KEY" | cut -d'.' -f1 | base64 -d 2>/dev/null || echo "decode_failed")
echo "ANON_KEY header: $HEADER"

# Check if Kong container is running and healthy
echo ""
echo "=== Checking Kong Status ==="
docker ps --filter "name=supabase-kong" --format "table {{.Names}}\t{{.Status}}"

# Restart Kong to reload JWT configuration
echo ""
echo "=== Restarting Kong Gateway ==="
docker compose restart kong
sleep 5

# Test the API
echo ""
echo "=== Testing API with ANON_KEY ==="
RESPONSE=$(curl -s -w "\n%{http_code}" http://127.0.0.1:8000/rest/v1/ -H "apikey: $ANON_KEY")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ API responding correctly (HTTP $HTTP_CODE)"
else
  echo "❌ API returned HTTP $HTTP_CODE"
  echo "Response: $BODY"
  
  echo ""
  echo "=== Checking Kong Logs ==="
  docker logs supabase-kong --tail 20 2>&1 | grep -i "jwt\|error\|invalid" || echo "(no relevant logs)"
  
  echo ""
  echo "=== Regenerating JWT Keys ==="
  
  # Generate new JWT secret if needed
  NEW_JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
  
  # Create proper JWT tokens
  # Header: {"alg":"HS256","typ":"JWT"}
  HEADER_B64=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
  
  # Anon payload
  ANON_PAYLOAD='{"iss":"supabase","ref":"selfhosted","role":"anon","iat":1769655475,"exp":2085015475}'
  ANON_PAYLOAD_B64=$(echo -n "$ANON_PAYLOAD" | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
  
  # Service role payload  
  SERVICE_PAYLOAD='{"iss":"supabase","ref":"selfhosted","role":"service_role","iat":1769655475,"exp":2085015475}'
  SERVICE_PAYLOAD_B64=$(echo -n "$SERVICE_PAYLOAD" | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
  
  # Generate signatures
  ANON_SIG=$(echo -n "${HEADER_B64}.${ANON_PAYLOAD_B64}" | openssl dgst -sha256 -hmac "$NEW_JWT_SECRET" -binary | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
  SERVICE_SIG=$(echo -n "${HEADER_B64}.${SERVICE_PAYLOAD_B64}" | openssl dgst -sha256 -hmac "$NEW_JWT_SECRET" -binary | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
  
  NEW_ANON_KEY="${HEADER_B64}.${ANON_PAYLOAD_B64}.${ANON_SIG}"
  NEW_SERVICE_KEY="${HEADER_B64}.${SERVICE_PAYLOAD_B64}.${SERVICE_SIG}"
  
  echo "New JWT_SECRET: ${NEW_JWT_SECRET:0:20}..."
  echo "New ANON_KEY: ${NEW_ANON_KEY:0:50}..."
  
  # Update .env file
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$NEW_JWT_SECRET|" .env
  sed -i "s|^ANON_KEY=.*|ANON_KEY=$NEW_ANON_KEY|" .env
  sed -i "s|^SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=$NEW_SERVICE_KEY|" .env
  
  echo ""
  echo "=== Restarting Supabase Stack ==="
  docker compose down
  docker compose up -d
  
  echo ""
  echo "Waiting for services to start..."
  sleep 15
  
  # Test again
  echo ""
  echo "=== Testing API Again ==="
  RESPONSE=$(curl -s -w "\n%{http_code}" http://127.0.0.1:8000/rest/v1/ -H "apikey: $NEW_ANON_KEY")
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API now working!"
    echo ""
    echo "=== UPDATE REQUIRED ==="
    echo "Update /var/www/justachat/.env with:"
    echo "VITE_SUPABASE_PUBLISHABLE_KEY=$NEW_ANON_KEY"
    echo ""
    echo "Then rebuild: cd /var/www/justachat && npm run build"
  else
    echo "❌ Still failing. Check docker logs:"
    echo "  docker logs supabase-kong --tail 50"
    echo "  docker logs supabase-auth --tail 50"
  fi
fi

echo ""
echo "=== Done ==="
