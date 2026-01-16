# 🚀 API Keys Setup Guide - Step by Step

Follow these instructions to add your API keys to Lawn Guardian.

---

## 🎯 What You'll Need

You'll need API keys from these services:

1. **Plant.id** (Required) - For lawn problem identification
2. **Anthropic Claude** (Required) - For AI-powered analysis
3. **Resend** (Optional) - For contact form emails

---

## 📋 Step-by-Step Instructions

### Step 1: Get Your API Keys

#### 🌿 Plant.id API Key

1. Open your browser and go to: **https://web.plant.id/api-access/**
2. Click "Sign Up" or "Sign In" if you already have an account
3. Choose a plan:
   - **Free Plan**: 100 requests/month (good for testing)
   - **Starter Plan**: $29/month for 1,000 requests
4. Once logged in, go to your **Dashboard**
5. Copy your **API Key** (it should be a long string of letters and numbers)
6. **Save it somewhere safe** - you'll need it in Step 2

**What it looks like:**
```
xxxxxxxxxxxxxxxxxxxxxxxx
```

---

#### 🤖 Anthropic Claude API Key

1. Go to: **https://console.anthropic.com/**
2. Sign up or sign in
3. Click on **"API Keys"** in the left menu
4. Click **"Create Key"**
5. Give it a name like "Lawn Guardian"
6. Copy the key (starts with `sk-ant-api03-`)
7. **Save it somewhere safe** - you can only see it once!

**What it looks like:**
```
sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

#### 📧 Resend API Key (Optional)

1. Go to: **https://resend.com/**
2. Sign up for a free account
3. Verify your email
4. Go to **API Keys** section
5. Click **"Create API Key"**
6. Give it a name and click "Create"
7. Copy the key (starts with `re_`)

**What it looks like:**
```
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Step 2: Add Keys to Supabase

Now we'll add these keys to your Supabase project through the dashboard.

#### Method 1: Using Supabase Dashboard (Easiest)

1. **Go to your Supabase Dashboard:**
   - Open: https://supabase.com/dashboard/project/yydgrcfsndkdngjhptsm

2. **Navigate to Edge Functions Secrets:**
   - Click **"Edge Functions"** in the left sidebar
   - Click on **"Manage secrets"** or the **"Secrets"** tab

3. **Add each secret one by one:**

   Click **"Add new secret"** and enter:

   **First Secret:**
   - Name: `PLANT_ID_API_KEY`
   - Value: [Paste your Plant.id API key here]
   - Click "Save"

   **Second Secret:**
   - Name: `ANTHROPIC_API_KEY`
   - Value: [Paste your Anthropic API key here]
   - Click "Save"

   **Third Secret (Optional):**
   - Name: `RESEND_API_KEY`
   - Value: [Paste your Resend API key here]
   - Click "Save"

4. **Verify the secrets are saved:**
   - You should see all three secrets listed
   - ✅ PLANT_ID_API_KEY
   - ✅ ANTHROPIC_API_KEY
   - ✅ RESEND_API_KEY

---

### Step 3: Deploy Edge Functions

After adding your secrets, deploy the edge functions so they can use the new API keys:

1. **Open your terminal** in the project directory

2. **Run this command:**
   ```bash
   npx supabase functions deploy --project-ref yydgrcfsndkdngjhptsm
   ```

3. **When prompted:**
   - If asked to log in, press Enter and follow the browser login
   - If asked to confirm, type `y` and press Enter

4. **Wait for deployment to complete** (may take 1-2 minutes)

5. **You should see:**
   ```
   ✓ Functions deployed successfully
   ```

---

### Step 4: Test Your Setup

Let's verify everything works!

#### Quick Test (Recommended)

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open the app in your browser:**
   - Go to: http://localhost:5173

3. **Test the lawn scanner:**
   - Click "Scan Lawn"
   - Upload a photo of a lawn (any lawn photo)
   - Wait for the analysis
   - ✅ If you see results, it's working!

#### Manual API Test (Alternative)

You can also test individual APIs:

**Test Plant.id:**
```bash
curl -X POST "https://plant.id/api/v3/health_assessment" \
  -H "Api-Key: YOUR_PLANT_ID_KEY" \
  -H "Content-Type: application/json" \
  -d '{"images": ["https://plant.id/static/banner.jpg"]}'
```

