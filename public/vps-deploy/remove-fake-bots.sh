#!/bin/bash
#===============================================================================
# JUSTACHAT VPS - REMOVE ALL FAKE/SIMULATED BOTS
# Cleans up hardcoded bot references from the IRC gateway and restarts services
#
# Usage: sudo bash /var/www/justachat/public/vps-deploy/remove-fake-bots.sh
#===============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
info() { echo -e "${CYAN}→${NC} $1"; }

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        REMOVE ALL FAKE/SIMULATED BOTS                       ║"
echo "║        Only moderator bots will remain                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

SUPABASE_DIR="/home/unix/supabase/docker"
FUNCTIONS_DIR="$SUPABASE_DIR/volumes/functions"
FRONTEND_DIR="/var/www/justachat"

#-------------------------------------------------------------------------------
# 1. Pull latest code (has the cleaned IRC gateway)
#-------------------------------------------------------------------------------
echo "=== 1. Pull Latest Code ==="
cd "$FRONTEND_DIR"
if git pull origin main 2>/dev/null; then
  pass "Git pull successful"
else
  warn "Git pull failed or not a git repo — continuing with local files"
fi

#-------------------------------------------------------------------------------
# 2. Sync edge functions to VPS volumes
#-------------------------------------------------------------------------------
echo ""
echo "=== 2. Sync Edge Functions ==="

if [ -d "$FUNCTIONS_DIR" ]; then
  # Copy the updated irc-gateway function
  if [ -d "$FRONTEND_DIR/supabase/functions/irc-gateway" ]; then
    cp -r "$FRONTEND_DIR/supabase/functions/irc-gateway/"* "$FUNCTIONS_DIR/irc-gateway/" 2>/dev/null
    pass "IRC gateway function synced"
  else
    fail "IRC gateway source not found in repo"
  fi
  
  # Copy the chat-bot function (should already be clean)
  if [ -d "$FRONTEND_DIR/supabase/functions/chat-bot" ]; then
    cp -r "$FRONTEND_DIR/supabase/functions/chat-bot/"* "$FUNCTIONS_DIR/chat-bot/" 2>/dev/null
    pass "Chat-bot function synced"
  fi
  
  # Fix ownership
  sudo chown -R 1000:1000 "$FUNCTIONS_DIR"
  pass "File ownership fixed"
else
  fail "Functions directory not found at $FUNCTIONS_DIR"
  info "Trying alternate path..."
  
  ALT_DIR="/root/supabase/docker/volumes/functions"
  if [ -d "$ALT_DIR" ]; then
    cp -r "$FRONTEND_DIR/supabase/functions/irc-gateway/"* "$ALT_DIR/irc-gateway/" 2>/dev/null
    sudo chown -R 1000:1000 "$ALT_DIR"
    pass "Synced to alternate path: $ALT_DIR"
    FUNCTIONS_DIR="$ALT_DIR"
  fi
fi

#-------------------------------------------------------------------------------
# 3. Clean up any bot messages in the database
#-------------------------------------------------------------------------------
echo ""
echo "=== 3. Clean Bot Messages from Database ==="

