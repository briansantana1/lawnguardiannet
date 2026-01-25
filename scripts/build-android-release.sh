#!/bin/bash

# =====================================================
# Lawn Guardian - Android Release Build Script
# =====================================================
# This script prepares the app for Google Play Store submission
# 
# Prerequisites:
# - Node.js 18+
# - Android Studio with SDK
# - Signing keystore configured in android/local.properties
# 
# Usage: ./scripts/build-android-release.sh
# =====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Lawn Guardian - Android Release Build${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Step 1: Check Node.js
echo -e "${YELLOW}[1/6] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js version: $NODE_VERSION${NC}"

# Step 2: Install dependencies
echo ""
echo -e "${YELLOW}[2/6] Installing dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Build web assets
echo ""
echo -e "${YELLOW}[3/6] Building web assets...${NC}"
npm run build
echo -e "${GREEN}✓ Web assets built${NC}"

# Step 4: Sync Capacitor
echo ""
echo -e "${YELLOW}[4/6] Syncing Capacitor...${NC}"
npx cap sync android
echo -e "${GREEN}✓ Capacitor synced${NC}"

# Step 5: Display current version
echo ""
echo -e "${YELLOW}[5/6] Current Android version:${NC}"
CURRENT_VERSION_CODE=$(grep -oP 'versionCode \K\d+' android/app/build.gradle)
CURRENT_VERSION_NAME=$(grep -oP 'versionName "\K[^"]+' android/app/build.gradle)
echo -e "  Version Code: ${GREEN}$CURRENT_VERSION_CODE${NC}"
echo -e "  Version Name: ${GREEN}$CURRENT_VERSION_NAME${NC}"

# Step 6: Instructions for building AAB
echo ""
echo -e "${YELLOW}[6/6] Next Steps - Build Signed AAB:${NC}"
echo ""
echo -e "${BLUE}Option A: Using Android Studio (Recommended)${NC}"
echo "  1. Open Android Studio"
echo "  2. Run: npx cap open android"
echo "  3. Go to: Build → Generate Signed Bundle / APK"
echo "  4. Select: Android App Bundle"
echo "  5. Choose your keystore (android/lawn-guardian-release.keystore)"
echo "  6. Enter keystore password and key alias (lawn-guardian)"
echo "  7. Select: release"
echo "  8. Click: Create"
echo ""
echo "  AAB will be generated at:"
echo "  android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo -e "${BLUE}Option B: Using Command Line (Requires local.properties setup)${NC}"
echo "  cd android"
echo "  ./gradlew bundleRelease"
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Web assets ready! Open Android Studio to${NC}"
echo -e "${GREEN}  generate the signed AAB for Play Store.${NC}"
echo -e "${GREEN}================================================${NC}"

# Optional: Open Android Studio
read -p "Open Android Studio now? (y/n): " OPEN_STUDIO
if [[ "$OPEN_STUDIO" == "y" || "$OPEN_STUDIO" == "Y" ]]; then
    npx cap open android
fi
