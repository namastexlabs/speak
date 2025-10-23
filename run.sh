#!/bin/bash

# Speak - Voice Dictation App
# Production entry point

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt user for confirmation
prompt_yes_no() {
    local prompt="$1"
    local default="${2:-N}"
    
    if [[ "$default" == "Y" ]]; then
        prompt="$prompt [Y/n] "
    else
        prompt="$prompt [y/N] "
    fi
    
    while true; do
        read -p "$prompt" -n 1 -r
        echo
        if [[ -z "$REPLY" ]]; then
            REPLY="$default"
        fi
        case "$REPLY" in
            [Yy]) return 0 ;;
            [Nn]) return 1 ;;
            *) echo "Please answer Y or N." ;;
        esac
    done
}

# Check Node.js installation
check_nodejs() {
    print_status "Checking Node.js installation..."
    
    if ! command_exists node; then
        print_error "Node.js not found. Please install Node.js 18+"
        print_status "Download from: https://nodejs.org/"
        exit 1
    fi
    
    local node_version=$(node -v | cut -d'v' -f2)
    local major_version=$(echo $node_version | cut -d'.' -f1)
    
    if [[ "$major_version" -lt 18 ]]; then
        print_error "Node.js 18+ required. Current: $(node -v)"
        print_status "Please upgrade Node.js from: https://nodejs.org/"
        exit 1
    fi
    
    print_success "Node.js $(node -v) found"
}

# Install npm dependencies if needed
install_npm_deps() {
    print_status "Checking npm dependencies..."
    
    if [[ ! -d "node_modules" ]] || [[ ! -f "node_modules/.package-lock.json" && ! -f "node_modules/.npmrc" ]]; then
        print_status "Installing npm dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies already installed"
    fi
}

# Check system dependencies
check_system_deps() {
    print_status "Checking system dependencies..."
    
    # Check sox (required for audio recording)
    if ! command_exists sox; then
        print_warning "sox not found (required for audio recording)"
        print_status "Install instructions:"
        print_status "  macOS:   brew install sox"
        print_status "  Ubuntu:  sudo apt-get install sox libsox-fmt-all"
        print_status "  Fedora:  sudo dnf install sox"
        print_status "  Windows: choco install sox (or download from sox.sourceforge.net)"
        echo ""
        
        if prompt_yes_no "Would you like to install system dependencies automatically?" "N"; then
            if [[ -f "install.sh" ]]; then
                print_status "Running system dependency installer..."
                ./install.sh
            else
                print_error "install.sh not found. Please install sox manually."
                exit 1
            fi
        else
            if ! prompt_yes_no "Continue anyway? Audio recording will not work." "N"; then
                exit 1
            fi
        fi
    else
        local sox_version=$(sox --version 2>&1 | head -n1)
        print_success "sox installed: $sox_version"
    fi
}

# Generate assets if needed
generate_assets() {
    print_status "Checking app assets..."
    
    if [[ ! -d "assets/icons" ]]; then
        print_status "Generating app icons..."
        if npm run generate-icons 2>/dev/null; then
            print_success "Icons generated"
        else
            print_warning "Icon generation failed, but continuing..."
        fi
    else
        print_success "Assets already exist"
    fi
}

# Validate OpenAI API key configuration
validate_api_key() {
    print_status "Checking OpenAI API key configuration..."
    
    # Check if there's a stored API key
    if [[ -f "$HOME/.config/speak/config.json" ]]; then
        if grep -q "apiKey" "$HOME/.config/speak/config.json" 2>/dev/null; then
            print_success "OpenAI API key found in configuration"
            return 0
        fi
    fi
    
    # Check environment variable
    if [[ -n "$OPENAI_API_KEY" ]]; then
        print_success "OpenAI API key found in environment"
        return 0
    fi
    
    print_warning "No OpenAI API key found"
    print_status "You can configure it in the app settings after launch"
    print_status "Or set OPENAI_API_KEY environment variable"
}

# Start the application
start_app() {
    local mode="$1"
    
    print_status "Starting Speak..."
    echo ""
    
    # Set environment variables
    export NODE_ENV=${NODE_ENV:-production}
    
    if [[ "$mode" == "dev" ]]; then
        export NODE_ENV=development
        print_status "Running in development mode"
        npm run dev
    else
        print_status "Running in production mode"
        npm start
    fi
}

# Show startup complete message
show_startup_complete() {
    echo ""
    print_success "Speak is starting up..."
    echo ""
    print_status "Quick tips:"
    print_status "  • Press the global hotkey (default: Cmd+Shift Space on Mac, Ctrl+Shift Space on Win/Linux)"
    print_status "  • Configure settings in the app menu"
    print_status "  • Check the system tray for quick access"
    echo ""
    print_status "For help: https://github.com/yourusername/speak/issues"
}

# Main function
main() {
    local mode="${1:-production}"
    
    echo "🎤 Speak - Voice Dictation"
    echo "=========================="
    echo ""
    
    # Change to script directory
    cd "$(dirname "$0")"
    
    # Run all checks
    check_nodejs
    install_npm_deps
    check_system_deps
    generate_assets
    validate_api_key
    
    # Show completion message
    show_startup_complete
    
    # Start the app
    start_app "$mode"
}

# Handle script interruption
trap 'print_warning "Interrupted by user"; exit 130' INT

# Handle errors
trap 'print_error "An error occurred. Check the logs above for details."; exit 1' ERR

# Run main function with all arguments
main "$@"