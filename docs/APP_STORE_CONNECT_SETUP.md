# App Store Connect Setup Guide

Complete guide for configuring in-app subscriptions in App Store Connect for Lawn Guardian.

## Prerequisites

- Apple Developer account ($99/year)
- App created in App Store Connect with bundle ID: `com.lawnguardian.app`
- Banking and tax information completed in App Store Connect

---

## Step 1: Access App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with your Apple Developer account
3. Click **My Apps**
4. Select **Lawn Guardian** (or create new app if needed)

---

## Step 2: Create Subscription Group

1. In your app, go to **Monetization** → **Subscriptions**
2. Click **Create** to create a new subscription group
3. Fill in:
   - **Reference Name**: `Pro Subscriptions`
   - **Subscription Group Localization**:
     - Display Name: `Pro Subscriptions`
     - App Name (optional): `Lawn Guardian`

---

## Step 3: Create Monthly Subscription

1. In the subscription group, click **Create** → **Create Subscription**
2. Fill in **Reference Name**: `Pro Monthly`
3. Fill in **Product ID**: `com.lawnguardian.pro.monthly`
   
   ⚠️ **Important**: Product ID must match exactly what's in your code!

4. Click **Create**

### Configure Subscription Details

**Subscription Duration:**
- Select **1 Month**

**Subscription Prices:**
1. Click **Add Subscription Price**
2. Select base country (e.g., United States)
3. Set price: **$9.99**
4. Click **Next** → Apple auto-generates international prices
5. Review and click **Create**

**App Store Localization:**
1. Click **Add Localization**
2. Select **English (U.S.)**
3. Fill in:
   - **Subscription Display Name**: `Pro Monthly`
   - **Description**: `Unlimited AI lawn scans, detailed diagnosis reports, and personalized treatment plans. Cancel anytime.`
4. Click **Save**

**App Store Promotion (Optional):**
- Add promotional image (1024 x 1024 px)

---

## Step 4: Create Annual Subscription

1. In the subscription group, click **Create** → **Create Subscription**
2. Fill in **Reference Name**: `Pro Annual`
3. Fill in **Product ID**: `com.lawnguardian.pro.annual`
4. Click **Create**

### Configure Subscription Details

**Subscription Duration:**
- Select **1 Year**

**Subscription Prices:**
1. Click **Add Subscription Price**
2. Select base country (e.g., United States)
3. Set price: **$79.99** (33% savings vs monthly)
4. Click **Next** → Apple auto-generates international prices
5. Review and click **Create**

**App Store Localization:**
1. Click **Add Localization**
2. Select **English (U.S.)**
3. Fill in:
   - **Subscription Display Name**: `Pro Annual`
   - **Description**: `Best value! Save 33% with annual billing. Includes all Pro features: unlimited AI lawn scans, detailed reports, and treatment plans.`
4. Click **Save**

---

## Step 5: Configure Free Trial (Optional but Recommended)

For each subscription:

1. Go to the subscription
2. Click **Subscription Prices** → **Set Up Introductory Offer**
3. Configure:
   - **Type**: Free Trial
   - **Duration**: 7 days
   - **Eligibility**: New subscribers
4. Click **Save**

---

## Step 6: Set Subscription Group Ranking

The ranking determines which subscription is shown first in the App Store:

1. Go to your subscription group
2. Drag subscriptions to set order:
   - **Level 1**: Pro Annual (highest value)
   - **Level 2**: Pro Monthly

---

## Step 7: Configure App-Specific Shared Secret

This is needed for RevenueCat:

1. Go to your app in App Store Connect
2. Click **App Information** (under General)
3. Scroll to **App-Specific Shared Secret**
4. Click **Manage** → **Generate**
5. Copy the secret
6. Paste into RevenueCat dashboard (Apps → iOS → App Store Connect API)

---

## Step 8: Submit for Review

Subscriptions must be submitted with a new app version:

1. Create a new app version
2. Go to **In-App Purchases** section
3. Add your subscriptions
4. Submit for review along with your app

---

## Step 9: Set Up Sandbox Testing

### Create Sandbox Tester

1. Go to **Users and Access** (top menu)
2. Click **Sandbox** → **Testers**
3. Click **+** to add a new tester
4. Fill in:
   - First Name, Last Name
   - Email (use a unique email, cannot be an existing Apple ID)
   - Password
   - Country/Region

### Test on Device

1. On your test device, go to **Settings** → **App Store**
2. Scroll down and tap **Sandbox Account**
3. Sign in with your sandbox tester credentials
4. Open your app and test purchases

**Sandbox Purchase Flow:**
- Subscriptions renew rapidly in sandbox:
  - 1 week → 3 minutes
  - 1 month → 5 minutes
  - 1 year → 1 hour
- No actual charges occur

---

## Subscription Product Summary

| Product | Product ID | Price | Duration |
|---------|-----------|-------|----------|
| Pro Monthly | `com.lawnguardian.pro.monthly` | $9.99 | 1 Month |
| Pro Annual | `com.lawnguardian.pro.annual` | $79.99 | 1 Year |

---

## Checklist

- [ ] Subscription group created: "Pro Subscriptions"
- [ ] Monthly subscription created with correct Product ID
- [ ] Monthly subscription price set: $9.99
- [ ] Monthly subscription localization added
- [ ] Annual subscription created with correct Product ID
- [ ] Annual subscription price set: $79.99
- [ ] Annual subscription localization added
- [ ] Free trials configured (optional)
- [ ] Subscription ranking set
- [ ] App-specific shared secret generated and copied to RevenueCat
- [ ] Sandbox tester created
- [ ] Sandbox testing verified

---

## Troubleshooting

### "Product not found" in sandbox

- Ensure Product IDs match exactly (case-sensitive)
- Wait 15-30 minutes after creating products
- Make sure you're signed into sandbox account on device

### "Cannot connect to iTunes Store"

- Check internet connection
- Verify sandbox account is correctly set up
- Try signing out and back into sandbox account

### Subscription not appearing

- Verify subscription is in "Ready to Submit" or "Approved" status
- Check subscription group is properly configured
- Ensure app bundle ID matches

---

## Resources

- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Auto-Renewable Subscriptions](https://developer.apple.com/documentation/storekit/in-app_purchase/original_api_for_in-app_purchase/subscriptions_and_offers)
- [Sandbox Testing Guide](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox)

