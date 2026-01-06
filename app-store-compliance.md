# App Store Compliance Guide

This document outlines the compliance requirements and implementation details for deploying Lawn Guardian to the Apple App Store and Google Play Store.

## Table of Contents
1. [Apple App Store Requirements](#apple-app-store-requirements)
2. [Google Play Store Requirements](#google-play-store-requirements)
3. [Environment Variables](#environment-variables)
4. [Testing Subscriptions](#testing-subscriptions)
5. [Webhook Configuration](#webhook-configuration)

---

## Apple App Store Requirements

### App Store Connect Configuration

1. **Create In-App Purchase Products**
   - Navigate to App Store Connect > Your App > Features > In-App Purchases
   - Create two subscription products:
     - `com.lawnguardian.pro.monthly` - $9.99/month
     - `com.lawnguardian.pro.annual` - $79.99/year

2. **Configure Subscription Group**
   - Create a subscription group named "Lawn Guardian Pro"
   - Add both products to this group
   - Set upgrade/downgrade rules

3. **App Store Server Notifications V2**
   - Navigate to App Store Connect > Your App > App Information
   - Set Production Server URL: `https://<your-supabase-project>.supabase.co/functions/v1/apple-webhook`
   - Set Sandbox Server URL: Same URL (function handles both environments)
   - Select Notification Version: Version 2

4. **Shared Secret**
   - Generate a shared secret in App Store Connect
   - Add to Supabase secrets: `APPLE_SHARED_SECRET`

### Required App Features

- ✅ **Restore Purchases Button** - Implemented in subscription settings
- ✅ **Cancel Subscription Info** - Link to Apple subscription management
- ✅ **Privacy Policy** - `/privacy-policy` route
- ✅ **Terms of Use** - `/terms-of-use` route
- ✅ **Delete Account** - Implemented via `delete_user_account` function

### Privacy Manifest (PrivacyInfo.xcprivacy)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeEmailAddress</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <true/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypePhotos</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <true/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypePreciseLocation</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <false/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypePurchaseHistory</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <true/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
    </array>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

---

## Google Play Store Requirements

### Google Play Console Configuration

1. **Create Subscription Products**
   - Navigate to Google Play Console > Your App > Monetize > Products > Subscriptions
   - Create two subscription products:
     - `pro_monthly` - $9.99/month
     - `pro_annual` - $79.99/year

2. **Configure Base Plans**
   - For each subscription, create a base plan
   - Set billing period and price
   - Optionally add free trial offers

3. **Real-time Developer Notifications (RTDN)**
   - Create a Cloud Pub/Sub topic in Google Cloud Console
   - Configure RTDN in Google Play Console to publish to this topic
   - Create a push subscription pointing to: `https://<your-supabase-project>.supabase.co/functions/v1/google-webhook`

4. **Service Account**
   - Create a service account in Google Cloud Console
   - Grant "Pub/Sub Subscriber" and "Android Publisher" roles
   - Download JSON key file
   - Add entire JSON as Supabase secret: `GOOGLE_PLAY_CREDENTIALS`

### Required App Features

- ✅ **Restore Purchases** - Implemented via BillingClient
- ✅ **Subscription Management** - Link to Play Store subscription management
- ✅ **Privacy Policy** - Required URL in Play Console
- ✅ **Data Safety Section** - Filled in Play Console
- ✅ **Delete Account** - Implemented and listed in Data Safety

### Data Safety Declaration

| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email address | Yes | No | Account management |
| Photos | Yes | No | App functionality (lawn analysis) |
| Approximate location | Yes | No | Weather data for lawn care |
| Purchase history | Yes | No | Subscription management |

---

## Environment Variables

Add these secrets to your Supabase project:

```bash
# Apple App Store
APPLE_SHARED_SECRET=your_apple_shared_secret

# Google Play Store
GOOGLE_PLAY_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
GOOGLE_PLAY_PACKAGE_NAME=com.lawnguardian.app

# Plant.id API (existing)
PLANT_ID_API_KEY=your_plant_id_key
```

### Setting Secrets via Supabase CLI

```bash
# Set Apple shared secret
supabase secrets set APPLE_SHARED_SECRET=your_secret_here

# Set Google Play credentials (escape JSON properly)
supabase secrets set GOOGLE_PLAY_CREDENTIALS='{"type":"service_account",...}'

# Set package name
supabase secrets set GOOGLE_PLAY_PACKAGE_NAME=com.lawnguardian.app
```

---

## Testing Subscriptions

### Apple Sandbox Testing

1. Create sandbox tester accounts in App Store Connect
2. Sign out of App Store on test device
3. Sign in with sandbox account when prompted during purchase
4. Use short subscription renewal periods (sandbox accelerates time)

### Google Play Test Tracks

1. Add test accounts to internal testing track
2. Use license testing for instant approvals
3. Test with real payment methods on closed testing

### Webhook Testing

Use the Supabase dashboard to view Edge Function logs:

```bash
supabase functions logs apple-webhook --follow
supabase functions logs google-webhook --follow
```

---

## Database Schema

The subscription system uses these tables:

- `subscription_plans` - Available subscription tiers
- `user_subscriptions` - Active user subscriptions
- `subscription_receipts` - Receipt validation history
- `subscription_events` - Audit log for all events
- `scan_usage` - Monthly scan tracking for free tier

### Key Functions

- `has_active_subscription(user_id)` - Check if user has active sub
- `get_subscription_status(user_id)` - Get full subscription details
- `increment_scan_usage(user_id)` - Record a scan for free tier
- `delete_user_account(user_id)` - GDPR-compliant account deletion

---

## Checklist Before Submission

### Apple App Store
- [ ] In-App Purchases created and approved
- [ ] Server notifications configured
- [ ] Privacy Policy URL set
- [ ] App Privacy filled out
- [ ] Review notes explain subscription features
- [ ] Screenshots show subscription UI

### Google Play Store
- [ ] Subscriptions created and active
- [ ] RTDN configured
- [ ] Privacy Policy URL set
- [ ] Data Safety section completed
- [ ] Account deletion instructions provided
- [ ] Content rating questionnaire completed

---

## Support

For subscription-related issues:
- Check Edge Function logs in Supabase dashboard
- Review `subscription_events` table for webhook history
- Verify secrets are set correctly
- Test with sandbox/test accounts first

