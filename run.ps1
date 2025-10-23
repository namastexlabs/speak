# Speak - Voice Dictation
# One command setup and launch (Windows)

Write-Host "🎤 Speak - Voice Dictation" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# 1. Ensure Node.js exists
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Please install Node.js 18+ first:" -ForegroundColor Yellow
    Write-Host "  https://nodejs.org/en/download/" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use nvm-windows:" -ForegroundColor Yellow
    Write-Host "  https://github.com/coreybutler/nvm-windows" -ForegroundColor White
    Write-Host ""
    exit 1
}

$nodeVersion = node -v
Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green

# 2. Ensure pnpm exists
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing pnpm..." -ForegroundColor Yellow

    # Try corepack first (built into Node.js 16.9+)
    if (Get-Command corepack -ErrorAction SilentlyContinue) {
        Write-Host "Using corepack (built-in Node.js package manager)..." -ForegroundColor White
        corepack enable
        corepack prepare pnpm@latest --activate
    } else {
        # Fallback: Install to user AppData (no admin required)
        Write-Host "Installing pnpm to user directory..." -ForegroundColor White
        $env:PNPM_HOME = "$env:LOCALAPPDATA\pnpm"
        $env:Path = "$env:PNPM_HOME;$env:Path"

        # Create pnpm directory if it doesn't exist
        if (-not (Test-Path $env:PNPM_HOME)) {
            New-Item -ItemType Directory -Path $env:PNPM_HOME -Force | Out-Null
        }

        # Install pnpm using npm (to user directory)
        npm install -g pnpm --prefix="$env:PNPM_HOME"

        # Add to PATH permanently for current user
        $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($userPath -notlike "*$env:PNPM_HOME*") {
            [Environment]::SetEnvironmentVariable("Path", "$env:PNPM_HOME;$userPath", "User")
            Write-Host "✅ Added pnpm to user PATH" -ForegroundColor Green
        }
    }

    # Verify pnpm installation
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $pnpmVersion = pnpm -v
        Write-Host "✅ pnpm installed: v$pnpmVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠️  pnpm installed but not in PATH. Please restart your terminal." -ForegroundColor Yellow
        exit 1
    }
} else {
    $pnpmVersion = pnpm -v
    Write-Host "✅ pnpm v$pnpmVersion" -ForegroundColor Green
}

# 3. Check for updates and auto-update if available
try {
    $CURRENT_VERSION = node -p "require('./package.json').version" 2>$null
    if ([string]::IsNullOrEmpty($CURRENT_VERSION)) { $CURRENT_VERSION = "0.0.0" }
} catch {
    $CURRENT_VERSION = "0.0.0"
}

Write-Host "📍 Current version: $CURRENT_VERSION" -ForegroundColor White

# Get latest @next version from npm (silent, fast)
try {
    $LATEST_VERSION = npm view @namastexlabs/speak@next version 2>$null
    if ([string]::IsNullOrEmpty($LATEST_VERSION)) { $LATEST_VERSION = $CURRENT_VERSION }
} catch {
    $LATEST_VERSION = $CURRENT_VERSION
}

# Compare versions and notify if update available
if ($CURRENT_VERSION -ne $LATEST_VERSION) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "🎤 ✨ UPDATE AVAILABLE" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Current: $CURRENT_VERSION" -ForegroundColor White
    Write-Host "Latest:  $LATEST_VERSION" -ForegroundColor White
    Write-Host ""
    Write-Host "Update with: npx @namastexlabs/speak@next" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
}

# 4. Install npm dependencies (if needed)
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    pnpm install
    Write-Host "✅ Dependencies installed (electron-rebuild will run automatically)" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies ready" -ForegroundColor Green
}

# 5. Check system dependencies
Write-Host "🔍 Checking system dependencies..." -ForegroundColor White

# Check sox (required for audio recording on Windows)
if (-not (Get-Command sox -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  sox not found (required for audio recording)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Install instructions:" -ForegroundColor White
    Write-Host "  Windows: choco install sox" -ForegroundColor White
    Write-Host "  Or download from: https://sourceforge.net/projects/sox/" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Continue without sox? (audio recording will fail) (y/N)"
    if ($continue -notmatch "^[Yy]$") {
        Write-Host "💡 Install sox and run this script again" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ sox installed" -ForegroundColor Green
}

# 6. Generate icons if needed
if (-not (Test-Path "assets/icons") -or -not (Test-Path "assets/icons/tray-normal.png")) {
    Write-Host "🎨 Generating app icons..." -ForegroundColor Yellow
    pnpm run generate-icons
    Write-Host "✅ Icons generated" -ForegroundColor Green
} else {
    Write-Host "✅ Icons ready" -ForegroundColor Green
}

# 7. Start Electron app
Write-Host ""
Write-Host "🚀 Starting Speak..." -ForegroundColor Cyan
Write-Host ""

if ($args[0] -eq "dev") {
    $env:NODE_ENV = "development"
    pnpm run dev
} else {
    pnpm start
}
