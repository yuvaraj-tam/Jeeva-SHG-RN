#!/bin/bash

echo "🚀 Jeeva SHG Manager - Android Build Script"
echo "=============================================="

echo ""
echo "📋 Available build options:"
echo "1. Expo EAS Cloud Build (Recommended)"
echo "2. Local Android Build (Requires Android Studio)"
echo "3. Development Build"
echo ""

read -p "Choose an option (1-3): " choice

case $choice in
  1)
    echo ""
    echo "🌐 Setting up Expo EAS Cloud Build..."
    echo ""
    echo "📝 Prerequisites:"
    echo "- Create an Expo account at https://expo.dev/signup"
    echo "- Make sure you're logged in to EAS"
    echo ""
    read -p "Press Enter when you have an Expo account and are ready to continue..."
    
    echo ""
    echo "🔐 Logging in to EAS..."
    npx eas login
    
    echo ""
    echo "⚙️  Configuring EAS build..."
    npx eas build:configure
    
    echo ""
    echo "🏗️  Building Android APK..."
    npm run build:android
    
    echo ""
    echo "✅ Build completed! Check your email or Expo dashboard for the download link."
    ;;
    
  2)
    echo ""
    echo "🏠 Setting up Local Android Build..."
    echo ""
    echo "📝 Prerequisites:"
    echo "- Install Android Studio: https://developer.android.com/studio"
    echo "- Install Java 17 or 21 (not Java 24)"
    echo "- Set up ANDROID_HOME environment variable"
    echo ""
    read -p "Press Enter when you have Android Studio and Java 17/21 installed..."
    
    echo ""
    echo "🏗️  Building Android APK locally..."
    cd android
    ./gradlew assembleRelease
    
    echo ""
    echo "✅ Build completed! APK location: android/app/build/outputs/apk/release/app-release.apk"
    ;;
    
  3)
    echo ""
    echo "🔧 Creating Development Build..."
    echo ""
    echo "📝 This will create a development version for testing"
    echo ""
    read -p "Press Enter to continue..."
    
    echo ""
    echo "🏗️  Building development APK..."
    npx expo run:android
    
    echo ""
    echo "✅ Development build completed!"
    ;;
    
  *)
    echo "❌ Invalid option. Please choose 1, 2, or 3."
    exit 1
    ;;
esac

echo ""
echo "🎉 Build process completed!"
echo ""
echo "📱 Next steps:"
echo "1. Install the APK on an Android device"
echo "2. Test all features thoroughly"
echo "3. Distribute to your users"
echo ""
echo "📚 For more information, see BUILD_GUIDE.md" 