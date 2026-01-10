# Lawn Guardian - Supabase Secrets Setup Script
# Run this script to configure all required secrets for production deployment
#
# Prerequisites:
# 1. Install Supabase CLI: npm install -g supabase
# 2. Login: supabase login
# 3. Link project: supabase link --project-ref YOUR_PROJECT_REF

param(
    [switch]$Interactive,
    [string]$AppleSharedSecret,
    [string]$AppleBundleId = "com.lawnguardian.app",
    [string]$GooglePlayCredentialsFile,
    [string]$GooglePlayPackageName = "com.lawnguardian.app",
    [string]$CronSecret
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Lawn Guardian - Supabase Secrets Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if supabase CLI is installed
try {
    $supabaseVersion = supabase --version 2>$null
    Write-Host "Using Supabase CLI: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "  npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
$loginStatus = supabase projects list 2>&1
if ($loginStatus -match "not logged in") {
    Write-Host "Error: Not logged in to Supabase. Please run:" -ForegroundColor Red
    Write-Host "  supabase login" -ForegroundColor Yellow
    exit 1
}

if ($Interactive) {
    Write-Host "Interactive mode - you will be prompted for each secret" -ForegroundColor Yellow
    Write-Host ""
    
    # Apple Shared Secret
    Write-Host "Apple App Store Configuration" -ForegroundColor Cyan
    Write-Host "-" * 40
    $AppleSharedSecret = Read-Host "Enter Apple Shared Secret (from App Store Connect)"
    $AppleBundleId = Read-Host "Enter Apple Bundle ID (default: com.lawnguardian.app)"
    if ([string]::IsNullOrWhiteSpace($AppleBundleId)) { $AppleBundleId = "com.lawnguardian.app" }
    
    Write-Host ""
    
    # Google Play Configuration
    Write-Host "Google Play Store Configuration" -ForegroundColor Cyan
    Write-Host "-" * 40
    $GooglePlayCredentialsFile = Read-Host "Enter path to Google Play service account JSON file"
    $GooglePlayPackageName = Read-Host "Enter Google Play Package Name (default: com.lawnguardian.app)"
    if ([string]::IsNullOrWhiteSpace($GooglePlayPackageName)) { $GooglePlayPackageName = "com.lawnguardian.app" }
    
    Write-Host ""
    
    # Cron Secret
    Write-Host "Security Configuration" -ForegroundColor Cyan
    Write-Host "-" * 40
    $generateCron = Read-Host "Generate random Cron Secret? (Y/n)"
    if ($generateCron -ne "n" -and $generateCron -ne "N") {
        $CronSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
        Write-Host "Generated Cron Secret: $CronSecret" -ForegroundColor Green
    } else {
        $CronSecret = Read-Host "Enter Cron Secret"
    }
}

# Validate required secrets
$missingSecrets = @()

if ([string]::IsNullOrWhiteSpace($AppleSharedSecret)) {
    $missingSecrets += "APPLE_SHARED_SECRET"
}

if (-not [string]::IsNullOrWhiteSpace($GooglePlayCredentialsFile) -and -not (Test-Path $GooglePlayCredentialsFile)) {
    Write-Host "Warning: Google Play credentials file not found: $GooglePlayCredentialsFile" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setting Supabase Secrets..." -ForegroundColor Cyan
Write-Host "-" * 40

# Set Apple secrets
if (-not [string]::IsNullOrWhiteSpace($AppleSharedSecret)) {
    Write-Host "Setting APPLE_SHARED_SECRET..." -ForegroundColor Gray
    supabase secrets set APPLE_SHARED_SECRET=$AppleSharedSecret
    Write-Host "  Done" -ForegroundColor Green
}

Write-Host "Setting APPLE_BUNDLE_ID..." -ForegroundColor Gray
supabase secrets set APPLE_BUNDLE_ID=$AppleBundleId
Write-Host "  Done" -ForegroundColor Green

# Set Google Play secrets
if (-not [string]::IsNullOrWhiteSpace($GooglePlayCredentialsFile) -and (Test-Path $GooglePlayCredentialsFile)) {
    Write-Host "Setting GOOGLE_PLAY_CREDENTIALS..." -ForegroundColor Gray
    $googleCreds = Get-Content $GooglePlayCredentialsFile -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
    supabase secrets set GOOGLE_PLAY_CREDENTIALS="$googleCreds"
    Write-Host "  Done" -ForegroundColor Green
}

Write-Host "Setting GOOGLE_PLAY_PACKAGE_NAME..." -ForegroundColor Gray
supabase secrets set GOOGLE_PLAY_PACKAGE_NAME=$GooglePlayPackageName
Write-Host "  Done" -ForegroundColor Green

# Set Cron secret
if (-not [string]::IsNullOrWhiteSpace($CronSecret)) {
    Write-Host "Setting CRON_SECRET..." -ForegroundColor Gray
    supabase secrets set CRON_SECRET=$CronSecret
    Write-Host "  Done" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Secrets Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# List missing secrets
if ($missingSecrets.Count -gt 0) {
    Write-Host "Warning: The following secrets were not set:" -ForegroundColor Yellow
    foreach ($secret in $missingSecrets) {
        Write-Host "  - $secret" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "You can set them later with:" -ForegroundColor Gray
    Write-Host "  supabase secrets set SECRET_NAME=value" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Deploy Edge Functions:" -ForegroundColor White
Write-Host "   supabase functions deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Push Database Migrations:" -ForegroundColor White
Write-Host "   supabase db push" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Build the App:" -ForegroundColor White
Write-Host "   npm run build" -ForegroundColor Gray
Write-Host "   npx cap sync" -ForegroundColor Gray
Write-Host ""

