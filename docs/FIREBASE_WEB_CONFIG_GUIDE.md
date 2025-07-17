# 🔥 Firebase Web App Configuration Guide

## 🎯 Goal
Get the correct Firebase Web app configuration to replace the current Android configuration.

## 📋 Step-by-Step Instructions

### **Step 1: Access Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **"jeeva-shg-loan"**

### **Step 2: Find or Create Web App**
1. Click on **"Project settings"** (⚙️ gear icon)
2. Scroll down to **"Your apps"** section
3. Look for a **Web app** (🌐 icon)

**If you see a Web app:**
- Click on the Web app
- Copy the configuration

**If you DON'T see a Web app:**
- Click **"Add app"**
- Select **Web** (🌐 icon)
- App nickname: `Jeeva SHG Manager Web`
- ✅ Check "Also set up Firebase Hosting" (optional)
- Click **"Register app"**

### **Step 3: Copy Web Configuration**

You'll see a configuration like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD_-JI1U4hN3SCh5qlGTbsBPM3DgOvkj9Q",
  authDomain: "jeeva-shg-loan.firebaseapp.com",
  projectId: "jeeva-shg-loan",
  storageBucket: "jeeva-shg-loan.firebasestorage.app",
  messagingSenderId: "629019692790",
  appId: "1:629019692790:web:XXXXXXXXXXXXXXXX", // This will be different!
  measurementId: "G-XXXXXXXXXX" // Optional - for Analytics
};
```

### **Step 4: Update Your Code**

Replace the `appId` in `src/services/firebase.ts`:

**Current (Android):**
```javascript
appId: "1:629019692790:android:2cee053b82de1cf96da6d7"
```

**Update to (Web):**
```javascript
appId: "1:629019692790:web:YOUR_ACTUAL_WEB_APP_ID"
```

### **Step 5: Configure Authentication Domains**

1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. **Add these domains:**
   - `yuvaraj-tam.github.io`
   - `localhost` (for testing)
   - Your Wix domain (if using)

### **Step 6: Update Firestore Security Rules**

1. Go to **Firestore Database** → **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to access all collections
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Step 7: Rebuild and Deploy**

After updating the configuration:

```bash
# Rebuild the web app
npx expo export --platform web --clear

# Update the fixed deployment
./fix-github-pages.sh

# Re-upload to GitHub Pages
# (Upload files from github-pages-fixed folder)
```

## ✅ Verification Checklist

After updating:
- [ ] Web app created in Firebase Console
- [ ] Correct Web appId in firebase.ts
- [ ] Authorized domains added
- [ ] Firestore rules updated
- [ ] App rebuilt and redeployed
- [ ] Google Sign-in works without domain errors
- [ ] No permission errors in console

## 🚨 Common Issues

### "Configuration object is not valid"
- Make sure you're using the **Web** app configuration, not Android

### "auth/unauthorized-domain"
- Add your domain to Firebase Auth authorized domains

### "Missing or insufficient permissions"
- Update Firestore security rules to allow authenticated users

## 📱 Testing Steps

1. **Test direct access:** `https://yuvaraj-tam.github.io/Jeeva-SHG-RN/`
2. **Try Google Sign-in**
3. **Check browser console** for errors
4. **Test basic functionality** (add borrower, etc.)

## 🎯 Expected Web App Configuration

Your final configuration should look like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD_-JI1U4hN3SCh5qlGTbsBPM3DgOvkj9Q",
  authDomain: "jeeva-shg-loan.firebaseapp.com", 
  projectId: "jeeva-shg-loan",
  storageBucket: "jeeva-shg-loan.firebasestorage.app",
  messagingSenderId: "629019692790",
  appId: "1:629019692790:web:abcdef123456789", // Web app ID
  measurementId: "G-XXXXXXXXXX" // Optional
};
```

---

**🔑 Key Point:** The main difference is changing from `android:` to `web:` in the appId and ensuring you have the correct Web app registered in Firebase. 