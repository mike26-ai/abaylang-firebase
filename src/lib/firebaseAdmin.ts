// File: src/lib/firebaseAdmin.ts
import admin from "firebase-admin";
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// This guard prevents the app from being initialized multiple times.
if (!admin.apps.length) {
  // At build time, these environment variables might be undefined.
  // The `try...catch` block prevents the build from failing if they are missing.
  // At runtime on Firebase Hosting, these secrets will be injected.
  try {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };
    
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("Firebase Admin credentials are not set in environment variables.");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    // This warning is expected during the build process if secrets aren't set locally.
    // It should not fail the build. The app will only fail at runtime if secrets are still missing.
    console.warn("Firebase Admin SDK initialization failed. This is expected during local build if secrets aren't set. It should work on the server.", error.message);
  }
}

// We conditionally export the services. If initialization failed (e.g., during build),
// these will be null, but the code won't crash the build process.
// API routes will fail at runtime if they are used without proper initialization, which is the desired behavior.
const app = admin.apps.length > 0 ? admin.app() : null;

export const adminDb = app ? getFirestore(app) : null!;
export const adminAuth = app ? getAuth(app) : null!;
export const { Timestamp, FieldValue } = admin.firestore;