**Test Anthropic:**
```bash
curl -X POST "https://api.anthropic.com/v1/messages" \
  -H "x-api-key: YOUR_ANTHROPIC_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model": "claude-3-haiku-20240307", "max_tokens": 10, "messages": [{"role": "user", "content": "Hi"}]}'
```

Replace `YOUR_PLANT_ID_KEY` and `YOUR_ANTHROPIC_KEY` with your actual keys.

---

## ✅ Verification Checklist

Make sure you've completed all these steps:

- [ ] Created Plant.id account and copied API key
- [ ] Created Anthropic account and copied API key
- [ ] (Optional) Created Resend account and copied API key
- [ ] Added all secrets to Supabase Dashboard
- [ ] Deployed edge functions
- [ ] Tested the app by scanning a lawn photo
- [ ] App successfully analyzed the photo

---

## 🎉 Success!

If you got analysis results, congratulations! Your API keys are working correctly.

### What's Next?

1. **Try all the features:**
   - Scan different lawn problems
   - Check the treatment calendar
   - View saved plans

2. **Monitor your usage:**
   - Plant.id Dashboard: https://web.plant.id/dashboard
   - Anthropic Console: https://console.anthropic.com/

3. **Set up optional features:**
   - Weather alerts (automatic)
   - Notification scheduling
   - Price comparison

---

## 🔧 Troubleshooting

### "API Key Invalid" Error

**Problem:** The app says your API key is invalid

**Solutions:**
1. Double-check you copied the entire key (no extra spaces)
2. Make sure the key is for the correct service
3. Verify the key is active in the service's dashboard
4. Re-deploy edge functions after updating secrets

---

### "Rate Limit Exceeded" Error

**Problem:** You've hit the API limit

**Solutions:**
1. Wait a few minutes (limits usually reset hourly)
2. Check your usage in the service's dashboard
3. Consider upgrading your plan if you need more requests

---

### "Function Not Found" Error

**Problem:** Edge function returns 404

**Solutions:**
1. Make sure you deployed the functions:
   ```bash
   npx supabase functions deploy --project-ref yydgrcfsndkdngjhptsm
   ```
2. Wait a minute for deployment to propagate
3. Refresh your browser

---

### "Insufficient Credits" Error

**Problem:** Anthropic says you don't have enough credits

**Solutions:**
1. Go to https://console.anthropic.com/
2. Click "Billing" in the left menu
3. Add credits to your account
4. Most users need $5-10 for testing

---

### Still Having Issues?

1. **Check Supabase Logs:**
   - Go to your Supabase Dashboard
   - Click "Edge Functions"
   - Click "Logs"
   - Look for error messages

2. **Verify Secrets:**
   - Go to Edge Functions > Secrets
   - Make sure all required secrets are listed
   - Re-add any that are missing

3. **Test Edge Functions Directly:**
   ```bash
   curl -X OPTIONS "https://yydgrcfsndkdngjhptsm.supabase.co/functions/v1/analyze-lawn"
   ```
   Should return HTTP 200

---

## 💡 Pro Tips

### Save Money on API Calls

- **Cache results:** Don't re-scan the same photo
- **Use wisely:** Only scan when needed
- **Free tiers:** Start with free plans for testing

### Monitor Your Usage

- **Plant.id:** Check dashboard weekly
- **Anthropic:** Enable billing alerts at $10, $25, $50
- **Set budgets:** Use the service's budget tools

### Security Best Practices

- ✅ Never share your API keys
- ✅ Never commit keys to git (they're in Supabase)
- ✅ Rotate keys every 90 days
- ✅ Use different keys for dev/production

---

## 📚 Additional Resources

- **Plant.id Documentation:** https://plant.id/docs
- **Anthropic Documentation:** https://docs.anthropic.com
- **Supabase Documentation:** https://supabase.com/docs
- **Full Testing Guide:** See `docs/API_TESTING_GUIDE.md`

---

## 🎊 You're All Set!

Your Lawn Guardian app is now configured and ready to use!

Start scanning lawns and helping users maintain beautiful, healthy grass.

Happy lawn analyzing! 🌱
