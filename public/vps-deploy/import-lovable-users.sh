#!/bin/bash
# ============================================
# IMPORT LOVABLE CLOUD USERS TO VPS
# Imports users from Lovable without overwriting existing VPS users
# Run: bash /var/www/justachat/public/vps-deploy/import-lovable-users.sh
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "============================================"
echo "  IMPORT LOVABLE USERS TO VPS"
echo "============================================"
echo ""

# Generate random password
generate_password() {
  openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | head -c 16
}

# Users from Lovable Cloud (email, username, age)
# Format: email|username|age
USERS=(
  "unknown1@justachat.net|MandaloreTheInvincib|18"
  "unknown2@justachat.net|focker69|18"
  "unknown3@justachat.net|Emmytech232|18"
  "prophet@justachat.net|Prophet|18"
  "unknown4@justachat.net|w.ksfinest|18"
  "unknown5@justachat.net|Eric_Targaryen|18"
  "unknown6@justachat.net|cammy_wammy|18"
  "unknown7@justachat.net|NoelTrevor|18"
  "unknown8@justachat.net|broncosman|18"
  "unknown9@justachat.net|electricaquarius|18"
  "bhoel86@gmail.com|Mars|38"
)

echo -e "${CYAN}[INFO]${NC} This script will import users that don't already exist on VPS"
echo ""

# Get database password from Docker .env
DOCKER_ENV="$HOME/supabase/docker/.env"
if [ -f "$DOCKER_ENV" ]; then
  POSTGRES_PASSWORD=$(grep "^POSTGRES_PASSWORD=" "$DOCKER_ENV" | cut -d'=' -f2 | tr -d '"')
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "Enter Postgres password:"
  read -s POSTGRES_PASSWORD
fi

# Create output file for credentials
CREDS_FILE="$HOME/imported-users-$(date +%Y%m%d).txt"
echo "Imported Users - $(date)" > "$CREDS_FILE"
echo "================================" >> "$CREDS_FILE"

IMPORTED=0
SKIPPED=0

for user_data in "${USERS[@]}"; do
  IFS='|' read -r email username age <<< "$user_data"
  
  # Check if username already exists
  EXISTS=$(docker exec supabase-db psql -U postgres -t -c "SELECT COUNT(*) FROM public.profiles WHERE username = '$username';" 2>/dev/null | xargs)
  
  if [ "$EXISTS" != "0" ]; then
    echo -e "${YELLOW}[SKIP]${NC} $username already exists"
    ((SKIPPED++))
    continue
  fi
  
  # Generate random password
  PASSWORD=$(generate_password)
  
  # Create user in auth.users using GoTrue API
  USER_ID=$(uuidgen)
  
  # Insert directly into database (simpler for VPS)
  docker exec supabase-db psql -U postgres -c "
    INSERT INTO auth.users (
      id, 
      instance_id,
      email, 
      encrypted_password, 
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      '$USER_ID',
      '00000000-0000-0000-0000-000000000000',
      '$email',
      crypt('$PASSWORD', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{\"username\": \"$username\", \"age\": $age}'::jsonb,
      'authenticated',
      'authenticated'
    ) ON CONFLICT (email) DO NOTHING;
  " 2>/dev/null
  
  # Check if user was inserted
  USER_CREATED=$(docker exec supabase-db psql -U postgres -t -c "SELECT COUNT(*) FROM auth.users WHERE email = '$email';" 2>/dev/null | xargs)
  
  if [ "$USER_CREATED" != "0" ]; then
    # Get actual user ID (in case it already existed)
    ACTUAL_ID=$(docker exec supabase-db psql -U postgres -t -c "SELECT id FROM auth.users WHERE email = '$email';" 2>/dev/null | xargs)
    
    # Create profile if doesn't exist
    docker exec supabase-db psql -U postgres -c "
      INSERT INTO public.profiles (user_id, username, age)
      VALUES ('$ACTUAL_ID', '$username', $age)
      ON CONFLICT (user_id) DO NOTHING;
    " 2>/dev/null
    
    # Create user role if doesn't exist
    docker exec supabase-db psql -U postgres -c "
      INSERT INTO public.user_roles (user_id, role)
      VALUES ('$ACTUAL_ID', 'user')
      ON CONFLICT DO NOTHING;
    " 2>/dev/null
    
    echo -e "${GREEN}[OK]${NC} Imported: $username ($email)"
    echo "$username | $email | $PASSWORD" >> "$CREDS_FILE"
    ((IMPORTED++))
  else
    echo -e "${YELLOW}[SKIP]${NC} $email already exists in auth"
    ((SKIPPED++))
  fi
done

echo ""
echo "============================================"
echo -e "${GREEN}Import Complete!${NC}"
echo "  Imported: $IMPORTED users"
echo "  Skipped:  $SKIPPED users (already exist)"
echo ""
echo "Credentials saved to: $CREDS_FILE"
echo "============================================"
