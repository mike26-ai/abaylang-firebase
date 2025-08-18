
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Note: getStorage is no longer imported as Firebase Storage is decoupled.

// Your web app's Firebase configuration
// Ensure these environment variables are set in your .env.local file or deployment environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // This can be removed or left, but is unused.
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional: if using Firebase Analytics
};

// Basic check if critical config values are present
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_API_KEY")) {
  console.error(
    "Firebase API Key is missing or using a placeholder. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is set correctly in your .env or .env.local file."
  );
}
if (!firebaseConfig.projectId || firebaseConfig.projectId.includes("YOUR_PROJECT_ID")) {
  console.error(
    "Firebase Project ID is missing or using a placeholder. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set correctly in your .env or .env.local file."
  );
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
// The storage export is removed as we are using an external service.
// const storage = getStorage(app); 

export { app, auth, db };
