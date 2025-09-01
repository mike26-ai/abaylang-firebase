// File Path: src/lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Gracefully handle missing configuration for development
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || firebaseConfig.apiKey.includes("YOUR_API_KEY")) {
  console.warn(`
    ********************************************************************************
    Firebase environment variables are not set or are using placeholder values.
    The application will run, but Firebase features will not work correctly.
    To enable Firebase, please create a .env.local file (if it does not exist)
    and add your project's credentials.
    ********************************************************************************
  `);
}


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
