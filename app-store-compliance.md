# App Store Compliance Guide

This document outlines the compliance requirements and implementation details for deploying Lawn Guardian to the Apple App Store and Google Play Store.

## Table of Contents
1. [Apple App Store Requirements](#apple-app-store-requirements)
2. [Google Play Store Requirements](#google-play-store-requirements)
3. [Environment Variables](#environment-variables)
4. [Testing Subscriptions](#testing-subscriptions)
5. [Webhook Configuration](#webhook-configuration)
6. [GDPR/CCPA Compliance](#gdprcppa-compliance)
7. [Security Implementation](#security-implementation)
8. [Deployment Checklist](#deployment-checklist)

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
- ✅ **Delete Account** - Implemented via `delete_user_account_v2` function
- ✅ **Sign in with Apple** - Required if any social sign-in is offered
- ✅ **Privacy Manifest** - `PrivacyInfo.xcprivacy` included

### Privacy Manifest (PrivacyInfo.xcprivacy)

The privacy manifest is located at `ios/App/App/PrivacyInfo.xcprivacy` and declares:

- **NSPrivacyTracking**: false (we don't track users)
- **Collected Data Types**: Email, Name, Photos, Location, Purchase History, Device ID, Usage Data, Crash Data
- **Accessed APIs**: UserDefaults, File Timestamp, System Boot Time, Disk Space

### iOS Info.plist Configuration

The `Info.plist` includes all required usage descriptions:
- `NSCameraUsageDescription` - Camera access for lawn photos
- `NSPhotoLibraryUsageDescription` - Photo library access
- `NSLocationWhenInUseUsageDescription` - Location for weather features
- `NSLocationAlwaysAndWhenInUseUsageDescription` - Background location

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
- ✅ **Google Sign-In** - Implemented for easy authentication

### Data Safety Declaration

| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email address | Yes | No | Account management |
| Name | Yes | No | Personalization |
| Photos | Yes | No | App functionality (lawn analysis) |
| Approximate location | Yes | No | Weather data for lawn care |
| Purchase history | Yes | No | Subscription management |
| App interactions | Yes | No | Analytics |
| Crash logs | Yes | No | App stability |

---

## Environment Variables

Add these secrets to your Supabase project:

```bash
# Apple App Store
APPLE_SHARED_SECRET=your_apple_shared_secret
APPLE_BUNDLE_ID=com.lawnguardian.app

# Google Play Store
GOOGLE_PLAY_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
GOOGLE_PLAY_PACKAGE_NAME=com.lawnguardian.app

# Plant.id API (existing)
PLANT_ID_API_KEY=your_plant_id_key
LOVABLE_API_KEY=your_lovable_api_key

# Cron Job Secret (for subscription sync)
CRON_SECRET=your_random_secret_for_cron_jobs
```

### Setting Secrets via Supabase CLI

```bash
# Set Apple shared secret
supabase secrets set APPLE_SHARED_SECRET=your_secret_here
supabase secrets set APPLE_BUNDLE_ID=com.lawnguardian.app

# Set Google Play credentials (escape JSON properly)
supabase secrets set GOOGLE_PLAY_CREDENTIALS='{"type":"service_account",...}'

# Set package name
supabase secrets set GOOGLE_PLAY_PACKAGE_NAME=com.lawnguardian.app

# Set cron secret
supabase secrets set CRON_SECRET=$(openssl rand -hex 32)
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
supabase functions logs sync-subscriptions --follow
```

---

## GDPR/CCPA Compliance

### Implemented Features

1. **Consent Management**
   - `user_consents` table tracks all consent types
   - Auto-created on user signup via trigger
   - `useConsent` hook for frontend consent management

2. **Data Export (Right to Portability)**
   - `export-user-data` Edge Function
   - Exports all user data in JSON format
   - Rate limited to 1 export per hour

3. **Account Deletion (Right to Erasure)**
   - `delete_user_account_v2` function
   - Cascading deletion of all user data
   - Deletion request records retained for 30 days

4. **Consent Types Tracked**
   - `privacy_policy` - Required
   - `terms_of_service` - Required
   - `marketing_emails` - Optional
   - `push_notifications` - Optional
   - `location_tracking` - Optional
   - `analytics` - Default on
   - `data_processing` - Required

### Database Functions

```sql
-- Record consent
SELECT record_consent(user_id, 'marketing_emails', true, '2025-01-06');

-- Get all user consents
SELECT * FROM get_user_consents(user_id);

-- Export user data
SELECT get_user_export_data(user_id);

-- Delete account
SELECT delete_user_account_v2(user_id);
```

---

## Security Implementation

### Authentication

- **Email/Password** - Standard Supabase auth
- **Sign in with Apple** - Required by App Store if offering social sign-in
- **Google Sign-In** - Convenient for Android users
- **OAuth 2.0** - Industry standard

### Webhook Security

1. **Apple Webhook**
   - JWT signature verification using Apple's JWKS
   - Bundle ID validation
   - Sandbox/Production environment handling

2. **Google Webhook**
   - Service account authentication
   - Message ID deduplication
   - Purchase token verification

### Rate Limiting

- `rate_limits` table tracks API calls
- `check_rate_limit` function enforces limits
- Default: 100 requests per 15 minutes

### Audit Logging

- `audit_log` table records security events
- Automatic logging on signup, consent changes, etc.
- 90-day retention for standard logs

### Row Level Security

All tables have RLS enabled:
- Users can only access their own data
- Service role has full access for backend operations

---

## Database Schema

The subscription system uses these tables:

- `subscription_plans` - Available subscription tiers
- `user_subscriptions` - Active user subscriptions
- `subscription_receipts` - Receipt validation history
- `subscription_events` - Audit log for all events
- `scan_usage` - Monthly scan tracking for free tier
- `user_consents` - GDPR consent records
- `data_export_requests` - Data export request tracking
- `account_deletion_requests` - Deletion request tracking
- `rate_limits` - API rate limiting
- `audit_log` - Security event logging

### Key Functions

- `has_active_subscription(user_id)` - Check if user has active sub
- `get_subscription_status(user_id)` - Get full subscription details
- `increment_scan_usage(user_id)` - Record a scan for free tier
- `delete_user_account_v2(user_id)` - GDPR-compliant account deletion
- `record_consent(...)` - Record user consent
- `get_user_export_data(user_id)` - Export all user data
- `check_rate_limit(...)` - Check API rate limit

---

## Deployment Checklist

### Before Submission

#### Apple App Store
- [ ] Update `capacitor.config.ts` with production appId
- [ ] Set correct bundle ID in Xcode project
- [ ] Configure signing certificates and provisioning profiles
- [ ] In-App Purchases created and approved in App Store Connect
- [ ] Server notifications V2 configured
- [ ] Privacy Policy URL set in App Store Connect
- [ ] App Privacy nutrition labels filled out
- [ ] Review notes explain subscription features
- [ ] Screenshots show subscription UI
- [ ] Privacy Manifest (`PrivacyInfo.xcprivacy`) included
- [ ] Sign in with Apple configured in App Store Connect
- [ ] Test with sandbox accounts

#### Google Play Store
- [ ] Update `capacitor.config.ts` with production appId
- [ ] Set correct package name in Android project
- [ ] Configure signing key in Google Play Console
- [ ] Subscriptions created and active
- [ ] RTDN configured via Cloud Pub/Sub
- [ ] Privacy Policy URL set
- [ ] Data Safety section completed
- [ ] Account deletion instructions provided
- [ ] Content rating questionnaire completed
- [ ] Test with internal testing track

#### Supabase Configuration
- [ ] All secrets configured (see Environment Variables)
- [ ] Edge Functions deployed:
  ```bash
  supabase functions deploy apple-webhook
  supabase functions deploy google-webhook
  supabase functions deploy validate-apple-receipt
  supabase functions deploy validate-google-purchase
  supabase functions deploy restore-purchases
  supabase functions deploy get-subscription-status
  supabase functions deploy export-user-data
  supabase functions deploy sync-subscriptions
  ```
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Cron job configured for `sync-subscriptions`

#### Authentication
- [ ] Apple OAuth configured in Supabase dashboard
- [ ] Google OAuth configured in Supabase dashboard
- [ ] Redirect URLs configured for both providers

### Post-Submission

- [ ] Monitor webhook logs for errors
- [ ] Verify subscription events are being processed
- [ ] Test end-to-end purchase flow
- [ ] Set up alerting for failed transactions
- [ ] Monitor subscription sync job

---

## Support

For subscription-related issues:
- Check Edge Function logs in Supabase dashboard
- Review `subscription_events` table for webhook history
- Verify secrets are set correctly
- Test with sandbox/test accounts first

### Common Issues

1. **Apple webhook not receiving events**
   - Verify URL is correct in App Store Connect
   - Check bundle ID matches
   - Ensure function is deployed

2. **Google webhook errors**
   - Verify Pub/Sub subscription is active
   - Check service account permissions
   - Ensure package name matches

3. **Subscriptions not updating**
   - Check `subscription_events` table for errors
   - Verify original transaction ID is being stored
   - Run `sync-subscriptions` manually to debug

### Contact

For technical support: info.lawnguardian@yahoo.com