# List of all fake bot user_id prefixes that were hardcoded
FAKE_BOT_PATTERNS=(
  "bot-floralfantasy" "bot-goldenhour04" "bot-uwillneverknow" "bot-sparkleshine99"
  "bot-sunshinegirl82" "bot-happyvibes_01" "bot-cutiepie_88" "bot-von_vibe"
  "bot-youngin82" "bot-spin_the_block" "bot-hole98court" "bot-smellslike91teen"
  "bot-79londoncalling" "bot-82thriller" "bot-melodyqueen77" "bot-musiclover_94"
  "bot-songbird_88" "bot-88fastcar" "bot-94basketcase" "bot-97daftthomas"
  "bot-96macarena" "bot-98genieinbottle" "bot-gamergirl_22" "bot-cozygamer_01"
  "bot-pixelprincess" "bot-levelu_87" "bot-questqueen99" "bot-slimshady99x"
  "bot-84borninusa" "bot-99partyover" "bot-frost95" "bot-phoenix02"
  "bot-codequeen_88" "bot-techlady_77" "bot-datadiva_01" "bot-devgirl_94"
  "bot-cloudgirl_82" "bot-blaze03_" "bot-wolf89_" "bot-dragon_71"
  "bot-overlyattached" "bot-watchthis92" "bot-sportsgirl_88" "bot-fitnessbabe_01"
  "bot-goodguygreg" "bot-aliens_guy" "bot-one_does_not_simply"
  "bot-distracted_boy" "bot-lookout88" "bot-hereigo70"
  "bot-01feellikewoman" "bot-politicsgal_88" "bot-newswatcher_01"
  "bot-debatequeen_92" "bot-civicsmom_77" "bot-monsterjam80"
  "bot-hotwheels98" "bot-matchbox03" "bot-90canthusthis" "bot-83beatyit"
  "bot-leave_britney_alone" "bot-friday_rebecca" "bot-grumpycat_vibe"
  "bot-movielover_99" "bot-bingewatch_88" "bot-filmfan_92"
  "bot-stargazer_01" "bot-gangnam_12" "bot-dat_boi_99" "bot-badger_badger"
  "bot-littlelinda82" "bot-auntie_em01" "bot-romanticgirl_99"
  "bot-datingtips_88" "bot-matchmaker_01" "bot-heartseeker_77"
  "bot-lovelady_92" "bot-blackpixies88" "bot-eddievedderpj92" "bot-louvelvets67"
  "bot-nightowl_queen" "bot-wineandvibes" "bot-latenightlady"
  "bot-craftbeergal" "bot-winelover_88" "bot-cocktailqueen"
  "bot-mixologist_99" "bot-david88" "bot-driver_dave75" "bot-baker_ben98"
  "bot-97barbiegirl" "bot-quizqueen_88" "bot-factfinder_01"
  "bot-smartcookie_92" "bot-brainiac_77" "bot-knowitall_94"
  "bot-triviababe_99" "bot-hawk88" "bot-falcon96_" "bot-raven70"
  "bot-02comewithme" "bot-03dirtypop" "bot-helpergirl_99"
  "bot-supportqueen_88" "bot-friendlyface_01" "bot-welcomewagon_77"
  "bot-careandshare_94" "bot-purple7haze67" "bot-ziggy72stardust" "bot-75sweetemotion"
  "bot-04staceysmom" "bot-rhythmnation89" "bot-cozycorner_99"
  "bot-peacefulpanda" "bot-naptime_queen" "bot-serenelady_88"
  "bot-quiettime_01" "bot-73jimihendrixvibe" "bot-pizzaguy88steve" "bot-66charliebitme"
  "bot-niece_nicky" "bot-grandma_gert" "bot-artlover_99"
  "bot-creativeone_88" "bot-artgallery_01" "bot-muralqueen_77"
  "bot-photographygal" "bot-babybilly90" "bot-brotherbob85" "bot-papajoe77"
)

# Build SQL WHERE clause
WHERE_CLAUSE=""
for pattern in "${FAKE_BOT_PATTERNS[@]}"; do
  if [ -z "$WHERE_CLAUSE" ]; then
    WHERE_CLAUSE="user_id = '$pattern'"
  else
    WHERE_CLAUSE="$WHERE_CLAUSE OR user_id = '$pattern'"
  fi
done

# Count messages to delete
MSG_COUNT=$(sudo docker exec supabase-db psql -U postgres -t -c \
  "SELECT COUNT(*) FROM public.messages WHERE $WHERE_CLAUSE;" 2>/dev/null | tr -d ' ')

if [ -n "$MSG_COUNT" ] && [ "$MSG_COUNT" -gt 0 ]; then
  info "Found $MSG_COUNT fake bot messages to delete"
  sudo docker exec supabase-db psql -U postgres -c \
    "DELETE FROM public.messages WHERE $WHERE_CLAUSE;" 2>/dev/null
  pass "Deleted $MSG_COUNT fake bot messages"
else
  pass "No fake bot messages found in database"
fi

