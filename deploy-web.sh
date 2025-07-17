#!/bin/bash

# Jeeva SHG Manager - Web Deployment Script
# This script helps deploy the React Native app for web integration

set -e

echo "🚀 Starting Jeeva SHG Manager Web Deployment..."

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Installing dependencies..."
npm install

print_status "Building for web..."
npm run web

print_success "Web build completed!"

echo ""
echo "📋 Next Steps:"
echo "1. The app is now running on http://localhost:19006"
echo "2. To deploy to Expo Hosting, run: eas build --platform web"
echo "3. To build static files, run: expo export --platform web"
echo ""
echo "🌐 Website Integration Options:"
echo ""
echo "Option 1 - Expo Hosting (Recommended):"
echo "  - Run: eas build --platform web"
echo "  - Get the URL from Expo dashboard"
echo "  - Add iframe to your website"
echo ""
echo "Option 2 - Static Build:"
echo "  - Run: expo export --platform web"
echo "  - Upload web-build folder to your server"
echo "  - Add iframe pointing to your server URL"
echo ""
echo "📖 See WEB_INTEGRATION_GUIDE.md for detailed instructions"
echo ""

# Ask user what they want to do next
echo "What would you like to do next?"
echo "1) Deploy to Expo Hosting"
echo "2) Build static files"
echo "3) Just run locally"
echo "4) Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_status "Deploying to Expo Hosting..."
        eas build --platform web
        print_success "Deployment initiated! Check your Expo dashboard for the URL."
        ;;
    2)
        print_status "Building static files..."
        expo export --platform web
        print_success "Static files created in web-build folder!"
        print_status "Upload the web-build folder to your web server."
        ;;
    3)
        print_success "App is running locally at http://localhost:19006"
        print_status "Press Ctrl+C to stop the server."
        ;;
    4)
        print_status "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Exiting..."
        exit 1
        ;;
esac 