#!/bin/bash

echo "🚀 Simple GitHub Pages Deployment"
echo "================================"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found!"
    echo "Please run 'npx expo export --platform web' first"
    exit 1
fi

# Create a simple deployment folder
DEPLOY_DIR="simple-deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

echo "📁 Creating simple deployment structure..."

# Copy JavaScript files to root
if [ -d "dist/_expo/static/js/web" ]; then
    echo "  📦 Copying JavaScript files to root..."
    cp dist/_expo/static/js/web/*.js $DEPLOY_DIR/
fi

# Copy assets
if [ -d "dist/assets" ]; then
    echo "  🖼️ Copying assets..."
    cp -r dist/assets $DEPLOY_DIR/
fi

# Copy other files
echo "  📄 Copying other files..."
cp dist/favicon.ico $DEPLOY_DIR/ 2>/dev/null || true
cp dist/metadata.json $DEPLOY_DIR/ 2>/dev/null || true

# Fix paths in JavaScript files
echo "  🔧 Fixing paths in JavaScript files..."
find $DEPLOY_DIR -name "*.js" -type f | while read -r file; do
    echo "    Fixing $file"
    # Replace all _expo paths with relative paths
    sed -i.bak 's|"/_expo/|"./|g' "$file"
    sed -i.bak "s|'/_expo/|'./|g" "$file"
    # Remove backup files
    rm -f "$file.bak"
done

# Create a simple index.html
echo "  📝 Creating simple index.html..."
cat > $DEPLOY_DIR/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>Jeeva SHG Manager</title>
    <style id="expo-reset">
      html, body { height: 100%; }
      body { overflow: hidden; }
      #root { height: 100%; }
    </style>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script src="./index-d3991442c5d1e88342d809f1d90f4d15.js" defer></script>
  </body>
</html>
EOF

# Create .nojekyll
touch $DEPLOY_DIR/.nojekyll

echo "✅ Simple deployment ready in $DEPLOY_DIR folder"
echo ""
echo "📋 To deploy:"
echo "1. Upload all files from $DEPLOY_DIR to your GitHub repository"
echo "2. Enable GitHub Pages in repository settings"
echo "3. Your app will be available at: https://yourusername.github.io/repository-name/" 