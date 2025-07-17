#!/bin/bash

echo "🚀 Deploying to GitHub Pages via Git"
echo "====================================="

# Check if we're in the right directory
if [ ! -d "simple-deploy" ]; then
    echo "❌ Error: simple-deploy folder not found!"
    echo "Please run ./scripts/deploy-simple.sh first"
    exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed or not in PATH"
    exit 1
fi

echo "📁 Found simple-deploy folder with files:"
ls -la simple-deploy/

echo ""
echo "🔄 Creating gh-pages branch and deploying..."

# Create a temporary directory for deployment
TEMP_DIR=$(mktemp -d)
echo "📂 Using temporary directory: $TEMP_DIR"

# Copy deployment files to temp directory
cp -r simple-deploy/* "$TEMP_DIR/"

# Navigate to temp directory
cd "$TEMP_DIR"

# Initialize git repository
git init
git add .
git commit -m "Deploy latest version to GitHub Pages"

# Add remote origin
git remote add origin https://github.com/yuvaraj-tam/Jeeva-SHG-RN.git

# Force push to gh-pages branch
echo "📤 Pushing to gh-pages branch..."
git push -f origin main:gh-pages

# Clean up
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository settings"
echo "2. Navigate to 'Pages' section"
echo "3. Set source to 'Deploy from a branch'"
echo "4. Select 'gh-pages' branch and '/ (root)' folder"
echo "5. Click 'Save'"
echo ""
echo "🌐 Your app will be available at: https://yuvaraj-tam.github.io/Jeeva-SHG-RN/"
echo ""
echo "⏱️  It may take a few minutes for the changes to appear." 