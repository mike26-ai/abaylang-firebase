
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// Ensure these environment variables are set in your .env.local file or deployment environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional: if using Firebase Analytics
};

// Basic check if critical config values are present
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.apiKey.includes("placeholder")) {
  console.warn(
    "Firebase API Key is missing or using a placeholder. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is set correctly in your environment."
  );
}
if (!firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID" || firebaseConfig.projectId.includes("placeholder")) {
  console.warn(
    "Firebase Project ID is missing or using a placeholder. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set correctly in your environment."
  );
}
if (!firebaseConfig.storageBucket || firebaseConfig.storageBucket === "YOUR_STORAGE_BUCKET" || firebaseConfig.storageBucket.includes("placeholder")) {
  console.warn(
    "Firebase Storage Bucket is missing or using a placeholder. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is set correctly in your environment for file uploads."
  );
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
