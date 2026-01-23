// File: src/lib/firebaseAdmin.ts
import admin from "firebase-admin";
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: admin.app.App | null = null;

function initAdmin() {
    if (app) {
        return app;
    }

    if (admin.apps.length > 0) {
        app = admin.app();
        return app;
    }

    // Only attempt to initialize if secrets are present.
    // This is the key to preventing build-time errors.
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        try {
            app = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
                }),
            });
            console.log('Firebase Admin SDK initialized successfully.');
            return app;
        } catch (error: any) {
            console.error("CRITICAL: Firebase Admin SDK initialization failed:", error.stack);
            // This is a fatal error at runtime.
            throw new Error("Could not initialize Firebase Admin SDK. Check server logs.");
        }
    } else {
        // This case happens during `next build` where secrets are not available.
        // It's not an error at build time.
        console.log("Firebase Admin SDK not initialized (secrets not found). This is expected during build.");
        return null;
    }
}

// A wrapper to get the app, which might be null during build.
const getApp = (): admin.app.App | null => {
    if (!app) {
        initAdmin();
    }
    return app;
};

// These functions will now throw a clear error if used when the app is not initialized.
export const adminDb = () => {
    const initializedApp = getApp();
    if (!initializedApp) {
        throw new Error("Firebase Admin SDK is not initialized. This can happen if secrets are missing at runtime.");
    }
    return getFirestore(initializedApp);
};

export const adminAuth = () => {
    const initializedApp = getApp();
    if (!initializedApp) {
        throw new Error("Firebase Admin SDK is not initialized. This can happen if secrets are missing at runtime.");
    }
    return getAuth(initializedApp);
};

// These are static and don't depend on initialization.
export const { Timestamp, FieldValue } = admin.firestore;
