import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
 apiKey: "AIzaSyA7DNgiySrrmiHa2reFUoA8Yfblfjm-5hE",
  authDomain: "welledapp.firebaseapp.com",
  projectId: "welledapp",
  storageBucket: "welledapp.firebasestorage.app",
  messagingSenderId: "1022653570357",
  appId: "1:1022653570357:web:c8eac2ecdb4719569d007c",
  measurementId: "G-GV743DR2JT"
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
