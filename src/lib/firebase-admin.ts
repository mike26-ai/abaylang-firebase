// File: src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It checks if an app is already initialized to prevent errors during hot-reloading in development.
export function initAdmin() {
  // If the admin app is already initialized, return the existing instance.
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // --- Start Forensic Logging ---
  // This will help diagnose if environment variables are loaded correctly.
  console.log('--- Firebase Admin SDK Initialization ---');
  console.log(`- FIREBASE_PROJECT_ID loaded: ${!!process.env.FIREBASE_PROJECT_ID}`);
  console.log(`- FIREBASE_CLIENT_EMAIL loaded: ${!!process.env.FIREBASE_CLIENT_EMAIL}`);
  // Check if the key is present and seems valid (not just an empty string)
  const privateKeyValid = !!process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----');
  console.log(`- FIREBASE_PRIVATE_KEY seems valid: ${privateKeyValid}`);
  console.log('------------------------------------');
  // --- End Forensic Logging ---

  // Retrieve service account credentials from environment variables.
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key needs to be properly formatted. When stored in an environment variable,
    // newlines are often replaced with '\\n'. We need to convert them back.
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  // Basic validation to ensure credentials are provided.
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error('CRITICAL: Firebase Admin SDK credentials are not set correctly in environment variables. The server cannot start.');
    throw new Error("Firebase Admin SDK credentials are not set. Please check your .env.local file and restart the server.");
  }

  // Initialize the Firebase Admin SDK with the credentials.
  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
    return app;
  } catch (error: any) {
    console.error("CRITICAL: Firebase admin initialization error:", error.message);
    // Provide a more specific error message if possible
    if (error.code === 'app/invalid-credential') {
        throw new Error("Could not initialize Firebase Admin SDK. The provided credentials (likely the private key or client email) are invalid. Please check your .env.local file.");
    }
    throw new Error("Could not initialize Firebase Admin SDK. Please check server logs and that your environment variables are correct.");
  }
}
