#!/bin/bash

# Web Deployment Script for Jeeva SHG Manager
# This script builds and deploys the web app to GitHub Pages

set -e

echo "🚀 Starting web deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Building web app..."
npx expo export --platform web

if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi

print_status "Build completed successfully!"

# Apply scrolling fixes to the generated index.html
print_status "Applying scrolling fixes to index.html..."

# Create a temporary file with the fixes
cat > temp_index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>Jeeva SHG Manager</title>
    <!-- The `react-native-web` recommended style reset: https://necolas.github.io/react-native-web/docs/setup/#root-element -->
    <style id="expo-reset">
      /* These styles make the body full-height */
      html,
      body {
        height: 100%;
      }
      /* These styles disable body scrolling if you are using <ScrollView> */
      body {
        overflow: hidden;
      }
      /* These styles make the root element full-height */
      #root {
        display: flex;
        height: 100%;
        flex: 1;
      }
    </style>
    
    <!-- Enhanced scrolling fixes for web and iframe environments -->
    <style>
      /* Universal scrolling fixes */
      html, body {
        overflow: auto !important;
        overflow-x: auto !important;
        overflow-y: auto !important;
        height: auto !important;
        min-height: 100vh !important;
        position: relative !important;
      }
      
      #root {
        overflow: auto !important;
        overflow-x: auto !important;
        overflow-y: auto !important;
        height: auto !important;
        min-height: 100vh !important;
        position: relative !important;
        display: block !important;
        flex: none !important;
      }
      
      /* Force scrolling on all scrollable elements */
      * {
        overflow: visible !important;
      }
      
      /* Ensure proper scrolling behavior */
      .scrollable-container {
        overflow: auto !important;
        overflow-x: auto !important;
        overflow-y: auto !important;
        height: auto !important;
        min-height: 100vh !important;
        position: relative !important;
      }
      
      /* Fix for iframe environments */
      @media (max-width: 9999px) {
        html, body, #root {
          overflow: auto !important;
          overflow-x: auto !important;
          overflow-y: auto !important;
          height: auto !important;
          min-height: 100vh !important;
          position: relative !important;
        }
      }
    </style>
  <link rel="icon" href="favicon.ico" /></head>

  <body>
    <!-- Use static rendering with Expo Router to support running without JavaScript. -->
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <!-- The root element for your Expo app. -->
    <div id="root"></div>
    
    <!-- Enhanced scrolling script -->
    <script>
      console.log('Page loading...');
      
      // Force scrolling fixes after page load
      function applyScrollingFixes() {
        console.log('Applying scrolling fixes...');
        const html = document.documentElement;
        const body = document.body;
        const root = document.getElementById('root');
        
        console.log('Root element:', root);
        
        // Apply scrolling styles
        [html, body, root].forEach(element => {
          if (element) {
            element.style.overflow = 'auto';
            element.style.overflowX = 'auto';
            element.style.overflowY = 'auto';
            element.style.height = 'auto';
            element.style.minHeight = '100vh';
            element.style.position = 'relative';
          }
        });
        
        // Remove flex display from root
        if (root) {
          root.style.display = 'block';
          root.style.flex = 'none';
        }
        
        // Force scroll on all elements
        document.querySelectorAll('*').forEach(el => {
          el.style.overflow = 'visible';
        });
        
        console.log('Scrolling fixes applied');
      }
      
      // Apply fixes immediately
      applyScrollingFixes();
      
      // Apply fixes after DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyScrollingFixes);
      }
      
      // Apply fixes after window loads
      window.addEventListener('load', applyScrollingFixes);
      
      // Apply fixes periodically for the first few seconds
      let attempts = 0;
      const interval = setInterval(() => {
        applyScrollingFixes();
        attempts++;
        if (attempts >= 10) {
          clearInterval(interval);
        }
      }, 500);
      
      // Check for script loading errors
      window.addEventListener('error', function(e) {
        console.error('Script error:', e);
      });
    </script>
    
  <script src="/_expo/static/js/web/index-b2b4a8e5bf1b74473a00dc0b747e8be3.js" defer></script>
</body>
</html>
EOF

# Get the actual JavaScript file name from the dist directory
JS_FILE=$(ls dist/_expo/static/js/web/index-*.js | head -1 | xargs basename)
if [ -n "$JS_FILE" ]; then
    # Update the script tag with the correct file name
    sed -i.bak "s/index-b2b4a8e5bf1b74473a00dc0b747e8be3.js/$JS_FILE/g" temp_index.html
    print_status "Updated JavaScript file reference to: $JS_FILE"
else
    print_warning "Could not find JavaScript file, using default reference"
fi

# Replace the generated index.html with our fixed version
mv temp_index.html dist/index.html

print_status "Scrolling fixes applied successfully!"

# Switch to gh-pages branch
print_status "Switching to gh-pages branch..."
git checkout gh-pages

# Copy the built files to the root
print_status "Copying built files..."
cp -r dist/* .

# Clean up
rm -rf dist/

# Commit and push
print_status "Committing changes..."
git add .
git commit -m "Update web deployment with latest build and scrolling fixes"

print_status "Pushing to GitHub Pages..."
git push origin gh-pages

# Switch back to main branch
print_status "Switching back to main branch..."
git checkout main

print_status "✅ Web deployment completed successfully!"
print_status "🌐 Your app should be available at: https://yuvaraj-tam.github.io/Jeeva-SHG-RN/"
print_status "⏱️  It may take a few minutes for changes to appear." 