// File: src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Export Timestamp directly for use in API routes
export const Timestamp = admin.firestore.Timestamp;

let db: admin.firestore.Firestore;

// This function initializes the Firebase Admin SDK.
// It checks if an app is already initialized to prevent errors during hot-reloading in development.
export function initAdmin() {
  if (admin.apps.length > 0) {
    // If already initialized, ensure 'db' is set and return the app.
    if (!db) {
      db = getFirestore(admin.app());
    }
    return admin.app();
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error('CRITICAL: Firebase Admin SDK credentials are not set correctly in environment variables.');
    throw new Error("Firebase Admin SDK credentials are not set. Please check your .env file.");
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
    });
    
    // Initialize and export the db instance
    db = getFirestore(app);
    
    console.log('Firebase Admin SDK initialized successfully.');
    return app;
  } catch (error: any) {
    console.error("CRITICAL: Firebase admin initialization error:", error.message);
    if (error.code === 'app/invalid-credential') {
        throw new Error("Could not initialize Firebase Admin SDK. The provided credentials are invalid.");
    }
    throw new Error("Could not initialize Firebase Admin SDK. Please check server logs.");
  }
}

// Export the db instance directly for use in other server-side files.
// The 'initAdmin' function must be called once at the start of your application
// (e.g., in an API route) to populate this exported 'db' variable.
export { db };
