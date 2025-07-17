# Jeeva SHG Manager

A React Native Self-Help Group (SHG) management system with Firebase integration for managing loans, borrowers, payments, and reminders.

## 🚀 Features

- **User Authentication**: Secure login with Google Sign-In
- **Borrower Management**: Add, edit, and track borrower information
- **Loan Management**: Create and manage loan records with payment schedules
- **Payment Tracking**: Record and monitor payments with automated calculations
- **Reminders**: Set and manage payment reminders
- **Reports**: Generate comprehensive financial reports
- **Web Integration**: Deployable to web and integrable with Wix websites

## 📱 Platforms

- React Native (iOS/Android)
- Web (Expo Web)
- Wix Website Integration

## 🏗️ Project Structure

```
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/          # Application screens
│   ├── services/         # Firebase and API services
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── android/             # Android-specific files
├── assets/             # Images and static assets
├── docs/               # Documentation and guides
├── scripts/            # Deployment and build scripts
└── firebase-admin-tools/ # Firebase admin utilities
```

## 🔧 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yuvaraj-tam/Jeeva-SHG-RN.git
   cd Jeeva-SHG-RN
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Follow the guide in `docs/FIREBASE_WEB_CONFIG_GUIDE.md`
   - Set up Google Sign-In using `docs/GOOGLE_SIGNIN_SETUP.md`

4. **Run the application**
   ```bash
   # For web development
   npx expo start --web
   
   # For mobile development
   npx expo start
   
   # For Android build
   ./scripts/build-android.sh
   ```

## 🌐 Web Deployment

The application can be deployed to GitHub Pages and integrated with Wix websites:

```bash
# Deploy to GitHub Pages
./scripts/deploy-to-github-pages.sh
```

For detailed deployment instructions, see `docs/DEPLOYMENT_GUIDE.md`.

## 📖 Documentation

- **Wix Integration**: `docs/WIX_INTEGRATION_GUIDE.md`
- **Firebase Setup**: `docs/FIREBASE_WEB_CONFIG_GUIDE.md`
- **Google Sign-In**: `docs/GOOGLE_SIGNIN_SETUP.md`
- **Security Guide**: `docs/FIREBASE_SECURITY_FIX.md`
- **Modal System**: `docs/MODAL_ENHANCEMENT_GUIDE.md`

## 🔐 Security

This project includes comprehensive security measures:
- Firebase service account keys are properly secured
- Authentication flows are implemented with best practices
- Sensitive files are excluded from version control

See `docs/SECURITY_INCIDENT_RESPONSE.md` for security procedures.

## 🛠️ Development

### Prerequisites
- Node.js 16+
- Expo CLI
- Android Studio (for Android development)
- Firebase project with web app configured

### Key Dependencies
- React Native / Expo
- Firebase (Auth, Firestore)
- React Navigation
- TypeScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation in the `docs/` folder
2. Review existing GitHub issues
3. Create a new issue with detailed information

---

**Live Demo**: [https://www.jeevatrust.org/shg-manager](https://www.jeevatrust.org/shg-manager) 