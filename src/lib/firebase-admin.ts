// File: src/lib/firebase-admin.ts

import admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It checks if an app is already initialized to prevent errors during hot-reloading in development.
export function initAdmin() {
  // If the admin app is already initialized, return the existing instance.
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Retrieve service account credentials from environment variables.
  // In a real production environment, these should be securely stored (e.g., in Google Secret Manager).
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key needs to be properly formatted. When stored in an environment variable,
    // newlines are often replaced with '\\n'. We need to convert them back.
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  // Basic validation to ensure credentials are provided.
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error('Firebase Admin SDK credentials are not set in environment variables.');
    // In a real app, you might want to throw an error or handle this more gracefully.
    // For now, we'll log the error and initialization will likely fail.
  }

  // Initialize the Firebase Admin SDK with the credentials.
  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return app;
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
    // Re-throw the error to be caught by the calling function
    throw new Error("Could not initialize Firebase Admin SDK. Please check server logs and environment variables.");
  }
}
