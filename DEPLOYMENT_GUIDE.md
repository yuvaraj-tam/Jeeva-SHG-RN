# GitHub Pages Deployment Guide

## 🚀 Quick Fix for 404 Errors

If you're getting 404 errors for the JavaScript file, follow these steps:

### Step 1: Verify Files Are Uploaded Correctly

1. **Go to your GitHub repository:** `https://github.com/yuvaraj-tam/Jeeva-SHG-RN`
2. **Switch to the `gh-pages` branch**
3. **Verify these files exist in the root:**
   - `index.html`
   - `favicon.ico`
   - `_expo/static/js/web/index-87f9edf8881613f50cc916704b50915d.js`
   - `assets/` folder

### Step 2: Check File Structure

The file structure should look like this:
```
gh-pages branch root/
├── index.html
├── favicon.ico
├── metadata.json
├── README.md
├── _expo/
│   └── static/
│       └── js/
│           └── web/
│               ├── index-87f9edf8881613f50cc916704b50915d.js
│               └── deletionService-7cd0a3ddbbccfeda12693e6152ec2007.js
└── assets/
    └── (asset files)
```

### Step 3: Enable GitHub Pages

1. **Go to Settings → Pages**
2. **Set Source to "Deploy from a branch"**
3. **Select "gh-pages" branch and "/" folder**
4. **Click "Save"**
5. **Wait 2-5 minutes for deployment**

### Step 4: Test the URL

Your app should be available at:
`https://yuvaraj-tam.github.io/Jeeva-SHG-RN/`

## 🔧 Troubleshooting

### If files are missing:
1. **Upload all files from the `deploy` folder**
2. **Make sure to upload folders (`_expo/` and `assets/`) completely**
3. **Check that file names match exactly (case-sensitive)**

### If GitHub Pages shows 404:
1. **Wait 5-10 minutes for deployment**
2. **Clear browser cache**
3. **Try incognito/private browsing mode**
4. **Check GitHub Pages build logs in Settings → Pages**

### If JavaScript file not found:
1. **Verify the file path in `index.html`**
2. **Check that `_expo/static/js/web/` folder exists**
3. **Ensure the JavaScript file is uploaded**

## 📋 Manual Upload Steps

1. **Create gh-pages branch:**
   - Go to your repository
   - Click branch dropdown → "Create branch: gh-pages"

2. **Upload files:**
   - Click "Add file" → "Upload files"
   - Upload all contents of the `deploy` folder
   - **Important:** Upload folders as complete folders

3. **Commit changes**

4. **Enable GitHub Pages:**
   - Settings → Pages → Deploy from branch → gh-pages → Save

## 🎯 Success Indicators

- ✅ GitHub Pages shows green checkmark
- ✅ URL `https://yuvaraj-tam.github.io/Jeeva-SHG-RN/` loads
- ✅ No 404 errors in browser console
- ✅ App interface appears

## 🔗 Wix Integration

Once working, add to Wix:
```html
<iframe 
    src="https://yuvaraj-tam.github.io/Jeeva-SHG-RN/"
    style="width: 100%; height: 100vh; border: none; display: block;"
    title="Jeeva SHG Manager">
</iframe>
```

## 🆘 Still Having Issues?

1. **Check the test file:** `https://yuvaraj-tam.github.io/Jeeva-SHG-RN/test.html`
2. **Verify file permissions on GitHub**
3. **Contact GitHub support if needed** 