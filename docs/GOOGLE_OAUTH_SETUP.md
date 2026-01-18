# Google OAuth Setup for Lawn Guardian

This guide walks you through setting up **Native Google Sign-In** for the Lawn Guardian Android app.

## Overview

The app uses **native Google Sign-In** on Android for better reliability. This approach:
- Uses the native Google Sign-In SDK (no browser redirect)
- Gets an ID token directly from Google
- Exchanges the ID token with Supabase using `signInWithIdToken()`

## Prerequisites

- Supabase project already set up
- Google account with access to Google Cloud Console
- Your app's SHA-1 signing certificate fingerprint

---

## Step 1: Get Your SHA-1 Fingerprint

You need your release keystore's SHA-1 fingerprint:

```bash
# For release keystore (use your actual keystore path and alias)
keytool -list -v -keystore android/lawn-guardian-release.keystore -alias lawn-guardian

# For debug keystore (Windows)
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

Copy the **SHA1** fingerprint (looks like: `12:34:56:78:90:AB:CD:EF:...`)

---

## Step 2: Set Up Google Cloud Project

### 2.1 Create/Select Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name: `Lawn Guardian`

### 2.2 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have Google Workspace)
3. Click **Create**
4. Fill in required fields:
   - **App name**: `Lawn Guardian`
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. **Scopes**: Add `email`, `profile`, `openid`
7. **Test users**: Add your email for testing
8. Click **Save and Continue**

---

## Step 3: Create OAuth Client IDs

You need **TWO** OAuth client IDs:

### 3.1 Web Application Client (REQUIRED for Supabase)

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name: `Lawn Guardian Web Client`
5. Under **Authorized redirect URIs**, add:
   ```
   https://zxkugpfmwieexgldnlyl.supabase.co/auth/v1/callback
   ```
6. Click **Create**
7. **Copy the Client ID** - you'll need this in 3 places!

### 3.2 Android Application Client (REQUIRED for Native Sign-In)

1. Click **Create Credentials** → **OAuth client ID**
2. Select **Android**
3. Name: `Lawn Guardian Android Client`
4. Package name: `com.lawnguardian.app`
5. SHA-1 certificate fingerprint: Paste your SHA-1 from Step 1
6. Click **Create**

**Important**: Create Android clients for BOTH your debug AND release SHA-1 fingerprints if you test with debug builds.

---

## Step 4: Configure Supabase

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google** to ON
5. Paste the **Web Client ID** (from Step 3.1)
6. Paste the **Web Client Secret** (from Step 3.1)
7. Click **Save**

---

## Step 5: Configure the App

### 5.1 Update strings.xml

Edit `android/app/src/main/res/values/strings.xml`:

```xml
<string name="server_client_id">YOUR_WEB_CLIENT_ID.apps.googleusercontent.com</string>
```

Replace `YOUR_WEB_CLIENT_ID` with your **Web Application** Client ID from Step 3.1.

### 5.2 Add google-services.json (Optional but Recommended)

1. In Google Cloud Console, go to your Android OAuth client
2. Download `google-services.json`
3. Place it in `android/app/google-services.json`

Alternatively, use Firebase Console:
1. Create a Firebase project (or link existing Google Cloud project)
2. Add Android app with package `com.lawnguardian.app`
3. Download `google-services.json`
4. Place it in `android/app/`

### 5.3 Set Environment Variable

Add to your `.env` file:

```
VITE_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

---

## Step 6: Build and Test

1. Sync Capacitor:
   ```bash
   npx cap sync android
   ```

2. Build the app:
   ```bash
   # From C:\temp\lawnguardiannet (not OneDrive)
   cd android
   ./gradlew assembleRelease
   ```

3. Install and test on your Android device

---

## Troubleshooting

### "DEVELOPER_ERROR" in logs
- SHA-1 fingerprint doesn't match your keystore
- Make sure you created an Android OAuth client with the correct SHA-1
- If testing with debug build, add the debug keystore SHA-1 too

### "10" Error Code
- Usually means SHA-1 mismatch
- Verify you're using the same keystore that signed the APK

### "No ID token received"
- Web Client ID might be misconfigured
- Make sure `server_client_id` in strings.xml matches the **Web** client ID

### Sign-in cancelled immediately
- OAuth consent screen might not be configured properly
- Check if your email is in the test users list

### Supabase signInWithIdToken fails
- Verify Google provider is enabled in Supabase
- Verify the Web Client ID in Supabase matches the one in your app
- Check Supabase Auth logs for details

---

## Configuration Summary

| Where | What to put |
|-------|------------|
| `android/app/src/main/res/values/strings.xml` | Web Client ID |
| `.env` (VITE_GOOGLE_WEB_CLIENT_ID) | Web Client ID |
| `capacitor.config.ts` (GoogleAuth.serverClientId) | Web Client ID |
| Supabase Dashboard → Providers → Google | Web Client ID + Secret |
| Google Cloud Console → Android OAuth | Package name + SHA-1 |

**Key Point**: The Web Client ID is used everywhere in the app. The Android Client ID is only registered in Google Cloud Console for verification.

---

## Production Checklist

1. **Publish OAuth Consent Screen**
   - Go to Google Cloud Console → OAuth consent screen
   - Click **Publish App**
   
2. **Add Release SHA-1**
   - Create Android OAuth client with your release keystore SHA-1
   
3. **Remove Test User Restrictions**
   - After publishing, any Google user can sign in

---

## Apple Sign-In (iOS Only)

Apple Sign-In requires additional setup:

1. Apple Developer account ($99/year)
2. App ID with Sign in with Apple capability
3. Service ID configured in Apple Developer portal
4. Keys configured in Supabase

See [Supabase Apple Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-apple) for details.
