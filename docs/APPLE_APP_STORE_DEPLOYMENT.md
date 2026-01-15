# Apple App Store Deployment Guide for Lawn Guardian

Complete step-by-step guide for deploying the Lawn Guardian iOS app to the Apple App Store.

---

## Prerequisites

- [ ] **Apple Developer Account** ($99/year) - [developer.apple.com](https://developer.apple.com)
- [ ] **Mac computer** with macOS (required for Xcode)
- [ ] **Xcode** installed from Mac App Store (free)
- [ ] **Apple ID** enrolled in Apple Developer Program

---

## Step 1: Prepare Your Web Build

On your Windows machine (or Mac):

```bash
cd C:\Users\brian\OneDrive\Documents\Cursor Repos\lawnguardiannet
npm run build
npx cap sync ios
```

Then **copy the entire project to your Mac** (via USB, cloud storage, or Git).

---

## Step 2: Open Project in Xcode (on Mac)

1. Open **Xcode**
2. Click **File → Open**
3. Navigate to your project folder → `ios` → `App`
4. Open `App.xcworkspace` (NOT `.xcodeproj`)

---

## Step 3: Configure Signing & Capabilities

1. In Xcode, click on **App** in the left sidebar (top level, blue icon)
2. Select the **App** target under TARGETS
3. Go to **Signing & Capabilities** tab
4. Check **Automatically manage signing**
5. Select your **Team** (your Apple Developer account)
6. Verify **Bundle Identifier**: `com.lawnguardian.app`

---

## Step 4: Set Version and Build Number

1. Still in the **App** target, go to **General** tab
2. Under **Identity**:
   - **Display Name**: `Lawn Guardian`
   - **Bundle Identifier**: `com.lawnguardian.app`
   - **Version**: `1.0.26` (match your Android version)
   - **Build**: `27` (increment for each upload)

---

## Step 5: Configure App Icons

1. In Xcode, expand **App → App → Assets**
2. Click on **AppIcon**
3. Drag your icon images into the appropriate slots:
   - 1024×1024 (App Store)
   - 180×180 (iPhone @3x)
   - 120×120 (iPhone @2x)
   - 167×167 (iPad Pro)
   - 152×152 (iPad @2x)
   - 76×76 (iPad @1x)

**Tip:** Use a tool like [App Icon Generator](https://appicon.co/) to create all sizes from one 1024×1024 image.

---

## Step 6: Create App in App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: `Lawn Guardian - AI Lawn Care`
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: `com.lawnguardian.app`
   - **SKU**: `lawnguardian001` (any unique string)
   - **User Access**: Full Access
4. Click **Create**

---

## Step 7: Complete App Store Listing

In App Store Connect, fill out:

### App Information
- **Category**: Lifestyle (Primary), Utilities (Secondary)
- **Content Rights**: Confirm you have rights
- **Age Rating**: Complete questionnaire (likely 4+)

### Pricing and Availability
- **Price**: Free (with in-app purchases)
- **Availability**: All countries

### App Privacy
- **Privacy Policy URL**: Your privacy policy URL
- **Data collection**: Answer the questionnaire honestly

### Version Information (1.0)

**Screenshots (required):**
| Device | Size | Required |
|--------|------|----------|
| 6.7" (iPhone 15 Pro Max) | 1290 × 2796 px | Yes |
| 6.5" (iPhone 14 Plus) | 1284 × 2778 px | Yes |
| 5.5" (iPhone 8 Plus) | 1242 × 2208 px | Yes |
| 12.9" iPad Pro | 2048 × 2732 px | If supporting iPad |

**Text Fields:**
- **Promotional Text** (170 chars): `🌱 Instant AI lawn diagnosis! Snap a photo, get expert treatment plans. Your lawn has never looked better.`
- **Description** (4000 chars): Use your Google Play description from `docs/GOOGLE_PLAY_STORE_LISTING.md`
- **Keywords** (100 chars): `lawn care,grass,weed,diagnosis,AI,treatment,yard,garden,fertilizer,plant`
- **Support URL**: Your support page URL
- **Marketing URL**: (optional)

---

## Step 8: Build Archive in Xcode

1. In Xcode, select **Any iOS Device (arm64)** as the build target (top bar, next to play button)
2. Click **Product → Archive** from the menu
3. Wait for the build to complete (may take several minutes)
4. The **Organizer** window opens automatically when done

**Troubleshooting:**
- If Archive is grayed out, make sure you selected "Any iOS Device" not a simulator
- If build fails, check signing certificates in Xcode preferences

---

## Step 9: Upload to App Store Connect

1. In the **Organizer** window, select your archive
2. Click **Distribute App**
3. Select **App Store Connect** → **Next**
4. Select **Upload** → **Next**
5. Keep defaults for:
   - App Store Connect distribution options
   - Re-sign options (Automatically manage signing)
6. Click **Upload**
7. Wait for upload to complete (can take 10-30 minutes)

**Note:** After upload, it takes 15-30 minutes for the build to appear in App Store Connect.

---

## Step 10: Submit for Review

1. Go back to [App Store Connect](https://appstoreconnect.apple.com)
2. Select **Lawn Guardian**
3. Go to your app version
4. Under **Build**, click **+** and select the build you just uploaded
5. Fill in **App Review Information**:
   - **Sign-In required?** Yes - provide a demo account if needed
   - **Contact information**: Your phone and email
   - **Notes for reviewer**: 
     ```
     Lawn Guardian uses AI to analyze lawn photos and provide treatment recommendations.
     
     To test:
     1. Allow camera/photo access
     2. Take or upload a photo of grass/lawn
     3. View the AI-generated diagnosis and treatment plan
     
     The app requires a subscription for full features, but you can view the scan interface without subscribing.
     ```
6. Click **Save**
7. Click **Add for Review**
8. Click **Submit to App Review**

---

## Step 11: Wait for Review

- **Typical review time**: 24-48 hours (can be up to 7 days for first submission)
- You'll receive email updates on status changes
- Check App Store Connect for detailed feedback if rejected

### If Rejected:
1. Read the rejection reason carefully
2. Address all issues mentioned
3. Respond in the Resolution Center if clarification helps
4. Resubmit for review

---

## Required Assets Checklist

| Asset | Size | Quantity | Notes |
|-------|------|----------|-------|
| App Icon | 1024×1024 | 1 | PNG, no transparency |
| iPhone Screenshots (6.7") | 1290×2796 | 3-10 | Portrait |
| iPhone Screenshots (6.5") | 1284×2778 | 3-10 | Portrait |
| iPhone Screenshots (5.5") | 1242×2208 | 3-10 | Portrait |
| iPad Screenshots | 2048×2732 | 3-10 | If supporting iPad |
| App Preview Video | 1080p | 0-3 | Optional, 15-30 sec |

---

## In-App Purchases Setup

See `docs/APP_STORE_CONNECT_SETUP.md` for detailed instructions on setting up:
- Subscription group
- Weekly subscription ($5.99)
- Annual subscription ($79.99)
- RevenueCat integration

---

## RevenueCat iOS Configuration

1. In RevenueCat dashboard, go to your app
2. Add iOS platform if not already added
3. Enter your **App-Specific Shared Secret** from App Store Connect
4. Configure products to match your App Store Connect product IDs:
   - `com.lawnguardian.pro.weekly` → Weekly
   - `com.lawnguardian.pro.annual` → Annual

---

## Common Issues & Solutions

### "No signing certificate found"
- Go to Xcode → Preferences → Accounts
- Select your Apple ID → Manage Certificates
- Click + to create a new distribution certificate

### "Provisioning profile doesn't match"
- Enable "Automatically manage signing" in target settings
- Or manually create profile in Apple Developer Portal

### Build stuck on "Processing"
- Processing can take up to 30 minutes
- If longer, try uploading again

### "Missing compliance" warning
- If your app uses encryption (HTTPS counts), you need to declare it
- Most apps can select "No" for export compliance if only using HTTPS

### App rejected for "Guideline 4.2 - Minimum Functionality"
- Ensure your app has clear, useful functionality
- Provide detailed reviewer notes explaining the value

---

## Important Notes

⚠️ **You MUST use a Mac** - Apple requires Xcode, which only runs on macOS

⚠️ **First-time setup** takes longer due to certificates and provisioning

⚠️ **Review Guidelines** - Read [Apple's App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

⚠️ **Keep versions in sync** - Try to match iOS and Android version numbers

---

## Quick Reference Commands

```bash
# Build web assets
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode (on Mac)
npx cap open ios
```

---

## Resources

- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer Portal](https://developer.apple.com)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)

---

## Version History

| Version | Build | Date | Notes |
|---------|-------|------|-------|
| 1.0.26 | 27 | Jan 2026 | Initial iOS release |

---

*Last updated: January 15, 2026*
