# LawnGuardian Setup Script
# This script checks for required dependencies and guides you through installation

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LawnGuardian Setup & Dependency Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for Node.js
Write-Host "Checking for Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "[OK] Node.js is installed: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "[X] Node.js is NOT installed" -ForegroundColor Red
}

# Check for npm
Write-Host "Checking for npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "[OK] npm is installed: v$npmVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "[X] npm is NOT installed" -ForegroundColor Red
}

# Check for Bun (alternative)
Write-Host "Checking for Bun (alternative package manager)..." -ForegroundColor Yellow
try {
    $bunVersion = bun --version 2>$null
    if ($bunVersion) {
        Write-Host "[OK] Bun is installed: v$bunVersion" -ForegroundColor Green
        $bunInstalled = $true
    }
} catch {
    Write-Host "[X] Bun is not installed (optional)" -ForegroundColor Gray
    $bunInstalled = $false
}

Write-Host ""

# Determine what needs to be installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ACTION REQUIRED: Install Node.js" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Node.js is required to run this project." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Installation Options:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1: Download from nodejs.org (Recommended)" -ForegroundColor White
    Write-Host "  1. Visit: https://nodejs.org/" -ForegroundColor Gray
    Write-Host "  2. Download the LTS version (Windows Installer .msi)" -ForegroundColor Gray
    Write-Host "  3. Run the installer and follow the setup wizard" -ForegroundColor Gray
    Write-Host "  4. Make sure Add to PATH is checked during installation" -ForegroundColor Gray
    Write-Host "  5. Restart your terminal/PowerShell after installation" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2: Install using Chocolatey (if you have it)" -ForegroundColor White
    Write-Host "  choco install nodejs-lts" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 3: Install using Winget (Windows 10/11)" -ForegroundColor White
    Write-Host "  winget install OpenJS.NodeJS.LTS" -ForegroundColor Gray
    Write-Host ""
    
    # Ask if user wants to open the download page
    $response = Read-Host "Would you like to open the Node.js download page? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Start-Process "https://nodejs.org/"
    }
    
    Write-Host ""
    Write-Host "After installing Node.js, please:" -ForegroundColor Yellow
    Write-Host "  1. Close and reopen this terminal" -ForegroundColor Gray
    Write-Host "  2. Run this script again: .\setup.ps1" -ForegroundColor Gray
    Write-Host "  3. Or run: npm install" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# If Node.js is installed, check if dependencies are installed
Write-Host "Checking project dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "[OK] Dependencies are installed" -ForegroundColor Green
} else {
    Write-Host "[X] Dependencies are NOT installed" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Installing project dependencies..." -ForegroundColor Cyan
    
    # Check if using npm or bun
    if ($bunInstalled) {
        Write-Host "Using Bun to install dependencies..." -ForegroundColor Gray
        bun install
    } else {
        Write-Host "Using npm to install dependencies..." -ForegroundColor Gray
        npm install
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[OK] Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "[X] Failed to install dependencies. Please check the error messages above." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run the development server with:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or if you are using Bun:" -ForegroundColor Cyan
Write-Host "  bun run dev" -ForegroundColor White
Write-Host ""
