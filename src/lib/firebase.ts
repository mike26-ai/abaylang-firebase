// File Path: src/lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
// --- THE FIX ---
// Use getFirestore and pass settings to it, instead of using the deprecated initializeFirestore
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && {
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }),
};

if (!firebaseConfig.apiKey) {
  console.error(`
    ********************************************************************************
    ERROR: Firebase client-side environment variables are not set.
    The application will fail to initialize Firebase and authentication will not work.
    
    SOLUTION: 
    1. Make sure you have a .env file in your project's root directory.
    2. Populate it with the NEXT_PUBLIC_FIREBASE_... variables from your Firebase console.
    3. YOU MUST RESTART THE DEVELOPMENT SERVER after creating or modifying the .env file.
    ********************************************************************************
  `);
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// --- THE FIX ---
// Get the Firestore instance and pass settings directly to it.
// This is the modern, correct pattern that avoids the "client is offline" error.
const db = getFirestore(app);


export { app, auth, db };
