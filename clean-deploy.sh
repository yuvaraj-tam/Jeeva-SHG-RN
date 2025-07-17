#!/bin/bash

echo "🚀 Clean Deploy to GitHub Pages"
echo "==============================="

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found!"
    echo "Please run 'npx expo export --platform web' first"
    exit 1
fi

echo "✅ Found dist folder"

# Create a clean deployment directory
DEPLOY_DIR="deploy"
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

# Copy only the essential web files
echo "📁 Copying essential web files..."
cp -r dist/* $DEPLOY_DIR/

# Fix asset paths in index.html
echo "🔧 Fixing asset paths..."
sed -i '' 's|src="/_expo/|src="_expo/|g' $DEPLOY_DIR/index.html
sed -i '' 's|href="/favicon.ico"|href="favicon.ico"|g' $DEPLOY_DIR/index.html

# Create a simple README for the deployment
cat > $DEPLOY_DIR/README.md << 'EOF'
# Jeeva SHG Manager - Web App

This is the web deployment of the Jeeva SHG Manager React Native app.

## Files
- `index.html` - Main application file
- `_expo/` - JavaScript bundles and assets
- `assets/` - Static assets
- `favicon.ico` - Favicon

## Deployment
This folder contains only the web build files for GitHub Pages deployment.
EOF

echo "✅ Clean deployment prepared in '$DEPLOY_DIR' folder"
echo ""
echo "📋 Manual Upload Instructions:"
echo "1. Go to your GitHub repository: https://github.com/yuvaraj-tam/Jeeva-SHG-RN"
echo "2. Create a new branch called 'gh-pages'"
echo "3. Upload all files from the '$DEPLOY_DIR' folder to the root of the gh-pages branch"
echo "4. Go to Settings → Pages"
echo "5. Set Source to 'Deploy from a branch'"
echo "6. Select 'gh-pages' branch and '/' folder"
echo "7. Click 'Save'"
echo ""
echo "🌐 Your app will be available at:"
echo "   https://yuvaraj-tam.github.io/Jeeva-SHG-RN/"
echo ""
echo "🔗 Then add this HTML to your Wix page:"
echo "----------------------------------------"
echo "<iframe src=\"https://yuvaraj-tam.github.io/Jeeva-SHG-RN/\""
echo "        style=\"width: 100%; height: 100vh; border: none; display: block;\""
echo "        title=\"Jeeva SHG Manager\">"
echo "</iframe>"
echo "----------------------------------------"
echo ""
echo "📁 Files ready for upload:"
ls -la $DEPLOY_DIR/ 