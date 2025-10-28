
// File: src/app/api/admin/students/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, type Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
initAdmin();
const adminAuth = getAuth();
const adminDb = getFirestore();

export const dynamic = 'force-dynamic'; // Ensures the route is not cached

/**
 * This API route securely fetches all user profiles.
 * It is protected by an admin check.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify Authentication and Admin Status from the incoming request
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized: No authentication token provided.' }, { status: 401 });
    }
    
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: User does not have admin privileges.' }, { status: 403 });
    }

    // 2. Perform database query using the Admin SDK
    const usersSnapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get();
    
    // 3. Serialize the data to be client-safe
    const students = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        // Convert Firestore Timestamps to ISO strings
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        lastCreditPurchase: (data.lastCreditPurchase as Timestamp)?.toDate()?.toISOString() || null,
        credits: data.credits?.map((credit: any) => ({
            ...credit,
            purchasedAt: (credit.purchasedAt as Timestamp)?.toDate()?.toISOString() || null,
        })) || [],
      };
    });

    // 4. Return the data
    return NextResponse.json({ success: true, data: students });

  } catch (error: any) {
    console.error('API Error (/api/admin/students):', error);
    if (error.code?.startsWith('auth/')) {
        return NextResponse.json({ error: 'Authentication error. Please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch student data.', details: error.message }, { status: 500 });
  }
}
