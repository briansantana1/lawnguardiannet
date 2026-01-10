# Lawn Guardian™ Deployment Guide

Complete deployment guide for Apple App Store and Google Play Store.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Configuration](#supabase-configuration)
3. [RevenueCat Setup](#revenuecat-setup)
4. [Apple App Store Setup](#apple-app-store-setup)
5. [Google Play Store Setup](#google-play-store-setup)
6. [Building the App](#building-the-app)
7. [Submission Checklist](#submission-checklist)

---

## Prerequisites

### Required Accounts

- [Supabase](https://supabase.com) - Backend and authentication
- [RevenueCat](https://www.revenuecat.com) - In-app purchase management
- [Apple Developer Program](https://developer.apple.com/programs/) - $99/year
- [Google Play Console](https://play.google.com/console) - $25 one-time

### Required Software

- Node.js 18+
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- Capacitor CLI

---

## Supabase Configuration

### 1. Set Environment Variables

Create a `.env` file in your project root (don't commit this!):

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# RevenueCat
VITE_REVENUECAT_IOS_API_KEY=appl_your_key
VITE_REVENUECAT_ANDROID_API_KEY=goog_your_key
```

### 2. Configure Auth Providers

#### Apple Sign-In

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → Providers
2. Enable **Apple** provider
3. Configure with:
   - **Services ID**: com.lawnguardian.app.signin
   - **Team ID**: Your Apple Team ID (from Apple Developer Portal)
   - **Key ID**: Create in Apple Developer Portal → Keys → Sign in with Apple
   - **Private Key**: Download .p8 file and paste contents

4. In Apple Developer Portal:
   - Go to Identifiers → App IDs → Your App
   - Enable "Sign in with Apple" capability
   - Create a Services ID for web auth callbacks

5. Add Supabase callback URL to Apple:
   - `https://your-project.supabase.co/auth/v1/callback`

#### Google Sign-In

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → Providers
2. Enable **Google** provider
3. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com):
   - Create a new project or use existing
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

4. Configure in Supabase:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

### 3. Deploy Edge Functions

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Set secrets
npx supabase secrets set APPLE_SHARED_SECRET=your_secret
npx supabase secrets set APPLE_BUNDLE_ID=com.lawnguardian.app
npx supabase secrets set GOOGLE_PLAY_CREDENTIALS='{"type":"service_account",...}'
npx supabase secrets set GOOGLE_PLAY_PACKAGE_NAME=com.lawnguardian.app

# Deploy all functions
npx supabase functions deploy
```

### 4. Run Database Migrations

```bash
npx supabase db push
```

---

## RevenueCat Setup

RevenueCat simplifies in-app purchase management across platforms.

### 1. Create RevenueCat Account

1. Sign up at [RevenueCat](https://www.revenuecat.com)
2. Create a new project
3. Add iOS app with bundle ID: `com.lawnguardian.app`
4. Add Android app with package name: `com.lawnguardian.app`

### 2. Configure Products

1. **iOS Products** (create in App Store Connect first):
   - `com.lawnguardian.pro.monthly` - $9.99/month
   - `com.lawnguardian.pro.annual` - $79.99/year

2. **Android Products** (create in Google Play Console first):
   - `pro_monthly` - $9.99/month
   - `pro_annual` - $79.99/year

3. In RevenueCat, create an **Entitlement**:
   - Name: `pro`
   - Add all products to this entitlement

4. Create an **Offering**:
   - Identifier: `default`
   - Add monthly and annual packages

### 3. Get API Keys

- Go to Project Settings → API Keys
- Copy the iOS and Android public API keys
- Add to your `.env` file

---

## Apple App Store Setup

### 1. App Store Connect Configuration

1. Create app in [App Store Connect](https://appstoreconnect.apple.com)
2. Set Bundle ID: `com.lawnguardian.app`

### 2. In-App Purchases

1. Go to Features → In-App Purchases
2. Create Auto-Renewable Subscriptions:

**Subscription Group**: "Lawn Guardian Pro"

**Products**:

| Product ID | Type | Price | Duration |
|------------|------|-------|----------|
| com.lawnguardian.pro.monthly | Auto-Renewable | $9.99 | 1 Month |
| com.lawnguardian.pro.annual | Auto-Renewable | $79.99 | 1 Year |

3. Add localizations and review information

### 3. Server Notifications (Optional with RevenueCat)

If using RevenueCat, they handle webhook notifications. Otherwise:

1. Go to App Information → App Store Server Notifications
2. Set URL: `https://your-project.supabase.co/functions/v1/apple-webhook`
3. Select Version 2

### 4. App Privacy

Fill out the App Privacy section:

| Data Type | Collected | Linked to User | Tracking |
|-----------|-----------|----------------|----------|
| Contact Info (Email) | Yes | Yes | No |
| Photos | Yes | Yes | No |
| Location | Yes | No | No |
| Identifiers | Yes | No | No |
| Usage Data | Yes | No | No |
| Diagnostics | Yes | No | No |

### 5. Signing & Capabilities

In Xcode, enable these capabilities:
- Sign in with Apple
- In-App Purchase
- Push Notifications
- Associated Domains (for deep links)

---

## Google Play Store Setup

### 1. Play Console Configuration

1. Create app in [Google Play Console](https://play.google.com/console)
2. Set package name: `com.lawnguardian.app`

### 2. Subscriptions

1. Go to Monetize → Products → Subscriptions
2. Create subscriptions:

| Product ID | Base Plan | Price | Duration |
|------------|-----------|-------|----------|
| pro_monthly | monthly-base | $9.99 | 1 Month |
| pro_annual | annual-base | $79.99 | 1 Year |

### 3. Google Play Billing

1. Go to Setup → API access
2. Link to Google Cloud project
3. Create service account with "View financial data" permission
4. Download JSON key for RTDN (if not using RevenueCat)

### 4. Data Safety Section

Complete the Data Safety form:

| Question | Answer |
|----------|--------|
| Does your app collect data? | Yes |
| Is data encrypted in transit? | Yes |
| Can users request data deletion? | Yes |
| Share data with third parties? | No |

Data types collected:
- Email address (Account management)
- Photos (App functionality)
- Approximate location (Weather features)
- App interactions (Analytics)

### 5. Content Rating

Complete the content rating questionnaire:
- ESRB: Everyone
- PEGI: 3

---

## Building the App

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Web Assets

```bash
npm run build
```

### 3. Sync Capacitor

```bash
npx cap sync
```

### 4. Build iOS

```bash
# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Select your team for signing
# 2. Set version and build number
# 3. Product → Archive
# 4. Distribute App → App Store Connect
```

### 5. Build Android

```bash
# Open in Android Studio
npx cap open android

# In Android Studio:
# 1. Build → Generate Signed Bundle/APK
# 2. Select Android App Bundle
# 3. Create/select keystore
# 4. Build for release
```

---

## Submission Checklist

### Before Submitting to App Store

- [ ] App icons and screenshots prepared
- [ ] Privacy Policy URL configured
- [ ] Terms of Service URL configured
- [ ] App description and keywords written
- [ ] In-App Purchases reviewed and approved
- [ ] Privacy Manifest (PrivacyInfo.xcprivacy) included
- [ ] Sign in with Apple configured
- [ ] Tested on physical devices
- [ ] TestFlight beta testing completed

### Before Submitting to Play Store

- [ ] App icons and screenshots prepared
- [ ] Privacy Policy URL configured
- [ ] Data Safety section completed
- [ ] Content rating completed
- [ ] Subscriptions active
- [ ] Google Play Billing tested
- [ ] Signed release bundle generated
- [ ] Internal testing completed

### Required URLs

Make sure these URLs are live and accessible:
- Privacy Policy: `https://yoursite.com/privacy-policy`
- Terms of Service: `https://yoursite.com/terms-of-use`
- Support Email: `info.lawnguardian@yahoo.com`

---

## Troubleshooting

### Common Issues

**1. Apple Sign-In not working**
- Verify Services ID matches configuration
- Check callback URL in Apple Developer Portal
- Ensure capabilities are enabled in Xcode

**2. Google Sign-In not working**
- Verify OAuth credentials are correct
- Check authorized redirect URIs
- Ensure SHA-1 fingerprint is registered (for Android)

**3. In-App Purchases not loading**
- Products must be approved/active in stores
- RevenueCat API keys must be correct
- Test with sandbox/test accounts

**4. Push notifications not received**
- Check APNs certificates (iOS)
- Verify FCM setup (Android)
- Ensure notification permissions granted

### Getting Help

- RevenueCat Support: support@revenuecat.com
- Supabase Discord: discord.supabase.com
- Apple Developer Support: developer.apple.com/support
- Google Play Support: support.google.com/googleplay/android-developer

