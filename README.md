# Jeeva SHG Manager

A comprehensive React Native mobile application for Self-Help Group (SHG) management, built with Expo and Firebase.

## 🚀 Features

### Core Functionality
- **User Management**: Complete user profiles with contact information
- **Loan Management**: Create, track, and manage loans with EMI calculations
- **Payment Tracking**: Monitor EMI payments and due dates
- **Reports & Analytics**: Generate comprehensive reports and analytics
- **Reminders & Notifications**: Automated payment reminders
- **Excel Import/Export**: Import/export data via Excel files
- **Firebase Integration**: Secure cloud-based data storage
- **Google Sign-in**: Easy authentication

### User Interface
- **Modern Material Design**: Clean, intuitive interface
- **Responsive Design**: Works on all screen sizes
- **Collapsible Sidebar**: Easy navigation
- **Dark/Light Theme**: User preference support
- **Offline Support**: Works without internet connection

## 📱 App Information

- **Package Name**: com.jeevashg.manager
- **App Name**: Jeeva SHG Manager
- **Version**: 1.0.0
- **Platform**: Android (iOS support available)

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Backend**: Firebase (Authentication, Firestore)
- **UI Components**: Custom Material Design components
- **Navigation**: React Navigation
- **State Management**: React Hooks
- **File Handling**: Excel.js for spreadsheet operations

## 📋 Prerequisites

### For Development
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for local builds)

### For Production Build
- Expo account (for cloud builds)
- OR Android Studio with Java 17/21 (for local builds)

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Production Build
```bash
# Use the build script (Recommended)
./build-android.sh

# Or build manually
npm run build:android
```

## 📦 Build Options

### 1. Expo EAS Cloud Build (Recommended)
- No local setup required
- Builds in the cloud
- Automatic APK generation
- Email notification when ready

### 2. Local Android Build
- Requires Android Studio
- Requires Java 17 or 21
- Faster iteration for development
- Full control over build process

### 3. Development Build
- For testing and development
- Includes development tools
- Hot reloading enabled

## 🔧 Configuration

### App Configuration (`app.json`)
- Package name and version
- Permissions (Internet, Storage, Phone, SMS)
- Icons and splash screen
- Platform-specific settings

### Firebase Configuration
- Authentication setup
- Firestore database
- Google Sign-in integration

## 📊 Data Structure

### Users
- Personal information
- Contact details
- Financial information
- Loan history

### Loans
- Loan amount and terms
- EMI calculations
- Payment schedule
- Status tracking

### Payments
- EMI payment records
- Due dates and reminders
- Payment status
- Overdue tracking

## 🔐 Security Features

- Firebase Authentication
- Secure data storage
- Input validation
- Error handling
- Offline data protection

## 📈 Analytics & Reporting

- Loan portfolio overview
- Payment analytics
- User statistics
- Export capabilities
- Custom report generation

## 🎨 UI/UX Features

- Material Design components
- Responsive layout
- Accessibility support
- Intuitive navigation
- Visual feedback
- Loading states

## 📱 Installation

### For End Users
1. Download the APK file
2. Enable "Install from unknown sources" in Android settings
3. Install the APK
4. Open the app and sign in

### For Developers
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Firebase (see Firebase setup guide)
4. Run the development server: `npm start`

## 🔄 Updates

### Version Management
- Semantic versioning
- Automatic update notifications
- Backward compatibility
- Migration scripts

## 📞 Support

### Documentation
- Comprehensive code comments
- API documentation
- User guides
- Troubleshooting guides

### Contact
- Technical support available
- Bug reporting system
- Feature request tracking

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🎯 Roadmap

### Upcoming Features
- [ ] Push notifications
- [ ] Offline sync
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Integration with banking APIs
- [ ] WhatsApp integration
- [ ] Voice commands
- [ ] Biometric authentication

### Performance Improvements
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Database indexing
- [ ] Caching strategies

---

**Built with ❤️ for Self-Help Groups** 