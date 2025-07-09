import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyD_-JI1U4hN3SCh5qlGTbsBPM3DgOvkj9Q",
  authDomain: "jeeva-shg-loan.firebaseapp.com",
  projectId: "jeeva-shg-loan",
  storageBucket: "jeeva-shg-loan.firebasestorage.app",
  messagingSenderId: "629019692790",
  appId: "1:629019692790:android:2cee053b82de1cf96da6d7"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 