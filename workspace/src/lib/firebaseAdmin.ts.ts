import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

// This is the "Security Guard" that checks the vault
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.ADMIN_FIREBASE_PROJECT_ID,
      clientEmail: process.env.ADMIN_FIREBASE_CLIENT_EMAIL,
      // This fix handles the weird line breaks in the private key
      privateKey: process.env.ADMIN_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const adminDb = getFirestore();
const FieldValue = admin.firestore.FieldValue;

export { adminDb, FieldValue };