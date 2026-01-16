# API Testing Guide

This guide explains how to test your API keys for the Lawn Guardian application.

## Quick Start

### 1. Setup Script
Run the interactive setup script to configure all your API keys:

```bash
bash scripts/setup-api-keys.sh
```

This script will:
- Prompt you for each API key
- Validate the format
- Store them securely in Supabase
- Auto-generate security keys

### 2. Test Script
After setup, test all your API keys at once:

```bash
bash scripts/test-api-keys.sh
```

This will test each API without storing the keys, showing you which ones work.

### 3. Individual Testing
Test a specific API service:

```bash
bash scripts/test-individual-api.sh
```

This provides an interactive menu to test individual APIs with detailed output.

---

## API Services Overview

### 🌿 Plant.id API
**Purpose:** Lawn disease and pest identification
**Endpoint:** `https://plant.id/api/v3/health_assessment`
**Required:** Yes
**Get it:** https://web.plant.id/api-access/

**How to test:**
```bash
curl -X POST "https://plant.id/api/v3/health_assessment" \
  -H "Api-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"images": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="]}'
```

**Success indicators:**
- HTTP 200/201 response
- Response contains `id`, `suggestions`, or `access_token`

**Common errors:**
- `401 Unauthorized` - Invalid API key
- `402 Payment Required` - Insufficient credits
- `429 Too Many Requests` - Rate limit exceeded

---

### 🤖 Anthropic Claude API
**Purpose:** AI-powered lawn analysis and recommendations
**Endpoint:** `https://api.anthropic.com/v1/messages`
**Required:** Yes
**Get it:** https://console.anthropic.com/

**How to test:**
```bash
curl -X POST "https://api.anthropic.com/v1/messages" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-haiku-20240307",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hi"}]
  }'
```

**Success indicators:**
- HTTP 200 response
- Response contains `content` array with text

**Common errors:**
- `401 Authentication Error` - Invalid API key
- `429 Rate Limit` - Too many requests
- `529 Overloaded` - Service temporarily unavailable

---

### 🌱 Pl@ntNet API
**Purpose:** Additional plant identification (optional)
**Endpoint:** `https://my-api.plantnet.org/v2/identify`
**Required:** No
**Get it:** https://my.plantnet.org/

**How to test:**
```bash
curl "https://my-api.plantnet.org/v2/identify/all?api-key=YOUR_API_KEY" \
  -F "images=@path/to/image.jpg"
```

**Success indicators:**
- HTTP 200 response
- Response contains `results` array

**Common errors:**
- `401 Unauthorized` - Invalid API key
- `403 Forbidden` - API key not activated

---

### 📧 Resend API
**Purpose:** Contact form email delivery
**Endpoint:** `https://api.resend.com`
**Required:** No (but recommended)
**Get it:** https://resend.com/

**How to test:**
```bash
curl -X GET "https://api.resend.com/domains" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Success indicators:**
- HTTP 200 response
- Response contains `data` array with domains

**Common errors:**
- `401 Unauthorized` - Invalid API key
- `403 Forbidden` - Account not verified

---

### 🍎 Apple In-App Purchase
**Purpose:** iOS subscription validation
**Endpoint:** `https://buy.itunes.apple.com/verifyReceipt`
**Required:** For iOS subscriptions
**Get it:** App Store Connect > Users and Access > Shared Secret

**Environment variables needed:**
- `APPLE_SHARED_SECRET` - Your app's shared secret
- `APPLE_BUNDLE_ID` - com.lawnguardian.app (or your bundle ID)

**Testing:** Can only be tested with actual receipts from TestFlight or production

---

### 🤖 Google Play In-App Purchase
**Purpose:** Android subscription validation
**Endpoint:** Google Play Developer API
**Required:** For Android subscriptions
**Get it:** Google Cloud Console > IAM & Admin > Service Accounts

**Environment variables needed:**
- `GOOGLE_PLAY_CREDENTIALS` - Service account JSON
- `GOOGLE_PLAY_PACKAGE_NAME` - com.lawnguardian.app (or your package name)

**Testing:** Can only be tested with actual purchase tokens from production

---

## Edge Functions Testing

### Testing deployed functions:

```bash
# Test that function is accessible (should return 200 or 401)
curl -X OPTIONS "YOUR_SUPABASE_URL/functions/v1/analyze-lawn" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test with authentication
curl -X POST "YOUR_SUPABASE_URL/functions/v1/analyze-lawn" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "..."}'
```

### List of edge functions to test:
- ✅ `analyze-lawn` - Main lawn analysis
- ✅ `identify-plant` - Plant identification
- ✅ `analyze-weather` - Weather data
- ✅ `get-subscription-status` - Check user subscription
- ✅ `restore-purchases` - Restore user purchases
- ⚠️ `identify-lawn-problem` - Disabled (was Lovable API)
- ✅ `send-contact-email` - Contact form
- ✅ `validate-apple-receipt` - Apple IAP validation
- ✅ `validate-google-purchase` - Google Play validation

---

## Troubleshooting

### "Command not found: supabase"
Install Supabase CLI:
```bash
npm install -g supabase
```

### "Not linked to a Supabase project"
Link your project:
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

### "Secret not set"
Re-run the setup script:
```bash
bash scripts/setup-api-keys.sh
```

### "Edge function not found"
Deploy your edge functions:
```bash
npx supabase functions deploy
```

### API returns 401/403
- Check if API key is correct
- Verify API key is active and not expired
- Check account credits/quota

### API returns 429
- You've hit the rate limit
- Wait a few minutes and try again
- Consider upgrading your API plan

---

## Cost Optimization Tips

### Plant.id API
- Free tier: 100 requests/month
- Paid plans from $29/month
- Use wisely: Cache results, limit re-scans

### Anthropic Claude API
- Pay-as-you-go pricing
- ~$3 per 1M input tokens
- Use Haiku model for cost efficiency

### Resend API
- Free: 100 emails/day
- Paid: $20/month for 50k emails
- Only used for contact form

---

## Next Steps

After all API tests pass:

1. **Deploy Edge Functions**
   ```bash
   npx supabase functions deploy
   ```

2. **Build Your App**
   ```bash
   npm run build
   ```

3. **Test in Development**
   ```bash
   npm run dev
   ```

4. **Monitor Usage**
   - Plant.id Dashboard: Check request count
   - Anthropic Console: Monitor token usage
   - Supabase Dashboard: View edge function logs

---

## Need Help?

- **Plant.id Support:** https://plant.id/docs
- **Anthropic Docs:** https://docs.anthropic.com
- **Supabase Docs:** https://supabase.com/docs
- **Resend Docs:** https://resend.com/docs

---

## Security Notes

⚠️ **Important:**
- NEVER commit API keys to git
- NEVER expose keys in client-side code
- ALWAYS use environment variables
- ALWAYS use edge functions for API calls
- Rotate keys regularly
- Use different keys for dev/production

✅ **Best Practices:**
- Store keys in Supabase Secrets
- Use Row Level Security (RLS)
- Monitor API usage regularly
- Set up billing alerts
- Test with free tiers first
