#!/bin/bash
# JustAChat VPS - Disable root login (safe, idempotent)
# Run as unix user: sudo bash /var/www/justachat/public/vps-deploy/harden-disable-root.sh

set -euo pipefail

echo "========================================"
echo "  DISABLE ROOT LOGIN (SSH + LOCAL)"
echo "========================================"
echo ""

if [ "$(whoami)" = "root" ]; then
  echo "ERROR: Do not run this as root. Run as unix user with sudo."
  exit 1
fi

echo "This will:"
echo "  - lock the root password (prevents password login as root)"
echo "  - set PermitRootLogin no in sshd_config"
echo "  - restart sshd"
echo ""
echo "IMPORTANT: Keep your current SSH session open while running this."
echo ""

# 1) Lock root password (idempotent)
if sudo passwd -S root 2>/dev/null | awk '{print $2}' | grep -q '^L'; then
  echo "✓ Root password already locked"
else
  echo "Locking root password..."
  sudo passwd -l root >/dev/null
  echo "✓ Root password locked"
fi

# 2) Disable root SSH login
SSHD_CONFIG="/etc/ssh/sshd_config"

if [ ! -f "$SSHD_CONFIG" ]; then
  echo "ERROR: $SSHD_CONFIG not found"
  exit 1
fi

echo "Backing up sshd_config..."
sudo cp -a "$SSHD_CONFIG" "${SSHD_CONFIG}.bak.$(date +%Y%m%d-%H%M%S)"

echo "Setting PermitRootLogin no..."
if sudo grep -Eq '^[[:space:]]*PermitRootLogin[[:space:]]+' "$SSHD_CONFIG"; then
  sudo sed -i 's/^[[:space:]]*PermitRootLogin[[:space:]]\+.*/PermitRootLogin no/' "$SSHD_CONFIG"
else
  echo "PermitRootLogin no" | sudo tee -a "$SSHD_CONFIG" >/dev/null
fi

echo "Validating sshd config..."
sudo sshd -t

echo "Restarting sshd..."
sudo systemctl restart ssh 2>/dev/null || sudo systemctl restart sshd

echo "✓ Root login disabled"
