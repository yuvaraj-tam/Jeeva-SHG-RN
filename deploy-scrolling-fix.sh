#!/bin/bash

echo "🚀 Deploying Jeeva SHG Manager with aggressive scrolling fixes..."

# Build the web version
echo "📦 Building web version..."
npx expo export

# Fix the JavaScript file path reference
echo "🔧 Fixing JavaScript file path reference..."
cd dist
ACTUAL_JS_FILE=$(find . -name "index-*.js" -path "*/web/*" | head -1 | sed 's|^\./||')
if [ -n "$ACTUAL_JS_FILE" ]; then
    echo "Found JavaScript file: $ACTUAL_JS_FILE"
    # Update the HTML file to use the correct JavaScript file path
    sed -i.bak "s|src=\"./static/js/web/index-[a-zA-Z0-9]*\.js\"|src=\"./$ACTUAL_JS_FILE\"|g" index.html
    sed -i.bak "s|src=\"./_expo/static/js/web/index-[a-zA-Z0-9]*\.js\"|src=\"./$ACTUAL_JS_FILE\"|g" index.html
    sed -i.bak "s|src=\"/_expo/static/js/web/index-[a-zA-Z0-9]*\.js\"|src=\"./$ACTUAL_JS_FILE\"|g" index.html
    echo "Updated HTML file with correct JavaScript path"
else
    echo "⚠️  Warning: Could not find JavaScript file to update"
fi

# Fix absolute paths to relative paths for GitHub Pages
echo "🔧 Converting absolute paths to relative paths..."
sed -i.bak "s|href=\"/favicon.ico\"|href=\"./favicon.ico\"|g" index.html
sed -i.bak "s|src=\"/_expo/|src=\"./_expo/|g" index.html
sed -i.bak "s|href=\"/_expo/|href=\"./_expo/|g" index.html
echo "Converted absolute paths to relative paths"

# Add scrolling fixes to the HTML file
echo "🔧 Adding scrolling fixes to HTML..."
# Check if scrolling fixes are already present
if ! grep -q "Aggressive iframe scrolling fix" index.html; then
    # Add scrolling fixes before closing body tag
    sed -i.bak '/<\/body>/i\
  <script>\
    // Aggressive iframe scrolling fix\
    (function() {\
      console.log("Applying aggressive iframe scrolling fixes...");\
      \
      function applyScrollingFixes() {\
        // Force scrolling on all elements\
        const allElements = document.querySelectorAll("*");\
        allElements.forEach(element => {\
          if (element.style) {\
            element.style.overflowY = "auto";\
            element.style.overflowX = "hidden";\
            element.style.webkitOverflowScrolling = "touch";\
          }\
        });\
        \
        // Force body and html scrolling\
        document.body.style.overflowY = "auto";\
        document.body.style.overflowX = "hidden";\
        document.body.style.webkitOverflowScrolling = "touch";\
        document.body.style.height = "auto";\
        document.body.style.minHeight = "100vh";\
        \
        document.documentElement.style.overflowY = "auto";\
        document.documentElement.style.overflowX = "hidden";\
        document.documentElement.style.webkitOverflowScrolling = "touch";\
        document.documentElement.style.height = "auto";\
        document.documentElement.style.minHeight = "100vh";\
        \
        // Force root element scrolling\
        const root = document.getElementById("root");\
        if (root) {\
          root.style.overflowY = "auto";\
          root.style.overflowX = "hidden";\
          root.style.webkitOverflowScrolling = "touch";\
          root.style.height = "auto";\
          root.style.minHeight = "100vh";\
        }\
        \
        console.log("Scrolling fixes applied");\
      }\
      \
      // Apply fixes immediately\
      applyScrollingFixes();\
      \
      // Apply fixes multiple times\
      setTimeout(applyScrollingFixes, 100);\
      setTimeout(applyScrollingFixes, 500);\
      setTimeout(applyScrollingFixes, 1000);\
      setTimeout(applyScrollingFixes, 2000);\
      setTimeout(applyScrollingFixes, 5000);\
      \
      // Listen for DOM changes\
      const observer = new MutationObserver(applyScrollingFixes);\
      observer.observe(document.body, {\
        childList: true,\
        subtree: true,\
        attributes: true,\
        attributeFilter: ["style", "class"]\
      });\
      \
      // Test scrolling\
      setTimeout(() => {\
        window.scrollTo(0, 1);\
        window.scrollTo(0, 0);\
        console.log("Scroll test completed");\
      }, 1000);\
    })();\
  </script>' index.html
    echo "Added scrolling fixes to HTML"
else
    echo "Scrolling fixes already present in HTML"
fi

# Add scrolling CSS to the style section
echo "🔧 Adding scrolling CSS to HTML..."
if ! grep -q "overflow-y: auto !important" index.html; then
    # Add scrolling CSS before closing style tag
    sed -i.bak '/<\/style>/i\
      \
      /* Force scrolling on all elements */\
      * {\
        overflow-y: auto !important;\
        overflow-x: hidden !important;\
        -webkit-overflow-scrolling: touch !important;\
      }\
      \
      /* React Native Web specific fixes */\
      [data-rn-root] {\
        overflow-y: auto !important;\
        overflow-x: hidden !important;\
        height: auto !important;\
        min-height: 100vh !important;\
        -webkit-overflow-scrolling: touch !important;\
      }\
      \
      [class*="ScrollView"] {\
        overflow-y: auto !important;\
        overflow-x: hidden !important;\
        height: auto !important;\
        min-height: 100vh !important;\
        -webkit-overflow-scrolling: touch !important;\
      }\
      \
      [class*="View"] {\
        overflow-y: auto !important;\
        overflow-x: hidden !important;\
        height: auto !important;\
        min-height: 100vh !important;\
        -webkit-overflow-scrolling: touch !important;\
      }\
      \
      /* Force scroll on all div elements */\
      div {\
        overflow-y: auto !important;\
        overflow-x: hidden !important;\
        -webkit-overflow-scrolling: touch !important;\
      }' index.html
    
    # Also update existing body and root styles
    sed -i.bak 's/body {/body {\n        overflow-y: auto !important;\n        overflow-x: hidden !important;\n        -webkit-overflow-scrolling: touch !important;/g' index.html
    sed -i.bak 's/#root {/#root {\n        overflow-y: auto !important;\n        overflow-x: hidden !important;\n        -webkit-overflow-scrolling: touch !important;/g' index.html
    
    echo "Added scrolling CSS to HTML"
else
    echo "Scrolling CSS already present in HTML"
fi

# Navigate to dist directory (already there)
# cd dist

# Force add all files (including those in .gitignore)
echo "📝 Adding files to git..."
git add -f .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy with aggressive iframe scrolling fixes and fixed JS path - $(date)"

# Force push to gh-pages branch
echo "🚀 Pushing to GitHub Pages..."
git push origin gh-pages --force

echo "✅ Deployment complete!"
echo "🌐 Your app is now live at: https://yuvaraj-tam.github.io/Jeeva-SHG-RN/"
echo ""
echo "📋 Next steps:"
echo "1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Test scrolling in the iframe on your Wix site"
echo "3. Check browser console for scrolling debug messages"
echo ""
echo "🔧 If scrolling still doesn't work, try:"
echo "- Opening the app directly: https://yuvaraj-tam.github.io/Jeeva-SHG-RN/"
echo "- Testing with the iframe test file: iframe-test.html"
echo "- Checking browser developer tools for any errors" 