
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { setPersistence, browserLocalPersistence, onIdTokenChanged } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAY2xX9NQH4skpr7Fz1nTI1GwF0a7k9Ypc",
  authDomain: "campusnet-ff188.firebaseapp.com",
  projectId: "campusnet-ff188",
  storageBucket: "campusnet-ff188.firebasestorage.app",
  messagingSenderId: "492101021608",
  appId: "1:492101021608:web:edaab1dd3e633b14c7779d",
  measurementId: "G-LCG943KYQ7"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Persist auth state so users stay signed in across reloads
setPersistence(auth, browserLocalPersistence).catch(() => {
  // ignore persistence errors silently
});

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;