

# VPS Update and Bot Admin UI Connection Plan

## Summary
This plan will:
1. Pull the latest code to VPS (including watermark changes)
2. Fix the Edge Runtime module import issues (`?t=` query strings and absolute paths)
3. Initialize the `bot_settings` table so the admin UI can control the already-working bots
4. Sync edge functions to the VPS volume

---

## Current Situation

**What's Working:**
- Bots are chatting in rooms (Edge Function `chat-bot` is functional)
- Bot personalities and responses are working via OpenAI
- The admin UI exists at `/admin/bots`

**What's NOT Working:**
- Admin UI can't control the bots because `bot_settings` table is empty on VPS
- Edge runtime may have `ERR_MODULE_NOT_FOUND` errors due to `?t=` cache-busting on file imports
- Router write-path needs to use absolute paths

---

## Phase 1: VPS Update Script

A single script that:
1. Pulls latest code from Git
2. Rebuilds the frontend with watermark changes
3. Initializes `bot_settings` table if empty
4. Fixes edge runtime router to use absolute paths (no `?t=` query)
5. Syncs edge functions to the volume
6. Restarts containers

### Script: `fix-bots-and-sync.sh`

```bash
#!/bin/bash
# JustAChat VPS - Fix Bots + Sync All Updates
# Pulls latest, rebuilds frontend, fixes edge runtime, initializes bot_settings

set -euo pipefail

echo "============================================"
echo "JUSTACHAT VPS - BOT FIX & FULL SYNC"
echo "============================================"

# Directories
APP_DIR="/var/www/justachat"
DOCKER_DIR="$HOME/supabase/docker"
FUNCTIONS_DIR="$DOCKER_DIR/volumes/functions"

# 1. Pull latest code
echo ""
echo "[1/6] Pulling latest code..."
cd "$APP_DIR"
git pull

# 2. Rebuild frontend
echo ""
echo "[2/6] Rebuilding frontend..."
rm -rf dist node_modules/.vite .vite 2>/dev/null || true
npm run build

# 3. Initialize bot_settings if empty
echo ""
echo "[3/6] Initializing bot_settings table..."
cd "$DOCKER_DIR"
source .env

# Get all room names from config
ROOM_NAMES='["general","music","games","technology","movies-tv","sports","politics","dating","adults","help","lounge","trivia"]'

# Check if bot_settings exists
SETTINGS_CHECK=$(curl -s "http://127.0.0.1:8000/rest/v1/bot_settings?select=id&limit=1" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY")

if [ "$SETTINGS_CHECK" = "[]" ]; then
  echo "Creating default bot_settings..."
  curl -s -X POST "http://127.0.0.1:8000/rest/v1/bot_settings" \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "{
      \"enabled\": true,
      \"allowed_channels\": $ROOM_NAMES,
      \"chat_speed\": 5,
      \"moderator_bots_enabled\": true
    }"
  echo ""
  echo "✓ bot_settings initialized"
else
  echo "✓ bot_settings already exists"
fi

# 4. Fix edge runtime router (no ?t= query strings)
echo ""
echo "[4/6] Fixing edge runtime router..."
mkdir -p "$FUNCTIONS_DIR/main"

cat > "$FUNCTIONS_DIR/main/index.ts" << 'ROUTER'
// Edge-runtime main service router (VPS)
// Uses absolute paths without ?t= cache-busting

type Handler = (req: Request) => Response | Promise<Response>;
const handlers = new Map<string, Handler>();

async function loadHandler(functionName: string): Promise<Handler> {
  const cached = handlers.get(functionName);
  if (cached) return cached;

  const originalServe = (Deno as unknown as { serve: unknown }).serve;
  let captured: Handler | null = null;

  (Deno as unknown as { serve: unknown }).serve = (optionsOrHandler: unknown, maybeHandler?: unknown) => {
    const handler = (typeof optionsOrHandler === "function" ? optionsOrHandler : maybeHandler) as Handler | undefined;
    if (!handler) throw new Error("Router: could not capture handler");
    captured = handler;
    return { finished: Promise.resolve(), shutdown() {} } as unknown;
  };

  try {
    // Use absolute file path - NO ?t= query string
    const absolutePath = `/home/deno/functions/${functionName}/index.ts`;
    await import(`file://${absolutePath}`);
  } finally {
    (Deno as unknown as { serve: unknown }).serve = originalServe;
  }

  if (!captured) throw new Error(`Router: function '${functionName}' did not call serve()`);
  handlers.set(functionName, captured);
  return captured;
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/" || path === "/health") {
    return new Response(JSON.stringify({ healthy: true, router: "main-v2" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const match = path.match(/^\/([a-zA-Z0-9_-]+)/);
  if (!match) {
    return new Response(JSON.stringify({ error: "Invalid path" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const functionName = match[1];

  try {
    const handler = await loadHandler(functionName);
    const proxiedUrl = new URL(req.url);
    proxiedUrl.pathname = proxiedUrl.pathname.replace(new RegExp(`^\\/${functionName}`), "") || "/";
    return await handler(new Request(proxiedUrl.toString(), req.clone()));
  } catch (err) {
    console.error(`Router error for ${functionName}:`, err);
    return new Response(JSON.stringify({ error: "Function not found", function: functionName }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
});
ROUTER

echo "✓ Router written with absolute paths (no ?t=)"

# 5. Sync edge functions from repo
echo ""
echo "[5/6] Syncing edge functions from repo..."
for func in "$APP_DIR/supabase/functions"/*; do
  name="$(basename "$func")"
  if [ -d "$func" ] && [ "$name" != "_shared" ]; then
    rm -rf "$FUNCTIONS_DIR/$name"
    cp -r "$func" "$FUNCTIONS_DIR/"
    echo "  ✓ Synced: $name"
  fi
done

# 6. Fix ownership and restart
echo ""
echo "[6/6] Fixing ownership and restarting edge functions..."
sudo chown -R 1000:1000 "$FUNCTIONS_DIR"
cd "$DOCKER_DIR"
sudo docker compose restart functions

echo ""
echo "============================================"
echo "✓ ALL DONE!"
echo ""
echo "Test bots: bash $APP_DIR/public/vps-deploy/diagnose-bots.sh"
echo "Admin UI:  https://justachat.net/admin/bots"
echo "============================================"
```

---

## Phase 2: What Gets Fixed

### Issue 1: Edge Runtime `ERR_MODULE_NOT_FOUND`
**Cause:** The router was using `?t=` timestamps on `file://` imports:
```typescript
// OLD (broken)
await import(`file:///home/deno/functions/main/${functionName}/index.ts?t=${Date.now()}`);
```

**Fix:** Use clean absolute paths:
```typescript
// NEW (fixed)
const absolutePath = `/home/deno/functions/${functionName}/index.ts`;
await import(`file://${absolutePath}`);
```

### Issue 2: Bot Admin UI Not Controlling Bots
**Cause:** `bot_settings` table is empty on VPS

**Fix:** Script inserts default row:
```json
{
  "enabled": true,
  "allowed_channels": ["general", "music", "games", ...all rooms],
  "chat_speed": 5,
  "moderator_bots_enabled": true
}
```

### Issue 3: Frontend Updates (Watermark)
**Fix:** Clean build that removes Vite cache:
```bash
rm -rf dist node_modules/.vite .vite
npm run build
```

---

## Phase 3: How Admin UI Connects to Bots

The flow is already implemented in code:

1. **AdminBots.tsx** reads/writes `bot_settings` table
2. **useChatBots.ts** hook subscribes to `bot_settings` changes via Realtime
3. When admin toggles switches, the hook sees the change and adjusts bot behavior:
   - `enabled` - Master on/off
   - `allowed_channels` - Which rooms bots appear in
   - `chat_speed` - Response delay
   - `moderator_bots_enabled` - Moderator bot override

```typescript
// useChatBots.ts already has this logic:
const botsEnabled = enabled && 
  botSettings?.enabled === true && 
  botSettings?.allowed_channels?.includes(channelName);
```

---

## Execution Steps for User

1. **SSH to VPS as `unix` user**

2. **Create and run the script:**
   ```bash
   cd /var/www/justachat
   cat > /tmp/fix-bots-and-sync.sh << 'SCRIPT'
   [paste script content]
   SCRIPT
   bash /tmp/fix-bots-and-sync.sh
   ```

3. **Verify bots work:**
   ```bash
   bash /var/www/justachat/public/vps-deploy/diagnose-bots.sh
   ```

4. **Test admin panel:**
   - Go to https://justachat.net/admin/bots
   - Toggle the master switch
   - Observe bots stop/start responding in chat

---

## Files to Create/Update

| Action | File | Purpose |
|--------|------|---------|
| Create | `public/vps-deploy/fix-bots-and-sync.sh` | Master sync script |
| Update | VPS `main/index.ts` | Fixed router (no `?t=`) |
| Insert | VPS `bot_settings` table | Default configuration row |

---

## Technical Details

### Router Path Fix
The key change removes the cache-busting timestamp:

```diff
- const fileUrl = new URL(`file:///home/deno/functions/main/${functionName}/index.ts`);
- await import(fileUrl.href);
+ const absolutePath = `/home/deno/functions/${functionName}/index.ts`;
+ await import(`file://${absolutePath}`);
```

### Database Query for bot_settings
```sql
INSERT INTO bot_settings (enabled, allowed_channels, chat_speed, moderator_bots_enabled)
VALUES (true, ARRAY['general','music','games','technology','movies-tv','sports','politics','dating','adults','help','lounge','trivia'], 5, true);
```

### Realtime Subscription (already in useChatBots.ts)
```typescript
const channel = supabase
  .channel('bot-settings-changes')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'bot_settings' },
    (payload) => setBotSettings(payload.new as BotSettings)
  )
  .subscribe();
```

