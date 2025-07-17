#!/bin/bash

echo "🔧 Fixing GitHub Pages Deployment"
echo "================================="

# Check if deploy folder exists
if [ ! -d "deploy" ]; then
    echo "❌ Error: deploy folder not found!"
    echo "Please run './clean-deploy.sh' first"
    exit 1
fi

echo "✅ Found deploy folder"

# Create a fixed deployment directory
FIXED_DIR="github-pages-fixed"
rm -rf $FIXED_DIR
mkdir -p $FIXED_DIR

# Copy essential files
echo "📁 Copying essential files..."
cp deploy/index.html $FIXED_DIR/
cp deploy/favicon.ico $FIXED_DIR/
cp deploy/metadata.json $FIXED_DIR/

# Create directory structure with shorter names
mkdir -p $FIXED_DIR/js
mkdir -p $FIXED_DIR/assets

# Copy JavaScript files with shorter names
echo "🔄 Renaming JavaScript files..."
cp "deploy/_expo/static/js/web/index-87f9edf8881613f50cc916704b50915d.js" "$FIXED_DIR/js/app.js"
cp "deploy/_expo/static/js/web/deletionService-7cd0a3ddbbccfeda12693e6152ec2007.js" "$FIXED_DIR/js/deletion.js"

# Copy assets
cp -r deploy/assets/* $FIXED_DIR/assets/ 2>/dev/null || true

# Update index.html with new paths
echo "🔧 Updating index.html with new paths..."
sed 's|src="_expo/static/js/web/index-87f9edf8881613f50cc916704b50915d.js"|src="js/app.js"|g' deploy/index.html > $FIXED_DIR/index.html

# Create a simple test file
cat > $FIXED_DIR/test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Test - File Loading</title>
</head>
<body>
    <h1>Testing File Loading</h1>
    <div id="status">Loading...</div>
    
    <script>
        console.log('Testing app.js loading...');
        
        fetch('js/app.js')
            .then(response => {
                if (response.ok) {
                    document.getElementById('status').innerHTML = '✅ app.js found and accessible!';
                    document.getElementById('status').style.color = 'green';
                } else {
                    document.getElementById('status').innerHTML = '❌ app.js not found (404)';
                    document.getElementById('status').style.color = 'red';
                }
            })
            .catch(error => {
                document.getElementById('status').innerHTML = '❌ Error loading app.js: ' + error;
                document.getElementById('status').style.color = 'red';
            });
    </script>
</body>
</html>
EOF

# Create README
cat > $FIXED_DIR/README.md << 'EOF'
# Jeeva SHG Manager - GitHub Pages

Fixed deployment with simplified file structure:

- `index.html` - Main app
- `js/app.js` - Main JavaScript bundle
- `js/deletion.js` - Deletion service
- `assets/` - Static assets
- `test.html` - File loading test

Upload all these files to the gh-pages branch.
EOF

echo "✅ Fixed deployment prepared in '$FIXED_DIR' folder"
echo ""
echo "📋 Upload Instructions:"
echo "1. Go to your GitHub repository gh-pages branch"
echo "2. Delete existing files (or create a new commit)"
echo "3. Upload all files from '$FIXED_DIR' folder"
echo "4. Wait 2-5 minutes for deployment"
echo ""
echo "📁 Files ready for upload:"
ls -la $FIXED_DIR/
echo ""
echo "🌐 Test URLs after upload:"
echo "   Main app: https://yuvaraj-tam.github.io/Jeeva-SHG-RN/"
echo "   Test page: https://yuvaraj-tam.github.io/Jeeva-SHG-RN/test.html" 