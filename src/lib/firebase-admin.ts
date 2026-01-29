import admin from "firebase-admin";
import { getFirestore, FieldValue as AdminFieldValue, Timestamp as AdminTimestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

/**
 * Firebase Admin initialization
 * This version is "Build-Safe" to prevent Code 51 crashes.
 */

// 1. Grab pointers and use .trim() as an Insurance Policy against illegal spaces!
const projectId = process.env.ADMIN_FIREBASE_PROJECT_ID?.trim();
const clientEmail = process.env.ADMIN_FIREBASE_CLIENT_EMAIL?.trim();
const privateKey = process.env.ADMIN_FIREBASE_PRIVATE_KEY?.trim();

if (!admin.apps.length) {
  // 2. THE SAFETY GUARD: Only initialize if all keys are present.
  // This stops the '.replace' crash during the build phase!
  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        // The fix handles line breaks and ensures we don't call .replace on undefined
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Firebase Admin initialized successfully.");
  } else {
    // This logs during the build so you know why it's skipping
    console.warn("⚠️ Firebase Admin: Missing credentials. Skipping init during build.");
  }
}

/** 
 * Build-Safe Database and Auth Exports
 * This pattern prevents 'null' crashes and works during the build phase.
 */
export const adminDb = admin.apps.length ? getFirestore() : ({} as any);
export const adminAuth = admin.apps.length ? getAuth() : ({} as any);

/** Helpers */
export const FieldValue = admin.firestore?.FieldValue;
export const Timestamp = admin.firestore?.Timestamp;