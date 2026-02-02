#!/bin/bash
# ============================================
# IMPORT LOVABLE USERS TO VPS
# Run: bash /var/www/justachat/public/vps-deploy/import-lovable-users.sh
# ============================================

set -e

echo "============================================"
echo "  IMPORTING LOVABLE USERS TO VPS"
echo "============================================"

USERS=(
  "bhoel86@gmail.com|Mars|38"
  "aamkore@gmail.com|MandaloreTheInvincib|18"
  "jjsydroo@gmail.com|focker69|18"
  "emmytech39@gmail.com|Emmytech232|18"
  "info@junglespot.com|Prophet|18"
  "terrence.jones@att.net|w.ksfinest|18"
  "benjaminbrownworkmail@gmail.com|Eric_Targaryen|18"
  "cammy_wammy@hotmail.com|cammy_wammy|18"
  "drshawll12@gmail.com|NoelTrevor|18"
  "broncosman8@tutanota.com|broncosman|18"
  "electricaquarius0@gmail.com|electricaquarius|18"
)

CREDS_FILE="$HOME/imported-users-$(date +%Y%m%d).txt"
echo "Imported Users - $(date)" > "$CREDS_FILE"
echo "USERNAME | EMAIL | PASSWORD" >> "$CREDS_FILE"
echo "================================" >> "$CREDS_FILE"

IMPORTED=0
SKIPPED=0

for user_data in "${USERS[@]}"; do
  IFS='|' read -r email username age <<< "$user_data"
  
  # Check if email already exists
  EXISTS=$(docker exec supabase-db psql -U postgres -t -c \
    "SELECT COUNT(*) FROM auth.users WHERE email = '$email';" 2>/dev/null | xargs)
  
  if [ "$EXISTS" != "0" ]; then
    echo "[SKIP] $email already exists"
    ((SKIPPED++))
    continue
  fi
  
  # Generate random password
  PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | head -c 12)
  USER_ID=$(cat /proc/sys/kernel/random/uuid)
  
  # Insert into auth.users
  docker exec supabase-db psql -U postgres -c "
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, aud, role)
    VALUES ('$USER_ID', '00000000-0000-0000-0000-000000000000', '$email', crypt('$PASSWORD', gen_salt('bf')), NOW(), NOW(), NOW(), '{\"username\": \"$username\", \"age\": $age}'::jsonb, 'authenticated', 'authenticated');" 2>/dev/null
  
  # Insert profile
  docker exec supabase-db psql -U postgres -c "
    INSERT INTO public.profiles (user_id, username, age)
    VALUES ('$USER_ID', '$username', $age);" 2>/dev/null
  
  # Insert role
  docker exec supabase-db psql -U postgres -c "
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('$USER_ID', 'user');" 2>/dev/null
  
  echo "[OK] $username ($email)"
  echo "$username | $email | $PASSWORD" >> "$CREDS_FILE"
  ((IMPORTED++))
done

echo ""
echo "============================================"
echo "Imported: $IMPORTED | Skipped: $SKIPPED"
echo "Credentials: $CREDS_FILE"
echo "============================================"
