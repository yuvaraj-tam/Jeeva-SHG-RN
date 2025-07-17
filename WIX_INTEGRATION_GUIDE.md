# Wix.com Integration Guide for Jeeva SHG Manager

## 🎯 Overview
This guide will help you integrate your React Native app with your Wix.com website (www.jeevatrust.org) as a separate page/tab.

## 📋 Prerequisites
- Your React Native app is working on web (✅ Done)
- Static files exported to `dist` folder (✅ Done)
- Access to your Wix.com dashboard

## 🚀 Step-by-Step Integration

### Step 1: Host Your App Files

You have several options for hosting the exported files:

#### Option A: GitHub Pages (Free & Recommended)
1. **Create a GitHub repository:**
   ```bash
   # Create a new repository on GitHub
   # Name it: jeeva-shg-manager-web
   ```

2. **Upload your files:**
   ```bash
   # Copy all files from the dist folder to your GitHub repo
   # Enable GitHub Pages in repository settings
   # Your URL will be: https://yourusername.github.io/jeeva-shg-manager-web/
   ```

#### Option B: Netlify (Free & Easy)
1. **Go to [netlify.com](https://netlify.com)**
2. **Drag and drop the `dist` folder**
3. **Get your URL** (e.g., `https://jeeva-shg-manager.netlify.app`)

#### Option C: Vercel (Free & Fast)
1. **Go to [vercel.com](https://vercel.com)**
2. **Import your project**
3. **Deploy the `dist` folder**

### Step 2: Add Custom HTML to Wix

Since Wix doesn't support direct iframe embedding in their standard editor, you'll need to use custom HTML:

1. **Log into your Wix dashboard**
2. **Go to your website editor**
3. **Add a new page:**
   - Click "Pages" in the left sidebar
   - Click the "+" button
   - Choose "Blank Page"
   - Name it "SHG Manager"

4. **Add Custom HTML:**
   - Click the "+" button to add elements
   - Search for "HTML" or "Custom Code"
   - Add "HTML Code" element
   - Paste this code:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jeeva SHG Manager</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        
        .app-container {
            width: 100%;
            height: 100vh;
            border: none;
            display: block;
        }
        
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 18px;
        }
        
        .error {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #f8f9fa;
            color: #dc3545;
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div>
            <h2>Loading Jeeva SHG Manager...</h2>
            <p>Please wait while the application loads.</p>
        </div>
    </div>
    
    <iframe 
        id="app-frame"
        class="app-container"
        src="YOUR_APP_URL_HERE"
        style="display: none;"
        onload="hideLoading()"
        onerror="showError()">
    </iframe>
    
    <script>
        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('app-frame').style.display = 'block';
        }
        
        function showError() {
            document.getElementById('loading').innerHTML = 
                '<div class="error">' +
                '<div>' +
                '<h2>Unable to Load SHG Manager</h2>' +
                '<p>The application is currently unavailable. Please try again later.</p>' +
                '<p>If the problem persists, contact support.</p>' +
                '</div>' +
                '</div>';
        }
        
        // Hide loading after 10 seconds as fallback
        setTimeout(function() {
            if (document.getElementById('loading').style.display !== 'none') {
                hideLoading();
            }
        }, 10000);
    </script>
</body>
</html>
```

### Step 3: Update Navigation

1. **Go to your main navigation menu**
2. **Add a new menu item:**
   - Click on your navigation menu
   - Click "Edit Menu"
   - Add new item: "SHG Manager"
   - Link it to the new page you created

### Step 4: Alternative Method - Using Wix Velo (Advanced)

If you want more control, you can use Wix Velo:

1. **Enable Velo in your Wix dashboard**
2. **Go to Developer Tools → Velo by Wix**
3. **Add this code to your page:**

```javascript
// Page code
import wixWindow from 'wix-window';

$w.onReady(function () {
    // Create iframe dynamically
    const iframe = document.createElement('iframe');
    iframe.src = 'YOUR_APP_URL_HERE';
    iframe.style.width = '100%';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    
    // Add to page
    const container = $w('#container');
    container.appendChild(iframe);
});
```

## 🔧 Configuration Options

### Mobile Responsive Design
Add this CSS to make it mobile-friendly:

```css
@media (max-width: 768px) {
    .app-container {
        height: 100vh;
        width: 100vw;
    }
}
```

### Custom Styling
You can customize the appearance by modifying the CSS in the HTML code.

## 🔒 Security Considerations

### 1. Update Firebase Configuration
- Go to your Firebase Console
- Add your Wix domain to authorized domains
- Update Firestore security rules if needed

### 2. Content Security Policy
If you encounter CSP issues, you may need to:
- Contact Wix support to allow your app domain
- Or use a different hosting solution

## 📱 Testing Checklist

- [ ] App loads correctly in Wix
- [ ] Login functionality works
- [ ] All features function properly
- [ ] Mobile responsive
- [ ] Navigation works
- [ ] No console errors

## 🆘 Troubleshooting

### Common Issues:

1. **App doesn't load:**
   - Check if your hosting URL is accessible
   - Verify CORS settings in Firebase
   - Check browser console for errors

2. **Authentication fails:**
   - Update Firebase Auth authorized domains
   - Check OAuth redirect URIs
   - Verify Google Sign-In configuration

3. **Styling issues:**
   - Check iframe dimensions
   - Verify CSS is not conflicting
   - Test on different screen sizes

4. **Wix-specific issues:**
   - Some Wix templates may have restrictions
   - Contact Wix support if needed
   - Consider using Wix Velo for more control

## 🎯 Recommended Hosting Options

### 1. GitHub Pages (Recommended)
- **Pros:** Free, reliable, easy to update
- **Cons:** Requires GitHub account
- **URL:** `https://yourusername.github.io/jeeva-shg-manager-web/`

### 2. Netlify
- **Pros:** Free, automatic deployments, custom domain
- **Cons:** None significant
- **URL:** `https://your-app-name.netlify.app`

### 3. Vercel
- **Pros:** Free, fast, great performance
- **Cons:** None significant
- **URL:** `https://your-app-name.vercel.app`

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your app URL is accessible
3. Test the app directly (not in Wix) first
4. Contact Wix support for platform-specific issues

## 🎉 Success!

Once integrated, your users can:
- Access the SHG Manager directly from your Wix website
- Use all features without leaving your site
- Have a seamless experience across devices
- Access the app from any browser

## 🔄 Updates

To update your app:
1. Re-export the web build: `npx expo export --platform web`
2. Upload the new files to your hosting provider
3. The changes will be live immediately

---

**Next Steps:**
1. Choose your hosting option
2. Upload the `dist` folder files
3. Get your app URL
4. Add the HTML code to Wix
5. Test thoroughly
6. Update navigation
7. Go live! 🚀 