# Google Play Store Submission Checklist

> **App:** Lawn Guardian™  
> **Package:** com.lawnguardian.app  
> **Current Version:** 1.0.32 (versionCode 33)  
> **Last Updated:** January 25, 2026

---

## Pre-Submission Requirements

### 1. Google Play Console Setup

- [ ] Google Play Developer account created ($25 one-time fee)
- [ ] Merchant account configured for payments
- [ ] App created with package name: `com.lawnguardian.app`

### 2. App Signing & Build

- [ ] Release keystore created (`android/lawn-guardian-release.keystore`)
- [ ] Keystore credentials in `android/local.properties`:
  ```properties
  RELEASE_STORE_FILE=../lawn-guardian-release.keystore
  RELEASE_STORE_PASSWORD=your_password
  RELEASE_KEY_ALIAS=lawn-guardian
  RELEASE_KEY_PASSWORD=your_key_password
  ```
- [ ] Signed Android App Bundle (AAB) generated
- [ ] AAB tested on physical device

### 3. RevenueCat & In-App Purchases

- [ ] RevenueCat project created
- [ ] Android app added with package: `com.lawnguardian.app`
- [ ] Products created in Google Play Console:
  - [ ] `pro_weekly` - $5.99/week
  - [ ] `pro_annual` - $79.99/year
- [ ] Products linked in RevenueCat
- [ ] Service account key uploaded to RevenueCat
- [ ] RTDN (Real-time Developer Notifications) configured
- [ ] Test purchases verified

---

## Store Listing Assets

### Required Graphics

| Asset | Dimensions | Format | Status |
|-------|------------|--------|--------|
| App Icon | 512 x 512 px | PNG (32-bit) | [ ] |
| Feature Graphic | 1024 x 500 px | PNG/JPEG | [ ] |
| Phone Screenshots (min 4) | 16:9 or 9:16 | PNG/JPEG | [ ] |
| Tablet Screenshots (if supported) | 16:9 | PNG/JPEG | [ ] |

### Store Listing Text

- [ ] **App Name** (30 chars max): `Lawn Guardian™ - AI Lawn Care`
- [ ] **Short Description** (80 chars max):
  ```
  Identify lawn diseases, weeds & pests instantly. AI-powered lawn care diagnosis.
  ```
- [ ] **Full Description** (4000 chars max): See `docs/GOOGLE_PLAY_STORE_LISTING.md`
- [ ] **Category**: House & Home
- [ ] **Tags**: lawn care, garden, AI, plant disease, weed identifier

### Contact Information

- [ ] **Support Email**: info.lawnguardian@yahoo.com
- [ ] **Privacy Policy URL**: https://yoursite.com/privacy-policy
- [ ] **Terms of Service URL**: https://yoursite.com/terms-of-use

---

## Content Rating

Complete the content rating questionnaire:

- [ ] Questionnaire completed
- [ ] Expected ratings:
  - ESRB: Everyone
  - PEGI: 3
  - USK: 0
  - IARC: 3+

---

## Data Safety Section

Answer these questions in Google Play Console:

| Question | Answer |
|----------|--------|
| Does your app collect or share user data? | Yes |
| Is all collected data encrypted in transit? | Yes |
| Do you provide a way for users to request data deletion? | Yes |
| Have you completed the data safety form? | [ ] |

### Data Types Collected

| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email address | Yes | No | Account creation |
| Photos | Yes | No* | Lawn analysis |
| Approximate location | Yes | No | Weather features |
| Purchase history | Yes | No | Subscription management |
| App interactions | Yes | No | Analytics |

*Photos sent to AI APIs for processing only, not stored permanently

---

## Target Audience & Content

- [ ] Target audience: General audience (NOT designed for children)
- [ ] Contains ads: No
- [ ] Contains in-app purchases: Yes

---

## App Release Tracks

### Internal Testing (First Release)

1. [ ] Create internal testing track
2. [ ] Upload AAB
3. [ ] Add internal testers (up to 100)
4. [ ] Test all features:
   - [ ] Sign in (Email/Google)
   - [ ] Camera/photo upload
   - [ ] AI lawn analysis
   - [ ] Weather features
   - [ ] Subscription purchase flow
   - [ ] Treatment plans

### Closed Testing (Optional)

1. [ ] Create closed testing track
2. [ ] Invite beta testers
3. [ ] Gather feedback

### Production Release

1. [ ] All testing completed
2. [ ] All store listing assets uploaded
3. [ ] Content rating completed
4. [ ] Data safety form completed
5. [ ] Pricing and distribution configured
6. [ ] Submit for review

---

## Build & Upload Steps

### 1. Prepare the Build

```bash
# Run the build script
./scripts/build-android-release.sh

# Or manually:
npm install --legacy-peer-deps
npm run build
npx cap sync android
```

### 2. Generate Signed AAB in Android Studio

1. Open Android Studio: `npx cap open android`
2. Go to: **Build** → **Generate Signed Bundle / APK**
3. Select: **Android App Bundle**
4. Configure signing:
   - Keystore path: `android/lawn-guardian-release.keystore`
   - Key alias: `lawn-guardian`
   - Enter passwords
5. Select **release** build variant
6. Click **Create**

AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

### 3. Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select **Lawn Guardian** app
3. Go to **Testing** → **Internal testing** (or Production)
4. Click **Create new release**
5. Upload the AAB file
6. Add release notes
7. Review and roll out

---

## Post-Submission

- [ ] Monitor review status (typically 1-7 days)
- [ ] Respond to any issues raised by review team
- [ ] Once approved, monitor crash reports and user feedback
- [ ] Plan next update based on feedback

---

## Quick Reference

### Subscription Product IDs

| Product | Google Play ID | Price |
|---------|----------------|-------|
| Pro Weekly | `pro_weekly` | $5.99/week |
| Pro Annual | `pro_annual` | $79.99/year |

### Important URLs

- [Google Play Console](https://play.google.com/console)
- [RevenueCat Dashboard](https://app.revenuecat.com)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com)

### Support Contacts

- RevenueCat Support: support@revenuecat.com
- Google Play Support: [Help Center](https://support.google.com/googleplay/android-developer/)

---

## Version History

| Version | Code | Date | Notes |
|---------|------|------|-------|
| 1.0.32 | 33 | Jan 25, 2026 | Google Play submission |
| 1.0.31 | 32 | - | Previous version |

---

*Document created: January 25, 2026*
