#!/bin/bash

# Individual API Testing Script
# Use this to test a specific API service

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      Lawn Guardian - Individual API Testing Script         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_menu() {
    echo "Select an API to test:"
    echo ""
    echo "  1) Plant.id API (Lawn disease identification)"
    echo "  2) Anthropic Claude API (AI analysis)"
    echo "  3) Pl@ntNet API (Plant identification)"
    echo "  4) Resend API (Email service)"
    echo "  5) Apple In-App Purchase (Receipt validation)"
    echo "  6) Google Play (Purchase validation)"
    echo "  7) Supabase Edge Functions"
    echo "  0) Exit"
    echo ""
}

test_plantid_detailed() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🌿 Plant.id API Detailed Test${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    read -p "Enter your Plant.id API key: " -s PLANT_ID_KEY
    echo ""

    if [ -z "$PLANT_ID_KEY" ]; then
        echo -e "${RED}❌ No API key provided${NC}"
        return
    fi

    echo "Testing API key..."
    echo ""

    # Create a test image (1x1 pixel PNG)
    TEST_IMAGE="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    response=$(curl -s -X POST "https://plant.id/api/v3/health_assessment" \
        -H "Api-Key: $PLANT_ID_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"images\": [\"data:image/png;base64,$TEST_IMAGE\"],
            \"latitude\": 40.7128,
            \"longitude\": -74.0060,
            \"similar_images\": true
        }")

    echo "Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""

    if echo "$response" | grep -q "access_token\|id\|suggestions"; then
        echo -e "${GREEN}✅ Plant.id API is working correctly!${NC}"
        echo ""
        echo "API Status: Active"
        echo "Endpoint: https://plant.id/api/v3/health_assessment"
    else
        echo -e "${RED}❌ Plant.id API test failed${NC}"
        echo ""
        echo "Possible issues:"
        echo "  - Invalid API key"
        echo "  - Insufficient credits"
        echo "  - Rate limit exceeded"
    fi
}

test_anthropic_detailed() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🤖 Anthropic Claude API Detailed Test${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    read -p "Enter your Anthropic API key: " -s ANTHROPIC_KEY
    echo ""

    if [ -z "$ANTHROPIC_KEY" ]; then
        echo -e "${RED}❌ No API key provided${NC}"
        return
    fi

    echo "Testing API key with a simple query..."
    echo ""

    response=$(curl -s -X POST "https://api.anthropic.com/v1/messages" \
        -H "x-api-key: $ANTHROPIC_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -H "content-type: application/json" \
        -d '{
            "model": "claude-3-haiku-20240307",
            "max_tokens": 50,
            "messages": [
                {"role": "user", "content": "Say hello in one word"}
            ]
        }')

    echo "Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""

    if echo "$response" | grep -q "content\|text"; then
        echo -e "${GREEN}✅ Anthropic Claude API is working correctly!${NC}"
        echo ""
        echo "API Status: Active"
        echo "Model: claude-3-haiku-20240307"
    else
        echo -e "${RED}❌ Anthropic Claude API test failed${NC}"
        echo ""
        echo "Possible issues:"
        echo "  - Invalid API key"
        echo "  - Insufficient credits"
        echo "  - Rate limit exceeded"
    fi
}

test_resend_detailed() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📧 Resend API Detailed Test${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    read -p "Enter your Resend API key: " -s RESEND_KEY
    echo ""

    if [ -z "$RESEND_KEY" ]; then
        echo -e "${RED}❌ No API key provided${NC}"
        return
    fi

    echo "Testing API key..."
    echo ""

    response=$(curl -s -X GET "https://api.resend.com/domains" \
        -H "Authorization: Bearer $RESEND_KEY")

    echo "Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""

    if echo "$response" | grep -q "data\|domains\|name"; then
        echo -e "${GREEN}✅ Resend API is working correctly!${NC}"
        echo ""
        echo "API Status: Active"

        # Show configured domains
        domains=$(echo "$response" | jq -r '.data[].name' 2>/dev/null)
        if [ -n "$domains" ]; then
            echo "Configured domains:"
            echo "$domains" | while read domain; do
                echo "  - $domain"
            done
        fi
    else
        echo -e "${RED}❌ Resend API test failed${NC}"
        echo ""
        echo "Possible issues:"
        echo "  - Invalid API key"
        echo "  - Account not activated"
    fi
}

test_supabase_detailed() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}⚡ Supabase Edge Functions Detailed Test${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    read -p "Enter your Supabase URL: " SUPABASE_URL
    read -p "Enter your Supabase Anon Key: " -s SUPABASE_ANON_KEY
    echo ""

    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
        echo -e "${RED}❌ Missing Supabase credentials${NC}"
        return
    fi

    echo "Testing edge functions..."
    echo ""

    # Test multiple functions
    functions=("analyze-lawn" "identify-plant" "analyze-weather" "get-subscription-status")

    for func in "${functions[@]}"; do
        echo "Testing: $func"
        response=$(curl -s -o /dev/null -w "%{http_code}" \
            -X OPTIONS "${SUPABASE_URL}/functions/v1/$func" \
            -H "Authorization: Bearer $SUPABASE_ANON_KEY")

        if [ "$response" = "200" ] || [ "$response" = "204" ]; then
            echo -e "  ${GREEN}✅ $func is accessible${NC}"
        else
            echo -e "  ${RED}❌ $func failed (HTTP $response)${NC}"
        fi
    done

    echo ""
    echo -e "${GREEN}Edge functions test completed${NC}"
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice: " choice
    echo ""

    case $choice in
        1)
            test_plantid_detailed
            ;;
        2)
            test_anthropic_detailed
            ;;
        3)
            echo "Pl@ntNet API testing - Coming soon"
            ;;
        4)
            test_resend_detailed
            ;;
        5)
            echo "Apple IAP testing requires a valid receipt - use production app"
            ;;
        6)
            echo "Google Play testing requires a valid purchase token - use production app"
            ;;
        7)
            test_supabase_detailed
            ;;
        0)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "Press Enter to continue..."
    echo ""
done
