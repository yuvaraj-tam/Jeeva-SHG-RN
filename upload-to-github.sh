#!/bin/bash

echo "🚀 Uploading Jeeva SHG Manager to GitHub Pages"
echo "=============================================="

# Check if jeeva-shg-manager-web folder exists
if [ ! -d "jeeva-shg-manager-web" ]; then
    echo "❌ Error: jeeva-shg-manager-web folder not found!"
    echo "Please run './deploy-to-github-pages.sh' first"
    exit 1
fi

echo "✅ Found jeeva-shg-manager-web folder"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized!"
    echo "Please run: git init"
    exit 1
fi

echo "✅ Git repository found"

# Check if remote is set
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo "❌ Error: No remote repository configured!"
    echo ""
    echo "📋 Please set up your GitHub repository:"
    echo "1. Create a new repository on GitHub named 'jeeva-shg-manager-web'"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/jeeva-shg-manager-web.git"
    echo "3. Run this script again"
    exit 1
fi

echo "✅ Remote repository: $REMOTE_URL"

# Copy files from jeeva-shg-manager-web to root
echo "📁 Copying files to repository root..."
cp -r jeeva-shg-manager-web/* .

# Add all files to git
echo "📝 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy Jeeva SHG Manager to GitHub Pages"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Successfully uploaded to GitHub!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to your GitHub repository: $REMOTE_URL"
echo "2. Go to Settings → Pages"
echo "3. Set Source to 'Deploy from a branch'"
echo "4. Select 'main' branch and '/' folder"
echo "5. Click 'Save'"
echo ""
echo "🌐 Your app will be available at:"
echo "   https://yourusername.github.io/jeeva-shg-manager-web/"
echo ""
echo "🔗 Then add this HTML to your Wix page:"
echo "----------------------------------------"
echo "<iframe src=\"https://yourusername.github.io/jeeva-shg-manager-web/\""
echo "        style=\"width: 100%; height: 100vh; border: none; display: block;\""
echo "        title=\"Jeeva SHG Manager\">"
echo "</iframe>"
echo "----------------------------------------"
echo ""
echo "🎉 Your app will be ready for Wix integration!" 