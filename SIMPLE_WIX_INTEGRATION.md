# Simple Wix Integration (No Velo Required)

## 🎯 Quick Solution for Wix.com

Since Velo by Wix can be difficult to find, here's the **simplest approach** that works with any Wix plan.

## 🚀 Step 1: Deploy Your App

### Option A: GitHub Pages (Recommended)
```bash
# Run the deployment script
./deploy-to-github-pages.sh
```

Then:
1. Go to [GitHub.com](https://github.com)
2. Create a new repository named `jeeva-shg-manager-web`
3. Upload all files from the `jeeva-shg-manager-web` folder
4. Go to Settings → Pages → Enable GitHub Pages
5. Your URL: `https://yourusername.github.io/jeeva-shg-manager-web/`

### Option B: Netlify (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your entire `dist` folder
3. Get your URL instantly

## 🔧 Step 2: Add to Wix (No Velo Needed)

### Method 1: Custom HTML Element
1. **Log into Wix dashboard**
2. **Go to your website editor**
3. **Add a new page:**
   - Click "Pages" in left sidebar
   - Click "+" button
   - Choose "Blank Page"
   - Name it "SHG Manager"

4. **Add Custom HTML:**
   - Click "+" to add elements
   - Search for "HTML" or "Custom Code"
   - Add "HTML Code" element
   - Paste this code:

```html
<iframe 
    src="YOUR_APP_URL_HERE"
    style="width: 100%; height: 100vh; border: none; display: block;"
    title="Jeeva SHG Manager">
</iframe>
```

### Method 2: Using Wix App Market
1. Go to Wix App Market
2. Search for "HTML Embed" or "Custom Code"
3. Install the app
4. Add your iframe code

## 📱 Step 3: Update Navigation

1. Go to your main navigation menu
2. Click "Edit Menu"
3. Add new item: "SHG Manager"
4. Link it to the new page

## 🎨 Customization Options

### Mobile Responsive
Add this CSS to make it mobile-friendly:

```html
<iframe 
    src="YOUR_APP_URL_HERE"
    style="width: 100%; height: 100vh; border: none; display: block; max-width: 100%;"
    title="Jeeva SHG Manager">
</iframe>
```

### With Loading Screen
```html
<div id="loading" style="display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
    <div>
        <h2>Loading Jeeva SHG Manager...</h2>
        <p>Please wait while the application loads.</p>
    </div>
</div>

<iframe 
    id="app-frame"
    src="YOUR_APP_URL_HERE"
    style="width: 100%; height: 100vh; border: none; display: none;"
    onload="document.getElementById('loading').style.display='none'; this.style.display='block';"
    title="Jeeva SHG Manager">
</iframe>
```

## 🔒 Security Setup

### Update Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Authentication → Settings → Authorized domains
4. Add your Wix domain (e.g., `your-site.wixsite.com`)

## 🆘 Troubleshooting

### Common Issues:

1. **App doesn't load:**
   - Check if your hosting URL is accessible
   - Verify the URL in the iframe src
   - Check browser console for errors

2. **Authentication fails:**
   - Update Firebase Auth authorized domains
   - Add your Wix domain to Firebase

3. **Styling issues:**
   - Check iframe dimensions
   - Test on different screen sizes

## 🎯 Quick Test

1. Test your app URL directly in browser first
2. Then test the iframe in Wix
3. Check mobile responsiveness

## 🎉 Success!

Your users can now:
- Access SHG Manager from your Wix website
- Use all features seamlessly
- Access from any device
- Have a professional integrated experience

---

**Need Help?**
- Test your app URL first: `https://yourusername.github.io/jeeva-shg-manager-web/`
- Check browser console for errors
- Verify Firebase configuration
- Contact Wix support if needed 