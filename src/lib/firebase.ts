// File Path: src/lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
<<<<<<< HEAD
// Import initializeFirestore to pass in the new settings
import { getFirestore, initializeFirestore } from "firebase/firestore";
=======
import { getFirestore } from "firebase/firestore";
>>>>>>> before-product-selection-rewrite

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

// A simple check to see if the environment variables are loaded.
// This is the most common reason for the API key error.
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

<<<<<<< HEAD
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// --- THE FIX ---
// Use initializeFirestore to include settings that prevent the "client is offline" error in Next.js.
// experimentalForceLongPolling: true forces a more stable connection method.
// useFetchStreams: false is a required partner for the long polling option.
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

=======

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
>>>>>>> before-product-selection-rewrite

export { app, auth, db };
