#!/bin/bash

echo "🚀 Uploading to GitHub Pages"
echo "================================"

# Check if we're in the right directory
if [ ! -d "simple-deploy" ]; then
    echo "❌ Error: simple-deploy folder not found!"
    echo "Please run ./scripts/deploy-simple.sh first"
    exit 1
fi

echo "📁 Found simple-deploy folder with files:"
ls -la simple-deploy/

echo ""
echo "📋 Instructions to upload to GitHub Pages:"
echo ""
echo "1. Go to your GitHub repository: https://github.com/yuvaraj-tam/Jeeva-SHG-RN"
echo ""
echo "2. Navigate to the repository root and click 'Add file' → 'Upload files'"
echo ""
echo "3. Drag and drop ALL files from the simple-deploy folder:"
echo "   - index.html"
echo "   - index-d3991442c5d1e88342d809f1d90f4d15.js"
echo "   - deletionService-383c7f0651fe5ac9e1cc854a4295e8bb.js"
echo "   - metadata.json"
echo "   - favicon.ico"
echo "   - .nojekyll"
echo "   - assets/ folder (and all its contents)"
echo ""
echo "4. Add a commit message like: 'Deploy latest version to GitHub Pages'"
echo ""
echo "5. Click 'Commit changes'"
echo ""
echo "6. Wait a few minutes for GitHub Pages to update"
echo ""
echo "7. Your app will be available at: https://yuvaraj-tam.github.io/Jeeva-SHG-RN/"
echo ""
echo "⚠️  Note: Make sure to upload ALL files, including the .nojekyll file!"
echo "   This file tells GitHub Pages to serve all files, not just Jekyll files."
echo ""

# Alternative: Offer to create a zip file
echo "💡 Alternative: Would you like me to create a zip file of the deployment files?"
read -p "Create zip file? (y/n): " create_zip

if [ "$create_zip" = "y" ] || [ "$create_zip" = "Y" ]; then
    echo "📦 Creating zip file..."
    cd simple-deploy
    zip -r ../jeeva-shg-deployment.zip .
    cd ..
    echo "✅ Created jeeva-shg-deployment.zip"
    echo "You can now download this zip file and extract it to upload to GitHub"
fi

echo ""
echo "🎉 Deployment files are ready! Follow the instructions above to upload to GitHub Pages." 