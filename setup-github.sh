#!/bin/bash

# GitHub Setup Script for Jeeva SHG Manager Web
# This script helps you create a GitHub repository and upload your dist files

set -e

echo "🐙 Setting up GitHub repository for Jeeva SHG Manager..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if we're in the dist directory
if [ ! -f "index.html" ]; then
    print_error "Please run this script from the dist directory"
    print_status "Run: cd dist && ../setup-github.sh"
    exit 1
fi

print_success "Found dist files!"

echo ""
echo "📋 GitHub Repository Setup Options:"
echo ""
echo "1) Manual setup (Recommended for beginners)"
echo "2) Using GitHub CLI (if you have it installed)"
echo "3) Using git commands (for advanced users)"
echo ""

read -p "Choose your setup method (1-3): " choice

case $choice in
    1)
        print_status "Manual GitHub Setup Instructions:"
        echo ""
        echo "🌐 Step 1: Create GitHub Repository"
        echo "1. Go to https://github.com"
        echo "2. Click '+' → 'New repository'"
        echo "3. Repository name: jeeva-shg-manager-web"
        echo "4. Description: Jeeva SHG Manager Web App"
        echo "5. Make it PUBLIC (required for GitHub Pages)"
        echo "6. DON'T initialize with README"
        echo "7. Click 'Create repository'"
        echo ""
        echo "📁 Step 2: Upload Files"
        echo "1. In your new repository, click 'uploading an existing file'"
        echo "2. Drag and drop ALL files from the dist folder:"
        echo "   - index.html"
        echo "   - favicon.ico"
        echo "   - metadata.json"
        echo "   - _expo/ folder"
        echo "   - assets/ folder"
        echo "3. Add commit message: 'Initial commit - Jeeva SHG Manager'"
        echo "4. Click 'Commit changes'"
        echo ""
        echo "⚙️ Step 3: Enable GitHub Pages"
        echo "1. Go to Settings → Pages"
        echo "2. Source: 'Deploy from a branch'"
        echo "3. Branch: 'main'"
        echo "4. Folder: '/ (root)'"
        echo "5. Click 'Save'"
        echo "6. Wait a few minutes for deployment"
        echo ""
        echo "🔗 Your URL will be: https://yourusername.github.io/jeeva-shg-manager-web/"
        echo ""
        print_success "Manual setup instructions provided!"
        ;;
    2)
        print_status "Checking for GitHub CLI..."
        if command -v gh &> /dev/null; then
            print_success "GitHub CLI found!"
            echo ""
            echo "📝 GitHub CLI Setup:"
            echo "1. Make sure you're logged in: gh auth login"
            echo "2. Create repository: gh repo create jeeva-shg-manager-web --public"
            echo "3. Add files: git add . && git commit -m 'Initial commit'"
            echo "4. Push: git push -u origin main"
            echo "5. Enable Pages: gh repo edit --enable-pages"
            echo ""
        else
            print_error "GitHub CLI not found. Please install it first or choose option 1."
            echo "Install with: brew install gh (on macOS)"
        fi
        ;;
    3)
        print_status "Git Commands Setup:"
        echo ""
        echo "📝 Git Commands:"
        echo "1. Initialize git: git init"
        echo "2. Add files: git add ."
        echo "3. Commit: git commit -m 'Initial commit'"
        echo "4. Add remote: git remote add origin https://github.com/yourusername/jeeva-shg-manager-web.git"
        echo "5. Push: git push -u origin main"
        echo ""
        print_success "Git commands provided!"
        ;;
    *)
        print_error "Invalid choice. Exiting..."
        exit 1
        ;;
esac

echo ""
echo "🔧 Next Steps After GitHub Setup:"
echo "1. Get your GitHub Pages URL"
echo "2. Test the URL in your browser"
echo "3. Use the URL in your Wix integration"
echo "4. Replace 'YOUR_APP_URL_HERE' in the Wix HTML code"
echo ""

print_success "GitHub setup instructions complete!"
print_status "After setup, your app will be available at: https://yourusername.github.io/jeeva-shg-manager-web/" 