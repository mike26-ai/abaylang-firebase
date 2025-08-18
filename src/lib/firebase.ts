
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

// --- CRITICAL VALIDATION ---
// This check prevents the app from crashing with an obscure error.
// It provides a clear, actionable error message if the environment variables are not set.
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('YOUR_API_KEY') || !firebaseConfig.projectId || firebaseConfig.projectId.includes('YOUR_PROJECT_ID')) {
  // In a browser environment, this will be visible in the developer console.
  if (typeof window !== 'undefined') {
    console.error(
`
********************************************************************************
*                                                                              *
*          FIREBASE CLIENT-SIDE CONFIGURATION ERROR                            *
*                                                                              *
*    Your Firebase API Key or Project ID is missing or incorrect.              *
*    Please create a '.env.local' file in the root of your project and         *
*    add your Firebase Web App configuration like this:                        *
*                                                                              *
*    NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."                                   *
*    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"            *
*    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"                          *
*    ...                                                                       *
*                                                                              *
*    You can find these values in your Firebase project settings.              *
*                                                                              *
********************************************************************************
`
    );
  }
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
