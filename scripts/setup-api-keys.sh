#!/bin/bash

# API Keys Setup Script for Lawn Guardian
# This script will prompt you for API keys and set them in Supabase

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Lawn Guardian - API Keys Setup Script              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will help you set up all required API keys."
echo "You can skip optional keys by pressing Enter."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed."
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if we're linked to a project
if [ ! -f ".supabase/config.toml" ]; then
    echo "❌ Error: Not linked to a Supabase project."
    echo "Run: npx supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✅ Supabase CLI detected"
echo ""

# Function to prompt for a secret
prompt_secret() {
    local var_name=$1
    local description=$2
    local required=$3
    local example=$4

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 $description"
    if [ "$required" = "true" ]; then
        echo "   ⚠️  REQUIRED"
    else
        echo "   ℹ️  Optional (press Enter to skip)"
    fi
    if [ -n "$example" ]; then
        echo "   Example: $example"
    fi
    echo ""

    read -p "Enter $var_name: " -s secret_value
    echo ""

    if [ -z "$secret_value" ]; then
        if [ "$required" = "true" ]; then
            echo "⚠️  Warning: This is a required key. The app may not work properly without it."
        else
            echo "⏭️  Skipping $var_name"
        fi
        return 1
    fi

    echo "Setting $var_name..."
    npx supabase secrets set "$var_name=$secret_value" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "✅ $var_name set successfully"
    else
        echo "❌ Failed to set $var_name"
        return 1
    fi

    return 0
}

# Function to prompt for JSON secret
prompt_json_secret() {
    local var_name=$1
    local description=$2
    local required=$3

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 $description"
    if [ "$required" = "true" ]; then
        echo "   ⚠️  REQUIRED"
    else
        echo "   ℹ️  Optional (press Enter to skip)"
    fi
    echo ""

    read -p "Enter $var_name (paste entire JSON): " secret_value

    if [ -z "$secret_value" ]; then
        if [ "$required" = "true" ]; then
            echo "⚠️  Warning: This is a required key. The app may not work properly without it."
        else
            echo "⏭️  Skipping $var_name"
        fi
        return 1
    fi

    echo "Setting $var_name..."
    npx supabase secrets set "$var_name=$secret_value" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "✅ $var_name set successfully"
    else
        echo "❌ Failed to set $var_name"
        return 1
    fi

    return 0
}

echo "════════════════════════════════════════════════════════════"
echo "🔑 CORE API KEYS (Required for main features)"
echo "════════════════════════════════════════════════════════════"
echo ""

# Plant.id API
prompt_secret "PLANT_ID_API_KEY" \
    "Plant.id API Key - For lawn disease identification\n   Get it from: https://web.plant.id/api-access/" \
    "true" \
    "xxxxxxxxxxxxxxxxxxxxxxxx"

echo ""

# Anthropic Claude API
prompt_secret "ANTHROPIC_API_KEY" \
    "Anthropic Claude API Key - For AI-powered lawn analysis\n   Get it from: https://console.anthropic.com/" \
    "true" \
    "sk-ant-api03-..."

echo ""

echo "════════════════════════════════════════════════════════════"
echo "📧 EMAIL & COMMUNICATION (Optional but recommended)"
echo "════════════════════════════════════════════════════════════"
echo ""

# Resend API
prompt_secret "RESEND_API_KEY" \
    "Resend API Key - For contact form emails\n   Get it from: https://resend.com/" \
    "false" \
    "re_..."

echo ""

echo "════════════════════════════════════════════════════════════"
echo "🌿 ADDITIONAL PLANT IDENTIFICATION (Optional)"
echo "════════════════════════════════════════════════════════════"
echo ""

# PlantNet API
prompt_secret "PLANTNET_API_KEY" \
    "Pl@ntNet API Key - For additional plant identification\n   Get it from: https://my.plantnet.org/" \
    "false" \
    "..."

echo ""

echo "════════════════════════════════════════════════════════════"
echo "📱 APP STORE INTEGRATION (Required for subscriptions)"
echo "════════════════════════════════════════════════════════════"
echo ""

# Apple Shared Secret
prompt_secret "APPLE_SHARED_SECRET" \
    "Apple Shared Secret - For App Store subscriptions\n   Get it from: App Store Connect > Users and Access" \
    "false" \
    "..."

echo ""

# Apple Bundle ID
read -p "Enter Apple Bundle ID (default: com.lawnguardian.app): " apple_bundle
apple_bundle=${apple_bundle:-com.lawnguardian.app}
npx supabase secrets set "APPLE_BUNDLE_ID=$apple_bundle" > /dev/null 2>&1
echo "✅ APPLE_BUNDLE_ID set to: $apple_bundle"

echo ""

# Google Play credentials
prompt_json_secret "GOOGLE_PLAY_CREDENTIALS" \
    "Google Play Service Account JSON - For Play Store subscriptions\n   Get it from: Google Cloud Console > IAM & Admin > Service Accounts" \
    "false"

echo ""

# Google Play package name
read -p "Enter Google Play Package Name (default: com.lawnguardian.app): " google_package
google_package=${google_package:-com.lawnguardian.app}
npx supabase secrets set "GOOGLE_PLAY_PACKAGE_NAME=$google_package" > /dev/null 2>&1
echo "✅ GOOGLE_PLAY_PACKAGE_NAME set to: $google_package"

echo ""

echo "════════════════════════════════════════════════════════════"
echo "🔐 SECURITY (Auto-generated)"
echo "════════════════════════════════════════════════════════════"
echo ""

# Generate CRON_SECRET
echo "Generating CRON_SECRET..."
CRON_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 64 | head -n 1)
npx supabase secrets set "CRON_SECRET=$CRON_SECRET" > /dev/null 2>&1
echo "✅ CRON_SECRET generated and set"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ✅ Setup Complete!                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Summary:"
echo "   - Core API keys configured"
echo "   - Optional services set up (if provided)"
echo "   - Security keys generated"
echo ""
echo "🧪 Next Steps:"
echo "   1. Run the test script to verify your API keys:"
echo "      npm run test:apis"
echo ""
echo "   2. If any tests fail, re-run this script to update keys"
echo ""
echo "   3. Deploy your edge functions:"
echo "      npx supabase functions deploy"
echo ""
echo "💡 Tip: You can view all secrets in Supabase Dashboard:"
echo "   Settings > Edge Functions > Secrets"
echo ""
