// File Path: src/lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ====================================================================================
// --- TROUBLESHOOTING GUIDE: "auth/unauthorized-domain" ERROR ---
// ====================================================================================
// This error means the domain you are using to run this app is not on Firebase's
// list of approved domains for authentication.
//
// TO FIX THIS:
// 1. Go to your Firebase Console: https://console.firebase.google.com/
// 2. Select your project.
// 3. Go to "Authentication" in the left sidebar.
// 4. Click on the "Settings" tab.
// 5. Under "Authorized domains", click the "Add domain" button.
// 6. Enter the domain from your browser's address bar. For Firebase Studio, this
//    will be a long URL ending in ".cloudworkstations.dev".
//    Example: my-project-12345.cluster-abcdef.cloudworkstations.dev
// 7. Click "Add". The issue should now be resolved.
// ====================================================================================


const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Measurement ID is optional and only needed for Google Analytics.
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && {
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }),
};

// Gracefully handle missing configuration for development
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(`
    ********************************************************************************
    CRITICAL WARNING: Firebase client-side environment variables are not set.
    NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID are required.
    
    The application will load, but Firebase features (like login) will fail.
    
    SOLUTION: 
    1. Ensure you have a .env file in your project's root directory.
    2. Add your Firebase project's web app credentials to the .env file.
    3. You must restart the development server after creating or modifying the .env file.
    ********************************************************************************
  `);
}


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
