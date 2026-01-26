import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

/**
 * Firebase Admin initialization
 * This file MUST only run on the server.
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.ADMIN_FIREBASE_PROJECT_ID!,
      clientEmail: process.env.ADMIN_FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.ADMIN_FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

/** Firestore */
export const adminDb = getFirestore();

/** Auth */
export const adminAuth = getAuth();

/** Helpers */
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
