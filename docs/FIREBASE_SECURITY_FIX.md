# 🔧 Firebase Authentication & Security Fix Guide

## 🚨 Current Issues Identified

1. **Missing Google Icon (404)** - Asset path issue
2. **FirebaseError: Missing or insufficient permissions** - Firestore rules issue
3. **FirebaseError: Error (auth/unauthorized-domain)** - Domain not authorized

## ✅ Step-by-Step Fix

### **1. Fix Unauthorized Domain Error**

Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Authentication → Settings → Authorized domains

**Add these domains:**
- `yuvaraj-tam.github.io`
- `localhost` (for testing)
- Your Wix domain (e.g., `yoursite.wixsite.com`)

### **2. Fix Firestore Security Rules**

Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Firestore Database → Rules

**Update your rules to:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to access borrowers
    match /borrowers/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to access loans
    match /loans/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to access payments
    match /payments/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to access reminders
    match /reminders/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Admin functions (if you need admin access)
    match /{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

### **3. Fix Asset Paths**

The Google icon path is incorrect. I've already fixed this in the `github-pages-fixed` folder.

**Re-upload the fixed files to GitHub Pages:**
1. Go to your GitHub repository → gh-pages branch
2. Delete all existing files
3. Upload all files from `github-pages-fixed` folder (with corrected asset paths)

### **4. Update Firebase Client Configuration**

Check your Firebase configuration in the web app. It should use the **web API key** (not admin key):

```javascript
const firebaseConfig = {
  apiKey: "your-web-api-key", // This is safe to expose
  authDomain: "jeeva-shg-loan.firebaseapp.com",
  projectId: "jeeva-shg-loan",
  storageBucket: "jeeva-shg-loan.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### **5. Test Authentication Flow**

After making these changes:

1. **Test locally first** (if possible)
2. **Test on GitHub Pages:** `https://yuvaraj-tam.github.io/Jeeva-SHG-RN/`
3. **Test in Wix iframe**

## 🛡️ Security Checklist

- [ ] Revoked the exposed service account key
- [ ] Generated new service account key (if needed for admin functions)
- [ ] Updated Firestore security rules
- [ ] Added authorized domains to Firebase Auth
- [ ] Re-uploaded files with correct asset paths
- [ ] Tested Google Sign-in flow

## 🎯 Expected Results After Fix

- ✅ Google icon loads correctly
- ✅ Google Sign-in works without domain errors
- ✅ Firestore operations work without permission errors
- ✅ App functions properly in iframe and direct access

## 🔧 Quick Fix Commands

```bash
# Fix asset paths (already done)
cd github-pages-fixed
mv assets/assets/* assets/
rmdir assets/assets

# Re-upload to GitHub Pages
# (Manual upload required via GitHub interface)
```

## 🆘 If Issues Persist

1. **Check browser console** for detailed error messages
2. **Verify Firebase project settings**
3. **Test with a simple HTML page** to isolate issues
4. **Check Firebase usage quotas**

---

**Remember:** The key security issue (exposed service account key) must be resolved first before the app can function securely. 