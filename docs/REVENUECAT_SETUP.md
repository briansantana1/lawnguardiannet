# RevenueCat Setup Guide for Lawn Guardian

This guide walks you through setting up RevenueCat for in-app subscriptions on iOS and Android.

## Overview

RevenueCat provides a unified API for handling in-app purchases across both platforms, handling:
- Receipt validation
- Subscription status tracking
- Cross-platform purchase syncing
- Analytics and insights
- Webhook integrations

## Prerequisites

Before starting, ensure you have:
- An Apple Developer account (for iOS)
- A Google Play Developer account (for Android)
- App Store Connect app created with bundle ID: `com.lawnguardian.app`
- Google Play Console app created with package name: `com.lawnguardian.app`

---

## Step 1: Create RevenueCat Account

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Sign up or log in
3. Create a new project called "Lawn Guardian"

---

## Step 2: Add Your Apps

### iOS App Setup

1. In RevenueCat dashboard, go to **Project Settings** → **Apps**
2. Click **+ New App** → **App Store**
3. Enter:
   - **App name**: Lawn Guardian iOS
   - **Bundle ID**: `com.lawnguardian.app`
4. **App Store Connect Shared Secret** (required):
   - Go to App Store Connect → Your App → App Information
   - Under "App-Specific Shared Secret", click **Manage**
   - Generate or copy the shared secret
   - Paste into RevenueCat

### Android App Setup

1. Click **+ New App** → **Play Store**
2. Enter:
   - **App name**: Lawn Guardian Android
   - **Package name**: `com.lawnguardian.app`
3. **Google Play Service Credentials** (required):
   - Follow RevenueCat's guide: [Creating Google Service Credentials](https://www.revenuecat.com/docs/creating-play-service-credentials)
   - Upload the JSON key file to RevenueCat

---

## Step 3: Create Products in App Stores

### App Store Connect (iOS)

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app → **Monetization** → **Subscriptions**
3. Create a **Subscription Group** called "Pro Subscriptions"
4. Add subscriptions:

**Pro Monthly:**
- Product ID: `com.lawnguardian.pro.monthly`
- Reference Name: Pro Monthly
- Duration: 1 Month
- Price: $9.99 USD (set appropriate regional prices)

**Pro Annual:**
- Product ID: `com.lawnguardian.pro.annual`
- Reference Name: Pro Annual
- Duration: 1 Year
- Price: $79.99 USD (set appropriate regional prices)

5. Fill in required metadata (description, App Store localization)
6. Submit for review or use sandbox for testing

### Google Play Console (Android)

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app → **Monetization** → **Products** → **Subscriptions**
3. Create subscriptions:

**Pro Monthly:**
- Product ID: `pro_monthly`
- Name: Pro Monthly
- Description: Unlimited AI lawn scans
- Default price: $9.99
- Billing period: 1 month
- Add a base plan

**Pro Annual:**
- Product ID: `pro_annual`
- Name: Pro Annual
- Description: Unlimited AI lawn scans - Best Value
- Default price: $79.99
- Billing period: 1 year
- Add a base plan

4. Activate the subscriptions

---

## Step 4: Configure Products in RevenueCat

### Add Products

1. In RevenueCat, go to **Products**
2. Click **+ New Product**
3. Add iOS products:
   - Identifier: `com.lawnguardian.pro.monthly`
   - App: Lawn Guardian iOS
   - Identifier: `com.lawnguardian.pro.annual`
   - App: Lawn Guardian iOS
4. Add Android products:
   - Identifier: `pro_monthly`
   - App: Lawn Guardian Android
   - Identifier: `pro_annual`
   - App: Lawn Guardian Android

### Create Entitlement

1. Go to **Entitlements** → **+ New Entitlement**
2. Create:
   - Identifier: `pro`
   - Description: Pro access to all features
3. Attach all 4 products to this entitlement

### Create Offering

1. Go to **Offerings** → **+ New Offering**
2. Create:
   - Identifier: `default`
   - Description: Default offering
3. Add packages:
   - `$rc_monthly` → attach `com.lawnguardian.pro.monthly` (iOS) and `pro_monthly` (Android)
   - `$rc_annual` → attach `com.lawnguardian.pro.annual` (iOS) and `pro_annual` (Android)
4. Set as **Current Offering**

---

## Step 5: Get API Keys

1. In RevenueCat, go to **Project Settings** → **API Keys**
2. Copy the **Public App-Specific API Keys**:
   - iOS/Apple: starts with `appl_`
   - Android/Google: starts with `goog_`

