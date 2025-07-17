#!/bin/bash

echo "🚀 Deploying Jeeva SHG Manager to GitHub Pages for Wix Integration"
echo "================================================================"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found!"
    echo "Please run 'npx expo export --platform web' first"
    exit 1
fi

echo "✅ Found dist folder"

# Create a temporary directory for GitHub Pages
TEMP_DIR="jeeva-shg-manager-web"
rm -rf $TEMP_DIR
mkdir $TEMP_DIR

# Copy all files from dist to temp directory
echo "📁 Copying files..."
cp -r dist/* $TEMP_DIR/

# Create a simple index.html if it doesn't exist
if [ ! -f "$TEMP_DIR/index.html" ]; then
    echo "📄 Creating index.html..."
    cat > $TEMP_DIR/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jeeva SHG Manager</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .app-frame {
            width: 100%;
            height: 100vh;
            border: none;
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <iframe 
            class="app-frame"
            src="./index.html"
            title="Jeeva SHG Manager">
        </iframe>
    </div>
</body>
</html>
EOF
fi

echo "✅ Files prepared in $TEMP_DIR folder"
echo ""
echo "📋 Next Steps:"
echo "1. Create a new GitHub repository named 'jeeva-shg-manager-web'"
echo "2. Upload all files from the '$TEMP_DIR' folder to your repository"
echo "3. Go to repository Settings → Pages → Enable GitHub Pages"
echo "4. Your app URL will be: https://yourusername.github.io/jeeva-shg-manager-web/"
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