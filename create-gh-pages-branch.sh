#!/bin/bash

echo "🚀 Creating GitHub Pages Branch for Jeeva SHG Manager"
echo "===================================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository!"
    exit 1
fi

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found!"
    echo "Please run 'npx expo export --platform web' first"
    exit 1
fi

echo "✅ Found dist folder"

# Create a temporary directory for the web build
TEMP_DIR="gh-pages-temp"
rm -rf $TEMP_DIR
mkdir $TEMP_DIR

# Copy web build files
echo "📁 Copying web build files..."
cp -r dist/* $TEMP_DIR/

# Fix asset paths in index.html
echo "🔧 Fixing asset paths..."
sed -i '' 's|src="/_expo/|src="_expo/|g' $TEMP_DIR/index.html
sed -i '' 's|href="/favicon.ico"|href="favicon.ico"|g' $TEMP_DIR/index.html

# Create or switch to gh-pages branch
echo "🌿 Creating gh-pages branch..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
    git checkout gh-pages
    git rm -rf .
else
    git checkout --orphan gh-pages
fi

# Copy files from temp directory to root
echo "📝 Adding files to gh-pages branch..."
cp -r $TEMP_DIR/* .

# Add all files
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Deploy Jeeva SHG Manager to GitHub Pages"

# Push to GitHub
echo "🚀 Pushing gh-pages branch..."
git push origin gh-pages

# Switch back to main branch
git checkout main

# Clean up
rm -rf $TEMP_DIR

echo ""
echo "✅ Successfully created gh-pages branch!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to your GitHub repository: https://github.com/yuvaraj-tam/Jeeva-SHG-RN"
echo "2. Go to Settings → Pages"
echo "3. Set Source to 'Deploy from a branch'"
echo "4. Select 'gh-pages' branch and '/' folder"
echo "5. Click 'Save'"
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
echo "🎉 Your app will be ready for Wix integration!" 