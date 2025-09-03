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
  apiKey: "AIzaSyCGeB4Or3245KH3OdQa563N-r7hSrKMDbI",
  authDomain: "amharic-connect.firebaseapp.com",
  projectId: "amharic-connect",
  storageBucket: "amharic-connect.firebasestorage.app",
  messagingSenderId: "673154458403",
  appId: "1:673154458403:web:779145a2ef2d89eef62296",
  measurementId: "",
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
