import admin from "firebase-admin";
import { getFirestore, FieldValue as AdminFieldValue, Timestamp as AdminTimestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

/**
 * Firebase Admin initialization
 * This version is "Build-Safe" to prevent Code 51 crashes.
 */

// 1. Grab the "pointers" from the environment
const projectId = process.env.ADMIN_FIREBASE_PROJECT_ID;
const clientEmail = process.env.ADMIN_FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.ADMIN_FIREBASE_PRIVATE_KEY;

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

/** Firestore */
// FIX: Removed 'as any' to allow for correct type inference.
export const adminDb = admin.apps.length ? getFirestore() : null;
export const adminAuth = admin.apps.length ? getAuth() : null;

/** Helpers */
// FIX: Re-exporting aliased imports to avoid naming conflicts with client-side SDK.
export const FieldValue = AdminFieldValue;
export const Timestamp = AdminTimestamp;
