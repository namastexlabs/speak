#!/usr/bin/env bash
# Speak - Voice Dictation
# One command setup and launch
set -e

echo "🎤 Speak - Voice Dictation"
echo "=========================="
echo ""

# 1. Ensure Node.js exists
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    if [ ! -d "$HOME/.nvm" ]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    fi
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 22
    nvm use 22
    echo "✅ Node.js installed"
else
    NODE_VERSION=$(node -v)
    echo "✅ Node.js $NODE_VERSION"
fi

# 2. Ensure pnpm exists
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."

    # Set up user-local directory for package managers
    export PNPM_HOME="$HOME/.local/share/pnpm"

    # Create directory if it doesn't exist
    mkdir -p "$PNPM_HOME"

    # Always use npm with user prefix (no sudo needed)
    npm install -g pnpm --prefix="$HOME/.local"

    # Add both possible locations to PATH
    export PATH="$HOME/.local/bin:$PNPM_HOME:$PATH"

    # Add to shell profile for persistence
    for profile in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.bash_profile" "$HOME/.profile"; do
        if [ -f "$profile" ] && [ -w "$profile" ]; then
            if ! grep -q "PNPM_HOME" "$profile" 2>/dev/null; then
                {
                    echo ''
                    echo '# pnpm configuration (added by Speak installer)'
                    echo 'export PNPM_HOME="$HOME/.local/share/pnpm"'
                    echo 'export PATH="$HOME/.local/bin:$PNPM_HOME:$PATH"'
                } >> "$profile" 2>/dev/null || true
            fi
        fi
    done

    # Verify pnpm is available
    if ! command -v pnpm &> /dev/null; then
        echo "⚠️  pnpm installed but not in PATH. Run this command:"
        echo "    export PATH=\"$HOME/.local/bin:$PNPM_HOME:\$PATH\""
        exit 1
    fi
    echo "✅ pnpm installed"
else
    echo "✅ pnpm $(pnpm --version)"
fi

# 3. Version info and update check
CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0")
echo "📍 Current version: $CURRENT_VERSION"

# Get latest @next version from npm (silent, fast)
LATEST_VERSION=$(npm view @namastexlabs/speak@next version 2>/dev/null || echo "$CURRENT_VERSION")

# Compare versions and notify if update available
if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎤 ✨ UPDATE AVAILABLE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Current: $CURRENT_VERSION"
    echo "Latest:  $LATEST_VERSION"
    echo ""
    echo "Update with: npx @namastexlabs/speak@next"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi

# 4. Install npm dependencies (if needed)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo "✅ Dependencies installed (electron-rebuild will run automatically)"
else
    echo "✅ Dependencies ready"
fi

# 4. Generate icons if needed
if [ ! -d "assets/icons" ] || [ ! -f "assets/icons/tray-normal.png" ]; then
    echo "🎨 Generating app icons..."
    pnpm run generate-icons
    echo "✅ Icons generated"
else
    echo "✅ Icons ready"
fi

# 6. Start Electron app
echo ""
echo "🚀 Starting Speak..."
echo ""

if [ "$1" == "dev" ]; then
    NODE_ENV=development pnpm run dev
else
    pnpm start
fi
