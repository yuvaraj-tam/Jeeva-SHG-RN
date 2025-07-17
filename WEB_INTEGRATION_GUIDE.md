# Web Integration Guide for Jeeva SHG Manager

## Overview
This guide explains how to integrate your React Native app with www.jeevatrust.org as a separate tab.

## Integration Options

### Option 1: Expo Web Deployment (Recommended)
Your app is already configured for web deployment. This is the easiest approach.

#### Steps:
1. **Build for Web:**
   ```bash
   npm run web
   # or
   expo start --web
   ```

2. **Deploy to Expo Hosting:**
   ```bash
   npx expo install expo-hosting
   eas build:configure
   eas build --platform web
   ```

3. **Add to Website:**
   Add this iframe to your website:
   ```html
   <iframe 
     src="https://your-expo-app-url.web.app" 
     width="100%" 
     height="800px" 
     frameborder="0"
     style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
   </iframe>
   ```

### Option 2: Standalone Web Build
Create a standalone web version that can be hosted on your own server.

#### Steps:
1. **Build Static Files:**
   ```bash
   expo export --platform web
   ```

2. **Upload to Your Server:**
   - Upload the `web-build` folder to your web server
   - Configure your web server to serve the files

3. **Add to Website:**
   ```html
   <iframe 
     src="https://www.jeevatrust.org/shg-manager/" 
     width="100%" 
     height="800px" 
     frameborder="0">
   </iframe>
   ```

### Option 3: Direct Integration
Embed the app directly into your website without iframe.

#### Steps:
1. **Build and Deploy:**
   ```bash
   expo export --platform web
   ```

2. **Add to Website:**
   ```html
   <div id="jeeva-shg-app"></div>
   <script src="path/to/your/app.js"></script>
   ```

## Website Integration Code

### For www.jeevatrust.org

Add this HTML to your website:

```html
<!-- Navigation Tab -->
<li class="nav-item">
  <a class="nav-link" href="#shg-manager" data-toggle="tab">
    <i class="fas fa-users"></i> SHG Manager
  </a>
</li>

<!-- Tab Content -->
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
              src="YOUR_APP_URL_HERE" 
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

### Responsive Design CSS

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

## Deployment Options

### 1. Expo Hosting (Easiest)
- Free tier available
- Automatic HTTPS
- Global CDN
- Easy deployment

### 2. Your Own Server
- Full control
- Custom domain
- No external dependencies
- Requires server setup

### 3. Static Hosting (Netlify/Vercel)
- Free tier available
- Automatic deployments
- Custom domain support
- Good performance

## Configuration Updates

### Update app.json for Web
```json
{
  "expo": {
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro",
      "output": "static",
      "build": {
        "babel": {
          "include": ["@expo/vector-icons"]
        }
      }
    }
  }
}
```

### Environment Variables
Create `.env` file:
```
EXPO_PUBLIC_WEB_BASE_URL=https://www.jeevatrust.org
EXPO_PUBLIC_API_URL=https://your-api-url.com
```

## Security Considerations

1. **CORS Configuration:**
   - Configure your Firebase/Firestore to allow requests from your domain
   - Update Firebase security rules

2. **Authentication:**
   - Ensure Google Sign-In works on web
   - Configure OAuth redirect URIs

3. **Content Security Policy:**
   - Add necessary CSP headers to your website
   - Allow iframe embedding if using iframe approach

## Performance Optimization

1. **Lazy Loading:**
   - Load the app only when the tab is clicked
   - Use intersection observer for better performance

2. **Caching:**
   - Implement service worker for offline support
   - Cache static assets

3. **Bundle Size:**
   - Use code splitting
   - Optimize images and assets

## Testing Checklist

- [ ] App loads correctly in iframe
- [ ] Authentication works on web
- [ ] All features function properly
- [ ] Responsive design works
- [ ] Performance is acceptable
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness

## Troubleshooting

### Common Issues:

1. **Iframe not loading:**
   - Check CORS settings
   - Verify URL is correct
   - Check browser console for errors

2. **Authentication issues:**
   - Update OAuth redirect URIs
   - Check Firebase configuration
   - Verify domain is whitelisted

3. **Styling issues:**
   - Check iframe dimensions
   - Verify CSS is not conflicting
   - Test on different screen sizes

## Next Steps

1. Choose your preferred deployment option
2. Build and deploy the web version
3. Add the integration code to your website
4. Test thoroughly
5. Monitor performance and user feedback

## Support

For issues or questions:
- Check Expo documentation
- Review Firebase web setup
- Test in different browsers
- Monitor console for errors 