⚠️ **Important**: Use PUBLIC keys only. Never expose secret keys in your app.

---

## Step 6: Configure Environment Variables

Add to your `.env` file:

```bash
# RevenueCat API Keys (PUBLIC keys only!)
VITE_REVENUECAT_APPLE_API_KEY=appl_xxxxxxxxxxxxxxxxxxxxxxxx
VITE_REVENUECAT_GOOGLE_API_KEY=goog_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 7: Test In Sandbox

### iOS Testing

1. Create a **Sandbox Tester** in App Store Connect:
   - Users and Access → Sandbox → Testers
   - Add a new tester with a test email

2. On your test device:
   - Sign out of App Store (Settings → Sign out)
   - Don't sign in until prompted during purchase
   - Run the app and attempt purchase
   - Sign in with sandbox tester credentials when prompted

### Android Testing

1. Add license testers in Google Play Console:
   - Settings → License Testing
   - Add tester emails

2. Create an internal testing track or closed test
3. Upload your APK/AAB
4. Opt-in testers via the test URL
5. Purchases will be test purchases (no real charges)

---

## Step 8: Configure Webhooks (Optional but Recommended)

For real-time subscription updates:

### RevenueCat Webhook → Supabase

1. In RevenueCat, go to **Integrations** → **Webhooks**
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/revenuecat-webhook`
3. Select events to send:
   - `INITIAL_PURCHASE`
   - `RENEWAL`
   - `CANCELLATION`
   - `EXPIRATION`
   - `BILLING_ISSUE`
   - `PRODUCT_CHANGE`

4. Create the Supabase Edge Function (optional - for syncing with your database):

```typescript
// supabase/functions/revenuecat-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  
  // Verify webhook authenticity (use RevenueCat webhook auth header)
  if (authHeader !== `Bearer ${Deno.env.get('REVENUECAT_WEBHOOK_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const event = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Extract user ID and subscription info
  const userId = event.subscriber_attributes?.$supabaseUserId?.value
  const eventType = event.event.type
  const productId = event.event.product_id

  // Update subscription status in database
  if (userId) {
    const status = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION'].includes(eventType) 
      ? 'active' 
      : eventType === 'CANCELLATION' 
        ? 'cancelled'
        : eventType === 'EXPIRATION'
          ? 'expired'
          : 'unknown'

    await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        status,
        plan_id: productId.includes('annual') ? 'pro_annual' : 'pro_monthly',
        metadata: { revenuecat_event: eventType }
      }, {
        onConflict: 'user_id,platform'
      })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   iOS App       │     │  RevenueCat     │     │   App Store     │
│   (StoreKit)    │────▶│  SDK/API        │────▶│   Connect       │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
┌─────────────────┐              │              ┌─────────────────┐
│  Android App    │              │              │  Google Play    │
│  (Play Billing) │─────────────▶├─────────────▶│   Console       │
└─────────────────┘              │              └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   Supabase      │
                        │   (Webhooks)    │
                        └─────────────────┘
```

---

## Troubleshooting

### Common Issues

**"No offerings available"**
- Ensure products are created in both app stores
- Verify products are attached to the offering
- Check that the offering is set as "current"
- Products may need approval in App Store Connect

**"Purchase failed"**
- On iOS, ensure you're signed in with sandbox tester
- On Android, ensure the tester is opted into testing track
- Check device logs for specific error codes

**"API key not configured"**
- Verify `.env` file has correct API keys
- Ensure keys start with `appl_` (iOS) or `goog_` (Android)
- Rebuild the app after updating environment variables

### Debug Mode

In development, RevenueCat logs are enabled automatically. Check:
- Browser console (for web development)
- Xcode console (for iOS)
- Android Studio logcat (for Android)

---

## Checklist

- [ ] RevenueCat account created
- [ ] iOS app added with App Store shared secret
- [ ] Android app added with service credentials
- [ ] Products created in App Store Connect
- [ ] Products created in Google Play Console
- [ ] Products added to RevenueCat
- [ ] "pro" entitlement created with all products attached
- [ ] "default" offering created with packages
- [ ] API keys added to `.env`
- [ ] Sandbox testing verified on iOS
- [ ] License testing verified on Android
- [ ] (Optional) Webhook integration configured

---

## Resources

- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [RevenueCat Capacitor Plugin](https://www.revenuecat.com/docs/capacitor)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)

