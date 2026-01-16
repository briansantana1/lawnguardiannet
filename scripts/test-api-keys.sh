#!/bin/bash

# API Keys Testing Script for Lawn Guardian
# This script tests all configured API keys to ensure they work

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Lawn Guardian - API Keys Testing Script            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
SKIPPED=0

# Function to test Plant.id API
test_plantid() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌿 Testing Plant.id API..."
    echo ""

    read -p "Enter your Plant.id API key: " -s PLANT_ID_KEY
    echo ""

    if [ -z "$PLANT_ID_KEY" ]; then
        echo -e "${YELLOW}⏭️  Skipped${NC}"
        ((SKIPPED++))
        return
    fi

    # Test with a simple health check
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "https://plant.id/api/v3/health_assessment" \
        -H "Api-Key: $PLANT_ID_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "images": ["https://plant.id/static/banner.jpg"],
            "similar_images": true
        }' 2>&1)

    if [ "$response" = "201" ] || [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Plant.id API is working${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ Plant.id API failed (HTTP $response)${NC}"
        echo "   Check your API key and account status"
        ((FAILED++))
    fi
}

# Function to test Anthropic Claude API
test_anthropic() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🤖 Testing Anthropic Claude API..."
    echo ""

    read -p "Enter your Anthropic API key: " -s ANTHROPIC_KEY
    echo ""

    if [ -z "$ANTHROPIC_KEY" ]; then
        echo -e "${YELLOW}⏭️  Skipped${NC}"
        ((SKIPPED++))
        return
    fi

    # Test with a simple message
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "https://api.anthropic.com/v1/messages" \
        -H "x-api-key: $ANTHROPIC_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -H "content-type: application/json" \
        -d '{
            "model": "claude-3-haiku-20240307",
            "max_tokens": 10,
            "messages": [{"role": "user", "content": "Hi"}]
        }' 2>&1)

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Anthropic Claude API is working${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ Anthropic Claude API failed (HTTP $response)${NC}"
        echo "   Check your API key and account credits"
        ((FAILED++))
    fi
}

# Function to test PlantNet API
test_plantnet() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌱 Testing Pl@ntNet API..."
    echo ""

    read -p "Enter your PlantNet API key (press Enter to skip): " -s PLANTNET_KEY
    echo ""

    if [ -z "$PLANTNET_KEY" ]; then
        echo -e "${YELLOW}⏭️  Skipped (Optional)${NC}"
        ((SKIPPED++))
        return
    fi

    # Test with a simple request
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://my-api.plantnet.org/v2/identify/all?api-key=$PLANTNET_KEY" \
        -F "images=@/dev/null" 2>&1 || echo "000")

    # PlantNet might return 400 for empty image, but that means API key is valid
    if [ "$response" = "200" ] || [ "$response" = "400" ]; then
        echo -e "${GREEN}✅ Pl@ntNet API is working${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ Pl@ntNet API failed (HTTP $response)${NC}"
        echo "   Check your API key"
        ((FAILED++))
    fi
}

# Function to test Resend API
test_resend() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📧 Testing Resend API..."
    echo ""

    read -p "Enter your Resend API key (press Enter to skip): " -s RESEND_KEY
    echo ""

    if [ -z "$RESEND_KEY" ]; then
        echo -e "${YELLOW}⏭️  Skipped (Optional)${NC}"
        ((SKIPPED++))
        return
    fi

    # Test with API key validation endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X GET "https://api.resend.com/api-keys" \
        -H "Authorization: Bearer $RESEND_KEY" 2>&1)

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Resend API is working${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ Resend API failed (HTTP $response)${NC}"
        echo "   Check your API key"
        ((FAILED++))
    fi
}

# Function to test Supabase Edge Functions
test_edge_functions() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚡ Testing Supabase Edge Functions..."
    echo ""

    read -p "Enter your Supabase URL: " SUPABASE_URL
    read -p "Enter your Supabase Anon Key: " -s SUPABASE_ANON_KEY
    echo ""

    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
        echo -e "${YELLOW}⏭️  Skipped${NC}"
        ((SKIPPED++))
        return
    fi

    # Test analyze-lawn function
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X OPTIONS "${SUPABASE_URL}/functions/v1/analyze-lawn" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" 2>&1)

    if [ "$response" = "200" ] || [ "$response" = "204" ]; then
        echo -e "${GREEN}✅ Supabase Edge Functions are accessible${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ Supabase Edge Functions failed (HTTP $response)${NC}"
        echo "   Check your Supabase URL and deploy status"
        ((FAILED++))
    fi
}

# Run all tests
echo "This script will test your API keys without storing them."
echo "Your keys will not be saved anywhere."
echo ""
read -p "Press Enter to start testing..."
echo ""

test_plantid
echo ""

test_anthropic
echo ""

test_plantnet
echo ""

test_resend
echo ""

test_edge_functions
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Test Results Summary                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Passed:  $PASSED${NC}"
echo -e "${RED}❌ Failed:  $FAILED${NC}"
echo -e "${YELLOW}⏭️  Skipped: $SKIPPED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tested APIs are working correctly!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run the setup script to save your keys:"
    echo "     bash scripts/setup-api-keys.sh"
    echo ""
    echo "  2. Deploy your edge functions:"
    echo "     npx supabase functions deploy"
    exit 0
else
    echo -e "${RED}⚠️  Some APIs failed. Please check the errors above.${NC}"
    echo ""
    echo "Common issues:"
    echo "  - Invalid API key"
    echo "  - Insufficient credits/quota"
    echo "  - Network connectivity issues"
    echo "  - API service downtime"
    exit 1
fi
