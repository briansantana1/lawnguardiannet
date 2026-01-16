# Scripts Directory

This directory contains utility scripts for setting up and testing your Lawn Guardian application.

## Available Scripts

### 1. `setup-api-keys.sh`
**Purpose:** Interactive setup wizard for all API keys

**Usage:**
```bash
bash scripts/setup-api-keys.sh
# or
npm run setup:apis
```

**What it does:**
- Prompts you for each API key
- Validates key format
- Stores keys securely in Supabase
- Auto-generates security keys (CRON_SECRET)
- Sets default values for bundle IDs

**When to use:**
- First time setup
- When you need to update API keys
- When adding new API services

---

### 2. `test-api-keys.sh`
**Purpose:** Test all configured API keys at once

**Usage:**
```bash
bash scripts/test-api-keys.sh
# or
npm run test:apis
```

**What it does:**
- Tests each API service
- Shows pass/fail status
- Provides summary report
- Does NOT store keys (safe for testing)

**When to use:**
- After running setup script
- When troubleshooting API issues
- Before deploying to production
- After updating API keys

---

### 3. `test-individual-api.sh`
**Purpose:** Interactive menu to test specific API services

**Usage:**
```bash
bash scripts/test-individual-api.sh
# or
npm run test:api
```

**What it does:**
- Shows interactive menu
- Tests selected API in detail
- Displays full API response
- Provides detailed error messages

**When to use:**
- Debugging a specific API
- Verifying API configuration
- Understanding API responses
- Troubleshooting issues

---

### 4. `setup-secrets.ps1` (Windows)
**Purpose:** PowerShell version of setup script for Windows users

**Usage:**
```powershell
.\scripts\setup-secrets.ps1
```

**Note:** Windows users can also use Git Bash or WSL to run the .sh scripts

---

## Quick Start

```bash
# 1. Setup all API keys
npm run setup:apis

# 2. Test all API keys
npm run test:apis

# 3. If any fail, test individually
npm run test:api
```

---

## Requirements

### For Bash Scripts (.sh)
- **Linux/Mac:** Should work out of the box
- **Windows:** Use Git Bash or WSL
- **Dependencies:**
  - `curl` (for API testing)
  - `jq` (optional, for pretty JSON output)
  - `openssl` (for generating secrets)
  - Supabase CLI (`npm install -g supabase`)

### For PowerShell Scripts (.ps1)
- **Windows:** PowerShell 5.1 or later
- **Dependencies:**
  - Supabase CLI (`npm install -g supabase`)

---

## Troubleshooting

### "Permission denied"
```bash
chmod +x scripts/*.sh
```

### "Command not found: jq"
```bash
# Mac
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Or the script will work without it (just less pretty output)
```

### "Supabase CLI not found"
```bash
npm install -g supabase
```

### "Not linked to Supabase project"
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

---

## Environment Variables Set

These scripts configure the following environment variables in Supabase:

### Core APIs
- `PLANT_ID_API_KEY` - Plant.id API key
- `ANTHROPIC_API_KEY` - Anthropic Claude API key

### Optional APIs
- `PLANTNET_API_KEY` - Pl@ntNet API key
- `RESEND_API_KEY` - Resend email API key

### App Store
- `APPLE_SHARED_SECRET` - Apple IAP shared secret
- `APPLE_BUNDLE_ID` - iOS bundle identifier
- `GOOGLE_PLAY_CREDENTIALS` - Google Play service account JSON
- `GOOGLE_PLAY_PACKAGE_NAME` - Android package name

### Security
- `CRON_SECRET` - Auto-generated secret for cron jobs

---

## Security Notes

⚠️ **Important:**
- These scripts NEVER commit keys to git
- Keys are stored in Supabase Secrets (encrypted)
- Test scripts do NOT store the keys you enter
- Scripts hide sensitive input (keys appear as ***)

✅ **Safe to use:**
- In development
- In production
- For testing
- For updating keys

---

## Contributing

When adding new scripts:

1. **Add execute permissions:**
   ```bash
   chmod +x scripts/your-script.sh
   ```

2. **Document the script:**
   - Add description to this README
   - Include usage examples
   - List requirements
   - Add troubleshooting tips

3. **Add to package.json:**
   ```json
   "scripts": {
     "your-command": "bash scripts/your-script.sh"
   }
   ```

4. **Test on multiple platforms:**
   - Linux
   - Mac
   - Windows (Git Bash)

---

## Related Documentation

- **Quick Start Guide:** `docs/API_KEYS_QUICK_START.md`
- **Testing Guide:** `docs/API_TESTING_GUIDE.md`
- **Deployment Guide:** `DEPLOYMENT.md`

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Read the full documentation in `docs/`
3. Verify all requirements are installed
4. Test individual APIs to isolate the problem
5. Check Supabase dashboard for secrets
