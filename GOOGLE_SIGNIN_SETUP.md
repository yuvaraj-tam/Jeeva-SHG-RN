# Google Sign-In Setup Guide

## Current Status
The app currently has a mock Google Sign-In implementation that works for testing. For production, you need to configure proper Google OAuth.

## Issues with Current Implementation
1. **Production Google Sign-In not working**: The current implementation uses `signInWithPopup` which doesn't work on mobile devices
2. **Missing OAuth Configuration**: Need proper Google OAuth client setup

## Solution: Proper Google Sign-In Setup

### Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project**: `jeeva-shg-loan`
3. **Enable Google Sign-In API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sign-In API"
   - Click "Enable"

### Step 2: Create OAuth 2.0 Client ID

1. **Go to Credentials**: "APIs & Services" > "Credentials"
2. **Create OAuth 2.0 Client ID**:
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Android"
   - Package name: `com.jeevashg.manager`
   - SHA-1 certificate fingerprint: Get this from your keystore

### Step 3: Get SHA-1 Certificate Fingerprint

For production builds, you need the SHA-1 of your release keystore:

```bash
# For the keystore created by EAS Build
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Step 4: Update Firebase Configuration

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `jeeva-shg-loan`
3. **Go to Authentication** > "Sign-in method"
4. **Enable Google Sign-In**
5. **Add your OAuth 2.0 Client ID**

### Step 5: Update App Configuration

Update `app.json` to include Google Sign-In configuration:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "package": "com.jeevashg.manager"
    },
    "plugins": [
      "@react-native-google-signin/google-signin"
    ]
  }
}
```

### Step 6: Install Google Sign-In Package

```bash
npx expo install @react-native-google-signin/google-signin
```

### Step 7: Update AuthService Implementation

Replace the mock implementation in `src/services/authService.ts` with:

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});

// Google Sign In
static async googleSignIn(): Promise<User> {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    const credential = GoogleAuthProvider.credential(
      userInfo.idToken,
      userInfo.accessToken
    );
    
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw new Error(this.getErrorMessage(error.code || 'auth/google-sign-in-failed'));
  }
}
```

## Current Mock Implementation

The current implementation provides a working mock for testing:

- ✅ **Button Design**: Official Google Sign-In button design
- ✅ **Mock Flow**: Simulates successful Google sign-in
- ✅ **Error Handling**: Proper error messages
- ✅ **UI Integration**: Seamless integration with login flow

## Testing the Current Implementation

1. **Mock Google Sign-In**: Click the "Sign in with Google" button
2. **Expected Behavior**: Should show success and navigate to main app
3. **User Info**: Will show as "google.user@example.com"

## Next Steps for Production

1. **Follow the setup guide above**
2. **Configure Google OAuth properly**
3. **Replace mock implementation with real Google Sign-In**
4. **Test on real devices**

## Troubleshooting

### Common Issues:
1. **SHA-1 mismatch**: Ensure SHA-1 fingerprint matches your keystore
2. **Package name mismatch**: Verify package name in Google Cloud Console
3. **API not enabled**: Make sure Google Sign-In API is enabled
4. **Firebase configuration**: Check Firebase Authentication settings

### Debug Steps:
1. Check console logs for error messages
2. Verify Google Cloud Console configuration
3. Test with debug keystore first
4. Ensure all dependencies are installed

## Resources

- [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/android)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Expo Google Sign-In](https://docs.expo.dev/versions/latest/sdk/google-sign-in/) 