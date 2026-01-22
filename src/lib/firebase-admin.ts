// File: src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

// This function initializes the Firebase Admin SDK.
// It checks if an app is already initialized to prevent errors.
export function initAdmin() {
  if (getApps().length) {
    return getApps()[0];
  }

  // Retrieve service account credentials from environment variables.
  // These are injected by the App Hosting backend from Secret Manager.
  const serviceAccount = {
    projectId: process.env.ADMIN_FIREBASE_PROJECT_ID,
    clientEmail: process.env.ADMIN_FIREBASE_CLIENT_EMAIL,
    // The private key requires newlines to be correctly formatted.
    privateKey: process.env.ADMIN_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // Validate that all required environment variables are present.
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    const errorMessage = "CRITICAL: Firebase Admin SDK service account credentials are not set in the environment. This app will not function correctly on the server. Ensure secrets are correctly configured in Secret Manager and bound in apphosting.yaml.";
    console.error(errorMessage);
    // We throw an error to prevent the app from running in a broken state on the server.
    throw new Error(errorMessage);
  }

  try {
    // Initialize the app with the retrieved credentials.
    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    
    console.log('Firebase Admin SDK initialized successfully.');
    return app;
  } catch (error: any) {
    console.error("CRITICAL: Firebase admin initialization error:", error.message);
    if (error.code === 'app/invalid-credential') {
        throw new Error("Could not initialize Firebase Admin SDK. The provided credentials are invalid or malformed.");
    }
    throw new Error("Could not initialize Firebase Admin SDK. Please check server logs for details.");
  }
}

// Initialize the app right away so that the exports can be used directly.
initAdmin();

// Export the initialized services for use in server-side logic (API routes, etc.).
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const Timestamp = admin.firestore.Timestamp; // Re-export Timestamp
