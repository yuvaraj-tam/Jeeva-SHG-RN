#!/bin/bash

# Wix Integration Setup Script for Jeeva SHG Manager
# This script helps you prepare your app for Wix integration

set -e

echo "🌐 Setting up hosting for Wix integration..."

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

# Check if dist folder exists
if [ ! -d "dist" ]; then
    print_error "dist folder not found. Please run 'npx expo export --platform web' first."
    exit 1
fi

print_success "Found dist folder with exported files!"

echo ""
echo "📋 Available hosting options:"
echo ""
echo "1) GitHub Pages (Recommended - Free)"
echo "2) Netlify (Free & Easy)"
echo "3) Vercel (Free & Fast)"
echo "4) Show me the files to upload manually"
echo ""

read -p "Choose your hosting option (1-4): " choice

case $choice in
    1)
        print_status "Setting up GitHub Pages..."
        echo ""
        echo "📝 Steps for GitHub Pages:"
        echo "1. Go to github.com and create a new repository"
        echo "2. Name it: jeeva-shg-manager-web"
        echo "3. Upload all files from the dist folder to the repository"
        echo "4. Go to Settings → Pages"
        echo "5. Select 'Deploy from a branch'"
        echo "6. Choose 'main' branch and '/ (root)' folder"
        echo "7. Click 'Save'"
        echo ""
        echo "Your URL will be: https://yourusername.github.io/jeeva-shg-manager-web/"
        echo ""
        print_success "GitHub Pages setup instructions provided!"
        ;;
    2)
        print_status "Setting up Netlify..."
        echo ""
        echo "📝 Steps for Netlify:"
        echo "1. Go to netlify.com"
        echo "2. Sign up/Login with GitHub"
        echo "3. Drag and drop the dist folder to the deploy area"
        echo "4. Wait for deployment to complete"
        echo "5. Get your URL (e.g., https://random-name.netlify.app)"
        echo "6. You can customize the URL in site settings"
        echo ""
        print_success "Netlify setup instructions provided!"
        ;;
    3)
        print_status "Setting up Vercel..."
        echo ""
        echo "📝 Steps for Vercel:"
        echo "1. Go to vercel.com"
        echo "2. Sign up/Login with GitHub"
        echo "3. Click 'New Project'"
        echo "4. Import your GitHub repository"
        echo "5. Set root directory to 'dist'"
        echo "6. Click 'Deploy'"
        echo "7. Get your URL"
        echo ""
        print_success "Vercel setup instructions provided!"
        ;;
    4)
        print_status "Showing files to upload..."
        echo ""
        echo "📁 Files in dist folder:"
        ls -la dist/
        echo ""
        echo "📝 Upload these files to your hosting provider:"
        echo "- index.html"
        echo "- favicon.ico"
        echo "- _expo/ folder"
        echo "- All other files in the dist folder"
        echo ""
        print_success "File list displayed!"
        ;;
    *)
        print_error "Invalid choice. Exiting..."
        exit 1
        ;;
esac

echo ""
echo "🔧 Next Steps:"
echo "1. Complete the hosting setup above"
echo "2. Get your app URL"
echo "3. Follow the WIX_INTEGRATION_GUIDE.md for Wix setup"
echo "4. Replace 'YOUR_APP_URL_HERE' in the HTML code with your actual URL"
echo ""

print_success "Setup complete! Check WIX_INTEGRATION_GUIDE.md for detailed Wix integration steps." 