#!/bin/bash
# VPS Chat Image Display Diagnostic
# Run: bash /var/www/justachat/public/vps-deploy/diagnose-chat-images.sh
# Diagnoses why images show "chat image" text instead of actual image

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "========================================"
echo -e "${CYAN}  CHAT IMAGE DISPLAY DIAGNOSTIC${NC}"
echo "========================================"
echo ""

# === 1. Check latest image message in database ===
echo -e "${YELLOW}[1/6] Checking latest image messages in database...${NC}"
cd ~/supabase/docker

# Get the latest message with [img: pattern
LATEST_IMG=$(docker compose exec -T db psql -U postgres -d postgres -t -c "
SELECT content FROM public.messages 
WHERE content LIKE '%[img:%' 
ORDER BY created_at DESC 
LIMIT 1;
" 2>/dev/null | tr -d '[:space:]')

if [ -n "$LATEST_IMG" ]; then
  echo -e "${GREEN}✓ Found image message in database${NC}"
  echo "  Content: ${LATEST_IMG:0:100}..."
  
  # Extract URL from [img:URL] format
  IMG_URL=$(echo "$LATEST_IMG" | sed -n 's/.*\[img:\([^]]*\)\].*/\1/p')
  
  if [ -n "$IMG_URL" ]; then
    echo "  Extracted URL: $IMG_URL"
  else
    echo -e "${RED}✗ Could not extract URL from message format${NC}"
    echo "  Expected format: [img:https://...]"
  fi
else
  echo -e "${RED}✗ No image messages found in database${NC}"
  echo "  Try uploading an image first"
fi

# === 2. Check if URL points to VPS or Cloud ===
echo ""
echo -e "${YELLOW}[2/6] Checking image URL destination...${NC}"
if [ -n "$IMG_URL" ]; then
  if echo "$IMG_URL" | grep -q "supabase\.co"; then
    echo -e "${RED}✗ URL points to Lovable Cloud (supabase.co)${NC}"
    echo "  This won't work on VPS - images must be stored locally"
  elif echo "$IMG_URL" | grep -q "justachat\.net"; then
    echo -e "${GREEN}✓ URL correctly points to VPS (justachat.net)${NC}"
  elif echo "$IMG_URL" | grep -q "127\.0\.0\.1\|localhost"; then
    echo -e "${YELLOW}⚠ URL points to localhost${NC}"
    echo "  This only works from the VPS itself"
  else
    echo -e "${YELLOW}⚠ Unknown URL domain${NC}"
  fi
fi

# === 3. Test image accessibility ===
echo ""
echo -e "${YELLOW}[3/6] Testing image URL accessibility...${NC}"
if [ -n "$IMG_URL" ]; then
  # Convert cloud URL to VPS URL if needed
  VPS_URL=$(echo "$IMG_URL" | sed 's|https://hliytlezggzryetekpvo.supabase.co|https://justachat.net|g')
  
  echo "  Testing: $VPS_URL"
  
  HEADERS=$(curl -sI "$VPS_URL" 2>/dev/null | head -20)
  HTTP_CODE=$(echo "$HEADERS" | grep -i "^HTTP" | tail -1 | awk '{print $2}')
  CONTENT_TYPE=$(echo "$HEADERS" | grep -i "^content-type:" | cut -d: -f2- | tr -d '[:space:]')
  
  echo "  HTTP Status: $HTTP_CODE"
  echo "  Content-Type: $CONTENT_TYPE"
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Image is accessible${NC}"
    
    if echo "$CONTENT_TYPE" | grep -qi "image"; then
      echo -e "${GREEN}✓ Content-Type is correct (image/*)${NC}"
    else
      echo -e "${RED}✗ Content-Type is wrong: $CONTENT_TYPE${NC}"
      echo "  Should be image/jpeg, image/png, etc."
    fi
  else
    echo -e "${RED}✗ Image not accessible (HTTP $HTTP_CODE)${NC}"
  fi
else
  echo "  Skipped - no URL to test"
fi

# === 4. Check storage bucket configuration ===
echo ""
echo -e "${YELLOW}[4/6] Checking storage bucket configuration...${NC}"
BUCKET_INFO=$(docker compose exec -T db psql -U postgres -d postgres -t -c "
SELECT id, name, public FROM storage.buckets WHERE id = 'avatars';
" 2>/dev/null)

if [ -n "$BUCKET_INFO" ]; then
  echo "  Bucket info: $BUCKET_INFO"
  if echo "$BUCKET_INFO" | grep -q "t$\|true"; then
    echo -e "${GREEN}✓ Avatars bucket is public${NC}"
  else
    echo -e "${RED}✗ Avatars bucket is NOT public${NC}"
    echo "  Fix: UPDATE storage.buckets SET public = true WHERE id = 'avatars';"
  fi
else
  echo -e "${RED}✗ Avatars bucket not found${NC}"
fi

# === 5. Check storage RLS policies ===
echo ""
echo -e "${YELLOW}[5/6] Checking storage RLS policies...${NC}"
POLICIES=$(docker compose exec -T db psql -U postgres -d postgres -t -c "
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
" 2>/dev/null)

if [ -n "$POLICIES" ]; then
  echo "$POLICIES"
  
  if echo "$POLICIES" | grep -qi "public.*select\|select.*public"; then
    echo -e "${GREEN}✓ Public SELECT policy exists${NC}"
  else
    echo -e "${YELLOW}⚠ No obvious public SELECT policy found${NC}"
  fi
else
  echo -e "${RED}✗ No storage policies found${NC}"
fi

# === 6. Check frontend MessageBubble component ===
echo ""
echo -e "${YELLOW}[6/6] Checking frontend image rendering logic...${NC}"
MSG_BUBBLE="/var/www/justachat/src/components/chat/MessageBubble.tsx"

if [ -f "$MSG_BUBBLE" ]; then
  # Check if it handles [img:] format
  if grep -q "\[img:" "$MSG_BUBBLE"; then
    echo -e "${GREEN}✓ MessageBubble handles [img:] format${NC}"
  else
    echo -e "${RED}✗ MessageBubble may not handle [img:] format${NC}"
  fi
  
  # Check if it renders <img> tags
  if grep -q "<img" "$MSG_BUBBLE"; then
    echo -e "${GREEN}✓ MessageBubble renders <img> tags${NC}"
  else
    echo -e "${RED}✗ MessageBubble doesn't render <img> tags${NC}"
    echo "  Images may be shown as text instead"
  fi
  
  # Show relevant rendering code
  echo ""
  echo "  Relevant code snippets:"
  grep -n -A2 -B2 "\[img:" "$MSG_BUBBLE" 2>/dev/null | head -20 || echo "  (no [img: matches)"
else
  echo -e "${RED}✗ MessageBubble.tsx not found${NC}"
fi

# === Summary ===
echo ""
echo "========================================"
echo -e "${CYAN}  DIAGNOSIS SUMMARY${NC}"
echo "========================================"
echo ""
echo "If images show 'chat image' text instead of actual images:"
echo ""
echo "1. Check the message format in DB is: [img:https://justachat.net/...]"
echo "2. Ensure URL points to VPS (justachat.net), not supabase.co"
echo "3. Verify the image URL returns HTTP 200 with Content-Type: image/*"
echo "4. Ensure MessageBubble.tsx parses [img:] and renders <img> tags"
echo ""
echo "Quick fix if images are stored on Cloud storage:"
echo "  - The upload-image function needs to upload to VPS storage"
echo "  - Check: grep -r 'supabase.co' /var/www/justachat/dist/"
echo ""
