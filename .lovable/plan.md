
# Fix Analytics Blocking Stack Startup - Permanently

## Problem Analysis

The VPS gets stuck "waiting on analytics" during the rebuild because:

1. **Root cause**: The Supabase `docker-compose.yml` defines `supabase-analytics` (Logflare) as a dependency for Kong with a `service_healthy` condition
2. **Effect**: When you run `docker compose up -d`, Docker waits for analytics to pass its health check before starting Kong and other services
3. **Why it's slow**: The analytics container is resource-intensive and can take 2-5+ minutes to become healthy on modest VPS hardware
4. **Why it blocks**: The current `rebuild-vps.sh` uses a simple `docker compose up -d` which waits synchronously for all health checks

## Solution

Modify the rebuild script to use a **staged startup approach** that:
1. Starts core services (db, vector) first
2. Starts analytics in the **background** with `--no-deps` (so it doesn't block)
3. Immediately starts all other services without waiting for analytics
4. Reports success even while analytics is still warming up

This mirrors the logic already in `fix-analytics-block.sh` but bakes it directly into the rebuild script so you never hit this issue again.

## Implementation

### Changes to `public/vps-deploy/rebuild-vps.sh`

**Replace Step 5 (lines 242-253)** with staged startup logic:

```text
# STEP 5: Start Supabase stack (staged to avoid analytics blocking)
echo "[5/9] Starting Supabase Docker stack..."
cd ~/supabase/docker

# Pull latest images
sudo docker compose pull 2>/dev/null || true

# Stage 1: Start database first (required by everything)
echo "  Stage 1: Starting database..."
sudo docker compose up -d supabase-db
echo "  Waiting for database to initialize (20s)..."
sleep 20

# Stage 2: Wait for DB to be healthy
echo "  Stage 2: Waiting for database health check..."
for i in {1..30}; do
  if sudo docker inspect supabase-db --format='{{.State.Health.Status}}' 2>/dev/null | grep -q healthy; then
    echo "  ✓ Database is healthy"
    break
  fi
  echo "    Waiting for DB... ($i/30)"
  sleep 2
done

# Stage 3: Start analytics in BACKGROUND (don't wait for health)
echo "  Stage 3: Starting analytics in background (non-blocking)..."
sudo docker compose up -d supabase-analytics --no-deps &
ANALYTICS_PID=$!

# Stage 4: Start all other services immediately
echo "  Stage 4: Starting remaining services..."
sleep 3
sudo docker compose up -d \
  supabase-vector \
  supabase-imgproxy \
  supabase-meta \
  supabase-pooler \
  supabase-auth \
  supabase-rest \
  supabase-realtime \
  supabase-storage \
  supabase-edge-functions \
  supabase-kong \
  supabase-studio

# Wait for analytics background process to finish (just the command, not health)
wait $ANALYTICS_PID 2>/dev/null || true

echo "  Waiting for services to stabilize (15s)..."
sleep 15

# Quick health verification
echo "  Verifying core services..."
ANON_KEY_CHECK=$(grep "^ANON_KEY=" .env | cut -d'=' -f2- | tr -d '"')
AUTH_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:8000/auth/v1/health" -H "apikey: $ANON_KEY_CHECK" 2>/dev/null || echo "000")
REST_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:8000/rest/v1/" -H "apikey: $ANON_KEY_CHECK" 2>/dev/null || echo "000")

if [ "$AUTH_STATUS" = "200" ] && [ "$REST_STATUS" = "200" ]; then
  echo "  ✓ Auth API: OK"
  echo "  ✓ REST API: OK"
else
  echo "  ⚠ Auth API: $AUTH_STATUS"
  echo "  ⚠ REST API: $REST_STATUS"
  echo "  (Services may still be starting - continuing anyway)"
fi

echo "  Note: Analytics may still be warming up in background - this is normal"
```

### Why This Works

| Before | After |
|--------|-------|
| `docker compose up -d` blocks on analytics health | Analytics started with `--no-deps &` (background, no dependencies) |
| 30s fixed wait | Staged waits only where needed |
| All-or-nothing startup | Services start as soon as DB is ready |
| Rebuild can hang 5+ minutes | Core services up in ~60 seconds |

### Technical Details

- **`--no-deps`**: Tells Docker Compose not to start/wait for dependencies
- **`&`**: Runs the analytics container start in background
- **`wait $ANALYTICS_PID`**: Waits for the command to finish (not for health check)
- **Explicit service list**: Bypasses dependency chain entirely

### What About Analytics?

Analytics will still start and become healthy eventually (usually 2-5 minutes). The difference is:
- Kong and other services start immediately
- The rebuild script completes
- Analytics continues booting in the background
- Once healthy, Kong automatically detects it and can route `/analytics/v1` requests

If analytics fails completely, it has **no impact** on:
- Authentication
- Database queries
- Edge functions
- Realtime subscriptions
- Storage

Analytics is only used for Supabase Studio dashboards and logging - not required for JustAChat to function.

## Testing After Deployment

After running the updated rebuild script:

```bash
# Check all containers are running
sudo docker ps --format "table {{.Names}}\t{{.Status}}" | grep supabase

# Verify core APIs work
curl -s "http://127.0.0.1:8000/auth/v1/health" -H "apikey: YOUR_ANON_KEY"
curl -s "http://127.0.0.1:8000/rest/v1/" -H "apikey: YOUR_ANON_KEY"

# Check analytics status (may say "starting" for a few minutes)
sudo docker logs supabase-analytics --tail 20
```
