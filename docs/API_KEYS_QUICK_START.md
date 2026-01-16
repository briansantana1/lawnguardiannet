# API Keys Quick Start Guide

Get your Lawn Guardian app up and running with API keys in 3 easy steps!

## Step 1: Get Your API Keys

### Essential APIs (Required)

#### 🌿 Plant.id API
1. Go to https://web.plant.id/api-access/
2. Sign up for an account
3. Choose a plan (Free: 100 requests/month)
4. Copy your API key from the dashboard

#### 🤖 Anthropic Claude API
1. Go to https://console.anthropic.com/
2. Create an account
3. Navigate to "API Keys"
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-api03-`)

### Optional APIs (Recommended)

#### 📧 Resend API (for contact form)
1. Go to https://resend.com/
2. Sign up
3. Verify your domain (or use their test domain)
4. Create an API key
5. Copy it (starts with `re_`)

#### 🌱 Pl@ntNet API (for additional plant ID)
1. Go to https://my.plantnet.org/
2. Create an account
3. Request API access
4. Copy your API key

### App Store APIs (For subscriptions)

#### 🍎 Apple Shared Secret
1. Log in to https://appstoreconnect.apple.com/
2. Go to "Users and Access" > "Shared Secret"
3. Generate or copy your shared secret

#### 🤖 Google Play Credentials
1. Go to https://console.cloud.google.com/
2. Create a service account
3. Enable Google Play Developer API
4. Download the JSON key file
5. Copy the entire JSON content

---

## Step 2: Run the Setup Script

```bash
# Make sure you're in the project directory
cd /path/to/lawn-guardian

# Run the setup script
npm run setup:apis
```

The script will:
- ✅ Prompt you for each API key
- ✅ Validate the keys
- ✅ Store them securely in Supabase
- ✅ Auto-generate security keys

**What to expect:**
```
╔════════════════════════════════════════════════════════════╗
║         Lawn Guardian - API Keys Setup Script              ║
╚════════════════════════════════════════════════════════════╝

Enter PLANT_ID_API_KEY: **********************
✅ PLANT_ID_API_KEY set successfully

Enter ANTHROPIC_API_KEY: **********************
✅ ANTHROPIC_API_KEY set successfully

...
```

**Tips:**
- Keys are hidden as you type (security feature)
- Press Enter to skip optional keys
- You can re-run the script to update keys

---

## Step 3: Test Your API Keys

```bash
# Test all configured APIs
npm run test:apis
```

This will verify each API key works correctly.

**Expected output:**
```
╔════════════════════════════════════════════════════════════╗
║                    Test Results Summary                     ║
╚════════════════════════════════════════════════════════════╝

✅ Passed:  5
❌ Failed:  0
⏭️  Skipped: 2

🎉 All tested APIs are working correctly!
```

---

## Alternative: Test Individual APIs

If you want to test one API at a time:

```bash
npm run test:api
```

This opens an interactive menu:
```
Select an API to test:

  1) Plant.id API (Lawn disease identification)
  2) Anthropic Claude API (AI analysis)
  3) Pl@ntNet API (Plant identification)
  4) Resend API (Email service)
  5) Apple In-App Purchase (Receipt validation)
  6) Google Play (Purchase validation)
  7) Supabase Edge Functions
  0) Exit
```

---

## Troubleshooting

### "Command not found: bash"
**Windows users:** Use Git Bash or WSL
```bash
# Install Git Bash from: https://git-scm.com/downloads
# Or use WSL: https://docs.microsoft.com/en-us/windows/wsl/install
```

### "Supabase CLI not found"
```bash
npm install -g supabase
```

### "Not linked to Supabase project"
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```
Your project ref is in your `.env` file: `VITE_SUPABASE_URL`

### "API test failed"
Common causes:
- ❌ Invalid API key (copy-paste error)
- ❌ API key not activated
- ❌ Insufficient credits
- ❌ Rate limit exceeded

**Solution:** Re-check your API key in the service's dashboard

---

## What Happens Next?

After successful setup:

1. **Deploy Edge Functions**
   ```bash
   npx supabase functions deploy
   ```

2. **Build Your App**
   ```bash
   npm run build
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Test in Browser**
   - Open http://localhost:5173
   - Try uploading a lawn image
   - Verify analysis works

---

## Cost Breakdown

### Free Tier (Good for testing)
- **Plant.id:** 100 requests/month = FREE
- **Anthropic:** ~500 analyses = ~$5 in credits
- **Resend:** 100 emails/day = FREE
- **Total:** ~$5/month for testing

### Production (Moderate traffic)
- **Plant.id:** 1000 requests/month = $29/month
- **Anthropic:** 10k analyses = ~$50/month
- **Resend:** 1k emails/month = FREE
- **Total:** ~$79/month

### Enterprise (High traffic)
- **Plant.id:** 10k requests/month = $149/month
- **Anthropic:** 100k analyses = ~$500/month
- **Resend:** 10k emails/month = $20/month
- **Total:** ~$669/month

---

## Security Best Practices

✅ **DO:**
- Store keys in Supabase Secrets
- Use environment variables
- Rotate keys regularly
- Monitor API usage
- Set up billing alerts

❌ **DON'T:**
- Commit keys to git
- Share keys publicly
- Use production keys in development
- Expose keys in client code
- Use same keys across environments

---

## Need Help?

### Documentation
- **Full Testing Guide:** `docs/API_TESTING_GUIDE.md`
- **Deployment Guide:** `DEPLOYMENT.md`
- **Supabase Docs:** https://supabase.com/docs

### Common Issues
1. **API returns 401:** Invalid API key
2. **API returns 429:** Rate limit exceeded
3. **Function not found:** Deploy edge functions
4. **Build fails:** Check all required keys are set

### Support Channels
- **Plant.id:** https://plant.id/docs
- **Anthropic:** https://docs.anthropic.com
- **Supabase:** https://supabase.com/support

---

## Quick Reference

```bash
# Setup all API keys
npm run setup:apis

# Test all API keys
npm run test:apis

# Test individual API
npm run test:api

# Deploy edge functions
npx supabase functions deploy

# Build app
npm run build

# Start development
npm run dev
```

---

## Checklist

Use this checklist to track your progress:

- [ ] Created Plant.id account and got API key
- [ ] Created Anthropic account and got API key
- [ ] (Optional) Created Resend account and got API key
- [ ] (Optional) Created PlantNet account and got API key
- [ ] Ran `npm run setup:apis` and entered all keys
- [ ] Ran `npm run test:apis` and all tests passed
- [ ] Deployed edge functions with `npx supabase functions deploy`
- [ ] Built app with `npm run build`
- [ ] Tested app in development with `npm run dev`
- [ ] Verified lawn analysis works in browser

---

## Next Steps

Once all APIs are working:

1. **Configure App Store** (for subscriptions)
   - See: `docs/APPLE_APP_STORE_DEPLOYMENT.md`
   - See: `docs/GOOGLE_PLAY_CONSOLE_SETUP.md`

2. **Deploy to Production**
   - See: `DEPLOYMENT.md`

3. **Monitor Usage**
   - Check Plant.id dashboard
   - Check Anthropic console
   - Check Supabase logs

4. **Optimize Costs**
   - Cache API responses
   - Implement rate limiting
   - Use free tiers wisely

---

You're all set! 🚀
