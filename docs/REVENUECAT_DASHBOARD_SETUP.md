# RevenueCat Dashboard Configuration Guide

Step-by-step guide to configure RevenueCat dashboard for Lawn Guardian after setting up App Store Connect and Google Play Console.

## Prerequisites

- App Store Connect subscriptions created (see `APP_STORE_CONNECT_SETUP.md`)
- Google Play Console subscriptions created (see `GOOGLE_PLAY_CONSOLE_SETUP.md`)
- RevenueCat account created at https://app.revenuecat.com

---

## Step 1: Add Your Apps (If Not Done)

### Add iOS App

1. Go to **Project Settings** → **Apps**
2. Click **+ New App** → **App Store**
3. Enter:
   - **App name**: `Lawn Guardian iOS`
   - **Bundle ID**: `com.lawnguardian.app`
4. Click **Save**

### Configure iOS App Store Connection

1. Click on your iOS app
2. Under **App Store Connect API**, enter:
   - **App-Specific Shared Secret**: (from App Store Connect → Your App → App Information → App-Specific Shared Secret)
3. Click **Save**

### Add Android App

1. Click **+ New App** → **Play Store**
2. Enter:
   - **App name**: `Lawn Guardian Android`
   - **Package name**: `com.lawnguardian.app`
3. Click **Save**

### Configure Android Play Store Connection

1. Click on your Android app
2. Under **Google Play Store credentials**, upload:
   - **Service Account JSON**: (the key file you downloaded from Google Cloud Console)
3. Click **Save**
4. Click **Verify credentials** to confirm connection

---

## Step 2: Add Products

Go to **Products** in the left sidebar.

### Add iOS Products

1. Click **+ New Product**
2. For **Pro Monthly**:
   - **Identifier**: `com.lawnguardian.pro.monthly`
   - **App**: Select `Lawn Guardian iOS`
   - **Display Name**: `Pro Monthly`
3. Click **Add**

4. Click **+ New Product**
5. For **Pro Annual**:
   - **Identifier**: `com.lawnguardian.pro.annual`
   - **App**: Select `Lawn Guardian iOS`
   - **Display Name**: `Pro Annual`
6. Click **Add**

### Add Android Products

1. Click **+ New Product**
2. For **Pro Monthly**:
   - **Identifier**: `pro_monthly`
   - **App**: Select `Lawn Guardian Android`
   - **Display Name**: `Pro Monthly`
3. Click **Add**

4. Click **+ New Product**
5. For **Pro Annual**:
   - **Identifier**: `pro_annual`
   - **App**: Select `Lawn Guardian Android`
   - **Display Name**: `Pro Annual`
6. Click **Add**

You should now have 4 products total.

---

## Step 3: Create Entitlement

Entitlements represent the features/access levels users unlock.

1. Go to **Entitlements** in the left sidebar
2. Click **+ New Entitlement**
3. Fill in:
   - **Identifier**: `pro`
   - **Description**: `Pro access - unlimited scans, full reports`
4. Click **Add**

### Attach Products to Entitlement

1. Click on the `pro` entitlement
2. Click **Attach Products**
3. Select all 4 products:
   - ✓ `com.lawnguardian.pro.monthly` (iOS)
   - ✓ `com.lawnguardian.pro.annual` (iOS)
   - ✓ `pro_monthly` (Android)
   - ✓ `pro_annual` (Android)
4. Click **Add**

Now any of these products will grant the "pro" entitlement.

---

## Step 4: Create Offering

Offerings define which products are shown to users.

1. Go to **Offerings** in the left sidebar
2. Click **+ New Offering**
3. Fill in:
   - **Identifier**: `default`
   - **Description**: `Default offering shown to all users`
4. Click **Add**

### Add Packages to Offering

1. Click on the `default` offering
2. Click **+ New Package**

#### Add Monthly Package

1. Select **Package Type**: `$rc_monthly` (RevenueCat monthly identifier)
2. Click **Add**
3. In the package, click **Attach Product**
4. Select:
   - `com.lawnguardian.pro.monthly` for iOS
   - `pro_monthly` for Android
