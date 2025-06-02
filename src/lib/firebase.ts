
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Optional: if using Firebase Analytics

// Your web app's Firebase configuration
// REPLACE WITH YOUR ACTUAL CONFIGURATION
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional: if using Firebase Analytics
};

// Diagnostic log to check loaded Firebase config
console.log("LissanHub Firebase Config Initializing:", {
  apiKeyStatus: firebaseConfig.apiKey === "YOUR_API_KEY" ? "USING_PLACEHOLDER_API_KEY" : (firebaseConfig.apiKey ? "LOADED_FROM_ENV" : "MISSING_ENV_VAR"),
  authDomainStatus: firebaseConfig.authDomain === "YOUR_AUTH_DOMAIN" ? "USING_PLACEHOLDER_AUTH_DOMAIN" : (firebaseConfig.authDomain ? "LOADED_FROM_ENV" : "MISSING_ENV_VAR"),
  projectIdStatus: firebaseConfig.projectId === "YOUR_PROJECT_ID" ? "USING_PLACEHOLDER_PROJECT_ID" : (firebaseConfig.projectId ? "LOADED_FROM_ENV" : "MISSING_ENV_VAR"),
  // We don't log actual keys, just their status.
});

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null; // Optional

export { app, auth, db };
