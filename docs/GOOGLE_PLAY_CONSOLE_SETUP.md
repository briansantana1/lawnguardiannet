# Google Play Console Setup Guide

Complete guide for configuring in-app subscriptions in Google Play Console for Lawn Guardian.

## Prerequisites

- Google Play Developer account ($25 one-time fee)
- App created in Google Play Console with package name: `com.lawnguardian.app`
- Merchant account set up in Google Play Console

---

## Step 1: Access Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Select **Lawn Guardian** app (or create new app if needed)

---

## Step 2: Set Up Merchant Account (If Not Done)

1. Go to **Settings** → **Developer account** → **Account details**
2. Complete the **Payments profile** section
3. Add banking information for payouts

---

## Step 3: Create Subscriptions

Go to **Monetization** → **Products** → **Subscriptions**

### Create Monthly Subscription

1. Click **Create subscription**
2. Fill in:
   - **Product ID**: `pro_monthly`
   
   ⚠️ **Important**: Product ID must match exactly what's in your code!

3. Click **Create**

### Configure Monthly Subscription Details

**Product details:**
- **Name**: `Pro Monthly`
- **Description**: `Unlimited AI lawn scans, detailed diagnosis reports, and personalized treatment plans. Cancel anytime.`

**Base plan:**
1. Click **Add base plan**
2. Fill in:
   - **Base plan ID**: `pro-monthly-base`
   - **Billing period**: Monthly
   - **Renewal type**: Auto-renewing
3. Click **Set prices**
4. Enter price: **$9.99 USD**
5. Let Google auto-convert other currencies (or customize)
6. Click **Save**
7. Click **Activate** to activate the base plan

### Create Annual Subscription

1. Click **Create subscription**
2. Fill in:
   - **Product ID**: `pro_annual`
3. Click **Create**

### Configure Annual Subscription Details

**Product details:**
- **Name**: `Pro Annual`
- **Description**: `Best value! Save 33% with annual billing. Includes all Pro features: unlimited AI lawn scans, detailed reports, and treatment plans.`

**Base plan:**
1. Click **Add base plan**
2. Fill in:
   - **Base plan ID**: `pro-annual-base`
   - **Billing period**: Yearly
   - **Renewal type**: Auto-renewing
3. Click **Set prices**
4. Enter price: **$79.99 USD**
5. Let Google auto-convert other currencies (or customize)
6. Click **Save**
7. Click **Activate** to activate the base plan

---

## Step 4: Add Free Trial (Optional but Recommended)

For each subscription:

1. Go to the subscription → Base plan
2. Click **Add offer**
3. Select **Free trial**
4. Configure:
   - **Offer ID**: `free-trial-7-days`
   - **Eligibility**: New customers only
   - **Phases**: 
     - Free for 7 days
5. Click **Save**
6. Click **Activate**

---

## Step 5: Configure Grace Period

Grace period allows users to fix payment issues without losing access:

1. Go to **Monetization** → **Monetization settings**
2. Under **Subscription settings**, find **Grace period**
3. Enable and set to **7 days** (recommended)
4. Save changes

---

## Step 6: Set Up Service Account for RevenueCat

RevenueCat needs API access to verify purchases:

### Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project
3. Go to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
5. Fill in:
   - **Name**: `RevenueCat API Access`
   - **ID**: `revenuecat-api`
6. Click **Create and Continue**
7. Skip role assignment, click **Continue**
8. Click **Done**

### Create Key

1. Click on the service account you created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON**
5. Click **Create** (downloads the key file)
6. Keep this file secure!

### Grant Access in Play Console

1. Go to Google Play Console
2. Click **Users and permissions** → **Invite new users**
3. Enter the service account email (e.g., `revenuecat-api@project-id.iam.gserviceaccount.com`)
4. Grant permissions:
   - **Financial data, orders, and cancellation survey responses** → View
   - **Manage orders and subscriptions** → Yes
5. Click **Invite user**
6. Go to **App permissions** and add the Lawn Guardian app

### Upload to RevenueCat

1. Go to RevenueCat Dashboard
2. Go to your Android app
3. Under **Google Play Store configuration**
4. Upload the JSON key file you downloaded
5. Click **Save**

---

## Step 7: Enable Real-time Developer Notifications (RTDN)

This enables RevenueCat to receive instant subscription updates:

1. In Google Play Console, go to **Monetization** → **Monetization settings**
2. Find **Real-time developer notifications**
3. Enter the topic name that RevenueCat provides:
   - Go to RevenueCat → Android app settings → Copy the Pub/Sub topic
   - Format: `projects/your-project/topics/topic-name`
4. Click **Save**

---

## Step 8: Set Up License Testing

### Add License Testers

1. Go to **Settings** → **License testing**
2. Enter tester email addresses (comma-separated)
3. Set **License response**: `RESPOND_NORMALLY`
4. Save

### Internal Testing Track (Alternative)

1. Go to **Testing** → **Internal testing**
2. Create a new release
3. Upload your APK/AAB
4. Add testers
5. Share the opt-in link

---

## Step 9: Test Purchases

### On Physical Device

1. Sign into Google Play with a license tester account
2. Install your app (via internal testing track or debug build)
3. Attempt a purchase
4. Use a test card or the purchase will be automatically voided

### Test Card Numbers

Google provides test card numbers for sandbox testing:
- Test cards are automatically available for license testers
- No real charges occur

### Subscription Behavior in Testing

- Test subscriptions renew much faster:
  - Monthly → every 5 minutes
  - Annual → every 30 minutes
- Subscription auto-cancels after 6 renewals in test mode

---

## Subscription Product Summary

| Product | Product ID | Base Plan ID | Price | Duration |
|---------|-----------|--------------|-------|----------|
| Pro Monthly | `pro_monthly` | `pro-monthly-base` | $9.99 | 1 Month |
| Pro Annual | `pro_annual` | `pro-annual-base` | $79.99 | 1 Year |

---

## Checklist

- [ ] Merchant account configured
- [ ] Monthly subscription created: `pro_monthly`
- [ ] Monthly base plan created and activated
- [ ] Monthly price set: $9.99
- [ ] Annual subscription created: `pro_annual`
- [ ] Annual base plan created and activated
- [ ] Annual price set: $79.99
- [ ] Free trials configured (optional)
- [ ] Grace period enabled
- [ ] Service account created in Google Cloud
- [ ] Service account key downloaded (JSON)
- [ ] Service account added to Play Console with permissions
- [ ] Service account key uploaded to RevenueCat
- [ ] Real-time Developer Notifications configured
- [ ] License testers added
- [ ] Test purchase verified

---

## Troubleshooting

### "Item not found" or "Item unavailable"

- Product IDs must match exactly (case-sensitive)
- Ensure base plan is activated (not just saved)
- Wait 15-30 minutes for products to propagate
- Make sure app is signed with correct key (even for debug)

### "Authentication required"

- Ensure tester is added to license testing
- Sign out and sign back into Google Play
- Clear Google Play cache

### RTDN not working

- Verify Pub/Sub topic is correct
- Check service account has Pub/Sub permissions
- Verify topic in RevenueCat matches exactly

### "Cannot purchase this item"

- Tester must opt-in to testing track
- Or be added as license tester
- Cannot test on emulator (must use physical device)

---

## Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Create Subscriptions](https://developer.android.com/google/play/billing/subscriptions)
- [Testing In-App Billing](https://developer.android.com/google/play/billing/test)
- [Service Account Setup](https://www.revenuecat.com/docs/creating-play-service-credentials)

