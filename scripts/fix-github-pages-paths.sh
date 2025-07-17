#!/bin/bash

echo "🔧 Fixing GitHub Pages asset paths..."

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found!"
    echo "Please run 'npx expo export --platform web' first"
    exit 1
fi

# Create a more GitHub Pages friendly structure
echo "📁 Restructuring for GitHub Pages compatibility..."

# Create static folder and move _expo content there
mkdir -p dist/static/js/web
if [ -d "dist/_expo/static/js/web" ]; then
    echo "  📦 Moving JavaScript files to static folder..."
    cp dist/_expo/static/js/web/*.js dist/static/js/web/
fi

# Fix absolute paths to relative paths in index.html
if [ -f "dist/index.html" ]; then
    echo "📝 Fixing paths in index.html..."
    
    # Replace absolute paths with relative paths
    sed -i.bak 's|src="/_expo/|src="./static/|g' dist/index.html
    sed -i.bak 's|href="/_expo/|href="./static/|g' dist/index.html
    sed -i.bak 's|src="/assets/|src="./assets/|g' dist/index.html
    sed -i.bak 's|href="/assets/|href="./assets/|g' dist/index.html
    sed -i.bak 's|href="/favicon.ico"|href="./favicon.ico"|g' dist/index.html
    
    # Remove backup file
    rm -f dist/index.html.bak
    
    echo "✅ Fixed asset paths in index.html"
else
    echo "❌ index.html not found in dist folder"
    exit 1
fi

# Fix absolute paths in JavaScript files
echo "📝 Fixing paths in JavaScript files..."
find dist -name "*.js" -type f | while read -r file; do
    echo "  🔧 Fixing $file"
    # Replace absolute _expo paths with relative static paths in JS files
    sed -i.bak 's|"/_expo/|"./static/|g' "$file"
    sed -i.bak "s|'/_expo/|'./static/|g" "$file"
    # Remove backup files
    rm -f "$file.bak"
done

echo "✅ Fixed asset paths in JavaScript files"

# Create a .nojekyll file to ensure GitHub Pages serves all files
echo "📄 Creating .nojekyll file..."
touch dist/.nojekyll

echo "🎉 GitHub Pages paths fixed successfully!" 