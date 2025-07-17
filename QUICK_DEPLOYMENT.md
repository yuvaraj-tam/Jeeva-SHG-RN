# Quick Deployment Guide - Jeeva SHG Manager

## 🚀 Immediate Steps to Integrate with www.jeevatrust.org

### Step 1: Test Locally
```bash
# Run the deployment script
./deploy-web.sh

# Or manually:
npm run web
```

### Step 2: Deploy to Expo Hosting (Recommended)
```bash
# Deploy to Expo Hosting
eas build --platform web

# Get the URL from your Expo dashboard
# It will look like: https://your-app-name.web.app
```

### Step 3: Add to Your Website

Add this code to your website's navigation:

```html
<!-- Add this to your navigation menu -->
<li class="nav-item">
  <a class="nav-link" href="#shg-manager" data-toggle="tab">
    <i class="fas fa-users"></i> SHG Manager
  </a>
</li>
```

Add this code to your website's content area:

```html
<!-- Add this to your tab content -->
<div class="tab-pane fade" id="shg-manager">
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">
              <i class="fas fa-users"></i> Jeeva SHG Manager
            </h5>
          </div>
          <div class="card-body p-0">
            <iframe 
              src="YOUR_EXPO_APP_URL_HERE" 
              width="100%" 
              height="700px" 
              frameborder="0"
              style="border: none; border-radius: 0 0 8px 8px;">
            </iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Step 4: Test the Integration

1. Open your website
2. Click on the "SHG Manager" tab
3. The app should load in the iframe
4. Test all functionality (login, navigation, etc.)

## 🔧 Alternative: Self-Hosted Deployment

If you prefer to host on your own server:

```bash
# Build static files
expo export --platform web

# Upload the 'web-build' folder to your web server
# Example: /var/www/html/shg-manager/

# Update the iframe src to:
src="https://www.jeevatrust.org/shg-manager/"
```

## 📱 Mobile Responsive CSS

Add this CSS to your website:

```css
/* Mobile Responsive */
@media (max-width: 768px) {
  #shg-manager iframe {
    height: 600px;
  }
}

/* Tablet Responsive */
@media (min-width: 769px) and (max-width: 1024px) {
  #shg-manager iframe {
    height: 650px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  #shg-manager iframe {
    height: 700px;
  }
}
```

## 🔒 Security Considerations

1. **Update Firebase Configuration:**
   - Add your website domain to Firebase Auth authorized domains
   - Update Firestore security rules if needed

2. **CORS Settings:**
   - Ensure your Firebase project allows requests from your domain

3. **Content Security Policy:**
   - Add iframe-src directive to allow your app URL

## 🎯 Quick Test Checklist

- [ ] App loads in iframe
- [ ] Login functionality works
- [ ] Navigation between screens works
- [ ] All features function properly
- [ ] Mobile responsive
- [ ] No console errors

## 🆘 Troubleshooting

### If the app doesn't load:
1. Check the iframe URL is correct
2. Verify CORS settings in Firebase
3. Check browser console for errors
4. Ensure the app is deployed and accessible

### If authentication fails:
1. Update Firebase Auth authorized domains
2. Check OAuth redirect URIs
3. Verify Google Sign-In configuration

### If styling looks wrong:
1. Check iframe dimensions
2. Verify CSS is not conflicting
3. Test on different screen sizes

## 📞 Support

For immediate help:
1. Check the browser console for errors
2. Verify your Expo app URL is accessible
3. Test the app directly (not in iframe) first
4. Review the detailed WEB_INTEGRATION_GUIDE.md

## 🎉 Success!

Once integrated, your users can:
- Access the SHG Manager directly from your website
- Use all features without leaving your site
- Have a seamless experience across devices
- Access the app from any browser 