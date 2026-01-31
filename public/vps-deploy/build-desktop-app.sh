#!/bin/bash
# =============================================================================
# Justachat Desktop App Builder
# Run this on the VPS to build Windows/Linux desktop apps
# =============================================================================

set -e

PROJECT_DIR="/var/www/justachat"
OUTPUT_DIR="/var/www/justachat/dist/downloads"

echo "========================================"
echo "  Justachat Desktop App Builder"
echo "========================================"
echo ""

cd "$PROJECT_DIR"

# -----------------------------------------------------------------------------
# electron-builder requirement:
# electron + electron-builder must be in devDependencies (not dependencies).
# Our web repo can't always reflect that, so for VPS desktop builds we patch the
# local package.json temporarily, then restore it.
# -----------------------------------------------------------------------------

PKG_JSON="$PROJECT_DIR/package.json"
PKG_BAK="$PROJECT_DIR/package.json.__desktop_build_bak"

if [ -f "$PKG_JSON" ]; then
  cp "$PKG_JSON" "$PKG_BAK"
  trap 'mv "$PKG_BAK" "$PKG_JSON" >/dev/null 2>&1 || true' EXIT

  node - <<'NODE'
const fs = require('fs');
const path = require('path');

const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.devDependencies = pkg.devDependencies || {};
pkg.dependencies = pkg.dependencies || {};

for (const name of ['electron', 'electron-builder']) {
  if (pkg.dependencies?.[name]) {
    pkg.devDependencies[name] = pkg.dependencies[name];
    delete pkg.dependencies[name];
  }
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
NODE
fi

# Clean previous build
echo "Cleaning previous builds..."
rm -rf electron-dist

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo ""
echo "Building desktop apps..."
echo ""

# Build for Windows (skip macOS on Linux VPS)
echo "→ Building Windows installer..."
npx electron-builder --win --x64 --config electron-builder.json || echo "Windows build had issues"

# Build for Linux
echo "→ Building Linux AppImage..."
npx electron-builder --linux AppImage --x64 --config electron-builder.json || echo "Linux build had issues"

# Move built files to public downloads folder
echo ""
echo "Moving files to downloads folder..."
mkdir -p "$OUTPUT_DIR"

# Copy any built files
find electron-dist -name "*.exe" -exec cp {} "$OUTPUT_DIR/" \; 2>/dev/null || echo "  (no .exe files found)"
find electron-dist -name "*.AppImage" -exec cp {} "$OUTPUT_DIR/" \; 2>/dev/null || echo "  (no .AppImage files found)"

# Set permissions
chmod 644 "$OUTPUT_DIR"/*.exe 2>/dev/null || true
chmod 755 "$OUTPUT_DIR"/*.AppImage 2>/dev/null || true

echo ""
echo "========================================"
echo "  Build Complete!"
echo "========================================"
echo ""
echo "Files in downloads folder:"
ls -la "$OUTPUT_DIR" 2>/dev/null || echo "(empty)"
echo ""
echo "Download URLs (once deployed):"
echo "  Windows: https://justachat.net/downloads/Justachat-Setup-1.0.0.exe"
echo "  Linux:   https://justachat.net/downloads/Justachat-1.0.0-linux.AppImage"
echo ""