5. Click **Attach**

#### Add Annual Package

1. Click **+ New Package**
2. Select **Package Type**: `$rc_annual` (RevenueCat annual identifier)
3. Click **Add**
4. In the package, click **Attach Product**
5. Select:
   - `com.lawnguardian.pro.annual` for iOS
   - `pro_annual` for Android
6. Click **Attach**

### Set Current Offering

1. Go back to **Offerings** list
2. Click the **•••** menu next to `default`
3. Select **Make Current**

The `default` offering is now the one your app will load.

---

## Step 5: Get API Keys

1. Go to **Project Settings** → **API Keys**
2. Copy the **Public app-specific API keys**:

| Platform | Key Prefix | Use For |
|----------|------------|---------|
| Apple | `appl_xxxxx` | iOS app |
| Google | `goog_xxxxx` | Android app |

3. Add to your `.env` file:
```bash
VITE_REVENUECAT_APPLE_API_KEY=appl_your_actual_key
VITE_REVENUECAT_GOOGLE_API_KEY=goog_your_actual_key
```

---

## Step 6: Configure Webhooks (Optional)

For real-time subscription updates to your backend:

1. Go to **Integrations** → **Webhooks**
2. Click **+ New**
3. Enter:
   - **Webhook URL**: `https://your-project.supabase.co/functions/v1/revenuecat-webhook`
   - **Authorization Header**: (create a secret and add to Supabase)
4. Select events:
   - ✓ INITIAL_PURCHASE
   - ✓ RENEWAL
   - ✓ CANCELLATION
   - ✓ UNCANCELLATION
   - ✓ EXPIRATION
   - ✓ BILLING_ISSUE
   - ✓ PRODUCT_CHANGE
5. Click **Save**

---

## Step 7: Configure User Attributes (Optional)

To track users across platforms:

1. Go to **Project Settings** → **User attributes**
2. Enable **Transfer behavior**: Merge
3. This allows users to restore purchases across devices

---

## Final Configuration Summary

### Products (4 total)
| Product ID | Platform | Price |
|------------|----------|-------|
| `com.lawnguardian.pro.monthly` | iOS | $9.99/mo |
| `com.lawnguardian.pro.annual` | iOS | $79.99/yr |
| `pro_monthly` | Android | $9.99/mo |
| `pro_annual` | Android | $79.99/yr |

### Entitlement
| Entitlement ID | Products Attached |
|----------------|-------------------|
| `pro` | All 4 products |

### Offering
| Offering ID | Packages |
|-------------|----------|
| `default` | `$rc_monthly`, `$rc_annual` |

---

## Testing Checklist

- [ ] iOS products showing in RevenueCat dashboard
- [ ] Android products showing in RevenueCat dashboard
- [ ] Products attached to "pro" entitlement
- [ ] "default" offering set as current
- [ ] Packages have products attached for both platforms
- [ ] API keys copied to `.env` file
- [ ] (Optional) Webhooks configured

---

## Verify Setup

Run your app and check the RevenueCat debug panel (in development):

1. Start your app: `npm run dev`
2. Navigate to a page with `<RevenueCatDebug />` component
3. Verify:
   - ✓ SDK Initialized
   - ✓ Offerings loaded
   - ✓ Products available

Or check the RevenueCat dashboard:
1. Go to **Customers** → **Charts**
2. You should see test events as you use the app

---

## Troubleshooting

### No offerings appearing

- Verify "default" offering is set as current
- Check packages have products attached
- Ensure API keys are correct
- Wait a few minutes for changes to propagate

### Products not syncing

- iOS: Verify shared secret is correct
- Android: Verify service account credentials
- Check products are activated in app stores

### Entitlement not granted after purchase

- Verify products are attached to entitlement
- Check purchase is being processed (see Events tab)
- Verify webhook is receiving events (if configured)

---

## Resources

- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [Configuring Products](https://www.revenuecat.com/docs/entitlements)
- [Testing Purchases](https://www.revenuecat.com/docs/sandbox-testing)