# Also clean any bot-* messages that match the pattern broadly
BROAD_COUNT=$(sudo docker exec supabase-db psql -U postgres -t -c \
  "SELECT COUNT(*) FROM public.messages WHERE user_id LIKE 'bot-%' AND user_id NOT LIKE 'bot-moderator%';" 2>/dev/null | tr -d ' ')

if [ -n "$BROAD_COUNT" ] && [ "$BROAD_COUNT" -gt 0 ]; then
  info "Found $BROAD_COUNT additional bot-* messages"
  sudo docker exec supabase-db psql -U postgres -c \
    "DELETE FROM public.messages WHERE user_id LIKE 'bot-%' AND user_id NOT LIKE 'bot-moderator%';" 2>/dev/null
  pass "Cleaned up bot-* messages"
fi

#-------------------------------------------------------------------------------
# 4. Restart edge functions container
#-------------------------------------------------------------------------------
echo ""
echo "=== 4. Restart Edge Functions ==="

cd "$SUPABASE_DIR"
if sudo docker compose restart functions 2>/dev/null; then
  pass "Edge functions container restarted"
else
  warn "docker compose restart failed, trying docker restart..."
  sudo docker restart supabase-edge-functions 2>/dev/null && pass "Container restarted" || fail "Could not restart edge functions"
fi

# Wait for container to come up
sleep 3

# Verify it's running
EF_STATUS=$(sudo docker inspect --format='{{.State.Status}}' supabase-edge-functions 2>/dev/null || echo "NOT FOUND")
if [ "$EF_STATUS" = "running" ]; then
  pass "Edge functions container is running"
else
  fail "Edge functions container status: $EF_STATUS"
fi

#-------------------------------------------------------------------------------
# 5. Rebuild frontend
#-------------------------------------------------------------------------------
echo ""
echo "=== 5. Rebuild Frontend ==="

cd "$FRONTEND_DIR"
sudo rm -rf dist 2>/dev/null
sudo chown -R unix:unix "$FRONTEND_DIR"

if npm run build 2>/dev/null; then
  pass "Frontend build successful"
else
  fail "Frontend build failed — check for errors above"
fi

#-------------------------------------------------------------------------------
# 6. Verify cleanup
#-------------------------------------------------------------------------------
echo ""
echo "=== 6. Verification ==="

# Check IRC gateway for channelBots references
if [ -f "$FUNCTIONS_DIR/irc-gateway/index.ts" ]; then
  BOT_REFS=$(grep -c "floralfantasy\|nightowl_queen\|sparkleshine99\|gamergirl_22" "$FUNCTIONS_DIR/irc-gateway/index.ts" 2>/dev/null || echo "0")
  if [ "$BOT_REFS" = "0" ]; then
    pass "No fake bot references in IRC gateway"
  else
    fail "Still found $BOT_REFS fake bot references in IRC gateway!"
    info "The git pull may not have included the latest changes yet"
  fi
fi

# Check frontend chatBots.ts
if [ -f "$FRONTEND_DIR/src/lib/chatBots.ts" ]; then
  FRONTEND_BOTS=$(grep -c "floralfantasy\|nightowl_queen\|sparkleshine99" "$FRONTEND_DIR/src/lib/chatBots.ts" 2>/dev/null || echo "0")
  if [ "$FRONTEND_BOTS" = "0" ]; then
    pass "No fake bots in frontend chatBots.ts"
  else
    fail "Still found fake bots in frontend!"
  fi
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  CLEANUP COMPLETE                                            ║"
echo "║                                                              ║"
echo "║  What was removed:                                           ║"
echo "║  • 130 hardcoded fake bot usernames from IRC gateway         ║"
echo "║  • All fake bot messages from the database                   ║"
echo "║  • Bot count inflation from /list command                    ║"
echo "║  • Fake bot names from room member lists                     ║"
echo "║                                                              ║"
echo "║  What remains:                                               ║"
echo "║  • Moderator bots (Sam, Jordan, Melody, etc.)                ║"
echo "║  • Per-room moderator bot toggle (Admin Bots panel)          ║"
echo "║  • Real user accounts only in member lists                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Test: Connect via mIRC and /list to verify correct room counts."
echo ""
