#!/bin/bash

echo "🔧 Fixing JavaScript file path reference..."

# Navigate to dist directory
cd dist

# Find the actual JavaScript file
ACTUAL_JS_FILE=$(find . -name "index-*.js" -path "*/web/*" | head -1 | sed 's|^\./||')

if [ -n "$ACTUAL_JS_FILE" ]; then
    echo "Found JavaScript file: $ACTUAL_JS_FILE"
    
    # Update the HTML file to use the correct JavaScript file path
    sed -i.bak "s|src=\"./static/js/web/index-[a-zA-Z0-9]*\.js\"|src=\"./$ACTUAL_JS_FILE\"|g" index.html
    sed -i.bak "s|src=\"./_expo/static/js/web/index-[a-zA-Z0-9]*\.js\"|src=\"./$ACTUAL_JS_FILE\"|g" index.html
    
    echo "✅ Updated HTML file with correct JavaScript path"
    
    # Deploy the fix
    echo "📝 Adding files to git..."
    git add -f .
    
    echo "💾 Committing changes..."
    git commit -m "Fix JavaScript file path reference - $(date)"
    
    echo "🚀 Pushing to GitHub Pages..."
    git push origin gh-pages
    
    echo "✅ Fix deployed successfully!"
    echo "🌐 Your app should now work at: https://yuvaraj-tam.github.io/Jeeva-SHG-RN/"
    echo ""
    echo "📋 Next steps:"
    echo "1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
    echo "2. Test the app again"
    
else
    echo "❌ Error: Could not find JavaScript file to update"
    echo "Available files:"
    find . -name "*.js" -type f
fi 