# Production Android App Build Guide

## Option 1: Expo EAS Build (Recommended - Cloud Build)

### Prerequisites:
1. Create an Expo account at https://expo.dev/signup
2. Install EAS CLI: `npm install -g eas-cli`

### Steps:
1. **Login to EAS:**
   ```bash
   eas login
   ```

2. **Initialize EAS project:**
   ```bash
   eas build:configure
   ```

3. **Build for Android:**
   ```bash
   npm run build:android
   ```

4. **Download the APK:**
   - The build will be completed in the cloud
   - You'll receive a download link via email
   - Or download from the Expo dashboard

## Option 2: Local Android Build

### Prerequisites:
1. Install Android Studio: https://developer.android.com/studio
2. Install Android SDK
3. Set up environment variables

### Steps:
1. **Install Android Studio and SDK**
2. **Set environment variables:**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Build the APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **Find the APK:**
   - Location: `android/app/build/outputs/apk/release/app-release.apk`

## Option 3: Using Expo Development Build

### Steps:
1. **Create development build:**
   ```bash
   npx expo run:android
   ```

2. **For production build:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

## App Configuration

The app is configured with:
- **Package Name:** com.jeevashg.manager
- **App Name:** Jeeva SHG Manager
- **Version:** 1.0.0
- **Permissions:** Internet, Storage, Phone, SMS

## Features Included:
- ✅ User Management
- ✅ Loan Management
- ✅ Payment Tracking
- ✅ Reports & Analytics
- ✅ Reminders & Notifications
- ✅ Excel Import/Export
- ✅ Firebase Integration
- ✅ Google Sign-in

## Testing the App:
1. Install the APK on an Android device
2. Test all features:
   - User registration/login
   - Loan creation and management
   - Payment tracking
   - Reports generation
   - Excel import/export

## Distribution:
- **Internal Testing:** Share APK directly
- **Google Play Store:** Upload to Play Console
- **Enterprise:** Distribute via MDM solutions

## Troubleshooting:
- If build fails, check Expo account and login
- Ensure all dependencies are installed
- Verify Android SDK installation for local builds
- Check network connection for cloud builds 