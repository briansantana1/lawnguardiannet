# Google OAuth Setup for Lawn Guardian

This guide walks you through setting up Google Sign-In for the Lawn Guardian app.

## Prerequisites

- Supabase project already set up
- Google account with access to Google Cloud Console

---

## Step 1: Configure Supabase Redirect URL

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **URL Configuration**
3. Under **Redirect URLs**, add:
   ```
   lawnguardian://auth/callback
   ```
4. Click **Save**

---

## Step 2: Create Google OAuth Credentials

### 2.1 Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **New Project**
   - Name: `Lawn Guardian`
   - Click **Create**
4. Select your new project

### 2.2 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have Google Workspace)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: `Lawn Guardian`
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. **Scopes**: Click **Add or Remove Scopes**
   - Select: `email`, `profile`, `openid`
   - Click **Update**
7. Click **Save and Continue**
8. **Test users**: Add your email for testing
9. Click **Save and Continue**

### 2.3 Create OAuth Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name: `Lawn Guardian Web`
5. Under **Authorized redirect URIs**, add:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
   (Replace `YOUR-PROJECT-REF` with your Supabase project reference ID)
   
   Find your project ref in your Supabase URL, e.g., if your URL is:
   `https://abcd1234.supabase.co` then your ref is `abcd1234`

6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

---

## Step 3: Configure Supabase Google Provider

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google** to ON
5. Paste your **Client ID** from Google Cloud Console
6. Paste your **Client Secret** from Google Cloud Console
7. Click **Save**

---

## Step 4: Test Google Sign-In

1. Open the Lawn Guardian app on your Android device
2. Tap **Continue with Google**
3. A browser should open with Google's sign-in page
4. Sign in with your Google account
5. You should be redirected back to the app and signed in

---

## Troubleshooting

### "redirect_uri_mismatch" Error
- Verify the redirect URI in Google Cloud Console matches exactly:
  `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes

### "Access blocked" Error
- Make sure your email is added as a test user in Google Cloud Console
- The OAuth consent screen is in "Testing" mode by default

### App doesn't redirect back after sign-in
- Verify `lawnguardian://auth/callback` is in Supabase redirect URLs
- Make sure the deep link is configured in AndroidManifest.xml

### Sign-in works but user not created
- Check Supabase Authentication logs for errors
- Verify the Google provider is enabled

---

## Production Checklist

Before going to production:

1. **Publish OAuth Consent Screen**
   - Go to Google Cloud Console → OAuth consent screen
   - Click **Publish App**
   - This removes the 100-user test limit

2. **Verify Domain** (optional but recommended)
   - Add your website domain to the OAuth consent screen

3. **Remove Debug Code**
   - Remove any debug panels or logging from the app

---

## Apple Sign-In (iOS Only)

Apple Sign-In requires additional setup:

1. Apple Developer account ($99/year)
2. App ID with Sign in with Apple capability
3. Service ID configured in Apple Developer portal
4. Keys configured in Supabase

See [Supabase Apple Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-apple) for details.
