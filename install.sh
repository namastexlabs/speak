#!/bin/bash

# Speak - System Dependencies Installer
# Installs system-level dependencies required for audio recording

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

# Detect operating system
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            echo "debian"
        elif [ -f /etc/redhat-release ]; then
            echo "redhat"
        elif [ -f /etc/arch-release ]; then
            echo "arch"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install sox on macOS
install_sox_macos() {
    print_status "Installing sox on macOS..."
    
    if command_exists brew; then
        brew install sox
        print_success "sox installed via Homebrew"
    elif command_exists port; then
        sudo port install sox
        print_success "sox installed via MacPorts"
    else
        print_error "Neither Homebrew nor MacPorts found"
        print_status "Please install Homebrew first:"
        print_status "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        print_status "Then run this script again"
        exit 1
    fi
}

# Install sox on Debian/Ubuntu
install_sox_debian() {
    print_status "Installing sox on Debian/Ubuntu..."
    
    if command_exists apt-get; then
        sudo apt-get update
        sudo apt-get install -y sox libsox-fmt-all
        print_success "sox installed via apt-get"
    else
        print_error "apt-get not found"
        exit 1
    fi
}

# Install sox on RedHat/Fedora/CentOS
install_sox_redhat() {
    print_status "Installing sox on RedHat/Fedora/CentOS..."
    
    if command_exists dnf; then
        sudo dnf install -y sox
        print_success "sox installed via dnf"
    elif command_exists yum; then
        sudo yum install -y sox
        print_success "sox installed via yum"
    else
        print_error "Neither dnf nor yum found"
        exit 1
    fi
}

# Install sox on Arch Linux
install_sox_arch() {
    print_status "Installing sox on Arch Linux..."
    
    if command_exists pacman; then
        sudo pacman -S --noconfirm sox
        print_success "sox installed via pacman"
    else
        print_error "pacman not found"
        exit 1
    fi
}

# Instructions for Windows
install_sox_windows() {
    print_warning "Windows detected - manual installation required"
    print_status "Please install sox manually:"
    print_status ""
    print_status "Option 1 - Chocolatey (recommended):"
    print_status "  1. Install Chocolatey: https://chocolatey.org/install"
    print_status "  2. Run: choco install sox"
    print_status ""
    print_status "Option 2 - Download directly:"
    print_status "  1. Download from: http://sox.sourceforge.net/"
    print_status "  2. Add sox to your PATH"
    print_status ""
    print_status "Option 3 - WSL (Windows Subsystem for Linux):"
    print_status "  1. Install WSL: wsl --install"
    print_status "  2. Run this script inside WSL"
}

# Main installation function
install_dependencies() {
    local os=$(detect_os)
    
    print_status "Detected OS: $os"
    print_status "Installing system dependencies for Speak..."
    echo ""
    
    case $os in
        "macos")
            install_sox_macos
            ;;
        "debian")
            install_sox_debian
            ;;
        "redhat")
            install_sox_redhat
            ;;
        "arch")
            install_sox_arch
            ;;
        "windows")
            install_sox_windows
            ;;
        "linux")
            print_warning "Generic Linux detected - trying common package managers"
            if command_exists apt-get; then
                install_sox_debian
            elif command_exists dnf; then
                install_sox_redhat
            elif command_exists pacman; then
                install_sox_arch
            else
                print_error "No supported package manager found"
                print_status "Please install sox manually using your distribution's package manager"
                exit 1
            fi
            ;;
        *)
            print_error "Unsupported operating system: $os"
            print_status "Please install sox manually for your platform"
            exit 1
            ;;
    esac
}

# Verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    if command_exists sox; then
        local sox_version=$(sox --version 2>&1 | head -n1)
        print_success "sox is installed: $sox_version"
        
        # Test sox functionality
        print_status "Testing sox functionality..."
        echo "test" | sox -t wav - -t wav -n stat 2>/dev/null && \
            print_success "sox is working correctly" || \
            print_warning "sox installed but may not be fully functional"
    else
        print_error "sox installation failed"
        exit 1
    fi
}

# Show next steps
show_next_steps() {
    echo ""
    print_success "System dependencies installed successfully!"
    echo ""
    print_status "Next steps:"
    print_status "  1. Install Node.js dependencies: npm install"
    print_status "  2. Generate app icons: npm run generate-icons"
    print_status "  3. Start the app: ./run.sh"
    echo ""
    print_status "For development mode: ./run.sh dev"
    print_status "For production mode: ./run.sh"
}

# Main script execution
main() {
    echo "🎤 Speak - System Dependencies Installer"
    echo "========================================"
    echo ""
    
    # Check if running with appropriate privileges
    if [[ "$OSTYPE" != "darwin"* ]] && [[ "$OSTYPE" != "cygwin" ]] && [[ "$OSTYPE" != "msys" ]] && [[ "$OSTYPE" != "win32" ]]; then
        if [[ $EUID -ne 0 ]]; then
            print_warning "This script may require sudo privileges for package installation"
            print_status "You may be prompted for your password"
            echo ""
        fi
    fi
    
    # Install dependencies
    install_dependencies
    
    # Skip verification for Windows (manual installation)
    if [[ "$(detect_os)" != "windows" ]]; then
        verify_installation
    fi
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"