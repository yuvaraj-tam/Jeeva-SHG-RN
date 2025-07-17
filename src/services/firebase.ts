import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Web App configuration
// TO UPDATE: Get this from Firebase Console → Project Settings → Web App
const firebaseConfig = {
  apiKey: "AIzaSyAc1wKDzP0rEf-IkSnPZp2dNoX3RmwMNIc", // Keep this - it's safe for web
  authDomain: "jeeva-shg-loan.firebaseapp.com",
  projectId: "jeeva-shg-loan",
  storageBucket: "jeeva-shg-loan.firebasestorage.app",
  messagingSenderId: "629019692790",
  // UPDATE THIS: Replace with your Web App ID (not Android App ID)
  appId: "1:629019692790:web:f783f4fa5b57cd226da6d7" // This needs to be updated!
  // You may also need measurementId for Analytics (optional)
  // measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services
export { app, auth, db, firebaseConfig }; 