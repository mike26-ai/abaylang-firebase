// File: src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// Export Timestamp directly for use in API routes
export const Timestamp = admin.firestore.Timestamp;

// This function initializes the Firebase Admin SDK.
// It checks if an app is already initialized to prevent errors during hot-reloading in development.
export function initAdmin() {
  // Check if an app is already initialized.
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Retrieve service account credentials from environment variables.
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key might have newline characters that need to be parsed correctly.
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  // Validate that all required environment variables are present.
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    const errorMessage = "CRITICAL: Firebase Admin SDK credentials are not set correctly in environment variables. Check your .env file or hosting configuration.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    // Initialize the app with the retrieved credentials.
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('Firebase Admin SDK initialized successfully.');
    return app;
  } catch (error: any) {
    console.error("CRITICAL: Firebase admin initialization error:", error.message);
    // Provide a more specific error message if the credentials themselves are the problem.
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
